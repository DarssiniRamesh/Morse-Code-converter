import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import TextInput from '../../components/TextInput';

describe('TextInput Component', () => {
  test('renders input field with label', () => {
    render(<TextInput value="" onChange={() => {}} />);
    expect(screen.getByLabelText('Enter Text')).toBeInTheDocument();
  });

  test('displays the provided value', () => {
    const testValue = 'Hello World';
    render(<TextInput value={testValue} onChange={() => {}} />);
    expect(screen.getByRole('textbox')).toHaveValue(testValue);
  });

  test('calls onChange handler when text is entered', () => {
    const mockOnChange = jest.fn();
    render(<TextInput value="" onChange={mockOnChange} />);
    
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'Test Input' } });
    
    expect(mockOnChange).toHaveBeenCalledWith('Test Input');
  });

  test('has correct placeholder text', () => {
    render(<TextInput value="" onChange={() => {}} />);
    expect(screen.getByPlaceholderText('Type your text here...')).toBeInTheDocument();
  });

  test('uses JetBrains Mono font family', () => {
    render(<TextInput value="" onChange={() => {}} />);
    const textarea = screen.getByRole('textbox');
    expect(textarea).toHaveStyle({ fontFamily: 'JetBrains Mono' });
  });
});