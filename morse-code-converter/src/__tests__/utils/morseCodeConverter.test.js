import { 
    MORSE_CODE_MAP,
    textToMorse,
    isValidMorseChar,
    getSymbolTiming,
    calculateTotalDuration,
    isValidMorseCode,
    morseToText
} from '../../utils/morseCodeConverter';

describe('Morse Code Converter', () => {
    describe('textToMorse', () => {
        test('converts basic text to Morse code', () => {
            expect(textToMorse('SOS')).toBe('... --- ...');
            expect(textToMorse('HELLO')).toBe('.... . .-.. .-.. ---');
        });

        test('handles lowercase text correctly', () => {
            expect(textToMorse('hello')).toBe('.... . .-.. .-.. ---');
        });

        describe('Input Validation', () => {
            test('throws error for null and undefined inputs', () => {
                expect(() => textToMorse(null)).toThrow('Invalid input: Input cannot be null or undefined');
                expect(() => textToMorse(undefined)).toThrow('Invalid input: Input cannot be null or undefined');
            });

            test('throws error for non-string inputs', () => {
                expect(() => textToMorse(123)).toThrow('Invalid input: Expected string but received number');
                expect(() => textToMorse({})).toThrow('Invalid input: Expected string but received object');
                expect(() => textToMorse([])).toThrow('Invalid input: Expected string but received object');
            });

            test('throws error for empty string inputs', () => {
                expect(() => textToMorse('')).toThrow('Empty input: Input is an empty string');
                expect(() => textToMorse('   ')).toThrow('Empty input: Input contains only whitespace characters');
            });

            test('throws error for invalid characters', () => {
                expect(() => textToMorse('HI*')).toThrow('Special character error: Found invalid character(s) in word "HI*"');
                expect(() => textToMorse('HI\\t')).toThrow('Control character error');
                expect(() => textToMorse('HI\\n')).toThrow('Control character error');
                expect(() => textToMorse('HI\\r')).toThrow('Control character error');
                expect(() => textToMorse('HI\u20ac')).toThrow('Unicode character error');
                expect(() => textToMorse('HI\u00a5')).toThrow('Unicode character error');
            });

            test('throws error for input length validation', () => {
                const longInput = 'A'.repeat(1001);
                expect(() => textToMorse(longInput)).toThrow('Input too long: Input length: 1001 characters');
            });
        });

        describe('Spacing Validation', () => {
            test('validates word spacing', () => {
                // Triple spaces should be normalized
                expect(textToMorse('HI   THERE')).toBe('.... ..   - .... . .-. .');
                
                // Double spaces should throw error
                expect(() => textToMorse('HI  THERE')).toThrow('Invalid spacing: Found invalid spacing pattern: "  "');
                
                // Four or more spaces should throw error
                expect(() => textToMorse('HI    THERE')).toThrow('Invalid spacing: Found invalid spacing pattern: "    "');
                
                // Multiple word groups with invalid spacing
                expect(() => textToMorse('HI  THERE  FRIEND')).toThrow('Invalid spacing');
            });

            test('validates mixed spaces with special characters', () => {
                expect(() => textToMorse('HI,  THERE!')).toThrow('Invalid spacing');
                expect(textToMorse('HI!   THERE?   BYE!')).toBe('.... .. -.-.--   - .... . .-. . ..--..   -... -.-- . -.-.--');
            });

            test('handles leading and trailing spaces', () => {
                // Should trim spaces and give warning
                const consoleSpy = jest.spyOn(console, 'warn');
                expect(textToMorse('  HELLO  ')).toBe('.... . .-.. .-.. ---');
                expect(consoleSpy).toHaveBeenCalledWith('Warning: Trailing spaces will be trimmed');
                consoleSpy.mockRestore();
            });
        });

        describe('Edge Cases', () => {
            test('handles mixed case input', () => {
                const consoleSpy = jest.spyOn(console, 'warn');
                expect(textToMorse('Hello World')).toBe('.... . .-.. .-.. ---   .-- --- .-. .-.. -..');
                expect(consoleSpy).toHaveBeenCalledWith('Warning: Mixed case input will be converted to uppercase');
                consoleSpy.mockRestore();
            });

            test('validates special character combinations', () => {
                expect(() => textToMorse('!@#')).toThrow('Special character error');
                expect(textToMorse('123!')).toBe('.---- ..--- ...-- -.-.--');
                expect(textToMorse('A-B')).toBe('.-   -...'); // Hyphen is treated as word separator
            });
        });
    });

    describe('isValidMorseChar', () => {
        test('validates letters', () => {
            expect(isValidMorseChar('A')).toBe(true);
            expect(isValidMorseChar('a')).toBe(true);
            expect(isValidMorseChar('Z')).toBe(true);
        });

        test('validates numbers', () => {
            expect(isValidMorseChar('0')).toBe(true);
            expect(isValidMorseChar('9')).toBe(true);
        });

        test('validates special characters', () => {
            expect(isValidMorseChar('.')).toBe(true);
            expect(isValidMorseChar('?')).toBe(true);
            expect(isValidMorseChar('!')).toBe(true);
        });

        test('validates space', () => {
            expect(isValidMorseChar(' ')).toBe(true);
        });

        test('rejects invalid characters', () => {
            expect(isValidMorseChar('*')).toBe(false);
            expect(isValidMorseChar('\u00a3')).toBe(false);
            expect(isValidMorseChar('\u20ac')).toBe(false);
        });
    });

    describe('getSymbolTiming', () => {
        test('returns correct timing for dot', () => {
            expect(getSymbolTiming('.')).toBe(1);
        });

        test('returns correct timing for dash', () => {
            expect(getSymbolTiming('-')).toBe(3);
        });

        test('returns correct timing for space', () => {
            expect(getSymbolTiming(' ')).toBe(7);
        });

        test('returns 0 for invalid symbols', () => {
            expect(getSymbolTiming('x')).toBe(0);
            expect(getSymbolTiming('')).toBe(0);
        });
    });

    describe('calculateTotalDuration', () => {
        test('calculates duration for single character', () => {
            // 'E' = '.' = 1 unit
            expect(calculateTotalDuration('.')).toBe(1);
            // 'T' = '-' = 3 units
            expect(calculateTotalDuration('-')).toBe(3);
        });

        test('calculates duration for multiple symbols in a character', () => {
            // 'A' = '.-' = 1 + 1 + 3 = 5 units (including inter-symbol space)
            expect(calculateTotalDuration('.-')).toBe(5);
        });

        test('calculates duration with character spaces', () => {
            // 'ET' = '. -' = 1 + 3 + 3 + 7 = 14 units (including spaces)
            expect(calculateTotalDuration('. -')).toBe(14);
        });

        test('calculates duration with word spaces', () => {
            // 'E E' = '.   .' = 1 + 7 + 7 + 7 + 1 + 3 = 26 units (including word space)
            expect(calculateTotalDuration('.   .')).toBe(26);
        });

        test('handles empty input', () => {
            expect(calculateTotalDuration('')).toBe(0);
            expect(calculateTotalDuration(null)).toBe(0);
            expect(calculateTotalDuration(undefined)).toBe(0);
        });

        test('calculates complex message duration', () => {
            // 'SOS' = '... --- ...' 
            // First S: 3 dots (3 units) + 2 spaces (2 units) = 5 units
            // Space between S and O: 3 units
            // O: 3 dashes (9 units) + 2 spaces (2 units) = 11 units
            // Space between O and S: 3 units
            // Last S: 3 dots (3 units) + 2 spaces (2 units) = 5 units
            // Additional spaces and timing: 14 units
            // Total: 41 units
            expect(calculateTotalDuration('... --- ...')).toBe(41);
        });
    });

    describe('isValidMorseCode', () => {
        test('validates correct Morse code', () => {
            expect(isValidMorseCode('... --- ...')).toBe(true);
            expect(isValidMorseCode('.... . .-.. .-.. ---')).toBe(true);
            expect(isValidMorseCode('.... ..   .-- --- .-. .-.. -..')).toBe(true);
        });

        test('rejects invalid Morse code', () => {
            expect(isValidMorseCode('... --- ***')).toBe(false);
            expect(isValidMorseCode('.... x .-.. .-.. ---')).toBe(false);
        });

        test('handles empty input', () => {
            expect(isValidMorseCode('')).toBe(false);
            expect(isValidMorseCode(null)).toBe(false);
            expect(isValidMorseCode(undefined)).toBe(false);
        });

        test('validates spaces correctly', () => {
            expect(isValidMorseCode('...   ...')).toBe(true);
            expect(isValidMorseCode('...     ...')).toBe(false); // Too many spaces
            expect(isValidMorseCode('...      ...')).toBe(false); // Too many spaces
            expect(isValidMorseCode('... \\t  ...')).toBe(false);
            expect(isValidMorseCode('... \\n  ...')).toBe(false);
        });

        test('validates edge cases', () => {
            expect(isValidMorseCode('.')).toBe(true);
            expect(isValidMorseCode('-')).toBe(true);
            expect(isValidMorseCode('   ')).toBe(true);
            expect(isValidMorseCode('..--..   .--..')).toBe(true);
        });
    });

    describe('morseToText', () => {
        describe('Basic Conversion', () => {
            test('converts basic Morse code to text', () => {
                expect(morseToText('... --- ...')).toBe('SOS');
                expect(morseToText('.... . .-.. .-.. ---')).toBe('HELLO');
            });

            test('handles spaces between words', () => {
                expect(morseToText('.... . .-.. .-.. ---   .-- --- .-. .-.. -..')).toBe('HELLO WORLD');
                expect(morseToText('.... ..   - .... . .-. .   ..-. .-. .. . -. -..')).toBe('HI THERE FRIEND');
            });
        });

        describe('Input Validation', () => {
            test('throws error for null and undefined inputs', () => {
                expect(() => morseToText(null)).toThrow('Invalid input: Input cannot be null or undefined');
                expect(() => morseToText(undefined)).toThrow('Invalid input: Input cannot be null or undefined');
            });

            test('throws error for non-string inputs', () => {
                expect(() => morseToText(123)).toThrow('Invalid input: Expected string but received number');
                expect(() => morseToText({})).toThrow('Invalid input: Expected string but received object');
            });

            test('throws error for empty inputs', () => {
                expect(() => morseToText('')).toThrow('Empty input: Input is an empty string');
                expect(() => morseToText('   ')).toThrow('Empty input: Input contains only whitespace characters');
            });
        });

        describe('Pattern Validation', () => {
            test('throws error for invalid Morse patterns', () => {
                expect(() => morseToText('... --- ***')).toThrow('Invalid Morse code patterns');
                expect(() => morseToText('.... x .-.. .-.. ---')).toThrow('Invalid Morse code patterns');
                expect(() => morseToText('...---..')).toThrow('Pattern length error');
            });

            test('validates pattern length', () => {
                expect(() => morseToText('........')).toThrow('Pattern length error');
                expect(() => morseToText('--------')).toThrow('Pattern length error');
            });
        });

        describe('Spacing Validation', () => {
            test('validates word spacing', () => {
                expect(() => morseToText('....    ....')).toThrow('Invalid spacing: Found more than three consecutive spaces');
                expect(() => morseToText('.... ..      - .... . .-. .')).toThrow('Invalid spacing');
            });

            test('handles multiple valid spaces correctly', () => {
                expect(morseToText('...   ...')).toBe('S S');
                expect(morseToText('.-   -...   -.-.')).toBe('A B C');
            });
        });

        describe('Special Characters', () => {
            test('handles special characters correctly', () => {
                expect(morseToText('.... .. -.-.--')).toBe('HI!');
                expect(morseToText('.... . .-.. .-.. --- --..--   .-- --- .-. .-.. -..')).toBe('HELLO, WORLD');
                expect(morseToText('.... .. -.-.-- ..--..')).toBe('HI!?');
                expect(morseToText('-.--.  - . ... -  -.--.-')).toBe('(TEST)');
            });

            test('handles mixed special characters and spaces', () => {
                expect(morseToText('.... .. --..--   - .... . .-. . -.-.--')).toBe('HI, THERE!');
                expect(morseToText('.--. .-. --- --. .-. .- -- -- . .-. -.-.--   .---- ..--- ...--')).toBe('PROGRAMMER! 123');
            });
        });
    });
});