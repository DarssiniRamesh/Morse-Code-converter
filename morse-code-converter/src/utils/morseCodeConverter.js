// PUBLIC_INTERFACE
/**
 * International Morse Code mapping for characters to dots and dashes
 * Extended with additional special characters and common symbols
 * Includes comprehensive special character support and Unicode symbols
 */
export const MORSE_CODE_MAP = {
    'A': '.-',
    'B': '-...',
    'C': '-.-.',
    'D': '-..',
    'E': '.',
    'F': '..-.',
    'G': '--.',
    'H': '....',
    'I': '..',
    'J': '.---',
    'K': '-.-',
    'L': '.-..',
    'M': '--',
    'N': '-.',
    'O': '---',
    'P': '.--.',
    'Q': '--.-',
    'R': '.-.',
    'S': '...',
    'T': '-',
    'U': '..-',
    'V': '...-',
    'W': '.--',
    'X': '-..-',
    'Y': '-.--',
    'Z': '--..',
    '0': '-----',
    '1': '.----',
    '2': '..---',
    '3': '...--',
    '4': '....-',
    '5': '.....',
    '6': '-....',
    '7': '--...',
    '8': '---..',
    '9': '----.',
    '.': '.-.-.-',
    ',': '--..--',
    '?': '..--..',
    '!': '-.-.--',
    '/': '-..-.',
    '@': '.--.-.',
    '(': '-.--.',
    ')': '-.--.-',
    '&': '.-...',
    ':': '---...',
    ';': '-.-.-.',
    '=': '-...-',
    '+': '.-.-.',
    '-': '-....-',
    '_': '..--.-',
    '"': '.-..-.',
    '$': '...-..-',
    '\'': '.----.',
    ' ': ' ',
    '%': '.-.-.',  // Percentage
    '*': '-..-',   // Asterisk
    '#': '...-.-', // Hash
    '[': '-.--.',  // Left bracket (same as open parenthesis)
    ']': '-.--.-', // Right bracket (same as close parenthesis)
    '{': '-.--.',  // Left brace
    '}': '-.--.-', // Right brace
    '<': '.-..-',  // Less than
    '>': '-...-',  // Greater than
    '|': '-...-',  // Vertical bar
    '~': '.-.-',   // Tilde
    '^': '.....-', // Caret
    '`': '.-...-'  // Backtick
};

// Error messages with standardized format and improved clarity
const ERROR_MESSAGES = {
    INVALID_INPUT: {
        code: 'E001',
        message: 'Invalid input: Input must be a string',
        type: 'TypeError'
    },
    INVALID_MORSE: {
        code: 'E002',
        message: 'Invalid Morse code pattern detected. Please use only dots (.) and dashes (-)',
        type: 'ValidationError'
    },
    EMPTY_INPUT: {
        code: 'E003',
        message: 'Empty input: Please provide a non-empty string',
        type: 'ValidationError'
    },
    INVALID_CHARACTER: {
        code: 'E004',
        message: 'Invalid character: Character cannot be converted to Morse code',
        type: 'ValidationError'
    },
    INVALID_SYMBOL: {
        code: 'E005',
        message: 'Invalid symbol: Morse code can only contain dots (.) and dashes (-)',
        type: 'ValidationError'
    },
    INVALID_SPACING: {
        code: 'E006',
        message: 'Invalid spacing: Use single space between characters and three spaces between words',
        type: 'ValidationError'
    },
    UNSUPPORTED_CHARACTER: {
        code: 'E007',
        message: 'Unsupported character: The character is not supported in Morse code',
        type: 'ValidationError'
    },
    INPUT_TOO_LONG: {
        code: 'E008',
        message: 'Input too long: Maximum input length of 1000 characters exceeded',
        type: 'ValidationError'
    },
    CONSECUTIVE_SPACES: {
        code: 'E009',
        message: 'Invalid spacing: Maximum of three consecutive spaces allowed',
        type: 'ValidationError'
    },
    INVALID_PATTERN: {
        code: 'E010',
        message: 'Invalid pattern: Each Morse code character must be 1-7 dots/dashes',
        type: 'ValidationError'
    },
    SPECIAL_CHAR_ERROR: {
        code: 'E011',
        message: 'Special character error: Unsupported special character detected',
        type: 'ValidationError'
    },
    PATTERN_LENGTH_ERROR: {
        code: 'E012',
        message: 'Pattern length error: Individual Morse code patterns are too long',
        type: 'ValidationError'
    },
    INVALID_WORD_SPACING: {
        code: 'E013',
        message: 'Invalid word spacing: Words must be separated by exactly three spaces',
        type: 'ValidationError'
    },
    UNICODE_CHAR_ERROR: {
        code: 'E014',
        message: 'Unicode character error: Unicode characters are not supported in Morse code',
        type: 'ValidationError'
    },
    CONTROL_CHAR_ERROR: {
        code: 'E015',
        message: 'Control character error: Control characters are not allowed',
        type: 'ValidationError'
    },
    MIXED_CASE_WARNING: {
        code: 'W001',
        message: 'Warning: Mixed case input will be converted to uppercase',
        type: 'Warning'
    },
    TRAILING_SPACES: {
        code: 'W002',
        message: 'Warning: Trailing spaces will be trimmed',
        type: 'Warning'
    }
};

