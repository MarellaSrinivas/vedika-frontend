
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    ArrowLeft,
    PackagePlus,
    LoaderCircle
} from "lucide-react";

import {
    getAdminFarmhouseById,
    getAdminFarmhouseAddons,
    createAdminFarmhouseAddon,
    updateAdminFarmhouseAddon,
    deleteAdminFarmhouseAddon
} from "../../api/adminFarmhouseApi";

import FarmhouseAddonManager from "../../components/farmhouses/FarmhouseAddonManager";

import "./AdminFarmhouseAddons.css";

export default function AdminFarmhouseAddons() {
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

                const data = await getAdminFarmhouseById(id);
                setFarmhouse(data);
                console.log("ADMIN ADDON API CHECK:", {
    getAddons: typeof getAdminFarmhouseAddons,
    createAddon: typeof createAdminFarmhouseAddon,
    updateAddon: typeof updateAdminFarmhouseAddon,
    deleteAddon: typeof deleteAdminFarmhouseAddon
});
            } catch (err) {
                setError(
                    err.response?.data?.message ||
                    "Unable to load farmhouse."
                );
            } finally {
                setLoading(false);
            }

        };

        loadFarmhouse();
        console.log("ADMIN ADDONS PAGE - VERSION 2", {
    farmhouseId: farmhouse.id,
    getAddons: typeof getAdminFarmhouseAddons,
    createAddon: typeof createAdminFarmhouseAddon,
    updateAddon: typeof updateAdminFarmhouseAddon,
    deleteAddon: typeof deleteAdminFarmhouseAddon
});
    }, [id]);

    if (loading) {
        return (
            <div className="admin-addons-page">
                <div className="aa-message">
                    <LoaderCircle className="spin" size={25} />
                    Loading farmhouse...
                </div>
            </div>
        );
    }

    if (error || !farmhouse) {
        return (
            <div className="admin-addons-page">
                <div className="aa-error">
                    {error || "Farmhouse not found."}
                </div>

                <button
                    className="aa-back-btn"
                    onClick={() => navigate("/admin/farmhouses")}
                >
                    <ArrowLeft size={17} />
                    Back to Farmhouses
                </button>
            </div>
        );
    }

    return (
        <div className="admin-addons-page">
            <div className="aa-header">
                <div>
                    <button
                        className="aa-back-btn"
                        onClick={() => navigate("/admin/farmhouses")}
                    >
                        <ArrowLeft size={17} />
                        Back to Farmhouses
                    </button>

                    <h1>
                        <PackagePlus size={25} />
                        Farmhouse Add-ons
                    </h1>

                    <p>
                        {farmhouse.name} · {farmhouse.location}
                    </p>
                </div>
            </div>

           <FarmhouseAddonManager
    farmhouse={farmhouse}
    getAddons={(farmhouseId) =>
        getAdminFarmhouseAddons(farmhouseId)
    }
    createAddon={(farmhouseId, data) =>
        createAdminFarmhouseAddon(farmhouseId, data)
    }
    updateAddon={(farmhouseId, addonId, data) =>
        updateAdminFarmhouseAddon(farmhouseId, addonId, data)
    }
    deleteAddon={(farmhouseId, addonId) =>
        deleteAdminFarmhouseAddon(farmhouseId, addonId)
    }
    onClose={() => navigate("/admin/farmhouses")}
/>
        </div>
    );
}
