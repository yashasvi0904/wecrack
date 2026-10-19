import { useState } from "react";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { loginWithGoogle } from "../FireBase";
import AuthLayout from "../../components/AuthLayout";
import { Field, GoogleMark } from "../../components/ui";

export default function LoginScreen() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    if (!email || !/\S+@\S+\.\S+/.test(email)) newErrors.email = "Valid email required";
    if (!password || password.length < 6) newErrors.password = "Password must be 6+ characters";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const goToApp = (data) => navigate(data.role === "admin" ? "/admin-dashboard" : "/dashboard");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const response = await fetch(process.env.REACT_APP_LOGIN_URI || "http://localhost:5000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // the session lives in httpOnly cookies
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (response.ok) {
        goToApp(data);
      } else {
        setFormError(data.message || "Something went wrong.");
      }
    } catch (err) {
      console.error("Auth error:", err);
      setFormError("Server error. Try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogle = async () => {
    if (googleLoading) return;
    setGoogleLoading(true);
    setFormError("");
    try {
      const result = await loginWithGoogle();
      const idToken = await result.user.getIdToken();
      const response = await fetch(process.env.REACT_APP_GOOGLE_AUTH_URI, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ idToken }),
      });
      const data = await response.json();
      if (response.ok) {
        goToApp(data);
      } else {
        setFormError(data.message || "Google sign-in failed. Please try again.");
      }
    } catch (error) {
      console.error("Google Sign-In Error:", error);
      // Closing the popup is not an error worth showing
      if (error.code !== "auth/popup-closed-by-user" && error.code !== "auth/cancelled-popup-request") {
        setFormError(
          error.code === "auth/unauthorized-domain"
            ? "This domain isn't authorized for Google sign-in yet."
            : "Google sign-in failed. Please try again."
        );
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to your account"
      footer={
        <>
          Don't have an account?{" "}
          <button type="button" className="ux-link" onClick={() => navigate("/register")}>
            Sign up
          </button>
        </>
      }
    >
      <form className="ux-auth-form" onSubmit={handleSubmit} noValidate>
        <Field
          icon={Mail}
          type="email"
          name="email"
          autoComplete="email"
          placeholder="Email address"
          aria-label="Email address"
          value={email}
          error={errors.email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (errors.email) setErrors({ ...errors, email: "" });
          }}
        />
        <Field
          icon={Lock}
          type={showPassword ? "text" : "password"}
          name="password"
          autoComplete="current-password"
          placeholder="Password"
          aria-label="Password"
          value={password}
          error={errors.password}
          onChange={(e) => {
            setPassword(e.target.value);
            if (errors.password) setErrors({ ...errors, password: "" });
          }}
          trailing={
            <button
              type="button"
              className="ux-eye"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
            </button>
          }
        />

        {formError && (
          <div role="alert" className="ux-alert error">
            {formError}
          </div>
        )}

        <button type="submit" className="ux-btn block" disabled={isLoading} style={{ padding: "14px 22px", fontSize: "16px" }}>
          {isLoading ? "Signing in..." : "Sign in"}
        </button>
      </form>

      <div className="ux-divider">or</div>

      <button type="button" className="ux-btn ghost ux-google" onClick={handleGoogle} disabled={googleLoading} style={{ padding: "13px 22px" }}>
        <GoogleMark />
        {googleLoading ? "Signing in..." : "Sign in with Google"}
      </button>
    </AuthLayout>
  );
}