// Custom error class for Morse code validation errors
class MorseCodeError extends Error {
    constructor(errorType, details = '') {
        const error = ERROR_MESSAGES[errorType];
        super(details ? `${error.message}: ${details}` : error.message);
        this.name = error.type;
        this.code = error.code;
        this.type = errorType;
    }
}

// Validation constants
const VALIDATION = {
    MAX_CONSECUTIVE_SPACES: 3,
    WORD_SEPARATOR: '   ',
    CHAR_SEPARATOR: ' ',
    VALID_MORSE_SYMBOLS: ['.', '-', ' '],
    MAX_INPUT_LENGTH: 1000,
    MAX_MORSE_PATTERN_LENGTH: 7,
    VALID_MORSE_PATTERN: /^[.-]+$/,
    VALID_TEXT_PATTERN: /^[\x20-\x7E\s]*$/,  // Only printable ASCII characters
    VALID_WORD_PATTERN: /^[\x21-\x7E]+$/,    // Printable ASCII characters except space
    CONTROL_CHAR_PATTERN: /[\x00-\x1F\x7F]/,  // Control characters
    UNICODE_CHAR_PATTERN: /[^\x00-\x7F]/,     // Unicode characters outside ASCII
    MAX_WORD_LENGTH: 45,
    MIN_WORD_LENGTH: 1,
    WORD_SPACE_PATTERN: /\s{3}/g,
    CHAR_SPACE_PATTERN: /\s{1}/g,
    INVALID_SPACE_PATTERN: /\s{2}|\s{4,}/g,
    MAX_CONSECUTIVE_WHITESPACE: 3,
    MIN_WORD_CHARS: 1,
    MAX_WORD_CHARS: 45,
    MAX_TOTAL_LENGTH: 1000,
    TRAILING_SPACE_PATTERN: /^\s+|\s+$/g
};

// Validation helper functions
const validateInputLength = (input) => {
    // Null/undefined check
    if (input === null || input === undefined) {
        throw new MorseCodeError('INVALID_INPUT', 'Input cannot be null or undefined');
    }

    // Type check
    if (typeof input !== 'string') {
        throw new MorseCodeError('INVALID_INPUT', `Expected string but received ${typeof input}`);
    }

    // Total length validation
    if (input.length > VALIDATION.MAX_INPUT_LENGTH) {
        throw new MorseCodeError('INPUT_TOO_LONG', 
            `Input length (${input.length}) exceeds maximum allowed length of ${VALIDATION.MAX_INPUT_LENGTH} characters`);
    }
    
    // Check individual word lengths
    const words = input.split(/\s+/).filter(word => word);
    
    // Validate minimum word length
    const shortWords = words.filter(word => word.length < VALIDATION.MIN_WORD_LENGTH);
    if (shortWords.length > 0) {
        throw new MorseCodeError('INVALID_PATTERN',
            `Found ${shortWords.length} word(s) shorter than ${VALIDATION.MIN_WORD_LENGTH} character: "${shortWords.join('", "')}"`)
    }
    
    // Validate maximum word length
    const longWords = words.filter(word => word.length > VALIDATION.MAX_WORD_LENGTH);
    if (longWords.length > 0) {
        throw new MorseCodeError('INVALID_PATTERN', 
            `Found ${longWords.length} word(s) exceeding ${VALIDATION.MAX_WORD_LENGTH} characters: "${longWords.join('", "')}"`)
    }
};

