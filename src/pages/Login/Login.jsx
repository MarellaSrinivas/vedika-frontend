 
import { useState } from "react";
import {
  Link,
  useNavigate,
  useLocation,
  useSearchParams,
} from "react-router-dom";

import {
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import "../Auth.css";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const { requestOtp, confirmOtp, loading } = useAuth();

  const queryRedirect = searchParams.get("redirect");
  const stateRedirect = location.state?.from?.pathname;
  const requestedRedirect = queryRedirect || stateRedirect;

  // Only allow internal application paths.
  const redirectTo =
    requestedRedirect &&
    requestedRedirect.startsWith("/") &&
    !requestedRedirect.startsWith("//")
      ? requestedRedirect
      : "/my-bookings";

  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState(1);
  const [purpose, setPurpose] = useState("LOGIN");
  const [isNewUser, setIsNewUser] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const cleanPhone = phone.replace(/\D/g, "").slice(-10);

  
const handleSendOtp = async (event) => {
    event?.preventDefault();

    setError("");
    setMessage("");

    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
        setError("Enter a valid 10-digit Indian mobile number.");
        return;
    }

    try {
        // First try normal login.
        await requestOtp(cleanPhone, "LOGIN");

        setPurpose("LOGIN");
        setIsNewUser(false);
        setStep(2);
        setMessage("OTP sent successfully. Please check your mobile.");

    } catch (err) {
        const status = err.response?.status;
        const data = err.response?.data;

        const backendMessage = String(
            data?.message ||
            data?.detail ||
            data?.error ||
            ""
        );

        console.error("LOGIN OTP ERROR:", {
            status,
            data,
        });

        // Only switch to registration when the backend explicitly
        // identifies this phone number as an unregistered account.
        const accountNotFound =
            backendMessage.toLowerCase().includes("account not found");

        if (accountNotFound) {
            try {
                await requestOtp(cleanPhone, "REGISTER");

                setPurpose("REGISTER");
                setIsNewUser(true);
                setStep(2);
                setMessage(
                    "Welcome to TheVedika! Your registration OTP has been sent."
                );

            } catch (registerError) {
                console.error(
                    "REGISTER OTP ERROR:",
                    registerError.response?.data || registerError
                );

                setError(
                    registerError.response?.data?.message ||
                    registerError.response?.data?.detail ||
                    registerError.response?.data?.error ||
                    "Could not send registration OTP. Please try again."
                );
            }

            return;
        }

        setError(
            backendMessage ||
            `Could not send OTP. Server returned ${status || "an unknown error"}.`
        );
    }
};


  const handleVerifyOtp = async (event) => {
    event.preventDefault();

    setError("");
    setMessage("");

    if (!/^\d{6}$/.test(otp)) {
      setError("Enter the valid 6-digit OTP.");
      return;
    }

    try {
      await confirmOtp({
        phone: cleanPhone,
        otp,
        purpose,
      });

      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "OTP verification failed. Please try again."
      );
    }
  };

  const handleChangeNumber = () => {
    setStep(1);
    setOtp("");
    setPurpose("LOGIN");
    setIsNewUser(false);
    setError("");
    setMessage("");
  };

  return (
    <main className="auth-page">
      <section className="auth-card">
        <Link to="/" className="auth-brand">
          TheVedika
        </Link>

        <div className="auth-icon">
          <ShieldCheck size={28} />
        </div>

        <h1 className="auth-title">
          {step === 1
            ? "Welcome to TheVedika"
            : isNewUser
              ? "Create your account"
              : "Verify your number"}
        </h1>

        <p className="auth-description">
          {step === 1
            ? "Enter your mobile number to login or create an account."
            : `Enter the 6-digit OTP sent to +91 ${cleanPhone}`}
        </p>

        {error && (
          <p className="auth-error" role="alert">
            {error}
          </p>
        )}

        {message && (
          <p className="auth-success" role="status">
            {message}
          </p>
        )}

        {step === 1 ? (
          <form onSubmit={handleSendOtp} className="auth-form">
            <label htmlFor="phone">Mobile number</label>

            <div className="auth-phone-input">
              <span>+91</span>

              <input
                id="phone"
                type="tel"
                inputMode="numeric"
                autoComplete="tel-national"
                placeholder="10-digit mobile number"
                value={phone}
                maxLength={10}
                onChange={(event) =>
                  setPhone(
                    event.target.value
                      .replace(/\D/g, "")
                      .slice(0, 10)
                  )
                }
                required
              />
            </div>

            <button
              type="submit"
              className="auth-submit"
              disabled={loading}
            >
              {loading ? "Sending OTP..." : "Continue"}
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
              placeholder="Enter 6-digit OTP"
              value={otp}
              maxLength={6}
              onChange={(event) =>
                setOtp(
                  event.target.value
                    .replace(/\D/g, "")
                    .slice(0, 6)
                )
              }
              required
            />

            <button
              type="submit"
              className="auth-submit"
              disabled={loading}
            >
              {loading
                ? "Verifying..."
                : isNewUser
                  ? "Verify & Create Account"
                  : "Verify & Login"}
              <ArrowRight size={18} />
            </button>

            <button
              type="button"
              className="auth-text-button"
              disabled={loading}
              onClick={handleChangeNumber}
            >
              <ArrowLeft size={15} />
              Change mobile number
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
          Already have an account or new to TheVedika?{" "}
          <Link to="/register">Register separately</Link>
        </p>

        <p className="auth-privacy">
          By continuing, you agree to our Terms of Service
          and Privacy Policy.
        </p>
      </section>
    </main>
  );
} 