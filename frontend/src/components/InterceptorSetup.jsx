import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { setupInterceptors } from "../axios";

const InterceptorSetup = () => {
  const navigate = useNavigate();

  useEffect(() => {
    setupInterceptors(navigate);
  }, [navigate]);

  return null; // No need to render anything
};

export default InterceptorSetup;
