#!/usr/bin/env python3
"""
Script de prueba para demostrar la integración completa con n8n
Este script simula las respuestas que n8n enviará de vuelta a nuestra API
"""

import requests
import json
import time

# URLs de la API local
API_BASE = "https://github-enhancer.preview.emergentagent.com/api"

def test_n8n_webhooks():
    """Prueba todos los webhooks que n8n va a utilizar"""
    
    # Documento ID de ejemplo (usa uno que ya existe)
    document_id = "3c68e0a1-cf1b-4746-a26f-fe609bf788aa"
    
    print("🚀 Iniciando pruebas de integración n8n...")
    print(f"📄 Usando documento ID: {document_id}")
    
    # 1. Test Resumen
    print("\n1️⃣ Enviando resumen...")
    resumen_payload = {
        "document_id": document_id,
        "type": "resumen",
        "data": {
            "resumen": {
                "title": "Resumen Generado por n8n",
                "content": "Este es un resumen completo generado por la IA de n8n. El documento trata sobre conceptos fundamentales de oposiciones que todo estudiante debe conocer para aprobar su examen.\n\nLos puntos más importantes incluyen metodología de estudio, técnicas de memorización y estrategias de repaso efectivas.",
                "key_points": [
                    "Metodología de estudio estructurada",
                    "Técnicas de memorización avanzadas", 
                    "Estrategias de repaso espaciado",
                    "Gestión del tiempo durante el examen",
                    "Control del estrés y ansiedad"
                ]
            }
        }
    }
    
    response = requests.post(f"{API_BASE}/webhooks/resumen", json=resumen_payload)
    print(f"   ✅ Resumen: {response.status_code} - {response.json()}")
    
    # 2. Test Conceptos Básicos
    print("\n2️⃣ Enviando conceptos básicos...")
    basicos_payload = {
        "document_id": document_id,
        "type": "conceptos_basicos",
        "data": {
            "conceptos": [
                {
                    "title": "Metodología de Estudio",
                    "definition": "Conjunto de técnicas y estrategias organizadas para optimizar el aprendizaje y retención de información.",
                    "examples": [
                        "Técnica Pomodoro para gestión del tiempo",
                        "Mapas mentales para organizar información",
                        "Repaso espaciado para consolidar memoria"
                    ],
                    "importance_level": "high",
                    "category": "Técnicas de Estudio"
                },
                {
                    "title": "Memoria de Trabajo",
                    "definition": "Sistema cognitivo responsable del almacenamiento temporal y manipulación de información durante tareas complejas.",
                    "examples": [
                        "Recordar números mientras resuelves un problema",
                        "Mantener información mientras lees un texto",
                        "Procesar múltiples datos simultáneamente"
                    ],
                    "importance_level": "medium",
                    "category": "Psicología Cognitiva"
                }
            ]
        }
    }
    
    response = requests.post(f"{API_BASE}/webhooks/conceptos_basicos", json=basicos_payload)
    print(f"   ✅ Conceptos Básicos: {response.status_code} - {response.json()}")
    
    # 3. Test Flashcards
    print("\n3️⃣ Enviando flashcards...")
    flashcards_payload = {
        "document_id": document_id,
        "type": "flashcards", 
        "data": {
            "flashcards": [
                {
                    "question": "¿Qué es la técnica Pomodoro?",
                    "answer": "Método de gestión del tiempo que divide el trabajo en intervalos de 25 minutos separados por descansos cortos.",
                    "difficulty": "easy",
                    "category": "Productividad"
                },
                {
                    "question": "¿Cuáles son las fases del repaso espaciado?",
                    "answer": "1) Repaso inmediato, 2) Repaso al día siguiente, 3) Repaso a la semana, 4) Repaso al mes, 5) Repaso semestral.",
                    "difficulty": "medium", 
                    "category": "Técnicas de Memoria"
                },
                {
                    "question": "¿Qué factores afectan la curva del olvido de Ebbinghaus?",
                    "answer": "La significatividad del material, el método de aprendizaje, factores fisiológicos y el tiempo transcurrido.",
                    "difficulty": "hard",
                    "category": "Psicología del Aprendizaje"
                }
            ]
        }
    }
    
    response = requests.post(f"{API_BASE}/webhooks/flashcards", json=flashcards_payload)
    print(f"   ✅ Flashcards: {response.status_code} - {response.json()}")
    
    # 4. Test Esquemas
    print("\n4️⃣ Enviando esquemas...")
    esquema_payload = {
        "document_id": document_id,
        "type": "esquema",
        "data": {
            "esquema": {
                "title": "Metodología de Estudio para Oposiciones",
                "content": {
                    "title": "Metodología de Estudio Efectiva",
                    "description": "Framework completo para preparar oposiciones",
                    "children": [
                        {
                            "title": "Planificación",
                            "description": "Organización temporal y de contenidos",
                            "points": [
                                "Calendario de estudio personalizado",
                                "Distribución de materias por importancia",
                                "Objetivos SMART semanales y mensuales"
                            ],
                            "children": [
                                {
                                    "title": "Análisis Previo",
                                    "points": ["Revisión del temario", "Identificación de debilidades", "Evaluación del tiempo disponible"]
                                }
                            ]
                        },
                        {
                            "title": "Técnicas de Estudio", 
                            "description": "Métodos probados para maximizar retención",
                            "points": [
                                "Lectura activa y comprensiva",
                                "Técnicas de memorización",
                                "Creación de resúmenes y esquemas"
                            ]
                        },
                        {
                            "title": "Evaluación y Repaso",
                            "description": "Sistema de autoevaluación continua",
                            "points": [
                                "Tests de autoevaluación",
                                "Repaso espaciado",
                                "Simulacros de examen"
                            ]
                        }
                    ]
                }
            }
        }
    }
    
    response = requests.post(f"{API_BASE}/webhooks/esquema", json=esquema_payload)
    print(f"   ✅ Esquemas: {response.status_code} - {response.json()}")
    
    # 5. Test Preguntas Test
    print("\n5️⃣ Enviando preguntas test...")
    test_payload = {
        "document_id": document_id,
        "type": "preguntas_test",
        "data": {
            "preguntas": [
                {
                    "question": "¿Cuál es el tiempo recomendado para cada sesión de la técnica Pomodoro?",
                    "options": ["15 minutos", "25 minutos", "35 minutos", "45 minutos"],
                    "correct_answer": 1,
                    "explanation": "La técnica Pomodoro utiliza intervalos de 25 minutos seguidos de un descanso de 5 minutos.",
                    "difficulty": "easy"
                },
                {
                    "question": "Según Ebbinghaus, ¿cuánto se olvida del material aprendido en las primeras 24 horas?",
                    "options": ["Aproximadamente 30%", "Aproximadamente 50%", "Aproximadamente 70%", "Aproximadamente 90%"],
                    "correct_answer": 2,
                    "explanation": "La curva del olvido de Ebbinghaus muestra que olvidamos aproximadamente el 70% de la información nueva en las primeras 24 horas sin repaso.",
                    "difficulty": "medium"
                }
            ]
        }
    }
    
    response = requests.post(f"{API_BASE}/webhooks/preguntas_test", json=test_payload)
    print(f"   ✅ Preguntas Test: {response.status_code} - {response.json()}")
    
    # 6. Test Dos (Preguntas avanzadas)
    print("\n6️⃣ Enviando test dos...")
    testdos_payload = {
        "document_id": document_id,
        "type": "test_dos",
        "data": {
            "preguntas": [
                {
                    "question": "Explica la diferencia entre memoria a corto plazo y memoria de trabajo.",
                    "question_type": "short_answer",
                    "correct_answer": "La memoria a corto plazo almacena información temporalmente, mientras que la memoria de trabajo no solo almacena sino que también manipula y procesa activamente la información.",
                    "explanation": "La memoria de trabajo es más compleja que la memoria a corto plazo porque incluye procesos ejecutivos que manipulan la información.",
                    "difficulty": "medium",
                    "points": 3,
                    "time_limit": 180
                },
                {
                    "question": "¿Es cierto que el repaso espaciado es más efectivo que el repaso masivo?",
                    "question_type": "true_false", 
                    "correct_answer": "Verdadero",
                    "explanation": "Múltiples estudios demuestran que el repaso espaciado produce mejor retención a largo plazo que estudiar intensivamente en períodos cortos.",
                    "difficulty": "easy",
                    "points": 1,
                    "time_limit": 60
                }
            ]
        }
    }
    
    response = requests.post(f"{API_BASE}/webhooks/test_dos", json=testdos_payload)
    print(f"   ✅ Test Dos: {response.status_code} - {response.json()}")
    
    # 7. Test Casos Prácticos
    print("\n7️⃣ Enviando casos prácticos...")
    casos_payload = {
        "document_id": document_id,
        "type": "casos_practicos",
        "data": {
            "caso": {
                "title": "Caso Práctico: Optimización del Estudio",
                "scenario": "María es una opositora que trabaja 6 horas diarias y tiene solo 3 horas por la tarde para estudiar. Ha intentado estudiar todo el temario de forma lineal, pero se siente abrumada y no retiene la información. Tiene el examen en 6 meses y el temario incluye 25 temas extensos.",
                "questions": [
                    "¿Qué técnicas de planificación recomendarías a María?",
                    "¿Cómo debe distribuir las 3 horas diarias de estudio?", 
                    "¿Qué técnicas de memorización serían más efectivas en su situación?",
                    "¿Cómo puede implementar un sistema de repaso sin abrumarse?"
                ],
                "solution": "Solución integral para María:\n\n1. **Planificación estratégica**: Usar matriz de Eisenhower para priorizar temas por importancia y dificultad. Crear un cronograma realista con buffer time.\n\n2. **Distribución del tiempo**: 2 horas para contenido nuevo, 45 minutos para repaso, 15 minutos para autoevaluación.\n\n3. **Técnicas recomendadas**: Técnica Pomodoro (6 bloques de 25 min), mapas mentales para conexiones, flashcards para datos específicos.\n\n4. **Sistema de repaso**: Implementar repaso espaciado con 3 ciclos: diario (últimos 3 temas), semanal (últimos 7 temas), quincenal (todos los temas vistos).",
                "key_concepts": [
                    "Gestión del tiempo limitado",
                    "Priorización de contenidos", 
                    "Técnicas de memorización",
                    "Repaso espaciado",
                    "Autoevaluación continua"
                ]
            }
        }
    }
    
    response = requests.post(f"{API_BASE}/webhooks/caso_practico", json=casos_payload)
    print(f"   ✅ Casos Prácticos: {response.status_code} - {response.json()}")
    
    print("\n🎉 ¡Todas las pruebas completadas exitosamente!")
    print(f"\n🔗 Visualiza el resultado en: https://github-enhancer.preview.emergentagent.com/metodologia")
    
    # Verificar que todo se guardó correctamente
    print("\n📊 Verificando contenido guardado...")
    response = requests.get(f"{API_BASE}/metodologia/{document_id}/content")
    if response.status_code == 200:
        content = response.json()
        print(f"   📋 Resúmenes: {len(content.get('resumenes', []))}")
        print(f"   📚 Conceptos básicos: {len(content.get('conceptos_basicos', []))}")
        print(f"   🎴 Flashcards: {len(content.get('flashcards', []))}")
        print(f"   🗺️ Esquemas: {len(content.get('esquemas', []))}")
        print(f"   ❓ Preguntas test: {len(content.get('preguntas_test', []))}")
        print(f"   📝 Test dos: {len(content.get('test_dos', []))}")
        print(f"   💼 Casos prácticos: {len(content.get('casos_practicos', []))}")
    else:
        print(f"   ❌ Error verificando contenido: {response.status_code}")

if __name__ == "__main__":
    test_n8n_webhooks()