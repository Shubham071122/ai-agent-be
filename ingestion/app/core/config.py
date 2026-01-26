# import os
# from dotenv import load_dotenv

# load_dotenv()

# MONGODB_URI = os.getenv("MONGODB_URI")
# AWS_ACCESS_KEY_ID = os.getenv("AWS_ACCESS_KEY_ID")
# AWS_SECRET_ACCESS_KEY = os.getenv("AWS_SECRET_ACCESS_KEY")
# AWS_REGION = os.getenv("AWS_REGION")
# S3_BUCKET_NAME = os.getenv("S3_BUCKET_NAME")


# if not MONGODB_URI:
#     raise ValueError("MONGODB_URI is not set")

import os
from dotenv import load_dotenv

if os.path.exists(".env"):
    load_dotenv()

IS_LOCAL = os.getenv("NODE_ENV", "development") != "production"

if IS_LOCAL:
    MONGODB_URI = os.getenv("MONGODB_URI")
    GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
    AWS_ACCESS_KEY_ID = os.getenv("AWS_ACCESS_KEY_ID")
    AWS_SECRET_ACCESS_KEY = os.getenv("AWS_SECRET_ACCESS_KEY")
    AWS_REGION = os.getenv("AWS_REGION", "ap-south-1")
    S3_BUCKET_NAME = os.getenv("S3_BUCKET_NAME")
    TEMP_DIR = os.getenv("TEMP_DIR", "/tmp")

else:
    from .aws_secrets import load_secrets
    
    _secrets = load_secrets()

    MONGODB_URI = _secrets["MONGODB_URI"]
    GOOGLE_API_KEY = _secrets["GOOGLE_API_KEY"]

    AWS_REGION = os.getenv("AWS_REGION", "ap-south-1")
    S3_BUCKET_NAME = os.getenv("S3_BUCKET_NAME")
    TEMP_DIR = os.getenv("TEMP_DIR", "/tmp")

if not MONGODB_URI:
    raise RuntimeError("MONGODB_URI is missing")

if not GOOGLE_API_KEY:
    raise RuntimeError("GOOGLE_API_KEY is missing")