import React, { useState, useEffect } from 'react';
import './StoryControls.css';

const StoryControls = ({ text, onFontSizeChange }) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [fontSize, setFontSize] = useState(1.1); // Default rem
  const [copied, setCopied] = useState(false);

  // TTS Logic
  const toggleSpeech = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'es-ES'; // Spanish by default
      utterance.rate = 0.9; // Slightly slower for storytelling
      utterance.pitch = 1.0;
      
      utterance.onend = () => setIsSpeaking(false);
      
      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    }
  };

  // Stop speech if component unmounts
  useEffect(() => {
    return () => window.speechSynthesis.cancel();
  }, []);

  // Font Size Logic
  const adjustFontSize = (delta) => {
    const newSize = Math.max(0.8, Math.min(2.0, fontSize + delta));
    setFontSize(newSize);
    onFontSizeChange(newSize);
  };

  // Copy Logic
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Download Logic
  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([text], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = "mi_historia_ia.txt";
    document.body.appendChild(element); // Required for this to work in FireFox
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="story-controls">
      {/* TTS Button */}
      <button 
        className={`control-btn ${isSpeaking ? 'active' : ''}`} 
        onClick={toggleSpeech}
        title={isSpeaking ? "Detener Narración" : "Leer Historia"}
      >
        {isSpeaking ? '🔇' : '🔊'}
      </button>

      {/* Font Size Controls */}
      <div className="font-controls">
        <button onClick={() => adjustFontSize(-0.1)} title="Reducir Texto">A-</button>
        <span className="font-indicator">{Math.round(fontSize * 100)}%</span>
        <button onClick={() => adjustFontSize(0.1)} title="Aumentar Texto">A+</button>
      </div>

      {/* Copy Button */}
      <button 
        className={`control-btn ${copied ? 'success' : ''}`} 
        onClick={handleCopy}
        title="Copiar Texto"
      >
        {copied ? '✅' : '📋'}
      </button>

      {/* Download Button */}
      <button 
        className="control-btn" 
        onClick={handleDownload}
        title="Descargar Historia"
      >
        💾
      </button>
    </div>
  );
};

export default StoryControls;