const validateSpacing = (input) => {
    // Null/undefined check
    if (input === null || input === undefined) {
        throw new MorseCodeError('INVALID_INPUT', 'Input cannot be null or undefined');
    }

    // Type check
    if (typeof input !== 'string') {
        throw new MorseCodeError('INVALID_INPUT', `Expected string but received ${typeof input}`);
    }

    // Trim input for consistent validation
    const trimmedInput = input.trim();
    
    // Check for empty input after trimming
    if (!trimmedInput) {
        return; // Empty input will be handled by other validations
    }
    
    // Check for trailing/leading spaces and warn
    if (input !== trimmedInput) {
        console.warn(ERROR_MESSAGES.TRAILING_SPACES.message);
    }
    
    // Split input into words and validate each word
    const words = trimmedInput.split(/\s+/).filter(word => word);
    
    // Validate each word against the word pattern
    words.forEach(word => {
        if (!VALIDATION.VALID_WORD_PATTERN.test(word)) {
            const invalidChars = word.match(/[^\x21-\x7E]/g) || [];
            throw new MorseCodeError('SPECIAL_CHAR_ERROR',
                `Found invalid character(s) in word "${word}": "${invalidChars.join('", "')}"`)
        }
    });
    
    if (words.length > 1) {
        // Get all spacing patterns between words
        const spacingBetweenWords = input.match(/\S(\s+)\S/g) || [];
        
        // Check each spacing pattern
        spacingBetweenWords.forEach(match => {
            const space = match.match(/\s+/)[0];
            if (space.length !== VALIDATION.MAX_CONSECUTIVE_SPACES) {
                throw new MorseCodeError('INVALID_WORD_SPACING',
                    `Words must be separated by exactly three spaces, found ${space.length} spaces between "${match[0]}" and "${match[match.length-1]}"`);
            }
        });
    }
    
    // Check for invalid spacing patterns (2 spaces or 4+ spaces)
    const invalidSpaces = trimmedInput.match(/(?<=\S)\s{2}(?=\S)|\s{4,}/g);
    if (invalidSpaces) {
        throw new MorseCodeError('INVALID_SPACING',
            `Found invalid spacing pattern: "${invalidSpaces[0]}". Use single space between characters and triple spaces between words.`);
    }
};

const validateMorsePattern = (pattern) => {
    if (!pattern) return;
    
    if (pattern.length > VALIDATION.MAX_MORSE_PATTERN_LENGTH) {
        throw new MorseCodeError('PATTERN_LENGTH_ERROR',
            `Pattern "${pattern}" exceeds maximum length of ${VALIDATION.MAX_MORSE_PATTERN_LENGTH}`);
    }
    
    if (!VALIDATION.VALID_MORSE_PATTERN.test(pattern)) {
        const invalidSymbols = pattern.match(/[^.-]/g) || [];
        throw new MorseCodeError('INVALID_SYMBOL',
            `Found invalid symbol(s) in "${pattern}": "${invalidSymbols.join('", "')}"`)
    }
};

const validateTextInput = (text) => {
    // Check for control characters
    const controlChars = text.match(VALIDATION.CONTROL_CHAR_PATTERN);
    if (controlChars) {
        throw new MorseCodeError('CONTROL_CHAR_ERROR',
            `Found control character(s) with ASCII codes: ${controlChars.map(c => c.charCodeAt(0)).join(', ')}`);
    }

    // Check for Unicode characters
    const unicodeChars = text.match(VALIDATION.UNICODE_CHAR_PATTERN);
    if (unicodeChars) {
        throw new MorseCodeError('UNICODE_CHAR_ERROR',
            `Found Unicode character(s): "${unicodeChars.join('", "')}"`)
    }

    // Check for unsupported ASCII characters
    if (!VALIDATION.VALID_TEXT_PATTERN.test(text)) {
        const invalidChars = text.split('')
            .filter(char => !VALIDATION.VALID_TEXT_PATTERN.test(char))
            .filter(char => !/[\x00-\x1F\x7F]/.test(char))
            .filter(char => /[\x00-\x7F]/.test(char));
        
        if (invalidChars.length > 0) {
            throw new MorseCodeError('SPECIAL_CHAR_ERROR',
                `Found unsupported character(s): "${invalidChars.join('", "')}" - Only ASCII printable characters are supported`);
        }
    }
    
    // Check for mixed case and warn
    if (/[a-z]/.test(text) && /[A-Z]/.test(text)) {
        console.warn(ERROR_MESSAGES.MIXED_CASE_WARNING.message);
    }
};

// PUBLIC_INTERFACE
/**
 * Converts text to Morse code
 * @param {string} text - The text to convert to Morse code
 * @returns {string} The Morse code representation of the input text
 */
