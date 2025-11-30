# Agente de Narrativas Interactivas con IA

Sistema de generación de narrativas interactivas mediante inteligencia artificial que permite crear historias dinámicas con personajes complejos, tramas ramificadas y decisiones que modifican el curso de la narrativa en tiempo real.

[![Node.js](https://img.shields.io/badge/Node.js-16+-339933?style=flat-square&logo=node.js)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)](https://reactjs.org/)
[![Express](https://img.shields.io/badge/Express-4.18-000000?style=flat-square&logo=express)](https://expressjs.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)

## Descripción

Este proyecto implementa una plataforma completa para la generación de narrativas interactivas utilizando Google Gemini. El sistema genera historias dinámicas donde cada decisión del usuario impacta significativamente el desarrollo narrativo, creando una experiencia única y personalizada.

- Google Gemini API (plan gratuito)
- dotenv para gestión de configuración

### Frontend
- React 18
- Axios para comunicación HTTP
- Lucide React para sistema de iconos
- Web Audio API para música ambiental procedural
- CSS3 con diseño responsive


## Requisitos del Sistema

- Node.js 16 o superior
- npm 8 o superior
- API Key de Google Gemini ([obtener aquí](https://aistudio.google.com/app/apikey))

## Instalación

### 1. Clonar el Repositorio

```bash
git clone <url-del-repositorio>
cd proyecto-api-IA
```

### 2. Instalar Dependencias

```bash
npm run install-all
```

Este comando instalará automáticamente las dependencias del backend y del frontend.

### 3. Configuración de Variables de Entorno

Crear un archivo `.env` en la raíz del proyecto:

```env
GEMINI_API_KEY=tu-api-key-de-gemini
PORT=5000
```

**Nota**: Este proyecto utiliza exclusivamente el plan gratuito de Google Gemini (Flash) y no consume tokens de planes de pago.

### 4. Ejecución

**Desarrollo:**

```bash
# Terminal 1: Servidor Backend
npm run server

# Terminal 2: Cliente Frontend
npm run client
```

**Alternativamente:**

```bash
npm run dev
```

La aplicación estará disponible en:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Documentación

Documentación adicional disponible en el directorio `docs/`:

- [Guía de Instalación](docs/INSTALACION.md) - Instrucciones detalladas de configuración
- [Documentación de API](docs/API.md) - Referencia completa de endpoints
- [Arquitectura](docs/ARQUITECTURA.md) - Diseño y estructura del sistema

## Estructura del Proyecto

```
proyecto-api-IA/
├── server/
│   ├── index.js                 # Servidor Express y definición de rutas
│   └── services/
│       ├── aiProvider.js        # Proveedor de servicios de IA
│       └── narrativeAgent.js    # Lógica de generación narrativa
├── client/
│   ├── src/
│   │   ├── App.js              # Componente principal de la aplicación
│   │   ├── App.css             # Estilos de la aplicación
│   │   ├── index.js            # Punto de entrada React
│   │   └── index.css           # Estilos globales
│   └── public/
├── docs/                        # Documentación del proyecto
│   ├── INSTALACION.md
│   ├── API.md
│   └── ARQUITECTURA.md
├── .env                         # Variables de entorno (no versionado)
├── .env.example                 # Plantilla de configuración
├── package.json                 # Dependencias y scripts del backend
└── README.md                    # Este archivo
```

## API Reference

### Health Check

```http
GET /api/health
```

Verifica el estado del servidor.

### Crear Historia

```http
POST /api/story/create
Content-Type: application/json

{
  "genre": "ciencia ficción",
  "theme": "Un científico que descubre un portal",
  "initialPrompt": "Incluye elementos de viaje en el tiempo"
}
```

### Continuar Historia

```http
POST /api/story/:storyId/continue
Content-Type: application/json

{
  "decision": "Investigar el portal más a fondo",
  "userAction": "Decido usar mi equipo científico"
}
```

### Obtener Historia

```http
GET /api/story/:storyId
```

Obtiene el estado actual de una historia.

Para documentación completa de la API, consultar [docs/API.md](docs/API.md).

## Solución de Problemas

### Error: GEMINI_API_KEY no está definida

Verificar que:
- El archivo `.env` existe en la raíz del proyecto
- Contiene la variable `GEMINI_API_KEY` con el valor correcto
- No hay espacios alrededor del signo `=`
- El servidor fue reiniciado después de modificar `.env`

### Error: Cuota excedida

El plan gratuito tiene límites de uso. Si se alcanza el límite:
- Verificar el uso en [Google AI Studio](https://aistudio.google.com/)
- Esperar unos minutos si es un límite temporal de tasa
- El sistema utiliza solo el modelo gratuito (Flash)

### Puerto en uso

Modificar el puerto en el archivo `.env`:

```env
PORT=5001
```

## Consideraciones de Desarrollo

- **Almacenamiento**: Las historias se mantienen en memoria durante la sesión. Para producción, implementar persistencia con base de datos.
- **Modelo de IA**: Utiliza Google Gemini Flash (plan gratuito) por defecto.
- **Seguridad**: Las claves API deben mantenerse en variables de entorno y nunca versionarse.

## Licencia

MIT License - ver archivo LICENSE para más detalles.

## Contribuciones

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## Soporte

Para reportar bugs o solicitar características, por favor abre un [issue](../../issues) en el repositorio.

---

Desarrollado con Google Gemini API
