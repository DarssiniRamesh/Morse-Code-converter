import React from 'react';
import './TextOutput.css';

// PUBLIC_INTERFACE
const TextOutput = ({ morseCode, error }) => {
  return (
    <div className="text-output-container">
      <label htmlFor="morse-output">Morse Code</label>
      <div
        id="morse-output"
        role="textbox"
        aria-label="Morse Code"
        className="morse-output"
        style={{ 
          fontFamily: 'JetBrains Mono',
          opacity: error ? 0.5 : 1,
          color: error ? '#666' : undefined
        }}
      >
        {morseCode || ''}
      </div>
    </div>
  );
};

export default TextOutput;
