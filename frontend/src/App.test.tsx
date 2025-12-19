import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Login from './pages/Login';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// Simple smoke test to ensure the Login page renders without crashing
test('renders login page', () => {
    // We need to wrap components that use router/context
    render(
        <BrowserRouter>
            <AuthProvider>
                <Login />
            </AuthProvider>
        </BrowserRouter>
    );
    const linkElement = screen.getByText(/Sign in/i);
    expect(linkElement).toBeInTheDocument();
});