export const textToMorse = (text) => {
    try {
        try {
            // Input validation
            if (text === null || text === undefined) {
                throw new MorseCodeError('INVALID_INPUT', 'Input cannot be null or undefined');
            }

            if (typeof text !== 'string') {
                throw new MorseCodeError('INVALID_INPUT', `Expected string but received ${typeof text}`);
            }
        
            if (text === '') {
                throw new MorseCodeError('EMPTY_INPUT', 'Input is an empty string');
            }
        
            const trimmedText = text.trim();
            if (!trimmedText) {
                throw new MorseCodeError('EMPTY_INPUT', 'Input contains only whitespace characters');
            }

            validateInputLength(text);
            validateSpacing(text);
            validateTextInput(text);

            // Enhanced character validation
            const invalidChars = [...text].filter(char => !isValidMorseChar(char));
            if (invalidChars.length > 0) {
                throw new MorseCodeError('UNSUPPORTED_CHARACTER', 
                    `Found ${invalidChars.length} invalid character(s): '${invalidChars.join("', '")}'`);
            }
        
            // Normalize input text by standardizing spaces
            // Convert all word separations to triple spaces and ensure proper spacing
            const normalizedText = text.trim()
                .replace(/\s+/g, ' ')      // First convert all spaces to single space
                .split(' ')                // Split into words
                .filter(word => word)      // Remove empty words
                .join('   ');              // Join with triple spaces for word separation
        
            // Convert text to Morse code with proper spacing
            const morseArray = normalizedText
                .toUpperCase()
                .split('')
                .map(char => {
                    if (char === ' ') {
                        return VALIDATION.WORD_SEPARATOR;
                    }
                    const morse = MORSE_CODE_MAP[char];
                    if (!morse) {
                        throw new MorseCodeError('UNSUPPORTED_CHARACTER', `Character '${char}' cannot be converted to Morse code`);
                    }
                    validateMorsePattern(morse); // Validate the morse pattern for each character
                    return morse;
                });

            // Join with proper spacing and ensure clean output
            return morseArray
                .join(VALIDATION.CHAR_SEPARATOR)
                .split(' ')
                .filter(part => part)  // Remove empty parts
                .join(' ')            // Rejoin with proper spacing
                .trim();
        } catch (error) {
            if (error instanceof MorseCodeError) {
                throw error;
            }
            throw new MorseCodeError('INVALID_INPUT', error.message);
        }
    } catch (error) {
        if (error instanceof MorseCodeError) {
            throw error;
        }
        throw new MorseCodeError('INVALID_INPUT', error.message);
    }
};

// PUBLIC_INTERFACE
/**
 * Validates if a character can be converted to Morse code
 * @param {string} char - The character to validate
 * @returns {boolean} True if the character can be converted to Morse code
 */
export const isValidMorseChar = (char) => {
    return char === ' ' || MORSE_CODE_MAP[char.toUpperCase()] !== undefined;
};

// PUBLIC_INTERFACE
/**
 * Gets the timing units for a Morse code symbol
 * @param {string} symbol - The Morse code symbol (dot or dash)
 * @returns {number} The number of timing units for the symbol
 */
export const getSymbolTiming = (symbol) => {
    switch (symbol) {
        case '.': return 1; // dot is one unit
        case '-': return 3; // dash is three units
        case ' ': return 7; // space between words is seven units
        default: return 0;
    }
};

// PUBLIC_INTERFACE
/**
 * Calculates the total duration of a Morse code message in timing units
 * @param {string} morseCode - The Morse code message
 * @returns {number} The total duration in timing units
 */
export const calculateTotalDuration = (morseCode) => {
    // Null and undefined check
    if (morseCode === null || morseCode === undefined) {
        throw new MorseCodeError('INVALID_INPUT', 'Input cannot be null or undefined');
    }

    // Input type validation
    if (typeof morseCode !== 'string') {
        throw new MorseCodeError('INVALID_INPUT', `Expected string but received ${typeof morseCode}`);
    }
    
    // Empty string and whitespace-only handling
    const trimmedCode = morseCode.trim();
    if (morseCode === '') {
        return 0; // Return 0 duration for empty string
    }
    if (!trimmedCode) {
        return 0; // Return 0 duration for whitespace-only input
    }
    
    let totalUnits = 0;
    const symbols = morseCode.split('');
    
    for (let i = 0; i < symbols.length; i++) {
        totalUnits += getSymbolTiming(symbols[i]);
        
        // Add one unit space between symbols within a character
        if (symbols[i] !== ' ' && i < symbols.length - 1 && symbols[i + 1] !== ' ') {
            totalUnits += 1;
        }
        
        // Add three units space between characters
        if (symbols[i] !== ' ' && i < symbols.length - 1 && symbols[i + 1] === ' ') {
            totalUnits += 3;
        }
    }
    
    return totalUnits;
};

