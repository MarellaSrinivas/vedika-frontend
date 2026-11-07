
import {
  createContext,
  useContext,
  useState,
} from "react";

import { sendOtp, verifyOtp } from "../api/authApi";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(
        localStorage.getItem("thevedika_user") || "null"
      );
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(
    () => localStorage.getItem("thevedika_token") || ""
  );

  const [refreshToken, setRefreshToken] = useState(
    () => localStorage.getItem("thevedika_refresh_token") || ""
  );

  const [loading, setLoading] = useState(false);

  // Send OTP
  const requestOtp = async (phone, purpose) => {
    setLoading(true);

    try {
      return await sendOtp(phone, purpose);
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP and save authentication details
  const confirmOtp = async (details) => {
    setLoading(true);

    try {
      const result = await verifyOtp(details);

      const accessToken =
        result.token ||
        result.accessToken ||
        result.access_token;

      const newRefreshToken =
        result.refreshToken ||
        result.refresh_token ||
        result.tokens?.refreshToken ||
        result.tokens?.refresh_token ||
        "";

      const responseUser = result.user || {};

      if (!accessToken) {
        throw new Error(
          "The server did not return an authentication token."
        );
      }

      const loggedInUser = {
        id:
          responseUser.id ??
          result.userId ??
          result.id ??
          null,

        phone:
          responseUser.phone ??
          result.phone ??
          details.phone,

        fullName:
          responseUser.fullName ??
          result.fullName ??
          details.fullName ??
          "",

        email:
          responseUser.email ??
          result.email ??
          details.email ??
          "",

        role:
          responseUser.role ??
          result.role ??
          "CUSTOMER",
      };

      // Save access token
      localStorage.setItem(
        "thevedika_token",
        accessToken
      );

      // Save refresh token
      if (newRefreshToken) {
        localStorage.setItem(
          "thevedika_refresh_token",
          newRefreshToken
        );
      } else {
        localStorage.removeItem(
          "thevedika_refresh_token"
        );
      }

      // Save user
      localStorage.setItem(
        "thevedika_user",
        JSON.stringify(loggedInUser)
      );

      // Update React state
      setToken(accessToken);
      setRefreshToken(newRefreshToken);
      setUser(loggedInUser);

      return loggedInUser;

    } finally {
      setLoading(false);
    }
  };

  // Logout
  const logout = () => {
    localStorage.removeItem("thevedika_token");
    localStorage.removeItem("thevedika_refresh_token");
    localStorage.removeItem("thevedika_user");

    setToken("");
    setRefreshToken("");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        refreshToken,
        loading,
        isAuthenticated: Boolean(token),
        requestOtp,
        confirmOtp,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
}
