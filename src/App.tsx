import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth, SignIn, SignUp } from '@clerk/clerk-react';
import { Loader2 } from 'lucide-react';

// Lazy load components with loading fallback
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const UserProfile = React.lazy(() => import('./pages/UserProfile'));
const PaymentPage = React.lazy(() => import('./pages/PaymentPage'));

// Reusable loading component
const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center">
    <Loader2 className="w-8 h-8 animate-spin" />
  </div>
);

// Protected route wrapper
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) return <LoadingSpinner />;
  if (!isSignedIn) return <Navigate to="/sign-in" replace />;
  return <>{children}</>;
};

export default function App() {
  return (
    <Routes>
      <Route path="/sign-in/*" element={<SignIn routing="path" path="/sign-in" />} />
      <Route path="/sign-up/*" element={<SignUp routing="path" path="/sign-up" />} />
      
      <Route
        path="/dashboard/*"
        element={
          <ProtectedRoute>
            <React.Suspense fallback={<LoadingSpinner />}>
              <Dashboard />
            </React.Suspense>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <React.Suspense fallback={<LoadingSpinner />}>
              <UserProfile />
            </React.Suspense>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/pay/:linkId"
        element={
          <React.Suspense fallback={<LoadingSpinner />}>
            <PaymentPage />
          </React.Suspense>
        }
      />
      
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}