import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Loading from '../loading/Loading';

const PrivateLayout = () => {
  const { currentUser, isLoading } = useAuth();
  const location = useLocation();

  console.log('PrivateLayout: isLoading:', isLoading, 'currentUser:', currentUser, 'pathname:', location.pathname);

  if (isLoading) {
    console.log('PrivateLayout: rendu chargement');
    return <Loading />;
  }

  // Éviter la redirection si currentUser est null mais que la session est en cours de chargement
  if (!currentUser && !isLoading) {
    console.log('PrivateLayout: currentUser null, redirection vers /login depuis', location.pathname);
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  console.log('PrivateLayout: currentUser présent, rendu Outlet pour', location.pathname);
  return <Outlet />;
};

export default PrivateLayout;