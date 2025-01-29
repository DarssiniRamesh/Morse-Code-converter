import React, { Component } from 'react';
import PropTypes from 'prop-types';

// PUBLIC_INTERFACE
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <h2>{this.props.errorTitle || 'Something went wrong'}</h2>
          <p>{this.props.errorMessage || 'Please refresh the page and try again.'}</p>
          {this.props.showError && (
            <pre className="error-details">
              {this.state.error?.toString()}
            </pre>
          )}
        </div>
      );
    }
    return this.props.children;
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
  errorTitle: PropTypes.string,
  errorMessage: PropTypes.string,
  showError: PropTypes.bool,
  onError: PropTypes.func
};

ErrorBoundary.defaultProps = {
  errorTitle: 'Something went wrong',
  errorMessage: 'Please refresh the page and try again.',
  showError: false
};

export default ErrorBoundary;