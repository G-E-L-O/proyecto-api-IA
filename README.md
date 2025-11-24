# 📖 Agente de Narrativas Interactivas con IA

Un proyecto revolucionario de 2025 que utiliza inteligencia artificial avanzada para crear historias interactivas completamente inmersivas. El sistema genera narrativas dinámicas con personajes complejos, tramas ramificadas y decisiones que realmente importan.

## 🌟 Características Únicas

- **Generación de Historias Completas**: La IA crea narrativas completas con personajes, tramas y atmósferas únicas
- **Decisiones que Importan**: Cada decisión del usuario cambia el curso de la historia de forma significativa
- **Personajes Dinámicos**: Personajes con personalidades complejas que evolucionan con la historia
- **Narrativas Ramificadas**: Múltiples caminos narrativos que se adaptan a tus elecciones
- **Interfaz Inmersiva**: Diseño moderno que te sumerge en la experiencia narrativa
- **Múltiples Géneros**: Ciencia ficción, fantasía, misterio, terror, romance, drama, thriller, histórico, distopía

## 🚀 Tecnologías Utilizadas

### Backend
- **Node.js** + **Express**: Servidor robusto y escalable
- **OpenAI API (GPT-4)**: Generación inteligente de narrativas
- **dotenv**: Gestión de variables de entorno

### Frontend
- **React 18**: Framework moderno de UI
- **Lucide React**: Iconos modernos y atractivos
- **Axios**: Cliente HTTP para comunicación con la API
- **CSS3**: Diseño moderno con gradientes y animaciones

## 📋 Requisitos Previos

