import axios from "axios";
import { store } from "./store"; // Import the store directly
import { setToken } from "./features/auth/authSlice";

const axiosClient = axios.create({
  baseURL: `${import.meta.env.VITE_API_BASE_URL}/api`,
});

axios.defaults.withCredentials = true;
axios.defaults.withXSRFToken = true;

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

export default axiosClient;
