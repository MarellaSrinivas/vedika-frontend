
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    ArrowLeft,
    PackagePlus,
    LoaderCircle
} from "lucide-react";

// Farmhouse listing API
import { getMyFarmhouses } from "../../api/ownerDashboardApi";

// Owner add-on APIs
import {
    getOwnerFarmhouseAddons,
    createOwnerFarmhouseAddon,
    updateOwnerFarmhouseAddon,
    deleteOwnerFarmhouseAddon
} from "../../api/ownerFarmhouseApi";

import FarmhouseAddonManager from "../../components/farmhouses/FarmhouseAddonManager";

import "./OwnerFarmhouseAddons.css";

export default function OwnerFarmhouseAddons() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [farmhouse, setFarmhouse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadFarmhouse = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await getMyFarmhouses();

                const farmhouses = Array.isArray(response)
                    ? response
                    : response?.data || [];

                const selectedFarmhouse = farmhouses.find(
                    (item) => String(item.id) === String(id)
                );

                if (!selectedFarmhouse) {
                    setError(
                        "Farmhouse not found or you do not have access."
                    );
                    return;
                }

                setFarmhouse(selectedFarmhouse);

            } catch (err) {
                console.error("Failed to load farmhouse:", err);

                setError(
                    err.response?.data?.message ||
                    "Unable to load farmhouse."
                );
            } finally {
                setLoading(false);
            }
        };

        loadFarmhouse();
    }, [id]);

    if (loading) {
        return (
            <div className="owner-addons-page">
                <div className="oa-message">
                    <LoaderCircle className="oa-spin" size={25} />
                    <span>Loading farmhouse...</span>
                </div>
            </div>
        );
    }

    if (error || !farmhouse) {
        return (
            <div className="owner-addons-page">
                <div className="oa-error">
                    {error || "Farmhouse not found."}
                </div>

                <button
                    type="button"
                    className="oa-back-btn"
                    onClick={() => navigate("/owner/farmhouses")}
                >
                    <ArrowLeft size={17} />
                    Back to My Farmhouses
                </button>
            </div>
        );
    }

    return (
        <div className="owner-addons-page">

            <div className="oa-header">
                <div>
                    <button
                        type="button"
                        className="oa-back-btn"
                        onClick={() => navigate("/owner/farmhouses")}
                    >
                        <ArrowLeft size={17} />
                        Back to My Farmhouses
                    </button>

                    <span className="oa-eyebrow">
                        OWNER PANEL
                    </span>

                    <h1>
                        <PackagePlus size={26} />
                        Farmhouse Add-ons
                    </h1>

                    <p>
                        Manage optional services for{" "}
                        <strong>{farmhouse.name}</strong>
                    </p>

                    <span className="oa-location">
                        {farmhouse.location || farmhouse.city}
                    </span>
                </div>
            </div>

            <FarmhouseAddonManager
                farmhouse={farmhouse}
                getAddons={getOwnerFarmhouseAddons}
                createAddon={createOwnerFarmhouseAddon}
                updateAddon={updateOwnerFarmhouseAddon}
                deleteAddon={deleteOwnerFarmhouseAddon}
                onClose={() => navigate("/owner/farmhouses")}
            />

        </div>
    );
}
