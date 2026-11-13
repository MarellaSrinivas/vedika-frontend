
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    Plus,
    Search,
    Pencil,
    Power,
    Building2,
    MapPin,
    Users,
    BedDouble,
    RefreshCw,
    PackagePlus,
    CalendarDays
} from "lucide-react";

import FarmhouseForm from "../../components/farmhouses/FarmhouseForm";

import {
    getMyFarmhouses,
    createOwnerFarmhouse,
    updateOwnerFarmhouse,
    activateOwnerFarmhouse,
    deactivateOwnerFarmhouse,
    getOwnerFarmhouseAmenities,
    updateOwnerFarmhouseAmenities,
    uploadOwnerFarmhouseImage
} from "../../api/ownerDashboardApi";

import "./OwnerFarmhouses.css";

export default function OwnerFarmhouses() {
    const navigate = useNavigate();

    const [farmhouses, setFarmhouses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [editingFarmhouse, setEditingFarmhouse] = useState(null);

    const [saving, setSaving] = useState(false);
    const [uploadProgress, setUploadProgress] = useState("");

    // Load owner farmhouses
    const loadFarmhouses = useCallback(async () => {
        try {
            setLoading(true);

            const response = await getMyFarmhouses();

            const data = Array.isArray(response)
                ? response
                : response?.data || [];

            setFarmhouses(data);
        } catch (error) {
            console.error("Failed to load owner farmhouses:", error);

            alert(
                error.response?.data?.message ||
                "Unable to load your farmhouses."
            );
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadFarmhouses();
    }, [loadFarmhouses]);

    // Reset form
    const resetForm = () => {
        setShowModal(false);
        setEditingId(null);
        setEditingFarmhouse(null);
        setUploadProgress("");
    };

    // Create farmhouse
    const openCreate = () => {
        setEditingId(null);
        setEditingFarmhouse(null);
        setShowModal(true);
    };

    // Edit farmhouse
    const openEdit = (farmhouse) => {
        setEditingId(farmhouse.id);
        setEditingFarmhouse(farmhouse);
        setShowModal(true);
    };

    // Save farmhouse, amenities and images
    const handleSave = async ({ payload, amenityIds, images }) => {
        try {
            setSaving(true);
            setUploadProgress("");

            let savedFarmhouse;

            if (editingId) {
                savedFarmhouse = await updateOwnerFarmhouse(
                    editingId,
                    payload
                );
            } else {
                savedFarmhouse = await createOwnerFarmhouse(payload);
            }

            const farmhouseId =
                editingId ||
                savedFarmhouse?.id ||
                savedFarmhouse?.data?.id;

            if (!farmhouseId) {
                throw new Error(
                    "Farmhouse was saved, but its ID was not returned."
                );
            }

            // Save amenities
            await updateOwnerFarmhouseAmenities(
                farmhouseId,
                amenityIds
            );

            // Upload images
            for (let index = 0; index < images.length; index++) {
                setUploadProgress(
                    `Uploading image ${index + 1} of ${images.length}...`
                );

                await uploadOwnerFarmhouseImage(
                    farmhouseId,
                    images[index],
                    index,
                    index === 0
                );
            }

            alert(
                editingId
                    ? "Farmhouse updated successfully."
                    : "Farmhouse created successfully."
            );

            resetForm();
            await loadFarmhouses();

        } catch (error) {
            console.error("Failed to save farmhouse:", error);

            alert(
                error.response?.data?.message ||
                error.message ||
                "Unable to save farmhouse. Please try again."
            );
        } finally {
            setSaving(false);
            setUploadProgress("");
        }
    };

    // Activate / deactivate farmhouse
    const handleStatusChange = async (farmhouse) => {
        const currentlyActive = farmhouse.active;

        const confirmed = window.confirm(
            currentlyActive
                ? "Are you sure you want to deactivate this farmhouse?"
                : "Are you sure you want to activate this farmhouse?"
        );

        if (!confirmed) return;

        try {
            if (currentlyActive) {
                await deactivateOwnerFarmhouse(farmhouse.id);
            } else {
                await activateOwnerFarmhouse(farmhouse.id);
            }

            await loadFarmhouses();

        } catch (error) {
            console.error("Failed to change farmhouse status:", error);

            alert(
                error.response?.data?.message ||
                "Unable to update farmhouse status."
            );
        }
    };

    // Search
    const filteredFarmhouses = farmhouses.filter((farmhouse) => {
        const searchText = search.toLowerCase();

        return (
            farmhouse.name?.toLowerCase().includes(searchText) ||
            farmhouse.location?.toLowerCase().includes(searchText) ||
            farmhouse.city?.toLowerCase().includes(searchText)
        );
    });

    return (
        <div className="of-page">

            {/* Page heading */}
            <div className="of-heading">
                <div>
                    <span className="of-eyebrow">OWNER PANEL</span>
                    <h1>My Farmhouses</h1>
                    <p>
                        Manage your properties and farmhouse details.
                    </p>
                </div>

                <button
                    type="button"
                    className="of-add-btn"
                    onClick={openCreate}
                >
                    <Plus size={19} />
                    Add Farmhouse
                </button>
            </div>

            {/* Search and refresh */}
            <div className="of-toolbar">
                <div className="of-search">
                    <Search size={18} />

                    <input
                        type="text"
                        placeholder="Search by farmhouse or location..."
                        value={search}
                        onChange={(event) =>
                            setSearch(event.target.value)
                        }
                    />
                </div>

                <button
                    type="button"
                    className="of-refresh"
                    onClick={loadFarmhouses}
                    disabled={loading}
                    title="Refresh farmhouses"
                >
                    <RefreshCw size={17} />
                </button>
            </div>

            {/* Farmhouse listing */}
            {loading ? (
                <div className="of-state">
                    Loading your farmhouses...
                </div>
            ) : filteredFarmhouses.length === 0 ? (
                <div className="of-empty">
                    <Building2 size={42} />

                    <h3>
                        {search
                            ? "No matching farmhouses found"
                            : "No farmhouses yet"}
                    </h3>

                    <p>
                        {search
                            ? "Try another search."
                            : "Add your first farmhouse to get started."}
                    </p>

                    {!search && (
                        <button
                            type="button"
                            className="of-add-btn"
                            onClick={openCreate}
                        >
                            <Plus size={18} />
                            Add Farmhouse
                        </button>
                    )}
                </div>
            ) : (
                <div className="of-grid">

                    {filteredFarmhouses.map((farmhouse) => (
                        <article
                            className="of-card"
                            key={farmhouse.id}
                        >

                            {/* Image */}
                            <div className="of-image">

                                {farmhouse.coverImage ? (
                                    <img
                                        src={farmhouse.coverImage}
                                        alt={farmhouse.name}
                                    />
                                ) : (
                                    <div className="of-no-image">
                                        <Building2 size={38} />
                                        <span>No photo uploaded</span>
                                    </div>
                                )}

                                <span
                                    className={`of-status ${
                                        farmhouse.active
                                            ? "active"
                                            : "inactive"
                                    }`}
                                >
                                    {farmhouse.active
                                        ? "Active"
                                        : "Inactive"}
                                </span>

                            </div>

                            {/* Card details */}
                            <div className="of-card-body">

                                <h3>{farmhouse.name}</h3>

                                <p className="of-location">
                                    <MapPin size={15} />

                                    {farmhouse.location ||
                                        farmhouse.city ||
                                        "Location not provided"}
                                </p>

                                <div className="of-details">

                                    <span>
                                        <Users size={16} />

                                        {farmhouse.minimumGuests || 0}-
                                        {farmhouse.maximumGuests || 0}
                                        {" "}Guests
                                    </span>

                                    <span>
                                        <BedDouble size={16} />

                                        {farmhouse.bedrooms || 0}
                                        {" "}Bedrooms
                                    </span>

                                </div>

                                <div className="of-price">
                                    ₹
                                    {Number(
                                        farmhouse.basePrice || 0
                                    ).toLocaleString("en-IN")}

                                    <small> / night</small>
                                </div>

                                {/* Edit and status actions */}
                                <div className="of-actions">

                                    <button
                                        type="button"
                                        className="of-edit-btn"
                                        onClick={() =>
                                            openEdit(farmhouse)
                                        }
                                    >
                                        <Pencil size={16} />
                                        Edit
                                    </button>

                                    <button
                                        type="button"
                                        className={`of-toggle-btn ${
                                            farmhouse.active
                                                ? "deactivate"
                                                : "activate"
                                        }`}
                                        onClick={() =>
                                            handleStatusChange(farmhouse)
                                        }
                                    >
                                        <Power size={16} />

                                        {farmhouse.active
                                            ? "Deactivate"
                                            : "Activate"}
                                    </button>

                                </div>

                                {/* Add-ons and Calendar actions */}
                                <div className="of-management-actions">

                                    <button
                                        type="button"
                                        className="of-addon-btn"
                                        onClick={() =>
                                            navigate(
                                                `/owner/farmhouses/${farmhouse.id}/addons`
                                            )
                                        }
                                    >
                                        <PackagePlus size={16} />
                                        Add-ons
                                    </button>

                                    <button
                                        type="button"
                                        className="of-calendar-btn"
                                        onClick={() =>
                                            navigate(
                                                `/owner/farmhouses/${farmhouse.id}/calendar`
                                            )
                                        }
                                    >
                                        <CalendarDays size={16} />
                                        Calendar
                                    </button>

                                </div>

                            </div>
                        </article>
                    ))}

                </div>
            )}

            {/* Shared Farmhouse Form */}
            {showModal && (
                <FarmhouseForm
                    initialData={editingFarmhouse}
                    farmhouseId={editingId}
                    loadAssignedAmenities={
                        getOwnerFarmhouseAmenities
                    }
                    onSubmit={handleSave}
                    onCancel={resetForm}
                    submitting={saving}
                    uploadProgress={uploadProgress}
                />
            )}

        </div>
    );
}
