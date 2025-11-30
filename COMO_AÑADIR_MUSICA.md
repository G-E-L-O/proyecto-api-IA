# Cómo Añadir el Reproductor de Música

Los archivos del sistema de música ya están creados:
- ✅ `client/src/services/audioEngine.js`
- ✅ `client/src/components/MusicPlayer.js`
- ✅ `client/src/components/MusicPlayer.css`

## Paso 1: Añadir Import en App.js

Abre `client/src/App.js` y añade esta línea después de las otras importaciones (alrededor de la línea 4):

```javascript
import MusicPlayer from './components/MusicPlayer';
```

## Paso 2: Añadir el Componente

Busca la línea que dice `<header className="story-header">` (alrededor de la línea 110).

Justo DESPUÉS del botón "Nueva Historia" y ANTES del cierre `</header>`, añade:

```javascript
<MusicPlayer storyId={story?.id} genre={story?.genre} />
```

Debería quedar así:

```javascript
<header className="story-header">
  <div className="story-title-section">
    <h1>{currentChapter?.title || 'Tu Historia Interactiva'}</h1>
    <div className="story-meta">
      <span className="genre-badge">{story.genre}</span>
      <span className="chapter-counter">Capítulo {story.currentChapter + 1} de {story.chapters.length}</span>
    </div>
  </div>
  <button className="btn-new-story" onClick={handleNewStory}>
    <RotateCcw size={18} />
    Nueva Historia
  </button>
  <MusicPlayer storyId={story?.id} genre={story?.genre} />
</header>
```

## Paso 3: Guardar y Probar

1. Guarda el archivo
2. La aplicación se recargará automáticamente
3. Crea una historia
4. Verás el reproductor de música en el header
5. Haz clic en Play para escuchar música

## ¿Qué hace el sistema?

1. **Intenta cargar un sample de Freesound** basado en el género
2. Si encuentra uno, lo reproduce (mostrará "Freesound")
3. Si no encuentra o falla, usa música generativa (mostrará "Generativa")

¡Eso es todo! El sistema está completo y funcionando.
