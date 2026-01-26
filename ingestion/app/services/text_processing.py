import re
from typing import List

def clean_text(text: str) -> str:
    # Removing header/footers
    lines = text.split('\n')
    cleaned_lines = []
    for line in lines:
        if len(line.strip()) < 4 and line.strip().isdigit():
            continue
        cleaned_lines.append(line)
    
    text = '\n'.join(cleaned_lines)
    # Removing extra whitespace
    text = re.sub(r'\s+', ' ', text).strip()
    return text

def chunk_text(text: str, chunk_size: int = 1000, overlap: int = 200) -> List[str]:
    chunks = []
    start = 0
    text_len = len(text)

    while start < text_len:
        end = start + chunk_size
        chunk = text[start:end]
        chunks.append(chunk)
        start += (chunk_size - overlap)
    
    return chunks
