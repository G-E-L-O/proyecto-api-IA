// Usar el proveedor de IA unificado (soporta Gemini y OpenAI con fallback)
const aiProvider = require('./aiProvider');

const narrativeAgent = {
  /**
   * Crea una nueva historia interactiva con personajes, trama y decisiones
   */
  async createStory({ genre, theme, initialPrompt, userPreferences = {} }) {
    try {
      console.log('🎭 Generando historia inicial...');

      const systemPrompt = `Eres un maestro narrador de historias interactivas. Tu tarea es crear historias inmersivas, emocionantes y con múltiples ramificaciones basadas en las decisiones del usuario.

Características importantes:
- Crea personajes memorables con personalidades únicas
- Desarrolla tramas complejas con conflictos interesantes
- Presenta decisiones significativas que afecten el curso de la historia
- Mantén la coherencia narrativa
- Crea atmósferas vívidas y descripciones detalladas
- Responde siempre en español

IMPORTANTE: Responde ÚNICAMENTE con un objeto JSON válido. No incluyas texto adicional, explicaciones, ni formateo markdown. Solo el JSON puro.

Formato de respuesta requerido (JSON válido):
{
  "title": "Título de la historia",
  "chapter": 1,
  "content": "Contenido narrativo detallado (mínimo 300 palabras)",
  "characters": [
    {
      "name": "Nombre",
      "role": "Protagonista/Antagonista/Secundario",
      "personality": "Descripción de personalidad",
      "description": "Descripción física y de fondo"
    }
  ],
  "decisions": [
    {
      "id": 1,
      "text": "Texto de la decisión",
      "hint": "Pista sobre las consecuencias"
    }
  ],
  "atmosphere": "Descripción del ambiente y tono",
  "cliffhanger": "Final intrigante que motive a continuar"
}`;

      const userPrompt = `Crea una historia interactiva con las siguientes especificaciones:

Género: ${genre}
Tema: ${theme}
${initialPrompt ? `Prompt inicial: ${initialPrompt}` : ''}
${userPreferences.style ? `Estilo: ${userPreferences.style}` : ''}
${userPreferences.tone ? `Tono: ${userPreferences.tone}` : ''}

Crea el primer capítulo de esta historia. Debe ser atractivo, inmersivo y presentar OBLIGATORIAMENTE 3 decisiones importantes y distintas que el usuario pueda tomar. Los personajes deben ser interesantes y la trama debe tener potencial para múltiples ramificaciones.

RECUERDA: Responde SOLO con el objeto JSON, sin texto adicional ni explicaciones.`;

      const storyData = await aiProvider.generateContent(
        systemPrompt,
        userPrompt,
        {
          temperature: 0.9,
          maxTokens: 8192, // Plan gratuito permite hasta 8192 tokens - NO afecta plan Pro
          responseFormat: 'json_object'
        }
      );

      console.log('✅ Historia inicial generada');
      return storyData;

    } catch (error) {
      console.error('Error en createStory:', error);
      
      // Manejar errores específicos
      if (error.message?.includes('Límite de cuota') || error.message?.includes('429') || error.message?.includes('quota')) {
        // El mensaje ya viene formateado del aiProvider, reutilizarlo
        throw error;
      }
      
      if (error.message?.includes('401') || error.message?.includes('API Key inválida') || error.message?.includes('Invalid API Key')) {
        throw new Error('API Key inválida: Verifica que tu GEMINI_API_KEY en el archivo .env sea correcta.');
      }
      
      throw new Error(`Error al crear la historia: ${error.message}`);
    }
  },

  /**
   * Continúa la historia basándose en la decisión del usuario
   */
  async continueStory({ story, userDecision, userAction }) {
    try {
      console.log('📖 Continuando historia con decisión del usuario...');

      const systemPrompt = `Eres un maestro narrador que continúa historias interactivas. Debes:
- Mantener la coherencia con los capítulos anteriores
- Desarrollar las consecuencias de las decisiones del usuario
- Crear nuevas situaciones interesantes
- Presentar nuevas decisiones significativas
- Mantener el tono y estilo de la historia original
- Responde siempre en español

IMPORTANTE: Responde ÚNICAMENTE con un objeto JSON válido. No incluyas texto adicional, explicaciones, ni formateo markdown. Solo el JSON puro.

Formato de respuesta requerido (JSON válido):
{
  "title": "Título opcional del capítulo",
  "chapter": ${story.chapters.length + 1},
  "content": "Contenido narrativo detallado del capítulo (OBLIGATORIO, mínimo 300 palabras). Este campo ES OBLIGATORIO y debe contener el texto completo del capítulo.",
  "characters": [
    {
      "name": "Nombre",
      "role": "Protagonista/Antagonista/Secundario",
      "personality": "Descripción de personalidad",
      "description": "Descripción física y de fondo"
    }
  ],
  "decisions": [
    {
      "id": 1,
      "text": "Texto de la decisión",
      "hint": "Pista sobre las consecuencias"
    }
  ],
  "atmosphere": "Descripción del ambiente y tono (opcional)",
  "cliffhanger": "Final intrigante que motive a continuar (opcional)"
}

RECUERDA: El campo "content" es OBLIGATORIO y debe contener el texto narrativo completo del capítulo.`;

      // Construir contexto de la historia
      const storyContext = story.chapters.map((ch, idx) =>
        `Capítulo ${idx + 1}: ${ch.content ? ch.content.substring(0, 200) : 'Sin contenido'}...`
      ).join('\n\n');

      const charactersContext = story.characters.map(char =>
        `${char.name} (${char.role}): ${char.personality}`
      ).join('\n');

      const lastDecisions = story.decisions.slice(-3).map(d =>
        `Decisión en capítulo ${d.chapter}: ${d.decision}`
      ).join('\n');

      const userPrompt = `Continúa esta historia interactiva:

GÉNERO: ${story.genre}
TEMA: ${story.theme}

CONTEXTO DE LA HISTORIA:
${storyContext}

PERSONAJES:
${charactersContext}

DECISIONES RECIENTES:
${lastDecisions}

DECISIÓN ACTUAL DEL USUARIO: ${userDecision}
${userAction ? `ACCIÓN ADICIONAL: ${userAction}` : ''}

Genera el siguiente capítulo (capítulo ${story.chapters.length + 1}) que:
1. Desarrolla las consecuencias de la decisión del usuario
2. Mantiene la coherencia con la historia anterior
3. Introduce nuevos elementos interesantes
4. OBLIGATORIO: Presenta SIEMPRE 3 decisiones claras y distintas que permitan avanzar la trama
5. Termina con un cliffhanger que motive a continuar
6. Actualiza o introduce nuevos personajes si es necesario`;

      const nextChapter = await aiProvider.generateContent(
        systemPrompt,
        userPrompt,
        {
          temperature: 0.85,
          maxTokens: 8192, // Plan gratuito permite hasta 8192 tokens - NO afecta plan Pro
          responseFormat: 'json_object'
        }
      );
      
      // Validar y asegurar estructura correcta del capítulo
      nextChapter.chapter = story.chapters.length + 1;
      
      // Validar que exista el campo content
      if (!nextChapter.content || nextChapter.content.trim().length === 0) {
        console.error('❌ ERROR: El capítulo generado no tiene contenido válido');
        console.log('Estructura del capítulo recibido:', JSON.stringify(nextChapter, null, 2));
        
        // Intentar usar otros campos posibles
        if (nextChapter.text && nextChapter.text.trim().length > 0) {
          console.log('⚠️ Usando campo "text" como contenido');
          nextChapter.content = nextChapter.text;
        } else if (nextChapter.story && nextChapter.story.trim().length > 0) {
          console.log('⚠️ Usando campo "story" como contenido');
          nextChapter.content = nextChapter.story;
        } else if (nextChapter.narrative && nextChapter.narrative.trim().length > 0) {
          console.log('⚠️ Usando campo "narrative" como contenido');
          nextChapter.content = nextChapter.narrative;
        } else {
          // Si no hay contenido, crear uno por defecto
          console.warn('⚠️ No se encontró contenido válido, creando contenido por defecto');
          nextChapter.content = `El capítulo continúa la historia basándose en tu decisión: "${userDecision}".\n\nLa trama se desarrolla con nuevas revelaciones y desafíos.`;
        }
      }
      
      // Asegurar que haya decisiones
      if (!nextChapter.decisions || nextChapter.decisions.length === 0) {
        console.log('⚠️ La IA no generó decisiones, añadiendo por defecto');
        nextChapter.decisions = [
          { text: "Explorar los alrededores", hint: "Investiga qué hay cerca" },
          { text: "Hablar con alguien", hint: "Busca información" },
          { text: "Continuar el camino", hint: "Sigue adelante" }
        ];
      }

      console.log('✅ Capítulo generado exitosamente');
      console.log(`📝 Contenido: ${nextChapter.content ? nextChapter.content.substring(0, 100) + '...' : 'VACÍO'}`);
      console.log(`🎯 Decisiones: ${nextChapter.decisions ? nextChapter.decisions.length : 0}`);
      
      return nextChapter;

    } catch (error) {
      console.error('Error en continueStory:', error);
      
      // Manejar errores específicos
      if (error.message?.includes('Límite de cuota') || error.message?.includes('429') || error.message?.includes('quota')) {
        // El mensaje ya viene formateado del aiProvider, reutilizarlo
        throw error;
      }
      
      if (error.message?.includes('401') || error.message?.includes('API Key inválida')) {
        throw new Error('API Key inválida: Verifica que tu GEMINI_API_KEY en el archivo .env sea correcta.');
      }
      
      throw new Error(`Error al continuar la historia: ${error.message}`);
    }
  },

  /**
   * Genera un nuevo personaje para la historia
   */
  async generateCharacter({ story, characterPrompt }) {
    try {
      console.log('👤 Generando nuevo personaje...');

      const systemPrompt = `Eres un creador de personajes para historias interactivas. Crea personajes memorables, complejos y que encajen perfectamente en la narrativa existente.

Formato: JSON con:
{
  "name": "Nombre del personaje",
  "role": "Protagonista/Antagonista/Secundario/Aliado",
  "personality": "Descripción detallada de la personalidad",
  "description": "Descripción física y de fondo",
  "motivations": "Qué motiva a este personaje",
  "relationships": "Relaciones con otros personajes",
  "secrets": "Secretos o información oculta (opcional)"
}`;

      const storyContext = `Género: ${story.genre}, Tema: ${story.theme}`;
      const existingCharacters = story.characters.map(c => c.name).join(', ');

      const userPrompt = `Crea un nuevo personaje para esta historia:

${storyContext}

Personajes existentes: ${existingCharacters || 'Ninguno'}

Solicitud: ${characterPrompt}

El personaje debe ser coherente con el género y tema, y tener potencial para crear situaciones interesantes en la narrativa.`;

      const character = await aiProvider.generateContent(
        systemPrompt,
        userPrompt,
        {
          temperature: 0.8,
          maxTokens: 2048, // Plan gratuito - NO consume tokens del plan Pro (solo usa Flash)
          responseFormat: 'json_object'
        }
      );

      console.log('✅ Personaje generado');
      return character;

    } catch (error) {
      console.error('Error en generateCharacter:', error);
      
      // Manejar errores específicos
      if (error.message?.includes('quota') || error.message?.includes('429') || error.message?.includes('Cuota excedida')) {
        throw new Error('Cuota excedida: Todos los proveedores de IA han agotado sus créditos.');
      }
      
      if (error.message?.includes('401') || error.message?.includes('API Key inválida')) {
        throw new Error('API Key inválida: Verifica que tus claves API sean correctas.');
      }
      
      throw new Error(`Error al generar personaje: ${error.message}`);
    }
  }
};

module.exports = { narrativeAgent };



