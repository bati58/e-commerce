import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../state/AuthContext.jsx";

const PrivateRoute = ({ children }) => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default PrivateRoute;

