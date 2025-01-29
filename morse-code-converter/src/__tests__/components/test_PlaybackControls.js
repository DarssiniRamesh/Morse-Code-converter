import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import PlaybackControls from '../../components/PlaybackControls';

// Mock window.AudioContext with full implementation
const mockAudioContext = {
  state: 'running',
  resume: jest.fn().mockResolvedValue(undefined),
  close: jest.fn().mockResolvedValue(undefined),
  createOscillator: jest.fn().mockReturnValue({
    connect: jest.fn(),
    start: jest.fn(),
    stop: jest.fn(),
    frequency: { setValueAtTime: jest.fn() }
  }),
  createGain: jest.fn().mockReturnValue({
    connect: jest.fn(),
    gain: { setValueAtTime: jest.fn() }
  }),
  destination: {},
  currentTime: 0
};

describe('PlaybackControls Component', () => {
  const defaultProps = {
    onPlay: jest.fn(),
    onPause: jest.fn(),
    onStop: jest.fn(),
    isPlaying: false,
    isPaused: false,
    disabled: false
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    
    // Reset AudioContext mock before each test with proper implementation
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
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('Rendering and Basic Functionality', () => {
    test('renders all control buttons with correct data-testid attributes', () => {
      render(<PlaybackControls {...defaultProps} />);
      
      expect(screen.getByTestId('play-button')).toBeInTheDocument();
      expect(screen.getByTestId('pause-button')).toBeInTheDocument();
      expect(screen.getByTestId('stop-button')).toBeInTheDocument();
    });

    test('renders playback controls toolbar with correct accessibility attributes', () => {
      render(<PlaybackControls {...defaultProps} />);
      
      const toolbar = screen.getByTestId('playback-controls');
      expect(toolbar).toHaveAttribute('role', 'toolbar');
      expect(toolbar).toHaveAttribute('aria-label', 'Morse code playback controls');
    });

    test('buttons have correct aria-labels', () => {
      render(<PlaybackControls {...defaultProps} />);
      
      expect(screen.getByTestId('play-button')).toHaveAttribute('aria-label', 'Play');
      expect(screen.getByTestId('pause-button')).toHaveAttribute('aria-label', 'Pause');
      expect(screen.getByTestId('stop-button')).toHaveAttribute('aria-label', 'Stop');
    });
  });

  describe('Button States and Interactions', () => {
    test('play button shows "Resume" aria-label when paused', () => {
      render(<PlaybackControls {...defaultProps} isPlaying={true} isPaused={true} />);
      expect(screen.getByTestId('play-button')).toHaveAttribute('aria-label', 'Resume');
    });

    test('buttons have correct disabled states when playing', () => {
      render(<PlaybackControls {...defaultProps} isPlaying={true} isPaused={false} />);
      
      expect(screen.getByTestId('play-button')).toBeDisabled();
      expect(screen.getByTestId('pause-button')).not.toBeDisabled();
      expect(screen.getByTestId('stop-button')).not.toBeDisabled();
    });

    test('buttons have correct disabled states when paused', () => {
      const props = {
        ...defaultProps,
        isPlaying: true,
        isPaused: true
      };
      render(<PlaybackControls {...props} />);
      
      const playButton = screen.getByTestId('play-button');
      const pauseButton = screen.getByTestId('pause-button');
      const stopButton = screen.getByTestId('stop-button');
      
      expect(playButton.disabled).toBe(false);
      expect(pauseButton.disabled).toBe(true);
      expect(stopButton.disabled).toBe(false);
    });

    test('buttons have correct disabled states when stopped', () => {
      render(<PlaybackControls {...defaultProps} isPlaying={false} isPaused={false} />);
      
      expect(screen.getByTestId('play-button')).not.toBeDisabled();
      expect(screen.getByTestId('pause-button')).toBeDisabled();
      expect(screen.getByTestId('stop-button')).toBeDisabled();
    });

    test('all buttons are disabled when disabled prop is true', () => {
      render(<PlaybackControls {...defaultProps} disabled={true} />);
      
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).toBeDisabled();
      });
    });

    test('play button shows correct title when disabled', () => {
      render(<PlaybackControls {...defaultProps} disabled={true} />);
      expect(screen.getByTestId('play-button')).toHaveAttribute('title', 'Fix errors to enable playback');
    });
  });

  describe('Event Handlers and Error Handling', () => {
    test('calls onPlay when Play button is clicked', () => {
      render(<PlaybackControls {...defaultProps} />);
      fireEvent.click(screen.getByTestId('play-button'));
      expect(defaultProps.onPlay).toHaveBeenCalledTimes(1);
    });

    test('calls onPause when Pause button is clicked', () => {
      render(<PlaybackControls {...defaultProps} isPlaying={true} />);
      fireEvent.click(screen.getByTestId('pause-button'));
      expect(defaultProps.onPause).toHaveBeenCalledTimes(1);
    });

    test('calls onStop when Stop button is clicked', () => {
      render(<PlaybackControls {...defaultProps} isPlaying={true} />);
      fireEvent.click(screen.getByTestId('stop-button'));
      expect(defaultProps.onStop).toHaveBeenCalledTimes(1);
    });

    test('displays error message when play handler throws', () => {
      const errorProps = {
        ...defaultProps,
        onPlay: jest.fn(() => { throw new Error('Play failed'); })
      };
      
      render(<PlaybackControls {...errorProps} />);
      fireEvent.click(screen.getByTestId('play-button'));
      
      const errorMessage = screen.getByTestId('playback-error');
      expect(errorMessage).toBeInTheDocument();
      expect(errorMessage).toHaveTextContent('Failed to play playback: Play failed');
    });

    test('error message has correct accessibility role', () => {
      const errorProps = {
        ...defaultProps,
        onPlay: jest.fn(() => { throw new Error('Play failed'); })
      };
      
      render(<PlaybackControls {...errorProps} />);
      fireEvent.click(screen.getByTestId('play-button'));
      
      expect(screen.getByTestId('playback-error')).toHaveAttribute('role', 'alert');
    });

    test('error message disappears after 5 seconds', async () => {
      const errorProps = {
        ...defaultProps,
        onPlay: jest.fn(() => { throw new Error('Play failed'); })
      };
      
      render(<PlaybackControls {...errorProps} />);
      
      await act(async () => {
        fireEvent.click(screen.getByTestId('play-button'));
      });
      
      expect(screen.getByTestId('playback-error')).toBeInTheDocument();
      
      await act(async () => {
        jest.advanceTimersByTime(5000);
      });
      
      expect(screen.queryByTestId('playback-error')).not.toBeInTheDocument();
    });
  });

  describe('Audio Context Initialization', () => {
    test('handles unsupported AudioContext', () => {
      delete global.AudioContext;
      delete global.webkitAudioContext;
      
      render(<PlaybackControls {...defaultProps} />);
      
      expect(screen.getByTestId('playback-error')).toHaveTextContent(
        'Web Audio API is not supported in your browser'
      );
      expect(screen.getByTestId('play-button')).toBeDisabled();
    });

    test('handles NotAllowedError from AudioContext', async () => {
      const notAllowedError = new Error('User denied permission');
      notAllowedError.name = 'NotAllowedError';
      
      const errorProps = {
        ...defaultProps,
        onPlay: jest.fn(() => { throw notAllowedError; })
      };
      
      render(<PlaybackControls {...errorProps} />);
      fireEvent.click(screen.getByTestId('play-button'));
      
      expect(screen.getByTestId('playback-error')).toHaveTextContent(
        'Audio playback was not allowed. Please ensure you have granted audio permissions.'
      );
    });

    test('handles NotSupportedError from AudioContext', async () => {
      const notSupportedError = new Error('Audio not supported');
      notSupportedError.name = 'NotSupportedError';
      
      const errorProps = {
        ...defaultProps,
        onPlay: jest.fn(() => { throw notSupportedError; })
      };
      
      render(<PlaybackControls {...errorProps} />);
      fireEvent.click(screen.getByTestId('play-button'));
      
      expect(screen.getByTestId('playback-error')).toHaveTextContent(
        'Audio playback is not supported in your browser.'
      );
    });
  });

  describe('Component Cleanup', () => {
    test('calls onStop when component unmounts while playing', () => {
      const { unmount } = render(
        <PlaybackControls {...defaultProps} isPlaying={true} />
      );
      
      unmount();
      expect(defaultProps.onStop).toHaveBeenCalled();
    });

    test('does not call onStop when component unmounts while disabled', () => {
      const { unmount } = render(
        <PlaybackControls {...defaultProps} disabled={true} isPlaying={true} />
      );
      
      unmount();
      expect(defaultProps.onStop).not.toHaveBeenCalled();
    });

    test('clears error message timeout on unmount', async () => {
      const errorProps = {
        ...defaultProps,
        onPlay: jest.fn(() => { throw new Error('Test error'); })
      };
      
      const { unmount } = render(<PlaybackControls {...errorProps} />);
      
      fireEvent.click(screen.getByTestId('play-button'));
      expect(screen.getByTestId('playback-error')).toBeInTheDocument();
      
      unmount();
      
      // Advance timers and verify no errors occur
      await act(async () => {
        jest.advanceTimersByTime(5000);
      });
    });
  });

  describe('Error State Handling', () => {
    test('handles InvalidStateError from AudioContext', async () => {
      const invalidStateError = new DOMException('Invalid state', 'InvalidStateError');
      
      const errorProps = {
        ...defaultProps,
        onPlay: jest.fn(() => { throw invalidStateError; })
      };
      
      render(<PlaybackControls {...errorProps} />);
      fireEvent.click(screen.getByTestId('play-button'));
      
      expect(screen.getByTestId('playback-error')).toHaveTextContent(
        'Audio context is in an invalid state. Please try again.'
      );
    });

    test('handles multiple errors in sequence', async () => {
      const error1 = new Error('First error');
      const error2 = new Error('Second error');
      
      let callCount = 0;
      const errorProps = {
        ...defaultProps,
        onPlay: jest.fn(() => {
          callCount++;
          throw callCount === 1 ? error1 : error2;
        })
      };
      
      render(<PlaybackControls {...errorProps} />);
      
      // Trigger first error
      fireEvent.click(screen.getByTestId('play-button'));
      expect(screen.getByTestId('playback-error')).toHaveTextContent('First error');
      
      // Wait for error to clear
      await act(async () => {
        jest.advanceTimersByTime(5000);
      });
      
      // Trigger second error
      fireEvent.click(screen.getByTestId('play-button'));
      expect(screen.getByTestId('playback-error')).toHaveTextContent('Second error');
    });
  });

  describe('Visual and Style Tests', () => {
    test('buttons have correct active states', () => {
      render(<PlaybackControls {...defaultProps} isPlaying={true} isPaused={false} />);
      
      expect(screen.getByTestId('play-button')).toHaveClass('active');
      expect(screen.getByTestId('pause-button')).not.toHaveClass('active');
      expect(screen.getByTestId('stop-button')).not.toHaveClass('active');
    });

    test('buttons have correct font family', () => {
      render(<PlaybackControls {...defaultProps} />);
      
      const buttonTexts = screen.getAllByTestId(/.*-button/);
      buttonTexts.forEach(button => {
        const textSpan = button.querySelector('.button-text');
        const styles = window.getComputedStyle(textSpan);
        expect(styles.fontFamily.toLowerCase()).toContain('jetbrains mono');
      });
    });
  });
});
