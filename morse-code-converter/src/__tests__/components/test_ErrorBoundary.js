import React from 'react';
import { render, screen } from '@testing-library/react';
import ErrorBoundary from '../../components/ErrorBoundary';

// Mock console.error to prevent test output pollution
const originalError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});

afterAll(() => {
  console.error = originalError;
});

// Test component that throws an error
const ErrorComponent = ({ shouldThrow }) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>Normal component</div>;
};

describe('ErrorBoundary', () => {
  test('renders children when no error occurs', () => {
    render(
      <ErrorBoundary>
        <div>Test content</div>
      </ErrorBoundary>
    );
    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  test('displays error UI when error occurs', () => {
    const { container } = render(
      <ErrorBoundary>
        <ErrorComponent shouldThrow={true} />
      </ErrorBoundary>
    );
    
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText('Please refresh the page and try again.')).toBeInTheDocument();
  });

  test('uses custom error title and message', () => {
    const customTitle = 'Custom Error Title';
    const customMessage = 'Custom error message';
    
    render(
      <ErrorBoundary errorTitle={customTitle} errorMessage={customMessage}>
        <ErrorComponent shouldThrow={true} />
      </ErrorBoundary>
    );
    
    expect(screen.getByText(customTitle)).toBeInTheDocument();
    expect(screen.getByText(customMessage)).toBeInTheDocument();
  });

  test('shows error details when showError prop is true', () => {
    render(
      <ErrorBoundary showError={true}>
        <ErrorComponent shouldThrow={true} />
      </ErrorBoundary>
    );
    
    const errorDetails = screen.getByText(/Test error/);
    expect(errorDetails).toBeInTheDocument();
    expect(errorDetails.tagName.toLowerCase()).toBe('pre');
    expect(errorDetails).toHaveClass('error-details');
  });

  test('calls onError callback when error occurs', () => {
    const onError = jest.fn();
    
    render(
      <ErrorBoundary onError={onError}>
        <ErrorComponent shouldThrow={true} />
      </ErrorBoundary>
    );
    
    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({
        componentStack: expect.any(String)
      })
    );
  });

  describe('prop validation', () => {
    let mockConsoleError;

    beforeEach(() => {
      mockConsoleError = jest.fn();
      console.error = mockConsoleError;
    });

    afterEach(() => {
      console.error = originalError;
    });

    test('validates prop types', () => {
      render(
        <ErrorBoundary
          errorTitle={123}
          errorMessage={true}
          showError="true"
          onError="function"
        >
          <div>Test</div>
        </ErrorBoundary>
      );

      // Verify that PropTypes validation occurred
      expect(mockConsoleError).toHaveBeenCalled();
    });

    test('requires children prop', () => {
      render(<ErrorBoundary />);
      
      // Verify that the required prop warning was triggered
      expect(mockConsoleError).toHaveBeenCalled();
      expect(mockConsoleError.mock.calls.some(call => 
        call[0] && typeof call[0] === 'string' && call[0].includes('children')
      )).toBe(true);
    });
  });
});
