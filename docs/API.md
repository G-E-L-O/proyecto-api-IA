# Documentación de la API

## Información General

**Base URL:** `http://localhost:5000/api`

**Formato de Respuesta:** JSON

**Códigos de Estado HTTP Estándar**

## Endpoints

### Health Check

#### GET /api/health

Verifica el estado del servidor y confirma que la API está operativa.

**Respuesta Exitosa (200):**

```json
{
  "status": "ok",
  "message": "Agente de Narrativas Interactivas funcionando"
}
```

---

### Crear Historia

#### POST /api/story/create

Crea una nueva historia interactiva basada en los parámetros proporcionados.

**Parámetros del Request:**

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `genre` | string | Sí | Género de la historia |
| `theme` | string | Sí | Tema o concepto principal |
| `initialPrompt` | string | No | Instrucciones adicionales para la generación |
| `userPreferences` | object | No | Preferencias de estilo y tono |

**Ejemplo de Request:**

```json
{
  "genre": "ciencia ficción",
  "theme": "Un científico que descubre un portal a otra dimensión",
  "initialPrompt": "Incluye elementos de viaje en el tiempo",
  "userPreferences": {
    "style": "descriptivo",
    "tone": "misterioso"
  }
}
```

**Respuesta Exitosa (200):**

```json
{
  "success": true,
  "storyId": "story_1234567890_abc123",
  "story": {
    "id": "story_1234567890_abc123",
    "genre": "ciencia ficción",
    "theme": "Un científico que descubre un portal",
    "currentChapter": 0,
    "chapters": [
      {
        "title": "El Portal",
        "chapter": 1,
        "content": "...",
        "characters": [...],
        "decisions": [...]
      }
    ],
    "characters": [...],
    "decisions": [...]
  }
}
```

**Errores Posibles:**

- `400 Bad Request`: Parámetros inválidos o faltantes
- `500 Internal Server Error`: Error en la generación de la historia

---

### Continuar Historia

#### POST /api/story/:storyId/continue

Genera el siguiente capítulo de una historia existente basado en la decisión del usuario.

**Parámetros de URL:**

- `storyId` (string, requerido): Identificador único de la historia

**Parámetros del Request:**

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `decision` | string | Sí | Decisión seleccionada por el usuario |
| `userAction` | string | No | Acción personalizada adicional |

**Ejemplo de Request:**

```json
{
  "decision": "Investigar el portal más a fondo",
  "userAction": "Decido usar mi equipo científico para analizar la energía del portal"
}
```

**Respuesta Exitosa (200):**

```json
{
  "success": true,
  "story": {
    "id": "story_1234567890_abc123",
    "currentChapter": 1,
    "chapters": [...],
    "characters": [...],
    "decisions": [...]
  },
  "newChapter": {
    "title": "Descubrimientos",
    "chapter": 2,
    "content": "...",
    "decisions": [...]
  }
}
```

---

### Obtener Historia

#### GET /api/story/:storyId

Obtiene el estado actual completo de una historia específica.

**Parámetros de URL:**

- `storyId` (string, requerido): Identificador único de la historia

**Respuesta Exitosa (200):**

```json
{
  "success": true,
  "story": {
    "id": "story_1234567890_abc123",
    "genre": "ciencia ficción",
    "theme": "...",
    "currentChapter": 1,
    "chapters": [...],
    "characters": [...],
    "decisions": [...]
  }
}
```

**Errores Posibles:**

- `404 Not Found`: La historia no existe o ya no está disponible

---

### Generar Personaje

#### POST /api/story/:storyId/character

Genera un nuevo personaje para una historia existente.

**Parámetros de URL:**

- `storyId` (string, requerido): Identificador único de la historia

**Parámetros del Request:**

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `characterPrompt` | string | Sí | Descripción del personaje a generar |

**Ejemplo de Request:**

```json
{
  "characterPrompt": "Un aliado misterioso con poderes especiales"
}
```

**Respuesta Exitosa (200):**

```json
{
  "success": true,
  "character": {
    "name": "Luna Shadows",
    "role": "Aliado",
    "personality": "Misteriosa pero leal",
    "description": "Una mujer con habilidades sobrenaturales",
    "motivations": "...",
    "relationships": "..."
  }
}
```

---

## Manejo de Errores

### Formato de Respuesta de Error

Todas las respuestas de error siguen el siguiente formato:

```json
{
  "success": false,
  "error": "Descripción del error"
}
```

### Códigos de Estado HTTP

| Código | Descripción |
|--------|-------------|
| 200 | Operación exitosa |
| 400 | Solicitud inválida (parámetros incorrectos) |
| 404 | Recurso no encontrado |
| 500 | Error interno del servidor |

### Errores Comunes

**Error de validación:**
```json
{
  "success": false,
  "error": "El campo 'theme' es requerido"
}
```

**Error de recurso no encontrado:**
```json
{
  "success": false,
  "error": "Historia no encontrada"
}
```

**Error de generación:**
```json
{
  "success": false,
  "error": "Error al generar contenido con Gemini: [detalle del error]"
}
```
