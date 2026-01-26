import sys
print(f"Python Executable: {sys.executable}")
print(f"Python Version: {sys.version}")

try:
    import torch
    print("Torch imported successfully")
except ImportError as e:
    print(f"Failed to import torch: {e}")

try:
    import transformers
    print("Transformers imported successfully")
except ImportError as e:
    print(f"Failed to import transformers: {e}")

try:
    from sentence_transformers import SentenceTransformer
    print("SentenceTransformers imported successfully")
except ImportError as e:
    print(f"Failed to import sentence_transformers: {e}")
except Exception as e:
    print(f"Error importing sentence_transformers: {e}")
