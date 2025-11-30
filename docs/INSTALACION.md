# Guía de Instalación

## Requisitos del Sistema

- **Node.js** 16 o superior ([descargar](https://nodejs.org/))
- **npm** 8 o superior (incluido con Node.js)
- **API Key de Google Gemini** ([obtener](https://aistudio.google.com/app/apikey))

## Proceso de Instalación

### Paso 1: Clonar el Repositorio

```bash
git clone <url-del-repositorio>
cd proyecto-api-IA
```

### Paso 2: Instalación de Dependencias

**Método Recomendado:**

```bash
npm run install-all
```

Este comando instalará automáticamente todas las dependencias necesarias para el backend y frontend.

**Método Alternativo:**

```bash
# Backend
npm install

# Frontend
cd client
npm install
cd ..
```

### Paso 3: Configuración de Variables de Entorno

Crear un archivo `.env` en la raíz del proyecto con el siguiente contenido:

```env
GEMINI_API_KEY=tu-api-key-de-gemini
PORT=5000
```

**Obtener API Key de Google Gemini:**

1. Acceder a [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Iniciar sesión con cuenta de Google
3. Seleccionar "Create API key"
4. Copiar la clave generada y agregarla al archivo `.env`

**Importante:** Este proyecto utiliza exclusivamente el plan gratuito de Gemini (Flash) y no consume tokens de planes de pago.

### Paso 4: Iniciar la Aplicación

**Desarrollo con Terminales Separadas (Recomendado):**

Terminal 1 - Servidor Backend:
```bash
npm run server
```

Terminal 2 - Cliente Frontend:
```bash
npm run client
```

**Desarrollo con Proceso Unificado:**

```bash
npm run dev
```

### Paso 5: Verificación

Una vez iniciados los servicios:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000/api/health

El endpoint de health check debería retornar:
```json
{
  "status": "ok",
  "message": "Agente de Narrativas Interactivas funcionando"
}
```

## Solución de Problemas

### Error: GEMINI_API_KEY no está definida

**Causas posibles:**
- El archivo `.env` no existe en la raíz del proyecto
- La variable está mal escrita o tiene espacios
- El servidor no fue reiniciado después de crear el archivo

**Solución:**
1. Verificar que el archivo `.env` existe en la raíz (mismo nivel que `package.json`)
2. Confirmar que el formato es correcto: `GEMINI_API_KEY=tu-clave-sin-espacios`
3. Reiniciar el servidor backend

### Puerto en Uso

Si los puertos 3000 o 5000 están ocupados:

```bash
# Modificar el archivo .env
PORT=5001
```

O detener el proceso que está usando el puerto:

```bash
# Windows PowerShell
netstat -ano | findstr :5000
taskkill /PID <numero> /F
```

### Error de Cuota Excedida

Si aparece un error relacionado con límites de cuota:

1. Verificar el uso actual en [Google AI Studio](https://aistudio.google.com/)
2. Esperar unos minutos si es un límite temporal de tasa
3. Confirmar que estás usando el modelo gratuito (Flash)

## Próximos Pasos

Una vez completada la instalación:

1. Consultar la [Documentación de la API](API.md) para entender los endpoints disponibles
2. Revisar la [Arquitectura del Sistema](ARQUITECTURA.md) para comprender la estructura
3. Explorar el código fuente en `server/` y `client/src/` para personalizar la aplicación
