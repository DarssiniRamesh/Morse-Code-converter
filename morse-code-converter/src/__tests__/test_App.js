import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import App from '../App';
import { textToMorse, isValidMorseChar } from '../utils/morseCodeConverter';
import MorseAudioProcessor from '../utils/audioProcessor';

// Mock the morseCodeConverter utility
jest.mock('../utils/morseCodeConverter', () => {
  const morseMap = {
    'A': '.-', 'B': '-...', 'C': '-.-.', 'D': '-..', 'E': '.', 'F': '..-.',
    'G': '--.', 'H': '....', 'I': '..', 'J': '.---', 'K': '-.-', 'L': '.-..',
    'M': '--', 'N': '-.', 'O': '---', 'P': '.--.', 'Q': '--.-', 'R': '.-.',
    'S': '...', 'T': '-', 'U': '..-', 'V': '...-', 'W': '.--', 'X': '-..-',
    'Y': '-.--', 'Z': '--..', '0': '-----', '1': '.----', '2': '..---',
    '3': '...--', '4': '....-', '5': '.....', '6': '-....', '7': '--...',
    '8': '---..', '9': '----.', ' ': ' '
  };

  return {
    textToMorse: jest.fn(text => {
      return text.toUpperCase().split('').map(char => morseMap[char] || char).join(' ');
    }),
    isValidMorseChar: jest.fn(char => /[A-Za-z0-9\s]/.test(char)),
  };
});

// Mock the audio processor
jest.mock('../utils/audioProcessor', () => {
  const mockProcessor = {
    setSpeed: jest.fn(),
    setPitch: jest.fn(),
    setVolume: jest.fn(),
    play: jest.fn().mockResolvedValue(undefined),
    pause: jest.fn(),
    stop: jest.fn(),
    isPlaying: false,
    isPaused: false,
  };
  return jest.fn(() => mockProcessor);
});

// Mock window.AudioContext and webkitAudioContext
const mockAudioContext = {
  createOscillator: jest.fn().mockReturnValue({
    connect: jest.fn(),
    start: jest.fn(),
    stop: jest.fn(),
    disconnect: jest.fn(),
    frequency: {
      setValueAtTime: jest.fn(),
    },
  }),
  createGain: jest.fn().mockReturnValue({
    connect: jest.fn(),
    gain: {
      setValueAtTime: jest.fn(),
    },
  }),
  currentTime: 0,
  destination: {},
  state: 'running',
  resume: jest.fn().mockResolvedValue(undefined),
  suspend: jest.fn().mockResolvedValue(undefined),
  close: jest.fn().mockResolvedValue(undefined),
};

const AudioContextMock = jest.fn(() => mockAudioContext);
AudioContextMock.prototype = mockAudioContext;

global.AudioContext = AudioContextMock;
global.webkitAudioContext = AudioContextMock;

// Mock permissions API
if (!global.navigator.permissions) {
  global.navigator.permissions = {
    query: jest.fn().mockResolvedValue({ state: 'granted' })
  };
}

