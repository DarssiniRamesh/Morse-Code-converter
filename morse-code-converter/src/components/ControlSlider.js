import React, { useEffect, useRef } from 'react';
import './ControlSlider.css';

// PUBLIC_INTERFACE
const ControlSlider = ({ label, value, onChange, min, max }) => {
  const sliderRef = useRef(null);

  useEffect(() => {
    if (sliderRef.current) {
      const percent = ((value - min) / (max - min)) * 100;
      sliderRef.current.style.setProperty('--value-percent', `${percent}%`);
    }
  }, [value, min, max]);
  return (
    <div className="control-slider">
      <label htmlFor={`${label.toLowerCase()}-slider`}>
        {label}:&nbsp;
        <span className="value">
          {value}
          {label === 'Speed' ? ' WPM' : label === 'Pitch' ? ' Hz' : '%'}
        </span>
      </label>
      <input
        ref={sliderRef}
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        id={`${label.toLowerCase()}-slider`}
        aria-label={`${label} control`}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
      />
    </div>
  );
};

export default ControlSlider;
