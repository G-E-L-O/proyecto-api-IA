import React, { useState } from 'react';
import axios from 'axios';
import './App.css';
import { BookOpen, Loader, Sparkles, Users, ChevronRight, Play, RotateCcw, UserPlus } from 'lucide-react';

function App() {
  const [mode, setMode] = useState('create'); // 'create' o 'story'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Formulario de creación
  const [genre, setGenre] = useState('ciencia ficción');
  const [theme, setTheme] = useState('');
  const [initialPrompt, setInitialPrompt] = useState('');
  
  // Historia activa
  const [story, setStory] = useState(null);
  const [selectedDecision, setSelectedDecision] = useState(null);
  const [userAction, setUserAction] = useState('');

  const genres = [
    'ciencia ficción',
    'fantasía',
    'misterio',
    'aventura',
    'terror',
    'romance',
    'drama',
    'thriller',
    'histórico',
    'distopía'
  ];

  const handleCreateStory = async (e) => {
    e.preventDefault();
    
    if (!theme.trim()) {
      setError('Por favor, ingresa un tema para tu historia');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.post('http://localhost:5000/api/story/create', {
        genre,
        theme: theme.trim(),
        initialPrompt: initialPrompt.trim() || undefined
      });

      setStory(response.data.story);
      setMode('story');
      console.log('Historia creada:', response.data);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Error al crear la historia');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleContinueStory = async () => {
    if (!selectedDecision && !userAction.trim()) {
      setError('Por favor, selecciona una decisión o describe una acción');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(
        `http://localhost:5000/api/story/${story.id}/continue`,
        {
          decision: selectedDecision || userAction.trim(),
          userAction: userAction.trim() || undefined
        }
      );

      setStory(response.data.story);
      setSelectedDecision(null);
      setUserAction('');
      
      // Scroll al nuevo capítulo
      setTimeout(() => {
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
      }, 100);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Error al continuar la historia');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleNewStory = () => {
    setStory(null);
    setMode('create');
    setTheme('');
    setInitialPrompt('');
    setSelectedDecision(null);
    setUserAction('');
    setError(null);
  };

  const currentChapter = story ? story.chapters[story.currentChapter] : null;

  if (mode === 'story' && story) {
    return (
      <div className="App story-mode">
        <div className="container">
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
          </header>

          <main className="story-content">
            {error && (
              <div className="error-message">
                <p>{error}</p>
              </div>
            )}

            {/* Mostrar todos los capítulos */}
            {story.chapters.map((chapter, idx) => (
              <div key={idx} className={`chapter ${idx === story.currentChapter ? 'current' : ''}`}>
                <div className="chapter-header">
                  <h2>Capítulo {chapter.chapter || idx + 1}</h2>
                </div>
                
                <div className="chapter-content">
                  {chapter.content.split('\n\n').map((paragraph, pIdx) => (
                    paragraph.trim() && (
                      <p key={pIdx} className="story-text">{paragraph}</p>
                    )
                  ))}
                </div>

                {chapter.atmosphere && (
                  <div className="atmosphere">
                    <Sparkles size={16} />
                    <em>{chapter.atmosphere}</em>
                  </div>
                )}

                {/* Decisiones solo en el capítulo actual */}
                {idx === story.currentChapter && chapter.decisions && chapter.decisions.length > 0 && (
                  <div className="decisions-section">
                    <h3>¿Qué decides hacer?</h3>
                    <div className="decisions-grid">
                      {chapter.decisions.map((decision, dIdx) => (
                        <button
                          key={dIdx}
                          className={`decision-btn ${selectedDecision === decision.text ? 'selected' : ''}`}
                          onClick={() => {
                            setSelectedDecision(decision.text);
                            setUserAction('');
                          }}
                          disabled={loading}
                        >
                          <ChevronRight size={20} />
                          <div>
                            <strong>{decision.text}</strong>
                            {decision.hint && <span className="hint">{decision.hint}</span>}
                          </div>
                        </button>
                      ))}
                    </div>

                    <div className="custom-action">
                      <label>O describe tu propia acción:</label>
                      <textarea
                        value={userAction}
                        onChange={(e) => {
                          setUserAction(e.target.value);
                          setSelectedDecision(null);
                        }}
                        placeholder="Describe qué quieres hacer..."
                        rows="2"
                        disabled={loading}
                      />
                    </div>

                    <button
                      className="btn-continue"
                      onClick={handleContinueStory}
                      disabled={loading || (!selectedDecision && !userAction.trim())}
                    >
                      {loading ? (
                        <>
                          <Loader className="spinner" size={20} />
                          Generando siguiente capítulo...
                        </>
                      ) : (
                        <>
                          <Play size={20} />
                          Continuar Historia
                        </>
                      )}
                    </button>
                  </div>
                )}

                {chapter.cliffhanger && idx === story.currentChapter && (
                  <div className="cliffhanger">
                    <Sparkles size={20} />
                    <p>{chapter.cliffhanger}</p>
                  </div>
                )}
              </div>
            ))}

            {/* Panel de personajes */}
            {story.characters && story.characters.length > 0 && (
              <div className="characters-panel">
                <h3>
                  <Users size={20} />
                  Personajes
                </h3>
                <div className="characters-grid">
                  {story.characters.map((character, idx) => (
                    <div key={idx} className="character-card">
                      <h4>{character.name}</h4>
                      <span className="character-role">{character.role}</span>
                      <p className="character-personality">{character.personality}</p>
                      {character.description && (
                        <p className="character-description">{character.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </main>

          <footer className="footer">
            <p>Powered by OpenAI API • Narrativas Interactivas con IA 2025</p>
          </footer>
        </div>
      </div>
    );
  }

  // Modo de creación
  return (
    <div className="App create-mode">
      <div className="container">
        <header className="header">
          <div className="header-icon">
            <BookOpen size={40} />
          </div>
          <h1>Agente de Narrativas Interactivas</h1>
          <p className="subtitle">Crea historias inmersivas con IA - Proyecto Revolucionario 2025</p>
        </header>

        <main className="main-content">
          <form onSubmit={handleCreateStory} className="story-form">
            <div className="form-group">
              <label htmlFor="genre">
                <Sparkles size={20} />
                Género de la Historia
              </label>
              <select
                id="genre"
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                disabled={loading}
              >
                {genres.map(g => (
                  <option key={g} value={g}>{g.charAt(0).toUpperCase() + g.slice(1)}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="theme">
                <BookOpen size={20} />
                Tema o Concepto Principal *
              </label>
              <input
                id="theme"
                type="text"
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                placeholder="Ej: Un viajero del tiempo que debe prevenir una catástrofe"
                disabled={loading}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="initialPrompt">
                <Sparkles size={20} />
                Prompt Inicial (Opcional)
              </label>
              <textarea
                id="initialPrompt"
                value={initialPrompt}
                onChange={(e) => setInitialPrompt(e.target.value)}
                placeholder="Describe elementos específicos que quieres en la historia: personajes, escenarios, conflictos..."
                rows="4"
                disabled={loading}
              />
            </div>

            {error && (
              <div className="error-message">
                <p>{error}</p>
              </div>
            )}

            <div className="form-actions">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading || !theme.trim()}
              >
                {loading ? (
                  <>
                    <Loader className="spinner" size={20} />
                    Creando tu historia...
                  </>
                ) : (
                  <>
                    <Play size={20} />
                    Crear Historia Interactiva
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="info-box">
            <h3>✨ ¿Cómo funciona?</h3>
            <ul>
              <li>La IA crea una historia completa con personajes, trama y decisiones</li>
              <li>Tú eliges qué hacer en cada momento crucial</li>
              <li>La historia se adapta a tus decisiones y se ramifica</li>
              <li>Cada historia es única y se desarrolla según tus elecciones</li>
            </ul>
          </div>
        </main>

        <footer className="footer">
          <p>Powered by OpenAI API • Tecnología de Vanguardia 2025</p>
        </footer>
      </div>
    </div>
  );
}

export default App;