describe('App Component', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    
    // Reset AudioContext mock
    const AudioContextMock = jest.fn(() => mockAudioContext);
    AudioContextMock.prototype = mockAudioContext;
    global.AudioContext = AudioContextMock;
    global.webkitAudioContext = AudioContextMock;

    // Reset permissions API mock
    if (!global.navigator.permissions) {
      global.navigator.permissions = {
        query: jest.fn().mockResolvedValue({ state: 'granted' })
      };
    }
  });

  afterEach(() => {
    // Clean up any timers
    jest.useRealTimers();
  });
  test('renders app title', () => {
    render(<App />);
    expect(screen.getByText('Morse Code Converter')).toBeInTheDocument();
  });

  test('renders all child components', () => {
    render(<App />);
    
    // TextInput
    expect(screen.getByLabelText('Enter Text')).toBeInTheDocument();
    
    // TextOutput
    expect(screen.getByText('Morse Code')).toBeInTheDocument();
    
    // ControlSliders
    expect(screen.getByLabelText(/Speed:/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Pitch:/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Volume:/)).toBeInTheDocument();
    
    // PlaybackControls
    expect(screen.getByText('Play')).toBeInTheDocument();
    expect(screen.getByText('Pause')).toBeInTheDocument();
    expect(screen.getByText('Stop')).toBeInTheDocument();
  });

  test('handles text input and updates morse code output', async () => {
    render(<App />);
    
    const input = screen.getByLabelText('Enter Text');
    fireEvent.change(input, { target: { value: 'Hello' } });
    
    // Verify textToMorse was called with correct input
    expect(textToMorse).toHaveBeenCalledWith('Hello');
    
    // Verify output is updated
    const output = screen.getByRole('textbox', { name: 'Morse Code' });
    expect(output).toHaveTextContent('.... . .-.. .-.. ---');

    // Test with special characters
    fireEvent.change(input, { target: { value: 'Hi!' } });
    expect(textToMorse).toHaveBeenCalledWith('Hi!');
  });

  test('handles empty and invalid input correctly', () => {
    render(<App />);
    
    const input = screen.getByLabelText('Enter Text');
    const output = screen.getByRole('textbox', { name: 'Morse Code' });

    // Test empty input
    fireEvent.change(input, { target: { value: '' } });
    expect(textToMorse).toHaveBeenCalledWith('');
    expect(output).toHaveTextContent('');

    // Test whitespace input
    fireEvent.change(input, { target: { value: '   ' } });
    expect(textToMorse).toHaveBeenCalledWith('   ');

    // Test invalid characters
    fireEvent.change(input, { target: { value: 'Hello@#$' } });
    expect(screen.getByText('Invalid characters: @#$')).toBeInTheDocument();
  });

  test('handles error states correctly', () => {
    // Mock textToMorse to throw an error
    textToMorse.mockImplementationOnce(() => {
      throw new Error('Conversion error');
    });

    render(<App />);
    const input = screen.getByLabelText('Enter Text');
    
    fireEvent.change(input, { target: { value: 'Test' } });
    expect(screen.getByText('Error converting text to Morse code')).toBeInTheDocument();
  });

  test('control sliders have correct initial values', () => {
    render(<App />);
    
    const speedSlider = screen.getByLabelText(/Speed:/);
    const pitchSlider = screen.getByLabelText(/Pitch:/);
    const volumeSlider = screen.getByLabelText(/Volume:/);
    
    expect(speedSlider).toHaveValue('20');
    expect(pitchSlider).toHaveValue('550');
    expect(volumeSlider).toHaveValue('80');
  });

  test('control sliders update when changed', () => {
    render(<App />);
    
    const speedSlider = screen.getByLabelText(/Speed:/);
    fireEvent.change(speedSlider, { target: { value: '30' } });
    expect(speedSlider).toHaveValue('30');
    
    const pitchSlider = screen.getByLabelText(/Pitch:/);
    fireEvent.change(pitchSlider, { target: { value: '600' } });
    expect(pitchSlider).toHaveValue('600');
    
    const volumeSlider = screen.getByLabelText(/Volume:/);
    fireEvent.change(volumeSlider, { target: { value: '90' } });
    expect(volumeSlider).toHaveValue('90');
  });

  test('control sliders respect min and max values', () => {
    render(<App />);
    
    const speedSlider = screen.getByLabelText(/Speed:/);
    expect(speedSlider).toHaveAttribute('min', '5');
    expect(speedSlider).toHaveAttribute('max', '50');
    
    const pitchSlider = screen.getByLabelText(/Pitch:/);
    expect(pitchSlider).toHaveAttribute('min', '200');
    expect(pitchSlider).toHaveAttribute('max', '1000');
    
    const volumeSlider = screen.getByLabelText(/Volume:/);
    expect(volumeSlider).toHaveAttribute('min', '0');
    expect(volumeSlider).toHaveAttribute('max', '100');
  });

  test('playback controls handle audio correctly', async () => {
    // Mock the audio processor instance before rendering
    const mockAudioProcessor = {
      play: jest.fn().mockResolvedValue(undefined),
      pause: jest.fn(),
      stop: jest.fn(),
      setSpeed: jest.fn(),
      setPitch: jest.fn(),
      setVolume: jest.fn(),
      isPlaying: false,
      isPaused: false
    };
    
    MorseAudioProcessor.mockImplementation(() => mockAudioProcessor);

    render(<App />);
    
    const input = screen.getByLabelText('Enter Text');
    const playButton = screen.getByText('Play');
    const pauseButton = screen.getByText('Pause');
    const stopButton = screen.getByText('Stop');

    // Initially, playback controls should be disabled
    expect(playButton).toBeDisabled();
    expect(pauseButton).toBeDisabled();
    expect(stopButton).toBeDisabled();

    // Enter valid text to enable controls
    await act(async () => {
      fireEvent.change(input, { target: { value: 'TEST' } });
    });

    // Wait for state updates
    await waitFor(() => {
      expect(playButton).not.toBeDisabled();
    });

    // Test play functionality
    await act(async () => {
      fireEvent.click(playButton);
      await mockAudioProcessor.play();
    });

    expect(mockAudioProcessor.play).toHaveBeenCalledWith('- . ... -');  // Morse code for 'TEST'

    // Test pause functionality
    await act(async () => {
      fireEvent.click(pauseButton);
    });
    expect(mockAudioProcessor.pause).toHaveBeenCalled();

    // Test stop functionality
    await act(async () => {
      fireEvent.click(stopButton);
    });
    expect(mockAudioProcessor.stop).toHaveBeenCalled();
  });

  test('audio processor settings update correctly', () => {
    render(<App />);
    
    const speedSlider = screen.getByLabelText(/Speed:/);
    const pitchSlider = screen.getByLabelText(/Pitch:/);
    const volumeSlider = screen.getByLabelText(/Volume:/);
    
    const mockAudioProcessor = MorseAudioProcessor.mock.results[0].value;

    // Test speed update
    fireEvent.change(speedSlider, { target: { value: '30' } });
    expect(mockAudioProcessor.setSpeed).toHaveBeenCalledWith(30);

    // Test pitch update
    fireEvent.change(pitchSlider, { target: { value: '600' } });
    expect(mockAudioProcessor.setPitch).toHaveBeenCalledWith(600);

    // Test volume update
    fireEvent.change(volumeSlider, { target: { value: '90' } });
    expect(mockAudioProcessor.setVolume).toHaveBeenCalledWith(0.9); // Should convert to 0-1 range
  });

  test('control sliders update state and trigger callbacks', () => {
    render(<App />);
    
    // Test speed slider
    const speedSlider = screen.getByLabelText(/Speed:/);
    fireEvent.change(speedSlider, { target: { value: '30' } });
    expect(speedSlider.value).toBe('30');
    
    // Test pitch slider with boundary values
    const pitchSlider = screen.getByLabelText(/Pitch:/);
    fireEvent.change(pitchSlider, { target: { value: '200' } }); // min value
    expect(pitchSlider.value).toBe('200');
    fireEvent.change(pitchSlider, { target: { value: '1000' } }); // max value
    expect(pitchSlider.value).toBe('1000');
    
    // Test volume slider with boundary values
    const volumeSlider = screen.getByLabelText(/Volume:/);
    fireEvent.change(volumeSlider, { target: { value: '0' } }); // min value
    expect(volumeSlider.value).toBe('0');
    fireEvent.change(volumeSlider, { target: { value: '100' } }); // max value
    expect(volumeSlider.value).toBe('100');
  });

  test('component maintains correct state after multiple updates', () => {
    render(<App />);
    
    // Update text input
    const input = screen.getByLabelText('Enter Text');
    fireEvent.change(input, { target: { value: 'Test' } });
    
    // Update controls
    const speedSlider = screen.getByLabelText(/Speed:/);
    const pitchSlider = screen.getByLabelText(/Pitch:/);
    const volumeSlider = screen.getByLabelText(/Volume:/);
    
    fireEvent.change(speedSlider, { target: { value: '25' } });
    fireEvent.change(pitchSlider, { target: { value: '600' } });
    fireEvent.change(volumeSlider, { target: { value: '90' } });
    
    // Verify all states are maintained
    expect(input.value).toBe('Test');
    expect(speedSlider.value).toBe('25');
    expect(pitchSlider.value).toBe('600');
    expect(volumeSlider.value).toBe('90');
    
    // Verify Morse code conversion was called
    expect(textToMorse).toHaveBeenCalledWith('Test');

    const mockAudioProcessor = MorseAudioProcessor.mock.results[0].value;
    expect(mockAudioProcessor.setSpeed).toHaveBeenCalledWith(25);
    expect(mockAudioProcessor.setPitch).toHaveBeenCalledWith(600);
    expect(mockAudioProcessor.setVolume).toHaveBeenCalledWith(0.9);
  });

  test('audio processor cleanup on unmount', () => {
    const { unmount } = render(<App />);
    const mockAudioProcessor = MorseAudioProcessor.mock.results[0].value;
    
    unmount();
    expect(mockAudioProcessor.stop).toHaveBeenCalled();
  });

  test('handles audio playback errors gracefully', async () => {
    const mockAudioProcessor = MorseAudioProcessor.mock.results[0].value;
    mockAudioProcessor.play.mockRejectedValueOnce(new Error('Audio playback error'));

    render(<App />);
    
    const input = screen.getByLabelText('Enter Text');
    fireEvent.change(input, { target: { value: 'Test' } });

    const playButton = screen.getByText('Play');
    
    await act(async () => {
      fireEvent.click(playButton);
    });

    expect(screen.getByText('Error playing Morse code audio')).toBeInTheDocument();
  });
});
