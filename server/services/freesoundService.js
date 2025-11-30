const axios = require('axios');

const FREESOUND_API_KEY = process.env.FREESOUND_API_KEY;
const FREESOUND_BASE_URL = 'https://freesound.org/apiv2';

// Cache de samples para evitar búsquedas repetidas
const samplesCache = new Map();

/**
 * Servicio para buscar y obtener samples de audio de Freesound
 */
const freesoundService = {
  /**
   * Mapeo de géneros a términos de búsqueda en Freesound
   */
  genreSearchTerms: {
    'terror': ['dark ambient', 'horror', 'suspense', 'creepy', 'ominous'],
    'ciencia ficción': ['sci-fi', 'space', 'electronic', 'futuristic', 'synth'],
    'fantasía': ['orchestral', 'magical', 'ethereal', 'fantasy', 'epic'],
    'romance': ['piano', 'soft', 'romantic', 'gentle', 'love'],
    'thriller': ['tension', 'suspense', 'dramatic', 'intense', 'action'],
    'misterio': ['mysterious', 'enigmatic', 'ambient', 'subtle', 'intrigue'],
    'aventura': ['epic', 'adventure', 'heroic', 'orchestral', 'uplifting'],
    'drama': ['emotional', 'dramatic', 'cinematic', 'melancholic', 'strings'],
    'histórico': ['classical', 'period', 'orchestral', 'traditional', 'baroque'],
    'distopía': ['dark', 'industrial', 'dystopian', 'electronic', 'atmospheric']
  },

  /**
   * Busca samples en Freesound según género y mood
   * Usa múltiples estrategias de búsqueda para mejorar la tasa de éxito
   */
  async searchSamples(genre, mood = '', duration = 30) {
    try {
      // Verificar cache
      const cacheKey = `${genre}-${mood}-${duration}`;
      if (samplesCache.has(cacheKey)) {
        console.log(`✅ Usando sample cacheado para ${genre}`);
        return samplesCache.get(cacheKey);
      }

      if (!FREESOUND_API_KEY) {
        throw new Error('FREESOUND_API_KEY no está configurada');
      }

      // Obtener términos de búsqueda para el género
      const searchTerms = this.genreSearchTerms[genre.toLowerCase()] || ['ambient', 'background'];
      
      // ESTRATEGIA 1: Búsqueda con filtros más flexibles
      let result = await this._trySearchWithFilters(searchTerms, mood, duration, 'flexible');
      if (result) {
        samplesCache.set(cacheKey, result);
        return result;
      }

      // ESTRATEGIA 2: Búsqueda sin filtro de tags (más amplia)
      console.log('🔍 Intento 2: Búsqueda sin filtro de tags...');
      result = await this._trySearchWithFilters(searchTerms, mood, duration, 'no-tags');
      if (result) {
        samplesCache.set(cacheKey, result);
        return result;
      }

      // ESTRATEGIA 3: Búsqueda con términos individuales (uno por uno)
      console.log('🔍 Intento 3: Búsqueda con términos individuales...');
      for (const term of searchTerms.slice(0, 3)) { // Probar los primeros 3 términos
        result = await this._trySearchWithFilters([term], mood, duration, 'flexible');
        if (result) {
          samplesCache.set(cacheKey, result);
          return result;
        }
      }

      // ESTRATEGIA 4: Búsqueda genérica mejorada
      console.log('🔍 Intento 4: Búsqueda genérica mejorada...');
      result = await this.searchGenericSamples(duration, genre);
      if (result) {
        samplesCache.set(cacheKey, result);
        return result;
      }

      console.log('⚠️ No se encontraron samples después de múltiples intentos');
      return null;

    } catch (error) {
      console.error('❌ Error buscando samples en Freesound:', error.message);
      return null;
    }
  },

  /**
   * Intenta buscar samples con diferentes configuraciones de filtros
   */
  async _trySearchWithFilters(searchTerms, mood, duration, filterType) {
    try {
      let query = searchTerms.join(' OR ');
      
      if (mood) {
        query = `(${query}) ${mood}`;
      }

      // Construir filtro según el tipo
      let filter = '';
      if (filterType === 'flexible') {
        // Filtro flexible: rango de duración amplio, tags opcionales
        filter = `duration:[10 TO 120] (tag:music OR tag:loop OR tag:ambient OR tag:background)`;
      } else if (filterType === 'no-tags') {
        // Sin filtro de tags, solo duración amplia
        filter = `duration:[10 TO 120]`;
      }

      const response = await axios.get(`${FREESOUND_BASE_URL}/search/text/`, {
        params: {
          query: query,
          filter: filter,
          sort: 'rating_desc',
          fields: 'id,name,previews,duration,tags',
          page_size: 10, // Aumentar resultados para más opciones
          token: FREESOUND_API_KEY
        },
        timeout: 5000 // Timeout de 5 segundos
      });

      if (!response.data.results || response.data.results.length === 0) {
        return null;
      }

      // Filtrar samples que tengan preview disponible
      const validSamples = response.data.results.filter(sample => 
        sample.previews && (sample.previews['preview-hq-mp3'] || sample.previews['preview-lq-mp3'])
      );

      if (validSamples.length === 0) {
        return null;
      }

      // Seleccionar un sample aleatorio
      const selectedSample = validSamples[Math.floor(Math.random() * validSamples.length)];

      const result = {
        id: selectedSample.id,
        name: selectedSample.name,
        previewUrl: selectedSample.previews['preview-hq-mp3'] || selectedSample.previews['preview-lq-mp3'],
        duration: selectedSample.duration,
        tags: selectedSample.tags
      };

      console.log(`✅ Sample encontrado: ${result.name} (${result.duration}s)`);
      return result;

    } catch (error) {
      // Silenciosamente fallar y probar siguiente estrategia
      return null;
    }
  },

  /**
   * Búsqueda genérica mejorada cuando no se encuentran samples específicos
   */
  async searchGenericSamples(duration = 30, genre = '') {
    const genericQueries = [
      'ambient music loop',
      'background music',
      'atmospheric sound',
      'cinematic music',
      'mood music'
    ];

    // Si tenemos un género, añadir queries relacionadas
    if (genre) {
      const genreLower = genre.toLowerCase();
      if (genreLower.includes('terror') || genreLower.includes('horror')) {
        genericQueries.unshift('dark ambient', 'horror music', 'suspense music');
      } else if (genreLower.includes('ciencia ficción') || genreLower.includes('sci-fi')) {
        genericQueries.unshift('sci-fi music', 'electronic ambient', 'space music');
      } else if (genreLower.includes('fantasía') || genreLower.includes('fantasy')) {
        genericQueries.unshift('fantasy music', 'epic music', 'orchestral ambient');
      }
    }

    for (const query of genericQueries) {
      try {
        console.log(`🔍 Búsqueda genérica: "${query}"`);
        
        const response = await axios.get(`${FREESOUND_BASE_URL}/search/text/`, {
          params: {
            query: query,
            filter: 'duration:[10 TO 120] (tag:music OR tag:loop OR tag:ambient)',
            sort: 'rating_desc',
            fields: 'id,name,previews,duration,tags',
            page_size: 10,
            token: FREESOUND_API_KEY
          },
          timeout: 5000
        });

        if (response.data.results && response.data.results.length > 0) {
          // Filtrar samples con preview disponible
          const validSamples = response.data.results.filter(sample => 
            sample.previews && (sample.previews['preview-hq-mp3'] || sample.previews['preview-lq-mp3'])
          );

          if (validSamples.length > 0) {
            const sample = validSamples[0];
            console.log(`✅ Sample genérico encontrado: ${sample.name}`);
            return {
              id: sample.id,
              name: sample.name,
              previewUrl: sample.previews['preview-hq-mp3'] || sample.previews['preview-lq-mp3'],
              duration: sample.duration,
              tags: sample.tags
            };
          }
        }
      } catch (error) {
        // Continuar con siguiente query
        continue;
      }
    }

    console.log('⚠️ No se encontraron samples genéricos');
    return null;
  },

  /**
   * Obtiene información detallada de un sample
   */
  async getSampleDetails(sampleId) {
    try {
      const response = await axios.get(`${FREESOUND_BASE_URL}/sounds/${sampleId}/`, {
        params: {
          token: FREESOUND_API_KEY
        }
      });

      return response.data;
    } catch (error) {
      console.error('❌ Error obteniendo detalles del sample:', error.message);
      return null;
    }
  },

  /**
   * Limpia el cache de samples
   */
  clearCache() {
    samplesCache.clear();
    console.log('🗑️ Cache de samples limpiado');
  }
};

module.exports = { freesoundService };
