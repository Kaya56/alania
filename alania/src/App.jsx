import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import SessionSelector from './pages/session/SessionSelector';
import HomePage from './pages/home/HomePage';
import RegisterPage from './pages/register/RegisterPage';
import CheckCodeForRegistrationPage from './pages/register/CheckCodeForRegistrationPage';
import LoginPage from './pages/login/LoginPage';
import CheckCodeForLoginPage from './pages/login/CheckCodeForLoginPage';
import ChatPage from './pages/chat/ChatPage';
import Dashboard from './pages/dashboard/Dashboard';
import PrivateLayout from './components/privateRoute/PrivateLayout';
import PublicRoute from './components/publicRoute/PublicRoute';
import Loading from './components/loading/Loading';

function AppContent() {
  console.log('AppContent: démarrage');
  const { showSessionSelector, isLoading } = useAuth();

  if (isLoading) {
    console.log('AppContent: isLoading=true');
    return <Loading />;
  }

  if (showSessionSelector) {
    console.log('AppContent: rendu SessionSelector');
    return <SessionSelector />;
  }

  console.log('AppContent: rendu Routes');
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/chat" replace />} />
      <Route element={<PublicRoute />}>
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/check-code-for-registration" element={<CheckCodeForRegistrationPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/check-code-for-login" element={<CheckCodeForLoginPage />} />
      </Route>
      <Route element={<PrivateLayout />}>
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Route>
    </Routes>
  );
}

function App() {
  console.log('App: démarrage');
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;