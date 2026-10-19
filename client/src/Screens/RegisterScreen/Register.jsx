import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Eye, EyeOff, Mail, Lock, User } from "lucide-react";
import { loginWithGoogle } from "../FireBase";
import AuthLayout from "../../components/AuthLayout";
import { Field, GoogleMark } from "../../components/ui";

export default function RegisterPage() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState({ type: "", text: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};
    if (form.name.trim().length < 2) newErrors.name = "Name must be at least 2 characters";
    if (!/\S+@\S+\.\S+/.test(form.email)) newErrors.email = "Invalid email format";
    if (form.password.length < 6) newErrors.password = "Password must be at least 6 characters";
    return newErrors;
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setIsLoading(true);
    setMessage({ type: "", text: "" });
    try {
      const res = await axios.post(
        process.env.REACT_APP_REGISTER_USER,
        { name: form.name.trim(), email: form.email, password: form.password },
        { withCredentials: true }
      );
      setMessage({ type: "success", text: res.data.message || "Registered successfully!" });
      setForm({ name: "", email: "", password: "" });
      setTimeout(() => navigate("/login"), 1500); // Redirect after a short delay
    } catch (err) {
      console.error("Registration error:", err);
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Registration failed. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // The server creates the account the first time someone signs in with Google
  const handleGoogleSignUp = async () => {
    if (googleLoading) return;
    setGoogleLoading(true);
    setMessage({ type: "", text: "" });
    try {
      const result = await loginWithGoogle();
      const idToken = await result.user.getIdToken();
      const res = await fetch(process.env.REACT_APP_GOOGLE_AUTH_URI, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ idToken }),
      });
      const data = await res.json();
      if (res.ok) {
        navigate("/dashboard");
      } else {
        setMessage({ type: "error", text: data.message || "Google sign-up failed. Please try again." });
      }
    } catch (error) {
      console.error("Google Sign-Up Error:", error);
      if (error.code !== "auth/popup-closed-by-user" && error.code !== "auth/cancelled-popup-request") {
        setMessage({
          type: "error",
          text:
            error.code === "auth/unauthorized-domain"
              ? "This domain isn't authorized for Google sign-in yet."
              : "Google sign-up failed. Please try again.",
        });
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Create account"
      subtitle="Start tracking your GATE preparation"
      footer={
        <>
          Already have an account?{" "}
          <button type="button" className="ux-link" onClick={() => navigate("/login")}>
            Sign in
          </button>
        </>
      }
    >
      <form className="ux-auth-form" onSubmit={handleSubmit} noValidate>
        <Field
          icon={User}
          type="text"
          name="name"
          autoComplete="name"
          placeholder="Full name"
          aria-label="Full name"
          value={form.name}
          error={errors.name}
          onChange={handleChange}
        />
        <Field
          icon={Mail}
          type="email"
          name="email"
          autoComplete="email"
          placeholder="Email address"
          aria-label="Email address"
          value={form.email}
          error={errors.email}
          onChange={handleChange}
        />
        <Field
          icon={Lock}
          type={showPassword ? "text" : "password"}
          name="password"
          autoComplete="new-password"
          placeholder="Password (6+ characters)"
          aria-label="Password"
          value={form.password}
          error={errors.password}
          onChange={handleChange}
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

        {message.text && (
          <div role="alert" className={`ux-alert ${message.type}`}>
            {message.text}
          </div>
        )}

        <button type="submit" className="ux-btn block" disabled={isLoading} style={{ padding: "14px 22px", fontSize: "16px" }}>
          {isLoading ? "Creating account..." : "Create account"}
        </button>
      </form>

      <div className="ux-divider">or</div>

      <button type="button" className="ux-btn ghost ux-google" onClick={handleGoogleSignUp} disabled={googleLoading} style={{ padding: "13px 22px" }}>
        <GoogleMark />
        {googleLoading ? "Signing up..." : "Sign up with Google"}
      </button>
    </AuthLayout>
  );
}
