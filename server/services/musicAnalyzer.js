/**
 * Music Analyzer Service
 * Analiza el contexto narrativo y genera parámetros musicales adaptativos
 */

const musicAnalyzer = {
  /**
   * Mapeo de géneros literarios a estilos musicales
   */
  genreMapping: {
    'ciencia ficción': {
      baseKey: 'C',
      scale: 'minor',
      tempo: 80,
      instruments: ['synth', 'pad', 'ambient'],
      effects: ['reverb', 'delay', 'chorus'],
      density: 0.6,
      characteristics: 'Sintetizadores espaciales, tonos electrónicos, reverb profundo'
    },
    'fantasía': {
      baseKey: 'D',
      scale: 'major',
      tempo: 90,
      instruments: ['pad', 'strings', 'harp'],
      effects: ['reverb', 'shimmer'],
      density: 0.7,
      characteristics: 'Pads orquestales, arpegios etéreos, atmósfera mágica'
    },
    'terror': {
      baseKey: 'A',
      scale: 'minor',
      tempo: 60,
      instruments: ['drone', 'dissonance', 'bass'],
      effects: ['reverb', 'distortion', 'lowpass'],
      density: 0.4,
      characteristics: 'Disonancias, tonos bajos, efectos inquietantes'
    },
    'misterio': {
      baseKey: 'E',
      scale: 'minor',
      tempo: 70,
      instruments: ['piano', 'pad', 'strings'],
      effects: ['reverb', 'delay'],
      density: 0.5,
      characteristics: 'Piano minimalista, tensión sostenida, tonos menores'
    },
    'aventura': {
      baseKey: 'G',
      scale: 'major',
      tempo: 100,
      instruments: ['strings', 'brass', 'percussion'],
      effects: ['reverb'],
      density: 0.8,
      characteristics: 'Épico, energético, melodías ascendentes'
    },
    'romance': {
      baseKey: 'F',
      scale: 'major',
      tempo: 75,
      instruments: ['piano', 'strings', 'pad'],
      effects: ['reverb', 'chorus'],
      density: 0.6,
      characteristics: 'Tonos cálidos, melodías suaves, atmósfera íntima'
    },
    'drama': {
      baseKey: 'Bb',
      scale: 'minor',
      tempo: 85,
      instruments: ['strings', 'piano', 'pad'],
      effects: ['reverb'],
      density: 0.65,
      characteristics: 'Emotivo, dinámico, tensión dramática'
    },
    'thriller': {
      baseKey: 'C',
      scale: 'minor',
      tempo: 95,
      instruments: ['synth', 'percussion', 'bass'],
      effects: ['reverb', 'delay'],
      density: 0.7,
      characteristics: 'Percusión sutil, tensión creciente, ritmo pulsante'
    },
    'histórico': {
      baseKey: 'D',
      scale: 'major',
      tempo: 80,
      instruments: ['strings', 'harpsichord', 'flute'],
      effects: ['reverb'],
      density: 0.6,
      characteristics: 'Instrumentos clásicos, atmósfera épica'
    },
    'distopía': {
      baseKey: 'A',
      scale: 'minor',
      tempo: 75,
      instruments: ['synth', 'drone', 'industrial'],
      effects: ['reverb', 'distortion', 'delay'],
      density: 0.5,
      characteristics: 'Oscuro, industrial, tonos sintéticos fríos'
    }
  },

  /**
   * Mapeo de estados emocionales a modificadores musicales
   */
  emotionalMapping: {
    'calmo': { tempoMod: -10, intensityMod: -0.2, filterFreq: 800 },
    'tenso': { tempoMod: 15, intensityMod: 0.3, filterFreq: 2000 },
    'épico': { tempoMod: 20, intensityMod: 0.4, filterFreq: 3000 },
    'misterioso': { tempoMod: -5, intensityMod: 0.1, filterFreq: 1200 },
    'alegre': { tempoMod: 10, intensityMod: 0.2, filterFreq: 2500 },
    'triste': { tempoMod: -15, intensityMod: -0.1, filterFreq: 600 },
    'aterrador': { tempoMod: -20, intensityMod: 0.3, filterFreq: 400 },
    'romántico': { tempoMod: -5, intensityMod: -0.1, filterFreq: 1500 }
  },

  /**
   * Analiza el contexto del capítulo y genera configuración musical
   */
  analyzeMusicContext(chapter, genre) {
    try {
      // Obtener configuración base del género
      const baseConfig = this.genreMapping[genre.toLowerCase()] || this.genreMapping['aventura'];
      
      // Analizar atmósfera del capítulo
      const atmosphere = chapter.atmosphere || '';
      const content = chapter.content || '';
      
      // Detectar emociones en el texto
      const detectedMood = this.detectMood(atmosphere, content);
      const intensity = this.calculateIntensity(atmosphere, content);
      
      // Generar configuración musical
      const musicConfig = this.generateMusicConfig(baseConfig, detectedMood, intensity);
      
      return {
        ...musicConfig,
        genre,
        mood: detectedMood,
        intensity,
        chapterTitle: chapter.title || 'Capítulo'
      };
    } catch (error) {
      console.error('Error en analyzeMusicContext:', error);
      // Retornar configuración por defecto en caso de error
      return this.getDefaultConfig(genre);
    }
  },

  /**
   * Detecta el mood/estado emocional del texto
   */
  detectMood(atmosphere, content) {
    const text = `${atmosphere} ${content}`.toLowerCase();
    
    // Palabras clave para cada mood
    const moodKeywords = {
      'aterrador': ['terror', 'miedo', 'oscuro', 'sombra', 'muerte', 'sangre', 'horror', 'escalofriante'],
      'tenso': ['tensión', 'peligro', 'amenaza', 'nervioso', 'alerta', 'urgente', 'crítico'],
      'épico': ['batalla', 'heroico', 'grandioso', 'épico', 'triunfo', 'victoria', 'poder'],
      'misterioso': ['misterio', 'secreto', 'oculto', 'enigma', 'extraño', 'desconocido'],
      'triste': ['tristeza', 'melancolía', 'pérdida', 'dolor', 'lágrimas', 'soledad'],
      'alegre': ['alegría', 'feliz', 'risa', 'celebración', 'diversión', 'esperanza'],
      'romántico': ['amor', 'romance', 'corazón', 'pasión', 'beso', 'ternura'],
      'calmo': ['paz', 'tranquilo', 'sereno', 'calma', 'silencio', 'quieto']
    };
    
    let maxScore = 0;
    let detectedMood = 'calmo';
    
    for (const [mood, keywords] of Object.entries(moodKeywords)) {
      let score = 0;
      keywords.forEach(keyword => {
        if (text.includes(keyword)) score++;
      });
      
      if (score > maxScore) {
        maxScore = score;
        detectedMood = mood;
      }
    }
    
    return detectedMood;
  },

  /**
   * Calcula la intensidad narrativa (0-10)
   */
  calculateIntensity(atmosphere, content) {
    const text = `${atmosphere} ${content}`.toLowerCase();
    
    // Palabras que indican alta intensidad
    const highIntensityWords = [
      'explosión', 'grito', 'correr', 'luchar', 'atacar', 'huir',
      'rápido', 'súbito', 'repentino', 'violento', 'intenso'
    ];
    
    // Palabras que indican baja intensidad
    const lowIntensityWords = [
      'lento', 'suave', 'tranquilo', 'pausado', 'silencio',
      'calma', 'sereno', 'quieto', 'descanso'
    ];
    
    let intensity = 5; // Base neutral
    
    highIntensityWords.forEach(word => {
      if (text.includes(word)) intensity += 0.5;
    });
    
    lowIntensityWords.forEach(word => {
      if (text.includes(word)) intensity -= 0.5;
    });
    
    // Normalizar entre 0 y 10
    return Math.max(0, Math.min(10, intensity));
  },

  /**
   * Genera la configuración musical final
   */
  generateMusicConfig(baseConfig, mood, intensity) {
    const emotionalMod = this.emotionalMapping[mood] || { tempoMod: 0, intensityMod: 0, filterFreq: 1000 };
    
    return {
      // Parámetros básicos
      key: baseConfig.baseKey,
      scale: baseConfig.scale,
      tempo: Math.max(40, Math.min(140, baseConfig.tempo + emotionalMod.tempoMod)),
      
      // Instrumentación
      instruments: baseConfig.instruments,
      effects: baseConfig.effects,
      
      // Densidad y complejidad
      density: Math.max(0.1, Math.min(1, baseConfig.density + emotionalMod.intensityMod)),
      
      // Parámetros de síntesis
      filterFrequency: emotionalMod.filterFreq,
      reverbAmount: this.calculateReverbAmount(baseConfig, intensity),
      delayTime: this.calculateDelayTime(baseConfig, mood),
      
      // Volumen y dinámica
      masterVolume: 0.3, // Volumen base moderado
      dynamicRange: intensity / 10, // Más intensidad = más variación dinámica
      
      // Características adicionales
      characteristics: baseConfig.characteristics
    };
  },

  /**
   * Calcula la cantidad de reverb según el contexto
   */
  calculateReverbAmount(baseConfig, intensity) {
    // Más intensidad = menos reverb (más claridad)
    const baseReverb = baseConfig.effects.includes('reverb') ? 0.4 : 0.2;
    return Math.max(0.1, baseReverb - (intensity / 50));
  },

  /**
   * Calcula el tiempo de delay según el mood
   */
  calculateDelayTime(baseConfig, mood) {
    if (!baseConfig.effects.includes('delay')) return 0;
    
    const delayTimes = {
      'calmo': 0.5,
      'misterioso': 0.4,
      'tenso': 0.2,
      'épico': 0.3,
      'aterrador': 0.6
    };
    
    return delayTimes[mood] || 0.3;
  },

  /**
   * Retorna configuración por defecto
   */
  getDefaultConfig(genre) {
    const baseConfig = this.genreMapping[genre.toLowerCase()] || this.genreMapping['aventura'];
    
    return {
      key: baseConfig.baseKey,
      scale: baseConfig.scale,
      tempo: baseConfig.tempo,
      instruments: baseConfig.instruments,
      effects: baseConfig.effects,
      density: baseConfig.density,
      filterFrequency: 1000,
      reverbAmount: 0.3,
      delayTime: 0.3,
      masterVolume: 0.3,
      dynamicRange: 0.5,
      mood: 'calmo',
      intensity: 5,
      characteristics: baseConfig.characteristics
    };
  }
};

module.exports = { musicAnalyzer };
