# 🎯 SOLUCIÓN FINAL - Configurar n8n paso a paso

## ⚡ PROBLEMA IDENTIFICADO
Los workflows de n8n procesan correctamente con IA, pero el **"Respond to Webhook"** solo responde al webhook original y **NO envía los resultados a nuestra API**.

Por eso los documentos quedan "Procesando..." para siempre.

## ✅ SOLUCIÓN PASO A PASO

### 1️⃣ **Abrir cada workflow en n8n:**
- Resumen (861efbc1...)
- Esquema (0e1d975f...)  
- Test (cb578689...)
- Básicos (8020a54f...)
- Flashcards (4a0cc8e5...)
- Casos (edb291c9...)
- TestDos (7da011c7...)

### 2️⃣ **En CADA workflow, agregar nodo HTTP Request:**

**Posición:** Entre "Edit Fields" y "Respond to Webhook"

```
Edit Fields → 🆕 HTTP Request → Respond to Webhook
```

### 3️⃣ **Configurar el nodo HTTP Request:**

**Configuración General:**
- **Method:** POST
- **URL:** `https://github-enhancer.preview.emergentagent.com/api/webhook/[ID-DEL-WORKFLOW]`

**Headers:**
- **Name:** `Content-Type`  
- **Value:** `application/json`

**Body (JSON):**
```json
{
  "document_id": "{{ $('Webhook').first().json.body.document_id }}",
  "[nombre_campo]": "{{ $json.[nombre_campo] }}"
}
```

### 4️⃣ **URLs específicas por workflow:**

| Workflow | URL | Campo JSON |
|----------|-----|------------|
| **Resumen** | `/api/webhook/861efbc1-9b19-4cc2-9848-888ea7cdb161` | `"resumen": "{{ $json.resumen }}"` |
| **Esquema** | `/api/webhook/0e1d975f-672a-4363-8a3c-4739d9e5c784` | `"esquema": "{{ $json.esquema }}"` |
| **Test** | `/api/webhook-test/cb578689-1dd2-4182-9c09-69dc86a2646b` | `"test": "{{ $json.test }}"` |
| **Básicos** | `/api/webhook-test/8020a54f-a54a-4e99-94c4-0c141f933110` | `"basicos": "{{ $json.basicos }}"` |
| **Flashcards** | `/api/webhook/4a0cc8e5-23c4-49f9-b6a9-b6103354ca89` | `"flashcard": "{{ $json.flashcard }}"` |
| **Casos** | `/api/webhook/edb291c9-587d-448b-b036-3f5fcc7fa47d` | `"casos": "{{ $json.casos }}"` |
| **TestDos** | `/api/webhook/7da011c7-14b4-4702-aa7f-e37faa8cc3c1` | `"testdos": "{{ $json.testdos }}"` |

### 5️⃣ **Ejemplo completo para RESUMEN:**

```json
Method: POST
URL: https://github-enhancer.preview.emergentagent.com/api/webhook/861efbc1-9b19-4cc2-9848-888ea7cdb161

Headers:
Content-Type: application/json

Body:
{
  "document_id": "{{ $('Webhook').first().json.body.document_id }}",
  "resumen": "{{ $json.resumen }}"
}
```

### 6️⃣ **¿Cómo verificar si funciona?**

1. **Sube un PDF** en: https://github-enhancer.preview.emergentagent.com/metodologia
2. **Observa el estado:**
   - ❌ Sin HTTP Request: "Procesando..." para siempre
   - ✅ Con HTTP Request: Cambia a "Completado" en ~1-2 minutos
3. **Haz clic en el documento** → Debería mostrar contenido en las 7 pestañas

### 7️⃣ **Debug endpoints (para diagnosticar):**

**Ver estado de documento:**
```
GET /api/debug/document/[DOCUMENT_ID]
```

**Arreglar documentos atascados:**
```  
POST /api/debug/fix-processing-documents
```

## 🚨 **CRÍTICO:**
Sin el nodo **HTTP Request**, n8n procesa correctamente pero nunca envía los resultados a nuestra API, por lo que la web nunca muestra el contenido generado.

## ✅ **Una vez configurado:**
- Los documentos pasarán de "Procesando..." a "Completado"
- El contenido generado por n8n se mostrará perfectamente en las 7 secciones
- Los estudiantes podrán usar flashcards, esquemas, tests, etc.

¡El sistema quedará completamente funcional!