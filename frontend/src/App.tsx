import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Library from './pages/Library';
import ProtectedRoute from './components/ProtectedRoute';
import NotFound from './pages/NotFound'; // Added NotFound import
import ErrorBoundary from './components/ErrorBoundary';

import AdminUsers from './pages/AdminUsers';

function App() {
  return (
    <AuthProvider>
      <ErrorBoundary>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route path="/" element={<Layout />}>
              <Route element={<ProtectedRoute />}>
                <Route index element={<Dashboard />} />
                <Route path="/library" element={<Library />} />
                <Route path="/admin/users" element={<AdminUsers />} />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </ErrorBoundary>
    </AuthProvider>
  );
}

export default App;
