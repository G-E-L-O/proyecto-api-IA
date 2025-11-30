const { GoogleGenerativeAI } = require('@google/generative-ai');

/**
 * Proveedor de IA usando Google Gemini (Plan Gratuito)
 * Usa Gemini 2.5 Flash por defecto (gratuito, sin límites estrictos)
 * También puede usar Gemini 2.5 Pro (gratuito, limitado a 5 solicitudes/día)
 */
class AIProvider {
  constructor() {
    // Verificar que la API Key de Gemini está configurada
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY no está configurada. Por favor, configura tu API Key de Gemini en el archivo .env');
    }
    
    // Inicializar Gemini
    this.gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    // Solo usar el modelo gratuito
    // Gemini 2.5 Flash: Gratuito, sin límites estrictos (recomendado para uso diario)
    // Gemini 2.5 Pro: Gratuito pero limitado a 5 solicitudes diarias (más potente)
    // Gemini 2.5 Flash-Lite: Gratuito, más rápido y eficiente
    this.geminiFreeModel = process.env.GEMINI_FREE_MODEL || 'gemini-2.5-flash';
  }

  /**
   * Genera contenido usando Gemini Flash (Plan Gratuito)
   * Usa solo el modelo gratuito para no consumir tokens del plan Pro pagado
   */
  async generateContent(systemPrompt, userPrompt, options = {}) {
    const {
      temperature = 0.9,
      maxTokens = 2000,
      responseFormat = 'json_object'
    } = options;

    // Usar siempre Gemini Flash (Plan Gratuito)
    try {
      return await this._generateWithGeminiFree(systemPrompt, userPrompt, {
        temperature,
        maxOutputTokens: maxTokens,
        responseFormat
      });
    } catch (error) {
      console.error(`❌ Error generando contenido con Gemini (${this.geminiFreeModel}):`, error.message);
      throw new Error(`Error al generar contenido con Gemini: ${error.message}. Verifica tu API Key, nombre del modelo y límites de cuota.`);
    }
  }

  /**
   * Genera contenido usando Gemini Flash (Plan Gratuito)
   */
  async _generateWithGeminiFree(systemPrompt, userPrompt, options) {
    const model = this.gemini.getGenerativeModel({ 
      model: this.geminiFreeModel 
    });
    
    // Combinar systemPrompt y userPrompt de forma más clara para JSON
    const prompt = `${systemPrompt}\n\n${userPrompt}\n\nIMPORTANTE: Responde ÚNICAMENTE con el objeto JSON solicitado, sin texto adicional ni explicaciones.`;
    
    // IMPORTANTE: Solo usamos el modelo GRATUITO (Gemini Flash)
    // NO afecta tu plan Pro - tienen límites separados
    // El plan gratuito tiene límites generosos que puedes usar sin costo
    // Gemini Flash usa tokens internos en "pensamientos" que no ves pero consumen el límite
    // Por eso necesitamos suficiente espacio para que genere la respuesta real
    const maxTokens = options.maxOutputTokens || 8192; // Límite del plan gratuito
    
    const generationConfig = {
      temperature: options.temperature,
      maxOutputTokens: maxTokens,
      ...(options.responseFormat === 'json_object' && {
        responseMimeType: 'application/json'
      })
    };
    
    console.log(`📊 Configuración: maxOutputTokens=${maxTokens}, temperature=${options.temperature}`);
    console.log(`💡 Plan GRATUITO (Flash) - NO consume tokens del plan Pro`);
    
    try {
      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig
      });
      
      const response = await result.response;
      
      // Verificar si hay texto en la respuesta
      if (!response) {
        console.error('❌ La respuesta de Gemini está vacía (response es null/undefined)');
        console.log('Result completo:', JSON.stringify(result, null, 2));
        throw new Error('La respuesta de Gemini está vacía');
      }
      
      // Intentar obtener el texto
      let text = '';
      try {
        text = response.text();
      } catch (textError) {
        console.error('❌ Error al obtener texto de la respuesta:', textError.message);
        console.log('Response object keys:', Object.keys(response));
        console.log('Response completo:', JSON.stringify(response, null, 2));
        throw new Error(`Error al obtener texto de Gemini: ${textError.message}`);
      }
      
      // Verificar si el texto está vacío
      if (!text || text.trim().length === 0) {
        console.error('❌ La respuesta de Gemini está vacía (texto vacío)');
        console.log('Response completo:', JSON.stringify(response, null, 2));
        
        // Verificar si alcanzó el límite de tokens
        if (response.candidates && response.candidates[0] && response.candidates[0].finishReason === 'MAX_TOKENS') {
          const usage = response.usageMetadata;
          console.error(`⚠️ El modelo alcanzó el límite máximo de tokens (${options.maxOutputTokens})`);
          console.error(`   Tokens usados: ${usage?.totalTokenCount || 'N/A'}`);
          console.error(`   Pensamientos internos: ${usage?.thoughtsTokenCount || 0}`);
          throw new Error(`El modelo alcanzó el límite máximo de tokens (${options.maxOutputTokens}). Intenta reducir el prompt o aumentar maxOutputTokens.`);
        }
        
        throw new Error('La respuesta de Gemini está vacía - el modelo no generó contenido');
      }
    
      console.log(`✅ Contenido generado con Gemini (${this.geminiFreeModel})`);
      console.log(`📝 Longitud de respuesta: ${text.length} caracteres`);
      console.log(`📝 Primeros 200 caracteres: ${text.substring(0, 200)}`);
      
      // Si esperamos JSON, parsearlo
      if (options.responseFormat === 'json_object') {
      try {
        // Intentar parsear directamente
        return JSON.parse(text);
      } catch (e) {
        console.warn('⚠️ Error parseando JSON directamente, intentando extraer JSON del texto...');
        console.log('Respuesta recibida (primeros 500 caracteres):', text.substring(0, 500));
        
        // Intentar múltiples estrategias de extracción
        let jsonText = null;
        
        // Estrategia 1: Buscar JSON entre ```json ``` (markdown)
        const jsonMarkdownMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
        if (jsonMarkdownMatch) {
          jsonText = jsonMarkdownMatch[1];
        }
        
        // Estrategia 2: Buscar JSON entre ``` ``` (sin especificar json)
        if (!jsonText) {
          const codeBlockMatch = text.match(/```\s*([\s\S]*?)\s*```/);
          if (codeBlockMatch) {
            const codeBlock = codeBlockMatch[1];
            // Verificar si parece JSON (empieza con { o [)
            if (codeBlock.trim().match(/^[{\[]/)) {
              jsonText = codeBlock;
            }
          }
        }
        
        // Estrategia 3: Buscar cualquier objeto JSON en el texto
        if (!jsonText) {
          const jsonObjectMatch = text.match(/\{[\s\S]*\}/);
          if (jsonObjectMatch) {
            jsonText = jsonObjectMatch[0];
          }
        }
        
        // Estrategia 4: Buscar el primer objeto JSON válido
        if (!jsonText) {
          // Intentar encontrar el inicio del JSON
          const startIdx = text.indexOf('{');
          if (startIdx !== -1) {
            // Buscar el cierre correspondiente
            let braceCount = 0;
            let endIdx = startIdx;
            for (let i = startIdx; i < text.length; i++) {
              if (text[i] === '{') braceCount++;
              if (text[i] === '}') braceCount--;
              if (braceCount === 0) {
                endIdx = i;
                break;
              }
            }
            if (endIdx > startIdx) {
              jsonText = text.substring(startIdx, endIdx + 1);
            }
          }
        }
        
        if (jsonText) {
          try {
            const parsed = JSON.parse(jsonText.trim());
            console.log('✅ JSON extraído y parseado exitosamente');
            return parsed;
          } catch (parseError) {
            console.error('❌ Error parseando JSON extraído:', parseError.message);
            console.log('JSON extraído (primeros 500 caracteres):', jsonText.substring(0, 500));
          }
        }
        
        // Si todo falla, mostrar la respuesta completa para debug
        console.error('❌ No se pudo extraer JSON válido de la respuesta');
        console.error('=== DEBUG: Respuesta completa recibida ===');
        console.error('Longitud:', text.length);
        console.error('Tipo:', typeof text);
        console.error('Contenido completo:');
        console.error(text);
        console.error('===========================================');
        throw new Error(`No se pudo parsear la respuesta JSON de Gemini. Longitud de respuesta: ${text.length} caracteres. Primeros 500: ${text.substring(0, 500)}`);
        }
      }
      
      return text;
    } catch (error) {
      console.error(`❌ Error en _generateWithGeminiFree:`, error.message);
      if (error.message.includes('respuesta') || error.message.includes('vacía')) {
        throw error;
      }
      throw new Error(`Error generando contenido con Gemini: ${error.message}`);
    }
  }

}

// Exportar instancia singleton
module.exports = new AIProvider();

