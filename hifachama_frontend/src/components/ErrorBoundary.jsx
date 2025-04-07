import React, { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, info: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render shows the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // You can also log the error to an error reporting service
    console.error('Error caught by ErrorBoundary:', error, info);
  }

  render() {
    if (this.state.hasError) {
      // Render a fallback UI
      return (
        <div style={{ padding: '20px', backgroundColor: '#f2d7d5', borderRadius: '5px' }}>
          <h2>Something went wrong. Please try again later.</h2>
          <p>{this.state.error?.message}</p>
        </div>
      );
    }

    return this.props.children; // If no error, render children normally
  }
}

export default ErrorBoundary;
