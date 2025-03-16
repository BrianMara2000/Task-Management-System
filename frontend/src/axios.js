import axios from "axios";
import { store } from "./store"; // Import the store directly
import { setToken } from "./features/auth/authSlice";

const axiosClient = axios.create({
  baseURL: `${import.meta.env.VITE_API_BASE_URL}/api`,
  withCredentials: true,
  withXSRFToken: true,
});

const csrfClient = axios.create({
  baseURL: `${import.meta.env.VITE_API_BASE_URL}`,
  withCredentials: true,
});

axiosClient.interceptors.request.use((config) => {
  const token = store.getState().auth.token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const setupInterceptors = (navigate) => {
  axiosClient.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response) {
        if (error.response.status === 401) {
          store.dispatch(setToken(null)); // Use store.dispatch instead of useDispatch()
          navigate("/login"); // Use navigate directly
        }

        if (error.response.status === 403) {
          alert("You don't have permission to access this resource.");
        }

        if (error.response.status === 500) {
          console.error("Server error:", error.response.data);
        }
      }

      throw error;
    }
  );
};

export { axiosClient, csrfClient };
