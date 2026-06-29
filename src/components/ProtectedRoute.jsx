import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = () => {
  const user = localStorage.getItem("user");

  // not logged in → send to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // logged in → allow access
  return <Outlet />;
};

export default ProtectedRoute;