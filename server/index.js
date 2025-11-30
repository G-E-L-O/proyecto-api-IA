const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// IMPORTANTE: Cargar variables de entorno ANTES de importar narrativeAgent
dotenv.config();

const { narrativeAgent } = require('./services/narrativeAgent');
const { freesoundService } = require('./services/freesoundService');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Almacenamiento en memoria de historias activas (en producción usarías una BD)
const activeStories = new Map();

// Ruta de salud
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Agente de Narrativas Interactivas funcionando' });
});

// Obtener samples de audio para un género
app.get('/api/music/samples/:genre', async (req, res) => {
  try {
    const { genre } = req.params;
    const duration = parseInt(req.query.duration) || 30;
    const mood = req.query.mood || '';

    console.log(`🎵 Buscando samples de audio para género: ${genre}, mood: ${mood}`);

    const sample = await freesoundService.searchSamples(genre, mood, duration);

    if (!sample) {
      return res.json({
        success: false,
        message: 'No se encontraron samples, usar música generativa'
      });
    }

    res.json({
      success: true,
      sample
    });

  } catch (error) {
    console.error('❌ Error obteniendo samples:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener samples de audio',
      message: error.message
    });
  }
});

// Crear una nueva historia interactiva
app.post('/api/story/create', async (req, res) => {
  try {
    const { genre, theme, initialPrompt, userPreferences } = req.body;

    if (!genre || !theme) {
      return res.status(400).json({ 
        error: 'Se requiere género y tema para crear la historia' 
      });
    }

    console.log(`📖 Creando nueva historia: ${genre} - ${theme}`);
    
    const storyId = `story_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const result = await narrativeAgent.createStory({
      genre,
      theme,
      initialPrompt,
      userPreferences
    });

    const storyData = {
      id: storyId,
      genre,
      theme,
      currentChapter: 0,
      chapters: [result],
      decisions: [],
      characters: result.characters || [],
      createdAt: new Date().toISOString()
    };

    activeStories.set(storyId, storyData);
    
    res.json({
      success: true,
      storyId: storyId,
      story: storyData
    });

  } catch (error) {
    console.error('❌ Error creando historia:', error);
    res.status(500).json({ 
      error: 'Error al crear la historia',
      message: error.message 
    });
  }
});

// Continuar historia con decisión del usuario
app.post('/api/story/:storyId/continue', async (req, res) => {
  try {
    const { storyId } = req.params;
    const { decision, userAction } = req.body;

    if (!activeStories.has(storyId)) {
      return res.status(404).json({ error: 'Historia no encontrada' });
    }

    const story = activeStories.get(storyId);

    console.log(`📚 Continuando historia ${storyId} con decisión: ${decision}`);

    const result = await narrativeAgent.continueStory({
      story,
      userDecision: decision,
      userAction: userAction
    });

    // Validar estructura del resultado antes de agregarlo
    console.log('📋 Estructura del capítulo recibido:');
    console.log(`  - Tiene content: ${!!result.content}`);
    console.log(`  - Longitud del content: ${result.content ? result.content.length : 0}`);
    console.log(`  - Tiene decisions: ${!!result.decisions}`);
    console.log(`  - Número de decisions: ${result.decisions ? result.decisions.length : 0}`);
    
    // Asegurar que el contenido exista antes de agregarlo
    if (!result.content || result.content.trim().length === 0) {
      console.error('❌ ERROR CRÍTICO: El capítulo no tiene contenido válido');
      console.log('Estructura completa:', JSON.stringify(result, null, 2));
      throw new Error('El capítulo generado no tiene contenido válido. Por favor, intenta de nuevo.');
    }

    // Actualizar historia
    story.chapters.push(result);
    story.currentChapter = story.chapters.length - 1;
    story.decisions.push({
      chapter: story.currentChapter - 1,
      decision: decision,
      timestamp: new Date().toISOString()
    });
    story.characters = result.characters || story.characters;

    activeStories.set(storyId, story);
    
    // Log final para verificar
    console.log(`✅ Historia actualizada - Total capítulos: ${story.chapters.length}, Capítulo actual: ${story.currentChapter}`);
    console.log(`📄 Contenido del nuevo capítulo (primeros 150 caracteres): ${story.chapters[story.currentChapter].content.substring(0, 150)}...`);

    res.json({
      success: true,
      story: story,
      newChapter: result
    });

  } catch (error) {
    console.error('❌ Error continuando historia:', error);
    res.status(500).json({ 
      error: 'Error al continuar la historia',
      message: error.message 
    });
  }
});

// Obtener estado actual de la historia
app.get('/api/story/:storyId', (req, res) => {
  try {
    const { storyId } = req.params;

    if (!activeStories.has(storyId)) {
      return res.status(404).json({ error: 'Historia no encontrada' });
    }

    const story = activeStories.get(storyId);
    res.json({ success: true, story });

  } catch (error) {
    console.error('❌ Error obteniendo historia:', error);
    res.status(500).json({ 
      error: 'Error al obtener la historia',
      message: error.message 
    });
  }
});

// Generar personaje adicional
app.post('/api/story/:storyId/character', async (req, res) => {
  try {
    const { storyId } = req.params;
    const { characterPrompt } = req.body;

    if (!activeStories.has(storyId)) {
      return res.status(404).json({ error: 'Historia no encontrada' });
    }

    const story = activeStories.get(storyId);

    console.log(`👤 Generando nuevo personaje para historia ${storyId}`);

    const character = await narrativeAgent.generateCharacter({
      story,
      characterPrompt
    });

    story.characters.push(character);

    res.json({
      success: true,
      character: character
    });

  } catch (error) {
    console.error('❌ Error generando personaje:', error);
    res.status(500).json({ 
      error: 'Error al generar personaje',
      message: error.message 
    });
  }
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor ejecutándose en http://localhost:${PORT}`);
  console.log(`📖 Agente de Narrativas Interactivas listo`);
  console.log(`✨ Crea historias inmersivas con IA`);
  console.log(`🎵 Freesound API integrada`);
});
