#!/usr/bin/env python3
"""
Script para probar el upload real de PDF y envío a n8n
"""
import requests
import base64

# Crear un PDF de prueba simple
pdf_content = b"""%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R >>
endobj
4 0 obj
<< /Length 44 >>
stream
BT
/F1 12 Tf
100 700 Td
(Test PDF for n8n) Tj
ET
endstream
endobj
xref
0 5
0000000000 65535 f 
0000000010 00000 n 
0000000053 00000 n 
0000000110 00000 n 
0000000205 00000 n 
trailer
<< /Size 5 /Root 1 0 R >>
startxref
301
%%EOF"""

def test_upload():
    print("🚀 Probando upload real de PDF...")
    
    # URL de la API
    api_url = "https://github-enhancer.preview.emergentagent.com/api/metodologia/upload"
    
    try:
        # Crear archivo temporal para el upload
        files = {'file': ('test-document.pdf', pdf_content, 'application/pdf')}
        
        # Hacer el upload
        response = requests.post(api_url, files=files, timeout=30)
        
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
        
        if response.status_code == 200:
            print("✅ Upload exitoso! Los webhooks de n8n deberían haber recibido el PDF.")
            print("🔗 Verifica en n8n que los workflows se están ejecutando correctamente.")
        else:
            print(f"❌ Error en upload: {response.status_code}")
            
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    test_upload()