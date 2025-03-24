import { useSearchParams } from "react-router-dom";
import RegisterForm from "../features/auth/components/RegisterForm";
import AcceptInviteForm from "@/features/auth/components/AcceptInviteForm";

const Register = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  if (token && email) {
    return (
      <div className="flex justify-center items-center bg-lavender">
        <AcceptInviteForm token={token} email={email} />
      </div>
    );
  } else {
    return (
      <div className="flex justify-center items-center bg-lavender">
        <RegisterForm />
      </div>
    );
  }
};

export default Register;
