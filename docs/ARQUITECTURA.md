# 🏗️ Arquitectura del Proyecto

## Visión General

Este proyecto sigue una arquitectura de **cliente-servidor** con separación clara entre frontend y backend.

```
┌─────────────┐         HTTP/REST         ┌─────────────┐
│   React     │ ◄──────────────────────► │   Express   │
│  Frontend   │                           │   Backend   │
│  (Puerto    │                           │  (Puerto    │
│   3000)     │                           │   5000)     │
└─────────────┘                           └──────┬──────┘
                                                 │
                                                 ▼
                                          ┌─────────────┐
                                          │  OpenAI API │
                                          │   (GPT-4)   │
                                          └─────────────┘
```

## Estructura de Directorios

```
proyecto-api-IA/
│
├── server/                    # Backend (Node.js + Express)
│   ├── index.js              # Servidor principal y rutas API
│   └── services/
│       └── narrativeAgent.js # Lógica del agente de IA
│
├── client/                    # Frontend (React)
│   ├── public/
│   │   └── index.html        # HTML base
│   └── src/
│       ├── App.js            # Componente principal
│       ├── App.css           # Estilos de la aplicación
│       ├── index.js          # Punto de entrada React
│       └── index.css         # Estilos globales
│
├── docs/                      # Documentación
│   ├── API.md                # Documentación de endpoints
│   ├── INSTALACION.md        # Guía de instalación
│   └── ARQUITECTURA.md       # Este archivo
│
├── .env                       # Variables de entorno (no en Git)
├── .gitignore                 # Archivos ignorados
├── package.json              # Dependencias del backend
└── README.md                 # Documentación principal
```

## Backend (Server)

### Tecnologías
- **Node.js**: Runtime de JavaScript
- **Express**: Framework web minimalista
- **OpenAI SDK**: Cliente oficial de OpenAI
- **dotenv**: Gestión de variables de entorno
- **CORS**: Habilitación de CORS para el frontend

### Flujo de Datos

```
Cliente HTTP Request
    │
    ▼
Express Router (index.js)
    │
    ▼
Narrative Agent (narrativeAgent.js)
    │
    ▼
OpenAI API (GPT-4)
    │
    ▼
Procesamiento de Respuesta
    │
    ▼
JSON Response al Cliente
```

### Componentes Principales

#### `server/index.js`
- Configuración del servidor Express
- Middleware (CORS, JSON parser)
- Definición de rutas API
- Manejo de historias en memoria (Map)

#### `server/services/narrativeAgent.js`
- **createStory()**: Genera el primer capítulo de una historia
- **continueStory()**: Continúa la historia basándose en decisiones
- **generateCharacter()**: Crea nuevos personajes

### Almacenamiento

Actualmente, las historias se almacenan en memoria usando un `Map`:

```javascript
const activeStories = new Map();
// Clave: storyId
// Valor: objeto story completo
```

**Nota:** En producción, se recomienda usar una base de datos (MongoDB, PostgreSQL, etc.)

## Frontend (Client)

### Tecnologías
- **React 18**: Biblioteca de UI
- **Axios**: Cliente HTTP
- **Lucide React**: Iconos
- **CSS3**: Estilos modernos

### Componentes

#### `App.js`
Componente principal que maneja:
- Modo de creación de historia
- Modo de visualización de historia
- Estado de la aplicación
- Comunicación con la API

### Estados de la Aplicación

```
┌─────────────┐
│   CREATE    │  ← Modo inicial: crear nueva historia
└──────┬──────┘
       │
       │ (historia creada)
       ▼
┌─────────────┐
│    STORY    │  ← Modo de lectura/interacción
└──────┬──────┘
       │
       │ (nueva historia)
       ▼
┌─────────────┐
│   CREATE    │
└─────────────┘
```

## Flujo de una Historia

```
1. Usuario crea historia
   │
   ├─► POST /api/story/create
   │
   ├─► narrativeAgent.createStory()
   │
   ├─► OpenAI API (GPT-4)
   │
   └─► Respuesta: Historia inicial con decisiones

2. Usuario toma decisión
   │
   ├─► POST /api/story/:id/continue
   │
   ├─► narrativeAgent.continueStory()
   │
   ├─► OpenAI API (GPT-4) con contexto
   │
   └─► Respuesta: Nuevo capítulo

3. Repetir paso 2 hasta que el usuario termine
```

## Comunicación API

### Formato de Requests

Todas las requests usan `Content-Type: application/json`

### Formato de Responses

Todas las responses exitosas incluyen:
```json
{
  "success": true,
  "data": {...}
}
```

Errores:
```json
{
  "error": "Descripción del error",
  "message": "Detalles adicionales"
}
```

## Seguridad

### Variables de Entorno
- API Keys nunca se exponen en el código
- Archivo `.env` está en `.gitignore`
- Variables se cargan con `dotenv`

### CORS
- Configurado para permitir requests desde `localhost:3000`
- En producción, especificar dominios permitidos

### Validación
- Validación de campos requeridos en el backend
- Manejo de errores en todos los endpoints

## Escalabilidad

### Limitaciones Actuales
- Almacenamiento en memoria (se pierde al reiniciar)
- Sin autenticación de usuarios
- Sin límites de rate limiting

### Mejoras para Producción
- Base de datos para persistencia
- Sistema de autenticación (JWT)
- Rate limiting (express-rate-limit)
- Caché de respuestas (Redis)
- Logging estructurado
- Monitoreo y métricas
- Load balancing para múltiples instancias

## Patrones de Diseño

### Backend
- **MVC**: Separación de rutas, servicios y lógica
- **Service Layer**: Lógica de negocio en `narrativeAgent.js`
- **Singleton**: Una instancia del servidor Express

### Frontend
- **Component-Based**: Arquitectura basada en componentes React
- **State Management**: useState para estado local
- **Container/Presentational**: Separación de lógica y presentación

## Dependencias Clave

### Backend
```json
{
  "express": "^4.18.2",      // Servidor web
  "openai": "^4.20.0",       // Cliente OpenAI
  "dotenv": "^16.3.1",       // Variables de entorno
  "cors": "^2.8.5"           // CORS middleware
}
```

### Frontend
```json
{
  "react": "^18.2.0",        // UI framework
  "axios": "^1.6.2",         // HTTP client
  "lucide-react": "^0.294.0" // Iconos
}
```

## Consideraciones de Rendimiento

### Backend
- Las llamadas a OpenAI pueden tardar 2-5 segundos
- Considerar implementar timeouts
- Caché de respuestas para historias similares (futuro)

### Frontend
- Lazy loading de componentes (futuro)
- Optimización de imágenes (si se agregan)
- Code splitting (futuro)

---

Esta arquitectura es escalable y puede extenderse fácilmente con nuevas funcionalidades.



