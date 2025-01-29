import React from 'react';
import './TextInput.css';

// PUBLIC_INTERFACE
const TextInput = ({ value, onChange, error }) => {
  return (
    <div className="text-input-container">
      <label htmlFor="text-input">Enter Text</label>
      <textarea
        id="text-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Type your message here..."
        style={{ 
          fontFamily: 'JetBrains Mono',
          borderColor: error ? '#ff4444' : undefined
        }}
      />
      {error && <div className="error-message">{error}</div>}
    </div>
  );
};

export default TextInput;
