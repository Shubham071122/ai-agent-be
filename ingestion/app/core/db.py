from pymongo import MongoClient
from app.core.config import MONGODB_URI

client = MongoClient(MONGODB_URI)
db = client.get_default_database()

# Collections
documents_collection = db["documents"]
chunks_collection = db["chunks"]
