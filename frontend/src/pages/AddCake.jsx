import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./styles.css";
import { resolveImageUrl } from "../utils/imageUrls";

const EMPTY_GALLERY = Array.from({ length: 4 }, () => null);
const REQUIRED_FIELDS = ["name", "price", "flavor", "shape", "size"];

function buildPreview(file) {
  return {
    file,
    name: file.name,
    url: URL.createObjectURL(file),
    uploadedUrl: null,
  };
}

function getBakerId() {
  try {
    const stored = localStorage.getItem("bakerUser");
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed?.id || parsed?._id || "";
    }
  } catch {
    /* ignore */
  }
  return localStorage.getItem("id") || "";
}

export default function AddCake() {
  const navigate = useNavigate();
  const mainInputRef = useRef(null);
  const galleryInputRefs = useRef([]);
  const mainImageRef = useRef(null);
  const galleryImagesRef = useRef(EMPTY_GALLERY);

  const [mainImage, setMainImage] = useState(null);
  const [galleryImages, setGalleryImages] = useState(EMPTY_GALLERY);
  const [isDraggingMain, setIsDraggingMain] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingCount, setUploadingCount] = useState(0);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    servings: "",
    prepTime: "",
    size: "",
    shape: "",
    flavor: "",
    filling: "",
    tiers: "",
    frosting: "",
    notes: "",
    allowCustomMessage: false,
    allowColorCustomization: false,
    availableForRushOrders: false,
    dietaryOptionsAvailable: false,
  });

  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const userId = getBakerId();

  useEffect(() => {
    mainImageRef.current = mainImage;
  }, [mainImage]);

  useEffect(() => {
    galleryImagesRef.current = galleryImages;
  }, [galleryImages]);

  useEffect(() => {
    return () => {
      if (mainImageRef.current?.url) {
        URL.revokeObjectURL(mainImageRef.current.url);
      }

      galleryImagesRef.current.forEach((image) => {
        if (image?.url) {
          URL.revokeObjectURL(image.url);
        }
      });
    };
  }, []);

  const uploadFile = async (file) => {
    const form = new FormData();
    form.append("files", file);

    const response = await fetch(`${API_BASE_URL}/api/upload?context=cake`, {
      method: "POST",
      body: form,
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.error || "Image upload failed");
    }
    return data.urls?.[0];
  };

  const updateMainImage = (file) => {
    if (!file) return;

    setMainImage((prev) => {
      if (prev?.url) {
        URL.revokeObjectURL(prev.url);
      }
      return buildPreview(file);
    });

    setUploadingCount((count) => count + 1);
    uploadFile(file)
      .then((uploadedUrl) => {
        setMainImage((prev) => (prev ? { ...prev, uploadedUrl } : prev));
        setUploadError("");
      })
      .catch((err) => setUploadError(err.message || "Upload failed"))
      .finally(() => setUploadingCount((count) => Math.max(0, count - 1)));
  };

  const updateGalleryImage = (index, file) => {
    if (!file) return;

    setGalleryImages((prev) => {
      const next = [...prev];
      if (next[index]?.url) {
        URL.revokeObjectURL(next[index].url);
      }
      next[index] = buildPreview(file);
      return next;
    });

    setUploadingCount((count) => count + 1);
    uploadFile(file)
      .then((uploadedUrl) => {
        setGalleryImages((prev) => {
          const next = [...prev];
          if (next[index]) next[index] = { ...next[index], uploadedUrl };
          return next;
        });
        setUploadError("");
      })
      .catch((err) => setUploadError(err.message || "Upload failed"))
      .finally(() => setUploadingCount((count) => Math.max(0, count - 1)));
  };

  const clearMainImage = () => {
    setMainImage((prev) => {
      if (prev?.url) {
        URL.revokeObjectURL(prev.url);
      }
      return null;
    });
    if (mainInputRef.current) {
      mainInputRef.current.value = "";
    }
  };

  const clearGalleryImage = (index) => {
    setGalleryImages((prev) => {
      const next = [...prev];
      if (next[index]?.url) {
        URL.revokeObjectURL(next[index].url);
      }
      next[index] = null;
      return next;
    });

    if (galleryInputRefs.current[index]) {
      galleryInputRefs.current[index].value = "";
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!userId) {
      setFormError("Please sign in as a baker before adding a cake.");
      return;
    }

    const missing = REQUIRED_FIELDS.filter(
      (field) => !String(formData[field] || "").trim()
    );
    if (missing.length) {
      setFormError(`Please fill required fields: ${missing.join(", ")}`);
      return;
    }

    const numericPrice = Number(formData.price);
    if (Number.isNaN(numericPrice) || numericPrice <= 0) {
      setFormError("Price must be a number greater than 0.");
      return;
    }

    if (uploadingCount > 0) {
      setFormError("Please wait for image uploads to finish before publishing.");
      return;
    }

    if (mainImage && !mainImage.uploadedUrl) {
      setFormError("Your main image is still missing a Cloudinary URL. Please re-upload it or remove it.");
      return;
    }

    const hasPendingGalleryUpload = galleryImages.some(
      (image) => image && !image.uploadedUrl
    );
    if (hasPendingGalleryUpload) {
      setFormError("One or more gallery images did not finish uploading. Please retry or remove them.");
      return;
    }

    const payload = {
      ...formData,
      price: numericPrice,
      userId,
      mainImage: mainImage?.uploadedUrl || "",
      galleryImages: galleryImages
        .filter(Boolean)
        .map((g) => g.uploadedUrl)
        .filter(Boolean),
      toppings: [],
    };

    try {
      setIsSubmitting(true);
      const response = await fetch(`${API_BASE_URL}/api/cakes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to save cake");
      }

      alert("Success! Your cake is now live.");
      navigate("/cakes");
    } catch (err) {
      setFormError(err.message || "Server is not responding. Check your connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const specFields = [
    { label: "Size", key: "size" },
    { label: "Shape", key: "shape" },
    { label: "Flavour", key: "flavor" },
    { label: "Filling", key: "filling" },
    { label: "Number of Tiers", key: "tiers" },
    { label: "Frosting Type", key: "frosting" },
  ];

  return (
    <div className="page">
      <header className="page-header">
        <div className="page-header-left">
          <button className="icon-back" onClick={() => navigate(-1)}>
            ⟵
          </button>
          <div>
            <h1 className="page-title">Add New Cake</h1>
            <p className="page-subtitle">Create a new cake listing for customers</p>
          </div>
        </div>
        <div className="page-header-actions">
          <button className="ghost-btn" onClick={() => navigate(-1)}>
            Cancel
          </button>
          <button className="primary-btn" type="submit" form="add-cake-form" disabled={isSubmitting || uploadingCount > 0}>
            {isSubmitting ? "Saving..." : uploadingCount > 0 ? "Uploading images..." : "Save & Publish"}
          </button>
        </div>
      </header>

      {formError && <p className="auth-error-text" style={{ marginTop: 4 }}>{formError}</p>}

      <form id="add-cake-form" onSubmit={handleSubmit} className="long-form">
        <section className="card">
          <h3 className="card-title">Cake Images</h3>
          <p className="card-subtitle">
            Upload high-quality photos of your cake (up to 5 images)
          </p>
          {uploadError && <p className="auth-error-text">{uploadError}</p>}
          {uploadingCount > 0 && (
            <p className="helper-text">Uploading {uploadingCount} image{uploadingCount === 1 ? "" : "s"}...</p>
          )}
          <div className="image-upload-main">
            <input
              ref={mainInputRef}
              type="file"
              accept="image/*"
              className="hidden-file-input"
              onChange={(e) => updateMainImage(e.target.files?.[0])}
            />

            <button
              type="button"
              className={`image-drop upload-drop-button ${isDraggingMain ? "dragging" : ""}`}
              onClick={() => mainInputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDraggingMain(true);
              }}
              onDragLeave={() => setIsDraggingMain(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDraggingMain(false);
                updateMainImage(e.dataTransfer.files?.[0]);
              }}
            >
              {mainImage ? (
                <div className="upload-preview-card">
                  <img
                    src={resolveImageUrl(API_BASE_URL, mainImage.uploadedUrl || mainImage.url)}
                    alt={mainImage.name}
                    className="upload-preview-image large"
                  />
                  <div className="upload-preview-meta">
                    <strong>Main image selected</strong>
                    <span>{mainImage.name}</span>
                  </div>
                  <div className="upload-preview-actions">
                    <span className="upload-preview-hint">Click to replace</span>
                    <button
                      type="button"
                      className="upload-remove-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        clearMainImage();
                      }}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <span className="upload-icon">⬆</span>
                  <p>Main Image Slot</p>
                  <p className="helper-text">or click to browse from your computer</p>
                  <p className="helper-text small">
                    Recommended: 1200x800px, JPG or PNG, max 5MB
                  </p>
                </>
              )}
            </button>
          </div>

          <div className="image-upload-row">
            {galleryImages.map((image, index) => (
              <div key={index} className="image-slot-wrapper">
                <input
                  ref={(node) => {
                    galleryInputRefs.current[index] = node;
                  }}
                  type="file"
                  accept="image/*"
                  className="hidden-file-input"
                  onChange={(e) => updateGalleryImage(index, e.target.files?.[0])}
                />

                <button
                  type="button"
                  className={`image-slot upload-drop-button ${image ? "filled" : ""}`}
                  onClick={() => galleryInputRefs.current[index]?.click()}
                >
                  {image ? (
                    <>
                      <img
                        src={resolveImageUrl(API_BASE_URL, image.uploadedUrl || image.url)}
                        alt={image.name}
                        className="upload-preview-image thumb"
                      />
                      <span className="image-slot-label">{image.name}</span>
                    </>
                  ) : (
                    <span className="image-slot-label">Add Photo {index + 1}</span>
                  )}
                </button>

                {image && (
                  <button
                    type="button"
                    className="upload-remove-btn corner"
                    onClick={() => clearGalleryImage(index)}
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>

        <section className="card">
          <h3 className="card-title">Basic Information</h3>
          <div className="grid-2 gap-lg">
            <label className="field full">
              <span className="field-label">
                Cake Name <span className="required">*</span>
              </span>
              <input
                name="name"
                className="input"
                placeholder="e.g., Red Velvet Dream Cake"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </label>
          </div>
          <label className="field">
            <span className="field-label">
              Description <span className="required">*</span>
            </span>
            <textarea
              name="description"
              className="textarea"
              placeholder="Describe your cake, ingredients, and what makes it special..."
              value={formData.description}
              onChange={handleInputChange}
              required
            />
          </label>

          <div className="grid-3 gap-lg">
            <label className="field">
              <span className="field-label">
                Base Price ($) <span className="required">*</span>
              </span>
              <div className="input-with-prefix">
                <span>$</span>
                <input
                  name="price"
                  type="number"
                  className="input no-padding"
                  placeholder="0.00"
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </label>
            <label className="field">
              <span className="field-label">Servings</span>
              <input
                name="servings"
                className="input"
                placeholder="e.g., 10-12 people"
                value={formData.servings}
                onChange={handleInputChange}
              />
            </label>
            <label className="field">
              <span className="field-label">Preparation Time</span>
              <input
                name="prepTime"
                className="input"
                placeholder="e.g., 24-48 hours"
                value={formData.prepTime}
                onChange={handleInputChange}
              />
            </label>
          </div>
        </section>

        <section className="card">
          <h3 className="card-title">Cake Specifications</h3>
          <div className="grid-3 gap-lg">
            {specFields.map((item) => (
              <label key={item.key} className="field">
                <span className="field-label">{item.label}</span>
                <input
                  name={item.key}
                  className="input"
                  value={formData[item.key]}
                  onChange={handleInputChange}
                  required={REQUIRED_FIELDS.includes(item.key)}
                />
              </label>
            ))}
          </div>
        </section>

        <section className="card">
          <h3 className="card-title">Customization Options</h3>
          <p className="card-subtitle">
            Allow customers to personalize this cake
          </p>
          <div className="checkbox-column">
            <label className="checkbox">
              <input
                type="checkbox"
                name="allowCustomMessage"
                checked={formData.allowCustomMessage}
                onChange={handleInputChange}
              />
              <span>
                Allow custom messages
                <span className="checkbox-sub">
                  Customers can add personalized text
                </span>
              </span>
            </label>
            <label className="checkbox">
              <input
                type="checkbox"
                name="allowColorCustomization"
                checked={formData.allowColorCustomization}
                onChange={handleInputChange}
              />
              <span>
                Allow color customization
                <span className="checkbox-sub">
                  Customers can choose cake colors
                </span>
              </span>
            </label>
            <label className="checkbox">
              <input
                type="checkbox"
                name="availableForRushOrders"
                checked={formData.availableForRushOrders}
                onChange={handleInputChange}
              />
              <span>
                Available for rush orders
                <span className="checkbox-sub">
                  Can be prepared in under 24 hours (additional fees may apply)
                </span>
              </span>
            </label>
            <label className="checkbox">
              <input
                type="checkbox"
                name="dietaryOptionsAvailable"
                checked={formData.dietaryOptionsAvailable}
                onChange={handleInputChange}
              />
              <span>
                Dietary options available
                <span className="checkbox-sub">
                  Offer gluten-free, vegan, or sugar-free alternatives
                </span>
              </span>
            </label>
          </div>
        </section>

        <section className="card">
          <h3 className="card-title">Additional Notes</h3>
          <p className="card-subtitle">
            Add any extra details customers should know
          </p>

          <label className="field">
            <span className="field-label">Message / Notes</span>
            <textarea
              name="notes"
              className="textarea"
              placeholder="e.g., Available for custom messages, vegan options, rush orders..."
              value={formData.notes}
              onChange={handleInputChange}
            />
          </label>
        </section>
      </form>
    </div>
  );
}
