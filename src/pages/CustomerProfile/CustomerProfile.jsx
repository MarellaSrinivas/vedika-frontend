
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  UserRound,
  Phone,
  Mail,
  CalendarDays,
  Pencil,
  Trash2,
  LogOut,
  LoaderCircle,
  Save,
  X,
} from "lucide-react";

import {
  getMyProfile,
  updateMyProfile,
  deleteMyAccount,
} from "../../api/customerApi";

import { useAuth } from "../../context/AuthContext";

import "./CustomerProfile.css";

const CustomerProfile = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getMyProfile();

      setProfile(data);
      setFormData({
        fullName: data.fullName || "",
        email: data.email || "",
      });
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to load your profile."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");
      setMessage("");

      const updated = await updateMyProfile(formData);

      setProfile(updated);
      setFormData({
        fullName: updated.fullName || "",
        email: updated.email || "",
      });

      setEditing(false);
      setMessage("Profile updated successfully.");
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to update your profile."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to deactivate your account? You will be logged out and will no longer be able to access your account."
    );

    if (!confirmed) return;

    try {
      await deleteMyAccount();
      logout();
      navigate("/", { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to deactivate your account."
      );
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  if (loading) {
    return (
      <div className="customer-profile-loading">
        <LoaderCircle className="spin" size={30} />
        <p>Loading your profile...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="customer-profile-page">
        <p className="profile-error">{error || "Profile not found."}</p>
        <button onClick={handleLogout}>Logout</button>
      </div>
    );
  }

  return (
    <div className="customer-profile-page">
      <div className="customer-profile-container">
        <div className="customer-profile-heading">
          <div>
            <span className="profile-eyebrow">YOUR VEDIKA ACCOUNT</span>
            <h1>My Profile</h1>
            <p>Manage your personal information and bookings.</p>
          </div>

          <button
            type="button"
            className="profile-logout-btn"
            onClick={handleLogout}
          >
            <LogOut size={17} />
            Logout
          </button>
        </div>

        {error && <div className="profile-error">{error}</div>}
        {message && <div className="profile-success">{message}</div>}

        <div className="customer-profile-card">
          <div className="profile-card-heading">
            <div className="profile-avatar">
              <UserRound size={30} />
            </div>

            <div>
              <h2>{profile.fullName || "Welcome"}</h2>
              <span>Customer Account</span>
            </div>

            {!editing && (
              <button
                type="button"
                className="profile-edit-btn"
                onClick={() => {
                  setError("");
                  setMessage("");
                  setEditing(true);
                }}
              >
                <Pencil size={16} />
                Edit Profile
              </button>
            )}
          </div>

          {editing ? (
            <form className="profile-edit-form" onSubmit={handleUpdate}>
              <label htmlFor="fullName">Full Name</label>
              <input
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required
                maxLength={120}
              />

              <label htmlFor="email">Email Address</label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                maxLength={150}
              />

              <div className="profile-form-actions">
                <button type="submit" disabled={saving}>
                  {saving ? (
                    <LoaderCircle size={17} className="spin" />
                  ) : (
                    <Save size={17} />
                  )}
                  {saving ? "Saving..." : "Save Changes"}
                </button>

                <button
                  type="button"
                  className="profile-cancel-btn"
                  onClick={() => {
                    setFormData({
                      fullName: profile.fullName || "",
                      email: profile.email || "",
                    });
                    setEditing(false);
                    setError("");
                  }}
                >
                  <X size={17} />
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="profile-details">
              <div className="profile-detail-item">
                <UserRound size={19} />
                <div>
                  <span>Full Name</span>
                  <strong>{profile.fullName || "Not provided"}</strong>
                </div>
              </div>

              <div className="profile-detail-item">
                <Phone size={19} />
                <div>
                  <span>Mobile Number</span>
                  <strong>{profile.phone || "Not provided"}</strong>
                </div>
              </div>

              <div className="profile-detail-item">
                <Mail size={19} />
                <div>
                  <span>Email Address</span>
                  <strong>{profile.email || "Not provided"}</strong>
                </div>
              </div>

              <div className="profile-detail-item">
                <CalendarDays size={19} />
                <div>
                  <span>Member Since</span>
                  <strong>
                    {profile.createdAt
                      ? new Date(profile.createdAt).toLocaleDateString(
                          "en-IN",
                          {
                            day: "2-digit",
                            month: "long",
                            year: "numeric",
                          }
                        )
                      : "N/A"}
                  </strong>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="customer-profile-actions">
          <Link to="/my-bookings" className="profile-action-card">
            <CalendarDays size={25} />
            <div>
              <h3>My Bookings</h3>
              <p>View your farmhouse reservations and payment details.</p>
            </div>
          </Link>

          <button
            type="button"
            className="profile-delete-card"
            onClick={handleDeleteAccount}
          >
            <Trash2 size={24} />
            <div>
              <h3>Delete Account</h3>
              <p>Deactivate your customer account.</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomerProfile;
