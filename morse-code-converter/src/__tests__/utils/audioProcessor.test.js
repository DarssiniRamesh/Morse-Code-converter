import MorseAudioProcessor from '../../utils/audioProcessor';

// Mock Web Audio API
class MockAudioContext {
    constructor() {
        this.state = 'suspended';
        this.currentTime = 0;
    }

    createOscillator() {
        return new MockOscillatorNode(this);
    }

    createGain() {
        return new MockGainNode(this);
    }

    close() {
        this.state = 'closed';
    }
}

class MockOscillatorNode {
    constructor(context) {
        this.context = context;
        this.frequency = {
            setValueAtTime: jest.fn()
        };
        this.connect = jest.fn();
        this.disconnect = jest.fn();
        this.start = jest.fn();
        this.stop = jest.fn();
    }
}

class MockGainNode {
    constructor(context) {
        this.context = context;
        this.gain = {
            setValueAtTime: jest.fn()
        };
        this.connect = jest.fn();
    }
}

// Mock window.AudioContext
window.AudioContext = MockAudioContext;

describe('MorseAudioProcessor', () => {
    let audioProcessor;
    
    beforeEach(() => {
        audioProcessor = new MorseAudioProcessor();
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.clearAllTimers();
        jest.useRealTimers();
    });

    describe('Parameter validation', () => {
        test('setSpeed should clamp WPM between 5 and 50', () => {
            audioProcessor.setSpeed(3);
            expect(audioProcessor.settings.wpm).toBe(5);

            audioProcessor.setSpeed(60);
            expect(audioProcessor.settings.wpm).toBe(50);

            audioProcessor.setSpeed(25);
            expect(audioProcessor.settings.wpm).toBe(25);
        });

        test('setPitch should clamp frequency between 200 and 1000 Hz', () => {
            audioProcessor.setPitch(100);
            expect(audioProcessor.settings.pitch).toBe(200);

            audioProcessor.setPitch(1200);
            expect(audioProcessor.settings.pitch).toBe(1000);

            audioProcessor.setPitch(550);
            expect(audioProcessor.settings.pitch).toBe(550);
        });

        test('setVolume should clamp volume between 0 and 1', () => {
            audioProcessor.setVolume(-0.5);
            expect(audioProcessor.settings.volume).toBe(0);

            audioProcessor.setVolume(1.5);
            expect(audioProcessor.settings.volume).toBe(1);

            audioProcessor.setVolume(0.8);
            expect(audioProcessor.settings.volume).toBe(0.8);
        });
    });

    describe('Audio context creation and cleanup', () => {
        test('initAudioContext should create audio context and gain node', () => {
            audioProcessor.initAudioContext();
            expect(audioProcessor.audioContext).toBeInstanceOf(MockAudioContext);
            expect(audioProcessor.gainNode).toBeInstanceOf(MockGainNode);
        });

        test('stop should clean up audio context and nodes', () => {
            audioProcessor.initAudioContext();
            audioProcessor.stop();
            expect(audioProcessor.audioContext).toBeNull();
            expect(audioProcessor.gainNode).toBeNull();
            expect(audioProcessor.oscillator).toBeNull();
        });
    });

    describe('Playback controls', () => {
        beforeEach(() => {
            audioProcessor.initAudioContext();
        });

        test('play should start playback correctly', async () => {
            const playPromise = audioProcessor.play('.-');
            expect(audioProcessor.isPlaying).toBe(true);
            expect(audioProcessor.isPaused).toBe(false);
            
            // Fast-forward through the playback
            jest.runAllTimers();
            await playPromise;
            
            expect(audioProcessor.isPlaying).toBe(false);
        });

        test('pause should stop playback and clear timeouts', () => {
            audioProcessor.play('.-');
            audioProcessor.pause();
            
            expect(audioProcessor.isPaused).toBe(true);
            expect(audioProcessor.timeouts.length).toBe(0);
        });

        test('stop should end playback and clean up', () => {
            audioProcessor.play('.-');
            audioProcessor.stop();
            
            expect(audioProcessor.isPlaying).toBe(false);
            expect(audioProcessor.isPaused).toBe(false);
            expect(audioProcessor.timeouts.length).toBe(0);
            expect(audioProcessor.audioContext).toBeNull();
        });
    });

    describe('Timing calculations', () => {
        test('getUnitDuration should calculate correct timing based on WPM', () => {
            audioProcessor.setSpeed(20); // 20 WPM
            expect(audioProcessor.getUnitDuration()).toBeCloseTo(0.06); // 1.2/20

            audioProcessor.setSpeed(10); // 10 WPM
            expect(audioProcessor.getUnitDuration()).toBeCloseTo(0.12); // 1.2/10
        });
    });

    describe('Error handling', () => {
        test('play should handle empty input', async () => {
            const result = await audioProcessor.play('');
            expect(result).toBeUndefined();
            expect(audioProcessor.isPlaying).toBe(false);
        });

        test('play should handle null input', async () => {
            const result = await audioProcessor.play(null);
            expect(result).toBeUndefined();
            expect(audioProcessor.isPlaying).toBe(false);
        });

        test('pause should handle calls when not playing', () => {
            audioProcessor.pause();
            expect(audioProcessor.isPaused).toBe(false);
        });

        test('resume should handle calls when not paused', () => {
            audioProcessor.resume();
            expect(audioProcessor.isPaused).toBe(false);
        });
    });
});