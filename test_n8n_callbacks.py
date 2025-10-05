#!/usr/bin/env python3
"""
Script para simular las respuestas que n8n enviará de vuelta a nuestra API
después de procesar el PDF
"""

import requests
import json
import time

# URL base de nuestra API
API_BASE = "https://github-enhancer.preview.emergentagent.com/api"

def test_n8n_callbacks():
    """Simula las respuestas que n8n enviará después de procesar el PDF"""
    
    document_id = "test-doc-from-n8n"
    
    print("🔄 Simulando respuestas de n8n...")
    
    # 1. Simular respuesta de RESUMEN
    print("\n📋 Enviando resumen desde n8n...")
    resumen_data = {
        "document_id": document_id,
        "resumen": "Este es un resumen completo generado por n8n con IA. El documento trata sobre metodología de estudio para oposiciones, incluyendo técnicas de memorización, planificación del tiempo y estrategias de repaso efectivas para maximizar el rendimiento en exámenes."
    }
    
    response = requests.post(f"{API_BASE}/webhook/861efbc1-9b19-4cc2-9848-888ea7cdb161", json=resumen_data)
    print(f"   Resumen: {response.status_code} - {response.json()}")
    
    # 2. Simular respuesta de ESQUEMA
    print("\n🗺️ Enviando esquema desde n8n...")
    esquema_data = {
        "document_id": document_id,
        "esquema": "1. Planificación del Estudio\n   - Análisis del temario\n   - Cronograma personalizado\n   - Objetivos a corto y largo plazo\n\n2. Técnicas de Memorización\n   - Repaso espaciado\n   - Mapas mentales\n   - Técnica Pomodoro\n\n3. Estrategias de Examen\n   - Gestión del tiempo\n   - Técnicas de respuesta\n   - Control del estrés"
    }
    
    response = requests.post(f"{API_BASE}/webhook/0e1d975f-672a-4363-8a3c-4739d9e5c784", json=esquema_data)
    print(f"   Esquema: {response.status_code} - {response.json()}")
    
    # 3. Simular respuesta de CONCEPTOS BÁSICOS
    print("\n📚 Enviando conceptos básicos desde n8n...")
    basicos_data = {
        "document_id": document_id,
        "basicos": "Memoria de trabajo - Sistema cognitivo que permite mantener y manipular información temporalmente\nRepaso espaciado - Técnica que distribuye el estudio a lo largo del tiempo para mejorar retención\nMetacognición - Conocimiento sobre el propio proceso de aprendizaje"
    }
    
    response = requests.post(f"{API_BASE}/webhook-test/8020a54f-a54a-4e99-94c4-0c141f933110", json=basicos_data)
    print(f"   Básicos: {response.status_code} - {response.json()}")
    
    # 4. Simular respuesta de FLASHCARDS
    print("\n🎴 Enviando flashcards desde n8n...")
    flashcards_data = {
        "document_id": document_id,
        "flashcard": "1. ¿Qué es la técnica Pomodoro? - Método que divide el trabajo en intervalos de 25 minutos\n2. ¿Cuándo es más efectivo el repaso? - Durante las primeras 24 horas después del aprendizaje inicial\n3. ¿Qué es la curva del olvido? - Representación de cómo perdemos información con el tiempo"
    }
    
    response = requests.post(f"{API_BASE}/webhook/4a0cc8e5-23c4-49f9-b6a9-b6103354ca89", json=flashcards_data)
    print(f"   Flashcards: {response.status_code} - {response.json()}")
    
    # 5. Simular respuesta de TEST
    print("\n❓ Enviando preguntas test desde n8n...")
    test_data = {
        "document_id": document_id,
        "test": "¿Cuál es la duración recomendada de cada sesión en la técnica Pomodoro?\na) 15 minutos\nb) 25 minutos\nc) 35 minutos\nd) 45 minutos\n\nRespuesta correcta: b) 25 minutos"
    }
    
    response = requests.post(f"{API_BASE}/webhook-test/cb578689-1dd2-4182-9c09-69dc86a2646b", json=test_data)
    print(f"   Test: {response.status_code} - {response.json()}")
    
    # 6. Simular respuesta de CASOS PRÁCTICOS
    print("\n💼 Enviando casos prácticos desde n8n...")
    casos_data = {
        "document_id": document_id,
        "casos": "Caso: María tiene 3 horas diarias para estudiar y 6 meses para preparar una oposición con 25 temas. Trabaja 8 horas y se siente abrumada. ¿Qué estrategia de estudio le recomendarías para optimizar su tiempo y mejorar la retención?"
    }
    
    response = requests.post(f"{API_BASE}/webhook/edb291c9-587d-448b-b036-3f5fcc7fa47d", json=casos_data)
    print(f"   Casos: {response.status_code} - {response.json()}")
    
    # 7. Simular respuesta de TEST DOS
    print("\n📝 Enviando test dos desde n8n...")
    testdos_data = {
        "document_id": document_id,
        "testdos": "Pregunta avanzada: Explica cómo el repaso espaciado mejora la consolidación de la memoria a largo plazo y describe un cronograma específico para implementarlo en la preparación de oposiciones."
    }
    
    response = requests.post(f"{API_BASE}/webhook/7da011c7-14b4-4702-aa7f-e37faa8cc3c1", json=testdos_data)
    print(f"   Test Dos: {response.status_code} - {response.json()}")
    
    print("\n🎉 Todas las simulaciones de n8n completadas!")
    
    # Verificar que todo se guardó
    print(f"\n🔗 Ver resultado en: https://github-enhancer.preview.emergentagent.com/metodologia")
    
    # Verificar contenido guardado
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

if __name__ == "__main__":
    test_n8n_callbacks()