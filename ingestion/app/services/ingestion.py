import boto3
import io
import pypdf
from bson import ObjectId
from app.core.config import AWS_REGION, S3_BUCKET_NAME
from app.core.db import documents_collection, chunks_collection
from app.services.text_processing import clean_text, chunk_text
import time
from datetime import datetime
from sentence_transformers import SentenceTransformer

# Initialize SentenceTransformer
embedding_model = SentenceTransformer('all-MiniLM-L6-v2')

s3_client = boto3.client(
    's3',
    # aws_access_key_id=AWS_ACCESS_KEY_ID,
    # aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
    region_name=AWS_REGION
)

def generate_embedding(text):
    return embedding_model.encode(text).tolist()

async def process_document(document_id: str, s3_key: str):
    try:
        documents_collection.update_one(
            {"_id": ObjectId(document_id)},
            {"$set": {"status": "PROCESSING"}}
        )

        chunks_collection.delete_many({"documentId": ObjectId(document_id)})

        response = s3_client.get_object(Bucket=S3_BUCKET_NAME, Key=s3_key)
        file_content = response['Body'].read()
        pdf_file = io.BytesIO(file_content)

        reader = pypdf.PdfReader(pdf_file)
        full_text = ""
        for page_num, page in enumerate(reader.pages):
            text = page.extract_text()
            if text:
                full_text += clean_text(text) + " "
        
        chunks = chunk_text(full_text)

        chunk_documents = []
        for i, chunk_content in enumerate(chunks):
            try:
                embedding_vector = generate_embedding(chunk_content)
                
                chunk_doc = {
                    "documentId": ObjectId(document_id),
                    "content": chunk_content,
                    "metadata": {
                        "pageNumber": 0, 
                        "chunkIndex": i
                    },
                    "embedding": embedding_vector,
                    "createdAt": datetime.now()
                }
                chunk_documents.append(chunk_doc)
                
            except Exception as e:
                print(f"Failed to embed chunk {i}: {e}")

        if chunk_documents:
            chunks_collection.insert_many(chunk_documents)
        documents_collection.update_one(
            {"_id": ObjectId(document_id)},
            {"$set": {"status": "COMPLETED", "updatedAt": datetime.now()}}
        )
        print(f"Document {document_id} processed successfully.")

    except Exception as e:
        print(f"Error processing document {document_id}: {e}")
        documents_collection.update_one(
            {"_id": ObjectId(document_id)},
            {"$set": {"status": "FAILED", "updatedAt": datetime.now()}}
        )
