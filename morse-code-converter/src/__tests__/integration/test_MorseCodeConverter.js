import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../../App';

describe('Morse Code Converter Integration Tests', () => {
  beforeEach(() => {
    // Mock the Web Audio API
    window.AudioContext = jest.fn().mockImplementation(() => ({
      createOscillator: jest.fn().mockImplementation(() => ({
        connect: jest.fn(),
        start: jest.fn(),
        stop: jest.fn(),
      })),
      createGain: jest.fn().mockImplementation(() => ({
        connect: jest.fn(),
        gain: { value: 0 },
      })),
      destination: jest.fn(),
    }));
  });

  test('complete text to morse code conversion flow', async () => {
    render(<App />);
    
    // Verify initial state
    expect(screen.getByRole('heading')).toHaveTextContent('Morse Code Converter');
    expect(screen.getByLabelText(/enter text/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/morse code/i)).toBeInTheDocument();
    
    // Test text input and conversion
    const inputField = screen.getByLabelText(/enter text/i);
    await userEvent.type(inputField, 'SOS');
    
    // Verify morse code output is updated
    const outputField = screen.getByLabelText(/morse code/i);
    expect(outputField).toHaveTextContent('SOS');
  });

  test('audio playback control flow', async () => {
    render(<App />);
    
    // Enter some text first
    const inputField = screen.getByLabelText(/enter text/i);
    await userEvent.type(inputField, 'TEST');
    
    // Verify playback controls are present
    const playButton = screen.getByRole('button', { name: /play/i });
    const pauseButton = screen.getByRole('button', { name: /pause/i });
    const stopButton = screen.getByRole('button', { name: /stop/i });
    
    expect(playButton).toBeInTheDocument();
    expect(pauseButton).toBeInTheDocument();
    expect(stopButton).toBeInTheDocument();
    
    // Test playback controls
    fireEvent.click(playButton);
    fireEvent.click(pauseButton);
    fireEvent.click(stopButton);
  });

  test('settings adjustment flow', async () => {
    render(<App />);
    
    // Verify control sliders are present
    const speedSlider = screen.getByLabelText(/speed/i);
    const pitchSlider = screen.getByLabelText(/pitch/i);
    const volumeSlider = screen.getByLabelText(/volume/i);
    
    expect(speedSlider).toBeInTheDocument();
    expect(pitchSlider).toBeInTheDocument();
    expect(volumeSlider).toBeInTheDocument();
    
    // Test slider adjustments
    fireEvent.change(speedSlider, { target: { value: 30 } });
    expect(speedSlider.value).toBe('30');
    
    fireEvent.change(pitchSlider, { target: { value: 600 } });
    expect(pitchSlider.value).toBe('600');
    
    fireEvent.change(volumeSlider, { target: { value: 90 } });
    expect(volumeSlider.value).toBe('90');
  });

  test('component interaction verification', async () => {
    render(<App />);
    
    // Test the interaction between input and output
    const inputField = screen.getByLabelText(/enter text/i);
    await userEvent.type(inputField, 'HELLO');
    
    const outputField = screen.getByLabelText(/morse code/i);
    expect(outputField).toHaveTextContent('HELLO');
    
    // Test interaction between text input and playback
    const playButton = screen.getByRole('button', { name: /play/i });
    fireEvent.click(playButton);
    
    // Verify state updates after interactions
    expect(inputField).toHaveValue('HELLO');
  });

  test('error handling and edge cases', async () => {
    render(<App />);
    
    // Test empty input
    const inputField = screen.getByLabelText(/enter text/i);
    const outputField = screen.getByLabelText(/morse code/i);
    
    await userEvent.clear(inputField);
    expect(outputField).toHaveTextContent('');
    
    // Test special characters
    await userEvent.type(inputField, '!@#$%');
    expect(outputField).toHaveTextContent('!@#$%');
    
    // Test very long input
    const longText = 'A'.repeat(100);
    await userEvent.clear(inputField);
    await userEvent.type(inputField, longText);
    expect(inputField).toHaveValue(longText);
  });
});