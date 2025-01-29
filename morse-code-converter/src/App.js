import React, { useState, useEffect, useRef, useCallback } from 'react';
import './App.css';
import TextInput from './components/TextInput';
import TextOutput from './components/TextOutput';
import ControlSlider from './components/ControlSlider';
import PlaybackControls from './components/PlaybackControls';
import ErrorBoundary from './components/ErrorBoundary';
import { textToMorse, isValidMorseChar } from './utils/morseCodeConverter';
import MorseAudioProcessor from './utils/audioProcessor';

function App() {
  // Application state
  const [state, setState] = useState({
    isInitialized: false,
    isLoading: true,
    inputText: '',
    morseCode: '',
    error: '',
    speed: 20,
    pitch: 550,
    volume: 80,
    isPlaying: false,
    isPaused: false
  });

  // Audio processor reference
  const audioProcessor = useRef(null);

  // State update helper
  const updateState = useCallback((updates) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  // Initialize audio processor with error handling
  useEffect(() => {
    let isMounted = true;

    const initializeAudioProcessor = async () => {
      try {
        audioProcessor.current = new MorseAudioProcessor();
        if (isMounted) {
          updateState({
            isInitialized: true,
            isLoading: false,
            error: ''
          });
        }
      } catch (err) {
        if (isMounted) {
          updateState({
            isLoading: false,
            error: 'Failed to initialize audio system. Please check your audio settings.'
          });
          console.error('Audio initialization error:', err);
        }
      }
    };

    initializeAudioProcessor();

    return () => {
      isMounted = false;
      if (audioProcessor.current) {
        try {
          audioProcessor.current.stop();
          audioProcessor.current.cleanup();
        } catch (err) {
          console.error('Error during cleanup:', err);
        }
        audioProcessor.current = null;
      }
    };
  }, [updateState]);

  // Update audio processor settings when they change
  useEffect(() => {
    if (audioProcessor.current && state.isInitialized) {
      try {
        audioProcessor.current.setSpeed(state.speed);
        audioProcessor.current.setPitch(state.pitch);
        audioProcessor.current.setVolume(state.volume / 100); // Convert percentage to 0-1 range
      } catch (err) {
        updateState({ error: 'Failed to update audio settings' });
        console.error('Settings update error:', err);
      }
    }
  }, [state.speed, state.pitch, state.volume, state.isInitialized, updateState]);

  const handleTextChange = useCallback((text) => {
    updateState({ inputText: text, error: '' });

    // Validate input characters
    const invalidChars = text.split('')
      .filter(char => !isValidMorseChar(char))
      .join('');

    if (invalidChars) {
      updateState({ error: `Invalid characters: ${invalidChars}` });
      return;
    }

    try {
      const morse = textToMorse(text);
      updateState({ morseCode: morse });
    } catch (err) {
      updateState({ error: 'Error converting text to Morse code' });
      console.error('Conversion error:', err);
    }
  }, [updateState]);

  const handlePlay = useCallback(async () => {
    if (!state.morseCode || !state.isInitialized) return;

    try {
      updateState({ isPlaying: true, isPaused: false, error: '' });
      await audioProcessor.current.play(state.morseCode);
      updateState({ isPlaying: false }); // Auto-reset when playback completes
    } catch (err) {
      updateState({
        error: 'Error playing Morse code audio',
        isPlaying: false,
        isPaused: false
      });
      console.error('Playback error:', err);
    }
  }, [state.morseCode, state.isInitialized, updateState]);

  const handlePause = useCallback(() => {
    if (audioProcessor.current) {
      try {
        audioProcessor.current.pause();
        updateState({ isPaused: true });
      } catch (err) {
        updateState({ error: 'Error pausing playback' });
        console.error('Pause error:', err);
      }
    }
  }, [updateState]);

  const handleStop = useCallback(() => {
    if (audioProcessor.current) {
      try {
        audioProcessor.current.stop();
        updateState({ isPlaying: false, isPaused: false });
      } catch (err) {
        updateState({ error: 'Error stopping playback' });
        console.error('Stop error:', err);
      }
    }
  }, [updateState]);

  // Handle errors from ErrorBoundary
  const handleError = useCallback((error, errorInfo) => {
    console.error('Error caught by boundary:', error, errorInfo);
    updateState({
      error: 'A critical error occurred. Please refresh the page.',
      isPlaying: false,
      isPaused: false
    });
  }, [updateState]);

  // Loading state
  if (state.isLoading) {
    return (
      <div className="App">
        <div className="loading">Initializing audio system...</div>
      </div>
    );
  }

  return (
    <ErrorBoundary
      onError={handleError}
      errorTitle="Morse Code Converter Error"
      errorMessage="An error occurred while processing your request. Please try again."
      showError={process.env.NODE_ENV === 'development'}
    >
      <div className="App">
      <h1>Morse Code Converter</h1>
      <div className="converter-container">
        <TextInput 
          value={state.inputText} 
          onChange={handleTextChange}
          error={state.error}
        />
        <TextOutput 
          morseCode={state.morseCode}
          error={state.error}
        />
        <div className="controls">
          <ControlSlider
            label="Speed"
            value={state.speed}
            onChange={(value) => updateState({ speed: value })}
            min={5}
            max={50}
            defaultValue={20}
          />
          <ControlSlider
            label="Pitch"
            value={state.pitch}
            onChange={(value) => updateState({ pitch: value })}
            min={200}
            max={1000}
            defaultValue={550}
          />
          <ControlSlider
            label="Volume"
            value={state.volume}
            onChange={(value) => updateState({ volume: value })}
            min={0}
            max={100}
            defaultValue={80}
          />
        </div>
        <PlaybackControls
          onPlay={handlePlay}
          onPause={handlePause}
          onStop={handleStop}
          isPlaying={state.isPlaying}
          isPaused={state.isPaused}
          disabled={!state.morseCode || !!state.error || !state.isInitialized}
        />
      </div>
      </div>
    </ErrorBoundary>
  );
}

export default App;
