from fastapi import FastAPI, UploadFile, File, HTTPException
import pdfplumber
import io
app = FastAPI(title="AI Resume Analyzer API")

@app.get("/")
async def root():
    return {"message": "Backend is running successfully!"}

@app.post("/api/resumes/upload")
async def upload_resume(file: UploadFile = File(...)):
    # 1. Validate the file type
    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Only PDF files are supported for now.")
    
    try:
        # 2. Read the file content into memory asynchronously
        content = await file.read()
        
        # 3. Extract text using pdfplumber
        extracted_text = ""
        with pdfplumber.open(io.BytesIO(content)) as pdf:
            for page in pdf.pages:
                text = page.extract_text()
                if text:
                    extracted_text += text + "\n"
        
        # 4. Return the results
        return {
            "filename": file.filename,
            "text": extracted_text.strip()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing file: {str(e)}")