const OpenAI = require('openai');

// Inicializar OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

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

Formato de respuesta: JSON con la siguiente estructura:
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

Crea el primer capítulo de esta historia. Debe ser atractivo, inmersivo y presentar al menos 2-3 decisiones importantes que el usuario pueda tomar. Los personajes deben ser interesantes y la trama debe tener potencial para múltiples ramificaciones.`;

      const completion = await openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.9,
        max_tokens: 2000,
        response_format: { type: "json_object" }
      });

      const storyData = JSON.parse(completion.choices[0].message.content);

      console.log('✅ Historia inicial generada');
      return storyData;

    } catch (error) {
      console.error('Error en createStory:', error);
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

Formato: JSON con la misma estructura que createStory.`;

      // Construir contexto de la historia
      const storyContext = story.chapters.map((ch, idx) =>
        `Capítulo ${idx + 1}: ${ch.content.substring(0, 200)}...`
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
4. Presenta 2-3 nuevas decisiones importantes
5. Termina con un cliffhanger que motive a continuar
6. Actualiza o introduce nuevos personajes si es necesario`;

      const completion = await openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.85,
        max_tokens: 2000,
        response_format: { type: "json_object" }
      });

      const nextChapter = JSON.parse(completion.choices[0].message.content);
      nextChapter.chapter = story.chapters.length + 1;

      console.log('✅ Capítulo generado');
      return nextChapter;

    } catch (error) {
      console.error('Error en continueStory:', error);
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

      const completion = await openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.8,
        max_tokens: 800,
        response_format: { type: "json_object" }
      });

      const character = JSON.parse(completion.choices[0].message.content);

      console.log('✅ Personaje generado');
      return character;

    } catch (error) {
      console.error('Error en generateCharacter:', error);
      throw new Error(`Error al generar personaje: ${error.message}`);
    }
  }
};

module.exports = { narrativeAgent };



