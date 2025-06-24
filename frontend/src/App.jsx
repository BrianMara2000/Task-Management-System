import AppRoutes from "./routes/AppRoutes";
import "./index.css";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { setUser, setToken } from "@/features/auth/authSlice";
import { axiosClient } from "./axios";

const App = () => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");

    const fetchUser = async () => {
      if (token) {
        dispatch(setToken(token));
        try {
          const response = await axiosClient.get("/getUser");
          dispatch(setUser(response.data));
        } catch (error) {
          localStorage.removeItem("token");
          dispatch(setToken(null));
          console.error("Failed to fetch user:", error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    fetchUser();
  }, [dispatch]);

  if (loading) return <div>Loading...</div>; // Optional: Add a loading indicator

  return <AppRoutes />;
};

export default App;
