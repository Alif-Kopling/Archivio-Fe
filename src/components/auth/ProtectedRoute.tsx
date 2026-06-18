import { Navigate, Outlet } from "react-router-dom";
import { Spinner } from "@heroui/react";

import { useAuth } from "@/hooks/useAuth";

interface ProtectedRouteProps {
  allowedRoles?: string[];
}

const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
  const { user, isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate replace to="/login" />;
  }

  if (allowedRoles) {
    const userRole = user.role.toUpperCase();
    const isAllowed = allowedRoles.some((r) => r.toUpperCase() === userRole);

    if (!isAllowed) {
      return (
        <Navigate replace to={userRole === "ADMIN" ? "/admin" : "/dashboard"} />
      );
    }
  }

  return <Outlet />;
};

export default ProtectedRoute;
