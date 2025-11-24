# 🚀 Guía de Instalación Completa

## Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:

- **Node.js** (versión 16 o superior)
  - Descargar: https://nodejs.org/
  - Verificar instalación: `node --version`
- **npm** (viene con Node.js)
  - Verificar instalación: `npm --version`
- **Git** (opcional, para clonar el repositorio)
  - Descargar: https://git-scm.com/

## Paso 1: Obtener el Proyecto

### Opción A: Clonar desde Git
```bash
git clone <url-del-repositorio>
cd proyecto-api-IA
```

### Opción B: Descargar y Extraer
1. Descarga el proyecto como ZIP
2. Extrae el archivo
3. Abre una terminal en la carpeta extraída

## Paso 2: Instalar Dependencias

### Instalar Todo de Una Vez (Recomendado)

```bash
npm run install-all
```

Este comando instalará las dependencias del backend y del frontend automáticamente.

### Instalar por Separado

**Backend:**
```bash
npm install
```

**Frontend:**
```bash
cd client
npm install
cd ..
```

## Paso 3: Configurar Variables de Entorno

### Crear el archivo `.env`

Crea un archivo llamado `.env` en la raíz del proyecto (mismo nivel que `package.json`).

**En Windows (PowerShell):**
```powershell
New-Item -Path .env -ItemType File
```

**En Windows (CMD):**
```cmd
type nul > .env
```

**En Linux/Mac:**
```bash
touch .env
```

### Obtener API Key de OpenAI

1. Ve a: https://platform.openai.com/
2. Inicia sesión o crea una cuenta
3. Navega a: https://platform.openai.com/api-keys
4. Haz clic en **"Create new secret key"**
5. Dale un nombre descriptivo (ej: "Proyecto Narrativas")
6. **Copia la clave inmediatamente** - solo se muestra una vez
   - Formato: `sk-proj-abc123xyz789...`

### Configurar el archivo `.env`

Abre el archivo `.env` con cualquier editor de texto y agrega:

```env
OPENAI_API_KEY=sk-proj-tu-clave-real-aqui
OPENAI_MODEL=gpt-4-turbo-preview
PORT=5000
```

**⚠️ IMPORTANTE:**
- Reemplaza `sk-proj-tu-clave-real-aqui` con tu API Key real
- No agregues comillas alrededor del valor
- No dejes espacios alrededor del signo `=`
- El archivo `.env` ya está en `.gitignore` para proteger tu clave

**Ejemplo de archivo `.env` correcto:**
```env
OPENAI_API_KEY=sk-proj-1234567890abcdefghijklmnopqrstuvwxyz
OPENAI_MODEL=gpt-4-turbo-preview
PORT=5000
```

## Paso 4: Verificar la Instalación

### Verificar que Node.js funciona
```bash
node --version
# Debería mostrar: v16.x.x o superior
```

### Verificar que npm funciona
```bash
npm --version
# Debería mostrar: 8.x.x o superior
```

### Verificar estructura del proyecto
```bash
# Deberías ver estas carpetas y archivos:
# - server/
# - client/
# - package.json
# - .env (que acabas de crear)
```

## Paso 5: Iniciar la Aplicación

### Opción 1: Ejecutar por Separado (Recomendado)

Abre **dos terminales** en la raíz del proyecto:

**Terminal 1 - Backend:**
```bash
npm run server
```

Deberías ver:
```
🚀 Servidor ejecutándose en http://localhost:5000
📖 Agente de Narrativas Interactivas listo
✨ Crea historias inmersivas con IA
```

**Terminal 2 - Frontend:**
```bash
npm run client
```

El navegador se abrirá automáticamente en http://localhost:3000

### Opción 2: Ejecutar Ambos Juntos

```bash
npm run dev
```

**Nota:** En Windows con PowerShell, si obtienes el error `spawn cmd.exe ENOENT`, usa la Opción 1.

## Paso 6: Verificar que Funciona

1. **Backend funcionando:**
   - Abre: http://localhost:5000/api/health
   - Deberías ver: `{"status":"ok","message":"Agente de Narrativas Interactivas funcionando"}`

2. **Frontend funcionando:**
   - Abre: http://localhost:3000
   - Deberías ver la interfaz de creación de historias

3. **Probar creación de historia:**
   - Selecciona un género
   - Ingresa un tema
   - Haz clic en "Crear Historia Interactiva"
   - Deberías ver una historia generada

## Solución de Problemas Comunes

### Error: "Cannot find module"
```bash
# Reinstalar dependencias
npm install
cd client
npm install
cd ..
```

### Error: "OPENAI_API_KEY is not defined"
- Verifica que el archivo `.env` existe en la raíz
- Verifica que no hay espacios alrededor del `=`
- Verifica que la API Key es correcta
- Reinicia el servidor después de crear/modificar `.env`

### Error: "spawn cmd.exe ENOENT" (Windows)
- Usa la Opción 1 (dos terminales separadas)
- O usa Command Prompt en lugar de PowerShell

### Puerto 3000 o 5000 ya en uso
```bash
# Cambiar puerto en .env
PORT=5001

# O detener procesos que usan esos puertos
# Windows:
netstat -ano | findstr :5000
taskkill /PID <numero> /F
```

### La historia no se genera
- Verifica que tu API Key tiene créditos
- Verifica que el modelo especificado está disponible
- Revisa la consola del servidor para errores específicos

## Próximos Pasos

Una vez que la aplicación esté funcionando:

1. Lee el [README.md](../README.md) para entender cómo usar la aplicación
2. Revisa la [Documentación de la API](API.md) para entender los endpoints
3. Explora el código en `server/` y `client/src/` para entender la estructura

## Recursos Adicionales

- **OpenAI API Docs**: https://platform.openai.com/docs
- **React Docs**: https://react.dev/
- **Express Docs**: https://expressjs.com/
- **Node.js Docs**: https://nodejs.org/docs

---

¡Listo para crear historias épicas! 📖✨