- Node.js (v16 o superior)
- npm o yarn
- API Key de OpenAI ([obtener aquí](https://platform.openai.com/api-keys))

## 🛠️ Instalación

### 1. Clonar o descargar el proyecto

```bash
git clone <tu-repositorio>
cd proyecto-api-IA
```

### 2. Instalar dependencias

**Opción A: Instalar todo de una vez**
```bash
npm run install-all
```

**Opción B: Instalar por separado**
```bash
# Backend
npm install

# Frontend
cd client
npm install
cd ..
```

### 3. Configurar variables de entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
OPENAI_API_KEY=sk-tu-api-key-aqui
OPENAI_MODEL=gpt-4-turbo-preview
PORT=5000
```

**⚠️ Importante**: 
- Reemplaza `sk-tu-api-key-aqui` con tu API Key real de OpenAI
- Obtén tu API Key en: https://platform.openai.com/api-keys
- **Nunca compartas tu API Key** ni subas el archivo `.env` a repositorios públicos

## 🎯 Uso

### Iniciar la aplicación

**Opción 1: Ejecutar por separado (Recomendado para Windows/PowerShell)**

Abre **dos terminales**:

**Terminal 1 - Backend:**
```bash
npm run server
```

**Terminal 2 - Frontend:**
```bash
npm run client
```

**Opción 2: Ejecutar ambos juntos**
```bash
npm run dev
```

### Acceder a la aplicación

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/api/health

## 📖 Cómo Usar la Aplicación

### 1. Crear una Historia

1. Selecciona un **género** de la lista desplegable
2. Ingresa un **tema o concepto principal** (ej: "Un científico que descubre un portal a otra dimensión")
3. (Opcional) Agrega un **prompt inicial** con detalles específicos que quieres en la historia
4. Haz clic en **"Crear Historia Interactiva"**

### 2. Interactuar con la Historia

1. **Lee el capítulo** generado por la IA
2. **Elige una decisión** de las opciones propuestas, o
3. **Describe tu propia acción** en el campo de texto
4. Haz clic en **"Continuar Historia"** para ver las consecuencias
5. La historia se adapta a tus decisiones y genera nuevos capítulos

### 3. Explorar Personajes

- Observa los **personajes generados** con personalidades únicas
- Cada personaje tiene:
  - Nombre y rol
  - Personalidad y descripción
  - Motivaciones y relaciones

### 4. Disfrutar la Experiencia

- Cada historia es **única** y se desarrolla según tus decisiones
- Explora **diferentes caminos narrativos**
- Crea **múltiples historias** con diferentes géneros y temas

## 🔧 Estructura del Proyecto

```
proyecto-api-IA/
├── server/
│   ├── index.js                    # Servidor Express principal
│   └── services/
│       └── narrativeAgent.js       # Agente generador de narrativas
├── client/
│   ├── public/
│   │   └── index.html             # HTML principal
│   ├── src/
│   │   ├── App.js                 # Componente principal React
│   │   ├── App.css                # Estilos de la aplicación
│   │   ├── index.js               # Punto de entrada React
│   │   └── index.css              # Estilos globales
│   └── package.json               # Dependencias del frontend
├── .env                           # Variables de entorno (crear manualmente)
├── .gitignore                     # Archivos ignorados por Git
├── package.json                   # Dependencias del backend
└── README.md                      # Este archivo
```

## 🔌 API Endpoints

### `GET /api/health`
Verifica el estado del servidor.

**Respuesta:**
```json
{
  "status": "ok",
  "message": "Agente de Narrativas Interactivas funcionando"
}
```

### `POST /api/story/create`
Crea una nueva historia interactiva.

**Body:**
```json
{
  "genre": "ciencia ficción",
  "theme": "Un científico que descubre un portal",
  "initialPrompt": "Incluye elementos de viaje en el tiempo",
  "userPreferences": {}
}
```

**Respuesta:**
```json
{
  "success": true,
  "storyId": "story_1234567890_abc123",
  "story": {
    "id": "story_1234567890_abc123",
    "genre": "ciencia ficción",
    "theme": "Un científico que descubre un portal",
    "currentChapter": 0,
    "chapters": [...],
    "characters": [...]
  }
}
```

### `POST /api/story/:storyId/continue`
Continúa la historia con una decisión del usuario.

**Body:**
```json
{
  "decision": "Investigar el portal más a fondo",
  "userAction": "Decido usar mi equipo científico"
}
```

**Respuesta:**
```json
{
  "success": true,
  "story": {...},
  "newChapter": {...}
}
```

### `GET /api/story/:storyId`
Obtiene el estado actual de una historia.

### `POST /api/story/:storyId/character`
Genera un nuevo personaje para la historia.

**Body:**
```json
{
  "characterPrompt": "Un aliado misterioso con poderes especiales"
}
```

## 🎨 Características del Diseño

- **Gradientes modernos**: Diseño visualmente atractivo con gradientes
- **Responsive**: Funciona perfectamente en móviles, tablets y desktop
- **Animaciones suaves**: Transiciones y efectos visuales fluidos
- **Iconografía moderna**: Iconos de Lucide React
- **UX intuitiva**: Interfaz clara y fácil de usar
- **Modo oscuro/claro**: Adaptación automática según el contexto

## 🔮 Mejoras Futuras

- **Generación de Imágenes**: Ilustraciones generadas por IA para cada capítulo
- **Síntesis de Voz**: Narración de audio con voces realistas
- **Múltiples Finales**: Sistema de finales alternativos basados en decisiones acumulativas
- **Modo Colaborativo**: Múltiples usuarios creando historias juntos
- **Biblioteca de Historias**: Guardar y compartir historias creadas
- **Exportación**: Exportar historias como libros electrónicos o PDFs
- **Análisis de Narrativa**: Estadísticas sobre tus decisiones y caminos tomados
- **Generación de Música**: Bandas sonoras personalizadas para cada historia
- **Base de Datos**: Persistencia de historias en MongoDB o PostgreSQL
- **Autenticación**: Sistema de usuarios para guardar historias personales

## 📝 Notas Importantes

- Este proyecto utiliza la API de OpenAI, que requiere créditos
- El modelo por defecto es GPT-4 Turbo, pero puedes cambiarlo en `.env`
- Las historias se almacenan en memoria durante la sesión (en producción usarías una base de datos)
- Cada historia es única y generada dinámicamente, nunca se repite exactamente igual
- Los costos de OpenAI varían según el uso (aproximadamente $0.01 por 1,000 tokens)

## 🐛 Solución de Problemas

### Error: "OPENAI_API_KEY is not defined"
- Verifica que el archivo `.env` existe en la raíz del proyecto
- Asegúrate de que contiene `OPENAI_API_KEY=tu_clave_real`
- No debe haber espacios alrededor del `=`

### Error: "spawn cmd.exe ENOENT" (Windows/PowerShell)
- Ejecuta los comandos en terminales separadas (ver sección "Uso")
- O usa Command Prompt (cmd.exe) en lugar de PowerShell

### Puerto 3000 o 5000 ya en uso
- Cambia el puerto en `.env` (PORT=5001)
- O detén otros procesos que usen esos puertos

### La historia no se genera
- Verifica que tu API Key es válida y tiene créditos
- Revisa la consola del servidor para ver errores específicos
- Asegúrate de que el modelo especificado está disponible

## 🤝 Contribuciones

Este es un proyecto educativo. Las contribuciones y mejoras son bienvenidas.

## 📄 Licencia

MIT

## 🎯 ¿Por qué es Revolucionario?

Este proyecto es único porque:

1. **No es un Chat**: No es una conversación simple, es un generador completo de narrativas interactivas
2. **Adaptación Real**: La historia se adapta genuinamente a tus decisiones, no solo responde
3. **Personajes Complejos**: Los personajes tienen personalidades, motivaciones y relaciones que evolucionan
4. **Narrativa Ramificada**: Múltiples caminos narrativos que se generan dinámicamente
5. **Experiencia Inmersiva**: Diseñado para sumergirte completamente en la historia

### Basado en Papers Modernos de 2025

- Sistemas de narrativa generativa con IA
- Agentes autónomos para creación de contenido
- Modelos de lenguaje para storytelling interactivo
- Sistemas adaptativos de narrativa ramificada
- Generación procedural de contenido narrativo

---

**Desarrollado con ❤️ usando las tecnologías más avanzadas de 2025**
