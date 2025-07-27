# Guía de Integración - Sistema de Tests

## Archivos principales a copiar

### 1. Componentes React (carpeta components/)
- `TestInteractivo.tsx` - Interfaz principal del test
- `ResultadosTest.tsx` - Pantalla de resultados 
- `Sidebar.tsx` - Menú lateral de navegación
- `AreaSelector.tsx` - Selector de áreas de estudio
- `TemaSelector.tsx` - Selector de temas
- `BloqueGuardiaCivilSelector.tsx` - Selector de bloques GC
- `TemaBloqueSelector.tsx` - Selector de temas dentro de bloques
- `Estadisticas.tsx` - Dashboard de estadísticas
- `MentorIA.tsx` - Hub del mentor IA
- `ChatMentorIA.tsx` - Chat con IA
- `TarjetasRepaso.tsx` - Ejercicios de repaso

### 2. Hooks personalizados (carpeta hooks/)
- `usePreguntas.ts` - Hook para gestión de preguntas y datos

### 3. Configuración de Supabase
- Cliente Supabase ya configurado en `src/integrations/supabase/client.ts`

## Estructura de la base de datos (ya existe en tu proyecto)

### Tablas principales:
- `preguntas` - Banco de preguntas
- `resultados_tests` - Resultados de tests
- `respuestas_usuario` - Respuestas individuales
- `bloques_guardia_civil` - Estructura de bloques GC
- `profiles` - Perfiles de usuario

### Edge Function:
- `mentor-ia-chat` - Función para chat con IA y generación de ejercicios

## Pasos para integrar en tu aplicación principal:

### 1. Copiar archivos
```bash
# Copia todos los componentes a tu proyecto principal
cp -r integration-files/components/* tu-proyecto/src/components/
cp -r integration-files/hooks/* tu-proyecto/src/hooks/
```

### 2. Configurar rutas
Agrega estas rutas en tu router principal:

```tsx
// En tu App.tsx o router principal
import { TestMain } from './components/TestMain'; // Componente principal

<Route path="/tests" element={<TestMain />} />
```

### 3. Crear componente principal
Crea un archivo `TestMain.tsx` que use la lógica del `Index.tsx` original:

```tsx
import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { AreaSelector } from './AreaSelector';
import { TemaSelector } from './TemaSelector';
// ... importar otros componentes

export const TestMain = () => {
  // Copiar toda la lógica del Index.tsx original aquí
  // Manejar vistas, estados, etc.
  
  return (
    <div className="flex h-screen">
      <Sidebar onMenuSelect={handleMenuSelect} activeMenu={menuActivo} />
      <main className="flex-1 overflow-auto">
        {/* Renderizar componentes según vista activa */}
      </main>
    </div>
  );
};
```

### 4. Configurar Supabase
Asegúrate de que tu configuración de Supabase incluya:

```tsx
// src/integrations/supabase/client.ts
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://dpcmcrbfihccafwaiefs.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "tu-key-aqui";

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
```

### 5. Instalar dependencias adicionales
Si no las tienes, instala:

```bash
npm install @tanstack/react-query recharts
```

### 6. Configurar autenticación
Una vez integrado, el sistema detectará automáticamente si hay un usuario autenticado y asociará los resultados al `user_id`.

## Características principales:

✅ **Tests interactivos** por área y tema
✅ **Bloques Guardia Civil** organizados
✅ **Estadísticas detalladas** con gráficos
✅ **Mentor IA** con chat y ejercicios personalizados
✅ **Resultados persistentes** en Supabase
✅ **Sistema de repaso** basado en errores
✅ **Diseño responsive** con Tailwind CSS

## Flujo de usuario:

1. Usuario selecciona área/tema
2. Realiza test interactivo
3. Ve resultados detallados
4. Datos se guardan en Supabase
5. Puede ver estadísticas globales
6. Mentor IA analiza errores y genera ejercicios
7. Sistema sugiere repaso personalizado

## Notas importantes:

- Los datos se guardan automáticamente con `user_id` si hay autenticación
- Si no hay autenticación, `user_id` será `null` pero funciona igual
- El sistema está preparado para integrarse con cualquier sistema de auth
- Las Edge Functions de Supabase manejan la IA y n8n
- Todas las consultas usan RLS (Row Level Security)

¡El sistema está completo y listo para usar! 🚀