import { Navigate, Outlet } from "react-router-dom";
import { useAppSelector } from "@/app/store/hooks";

interface ProtectedRouteProps {
  requireAuth?: boolean;
  allowedRoles?: string[];
}


const ProtectedRoute = ({
  requireAuth = true,
  allowedRoles,
}: ProtectedRouteProps) => {
  const { user, initialized } = useAppSelector((state) => state.auth);


  if (!initialized) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-gray-900" />
      </div>
    );
  }


  if (requireAuth && !user) {
    return <Navigate to="/login" replace />;
  }


  if (!requireAuth && user) {
    if (user.role === "admin") return <Navigate to="/admin" replace />;
    if (user.role === "staff") return <Navigate to="/staff" replace />;
    if (user.role === "manager") return <Navigate to="/manager" replace />;
    return <Navigate to="/" replace />;
  }


  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    if (user.role === "admin") return <Navigate to="/admin" replace />;
    if (user.role === "staff") return <Navigate to="/staff" replace />;
    if (user.role === "manager") return <Navigate to="/manager" replace />;
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;