#!/usr/bin/env python3
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import uuid
from datetime import datetime
import json

async def create_sample_data():
    # Connect to MongoDB
    client = AsyncIOMotorClient("mongodb://localhost:27017")
    db = client["test_database"]
    
    # Create sample document
    document_id = str(uuid.uuid4())
    document = {
        "id": document_id,
        "filename": "constitucion-española.pdf",
        "upload_timestamp": datetime.utcnow(),
        "processing_status": "completed",
        "file_path": None,
        "user_id": None
    }
    
    await db.documents.insert_one(document)
    print(f"Created document with ID: {document_id}")
    
    # Update existing content with the correct document_id
    await db.flashcards.update_many(
        {"document_id": "test-doc-1"},
        {"$set": {"document_id": document_id}}
    )
    
    await db.resumenes.update_many(
        {"document_id": "test-doc-1"},
        {"$set": {"document_id": document_id}}
    )
    
    await db.esquemas.update_many(
        {"document_id": "test-doc-1"},
        {"$set": {"document_id": document_id}}
    )
    
    # Add some test questions
    preguntas = [
        {
            "id": str(uuid.uuid4()),
            "document_id": document_id,
            "question": "¿En qué año fue aprobada la Constitución Española?",
            "options": ["1976", "1977", "1978", "1979"],
            "correct_answer": 2,
            "explanation": "La Constitución Española fue aprobada por referéndum el 6 de diciembre de 1978.",
            "difficulty": "easy",
            "created_at": datetime.utcnow()
        },
        {
            "id": str(uuid.uuid4()),
            "document_id": document_id,
            "question": "¿Cuál es la forma de gobierno establecida en la Constitución?",
            "options": ["República", "Monarquía absoluta", "Monarquía parlamentaria", "Estado federal"],
            "correct_answer": 2,
            "explanation": "España se constituye en un Estado social y democrático de Derecho, que propugna como valores superiores de su ordenamiento jurídico la libertad, la justicia, la igualdad y el pluralismo político. La forma política del Estado español es la Monarquía parlamentaria.",
            "difficulty": "medium",
            "created_at": datetime.utcnow()
        }
    ]
    
    await db.preguntas_test.insert_many(preguntas)
    
    # Add a practical case
    caso = {
        "id": str(uuid.uuid4()),
        "document_id": document_id,
        "title": "Caso Práctico: Recurso de Inconstitucionalidad",
        "scenario": "Un grupo de diputados presenta un recurso de inconstitucionalidad contra una ley que consideran vulnera derechos fundamentales recogidos en la Constitución. La ley en cuestión establece limitaciones al derecho de reunión en determinadas circunstancias.",
        "questions": [
            "¿Qué requisitos debe cumplir el recurso de inconstitucionalidad?",
            "¿Quiénes están legitimados para presentar este recurso?",
            "¿Qué efectos produce la admisión a trámite del recurso?",
            "¿Qué criterios debe seguir el Tribunal Constitucional para resolver?"
        ],
        "solution": "El recurso de inconstitucionalidad está regulado en los artículos 161-164 de la Constitución y en la Ley Orgánica del Tribunal Constitucional. Deben cumplirse los siguientes requisitos:\n\n1. Legitimación: Pueden interponerlo el Presidente del Gobierno, el Defensor del Pueblo, 50 Diputados, 50 Senadores, los órganos colegiados ejecutivos de las CCAA y las Asambleas de las mismas.\n\n2. Plazo: Debe interponerse en el plazo de tres meses desde la publicación de la ley.\n\n3. Objeto: Leyes, disposiciones normativas con fuerza de ley y tratados internacionales.\n\n4. Efectos: La admisión a trámite no suspende la vigencia de la norma, salvo que el TC acuerde la suspensión.\n\n5. Resolución: El TC debe examinar si la norma es conforme con la Constitución, pudiendo declararla inconstitucional total o parcialmente.",
        "key_concepts": [
            "Recurso de inconstitucionalidad",
            "Tribunal Constitucional",
            "Legitimación activa",
            "Control de constitucionalidad",
            "Derechos fundamentales"
        ],
        "created_at": datetime.utcnow()
    }
    
    await db.casos_practicos.insert_one(caso)
    
    print("Sample data created successfully!")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(create_sample_data())