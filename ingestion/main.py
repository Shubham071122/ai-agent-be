from fastapi import FastAPI, BackgroundTasks
from pydantic import BaseModel
from app.services.ingestion import process_document, generate_embedding

app = FastAPI()

class IngestRequest(BaseModel):
    documentId: str
    s3Key: str

class EmbedRequest(BaseModel):
    text: str

@app.post("/ingest")
async def ingest_document(request: IngestRequest, background_tasks: BackgroundTasks):
    # Triggering processing in background
    background_tasks.add_task(process_document, request.documentId, request.s3Key)
    return {"message": "Ingestion started", "documentId": request.documentId}

@app.post("/embed")
async def embed_text(request: EmbedRequest):
    embedding = generate_embedding(request.text)
    return {"embedding": embedding}

@app.get("/")
def read_root():
    return {"message": "Ingestion Service Running"}

@app.get("/health")
def health_check():
    return {"status": "ok"}
