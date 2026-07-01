import { useEffect } from "react";
import { useAppDispatch } from "../store/hooks";
import { markInitialized } from "@/features/auth/store/auth-slice";
import { getMeThunk } from "@/features/auth/store/auth-thunk";

export default function AppInit({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("access_token");

      if (!token) {
        // Không có token thì đánh dấu đã khởi tạo xong.
        dispatch(markInitialized());
        return;
      }

      try {
        // Có token thì gọi /auth/me để lấy role và thông tin user.
        await dispatch(getMeThunk()).unwrap();
      } catch {
        // Token lỗi hoặc hết hạn thì dọn dẹp.
        localStorage.removeItem("access_token");
      } finally {
        // Dù thành công hay thất bại cũng phải cho app biết là đã init xong.
        dispatch(markInitialized());
      }
    };

    void initAuth();
  }, [dispatch]);

  return children;
}