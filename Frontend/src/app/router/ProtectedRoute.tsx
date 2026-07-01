import { Navigate, Outlet } from "react-router-dom";
import { useAppSelector } from "@/app/store/hooks";

interface ProtectedRouteProps {
  requireAuth?: boolean;
  allowedRoles?: string[];
}

// Route guard: chặn người chưa đăng nhập, chặn sai role, và tự redirect đúng trang.
const ProtectedRoute = ({
  requireAuth = true,
  allowedRoles,
}: ProtectedRouteProps) => {
  const { user, initialized } = useAppSelector((state) => state.auth);

  // Trong lúc app đang kiểm tra token thì chưa redirect vội.
  if (!initialized) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-gray-900" />
      </div>
    );
  }

  // Chưa đăng nhập mà vào trang cần auth thì đá về login.
  if (requireAuth && !user) {
    return <Navigate to="/login" replace />;
  }

  // Đã đăng nhập mà vào trang login thì chuyển về đúng dashboard theo role.
  if (!requireAuth && user) {
    if (user.role === "admin") return <Navigate to="/admin" replace />;
    if (user.role === "staff") return <Navigate to="/staff" replace />;
    if (user.role === "manager") return <Navigate to="/manager" replace />;
    return <Navigate to="/" replace />;
  }

  // Có đăng nhập nhưng role không đúng route đang vào.
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    if (user.role === "admin") return <Navigate to="/admin" replace />;
    if (user.role === "staff") return <Navigate to="/staff" replace />;
    if (user.role === "manager") return <Navigate to="/manager" replace />;
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;