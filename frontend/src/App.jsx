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

    if (token) {
      dispatch(setToken(token));
      axiosClient
        .get("/user")
        .then((response) => {
          dispatch(setUser(response.data));
        })
        .catch(() => {
          localStorage.removeItem("token");
          dispatch(setToken(null));
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [dispatch]);

  if (loading) return <div>Loading...</div>; // Optional: Add a loading indicator

  return <AppRoutes />;
};

export default App;
