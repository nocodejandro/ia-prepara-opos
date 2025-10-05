from fastapi import FastAPI, APIRouter, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime
import json


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI(title="Aprueba con IA - API")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# ==================== MODELS ====================
class StatusCheck(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class StatusCheckCreate(BaseModel):
    client_name: str

# Metodolog-IA Models
class DocumentUpload(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    filename: str
    upload_timestamp: datetime = Field(default_factory=datetime.utcnow)
    processing_status: str = "uploaded"  # uploaded, processing, completed, error
    file_path: Optional[str] = None
    user_id: Optional[str] = None

class FlashCard(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    document_id: str
    question: str
    answer: str
    difficulty: Optional[str] = "medium"
    category: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

class Esquema(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    document_id: str
    title: str
    content: str  # JSON string with structured schema
    schema_type: str = "mindmap"  # mindmap, outline, flowchart
    created_at: datetime = Field(default_factory=datetime.utcnow)

class Resumen(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    document_id: str
    title: str
    content: str
    key_points: List[str] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)

class PreguntaTest(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    document_id: str
    question: str
    options: List[str]
    correct_answer: int  # Index of correct answer
    explanation: Optional[str] = None
    difficulty: Optional[str] = "medium"
    created_at: datetime = Field(default_factory=datetime.utcnow)

class CasoPractico(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    document_id: str
    title: str
    scenario: str
    questions: List[str]
    solution: str
    key_concepts: List[str] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)

# Webhook models
class WebhookData(BaseModel):
    document_id: str
    type: str  # flashcards, esquema, resumen, preguntas_test, caso_practico
    data: Dict[Any, Any]


# ==================== BASIC ROUTES ====================
@api_router.get("/")
async def root():
    return {"message": "Aprueba con IA - API funcionando correctamente"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.dict()
    status_obj = StatusCheck(**status_dict)
    _ = await db.status_checks.insert_one(status_obj.dict())
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.status_checks.find().to_list(1000)
    return [StatusCheck(**status_check) for status_check in status_checks]


# ==================== METODOLOG-IA ROUTES ====================

@api_router.post("/metodologia/upload")
async def upload_document(file: UploadFile = File(...)):
    """Upload PDF document for processing"""
    try:
        # Validate file type
        if not file.filename.lower().endswith('.pdf'):
            raise HTTPException(status_code=400, detail="Solo se permiten archivos PDF")
        
        # Create document record
        document = DocumentUpload(
            filename=file.filename,
            processing_status="processing"
        )
        
        # Save to database
        result = await db.documents.insert_one(document.dict())
        document_id = document.id
        
        # TODO: Here you would normally save the file and send to n8n
        # For now, we'll simulate the process
        
        # Update status to completed (simulate)
        await db.documents.update_one(
            {"id": document_id}, 
            {"$set": {"processing_status": "completed"}}
        )
        
        return {
            "message": "Documento subido correctamente",
            "document_id": document_id,
            "filename": file.filename,
            "status": "processing"
        }
        
    except Exception as e:
        logging.error(f"Error uploading document: {e}")
        raise HTTPException(status_code=500, detail="Error procesando el documento")

@api_router.get("/metodologia/documents")
async def get_documents():
    """Get all uploaded documents"""
    try:
        documents = await db.documents.find().sort("upload_timestamp", -1).to_list(100)
        # Convert ObjectId to string to make it JSON serializable
        for doc in documents:
            if "_id" in doc:
                del doc["_id"]  # Remove MongoDB ObjectId field
        return {"documents": documents}
    except Exception as e:
        logging.error(f"Error fetching documents: {e}")
        raise HTTPException(status_code=500, detail="Error obteniendo documentos")

@api_router.get("/metodologia/{document_id}/content")
async def get_document_content(document_id: str):
    """Get all processed content for a document"""
    try:
        # Get all content types for this document
        flashcards = await db.flashcards.find({"document_id": document_id}).to_list(100)
        esquemas = await db.esquemas.find({"document_id": document_id}).to_list(100)
        resumenes = await db.resumenes.find({"document_id": document_id}).to_list(100)
        preguntas = await db.preguntas_test.find({"document_id": document_id}).to_list(100)
        casos = await db.casos_practicos.find({"document_id": document_id}).to_list(100)
        
        # Remove MongoDB ObjectId fields
        for content_list in [flashcards, esquemas, resumenes, preguntas, casos]:
            for item in content_list:
                if "_id" in item:
                    del item["_id"]
        
        return {
            "document_id": document_id,
            "flashcards": flashcards,
            "esquemas": esquemas,
            "resumenes": resumenes,
            "preguntas_test": preguntas,
            "casos_practicos": casos
        }
    except Exception as e:
        logging.error(f"Error fetching content: {e}")
        raise HTTPException(status_code=500, detail="Error obteniendo contenido")

# ==================== N8N WEBHOOK ROUTES ====================

@api_router.post("/webhooks/flashcards")
async def receive_flashcards(webhook_data: WebhookData):
    """Receive flashcards from n8n"""
    try:
        flashcards_data = webhook_data.data.get('flashcards', [])
        
        # Process and save each flashcard
        saved_flashcards = []
        for card_data in flashcards_data:
            flashcard = FlashCard(
                document_id=webhook_data.document_id,
                question=card_data.get('question', ''),
                answer=card_data.get('answer', ''),
                difficulty=card_data.get('difficulty', 'medium'),
                category=card_data.get('category')
            )
            await db.flashcards.insert_one(flashcard.dict())
            saved_flashcards.append(flashcard.dict())
        
        logging.info(f"Saved {len(saved_flashcards)} flashcards for document {webhook_data.document_id}")
        return {"message": f"Se guardaron {len(saved_flashcards)} flashcards correctamente"}
        
    except Exception as e:
        logging.error(f"Error processing flashcards webhook: {e}")
        raise HTTPException(status_code=500, detail="Error procesando flashcards")

@api_router.post("/webhooks/esquema")
async def receive_esquema(webhook_data: WebhookData):
    """Receive schema from n8n"""
    try:
        esquema_data = webhook_data.data.get('esquema', {})
        
        esquema = Esquema(
            document_id=webhook_data.document_id,
            title=esquema_data.get('title', 'Esquema generado'),
            content=json.dumps(esquema_data.get('content', {})),
            schema_type=esquema_data.get('type', 'mindmap')
        )
        
        await db.esquemas.insert_one(esquema.dict())
        
        logging.info(f"Saved esquema for document {webhook_data.document_id}")
        return {"message": "Esquema guardado correctamente"}
        
    except Exception as e:
        logging.error(f"Error processing esquema webhook: {e}")
        raise HTTPException(status_code=500, detail="Error procesando esquema")

@api_router.post("/webhooks/resumen")
async def receive_resumen(webhook_data: WebhookData):
    """Receive summary from n8n"""
    try:
        resumen_data = webhook_data.data.get('resumen', {})
        
        resumen = Resumen(
            document_id=webhook_data.document_id,
            title=resumen_data.get('title', 'Resumen generado'),
            content=resumen_data.get('content', ''),
            key_points=resumen_data.get('key_points', [])
        )
        
        await db.resumenes.insert_one(resumen.dict())
        
        logging.info(f"Saved resumen for document {webhook_data.document_id}")
        return {"message": "Resumen guardado correctamente"}
        
    except Exception as e:
        logging.error(f"Error processing resumen webhook: {e}")
        raise HTTPException(status_code=500, detail="Error procesando resumen")

@api_router.post("/webhooks/preguntas_test")
async def receive_preguntas_test(webhook_data: WebhookData):
    """Receive test questions from n8n"""
    try:
        preguntas_data = webhook_data.data.get('preguntas', [])
        
        saved_preguntas = []
        for pregunta_data in preguntas_data:
            pregunta = PreguntaTest(
                document_id=webhook_data.document_id,
                question=pregunta_data.get('question', ''),
                options=pregunta_data.get('options', []),
                correct_answer=pregunta_data.get('correct_answer', 0),
                explanation=pregunta_data.get('explanation'),
                difficulty=pregunta_data.get('difficulty', 'medium')
            )
            await db.preguntas_test.insert_one(pregunta.dict())
            saved_preguntas.append(pregunta.dict())
        
        logging.info(f"Saved {len(saved_preguntas)} preguntas for document {webhook_data.document_id}")
        return {"message": f"Se guardaron {len(saved_preguntas)} preguntas correctamente"}
        
    except Exception as e:
        logging.error(f"Error processing preguntas webhook: {e}")
        raise HTTPException(status_code=500, detail="Error procesando preguntas")

@api_router.post("/webhooks/caso_practico")
async def receive_caso_practico(webhook_data: WebhookData):
    """Receive practical case from n8n"""
    try:
        caso_data = webhook_data.data.get('caso', {})
        
        caso = CasoPractico(
            document_id=webhook_data.document_id,
            title=caso_data.get('title', 'Caso práctico'),
            scenario=caso_data.get('scenario', ''),
            questions=caso_data.get('questions', []),
            solution=caso_data.get('solution', ''),
            key_concepts=caso_data.get('key_concepts', [])
        )
        
        await db.casos_practicos.insert_one(caso.dict())
        
        logging.info(f"Saved caso practico for document {webhook_data.document_id}")
        return {"message": "Caso práctico guardado correctamente"}
        
    except Exception as e:
        logging.error(f"Error processing caso practico webhook: {e}")
        raise HTTPException(status_code=500, detail="Error procesando caso práctico")


# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