// PUBLIC_INTERFACE
/**
 * Validates if a string is valid Morse code
 * @param {string} morse - The Morse code string to validate
 * @returns {boolean} True if the string is valid Morse code
 */
export const isValidMorseCode = (morse) => {
    try {
        // Null and undefined check
        if (morse === null || morse === undefined) {
            throw new MorseCodeError('INVALID_INPUT', 'Input cannot be null or undefined');
        }

        // Input type validation
        if (typeof morse !== 'string') {
            throw new MorseCodeError('INVALID_INPUT', `Expected string but received ${typeof morse}`);
        }
        
        // Empty string and whitespace-only handling
        const trimmedMorse = morse.trim();
        if (morse === '') {
            return false; // Empty string is not valid Morse code
        }
        if (!trimmedMorse) {
            return false; // Whitespace-only input is not valid Morse code
        }
    
        // Split into characters (separated by space)
        const characters = morse.trim().split(' ');
        
        try {
            return characters.every(char => {
                // Handle word spaces (multiple spaces)
                if (char === '') return true;
        
                // Check if the character is valid Morse code
                return char.split('').every(symbol => VALIDATION.VALID_MORSE_SYMBOLS.includes(symbol));
            });
        } catch (error) {
            return false;
        }
    } catch (error) {
        return false;
    }
};

// PUBLIC_INTERFACE
/**
 * Converts Morse code to text
 * @param {string} morse - The Morse code to convert to text
 * @returns {string} The text representation of the input Morse code
 * @throws {Error} If the input contains invalid Morse code
 */
// Morse code to text mapping for reverse conversion
const MORSE_TO_TEXT_MAP = {};

// Initialize reverse mapping
Object.entries(MORSE_CODE_MAP).forEach(([char, morse]) => {
    MORSE_TO_TEXT_MAP[morse] = char;
});

export const morseToText = (morse) => {
    // Input validation
    // Null and undefined check
    if (morse === null || morse === undefined) {
        throw new MorseCodeError('INVALID_INPUT', 'Input cannot be null or undefined');
    }

    // Input type validation
    if (typeof morse !== 'string') {
        throw new MorseCodeError('INVALID_INPUT', `Expected string but received ${typeof morse}`);
    }
    
    // Empty string and whitespace-only handling
    const trimmedMorse = morse.trim();
    if (morse === '') {
        throw new MorseCodeError('EMPTY_INPUT', 'Input is an empty string');
    }
    if (!trimmedMorse) {
        throw new MorseCodeError('EMPTY_INPUT', 'Input contains only whitespace characters');
    }

    validateInputLength(morse);
    validateSpacing(morse);
    
    // Split into characters and validate each Morse code pattern
    const patterns = morse.trim().split(' ').filter(pattern => pattern !== '');
    
    // Validate each pattern and collect all errors
    const invalidPatterns = [];
    patterns.forEach(pattern => {
        try {
            validateMorsePattern(pattern);
        } catch (error) {
            invalidPatterns.push({ pattern, error: error.message });
        }
    });
    
    // If there are invalid patterns, throw an error with all the issues
    if (invalidPatterns.length > 0) {
        const errorDetails = invalidPatterns
            .map(({ pattern, error }) => `"${pattern}": ${error}`)
            .join('; ');
        throw new MorseCodeError('INVALID_MORSE', `Invalid Morse code patterns found: ${errorDetails}`);
    }
    
    // Additional validation for the complete morse code string
    if (!isValidMorseCode(morse)) {
        throw new MorseCodeError('INVALID_MORSE', 'Input contains invalid Morse code patterns or incorrect spacing');
    }
    
    // Normalize spaces in Morse code
    const normalizedMorse = morse.trim()
        .replace(/\s{4,}/g, VALIDATION.WORD_SEPARATOR) // Convert 4+ spaces to word separator
        .replace(/\s{2}/g, ' ')                        // Convert 2 spaces to 1 space
        .replace(/\s{3}/g, VALIDATION.WORD_SEPARATOR); // Standardize word separators
    
    // Validate spacing
    if (normalizedMorse.includes('    ')) {
        throw new MorseCodeError('INVALID_SPACING', 'Found more than three consecutive spaces');
    }
    
    // Split into words (separated by 3 spaces)
    return normalizedMorse
        .split('   ')
        .map(word => 
            // Split word into characters (separated by single space)
            word.trim().split(' ')
                .filter(char => char !== '') // Remove empty characters
                .map(char => MORSE_TO_TEXT_MAP[char] || '')
                .join('')
        )
        .filter(word => word !== '') // Remove empty words
        .join(' ')
        .trim();
};
