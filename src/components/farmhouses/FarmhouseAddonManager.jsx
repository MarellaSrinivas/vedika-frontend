
import { useCallback, useEffect, useState } from "react";
import {
    Plus,
    Pencil,
    Trash2,
    X,
    PackagePlus,
    RefreshCw
} from "lucide-react";

import "./FarmhouseAddonManager.css";

const emptyForm = {
    name: "",
    description: "",
    price: "",
    pricingType: "PER_STAY",
    available: true
};

export default function FarmhouseAddonManager({
    farmhouse,
    onClose,
    getAddons,
    createAddon,
    updateAddon,
    deleteAddon
}) {
    const [addons, setAddons] = useState([]);
    const [form, setForm] = useState(emptyForm);
    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const farmhouseId = farmhouse?.id;

   

    // Load add-ons using the API function supplied by Admin or Owner
    const loadAddons = useCallback(async () => {
        if (!farmhouseId || typeof getAddons !== "function") {
            setAddons([]);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError("");

            const response = await getAddons(farmhouseId);

            // Supports both direct arrays and wrapped API responses
            const data = Array.isArray(response)
                ? response
                : response?.data?.data ??
                  response?.data ??
                  response?.addons ??
                  [];

            setAddons(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Failed to load farmhouse add-ons:", err);

            setError(
                err.response?.data?.message ||
                err.message ||
                "Unable to load add-on services."
            );
        } finally {
            setLoading(false);
        }
        console.log("FARMHOUSE ADDON MANAGER - VERSION 2", {
    farmhouseId,
    propsReceived: {
        getAddons,
        createAddon,
        updateAddon,
        deleteAddon
    },
    types: {
        getAddons: typeof getAddons,
        createAddon: typeof createAddon,
        updateAddon: typeof updateAddon,
        deleteAddon: typeof deleteAddon
    }
});
    }, [farmhouseId, getAddons]);

    useEffect(() => {
        loadAddons();
    }, [loadAddons]);

    const handleChange = (event) => {
        const { name, value, type, checked } = event.target;

        setForm((previous) => ({
            ...previous,
            [name]: type === "checkbox" ? checked : value
        }));
    };

    const resetForm = () => {
        setForm(emptyForm);
        setEditingId(null);
        setError("");
    };

    const handleEdit = (addon) => {
        setEditingId(addon.id);

        setForm({
            name: addon.name || "",
            description: addon.description || "",
            price: addon.price ?? "",
            pricingType: addon.pricingType || "PER_STAY",
            available: addon.available ?? true
        });

        setError("");
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!farmhouseId) {
            setError("Farmhouse not found.");
            return;
        }

        if (!form.name.trim()) {
            setError("Please enter the add-on name.");
            return;
        }

        if (
            form.price === "" ||
            !Number.isFinite(Number(form.price)) ||
            Number(form.price) < 0
        ) {
            setError("Please enter a valid add-on price.");
            return;
        }

        const payload = {
            name: form.name.trim(),
            description: form.description.trim(),
            price: Number(form.price),
            pricingType: form.pricingType,
            available: form.available
        };

        try {
            setSaving(true);
            setError("");

            if (editingId !== null) {
                if (typeof updateAddon !== "function") {
                    throw new Error("Update add-on API is not configured.");
                }

                await updateAddon(farmhouseId, editingId, payload);
            } else {
                if (typeof createAddon !== "function") {
                    throw new Error("Create add-on API is not configured.");
                }

                await createAddon(farmhouseId, payload);
            }

            resetForm();
            await loadAddons();
        } catch (err) {
            console.error("Failed to save add-on:", err);

            setError(
                err.response?.data?.message ||
                err.message ||
                "Unable to save add-on service."
            );
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (addonId) => {
        if (!window.confirm("Are you sure you want to delete this add-on?")) {
            return;
        }

        try {
            setError("");

            if (typeof deleteAddon !== "function") {
                throw new Error("Delete add-on API is not configured.");
            }

            await deleteAddon(farmhouseId, addonId);

            if (editingId === addonId) {
                resetForm();
            }

            await loadAddons();
        } catch (err) {
            console.error("Failed to delete add-on:", err);

            setError(
                err.response?.data?.message ||
                err.message ||
                "Unable to delete add-on."
            );
        }
    };

    return (
        <div className="fam-overlay">
            <div className="fam-modal">
                <div className="fam-header">
                    <div>
                        <h2>Additional Services</h2>
                        <p>{farmhouse?.name || "Farmhouse"}</p>
                    </div>

                    <button
                        type="button"
                        className="fam-close"
                        onClick={onClose}
                    >
                        <X size={21} />
                    </button>
                </div>

                <div className="fam-content">
                    <form className="fam-form" onSubmit={handleSubmit}>
                        <h3>
                            <PackagePlus size={19} />
                            {editingId !== null
                                ? "Edit Service"
                                : "Add New Service"}
                        </h3>

                        <div className="fam-grid">
                            <label>
                                Service name *
                                <input
                                    name="name"
                                    value={form.name}
                                    onChange={handleChange}
                                    placeholder="Example: Gas Cooking"
                                    required
                                />
                            </label>

                            <label>
                                Price (₹) *
                                <input
                                    type="number"
                                    name="price"
                                    min="0"
                                    step="0.01"
                                    value={form.price}
                                    onChange={handleChange}
                                    required
                                />
                            </label>

                            <label>
                                Pricing type *
                                <select
                                    name="pricingType"
                                    value={form.pricingType}
                                    onChange={handleChange}
                                >
                                    <option value="PER_STAY">
                                        Per Stay
                                    </option>
                                    <option value="PER_GUEST">
                                        Per Guest
                                    </option>
                                </select>
                            </label>

                            <label className="fam-available">
                                <input
                                    type="checkbox"
                                    name="available"
                                    checked={form.available}
                                    onChange={handleChange}
                                />
                                Available for booking
                            </label>

                            <label className="fam-full">
                                Description
                                <textarea
                                    name="description"
                                    value={form.description}
                                    onChange={handleChange}
                                    rows="3"
                                    placeholder="Describe this additional service..."
                                />
                            </label>
                        </div>

                        <div className="fam-form-actions">
                            {editingId !== null && (
                                <button
                                    type="button"
                                    className="fam-cancel"
                                    onClick={resetForm}
                                >
                                    Cancel edit
                                </button>
                            )}

                            <button
                                type="submit"
                                className="fam-save"
                                disabled={saving}
                            >
                                <Plus size={17} />

                                {saving
                                    ? "Saving..."
                                    : editingId !== null
                                        ? "Update Service"
                                        : "Add Service"}
                            </button>
                        </div>
                    </form>

                    {error && (
                        <div className="fam-error">
                            {error}
                        </div>
                    )}

                    <div className="fam-list-header">
                        <h3>Configured Services</h3>

                        <button
                            type="button"
                            onClick={loadAddons}
                            disabled={loading}
                            title="Refresh services"
                        >
                            <RefreshCw size={16} />
                        </button>
                    </div>

                    {loading ? (
                        <p className="fam-muted">
                            Loading services...
                        </p>
                    ) : addons.length === 0 ? (
                        <div className="fam-empty">
                            <PackagePlus size={30} />
                            <p>No additional services added yet.</p>
                        </div>
                    ) : (
                        <div className="fam-list">
                            {addons.map((addon) => (
                                <div
                                    className="fam-item"
                                    key={addon.id}
                                >
                                    <div className="fam-item-info">
                                        <div className="fam-item-title">
                                            <strong>{addon.name}</strong>

                                            <span
                                                className={
                                                    addon.available
                                                        ? "fam-status active"
                                                        : "fam-status inactive"
                                                }
                                            >
                                                {addon.available
                                                    ? "Available"
                                                    : "Unavailable"}
                                            </span>
                                        </div>

                                        <p>
                                            {addon.description ||
                                                "No description provided."}
                                        </p>

                                        <div className="fam-item-price">
                                            ₹
                                            {Number(
                                                addon.price || 0
                                            ).toLocaleString("en-IN")}

                                            <span>
                                                / {addon.pricingType === "PER_GUEST"
                                                    ? "Guest"
                                                    : "Stay"}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="fam-item-actions">
                                        <button
                                            type="button"
                                            onClick={() => handleEdit(addon)}
                                            title="Edit service"
                                        >
                                            <Pencil size={17} />
                                        </button>

                                        <button
                                            type="button"
                                            className="delete"
                                            onClick={() =>
                                                handleDelete(addon.id)
                                            }
                                            title="Delete service"
                                        >
                                            <Trash2 size={17} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
