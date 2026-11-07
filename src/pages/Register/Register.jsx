
import { useState } from "react";
import { Link, useNavigate, useLocation  } from "react-router-dom";
import { ArrowLeft, ArrowRight, ShieldCheck } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import "../Auth.css";

export default function Register() {
  const navigate = useNavigate();
  const location = useLocation();
const redirectTo =
  location.state?.from?.pathname || "/my-bookings";
  const { requestOtp, confirmOtp, loading } = useAuth();

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
  });

  const [otp, setOtp] = useState("");
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const phone = form.phone.replace(/\D/g, "").slice(-10);

  const updateField = (event) => {
    setForm((previous) => ({
      ...previous,
      [event.target.name]: event.target.value,
    }));
  };

  const handleSendOtp = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!form.fullName.trim()) {
      setError("Please enter your full name.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!/^[6-9]\d{9}$/.test(phone)) {
      setError("Enter a valid 10-digit Indian mobile number.");
      return;
    }

    try {
      await requestOtp(phone, "REGISTER");
      setStep(2);
      setMessage("OTP sent. Verify your mobile number to register.");
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Could not send OTP. Please try again."
      );
    }
  };

  const handleVerifyOtp = async (event) => {
    event.preventDefault();
    setError("");

    if (!/^\d{4,8}$/.test(otp)) {
      setError("Enter the valid OTP you received.");
      return;
    }

    try {
      await confirmOtp({
        phone,
        otp,
        purpose: "REGISTER",
        fullName: form.fullName.trim(),
        email: form.email.trim(),
      });

navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Registration verification failed. Please try again."
      );
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-card">
        <Link to="/" className="auth-brand">TheVedika</Link>

        <div className="auth-icon">
          <ShieldCheck size={28} />
        </div>

        <h1 className="auth-title">
          {step === 1 ? "Create your account" : "Verify your mobile"}
        </h1>

        <p className="auth-description">
          {step === 1
            ? "Join TheVedika to book your next private getaway."
            : `Enter the OTP sent to +91 ${phone}`}
        </p>

        {error && <p className="auth-error">{error}</p>}
        {message && <p className="auth-success">{message}</p>}

        {step === 1 ? (
          <form onSubmit={handleSendOtp} className="auth-form">
            <label htmlFor="fullName">Full name</label>
            <input
              className="auth-input"
              id="fullName"
              name="fullName"
              placeholder="Enter your full name"
              autoComplete="name"
              value={form.fullName}
              onChange={updateField}
              required
            />

            <label htmlFor="email">Email address</label>
            <input
              className="auth-input"
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              value={form.email}
              onChange={updateField}
              required
            />

            <label htmlFor="phone">Mobile number</label>
            <div className="auth-phone-input">
              <span>+91</span>
              <input
                id="phone"
                name="phone"
                type="tel"
                inputMode="numeric"
                autoComplete="tel-national"
                placeholder="10-digit mobile number"
                value={form.phone}
                onChange={(e) =>
                  setForm((previous) => ({
                    ...previous,
                    phone: e.target.value.replace(/\D/g, "").slice(0, 10),
                  }))
                }
                required
              />
            </div>

            <button className="auth-submit" disabled={loading}>
              {loading ? "Sending OTP..." : "Register with OTP"}
              <ArrowRight size={18} />
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="auth-form">
            <label htmlFor="otp">One-time password</label>
            <input
              className="auth-input"
              id="otp"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) =>
                setOtp(e.target.value.replace(/\D/g, "").slice(0, 8))
              }
              required
            />

            <button className="auth-submit" disabled={loading}>
              {loading ? "Verifying..." : "Verify & Create Account"}
              <ArrowRight size={18} />
            </button>

            <button
              type="button"
              className="auth-text-button"
              onClick={() => {
                setStep(1);
                setOtp("");
                setError("");
                setMessage("");
              }}
            >
              <ArrowLeft size={15} /> Edit registration details
            </button>

            <button
              type="button"
              className="auth-text-button"
              disabled={loading}
              onClick={handleSendOtp}
            >
              Resend OTP
            </button>
          </form>
        )}

        <p className="auth-switch">
          Already have an account? <Link to="/login">Login with OTP</Link>
        </p>

        <p className="auth-privacy">
          Your mobile number is used to verify your account and secure your bookings.
        </p>
      </section>
    </main>
  );
}
