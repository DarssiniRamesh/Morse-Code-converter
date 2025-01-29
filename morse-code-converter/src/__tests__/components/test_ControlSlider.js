import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ControlSlider from '../../components/ControlSlider';

describe('ControlSlider Component', () => {
  const defaultProps = {
    label: 'Test',
    value: 50,
    onChange: () => {},
    min: 0,
    max: 100
  };

  test('renders slider with label', () => {
    render(<ControlSlider {...defaultProps} />);
    expect(screen.getByLabelText(/Test: 50%/)).toBeInTheDocument();
  });

  test('displays WPM unit for Speed label', () => {
    render(<ControlSlider {...defaultProps} label="Speed" />);
    expect(screen.getByText(/Speed: 50 WPM/)).toBeInTheDocument();
  });

  test('displays Hz unit for Pitch label', () => {
    render(<ControlSlider {...defaultProps} label="Pitch" />);
    expect(screen.getByText(/Pitch: 50 Hz/)).toBeInTheDocument();
  });

  test('displays % unit for other labels', () => {
    render(<ControlSlider {...defaultProps} label="Volume" />);
    expect(screen.getByText(/Volume: 50%/)).toBeInTheDocument();
  });

  test('calls onChange handler when slider value changes', () => {
    const mockOnChange = jest.fn();
    render(<ControlSlider {...defaultProps} onChange={mockOnChange} />);
    
    const slider = screen.getByRole('slider');
    fireEvent.change(slider, { target: { value: '75' } });
    
    expect(mockOnChange).toHaveBeenCalledWith(75);
  });

  test('respects min and max values', () => {
    render(<ControlSlider {...defaultProps} min={10} max={90} />);
    const slider = screen.getByRole('slider');
    
    expect(slider).toHaveAttribute('min', '10');
    expect(slider).toHaveAttribute('max', '90');
  });

  test('uses JetBrains Mono font family', () => {
    render(<ControlSlider {...defaultProps} />);
    const slider = screen.getByRole('slider');
    expect(slider).toHaveStyle({ fontFamily: 'JetBrains Mono' });
  });
});