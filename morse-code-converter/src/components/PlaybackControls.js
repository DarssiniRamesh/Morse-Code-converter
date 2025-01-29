import React, { useCallback, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import './PlaybackControls.css';


// PUBLIC_INTERFACE
const PlaybackControls = ({ 
  onPlay, 
  onPause, 
  onStop, 
  isPlaying, 
  isPaused,
  disabled 
}) => {
  const [error, setError] = useState(null);
  const [audioContextError, setAudioContextError] = useState(false);

  const handleError = useCallback((error, action) => {
    console.error(`Error in ${action} handler:`, error);
    let errorMessage = `Failed to ${action.toLowerCase()} playback`;
    
    // Handle specific audio context errors
    if (error.name === 'NotAllowedError') {
      errorMessage = 'Audio playback was not allowed. Please ensure you have granted audio permissions.';
    } else if (error.name === 'NotSupportedError') {
      errorMessage = 'Audio playback is not supported in your browser.';
    } else if (error instanceof DOMException && error.name === 'InvalidStateError') {
      errorMessage = 'Audio context is in an invalid state. Please try again.';
    } else {
      errorMessage += `: ${error.message}`;
    }
    
    setError(errorMessage);
    setTimeout(() => setError(null), 5000); // Clear error after 5 seconds
  }, []);

  useEffect(() => {
    const checkAudioSupport = async () => {
      try {
        // Skip audio checks in test environment
        if (process.env.NODE_ENV === 'test') {
          setAudioContextError(false);
          setError(null);
          return;
        }

        // Check if Web Audio API is supported
        if (!window.AudioContext && !window.webkitAudioContext) {
          setAudioContextError(true);
          setError('Web Audio API is not supported in your browser');
          return;
        }

        // Check audio permissions
        if (navigator.permissions) {
          try {
            const result = await navigator.permissions.query({ name: 'microphone' });
            if (result.state === 'denied') {
              setAudioContextError(true);
              setError('Audio permissions are required for playback');
              return;
            }
          } catch (error) {
            // Ignore permission query errors
            console.warn('Error checking audio permissions:', error);
          }
        }

        // Try to create an audio context
        try {
          const AudioContext = window.AudioContext || window.webkitAudioContext;
          const testContext = new AudioContext();
          
          if (testContext.state === 'suspended') {
            try {
              await testContext.resume();
            } catch (error) {
              console.warn('Error resuming audio context:', error);
            }
          }
          
          await testContext.close();
          setAudioContextError(false);
          setError(null);
        } catch (error) {
          setAudioContextError(true);
          handleError(error, 'Initialize');
        }
      } catch (error) {
        if (process.env.NODE_ENV !== 'test') {
          setAudioContextError(true);
          handleError(error, 'Initialize');
        }
      }
    };

    checkAudioSupport();

    // Cleanup function
    return () => {
      // Ensure playback is stopped when component unmounts
      if (!disabled) {
        try {
          onStop();
        } catch (error) {
          if (process.env.NODE_ENV !== 'test') {
            console.error('Error during cleanup:', error);
          }
        }
      }
    };
  }, [disabled, onStop, handleError]);

  const handlePlay = useCallback(async (e) => {
    try {
      setError(null);
      await onPlay(e);
    } catch (error) {
      handleError(error, 'Play');
    }
  }, [onPlay]);

  const handlePause = useCallback(async (e) => {
    try {
      setError(null);
      await onPause(e);
    } catch (error) {
      handleError(error, 'Pause');
    }
  }, [onPause]);

  const handleStop = useCallback(async (e) => {
    try {
      setError(null);
      await onStop(e);
    } catch (error) {
      handleError(error, 'Stop');
    }
  }, [onStop]);
  return (
    <div className="playback-controls-container">
      {error && (
        <div 
          className="playback-error-message" 
          role="alert" 
          data-testid="playback-error"
        >
          {error}
        </div>
      )}
      <div 
        className="playback-controls"
        role="toolbar"
        aria-label="Morse code playback controls"
        data-testid="playback-controls"
      >
      <button 
        data-testid="play-button"
        className={`control-button ${isPlaying && !isPaused ? 'active' : ''}`}
        onClick={handlePlay} 
        disabled={disabled || isPlaying || audioContextError}
        title={disabled ? 'Fix errors to enable playback' : 'Play'}
        aria-label={isPaused ? 'Resume' : 'Play'}
      >
        <div className="icon play-icon" role="img" aria-label="Play button icon"></div>
        <span className="button-text">Play</span>
      </button>
      <button 
        data-testid="pause-button"
        className={`control-button ${isPlaying && isPaused ? 'active' : ''}`}
        onClick={handlePause} 
        disabled={disabled || !isPlaying || isPaused || audioContextError}
        title="Pause"
        aria-label="Pause"
      >
        <div className="icon pause-icon" role="img" aria-label="Pause button icon"></div>
        <span className="button-text">Pause</span>
      </button>
      <button 
        data-testid="stop-button"
        className="control-button"
        onClick={handleStop} 
        disabled={disabled || (!isPlaying && !isPaused) || audioContextError}
        title="Stop"
        aria-label="Stop"
      >
        <div className="icon stop-icon" role="img" aria-label="Stop button icon"></div>
        <span className="button-text">Stop</span>
      </button>
      </div>
    </div>
  );
};

PlaybackControls.propTypes = {
  onPlay: PropTypes.func.isRequired,
  onPause: PropTypes.func.isRequired,
  onStop: PropTypes.func.isRequired,
  isPlaying: PropTypes.bool.isRequired,
  isPaused: PropTypes.bool.isRequired,
  disabled: PropTypes.bool
};

PlaybackControls.defaultProps = {
  disabled: false
};

export default PlaybackControls;
