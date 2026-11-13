
import { useEffect, useMemo, useState } from "react";
import {
    Plus,
    Search,
    Pencil,
    Power,
    Building2,
    X,
    RefreshCw,
    MapPin,
    Users,
    BedDouble,
    CalendarDays,
    PackagePlus
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import {
    getAdminFarmhouses,
    createAdminFarmhouse,
    updateAdminFarmhouse,
    activateAdminFarmhouse,
    deactivateAdminFarmhouse,
    assignFarmhouseOwner,
    uploadAdminFarmhouseImage,
    getAdminFarmhouseAmenities,
    updateAdminFarmhouseAmenities,
    getAdminFarmhouseAddons,
    createAdminFarmhouseAddon,
    updateAdminFarmhouseAddon,
    deleteAdminFarmhouseAddon
} from "../../api/adminFarmhouseApi";

import "./AdminFarmhouses.css";

import FarmhouseAddonManager from "../../components/farmhouses/FarmhouseAddonManager";
import FarmhouseForm from "../../components/farmhouses/FarmhouseForm";

export default function AdminFarmhouses() {
    const navigate = useNavigate();

    const [editingFarmhouse, setEditingFarmhouse] = useState(null);
    const [addonFarmhouse, setAddonFarmhouse] = useState(null);

    const [farmhouses, setFarmhouses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");

    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [saving, setSaving] = useState(false);
    const [uploadProgress, setUploadProgress] = useState("");

    const [ownerModal, setOwnerModal] = useState(null);
    const [ownerId, setOwnerId] = useState("");
    const [assigningOwner, setAssigningOwner] = useState(false);

    // Load all farmhouses
    const loadFarmhouses = async () => {
        try {
            setLoading(true);

            const data = await getAdminFarmhouses();

            setFarmhouses(
                Array.isArray(data)
                    ? data
                    : data?.content || data?.data || []
            );
        } catch (error) {
            console.error("Failed to load farmhouses:", error);

            alert(
                error.response?.data?.message ||
                "Unable to load farmhouses"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadFarmhouses();
    }, []);

    // Search and status filtering
    const filteredFarmhouses = useMemo(() => {
        return farmhouses.filter((farmhouse) => {
            const query = search.toLowerCase();

            const matchesSearch =
                farmhouse.name?.toLowerCase().includes(query) ||
                farmhouse.location?.toLowerCase().includes(query) ||
                farmhouse.city?.toLowerCase().includes(query);

            const matchesStatus =
                statusFilter === "ALL" ||
                (statusFilter === "ACTIVE" && farmhouse.active) ||
                (statusFilter === "INACTIVE" && !farmhouse.active);

            return matchesSearch && matchesStatus;
        });
    }, [farmhouses, search, statusFilter]);

    // Reset farmhouse form
    const resetForm = () => {
        setEditingId(null);
        setEditingFarmhouse(null);
        setUploadProgress("");
    };

    const openCreate = () => {
        resetForm();
        setShowModal(true);
    };

    const openEdit = (farmhouse) => {
        setEditingId(farmhouse.id);
        setEditingFarmhouse(farmhouse);
        setUploadProgress("");
        setShowModal(true);
    };

    // Upload selected farmhouse images
    const uploadImages = async (farmhouseId, images) => {
        for (let index = 0; index < images.length; index++) {
            setUploadProgress(
                `Uploading image ${index + 1} of ${images.length}...`
            );

            await uploadAdminFarmhouseImage(
                farmhouseId,
                images[index],
                index,
                index === 0
            );
        }
    };

    // Create or update farmhouse
    const handleSave = async ({ payload, amenityIds, images }) => {
        const isEditing = Boolean(editingId);
        let savedFarmhouseId = editingId;

        try {
            setSaving(true);

            const farmhousePayload = {
                ...payload,
                rating: isEditing ? undefined : 0,
                reviewCount: isEditing ? undefined : 0,
                active: isEditing ? undefined : true
            };

            let savedFarmhouse;

            if (isEditing) {
                savedFarmhouse = await updateAdminFarmhouse(
                    editingId,
                    farmhousePayload
                );
            } else {
                savedFarmhouse = await createAdminFarmhouse(
                    farmhousePayload
                );

                savedFarmhouseId = savedFarmhouse?.id;
            }

            if (!savedFarmhouseId) {
                throw new Error(
                    "Farmhouse saved, but the response did not contain its ID."
                );
            }

            // Save amenities
            await updateAdminFarmhouseAmenities(
                savedFarmhouseId,
                amenityIds
            );

            // Upload newly selected images
            if (images?.length > 0) {
                await uploadImages(savedFarmhouseId, images);
            }

            setShowModal(false);
            resetForm();

            await loadFarmhouses();

            alert(
                isEditing
                    ? "Farmhouse updated successfully."
                    : "Farmhouse created successfully."
            );

        } catch (error) {
            console.error("Failed to save farmhouse:", error);

            if (savedFarmhouseId) {
                await loadFarmhouses();

                alert(
                    `Farmhouse #${savedFarmhouseId} may have been saved, but a later step failed.\n\n` +
                    (
                        error.response?.data?.message ||
                        error.message ||
                        "Please check the amenities or image upload."
                    )
                );
            } else {
                alert(
                    error.response?.data?.message ||
                    error.message ||
                    "Unable to save farmhouse."
                );
            }
        } finally {
            setSaving(false);
            setUploadProgress("");
        }
    };

    // Activate or deactivate farmhouse
    const handleStatusChange = async (farmhouse) => {
        const action = farmhouse.active ? "deactivate" : "activate";

        if (!window.confirm(
            `Are you sure you want to ${action} this farmhouse?`
        )) {
            return;
        }

        try {
            if (farmhouse.active) {
                await deactivateAdminFarmhouse(farmhouse.id);
            } else {
                await activateAdminFarmhouse(farmhouse.id);
            }

            await loadFarmhouses();

        } catch (error) {
            alert(
                error.response?.data?.message ||
                `Unable to ${action} farmhouse`
            );
        }
    };

    // Assign farmhouse owner
    const handleAssignOwner = async (event) => {
        event.preventDefault();

        if (!ownerId || Number(ownerId) <= 0) {
            alert("Enter a valid owner ID");
            return;
        }

        try {
            setAssigningOwner(true);

            await assignFarmhouseOwner(
                ownerModal.id,
                Number(ownerId)
            );

            setOwnerModal(null);
            setOwnerId("");

            await loadFarmhouses();

            alert("Owner assigned successfully.");

        } catch (error) {
            alert(
                error.response?.data?.message ||
                "Unable to assign owner"
            );
        } finally {
            setAssigningOwner(false);
        }
    };

    return (
        <div className="admin-farmhouses-page">

            {/* Header */}
            <div className="admin-farmhouses-header">
                <div>
                    <h1>Farmhouses</h1>
                    <p>Manage properties listed on The Vedika.</p>
                </div>

                <button
                    className="af-primary-btn"
                    onClick={openCreate}
                >
                    <Plus size={18} />
                    Add Farmhouse
                </button>
            </div>

            {/* Toolbar */}
            <div className="af-toolbar">

                <div className="af-search">
                    <Search size={18} />

                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search by name or location..."
                    />
                </div>

                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                >
                    <option value="ALL">All farmhouses</option>
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                </select>

                <button
                    className="af-refresh-btn"
                    onClick={loadFarmhouses}
                >
                    <RefreshCw size={17} />
                    Refresh
                </button>
            </div>

            {/* Summary */}
            <div className="af-summary">

                <div>
                    <span>Total farmhouses</span>
                    <strong>{farmhouses.length}</strong>
                </div>

                <div>
                    <span>Active</span>
                    <strong>
                        {farmhouses.filter((f) => f.active).length}
                    </strong>
                </div>

                <div>
                    <span>Inactive</span>
                    <strong>
                        {farmhouses.filter((f) => !f.active).length}
                    </strong>
                </div>

            </div>

            {/* Farmhouse listing */}
            {loading ? (
                <div className="af-message">
                    Loading farmhouses...
                </div>
            ) : filteredFarmhouses.length === 0 ? (
                <div className="af-message">
                    No farmhouses found.
                </div>
            ) : (
                <div className="af-table-wrapper">

                    <table className="af-table">

                        <thead>
                            <tr>
                                <th>Farmhouse</th>
                                <th>Location</th>
                                <th>Price / night</th>
                                <th>Capacity</th>
                                <th>Owner</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {filteredFarmhouses.map((farmhouse) => (
                                <tr key={farmhouse.id}>

                                    <td>
                                        <div className="af-property-name">
                                            <Building2 size={19} />

                                            <div>
                                                <strong>
                                                    {farmhouse.name}
                                                </strong>

                                                <small>
                                                    ID: {farmhouse.id}
                                                </small>
                                            </div>
                                        </div>
                                    </td>

                                    <td>
                                        <span className="af-location">
                                            <MapPin size={15} />
                                            {farmhouse.location || "—"}
                                        </span>
                                    </td>

                                    <td>
                                        ₹{Number(
                                            farmhouse.basePrice || 0
                                        ).toLocaleString("en-IN")}
                                    </td>

                                    <td>
                                        <span className="af-capacity">
                                            <Users size={15} />

                                            {farmhouse.minimumGuests}–
                                            {farmhouse.maximumGuests}
                                        </span>

                                        <small className="af-bedroom-info">
                                            <BedDouble size={14} />

                                            {farmhouse.bedrooms || 0} bedrooms
                                        </small>
                                    </td>

                                    <td>
                                        {farmhouse.owner?.fullName ||
                                            farmhouse.owner?.phone ||
                                            farmhouse.ownerName ||
                                            (
                                                farmhouse.ownerId
                                                    ? `Owner #${farmhouse.ownerId}`
                                                    : "Not assigned"
                                            )}

                                        <button
                                            className="af-link-btn"
                                            onClick={() => {
                                                setOwnerModal(farmhouse);

                                                setOwnerId(
                                                    farmhouse.owner?.id ||
                                                    farmhouse.ownerId ||
                                                    ""
                                                );
                                            }}
                                        >
                                            Assign / Change
                                        </button>
                                    </td>

                                    <td>
                                        <span
                                            className={`af-status ${
                                                farmhouse.active
                                                    ? "active"
                                                    : "inactive"
                                            }`}
                                        >
                                            {farmhouse.active
                                                ? "Active"
                                                : "Inactive"}
                                        </span>
                                    </td>

                                    <td>
                                        <div className="af-actions">

                                            <button
                                                type="button"
                                                title="Manage Calendar"
                                                onClick={() =>
                                                    navigate(
                                                        `/admin/farmhouses/${farmhouse.id}/calendar`
                                                    )
                                                }
                                            >
                                                <CalendarDays size={17} />
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setAddonFarmhouse(farmhouse)
                                                }
                                                title="Manage additional services"
                                            >
                                                <PackagePlus size={17} />
                                                Add-ons
                                            </button>

                                            <button
                                                type="button"
                                                title="Edit"
                                                onClick={() =>
                                                    openEdit(farmhouse)
                                                }
                                            >
                                                <Pencil size={17} />
                                            </button>

                                            <button
                                                type="button"
                                                title={
                                                    farmhouse.active
                                                        ? "Deactivate"
                                                        : "Activate"
                                                }
                                                onClick={() =>
                                                    handleStatusChange(farmhouse)
                                                }
                                            >
                                                <Power size={17} />
                                            </button>

                                        </div>
                                    </td>

                                </tr>
                            ))}
                        </tbody>

                    </table>
                </div>
            )}

            {/* Create / Edit Farmhouse */}
            {showModal && (
                <FarmhouseForm
                    initialData={editingFarmhouse}
                    farmhouseId={editingId}
                    loadAssignedAmenities={getAdminFarmhouseAmenities}
                    onSubmit={handleSave}
                    onCancel={() => {
                        if (!saving) {
                            setShowModal(false);
                            resetForm();
                        }
                    }}
                    submitting={saving}
                    uploadProgress={uploadProgress}
                />
            )}

            {/* Assign Owner Modal */}
            {ownerModal && (
                <div className="af-overlay">

                    <form
                        className="af-owner-modal"
                        onSubmit={handleAssignOwner}
                    >

                        <div className="af-modal-header">
                            <div>
                                <h2>Assign Owner</h2>
                                <p>{ownerModal.name}</p>
                            </div>

                            <button
                                type="button"
                                onClick={() => setOwnerModal(null)}
                            >
                                <X size={21} />
                            </button>
                        </div>

                        <label>
                            Approved owner ID

                            <input
                                type="number"
                                min="1"
                                value={ownerId}
                                onChange={(e) =>
                                    setOwnerId(e.target.value)
                                }
                                placeholder="Enter owner user ID"
                                required
                            />
                        </label>

                        <p className="af-hint">
                            Use the ID of an approved owner from the
                            Admin Owners page.
                        </p>

                        <div className="af-modal-footer">

                            <button
                                type="button"
                                className="af-cancel-btn"
                                onClick={() => setOwnerModal(null)}
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                className="af-primary-btn"
                                disabled={assigningOwner}
                            >
                                {assigningOwner
                                    ? "Assigning..."
                                    : "Assign Owner"}
                            </button>

                        </div>

                    </form>
                </div>
            )}

            {/* Admin Add-ons Manager */}
            {addonFarmhouse && (
                <FarmhouseAddonManager
                    farmhouse={addonFarmhouse}
                    getAddons={getAdminFarmhouseAddons}
                    createAddon={createAdminFarmhouseAddon}
                    updateAddon={updateAdminFarmhouseAddon}
                    deleteAddon={deleteAdminFarmhouseAddon}
                    onClose={() => setAddonFarmhouse(null)}
                />
            )}

        </div>
    );
}
