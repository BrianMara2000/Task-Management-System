import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute";
import AppLayout from "../components/layout/AppLayout";
import InterceptorSetup from "../components/InterceptorSetup";
import Projects from "@/pages/Projects";

// Lazy load components
const Login = lazy(() => import("../pages/Login"));
const Register = lazy(() => import("../pages/Register"));
const Dashboard = lazy(() => import("../pages/Dashboard"));
const Home = lazy(() => import("../pages/Home"));
const Users = lazy(() => import("../pages/Users"));

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <InterceptorSetup />
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected routes */}
          <Route
            path="/app/*"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <Routes>
                    <Route path="/home" element={<Home />} />
                    <Route path="/users" element={<Users />} />
                    <Route path="/projects" element={<Projects />} />
                    {/* <Route path="/inbox" element={<Inbox />} /> */}
                    {/* <Route path="/reports" element={<Reports />} /> */}
                  </Routes>
                </AppLayout>
              </ProtectedRoute>
            }
          />

          {/* Catch-all for 404 */}
          <Route path="*" element={<div>Page Not Found</div>} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};

export default AppRoutes;
