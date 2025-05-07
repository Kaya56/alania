import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Loading from '../loading/Loading';

const PublicRoute = () => {
  const { currentUser, isLoading } = useAuth();

  if (isLoading) {
    console.log('PublicRoute: rendu chargement');
    return <Loading />;
  }

  if (currentUser) {
    console.log('PublicRoute: currentUser présent, redirection vers /chat', currentUser);
    return <Navigate to="/chat" replace />;
  }

  console.log('PublicRoute: rendu Outlet');
  return <Outlet />;
};

export default PublicRoute;