import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '@/app/store/hooks';

interface ProtectedRouteProps {
  requireAuth?: boolean;        // true = cần đăng nhập, false = chỉ dành cho guest
  allowedRoles?: string[];      // Giới hạn role được phép vào
}

const ProtectedRoute = ({
  requireAuth = true,
  allowedRoles,
}: ProtectedRouteProps) => {
  const { user, initialized } = useAppSelector((state) => state.auth);

  // Đang kiểm tra token → hiển thị loading, không redirect vội
  if (!initialized) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900" />
      </div>
    );
  }

  // Chưa đăng nhập mà vào trang cần auth → redirect về login
  if (requireAuth && !user) {
    return <Navigate to="/login" replace />;
  }

  // Đã đăng nhập mà vào trang guest (vd: /login) → redirect theo role
  if (!requireAuth && user) {
    if (user.role === 'admin') return <Navigate to="/admin" replace />;
    if (user.role === 'staff') return <Navigate to="/staff" replace />;
    if (user.role === 'manager') return <Navigate to="/manager" replace />;
    return <Navigate to="/" replace />;
  }

  // Sai role → redirect về login
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
