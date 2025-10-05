# 🔧 Configuración N8N - Manual Completo

## ❌ PROBLEMA ACTUAL
Los workflows de n8n procesan correctamente pero **NO envían los resultados de vuelta a nuestra API**, causando que los documentos queden "Procesando..." infinitamente.

## ✅ SOLUCIÓN: Agregar HTTP Request

En **CADA workflow de n8n**, después del nodo "Edit Fields" y **ANTES** del "Respond to Webhook", agregar:

### 📋 **Nodo HTTP Request - Configuración:**

```json
Method: POST
URL: [Ver URLs específicas abajo]
Headers: 
  - Name: Content-Type
  - Value: application/json

Body (JSON):
{
  "document_id": "{{ $('Webhook').first().json.body.document_id }}",
  "[campo_resultado]": "{{ $json.[campo_resultado] }}"
}
```

---

## 🎯 **URLs y configuraciones específicas por workflow:**

### 1️⃣ **RESUMEN** (Webhook: 861efbc1-9b19-4cc2-9848-888ea7cdb161)
```json
URL: https://github-enhancer.preview.emergentagent.com/api/webhook/861efbc1-9b19-4cc2-9848-888ea7cdb161

Body:
{
  "document_id": "{{ $('Webhook').first().json.body.document_id }}",
  "resumen": "{{ $json.resumen }}"
}
```

### 2️⃣ **ESQUEMA** (Webhook: 0e1d975f-672a-4363-8a3c-4739d9e5c784)
```json
URL: https://github-enhancer.preview.emergentagent.com/api/webhook/0e1d975f-672a-4363-8a3c-4739d9e5c784

Body:
{
  "document_id": "{{ $('Webhook').first().json.body.document_id }}",
  "esquema": "{{ $json.esquema }}"
}
```

### 3️⃣ **TEST** (Webhook: cb578689-1dd2-4182-9c09-69dc86a2646b)
```json
URL: https://github-enhancer.preview.emergentagent.com/api/webhook-test/cb578689-1dd2-4182-9c09-69dc86a2646b

Body:
{
  "document_id": "{{ $('Webhook').first().json.body.document_id }}",
  "test": "{{ $json.test }}"
}
```

### 4️⃣ **BÁSICOS** (Webhook: 8020a54f-a54a-4e99-94c4-0c141f933110)
```json
URL: https://github-enhancer.preview.emergentagent.com/api/webhook-test/8020a54f-a54a-4e99-94c4-0c141f933110

Body:
{
  "document_id": "{{ $('Webhook').first().json.body.document_id }}",
  "basicos": "{{ $json.basicos }}"
}
```

### 5️⃣ **FLASHCARDS** (Webhook: 4a0cc8e5-23c4-49f9-b6a9-b6103354ca89)
```json
URL: https://github-enhancer.preview.emergentagent.com/api/webhook/4a0cc8e5-23c4-49f9-b6a9-b6103354ca89

Body:
{
  "document_id": "{{ $('Webhook').first().json.body.document_id }}",
  "flashcard": "{{ $json.flashcard }}"
}
```

### 6️⃣ **CASOS** (Webhook: edb291c9-587d-448b-b036-3f5fcc7fa47d)
```json
URL: https://github-enhancer.preview.emergentagent.com/api/webhook/edb291c9-587d-448b-b036-3f5fcc7fa47d

Body:
{
  "document_id": "{{ $('Webhook').first().json.body.document_id }}",
  "casos": "{{ $json.casos }}"
}
```

### 7️⃣ **TESTDOS** (Webhook: 7da011c7-14b4-4702-aa7f-e37faa8cc3c1)
```json
URL: https://github-enhancer.preview.emergentagent.com/api/webhook/7da011c7-14b4-4702-aa7f-e37faa8cc3c1

Body:
{
  "document_id": "{{ $('Webhook').first().json.body.document_id }}",
  "testdos": "{{ $json.testdos }}"
}
```

---

## 📐 **Orden correcto de nodos en n8n:**

```
Webhook → Code in JavaScript → Extract from File → Code in JavaScript → AI Agent → Code in JavaScript → Edit Fields → **HTTP Request** → Respond to Webhook
```

### ⚡ **CRÍTICO:** 
El nodo **HTTP Request** debe ir **DESPUÉS** de "Edit Fields" y **ANTES** de "Respond to Webhook".

---

## 🧪 **Para probar si funciona:**

1. Sube un PDF en: https://github-enhancer.preview.emergentagent.com/metodologia
2. Verifica que el documento cambie de "Procesando..." a "Completado"
3. Haz clic en el documento y verifica que aparezca contenido en las 7 pestañas

---

## 🚨 **Errores comunes:**

❌ **No agregar HTTP Request** → Documento queda "Procesando..." para siempre
❌ **URL incorrecta** → Error 404, contenido no se guarda  
❌ **document_id incorrecto** → Contenido se guarda en documento equivocado
❌ **Campo resultado incorrecto** → Contenido vacío o error

✅ **Configuración correcta** → Documento pasa a "Completado" y muestra contenido