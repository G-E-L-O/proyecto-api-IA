import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Play, Pause, Music } from 'lucide-react';
import AudioEngine from '../services/audioEngine';
import axios from 'axios';
import './MusicPlayer.css';

const MusicPlayer = ({ storyId, genre, currentChapter, atmosphere }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.3);
  const [isLoading, setIsLoading] = useState(false);
  const [audioSource, setAudioSource] = useState('');
  
  const audioEngineRef = useRef(null);
  const freesoundAudioRef = useRef(null);
  const previousChapterRef = useRef(null);

  useEffect(() => {
    audioEngineRef.current = new AudioEngine();

    return () => {
      if (audioEngineRef.current) {
        audioEngineRef.current.destroy();
      }
      if (freesoundAudioRef.current) {
        freesoundAudioRef.current.pause();
      }
    };
  }, []);

  // Detectar cambio de capítulo y recargar música
  useEffect(() => {
    if (currentChapter !== null && currentChapter !== previousChapterRef.current) {
      previousChapterRef.current = currentChapter;
      
      // Si está reproduciendo, recargar música para el nuevo capítulo
      if (isPlaying) {
        console.log(`🔄 Capítulo cambió a ${currentChapter + 1}, recargando música...`);
        loadAndPlayMusic();
      }
    }
  }, [currentChapter]);

  useEffect(() => {
    const actualVolume = isMuted ? 0 : volume;
    
    if (audioEngineRef.current) {
      audioEngineRef.current.setVolume(actualVolume);
    }
    
    if (freesoundAudioRef.current) {
      freesoundAudioRef.current.volume = actualVolume;
    }
  }, [volume, isMuted]);

  const loadAndPlayMusic = async () => {
    if (!storyId || !genre) return;

    setIsLoading(true);
    
    try {
      // Detener audio anterior si existe
      if (freesoundAudioRef.current) {
        freesoundAudioRef.current.pause();
        freesoundAudioRef.current = null;
      }
      
      // Intentar cargar sample de Freesound
      try {
        const moodParam = atmosphere ? `&mood=${encodeURIComponent(atmosphere)}` : '';
        const response = await axios.get(
          `http://localhost:5000/api/music/samples/${genre}?duration=30${moodParam}`,
          { timeout: 3000 }
        );
        
        if (response.data.success && response.data.sample) {
          const sampleUrl = response.data.sample.previewUrl;
          console.log('🎵 Sample encontrado:', response.data.sample.name);
          
          // Detener audio generativo
          if (audioEngineRef.current) {
            await audioEngineRef.current.pause();
          }
          
          // Reproducir sample de Freesound
          const audio = new Audio(sampleUrl);
          audio.loop = true;
          audio.volume = isMuted ? 0 : volume;
          audio.crossOrigin = "anonymous";
          
          await audio.play();
          
          freesoundAudioRef.current = audio;
          setAudioSource('Freesound');
          setIsLoading(false);
          return;
        }
      } catch (error) {
        console.log('⚠️ Usando música generativa');
      }

      // Fallback a música generativa
      await audioEngineRef.current.play();
      setAudioSource('Generativa');
      
    } catch (error) {
      console.error('Error cargando música:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlayPause = async () => {
    if (isLoading) return;

    if (isPlaying) {
      if (freesoundAudioRef.current) {
        freesoundAudioRef.current.pause();
      } else if (audioEngineRef.current) {
        await audioEngineRef.current.pause();
      }
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      await loadAndPlayMusic();
    }
  };

  const handleMuteToggle = () => {
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (isMuted && newVolume > 0) {
      setIsMuted(false);
    }
  };

  return (
    <div className="music-player">
      <div className="music-player-content">
        <div className="music-indicator">
          <Music size={18} />
          {isPlaying && (
            <div className="music-visualizer">
              <span className="bar"></span>
              <span className="bar"></span>
              <span className="bar"></span>
            </div>
          )}
        </div>

        {isPlaying && audioSource && (
          <span className="current-mood">{audioSource}</span>
        )}

        <div className="music-controls">
          <button
            className="control-btn play-pause-btn"
            onClick={handlePlayPause}
            disabled={isLoading}
            title={isPlaying ? 'Pausar' : 'Reproducir'}
          >
            {isLoading ? (
              <div className="loading-spinner"></div>
            ) : isPlaying ? (
              <Pause size={18} />
            ) : (
              <Play size={18} />
            )}
          </button>

          <div className="volume-control">
            <button
              className="control-btn mute-btn"
              onClick={handleMuteToggle}
              title={isMuted ? 'Activar' : 'Silenciar'}
            >
              {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>

            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              className="volume-slider"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MusicPlayer;
