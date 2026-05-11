import { Navigate, Outlet } from "react-router-dom";

import { isAuthenticated, getRole } from "@/lib/auth";

interface ProtectedRouteProps {
  allowedRoles?: string[];
}

const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
  const authenticated = isAuthenticated();
  const role = getRole();

  if (!authenticated) {
    return <Navigate replace to="/login" />;
  }

  if (allowedRoles) {
    const isAllowed = allowedRoles.some((r) => r.toUpperCase() === role);

    if (!isAllowed) {
      return (
        <Navigate replace to={role === "ADMIN" ? "/admin" : "/archives"} />
      );
    }
  }

  return <Outlet />;
};

export default ProtectedRoute;
