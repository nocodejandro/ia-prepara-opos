#!/usr/bin/env python3
"""
Prueba con los datos reales que llegaron de n8n
"""

import requests
import json

# URL base de nuestra API
API_BASE = "https://github-enhancer.preview.emergentagent.com/api"

def test_real_data():
    """Prueba con los datos reales que envió n8n"""
    
    print("🧪 Probando con datos reales de n8n...")
    
    # Datos reales de testdos que llegaron de n8n
    testdos_real_data = {
        "document_id": "real-n8n-test",
        "testdos": """Aquí tienes 3 preguntas de tipo test sobre la documentación proporcionada, siguiendo el formato solicitado:

---

**Pregunta 1:**
Según el Código Penal, la existencia del delito requiere la comprobación del contenido de la conducta a la luz de una "triple secuencia" de elementos materiales. ¿Cuál de las siguientes opciones NO forma parte de esta secuencia principal, sino que "suele añadirse" posteriormente?

a) Tipicidad
b) Antijuridicidad
c) Culpabilidad
d) Penalidad

**Respuesta correcta:** d) Penalidad

**Justificación:** El documento establece explícitamente: "La existencia del delito requiere la comprobación del contenido de la conducta a la luz de una triple secuencia: tipicidad, antijuridicidad y culpabilidad." Y añade que "A la triple secuencia suele añadirse la comprobación de la PENALIDAD de la conducta." Esto significa que la penalidad, si bien es un elemento posterior y necesario para la aplicación de la pena, no es uno de los componentes de la *triple secuencia* inicial para determinar la existencia material del delito. Las opciones a), b) y c) son los pilares fundamentales de esta secuencia principal. Para reconocer la respuesta, es clave la palabra "NO" en la pregunta y la distinción entre la "triple secuencia" y lo que "suele añadirse".

---

**Pregunta 2:**
¿Cuál de las siguientes afirmaciones describe correctamente un delito de omisión impropia o comisión por omisión, según lo expuesto en el tema?

a) Se sanciona la no realización de determinados comportamientos que, por expreso mandato legal, debieran realizarse.
b) El sujeto se abstiene de actuar cuando debiera hacerlo, sin alterar con su inactividad el normal discurrir de los acontecimientos.
c) El comportamiento del sujeto consiste en una omisión que implica la infracción de una norma prohibitiva, donde el sujeto tiene un deber específico de actuar para evitar el resultado típico.
d) Se castiga únicamente la simple inactividad del sujeto sin ninguna otra condición.

**Respuesta correcta:** c) El comportamiento del sujeto consiste en una omisión que implica la infracción de una norma prohibitiva, donde el sujeto tiene un deber específico de actuar para evitar el resultado típico.

**Justificación:** El texto define los delitos de omisión impropia o comisión por omisión como aquellos en los que "el comportamiento del sujeto consiste en una omisión que implica la infracción de una norma prohibitiva, por cuanto el sujeto tiene un deber específico de actuar para evitar el resultado típico." En estos casos, el sujeto es "garante de la indemnidad del bien jurídico", y su inactividad que permite la producción de un resultado se le atribuye como si hubiera realizado una acción activa. Las opciones a) y b) describen los delitos de omisión pura o propia, que se centran en la infracción de un deber de actuar sin necesariamente implicar la causación de un resultado prohibido por una norma. La opción d) es incorrecta, ya que el texto aclara que "no se sanciona la simple inactividad, sino la no realización de una acción esperada."

---

**Pregunta 3:**
Según la doctrina penal, ¿cuál de los siguientes supuestos NO se considera una situación de ausencia de acción en el ámbito penal, sino que implicaría otro tipo de responsabilidad si se causa un daño?

a) Un sujeto es empujado violentamente por un tercero y cae sobre otra persona, matándola.
b) Una persona tiene un ataque epiléptico y, durante las convulsiones, golpea accidentalmente a alguien causándole lesiones.
c) Un individuo en estado de sonambulismo comete un acto que, de estar consciente, sería un delito.
d) Un cirujano olvida material quirúrgico dentro de un paciente al finalizar una operación, provocándole una infección que causa su muerte.

**Respuesta correcta:** d) Un cirujano olvida material quirúrgico dentro de un paciente al finalizar una operación, provocándole una infección que causa su muerte.

**Justificación:** El texto establece que la ausencia de voluntad consciente, que es uno de los pilares del concepto de acción penal, implica que el comportamiento no puede ser considerado penalmente relevante. Los tres supuestos de ausencia de acción mencionados son: fuerza irresistible, movimientos reflejos y estados de inconsciencia. Las opciones a) (fuerza irresistible), b) (movimientos reflejos) y c) (estados de inconsciencia como el sonambulismo) son ejemplos directos de estos supuestos. La opción d), sin embargo, es un ejemplo de "delito imprudente" según el propio texto, que lo describe como un "homicidio imprudente" debido a la omisión de la diligencia debida. Esto implica que existe una acción, pero realizada con negligencia o descuido, no una ausencia total de acción o voluntad. La clave para diferenciar o descartar esta respuesta radica en entender que la negligencia o imprudencia, aunque no sean dolosas, sí presuponen una acción, a diferencia de los casos donde la voluntad está completamente anulada."""
    }
    
    # Enviar a nuestro endpoint
    response = requests.post(f"{API_BASE}/webhook/7da011c7-14b4-4702-aa7f-e37faa8cc3c1", json=testdos_real_data)
    
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")
    
    if response.status_code == 200:
        print("\n✅ Datos procesados correctamente!")
        
        # Verificar que se guardaron las preguntas
        content_response = requests.get(f"{API_BASE}/metodologia/real-n8n-test/content")
        if content_response.status_code == 200:
            content = content_response.json()
            print(f"\n📊 Contenido guardado:")
            print(f"   📝 Test Dos: {len(content.get('test_dos', []))} preguntas")
            
            # Mostrar las preguntas guardadas
            for i, pregunta in enumerate(content.get('test_dos', [])):
                print(f"\n   Pregunta {i+1}: {pregunta.get('question', '')[:50]}...")
                print(f"   Opciones: {len(pregunta.get('options', []))}")
                print(f"   Explicación: {len(pregunta.get('explanation', ''))} caracteres")
        
        print(f"\n🔗 Ver en: https://github-enhancer.preview.emergentagent.com/metodologia")
        
    else:
        print("❌ Error procesando datos")

if __name__ == "__main__":
    test_real_data()