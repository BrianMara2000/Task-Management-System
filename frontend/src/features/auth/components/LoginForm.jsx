import { useDispatch } from "react-redux";
import { setUser, setToken } from "../authSlice";
import { axiosClient, csrfClient } from "../../../axios";
import { Mail, LockKeyhole, Eye, EyeOff } from "lucide-react";
import LoginIllustrator from "../../../assets/LoginIllustrator.png";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import Spinner from "@/components/ui/spinner";

const schema = z.object({
  email: z.string().email("This field is required"),
  password: z.string().min(6, "This field is required"),
});

const LoginForm = () => {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
  });
  const onSubmit = async (data) => {
    setIsLoading((prev) => !prev);
    try {
      await csrfClient.get("/sanctum/csrf-cookie"); // CSRF protection
      const response = await axiosClient.post("/login", {
        email: data.email,
        password: data.password,
      });

      dispatch(setUser({ user: response.data.user }));
      dispatch(setToken(response.data.token));

      localStorage.setItem("token", response.data.token);
      navigate("/app/home");
    } catch (err) {
      if (err.response?.status === 422) {
        const backendErrors = err.response.data.errors;
        Object.keys(backendErrors).forEach((key) => {
          setError(key, {
            type: "server",
            message: backendErrors[key][0],
          });
        });
      } else {
        setError("email", {
          type: "manual",
          message: err.response?.data?.message || "Login failed",
        });
      }
    } finally {
      setIsLoading((prev) => !prev);
    }
  };

  return (
    <div className="flex h-screen items-center justify-center w-[50%]">
      <div className="bg-white rounded-xl shadow-lg flex w-full min-h-[50%]">
        {/* Left Section */}
        <div className="w-1/2 p-8">
          <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Email */}
            <div>
              <div className="flex items-center border-b border-gray-300 py-2">
                <Mail
                  strokeWidth={1.5}
                  className="w-6 h-6 text-white fill-purple-600 mr-2"
                />
                <Input
                  className="border-none focus-visible:border-none focus:ring-0 focus-visible:ring-0 focus-visible:border-0 "
                  type="email"
                  placeholder="Enter your email"
                  {...register("email")}
                />
              </div>
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center border-b border-gray-300 py-2">
                <LockKeyhole
                  strokeWidth={1.5}
                  className="w-6 h-6 text-white fill-purple-600 mr-2"
                />
                <Input
                  className="border-none focus-visible:border-none focus:ring-0 focus-visible:ring-0 focus-visible:border-0 "
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  {...register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="ml-2 focus:outline-none cursor-pointer"
                >
                  {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Forgot Password */}
            <div className="text-right">
              <a href="#" className="text-purple-500 text-sm hover:underline">
                Forgot Password?
              </a>
            </div>

            {/* Submit Button */}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Spinner className="w-4 h-4 border-2 border-t-white border-gray-300 rounded-full animate-spin mr-2" />
                  Logging in...
                </>
              ) : (
                "Login"
              )}
            </Button>
          </form>

          {/* Signup Link */}
          <p className="text-sm mt-4 text-center">
            Don’t have an account?{" "}
            <Link to={"/register"} className="text-purple-500 hover:underline">
              Signup now
            </Link>
          </p>
        </div>

        {/* Right Section */}
        <div className="w-1/2 bg-lavender-md flex items-center justify-center rounded-r-xl">
          <img
            src={LoginIllustrator}
            alt="Login Illustration"
            className="w-[60%]"
          />
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
