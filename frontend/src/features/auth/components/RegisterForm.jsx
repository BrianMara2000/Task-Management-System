import { useState } from "react";
import { useDispatch } from "react-redux";
import { setUser, setToken } from "../authSlice";
import axiosClient from "../../../axios";
import { Mail, LockKeyhole } from "lucide-react";
import RegisterIllustrator from "../../../assets/RegisterIllustrator.svg";
import { Link } from "react-router-dom";

const RegisterForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const dispatch = useDispatch();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      await axiosClient.get("/sanctum/csrf-cookie"); // CSRF protection
      const response = await axiosClient.post("/login", {
        email,
        password,
      });

      dispatch(setUser({ user: response.data.user }));
      dispatch(setToken(response.data.token));
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="flex h-screen items-center justify-center w-[50%]">
      <div className="bg-white rounded-xl shadow-lg flex flex-row-reverse w-full h-[50%]">
        {/* Left Section */}
        <div className="w-1/2 p-8">
          <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <div className="flex items-center border-b border-gray-300 py-2">
                <Mail
                  strokeWidth={1.5}
                  className="w-6 h-6 text-white fill-purple-600 mr-5"
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full focus:outline-none"
                  required
                  placeholder="Enter your email"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center border-b border-gray-300 py-2">
                <LockKeyhole
                  strokeWidth={1.5}
                  className="w-6 h-6 text-white fill-purple-600 mr-5"
                />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full focus:outline-none"
                  required
                  placeholder="Enter your password"
                />
              </div>
            </div>

            {error && <p style={{ color: "red" }}>{error}</p>}

            {/* Forgot Password */}
            <div className="text-right">
              <a href="#" className="text-purple-500 text-sm hover:underline">
                Forgot Password?
              </a>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-purple-500 text-white py-2 rounded-md hover:bg-purple-600 transition"
            >
              Login
            </button>
          </form>

          {/* Signup Link */}
          <p className="text-sm mt-4 text-center">
            Already have an account?{" "}
            <Link to={"/login"} className="text-purple-500 hover:underline">
              Login
            </Link>
          </p>
        </div>

        {/* Right Section */}
        <div className="w-1/2 bg-lavender-md flex items-center justify-center rounded-l-xl">
          <img
            src={RegisterIllustrator}
            alt="Register Illustration"
            className="w-[70%]"
          />
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;
