
import { useEffect, useState } from "react";
import {
    X, ImagePlus, Trash2, Upload, Check
} from "lucide-react";
import { getAmenities } from "../../api/amenityApi";
import "./FarmhouseForm.css";

const emptyForm = {
    name: "",
    location: "",
    description: "",
    propertyExperience: "PRIVATE_STAY",

    addressLine: "",
    city: "",
    state: "",
    pincode: "",
    latitude: "",
    longitude: "",

    basePrice: "",
    weekendPrice: "",
    extraGuestPrice: "",
    minimumGuests: 5,
    maximumGuests: 20,
    bedrooms: 1,
    bathrooms: 1,

    checkInTime: "14:00",
    checkOutTime: "11:00",

    houseRules: "",
    eventsPolicy: "",
    cookingFoodPolicy: ""
};

const numberFields = [
    "basePrice",
    "weekendPrice",
    "extraGuestPrice",
    "minimumGuests",
    "maximumGuests",
    "bedrooms",
    "bathrooms"
];

const getInitialForm = (data = {}) => {
    const safeData = data && typeof data === "object" ? data : {};

    return {
        ...emptyForm,
        ...Object.fromEntries(
            Object.keys(emptyForm).map((key) => [
                key,
                safeData[key] ?? emptyForm[key]
            ])
        ),
        latitude: safeData.latitude ?? "",
        longitude: safeData.longitude ?? ""
    };
};
export default function FarmhouseForm({
    initialData = null,
    farmhouseId = null,
    loadAssignedAmenities,
    onSubmit,
    onCancel,
    submitting = false,
    uploadProgress = ""
}) {
const [form, setForm] = useState(() => getInitialForm(initialData || {}));
    const [amenities, setAmenities] = useState([]);
    const [selectedAmenityIds, setSelectedAmenityIds] = useState([]);
    const [loadingAmenities, setLoadingAmenities] = useState(true);
    const [selectedImages, setSelectedImages] = useState([]);
    const [imagePreviews, setImagePreviews] = useState([]);
    const [amenityError, setAmenityError] = useState("");

useEffect(() => {
    setForm(getInitialForm(initialData || {}));
}, [initialData]);

    useEffect(() => {
        let cancelled = false;

        const loadAmenityData = async () => {
            try {
                setLoadingAmenities(true);
                setAmenityError("");

                const allAmenities = await getAmenities();

                if (cancelled) return;

                setAmenities(Array.isArray(allAmenities) ? allAmenities : []);

                if (farmhouseId && loadAssignedAmenities) {
                    const assigned = await loadAssignedAmenities(farmhouseId);

                    if (cancelled) return;

                    const ids = (Array.isArray(assigned) ? assigned : [])
                        .map((item) => Number(item.id ?? item.amenity?.id))
                        .filter((id) => Number.isInteger(id) && id > 0);

                    setSelectedAmenityIds(ids);
                } else {
                    setSelectedAmenityIds([]);
                }
            } catch (error) {
                console.error("Failed to load amenities:", error);
                if (!cancelled) {
                    setAmenityError(
                        error.response?.data?.message ||
                        "Unable to load amenities. Please try again."
                    );
                }
            } finally {
                if (!cancelled) setLoadingAmenities(false);
            }
        };

        loadAmenityData();

        return () => {
            cancelled = true;
        };
    }, [farmhouseId, loadAssignedAmenities]);

    useEffect(() => {
        const previews = selectedImages.map((file) => ({
            name: file.name,
            url: URL.createObjectURL(file)
        }));

        setImagePreviews(previews);

        return () => {
            previews.forEach((preview) => URL.revokeObjectURL(preview.url));
        };
    }, [selectedImages]);

    const handleChange = (event) => {
        const { name, value } = event.target;

        setForm((previous) => ({
            ...previous,
            [name]: value
        }));
    };

    const toggleAmenity = (amenityId) => {
        setSelectedAmenityIds((previous) =>
            previous.includes(amenityId)
                ? previous.filter((id) => id !== amenityId)
                : [...previous, amenityId]
        );
    };

    const handleImageSelect = (event) => {
        const files = Array.from(event.target.files || []);
        const validTypes = ["image/jpeg", "image/png", "image/webp"];

        const validFiles = files.filter((file) => {
            if (!validTypes.includes(file.type)) {
                alert(`${file.name}: Only JPG, PNG and WebP images are allowed.`);
                return false;
            }

            if (file.size > 10 * 1024 * 1024) {
                alert(`${file.name}: Image size cannot exceed 10 MB.`);
                return false;
            }

            return true;
        });

        setSelectedImages((previous) => [...previous, ...validFiles]);
        event.target.value = "";
    };

    const removeSelectedImage = (index) => {
        setSelectedImages((previous) =>
            previous.filter((_, imageIndex) => imageIndex !== index)
        );
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (
            Number(form.minimumGuests) < 1 ||
            Number(form.maximumGuests) < Number(form.minimumGuests)
        ) {
            alert("Maximum guests must be greater than or equal to minimum guests.");
            return;
        }

        if (
            Number(form.basePrice) < 0 ||
            Number(form.weekendPrice) < 0 ||
            Number(form.extraGuestPrice) < 0
        ) {
            alert("Prices cannot be negative.");
            return;
        }

        if (
            form.latitude !== "" &&
            (Number(form.latitude) < -90 || Number(form.latitude) > 90)
        ) {
            alert("Latitude must be between -90 and 90.");
            return;
        }

        if (
            form.longitude !== "" &&
            (Number(form.longitude) < -180 || Number(form.longitude) > 180)
        ) {
            alert("Longitude must be between -180 and 180.");
            return;
        }

        const payload = {
            ...form,
            ...Object.fromEntries(
                numberFields.map((field) => [
                    field,
                    Number(form[field])
                ])
            ),
            latitude: form.latitude === "" ? null : Number(form.latitude),
            longitude: form.longitude === "" ? null : Number(form.longitude)
        };

        await onSubmit({
            payload,
            amenityIds: selectedAmenityIds,
            images: selectedImages
        });
    };

    return (
        <div className="ff-overlay">
            <form className="ff-modal" onSubmit={handleSubmit}>
                <div className="ff-header">
                    <div>
                        <h2>{farmhouseId ? "Edit Farmhouse" : "Add Farmhouse"}</h2>
                        <p>Enter property details, amenities and photos.</p>
                    </div>

                    <button
                        type="button"
                        className="ff-close"
                        onClick={onCancel}
                        disabled={submitting}
                    >
                        <X size={21} />
                    </button>
                </div>

                <div className="ff-content">
                    <section className="ff-section">
                        <h3>Basic information</h3>

                        <div className="ff-grid">
                            <label>
                                Farmhouse name *
                                <input
                                    name="name"
                                    value={form.name}
                                    onChange={handleChange}
                                    required
                                />
                            </label>

                            <label>
                                Location *
                                <input
                                    name="location"
                                    value={form.location}
                                    onChange={handleChange}
                                    placeholder="Example: Moinabad, Hyderabad"
                                    required
                                />
                            </label>

                            <label>
                                Property experience
                                <select
                                    name="propertyExperience"
                                    value={form.propertyExperience}
                                    onChange={handleChange}
                                >
                                    <option value="PRIVATE_STAY">Private Stay</option>
                                    <option value="FAMILY_STAY">Family Stay</option>
                                    <option value="LUXURY_STAY">Luxury Stay</option>
                                    <option value="NATURE_STAY">Nature Stay</option>
                                    <option value="EVENT_VENUE">Event Venue</option>
                                </select>
                            </label>

                            <label className="ff-full">
                                Description
                                <textarea
                                    name="description"
                                    value={form.description}
                                    onChange={handleChange}
                                    rows="4"
                                />
                            </label>
                        </div>
                    </section>

                    <section className="ff-section">
                        <h3>Address and map location</h3>

                        <div className="ff-grid">
                            <label className="ff-full">
                                Address line
                                <input
                                    name="addressLine"
                                    value={form.addressLine}
                                    onChange={handleChange}
                                />
                            </label>

                            <label>
                                City
                                <input name="city" value={form.city} onChange={handleChange} />
                            </label>

                            <label>
                                State
                                <input name="state" value={form.state} onChange={handleChange} />
                            </label>

                            <label>
                                Pincode
                                <input
                                    name="pincode"
                                    value={form.pincode}
                                    onChange={handleChange}
                                    maxLength="10"
                                />
                            </label>

                            <label>
                                Latitude
                                <input
                                    type="number"
                                    step="any"
                                    name="latitude"
                                    value={form.latitude}
                                    onChange={handleChange}
                                />
                            </label>

                            <label>
                                Longitude
                                <input
                                    type="number"
                                    step="any"
                                    name="longitude"
                                    value={form.longitude}
                                    onChange={handleChange}
                                />
                            </label>
                        </div>
                    </section>

                    <section className="ff-section">
                        <h3>Pricing and guest capacity</h3>

                        <div className="ff-grid">
                            <label>
                                Base price per night (₹) *
                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    name="basePrice"
                                    value={form.basePrice}
                                    onChange={handleChange}
                                    required
                                />
                            </label>

                            <label>
                                Weekend price (₹) *
                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    name="weekendPrice"
                                    value={form.weekendPrice}
                                    onChange={handleChange}
                                    required
                                />
                            </label>

                            <label>
                                Extra guest price (₹) *
                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    name="extraGuestPrice"
                                    value={form.extraGuestPrice}
                                    onChange={handleChange}
                                    required
                                />
                            </label>

                            <label>
                                Minimum guests *
                                <input
                                    type="number"
                                    min="1"
                                    name="minimumGuests"
                                    value={form.minimumGuests}
                                    onChange={handleChange}
                                    required
                                />
                            </label>

                            <label>
                                Maximum guests *
                                <input
                                    type="number"
                                    min="1"
                                    name="maximumGuests"
                                    value={form.maximumGuests}
                                    onChange={handleChange}
                                    required
                                />
                            </label>

                            <label>
                                Bedrooms *
                                <input
                                    type="number"
                                    min="0"
                                    name="bedrooms"
                                    value={form.bedrooms}
                                    onChange={handleChange}
                                    required
                                />
                            </label>

                            <label>
                                Bathrooms *
                                <input
                                    type="number"
                                    min="0"
                                    name="bathrooms"
                                    value={form.bathrooms}
                                    onChange={handleChange}
                                    required
                                />
                            </label>
                        </div>
                    </section>

                    <section className="ff-section">
                        <h3>Check-in and check-out</h3>

                        <div className="ff-grid">
                            <label>
                                Check-in time *
                                <input
                                    type="time"
                                    name="checkInTime"
                                    value={form.checkInTime}
                                    onChange={handleChange}
                                    required
                                />
                            </label>

                            <label>
                                Check-out time *
                                <input
                                    type="time"
                                    name="checkOutTime"
                                    value={form.checkOutTime}
                                    onChange={handleChange}
                                    required
                                />
                            </label>
                        </div>
                    </section>

                    <section className="ff-section">
                        <h3>Property amenities</h3>
                        <p className="ff-hint">
                            Select all facilities available at this farmhouse.
                        </p>

                        {loadingAmenities ? (
                            <p className="ff-muted">Loading amenities...</p>
                        ) : amenityError ? (
                            <p className="ff-error">{amenityError}</p>
                        ) : amenities.length === 0 ? (
                            <p className="ff-muted">
                                No amenities found. Add amenities to the catalogue first.
                            </p>
                        ) : (
                            <div className="ff-amenities">
                                {amenities.map((amenity) => {
                                    const checked = selectedAmenityIds.includes(
                                        Number(amenity.id)
                                    );

                                    return (
                                        <label
                                            className={`ff-amenity ${checked ? "selected" : ""}`}
                                            key={amenity.id}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={checked}
                                                onChange={() =>
                                                    toggleAmenity(Number(amenity.id))
                                                }
                                            />
                                            <span className="ff-check">
                                                {checked && <Check size={14} />}
                                            </span>
                                            <span>{amenity.name}</span>
                                        </label>
                                    );
                                })}
                            </div>
                        )}
                    </section>

                    <section className="ff-section">
                        <h3>Property policies</h3>

                        <div className="ff-grid">
                            <label className="ff-full">
                                House rules
                                <textarea
                                    name="houseRules"
                                    value={form.houseRules}
                                    onChange={handleChange}
                                    rows="3"
                                    placeholder="Enter house rules..."
                                />
                            </label>

                            <label className="ff-full">
                                Events policy
                                <textarea
                                    name="eventsPolicy"
                                    value={form.eventsPolicy}
                                    onChange={handleChange}
                                    rows="3"
                                    placeholder="Mention whether parties and events are allowed..."
                                />
                            </label>

                            <label className="ff-full">
                                Cooking and food policy
                                <textarea
                                    name="cookingFoodPolicy"
                                    value={form.cookingFoodPolicy}
                                    onChange={handleChange}
                                    rows="3"
                                    placeholder="Mention cooking facilities and food availability..."
                                />
                            </label>
                        </div>
                    </section>

                    <section className="ff-section">
                        <h3>Farmhouse photos</h3>
                        <p className="ff-hint">
                            JPG, PNG or WebP. Maximum 10 MB per image.
                            The first newly selected image will be the cover image.
                        </p>

                        <label className="ff-image-picker">
                            <ImagePlus size={25} />
                            <span>Select farmhouse images</span>
                            <small>You can select multiple images</small>
                            <input
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                multiple
                                onChange={handleImageSelect}
                                disabled={submitting}
                            />
                        </label>

                        {imagePreviews.length > 0 && (
                            <div className="ff-image-grid">
                                {imagePreviews.map((image, index) => (
                                    <div className="ff-image" key={`${image.name}-${index}`}>
                                        <img src={image.url} alt={image.name} />

                                        {index === 0 && (
                                            <span className="ff-cover">Cover image</span>
                                        )}

                                        <button
                                            type="button"
                                            onClick={() => removeSelectedImage(index)}
                                            disabled={submitting}
                                            title="Remove image"
                                        >
                                            <Trash2 size={16} />
                                        </button>

                                        <small>{image.name}</small>
                                    </div>
                                ))}
                            </div>
                        )}

                        {uploadProgress && (
                            <p className="ff-upload-progress">
                                <Upload size={16} /> {uploadProgress}
                            </p>
                        )}
                    </section>
                </div>

                <div className="ff-footer">
                    <button
                        type="button"
                        className="ff-cancel"
                        onClick={onCancel}
                        disabled={submitting}
                    >
                        Cancel
                    </button>

                    <button
                        type="submit"
                        className="ff-submit"
                        disabled={submitting || loadingAmenities}
                    >
                        {submitting
                            ? "Saving..."
                            : farmhouseId
                                ? "Update Farmhouse"
                                : "Create Farmhouse"}
                    </button>
                </div>
            </form>
        </div>
    );
}
