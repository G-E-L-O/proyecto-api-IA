// INSTRUCCIONES PARA COMPLETAR LA INTEGRACIÓN DE FREESOUND

// 1. Abre el archivo: server/index.js

// 2. Después de la línea 8 que dice:
//    const { narrativeAgent } = require('./services/narrativeAgent');
//    
//    Añade esta línea:
const { freesoundService } = require('./services/freesoundService');

// 3. Después de la línea 23 que dice:
//    });
//    (después del endpoint /api/health)
//
//    Añade este código completo:

// Obtener samples de audio para un género
app.get('/api/music/samples/:genre', async (req, res) => {
  try {
    const { genre } = req.params;
    const duration = parseInt(req.query.duration) || 30;

    console.log(`🎵 Buscando samples de audio para género: ${genre}`);

    const sample = await freesoundService.searchSamples(genre, '', duration);

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

// 4. Guarda el archivo

// 5. Reinicia el servidor (Ctrl+C y luego npm run server)

// 6. Deberías ver el mensaje: "🎵 Freesound API lista"
