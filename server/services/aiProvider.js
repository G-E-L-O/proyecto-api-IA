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
   * Espera un tiempo específico (en segundos)
   */
  async sleep(seconds) {
    return new Promise(resolve => setTimeout(resolve, seconds * 1000));
  }

  /**
   * Extrae el tiempo de espera sugerido de un error 429
   */
  extractRetryDelay(error) {
    try {
      // Buscar en el mensaje primero (más común)
      if (error.message) {
        // Formato: "Please retry in 19.309954926s"
        const messageMatch = error.message.match(/retry\s+in\s+(\d+\.?\d*)\s*s/i);
        if (messageMatch) {
          const seconds = parseFloat(messageMatch[1]);
          return Math.ceil(seconds);
        }
        
        // Formato: "retryDelay": "19s"
        const delayMatch = error.message.match(/retryDelay["']?\s*[:=]\s*["']?(\d+\.?\d*)\s*s?/i);
        if (delayMatch) {
          const seconds = parseFloat(delayMatch[1]);
          return Math.ceil(seconds);
        }
      }
      
      // Intentar extraer del objeto error completo (JSON)
      try {
        const errorStr = JSON.stringify(error);
        // Buscar retryDelay en el JSON
        const retryMatch = errorStr.match(/retryDelay["']?\s*[:=]\s*["']?(\d+\.?\d*)\s*s?/i);
        if (retryMatch) {
          const seconds = parseFloat(retryMatch[1]);
          return Math.ceil(seconds);
        }
        
        // Buscar en el formato de respuesta de Google
        const googleRetryMatch = errorStr.match(/"retryDelay"\s*:\s*"(\d+)s"/i);
        if (googleRetryMatch) {
          return parseInt(googleRetryMatch[1], 10);
        }
      } catch (jsonError) {
        // Ignorar errores de JSON
      }
      
      // Buscar cualquier número seguido de 's' que indique segundos
      const anySecondsMatch = error.message?.match(/(\d+\.?\d*)\s*segundos?/i);
      if (anySecondsMatch) {
        return Math.ceil(parseFloat(anySecondsMatch[1]));
      }
    } catch (e) {
      console.warn('⚠️ No se pudo extraer el tiempo de espera del error:', e.message);
    }
    
    // Valor por defecto: 20 segundos (típicamente los rate limits se resetean cada minuto)
    return 20;
  }

  /**
   * Verifica si un error es un error de rate limit (429)
   */
  isRateLimitError(error) {
    if (!error) return false;
    const errorStr = error.message?.toLowerCase() || error.toString().toLowerCase();
    return errorStr.includes('429') || 
           errorStr.includes('too many requests') || 
           errorStr.includes('quota exceeded') ||
           errorStr.includes('rate limit');
  }

  /**
   * Genera contenido usando Gemini Flash (Plan Gratuito)
   * Usa solo el modelo gratuito para no consumir tokens del plan Pro pagado
   * Implementa reintento automático para errores de rate limit
   */
  async generateContent(systemPrompt, userPrompt, options = {}) {
    const {
      temperature = 0.9,
      maxTokens = 2000,
      responseFormat = 'json_object',
      maxRetries = 3
    } = options;

    // Usar siempre Gemini Flash (Plan Gratuito) con reintentos
    let lastError = null;
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await this._generateWithGeminiFree(systemPrompt, userPrompt, {
          temperature,
          maxOutputTokens: maxTokens,
          responseFormat
        });
      } catch (error) {
        lastError = error;
        
        // Si es un error de rate limit y no hemos agotado los reintentos
        if (this.isRateLimitError(error) && attempt < maxRetries) {
          const retryDelay = this.extractRetryDelay(error);
          console.warn(`⏳ Límite de cuota alcanzado (intento ${attempt + 1}/${maxRetries + 1}). Esperando ${retryDelay} segundos antes de reintentar...`);
          
          // Esperar antes de reintentar
          await this.sleep(retryDelay);
          
          // Continuar con el siguiente intento
          continue;
        }
        
        // Si no es un error de rate limit o agotamos los reintentos, lanzar el error
        console.error(`❌ Error generando contenido con Gemini (${this.geminiFreeModel}):`, error.message);
        
        if (this.isRateLimitError(error)) {
          const retryDelay = this.extractRetryDelay(error);
          throw new Error(`Límite de cuota alcanzado: Has excedido el límite de 10 solicitudes por minuto del plan gratuito de Gemini. Por favor, espera ${retryDelay} segundos antes de intentar nuevamente. Puedes ver tus límites en: https://ai.dev/usage?tab=rate-limit`);
        }
        
        throw new Error(`Error al generar contenido con Gemini: ${error.message}. Verifica tu API Key, nombre del modelo y límites de cuota.`);
      }
    }
    
    // Si llegamos aquí, todos los reintentos fallaron
    throw lastError || new Error('Error desconocido al generar contenido');
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

