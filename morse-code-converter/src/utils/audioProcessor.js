import { getSymbolTiming } from './morseCodeConverter';

// PUBLIC_INTERFACE
/**
 * Audio processor for Morse code playback using Web Audio API
 */
class MorseAudioProcessor {
    constructor() {
        this.audioContext = null;
        this.oscillator = null;
        this.gainNode = null;
        this.isPlaying = false;
        this.isPaused = false;
        this.currentTimeout = null;
        this.timeouts = [];
        
        // Default settings
        this.settings = {
            wpm: 20,          // Words per minute
            pitch: 550,       // Frequency in Hz
            volume: 0.8,      // Volume (0-1)
        };
    }

    // PUBLIC_INTERFACE
    /**
     * Initialize the audio context
     */
    async initAudioContext() {
        if (!this.audioContext) {
            try {
                const AudioContext = window.AudioContext || window.webkitAudioContext;
                if (!AudioContext) {
                    throw new Error('Web Audio API is not supported in your browser');
                }

                // Check audio permissions if available
                if (navigator.permissions) {
                    const result = await navigator.permissions.query({ name: 'microphone' });
                    if (result.state === 'denied') {
                        throw new Error('Audio permissions are required for playback');
                    }
                }

                this.audioContext = new AudioContext();
                await this.audioContext.resume();

                this.gainNode = this.audioContext.createGain();
                this.gainNode.connect(this.audioContext.destination);
                this.setVolume(this.settings.volume);
            } catch (error) {
                console.error('Error initializing audio context:', error);
                throw error;
            }
        } else if (this.audioContext.state === 'suspended') {
            await this.audioContext.resume();
        }
    }

    // PUBLIC_INTERFACE
    /**
     * Set the playback speed in words per minute
     * @param {number} wpm - Words per minute (default: 20)
     */
    setSpeed(wpm) {
        this.settings.wpm = Math.max(5, Math.min(50, wpm));
    }

    // PUBLIC_INTERFACE
    /**
     * Set the pitch/frequency of the tone
     * @param {number} frequency - Frequency in Hz (default: 550)
     */
    setPitch(frequency) {
        this.settings.pitch = Math.max(200, Math.min(1000, frequency));
        if (this.oscillator) {
            this.oscillator.frequency.setValueAtTime(this.settings.pitch, this.audioContext.currentTime);
        }
    }

    // PUBLIC_INTERFACE
    /**
     * Set the volume level
     * @param {number} volume - Volume level 0-1 (default: 0.8)
     */
    setVolume(volume) {
        this.settings.volume = Math.max(0, Math.min(1, volume));
        if (this.gainNode) {
            this.gainNode.gain.setValueAtTime(this.settings.volume, this.audioContext.currentTime);
        }
    }

    /**
     * Calculate the duration of one unit in seconds based on WPM
     * @returns {number} Duration of one unit in seconds
     */
    getUnitDuration() {
        // Paris standard: PARIS = 50 units
        // at 1 WPM, PARIS takes 60 seconds
        // so 1 unit = 1.2 seconds at 1 WPM
        return 1.2 / this.settings.wpm;
    }

    /**
     * Start playing a tone
     */
    async startTone() {
        if (!this.oscillator) {
            try {
                this.oscillator = this.audioContext.createOscillator();
                this.oscillator.type = 'sine';
                this.oscillator.frequency.setValueAtTime(this.settings.pitch, this.audioContext.currentTime);
                this.oscillator.connect(this.gainNode);
                this.oscillator.start();
            } catch (error) {
                console.error('Error starting tone:', error);
                throw error;
            }
        }
    }

    /**
     * Stop playing the tone
     */
    async stopTone() {
        if (this.oscillator) {
            try {
                this.oscillator.stop();
                this.oscillator.disconnect();
                this.oscillator = null;
            } catch (error) {
                console.error('Error stopping tone:', error);
                throw error;
            }
        }
    }

    // PUBLIC_INTERFACE
    /**
     * Play a Morse code message
     * @param {string} morseCode - The Morse code to play
     * @returns {Promise} Resolves when playback is complete
     */
    async play(morseCode) {
        if (!morseCode || this.isPlaying) return;
        
        try {
            await this.initAudioContext();
            this.isPlaying = true;
            this.isPaused = false;
            
            const unitDuration = this.getUnitDuration();
            let currentTime = 0;
            
            for (let i = 0; i < morseCode.length; i++) {
                if (!this.isPlaying || this.isPaused) break;
                
                const symbol = morseCode[i];
                const duration = unitDuration * getSymbolTiming(symbol);
                
                if (symbol === '.' || symbol === '-') {
                    const timeout = setTimeout(async () => {
                        try {
                            await this.startTone();
                            setTimeout(async () => {
                                try {
                                    await this.stopTone();
                                } catch (error) {
                                    console.error('Error stopping tone:', error);
                                }
                            }, duration * 1000);
                        } catch (error) {
                            console.error('Error starting tone:', error);
                        }
                    }, currentTime * 1000);
                    
                    this.timeouts.push(timeout);
                    currentTime += duration;
                    
                    // Add space between symbols within a character
                    if (i < morseCode.length - 1 && morseCode[i + 1] !== ' ') {
                        currentTime += unitDuration;
                    }
                } else if (symbol === ' ') {
                    currentTime += duration;
                }
            }

            return new Promise((resolve, reject) => {
                this.currentTimeout = setTimeout(async () => {
                    try {
                        await this.stop();
                        resolve();
                    } catch (error) {
                        reject(error);
                    }
                }, currentTime * 1000);
                this.timeouts.push(this.currentTimeout);
            });
        } catch (error) {
            console.error('Error in play:', error);
            throw error;
        }
    }

    // PUBLIC_INTERFACE
    /**
     * Pause the playback
     */
    pause() {
        if (!this.isPlaying || this.isPaused) return;
        
        this.isPaused = true;
        this.stopTone();
        this.timeouts.forEach(timeout => clearTimeout(timeout));
        this.timeouts = [];
    }

    // PUBLIC_INTERFACE
    /**
     * Resume the playback
     */
    resume() {
        if (!this.isPlaying || !this.isPaused) return;
        
        this.isPaused = false;
        // Implement resume functionality if needed
    }

    // PUBLIC_INTERFACE
    /**
     * Stop the playback
     */
    async stop() {
        try {
            this.isPlaying = false;
            this.isPaused = false;
            await this.stopTone();
            this.timeouts.forEach(timeout => clearTimeout(timeout));
            this.timeouts = [];
            
            if (this.audioContext) {
                if (this.audioContext.state !== 'closed') {
                    try {
                        await this.audioContext.close();
                    } catch (error) {
                        console.error('Error closing audio context:', error);
                    }
                }
                this.audioContext = null;
                this.gainNode = null;
            }
        } catch (error) {
            console.error('Error in stop:', error);
            throw error;
        }
    }
}

export default MorseAudioProcessor;
