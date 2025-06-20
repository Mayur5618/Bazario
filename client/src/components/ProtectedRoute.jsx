import { Navigate } from 'react-router-dom';
// import { useAuth } from '../context/AuthContext';
import { useSelector } from 'react-redux';

const ProtectedRoute = ({ children }) => {
  // const { user, loading } = useAuth();
  const { userData , loading} = useSelector((state) => state.user);

    if (loading) {
    return <div>Loading...</div>;
  }

  if (!userData) {
    return <Navigate to="/login" />;
  }

  return children;
};

export default ProtectedRoute;