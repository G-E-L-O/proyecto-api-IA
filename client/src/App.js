import React, { useState } from 'react';
import axios from 'axios';
import { BookOpen, Loader, Sparkles, Play } from 'lucide-react';
import ScrollBook from './components/ScrollBook';
import StoryControls from './components/StoryControls';
import MusicPlayer from './components/MusicPlayer';
import './App.css';

function App() {
  const [mode, setMode] = useState('create'); // 'create' o 'story'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fontSize, setFontSize] = useState(1.1); // Default font size

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

  const handleContinueStory = async (decisionText = null) => {
    // Si se pasa un decisionText, es una decisión de la IA, si no, usar acción personalizada
    const decision = decisionText || (userAction.trim() ? userAction.trim() : selectedDecision);
    
    if (!decision || !decision.trim()) {
      setError('Por favor, selecciona una decisión o describe una acción');
      return;
    }

    if (!story || !story.id) {
      setError('No hay una historia activa');
      return;
    }

    if (loading) {
      return; // Prevenir múltiples llamadas
    }

    setLoading(true);
    setError(null);
    
    // Actualizar selectedDecision si se pasó por parámetro (decisión de la IA)
    if (decisionText) {
      setSelectedDecision(decisionText);
      setUserAction(''); // Limpiar acción personalizada
    }

    try {
      const response = await axios.post(
        `http://localhost:5000/api/story/${story.id}/continue`,
        {
          decision: decision.trim(),
          userAction: decisionText ? undefined : userAction.trim() || undefined
        }
      );

      // Validar y loggear la respuesta antes de actualizar
      console.log('📥 Respuesta del servidor recibida:', response.data);
      console.log('📚 Historia completa:', response.data.story);
      console.log(`📖 Total de capítulos: ${response.data.story?.chapters?.length || 0}`);
      console.log(`📄 Capítulo actual: ${response.data.story?.currentChapter || 0}`);
      
      const updatedStory = response.data.story;
      const currentChapterIndex = updatedStory?.currentChapter || 0;
      const currentChapterData = updatedStory?.chapters?.[currentChapterIndex];
      
      console.log('📄 Datos del capítulo actual:', currentChapterData);
      console.log(`📝 Tiene content: ${!!currentChapterData?.content}`);
      console.log(`📝 Longitud del content: ${currentChapterData?.content ? currentChapterData.content.length : 0}`);
      
      if (!currentChapterData?.content || currentChapterData.content.trim().length === 0) {
        console.error('❌ ERROR: El capítulo actual no tiene contenido válido');
        console.error('Estructura del capítulo:', JSON.stringify(currentChapterData, null, 2));
        setError('Error: El capítulo generado no tiene contenido. Por favor, intenta continuar la historia nuevamente.');
        return;
      }
      
      setStory(updatedStory);
      setSelectedDecision(null);
      setUserAction('');
      
      // Scroll al nuevo capítulo
      setTimeout(() => {
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
      }, 100);
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || err.message || 'Error al continuar la historia');
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

  const currentChapter = story && story.chapters && story.chapters[story.currentChapter] ? story.chapters[story.currentChapter] : null;
  const isBookOpen = mode === 'story' || loading;

  return (
    <div className="App">
      {/* Background Elements */}
      <div className="floating-elements">
        <div className="float-item item-1">A</div>
        <div className="float-item item-2">I</div>
        <div className="float-item item-3">Story</div>
        <div className="float-item item-4"><Sparkles size={40} /></div>
        <div className="float-item item-5"><BookOpen size={60} /></div>
      </div>

      <div className="book-stage">
        <ScrollBook isOpen={isBookOpen}>
          {!isBookOpen ? (
            /* --- CLOSED STATE: CREATE FORM (ON COVER) --- */
            <div className="cover-content">
              <div className="cover-header">
                <img src="/logo192.png" alt="Logo" className="cover-logo" />
                <h2>AI Storyteller</h2>
              </div>
              
              <form onSubmit={handleCreateStory} className="cover-form">
                {error && (
                  <div className="error-message" style={{ 
                    color: '#f43f5e', 
                    padding: '10px', 
                    marginBottom: '15px',
                    backgroundColor: error.includes('Límite de cuota') ? 'rgba(251, 191, 36, 0.1)' : 'rgba(244, 63, 94, 0.1)',
                    borderRadius: '8px',
                    border: `1px solid ${error.includes('Límite de cuota') ? 'rgba(251, 191, 36, 0.3)' : 'rgba(244, 63, 94, 0.3)'}`,
                    fontSize: '0.9rem',
                    lineHeight: '1.5'
                  }}>
                    <strong>{error.includes('Límite de cuota') ? '⏳ ' : '❌ '}</strong>
                    {error}
                    {error.includes('Límite de cuota') && (
                      <div style={{ 
                        marginTop: '8px', 
                        fontSize: '0.8rem',
                        color: '#64748b',
                        fontStyle: 'italic'
                      }}>
                        💡 El límite del plan gratuito es de 10 solicitudes por minuto. Espera unos momentos e intenta de nuevo.
                      </div>
                    )}
                  </div>
                )}
                
                <div className="form-group">
                  <label>Género</label>
                  <select value={genre} onChange={(e) => setGenre(e.target.value)}>
                    {genres.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>

                <div className="form-group">
                  <label>Tema</label>
                  <input 
                    type="text" 
                    value={theme} 
                    onChange={(e) => {
                      setTheme(e.target.value);
                      if (error) setError(null); // Limpiar error al escribir
                    }} 
                    placeholder="Ej: Cyberpunk..." 
                    required 
                  />
                </div>

                <button type="submit" className="btn-start">
                  {loading ? <Loader className="spin" /> : <Play fill="currentColor" />}
                  <span>Iniciar</span>
                </button>
              </form>
            </div>
          ) : (
            /* --- OPEN STATE: STORY CONTENT (ON PAGES) --- */
            <div className="page-content">
              {error && (
                <div className="error-message" style={{ 
                  color: '#f43f5e', 
                  padding: '15px', 
                  marginBottom: '20px',
                  backgroundColor: error.includes('Límite de cuota') ? 'rgba(251, 191, 36, 0.1)' : 'rgba(244, 63, 94, 0.1)',
                  borderRadius: '8px',
                  border: `1px solid ${error.includes('Límite de cuota') ? 'rgba(251, 191, 36, 0.3)' : 'rgba(244, 63, 94, 0.3)'}`,
                  fontSize: '0.95rem',
                  lineHeight: '1.5'
                }}>
                  <strong>{error.includes('Límite de cuota') ? '⏳ ' : '❌ '}</strong>
                  {error}
                  {error.includes('Límite de cuota') && (
                    <div style={{ 
                      marginTop: '10px', 
                      fontSize: '0.85rem',
                      color: '#64748b',
                      fontStyle: 'italic'
                    }}>
                      💡 La aplicación intentará continuar automáticamente cuando el límite se restablezca.
                    </div>
                  )}
                </div>
              )}
              
              {story && currentChapter ? (
                <>
                  <header className="page-header">
                    <h3>Capítulo {story.currentChapter + 1}</h3>
                    <span className="page-genre">{story.genre}</span>
                    {/* Music Player */}
                    <MusicPlayer 
                      storyId={story?.id} 
                      genre={story?.genre} 
                      currentChapter={story?.currentChapter}
                      atmosphere={currentChapter?.atmosphere}
                    />
                  </header>
                  
                  {/* Story Controls (TTS, Font Size, Copy) */}
                  <StoryControls 
                    text={currentChapter.content || ''} 
                    onFontSizeChange={setFontSize} 
                  />

                  <div className="story-text-scroll" style={{ fontSize: `${fontSize}rem` }}>
                    {currentChapter.content && currentChapter.content.trim().length > 0 ? (
                      currentChapter.content.split('\n').map((p, i) => (
                        p.trim() && <p key={i}>{p}</p>
                      ))
                    ) : (
                      <div style={{ 
                        padding: '20px',
                        textAlign: 'center',
                        color: '#94a3b8',
                        fontStyle: 'italic'
                      }}>
                        <p>⚠️ Contenido no disponible</p>
                        <p style={{ fontSize: '0.9rem', marginTop: '10px' }}>
                          El capítulo se está generando o hubo un error al cargar el contenido.
                        </p>
                        <button 
                          onClick={() => window.location.reload()} 
                          style={{
                            marginTop: '15px',
                            padding: '8px 16px',
                            backgroundColor: '#3b82f6',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer'
                          }}
                        >
                          Recargar Página
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="page-actions">
                    {currentChapter.decisions && currentChapter.decisions.length > 0 ? (
                      <>
                        {currentChapter.decisions.map((d, i) => {
                          const decisionText = typeof d === 'string' ? d : (d.text || d.decision || 'Continuar');
                          return (
                            <button 
                              key={i} 
                              onClick={(e) => {
                                e.preventDefault();
                                if (loading) return;
                                setSelectedDecision(decisionText);
                                setUserAction('');
                                handleContinueStory(decisionText);
                              }}
                              disabled={loading}
                              style={{
                                opacity: loading ? 0.6 : 1,
                                cursor: loading ? 'not-allowed' : 'pointer'
                              }}
                            >
                              {decisionText}
                            </button>
                          );
                        })}
                        
                        {/* Campo para acción personalizada */}
                        <div style={{ 
                          gridColumn: '1 / -1',
                          marginTop: '8px',
                          padding: '12px',
                          background: 'rgba(59, 130, 246, 0.05)',
                          borderRadius: '8px',
                          border: '1px solid rgba(59, 130, 246, 0.2)'
                        }}>
                          <label style={{ 
                            display: 'block',
                            marginBottom: '8px',
                            fontWeight: 'bold',
                            color: '#475569',
                            fontSize: '0.85rem'
                          }}>
                            O escribe tu propia acción:
                          </label>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <input
                              type="text"
                              value={userAction}
                              onChange={(e) => {
                                setUserAction(e.target.value);
                                setSelectedDecision(null);
                                if (error) setError(null);
                              }}
                              onKeyPress={(e) => {
                                if (e.key === 'Enter' && !loading && userAction.trim()) {
                                  e.preventDefault();
                                  handleContinueStory(null);
                                }
                              }}
                              placeholder="Ej: Decido huir corriendo hacia la casa..."
                              disabled={loading}
                              style={{
                                flex: 1,
                                padding: '10px 12px',
                                borderRadius: '6px',
                                border: '1px solid #cbd5e1',
                                fontSize: '0.9rem',
                                fontFamily: 'inherit',
                                opacity: loading ? 0.6 : 1
                              }}
                            />
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                if (loading || !userAction.trim()) return;
                                handleContinueStory(null);
                              }}
                              disabled={loading || !userAction.trim()}
                              style={{
                                padding: '10px 20px',
                                borderRadius: '6px',
                                border: 'none',
                                background: loading || !userAction.trim() ? '#94a3b8' : '#3b82f6',
                                color: 'white',
                                fontWeight: 'bold',
                                cursor: loading || !userAction.trim() ? 'not-allowed' : 'pointer',
                                fontSize: '0.9rem',
                                transition: 'all 0.2s',
                                whiteSpace: 'nowrap'
                              }}
                            >
                              Continuar
                            </button>
                          </div>
                        </div>
                      </>
                    ) : (
                      <p>No hay decisiones disponibles</p>
                    )}
                  </div>
                </>
              ) : story && !currentChapter ? (
                <div className="loading-page">
                  <p>Error: La historia no tiene capítulos disponibles</p>
                  <button onClick={handleNewStory} style={{
                    marginTop: '20px',
                    padding: '10px 20px',
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer'
                  }}>
                    Crear Nueva Historia
                  </button>
                </div>
              ) : (
                <div className="loading-page">
                  <Loader size={40} className="spin" />
                  <p>Escribiendo tu destino...</p>
                </div>
              )}
            </div>
          )}
        </ScrollBook>
      </div>
    </div>
  );
}

export default App;
