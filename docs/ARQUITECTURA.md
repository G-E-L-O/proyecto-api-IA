# Arquitectura del Sistema

## Visión General

Este proyecto implementa una arquitectura cliente-servidor con separación clara de responsabilidades entre el frontend (React) y el backend (Express.js), utilizando Google Gemini API para la generación de contenido narrativo.

```
┌─────────────────┐         HTTP/REST         ┌─────────────────┐
│   React         │ ◄──────────────────────► │   Express.js    │
│   Frontend      │                           │   Backend       │
│   (Puerto 3000) │                           │   (Puerto 5000) │
└─────────────────┘                           └────────┬────────┘
                                                       │
                                                       ▼
                                              ┌─────────────────┐
                                              │  Google Gemini  │
                                              │      API        │
                                              └─────────────────┘
```

## Arquitectura de Componentes

### Backend

**Servidor Express (`server/index.js`)**
- Manejo de rutas y middleware
- Gestión de estado de historias en memoria
- Validación de solicitudes
- Manejo centralizado de errores

**Servicio de IA (`server/services/aiProvider.js`)**
- Abstraction layer para Google Gemini API
- Manejo de configuración de modelos
- Gestión de errores y reintentos

**Agente Narrativo (`server/services/narrativeAgent.js`)**
- Lógica de generación de historias
- Construcción de prompts para la IA
- Procesamiento de respuestas de Gemini
- Gestión de contexto narrativo

### Frontend

**Aplicación React (`client/src/App.js`)**
- Gestión de estado de la aplicación
- Comunicación con la API backend
- Renderizado de interfaces de usuario
- Manejo de interacciones del usuario

## Flujo de Datos

### Creación de Historia

1. Usuario completa formulario en la interfaz React
2. Frontend envía solicitud POST a `/api/story/create`
3. Backend valida parámetros y llama a `narrativeAgent.createStory()`
4. `aiProvider` genera prompt estructurado y llama a Gemini API
5. Respuesta de Gemini se procesa y estructura como objeto JSON
6. Historia formateada se almacena en memoria y se retorna al frontend
7. Frontend actualiza la UI con la historia generada

### Continuación de Historia

1. Usuario selecciona decisión o ingresa acción personalizada
2. Frontend envía POST a `/api/story/:storyId/continue`
3. Backend recupera contexto de la historia desde almacenamiento en memoria
4. `narrativeAgent.continueStory()` construye prompt con contexto completo
5. Nuevo capítulo se genera y se integra a la historia existente
6. Historia actualizada se retorna al frontend

## Almacenamiento

**Desarrollo Actual:**
- Almacenamiento en memoria mediante `Map` de JavaScript
- Clave: `storyId` único
- Valor: Objeto completo de la historia
- Duración: Mientras el servidor esté activo

**Consideraciones para Producción:**
- Implementar persistencia con base de datos (MongoDB, PostgreSQL)
- Sistema de cache para historias frecuentemente accedidas
- Limpieza automática de historias inactivas

## Tecnologías y Dependencias

### Backend
- **Express.js**: Framework web minimalista y flexible
- **@google/generative-ai**: SDK oficial de Google Gemini
- **dotenv**: Gestión de variables de entorno
- **cors**: Habilitación de Cross-Origin Resource Sharing

### Frontend
- **React 18**: Biblioteca para construcción de interfaces de usuario
- **Axios**: Cliente HTTP para comunicación con la API
- **Lucide React**: Biblioteca de iconos SVG

## Configuración del Modelo de IA

El sistema utiliza Google Gemini Flash (plan gratuito) por defecto, configurable mediante variables de entorno:

- `GEMINI_API_KEY`: Clave de API requerida
- `GEMINI_FREE_MODEL`: Modelo a utilizar (default: `gemini-2.5-flash`)

## Seguridad

- Las claves API se manejan mediante variables de entorno
- El archivo `.env` está excluido del control de versiones
- Validación de entrada en todos los endpoints
- Manejo seguro de errores sin exponer información sensible

## Escalabilidad

**Limitaciones Actuales:**
- Almacenamiento en memoria (no persistente)
- Sin sistema de autenticación
- Sin limitación de rate limiting por usuario

**Mejoras Recomendadas para Producción:**
- Base de datos para persistencia
- Sistema de autenticación y autorización
- Rate limiting y throttling
- Sistema de cache distribuido
- Logging y monitoreo
