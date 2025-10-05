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
import re
import tempfile
import base64
import aiohttp


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

class ConceptoBasico(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    document_id: str
    title: str
    definition: str
    examples: List[str] = []
    importance_level: str = "medium"  # low, medium, high
    category: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

class TestDos(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    document_id: str
    question: str
    question_type: str = "multiple_choice"  # multiple_choice, true_false, short_answer
    options: List[str] = []
    correct_answer: Optional[str] = None
    correct_index: Optional[int] = None
    explanation: Optional[str] = None
    difficulty: str = "medium"
    points: int = 1
    time_limit: Optional[int] = None  # in seconds
    created_at: datetime = Field(default_factory=datetime.utcnow)

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

def parse_test_questions(text: str):
    """Parsea las preguntas estructuradas que vienen de n8n"""
    questions = []
    
    # Buscar preguntas usando regex
    question_pattern = r'\*\*Pregunta \d+:\*\*\n(.*?)\n\na\)(.*?)\nb\)(.*?)\nc\)(.*?)\nd\)(.*?)\n\n\*\*Respuesta correcta:\*\* ([a-d])\)(.*?)\n\n\*\*Justificación:\*\*(.*?)(?=\*\*Pregunta|\Z)'
    
    matches = re.findall(question_pattern, text, re.DOTALL)
    
    for i, match in enumerate(matches):
        question = match[0].strip()
        option_a = match[1].strip()
        option_b = match[2].strip() 
        option_c = match[3].strip()
        option_d = match[4].strip()
        correct_letter = match[5].strip()
        correct_answer_text = match[6].strip()
        justification = match[7].strip()
        
        # Determinar el índice de la respuesta correcta
        correct_index = ord(correct_letter.lower()) - ord('a')
        
        questions.append({
            'question': question,
            'options': [option_a, option_b, option_c, option_d],
            'correct_answer': correct_answer_text,
            'correct_index': correct_index,
            'explanation': justification
        })
    
    # Si no se pudieron parsear con regex, intentar parseo simple
    if not questions and text:
        # Fallback: crear una pregunta simple con todo el texto
        questions.append({
            'question': 'Pregunta de análisis completo',
            'options': ['Verdadero', 'Falso'],
            'correct_answer': 'Respuesta completa en explicación',
            'correct_index': 0,
            'explanation': text
        })
    
    return questions

def parse_flashcards(text: str):
    """Parsea las flashcards que vienen de n8n"""
    flashcards = []
    
    # Buscar patrones tipo "1. Pregunta: ... - Respuesta: ..."
    pattern = r'(\d+)\.\s*([^-]+?)\s*-\s*(.*?)(?=\n\d+\.|\Z)'
    matches = re.findall(pattern, text, re.DOTALL)
    
    for match in matches:
        number = match[0]
        question = match[1].strip()
        answer = match[2].strip()
        
        flashcards.append({
            'question': question,
            'answer': answer,
            'difficulty': 'medium',
            'category': 'IA'
        })
    
    # Si no encuentra el patrón, intentar otro formato
    if not flashcards:
        # Buscar patrón "¿...? - ..."
        alt_pattern = r'(¿[^?]+\?)\s*-\s*([^\n]+)'
        alt_matches = re.findall(alt_pattern, text)
        
        for match in alt_matches:
            question = match[0].strip()
            answer = match[1].strip()
            
            flashcards.append({
                'question': question,
                'answer': answer,
                'difficulty': 'medium',
                'category': 'IA'
            })
    
    # Fallback: si no se puede parsear, crear una flashcard con todo
    if not flashcards and text:
        flashcards.append({
            'question': 'Contenido generado por IA',
            'answer': text,
            'difficulty': 'medium',
            'category': 'IA'
        })
    
    return flashcards

async def update_document_status_after_delay(document_id: str):
    """Actualiza el estado del documento después de un delay si no se recibieron respuestas"""
    await asyncio.sleep(120)  # Esperar 2 minutos
    
    # Verificar si ya se recibió contenido
    content_collections = [
        db.resumenes, db.esquemas, db.flashcards, 
        db.preguntas_test, db.casos_practicos, 
        db.conceptos_basicos, db.test_dos
    ]
    
    has_content = False
    for collection in content_collections:
        count = await collection.count_documents({"document_id": document_id})
        if count > 0:
            has_content = True
            break
    
    if has_content:
        # Si ya hay contenido, marcar como completado
        await db.documents.update_one(
            {"id": document_id},
            {"$set": {"processing_status": "completed"}}
        )
    else:
        # Si no hay contenido, marcar como error con instrucciones
        await db.documents.update_one(
            {"id": document_id},
            {"$set": {
                "processing_status": "error_no_callback",
                "error_message": "n8n procesó pero no envió resultados. Configura HTTP Request en workflows."
            }}
        )

def parse_conceptos_basicos(text: str):
    """Parsea conceptos básicos que vienen de n8n"""
    conceptos = []
    
    # Buscar patrones tipo "Concepto - Definición"
    lines = text.split('\n')
    current_concept = None
    
    for line in lines:
        line = line.strip()
        if not line:
            continue
            
        # Buscar patrón "Concepto - Definición"
        if ' - ' in line:
            parts = line.split(' - ', 1)
            if len(parts) == 2:
                title = parts[0].strip()
                definition = parts[1].strip()
                
                conceptos.append({
                    'title': title,
                    'definition': definition,
                    'examples': [],
                    'importance_level': 'medium',
                    'category': 'IA'
                })
        # Si no hay guión, considerar toda la línea como definición
        elif current_concept is None and line:
            conceptos.append({
                'title': 'Concepto extraído por IA',
                'definition': line,
                'examples': [],
                'importance_level': 'medium',
                'category': 'IA'
            })
    
    # Fallback: si no se puede parsear
    if not conceptos and text:
        conceptos.append({
            'title': 'Conceptos básicos extraídos',
            'definition': text,
            'examples': [],
            'importance_level': 'medium',
            'category': 'IA'
        })
    
    return conceptos


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
        
        if file.size > 50 * 1024 * 1024:  # 50MB limit
            raise HTTPException(status_code=400, detail="El archivo es demasiado grande. Máximo 50MB.")
        
        # Create document record
        document = DocumentUpload(
            filename=file.filename,
            processing_status="processing"
        )
        
        # Save to database
        await db.documents.insert_one(document.dict())
        document_id = document.id
        
        # Read file content
        file_content = await file.read()
        file_base64 = base64.b64encode(file_content).decode('utf-8')
        
        # Prepare payload for n8n (formato correcto que esperan los workflows)
        payload = {
            "document_id": document_id,
            "filename": file.filename,
            "file_data": {
                "content": file_base64
            },
            "callback_url": "https://github-enhancer.preview.emergentagent.com/api/webhooks/"
        }
        
        # Send to all n8n webhooks - URLS DE PRODUCCIÓN
        n8n_webhooks = {
            "resumen": "https://automatizaciones-n8n.dgkviv.easypanel.host/webhook/861efbc1-9b19-4cc2-9848-888ea7cdb161",
            "esquema": "https://automatizaciones-n8n.dgkviv.easypanel.host/webhook/0e1d975f-672a-4363-8a3c-4739d9e5c784", 
            "test": "https://automatizaciones-n8n.dgkviv.easypanel.host/webhook-test/cb578689-1dd2-4182-9c09-69dc86a2646b",
            "basicos": "https://automatizaciones-n8n.dgkviv.easypanel.host/webhook-test/8020a54f-a54a-4e99-94c4-0c141f933110",
            "flashcard": "https://automatizaciones-n8n.dgkviv.easypanel.host/webhook/4a0cc8e5-23c4-49f9-b6a9-b6103354ca89",
            "casos": "https://automatizaciones-n8n.dgkviv.easypanel.host/webhook/edb291c9-587d-448b-b036-3f5fcc7fa47d",
            "testdos": "https://automatizaciones-n8n.dgkviv.easypanel.host/webhook/7da011c7-14b4-4702-aa7f-e37faa8cc3c1"
        }
        
        # Send to n8n webhooks asynchronously
        async with aiohttp.ClientSession() as session:
            for webhook_name, webhook_url in n8n_webhooks.items():
                try:
                    async with session.post(
                        webhook_url,
                        json=payload,
                        headers={"Content-Type": "application/json"},
                        timeout=aiohttp.ClientTimeout(total=30)
                    ) as response:
                        if response.status == 200:
                            logging.info(f"Successfully sent to {webhook_name} webhook")
                        else:
                            logging.error(f"Failed to send to {webhook_name} webhook: {response.status}")
                except Exception as e:
                    logging.error(f"Error sending to {webhook_name} webhook: {e}")
        
        logging.info(f"Document {document_id} sent to all n8n webhooks for processing")
        
        # Programar actualización de estado después de 2 minutos si no llegan respuestas
        import asyncio
        asyncio.create_task(update_document_status_after_delay(document_id))
        
        return {
            "message": "Documento enviado a procesamiento con IA",
            "document_id": document_id,
            "filename": file.filename,
            "status": "processing",
            "instructions": "Configura HTTP Request en n8n para enviar resultados de vuelta"
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
        basicos = await db.conceptos_basicos.find({"document_id": document_id}).to_list(100)
        testdos = await db.test_dos.find({"document_id": document_id}).to_list(100)
        
        # Remove MongoDB ObjectId fields
        for content_list in [flashcards, esquemas, resumenes, preguntas, casos, basicos, testdos]:
            for item in content_list:
                if "_id" in item:
                    del item["_id"]
        
        return {
            "document_id": document_id,
            "flashcards": flashcards,
            "esquemas": esquemas,
            "resumenes": resumenes,
            "preguntas_test": preguntas,
            "casos_practicos": casos,
            "conceptos_basicos": basicos,
            "test_dos": testdos
        }
    except Exception as e:
        logging.error(f"Error fetching content: {e}")
        raise HTTPException(status_code=500, detail="Error obteniendo contenido")

# ==================== N8N WEBHOOK ROUTES ====================
# Estos endpoints coinciden exactamente con las URLs de tu n8n

@api_router.post("/webhook/861efbc1-9b19-4cc2-9848-888ea7cdb161")
async def n8n_resumen_webhook(data: dict):
    """Webhook para resumen desde n8n"""
    try:
        logging.info(f"Received resumen webhook: {data}")
        
        # Extraer el contenido del resumen desde la estructura de n8n
        document_id = data.get('document_id', 'unknown')
        resumen_text = data.get('resumen', data.get('output', ''))
        
        # Guardar en base de datos
        resumen = Resumen(
            document_id=document_id,
            title="Resumen generado por IA",
            content=resumen_text,
            key_points=[]
        )
        
        await db.resumenes.insert_one(resumen.dict())
        logging.info(f"Saved resumen for document {document_id}")
        
        return {"status": "success", "message": "Resumen guardado correctamente"}
    except Exception as e:
        logging.error(f"Error in resumen webhook: {e}")
        return {"status": "error", "message": str(e)}

@api_router.post("/webhook/0e1d975f-672a-4363-8a3c-4739d9e5c784")
async def n8n_esquema_webhook(data: dict):
    """Webhook para esquema desde n8n"""
    try:
        logging.info(f"Received esquema webhook: {data}")
        
        document_id = data.get('document_id', 'unknown')
        esquema_text = data.get('esquema', data.get('output', ''))
        
        esquema = Esquema(
            document_id=document_id,
            title="Esquema generado por IA",
            content=esquema_text,
            schema_type="outline"
        )
        
        await db.esquemas.insert_one(esquema.dict())
        logging.info(f"Saved esquema for document {document_id}")
        
        return {"status": "success", "message": "Esquema guardado correctamente"}
    except Exception as e:
        logging.error(f"Error in esquema webhook: {e}")
        return {"status": "error", "message": str(e)}

@api_router.post("/webhook-test/cb578689-1dd2-4182-9c09-69dc86a2646b")
async def n8n_test_webhook(data: dict):
    """Webhook para preguntas test desde n8n"""
    try:
        logging.info(f"Received test webhook: {data}")
        
        document_id = data.get('document_id', 'unknown')
        test_text = data.get('test', data.get('output', ''))
        
        # Procesar texto de preguntas (asumiendo formato simple por ahora)
        pregunta = PreguntaTest(
            document_id=document_id,
            question="Pregunta generada por IA",
            options=["Opción A", "Opción B", "Opción C", "Opción D"],
            correct_answer=0,
            explanation=test_text
        )
        
        await db.preguntas_test.insert_one(pregunta.dict())
        logging.info(f"Saved test for document {document_id}")
        
        return {"status": "success", "message": "Test guardado correctamente"}
    except Exception as e:
        logging.error(f"Error in test webhook: {e}")
        return {"status": "error", "message": str(e)}

@api_router.post("/webhook-test/8020a54f-a54a-4e99-94c4-0c141f933110")
async def n8n_basicos_webhook(data: dict):
    """Webhook para conceptos básicos desde n8n"""
    try:
        logging.info(f"Received basicos webhook: {data}")
        
        document_id = data.get('document_id', 'unknown')
        basicos_text = data.get('basicos', data.get('output', ''))
        
        # Parsear conceptos básicos individuales
        conceptos = parse_conceptos_basicos(basicos_text)
        
        saved_conceptos = []
        for concepto_data in conceptos:
            concepto = ConceptoBasico(
                document_id=document_id,
                title=concepto_data['title'],
                definition=concepto_data['definition'],
                examples=concepto_data.get('examples', []),
                importance_level=concepto_data.get('importance_level', 'medium'),
                category=concepto_data.get('category', 'IA')
            )
            
            await db.conceptos_basicos.insert_one(concepto.dict())
            saved_conceptos.append(concepto.dict())
        
        logging.info(f"Saved {len(saved_conceptos)} conceptos for document {document_id}")
        
        return {"status": "success", "message": f"Se guardaron {len(saved_conceptos)} conceptos correctamente"}
    except Exception as e:
        logging.error(f"Error in basicos webhook: {e}")
        return {"status": "error", "message": str(e)}

@api_router.post("/webhook/4a0cc8e5-23c4-49f9-b6a9-b6103354ca89")
async def n8n_flashcards_webhook(data: dict):
    """Webhook para flashcards desde n8n"""
    try:
        logging.info(f"Received flashcards webhook: {data}")
        
        document_id = data.get('document_id', 'unknown')
        flashcard_text = data.get('flashcard', data.get('output', ''))
        
        # Parsear flashcards individuales
        flashcards = parse_flashcards(flashcard_text)
        
        saved_flashcards = []
        for flashcard_data in flashcards:
            flashcard = FlashCard(
                document_id=document_id,
                question=flashcard_data['question'],
                answer=flashcard_data['answer'],
                difficulty=flashcard_data.get('difficulty', 'medium'),
                category=flashcard_data.get('category', 'General')
            )
            
            await db.flashcards.insert_one(flashcard.dict())
            saved_flashcards.append(flashcard.dict())
        
        logging.info(f"Saved {len(saved_flashcards)} flashcards for document {document_id}")
        
        return {"status": "success", "message": f"Se guardaron {len(saved_flashcards)} flashcards correctamente"}
    except Exception as e:
        logging.error(f"Error in flashcards webhook: {e}")
        return {"status": "error", "message": str(e)}

@api_router.post("/webhook/edb291c9-587d-448b-b036-3f5fcc7fa47d")
async def n8n_casos_webhook(data: dict):
    """Webhook para casos prácticos desde n8n"""
    try:
        logging.info(f"Received casos webhook: {data}")
        
        document_id = data.get('document_id', 'unknown')
        casos_text = data.get('casos', data.get('output', ''))
        
        caso = CasoPractico(
            document_id=document_id,
            title="Caso práctico generado por IA",
            scenario=casos_text,
            questions=["¿Cómo resolverías este caso?"],
            solution="Solución pendiente de análisis",
            key_concepts=[]
        )
        
        await db.casos_practicos.insert_one(caso.dict())
        logging.info(f"Saved caso for document {document_id}")
        
        return {"status": "success", "message": "Caso práctico guardado correctamente"}
    except Exception as e:
        logging.error(f"Error in casos webhook: {e}")
        return {"status": "error", "message": str(e)}

@api_router.post("/webhook/7da011c7-14b4-4702-aa7f-e37faa8cc3c1")
async def n8n_testdos_webhook(data: dict):
    """Webhook para test dos desde n8n"""
    try:
        logging.info(f"Received testdos webhook: {data}")
        
        document_id = data.get('document_id', 'unknown')
        testdos_text = data.get('testdos', data.get('output', ''))
        
        # Parsear las preguntas del texto estructurado
        questions = parse_test_questions(testdos_text)
        
        saved_questions = []
        for i, question_data in enumerate(questions):
            test_dos = TestDos(
                document_id=document_id,
                question=question_data['question'],
                question_type="multiple_choice",
                options=question_data['options'],
                correct_answer=question_data['correct_answer'],
                correct_index=question_data['correct_index'],
                explanation=question_data['explanation'],
                difficulty="medium",
                points=2
            )
            
            await db.test_dos.insert_one(test_dos.dict())
            saved_questions.append(test_dos.dict())
        
        logging.info(f"Saved {len(saved_questions)} testdos questions for document {document_id}")
        
        return {"status": "success", "message": f"Se guardaron {len(saved_questions)} preguntas correctamente"}
    except Exception as e:
        logging.error(f"Error in testdos webhook: {e}")
        return {"status": "error", "message": str(e)}

# Mantenemos los endpoints originales por compatibilidad
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
async def receive_resumen(data: dict):
    """Receive summary from n8n"""
    try:
        # n8n puede enviar el resultado de diferentes formas
        # Intentamos extraer document_id y el contenido del resumen
        
        document_id = data.get('document_id') or data.get('body', {}).get('document_id')
        resumen_content = data.get('resumen') or data.get('output') or data.get('text', '')
        
        if not document_id:
            logging.error(f"No document_id found in resumen webhook data: {data}")
            raise HTTPException(status_code=400, detail="document_id requerido")
        
        # Crear el resumen
        resumen = Resumen(
            document_id=document_id,
            title="Resumen generado por IA",
            content=resumen_content,
            key_points=[]  # n8n puede no enviar puntos clave estructurados
        )
        
        await db.resumenes.insert_one(resumen.dict())
        
        logging.info(f"Saved resumen for document {document_id}")
        return {"message": "Resumen guardado correctamente", "status": "success"}
        
    except Exception as e:
        logging.error(f"Error processing resumen webhook: {e}")
        return {"message": f"Error procesando resumen: {str(e)}", "status": "error"}

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

@api_router.post("/webhooks/conceptos_basicos")
async def receive_conceptos_basicos(webhook_data: WebhookData):
    """Receive basic concepts from n8n"""
    try:
        conceptos_data = webhook_data.data.get('conceptos', [])
        
        saved_conceptos = []
        for concepto_data in conceptos_data:
            concepto = ConceptoBasico(
                document_id=webhook_data.document_id,
                title=concepto_data.get('title', ''),
                definition=concepto_data.get('definition', ''),
                examples=concepto_data.get('examples', []),
                importance_level=concepto_data.get('importance_level', 'medium'),
                category=concepto_data.get('category')
            )
            await db.conceptos_basicos.insert_one(concepto.dict())
            saved_conceptos.append(concepto.dict())
        
        logging.info(f"Saved {len(saved_conceptos)} conceptos básicos for document {webhook_data.document_id}")
        return {"message": f"Se guardaron {len(saved_conceptos)} conceptos básicos correctamente"}
        
    except Exception as e:
        logging.error(f"Error processing conceptos básicos webhook: {e}")
        raise HTTPException(status_code=500, detail="Error procesando conceptos básicos")

@api_router.post("/webhooks/test_dos")
async def receive_test_dos(webhook_data: WebhookData):
    """Receive test dos questions from n8n"""
    try:
        test_data = webhook_data.data.get('preguntas', [])
        
        saved_tests = []
        for pregunta_data in test_data:
            test_dos = TestDos(
                document_id=webhook_data.document_id,
                question=pregunta_data.get('question', ''),
                question_type=pregunta_data.get('question_type', 'multiple_choice'),
                options=pregunta_data.get('options', []),
                correct_answer=pregunta_data.get('correct_answer'),
                correct_index=pregunta_data.get('correct_index'),
                explanation=pregunta_data.get('explanation'),
                difficulty=pregunta_data.get('difficulty', 'medium'),
                points=pregunta_data.get('points', 1),
                time_limit=pregunta_data.get('time_limit')
            )
            await db.test_dos.insert_one(test_dos.dict())
            saved_tests.append(test_dos.dict())
        
        logging.info(f"Saved {len(saved_tests)} test dos for document {webhook_data.document_id}")
        return {"message": f"Se guardaron {len(saved_tests)} preguntas de test dos correctamente"}
        
    except Exception as e:
        logging.error(f"Error processing test dos webhook: {e}")
        raise HTTPException(status_code=500, detail="Error procesando test dos")


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
