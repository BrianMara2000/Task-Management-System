import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { axiosClient, csrfClient } from "@/axios";
import { setUser, logout as clearUser } from "@/features/auth/authSlice";

export const useAuth = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);

  const login = async (email, password) => {
    try {
      await csrfClient.get("/sanctum/csrf-cookie");
      await axiosClient.post("/login", { email, password });

      const response = await axiosClient.get("/getUser");
      dispatch(setUser(response.data));

      navigate("/app/home");
    } catch (error) {
      console.log("Login error:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await axiosClient.post("/logout");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      dispatch(clearUser());
      navigate("/login");
    }
  };

  return {
    user,
    isAuthenticated: !!user,
    login,
    logout,
  };
};
