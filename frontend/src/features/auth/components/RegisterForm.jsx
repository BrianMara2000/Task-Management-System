import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useDispatch } from "react-redux";
import { setUser, setToken } from "../authSlice";
import { axiosClient, csrfClient } from "../../../axios";
import {
  Mail,
  LockKeyhole,
  LockKeyholeOpen,
  UserRound,
  Eye,
  EyeOff,
} from "lucide-react";
import RegisterIllustrator from "../../../assets/RegisterIllustrator.svg";
import { Link, useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import Spinner from "@/components/ui/spinner";

const schema = z
  .object({
    name: z.string().nonempty("Name is required"),
    email: z.string().email("Invalid email"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

const RegisterForm = () => {
  const dispatch = useDispatch();
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirmation, setShowPasswordConfirmation] =
    useState(false);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
  });

  // ✅ Handle Form Submission
  const onSubmit = async (data) => {
    setIsLoading((prev) => !prev);

    try {
      await csrfClient.get("/sanctum/csrf-cookie");

      const response = await axiosClient.post("/register", {
        name: data.name,
        email: data.email,
        password: data.password,
        password_confirmation: data.confirmPassword,
      });

      dispatch(setUser({ user: response.data.user }));
      dispatch(setToken(response.data.token));

      navigate("/app/home");
    } catch (err) {
      if (err.response?.status === 422) {
        // ✅ Handle backend validation errors
        const backendErrors = err.response.data.errors;
        Object.keys(backendErrors).forEach((key) => {
          setError(key, {
            type: "server",
            message: backendErrors[key][0], // Show first error only
          });
        });
      } else {
        setError("email", {
          type: "manual",
          message: err.response?.data?.message || "Registration failed",
        });
      }
    } finally {
      setIsLoading((prev) => !prev);
    }
  };

  return (
    <div className="flex h-screen items-center justify-center w-[50%]">
      <div className="bg-white rounded-xl shadow-lg flex flex-row-reverse w-full min-h-[50%]">
        {/* Left Section */}
        <div className="w-1/2 p-8">
          <h2 className="text-2xl font-bold mb-6 text-center">Register</h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Name */}
            <div>
              <div className="flex items-center border-b border-gray-300 py-2">
                <UserRound
                  strokeWidth={1.5}
                  className="w-6 h-6 text-white fill-purple-600 mr-2"
                />
                <Input
                  className="border-none focus-visible:border-none focus:ring-0 focus-visible:ring-0 focus-visible:border-0"
                  type="text"
                  placeholder="Enter your name"
                  {...register("name")}
                />
              </div>
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.name.message}
                </p>
              )}
            </div>

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

            {/* Confirm Password */}
            <div>
              <div className="flex items-center border-b border-gray-300 py-2">
                <LockKeyholeOpen
                  strokeWidth={1.5}
                  className="w-6 h-6 text-white fill-purple-600"
                />
                <Input
                  className="border-none focus-visible:border-none focus:ring-0 focus-visible:ring-0 focus-visible:border-0 "
                  type={showPasswordConfirmation ? "text" : "password"}
                  placeholder="Confirm your password"
                  {...register("confirmPassword")}
                />
                <button
                  type="button"
                  onClick={() =>
                    setShowPasswordConfirmation(!showPasswordConfirmation)
                  }
                  className="ml-2 focus:outline-none cursor-pointer"
                >
                  {showPasswordConfirmation ? (
                    <Eye size={20} />
                  ) : (
                    <EyeOff size={20} />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <Button type="submit" className="w-full cursor-pointer">
              {isLoading ? (
                <>
                  <Spinner className="w-4 h-4 border-2 border-t-white border-gray-300 rounded-full animate-spin mr-2" />
                  Please wait...
                </>
              ) : (
                "Register"
              )}
            </Button>
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
