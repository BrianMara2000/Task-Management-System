import AppRoutes from "./routes/AppRoutes";
import "./index.css";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { setUser } from "@/features/auth/authSlice";
import { axiosClient } from "./axios";

const App = () => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      try {
        const response = await axiosClient.get("/getUser");
        dispatch(setUser(response.data));
      } catch (error) {
        if (error.response?.status === 401) {
          dispatch(setUser(null));
        } else {
          console.error("Failed to fetch user:", error);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [dispatch]);

  if (loading) return <div>Loading...</div>; // Optional: Add a loading indicator

  return <AppRoutes />;
};

export default App;
