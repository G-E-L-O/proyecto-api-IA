# 📡 Documentación de la API

## Base URL

```
http://localhost:5000/api
```

## Endpoints

### Health Check

#### `GET /api/health`

Verifica el estado del servidor.

**Respuesta Exitosa (200):**
```json
{
  "status": "ok",
  "message": "Agente de Narrativas Interactivas funcionando"
}
```

---

### Crear Historia

#### `POST /api/story/create`

Crea una nueva historia interactiva.

**Body:**
```json
{
  "genre": "string (requerido)",
  "theme": "string (requerido)",
  "initialPrompt": "string (opcional)",
  "userPreferences": {
    "style": "string (opcional)",
    "tone": "string (opcional)"
  }
}
```

**Ejemplo:**
```json
{
  "genre": "ciencia ficción",
  "theme": "Un científico que descubre un portal a otra dimensión",
  "initialPrompt": "Incluye elementos de viaje en el tiempo y paradojas temporales",
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
    "theme": "Un científico que descubre un portal a otra dimensión",
    "currentChapter": 0,
    "chapters": [
      {
        "title": "El Descubrimiento",
        "chapter": 1,
        "content": "Contenido narrativo completo...",
        "characters": [
          {
            "name": "Dr. Elena Martínez",
            "role": "Protagonista",
            "personality": "Curiosa y determinada",
            "description": "Científica de 35 años especializada en física cuántica"
          }
        ],
        "decisions": [
          {
            "id": 1,
            "text": "Investigar el portal más a fondo",
            "hint": "Podría revelar secretos peligrosos"
          },
          {
            "id": 2,
            "text": "Reportar el descubrimiento a las autoridades",
            "hint": "Más seguro pero menos emocionante"
          }
        ],
        "atmosphere": "Un laboratorio iluminado por luces azules parpadeantes",
        "cliffhanger": "¿Qué secretos oculta este portal?"
      }
    ],
    "decisions": [],
    "characters": [...],
    "createdAt": "2025-01-15T10:30:00.000Z"
  }
}
```

**Errores:**
- `400`: Faltan campos requeridos (genre o theme)
- `500`: Error al procesar la solicitud

---

### Continuar Historia

#### `POST /api/story/:storyId/continue`

Continúa la historia basándose en una decisión del usuario.

**Parámetros de URL:**
- `storyId` (string, requerido): ID de la historia

**Body:**
```json
{
  "decision": "string (opcional)",
  "userAction": "string (opcional)"
}
```

**Nota:** Al menos uno de los campos (`decision` o `userAction`) debe estar presente.

**Ejemplo:**
```json
{
  "decision": "Investigar el portal más a fondo",
  "userAction": "Decido usar mi equipo científico para analizar las ondas de energía"
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
    "decisions": [
      {
        "chapter": 0,
        "decision": "Investigar el portal más a fondo",
        "timestamp": "2025-01-15T10:35:00.000Z"
      }
    ]
  },
  "newChapter": {
    "title": "Más Allá del Portal",
    "chapter": 2,
    "content": "Nuevo contenido narrativo...",
    "decisions": [...],
    "characters": [...]
  }
}
```

**Errores:**
- `404`: Historia no encontrada
- `400`: Falta decisión o acción del usuario
- `500`: Error al procesar la solicitud

---

### Obtener Historia

#### `GET /api/story/:storyId`

Obtiene el estado actual de una historia.

**Parámetros de URL:**
- `storyId` (string, requerido): ID de la historia

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
    "decisions": [...],
    "createdAt": "..."
  }
}
```

**Errores:**
- `404`: Historia no encontrada

---

### Generar Personaje

#### `POST /api/story/:storyId/character`

Genera un nuevo personaje para la historia.

**Parámetros de URL:**
- `storyId` (string, requerido): ID de la historia

**Body:**
```json
{
  "characterPrompt": "string (requerido)"
}
```

**Ejemplo:**
```json
{
  "characterPrompt": "Un aliado misterioso con poderes especiales que aparece en el momento crucial"
}
```

**Respuesta Exitosa (200):**
```json
{
  "success": true,
  "character": {
    "name": "Aria Shadowweaver",
    "role": "Aliado",
    "personality": "Misteriosa pero leal",
    "description": "Una figura enigmática con habilidades sobrenaturales",
    "motivations": "Proteger el equilibrio entre dimensiones",
    "relationships": "Conoce secretos sobre el portal",
    "secrets": "Pertenece a una organización interdimensional"
  }
}
```

**Errores:**
- `404`: Historia no encontrada
- `400`: Falta characterPrompt
- `500`: Error al procesar la solicitud

---

## Códigos de Estado HTTP

- `200`: Solicitud exitosa
- `400`: Error en la solicitud (datos faltantes o inválidos)
- `404`: Recurso no encontrado
- `500`: Error interno del servidor

## Formato de Respuestas de Error

```json
{
  "error": "Descripción del error",
  "message": "Mensaje detallado (opcional)"
}
```

---

## Ejemplos de Uso con cURL

### Crear Historia
```bash
curl -X POST http://localhost:5000/api/story/create \
  -H "Content-Type: application/json" \
  -d '{
    "genre": "fantasía",
    "theme": "Un mago que debe salvar su mundo",
    "initialPrompt": "Incluye dragones y magia antigua"
  }'
```

### Continuar Historia
```bash
curl -X POST http://localhost:5000/api/story/story_123/continue \
  -H "Content-Type: application/json" \
  -d '{
    "decision": "Confrontar al dragón directamente"
  }'
```

### Obtener Historia
```bash
curl http://localhost:5000/api/story/story_123
```

---

## Notas

- Todas las fechas están en formato ISO 8601
- Los IDs de historias son únicos y se generan automáticamente
- Las historias se almacenan en memoria durante la sesión del servidor
- En producción, se recomienda usar una base de datos para persistencia



