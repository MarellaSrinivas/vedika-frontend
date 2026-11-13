
import { useEffect, useState } from "react";
import {
  UserRound,
  Phone,
  Mail,
  ShieldCheck,
  Clock3,
  Building2,
  RefreshCw,
  LoaderCircle
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import api from "../../api/api";

import "./OwnerProfile.css";

export default function OwnerProfile() {
  const { user } = useAuth();

  const [profile, setProfile] = useState(user || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError("");

      // Uses the authenticated user's information from the backend.
      // If your backend has a dedicated profile endpoint, replace this URL.
      const response = await api.get("/owner/status");

      setProfile((prev) => ({
        ...prev,
        ...response.data
      }));
    } catch (err) {
      // Keep the authenticated user information if status API is unavailable.
      setError(
        err.response?.data?.message ||
        "Some account information could not be refreshed."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const ownerName =
    profile?.fullName ||
    profile?.name ||
    user?.fullName ||
    "Owner";

  const phone =
    profile?.phone ||
    user?.phone ||
    "";

  const email =
    profile?.email ||
    user?.email ||
    "";

  const role = profile?.role || user?.role || "OWNER";

  const approved =
    profile?.approved ??
    profile?.isApproved ??
    user?.approved ??
    false;

  const active =
    profile?.active ??
    profile?.isActive ??
    user?.active ??
    true;

  const initials = ownerName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");

  return (
    <div className="owner-profile-page">

      <div className="owner-profile-heading">
        <div>
          <span className="owner-eyebrow">ACCOUNT MANAGEMENT</span>
          <h1>My Profile</h1>
          <p>View your owner account information and account status.</p>
        </div>

        <button
          className="owner-profile-refresh"
          onClick={loadProfile}
          disabled={loading}
        >
          {loading ? (
            <LoaderCircle className="owner-profile-spin" size={17} />
          ) : (
            <RefreshCw size={17} />
          )}
          Refresh
        </button>
      </div>

      {error && (
        <div className="owner-profile-error">{error}</div>
      )}

      <div className="owner-profile-layout">

        <section className="owner-profile-card owner-profile-main">

          <div className="owner-profile-cover" />

          <div className="owner-profile-avatar">
            {initials || <UserRound size={35} />}
          </div>

          <div className="owner-profile-identity">
            <h2>{ownerName}</h2>
            <span className="owner-profile-role">
              <Building2 size={14} />
              Property Owner
            </span>
          </div>

          <div className="owner-profile-divider" />

          <div className="owner-profile-information">

            <div className="owner-profile-info-item">
              <div className="owner-profile-info-icon">
                <Phone size={19} />
              </div>
              <div>
                <small>Mobile Number</small>
                <strong>{phone || "Not available"}</strong>
              </div>
            </div>

            <div className="owner-profile-info-item">
              <div className="owner-profile-info-icon">
                <Mail size={19} />
              </div>
              <div>
                <small>Email Address</small>
                <strong>{email || "Not provided"}</strong>
              </div>
            </div>

            <div className="owner-profile-info-item">
              <div className="owner-profile-info-icon">
                <ShieldCheck size={19} />
              </div>
              <div>
                <small>Account Role</small>
                <strong>{role}</strong>
              </div>
            </div>

          </div>

        </section>

        <section className="owner-profile-card owner-account-status">

          <h3>Account Status</h3>
          <p>Current verification and account information.</p>

          <div className="owner-account-status-item">
            <div>
              <ShieldCheck size={20} />
              <span>Owner Approval</span>
            </div>

            <span className={`owner-profile-status ${approved ? "approved" : "pending"}`}>
              {approved ? "Approved" : "Pending"}
            </span>
          </div>

          <div className="owner-account-status-item">
            <div>
              <UserRound size={20} />
              <span>Account Status</span>
            </div>

            <span className={`owner-profile-status ${active ? "approved" : "inactive"}`}>
              {active ? "Active" : "Inactive"}
            </span>
          </div>

          <div className="owner-account-status-item">
            <div>
              <Building2 size={20} />
              <span>Account Type</span>
            </div>

            <strong>Owner</strong>
          </div>

          {!approved && (
            <div className="owner-profile-notice">
              <Clock3 size={19} />
              <div>
                <strong>Approval pending</strong>
                <p>
                  Your owner account is awaiting administrator approval.
                  You will be able to manage owner features after approval.
                </p>
              </div>
            </div>
          )}

          {!active && (
            <div className="owner-profile-notice inactive">
              <ShieldCheck size={19} />
              <div>
                <strong>Account inactive</strong>
                <p>
                  Your account is currently inactive. Please contact the administrator.
                </p>
              </div>
            </div>
          )}

        </section>

      </div>
    </div>
  );
}
