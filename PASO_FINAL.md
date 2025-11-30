# PASO FINAL - Integrar MusicPlayer

## Archivos Creados ✅
- `client/src/services/audioEngine.js`
- `client/src/components/MusicPlayer.js`
- `client/src/components/MusicPlayer.css`

## Paso 1: Añadir Import

Abre `client/src/App.js` y en la línea 4, después de:
```javascript
import { BookOpen, Loader, Sparkles, Users, ChevronRight, Play, RotateCcw, UserPlus } from 'lucide-react';
```

Añade esta línea:
```javascript
import MusicPlayer from './components/MusicPlayer';
```

## Paso 2: Añadir Componente

Busca la línea 124 que dice:
```javascript
            </button>
          </header>
```

Cámbiala por:
```javascript
            </button>
            <MusicPlayer storyId={story?.id} genre={story?.genre} />
          </header>
```

## ¡Listo!

Guarda el archivo y la aplicación se recargará automáticamente.

Crea una historia y verás el reproductor de música en el header.
Haz clic en Play para escuchar música (intentará Freesound primero, luego usará generativa).
