import React from 'react';
import { render, screen } from '@testing-library/react';
import TextOutput from '../../components/TextOutput';

describe('TextOutput Component', () => {
  test('renders with label', () => {
    render(<TextOutput morseCode="" />);
    expect(screen.getByText('Morse Code')).toBeInTheDocument();
  });

  test('displays morse code output', () => {
    const testMorseCode = '... --- ...';
    render(<TextOutput morseCode={testMorseCode} />);
    expect(screen.getByRole('textbox')).toHaveTextContent(testMorseCode);
  });

  test('has correct ARIA label', () => {
    render(<TextOutput morseCode="" />);
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-label', 'Morse Code');
  });

  test('uses JetBrains Mono font family', () => {
    render(<TextOutput morseCode="" />);
    const output = screen.getByRole('textbox');
    expect(output).toHaveStyle({ fontFamily: 'JetBrains Mono' });
  });

  test('handles long morse code strings', () => {
    const longMorseCode = '... --- ... / ... --- ... / ... --- ...';
    render(<TextOutput morseCode={longMorseCode} />);
    expect(screen.getByRole('textbox')).toHaveTextContent(longMorseCode);
  });
});