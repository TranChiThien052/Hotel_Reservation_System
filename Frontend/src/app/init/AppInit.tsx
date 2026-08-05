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
        
        dispatch(markInitialized());
        return;
      }

      try {
        
        await dispatch(getMeThunk()).unwrap();
      } catch {
        
        localStorage.removeItem("access_token");
      } finally {
        
        dispatch(markInitialized());
      }
    };

    void initAuth();
  }, [dispatch]);

  return children;
}