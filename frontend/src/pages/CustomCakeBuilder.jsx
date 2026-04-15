import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./styles.css";
import { resolveImageUrl } from "../utils/imageUrls";
import { BAKER_CUSTOMIZATION_CHOICES, getBuilderChoices, tierLabelToMeta } from "../utils/bakerCustomization";

const SIZES = [
  { label: "6 inch", sub: "6-8 people", price: 0, value: "6inch" },
  { label: "8 inch", sub: "10-15 people", price: 25, value: "8inch" },
  { label: "10 inch", sub: "20-25 people", price: 45, value: "10inch" },
  { label: "12 inch", sub: "30+ people", price: 60, value: "12inch" },
];
const BASE_PRICE = 45;

function buildPreview(file) {
  return {
    file,
    name: file.name,
    url: URL.createObjectURL(file),
    uploadedUrl: null,
  };
}

export default function CustomCakeBuilder() {
  const navigate = useNavigate();
  const { id } = useParams();
  const galleryInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const [builderChoices, setBuilderChoices] = useState(() => getBuilderChoices());
  const [shape, setShape] = useState("Round");
  const [size, setSize] = useState(SIZES[1]);
  const [flavour, setFlavour] = useState("Chocolate");
  const [frosting, setFrosting] = useState("Buttercream");
  const [fillings, setFillings] = useState(["Chocolate Ganache"]);
  const [tiers, setTiers] = useState(() => tierLabelToMeta("2 Tiers"));
  const [dietaryRequests, setDietaryRequests] = useState([]);
  const [message, setMessage] = useState("");
  const [special, setSpecial] = useState("");
  const [referenceImage, setReferenceImage] = useState(null);
  const [isDraggingReference, setIsDraggingReference] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [isUploadingReference, setIsUploadingReference] = useState(false);

  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  useEffect(() => {
    return () => {
      if (referenceImage?.url) {
        URL.revokeObjectURL(referenceImage.url);
      }
    };
  }, [referenceImage]);

  useEffect(() => {
    if (!id) return;
    fetch(`${API_BASE_URL}/api/bakers/${id}`)
      .then(async (response) => {
        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(data.error || "Could not load baker options");
        }
        return data;
      })
      .then((baker) => {
        const nextChoices = getBuilderChoices(baker?.customizationOptions);
        setBuilderChoices(nextChoices);
        setShape((current) => nextChoices.shapes.includes(current) ? current : nextChoices.shapes[0] || BAKER_CUSTOMIZATION_CHOICES.shapes[0]);
        setFlavour((current) => nextChoices.flavours.includes(current) ? current : nextChoices.flavours[0] || BAKER_CUSTOMIZATION_CHOICES.flavours[0]);
        setFrosting((current) => nextChoices.frostings.includes(current) ? current : nextChoices.frostings[0] || BAKER_CUSTOMIZATION_CHOICES.frostings[0]);
        setFillings((current) => {
          const filtered = current.filter((item) => nextChoices.fillings.includes(item));
          return filtered.length ? filtered : (nextChoices.fillings[0] ? [nextChoices.fillings[0]] : []);
        });
        setTiers((current) => {
          const nextTierLabel = nextChoices.tiers.includes(current.value) ? current.value : (nextChoices.tiers[0] || "1 Tier");
          return tierLabelToMeta(nextTierLabel);
        });
        setDietaryRequests((current) => current.filter((item) => nextChoices.dietary.includes(item)));
      })
      .catch(() => {});
  }, [API_BASE_URL, id]);

  const toggleFilling = (filling) =>
    setFillings((prev) =>
      prev.includes(filling)
        ? prev.filter((value) => value !== filling)
        : [...prev, filling]
    );

  const toggleDietary = (option) =>
    setDietaryRequests((prev) =>
      prev.includes(option)
        ? prev.filter((value) => value !== option)
        : [...prev, option]
    );

  const total = BASE_PRICE + size.price + tiers.price;
  const hasRequiredChoices =
    builderChoices.shapes.length > 0 &&
    builderChoices.flavours.length > 0 &&
    builderChoices.frostings.length > 0 &&
    builderChoices.fillings.length > 0 &&
    builderChoices.tiers.length > 0;

  const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append("files", file);
    const response = await fetch(`${API_BASE_URL}/api/upload?context=customer`, {
      method: "POST",
      body: formData,
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.error || "Image upload failed");
    }
    return data.urls?.[0];
  };

  const updateReferenceImage = (file) => {
    if (!file) return;

    setReferenceImage((prev) => {
      if (prev?.url) {
        URL.revokeObjectURL(prev.url);
      }
      return buildPreview(file);
    });

    setIsUploadingReference(true);
    uploadFile(file)
      .then((uploadedUrl) => {
        setReferenceImage((prev) => (prev ? { ...prev, uploadedUrl } : prev));
        setUploadError("");
      })
      .catch((err) => setUploadError(err.message || "Upload failed"))
      .finally(() => setIsUploadingReference(false));
  };

  const clearReferenceImage = () => {
    setReferenceImage((prev) => {
      if (prev?.url) {
        URL.revokeObjectURL(prev.url);
      }
      return null;
    });

    if (galleryInputRef.current) {
      galleryInputRef.current.value = "";
    }
    if (cameraInputRef.current) {
      cameraInputRef.current.value = "";
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-header-left">
          <button className="icon-back" onClick={() => navigate(-1)}>
            ←
          </button>
          <div>
            <h1 className="page-title">Custom Cake Builder</h1>
            <p className="page-subtitle">Design your perfect cake</p>
          </div>
        </div>
        <div className="page-header-actions">
          <button className="ghost-btn">Save Design</button>
          <button className="ghost-btn">Reset</button>
        </div>
      </div>

      <div className="cust-builder-layout">
        <div className="cust-builder-steps">
          {!hasRequiredChoices && (
            <div className="card" style={{ marginBottom: "16px" }}>
              <h3 className="card-title">Customization options coming soon</h3>
              <p className="card-subtitle">
                This baker has not finished choosing which custom cake options are available yet.
              </p>
            </div>
          )}

          <div className="card" style={{ marginBottom: "16px" }}>
              <h3 className="card-title">1. Choose Your Shape</h3>
              <p className="card-subtitle">Select the shape of your cake</p>
              <div className="cust-shape-row">
              {builderChoices.shapes.map((currentShape) => (
                <button
                  key={currentShape}
                  className={`cust-option-chip ${shape === currentShape ? "selected" : ""}`}
                  onClick={() => setShape(currentShape)}
                >
                  {currentShape}
                </button>
              ))}
            </div>
          </div>

          <div className="card" style={{ marginBottom: "16px" }}>
            <h3 className="card-title">2. Select Size</h3>
            <p className="card-subtitle">Choose the diameter and servings</p>
            <div className="cust-size-row">
              {SIZES.map((currentSize) => (
                <button
                  key={currentSize.value}
                  className={`cust-size-chip ${size.value === currentSize.value ? "selected" : ""}`}
                  onClick={() => setSize(currentSize)}
                >
                  <div style={{ fontWeight: 700, fontSize: "15px" }}>{currentSize.label}</div>
                  <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                    {currentSize.sub}
                  </div>
                  {currentSize.price > 0 && (
                    <div style={{ fontSize: "11px", color: "var(--pink)", fontWeight: 600 }}>
                      +${currentSize.price}
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="card" style={{ marginBottom: "16px" }}>
              <h3 className="card-title">3. Flavour &amp; Frosting</h3>
              <div className="grid-2 gap-lg">
                <div>
                  <p className="card-subtitle">Cake Flavour</p>
                {builderChoices.flavours.map((currentFlavour) => (
                  <button
                    key={currentFlavour}
                    className={`cust-list-chip ${flavour === currentFlavour ? "selected" : ""}`}
                    onClick={() => setFlavour(currentFlavour)}
                  >
                    {currentFlavour}
                  </button>
                ))}
              </div>
              <div>
                <p className="card-subtitle">Frosting Type</p>
                {builderChoices.frostings.map((currentFrosting) => (
                  <button
                    key={currentFrosting}
                    className={`cust-list-chip ${frosting === currentFrosting ? "selected" : ""}`}
                    onClick={() => setFrosting(currentFrosting)}
                  >
                    {currentFrosting}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="card" style={{ marginBottom: "16px" }}>
            <h3 className="card-title">4. Fillings</h3>
            <div className="grid-2 gap-lg">
              {builderChoices.fillings.map((filling) => (
                <button
                  key={filling}
                  className={`cust-list-chip ${fillings.includes(filling) ? "selected" : ""}`}
                  onClick={() => toggleFilling(filling)}
                >
                  {filling}
                </button>
              ))}
            </div>
          </div>

          <div className="card" style={{ marginBottom: "16px" }}>
            <h3 className="card-title">5. Number of Tiers</h3>
            <p className="card-subtitle">Choose from the tier options this baker offers</p>
            <div className="cust-size-row">
              {builderChoices.tiers.map((tierLabel) => {
                const currentTier = tierLabelToMeta(tierLabel);
                return (
                <button
                  key={currentTier.value}
                  className={`cust-size-chip ${tiers.value === currentTier.value ? "selected" : ""}`}
                  onClick={() => setTiers(currentTier)}
                  style={{ minWidth: "120px" }}
                >
                  <div style={{ fontSize: "20px" }}>{currentTier.count}x</div>
                  <div style={{ fontWeight: 600, fontSize: "13px" }}>{currentTier.label}</div>
                  {currentTier.price > 0 && (
                    <div style={{ fontSize: "11px", color: "var(--pink)", fontWeight: 600 }}>
                      +${currentTier.price}
                    </div>
                  )}
                </button>
              )})}
            </div>
          </div>

          {builderChoices.dietary.length > 0 && (
            <div className="card" style={{ marginBottom: "16px" }}>
              <h3 className="card-title">6. Dietary Preferences</h3>
              <p className="card-subtitle">Pick any dietary options you need this baker to support</p>
              <div className="grid-2 gap-lg">
                {builderChoices.dietary.map((option) => (
                  <button
                    key={option}
                    className={`cust-list-chip ${dietaryRequests.includes(option) ? "selected" : ""}`}
                    onClick={() => toggleDietary(option)}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="card" style={{ marginBottom: "16px" }}>
            <h3 className="card-title">{builderChoices.dietary.length > 0 ? "7. Upload Design Reference" : "6. Upload Design Reference"}</h3>
            <p className="card-subtitle">Share a photo that matches the style you want</p>
            {uploadError && <p className="auth-error-text">{uploadError}</p>}
            {isUploadingReference && <p className="helper-text">Uploading reference image...</p>}

            <input
              ref={galleryInputRef}
              type="file"
              accept="image/*"
              className="hidden-file-input"
              onChange={(e) => updateReferenceImage(e.target.files?.[0])}
            />
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden-file-input"
              onChange={(e) => updateReferenceImage(e.target.files?.[0])}
            />

            <button
              type="button"
              className={`image-drop upload-drop-button ${isDraggingReference ? "dragging" : ""}`}
              style={{ marginBottom: "12px" }}
              onClick={() => galleryInputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDraggingReference(true);
              }}
              onDragLeave={() => setIsDraggingReference(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDraggingReference(false);
                updateReferenceImage(e.dataTransfer.files?.[0]);
              }}
            >
              {referenceImage ? (
                <div className="upload-preview-card">
                  <img
                    src={resolveImageUrl(API_BASE_URL, referenceImage.uploadedUrl || referenceImage.url)}
                    alt={referenceImage.name}
                    className="upload-preview-image large"
                  />
                  <div className="upload-preview-meta">
                    <strong>Reference image selected</strong>
                    <span>{referenceImage.name}</span>
                  </div>
                  <div className="upload-preview-actions">
                    <span className="upload-preview-hint">Click to replace</span>
                    <button
                      type="button"
                      className="upload-remove-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        clearReferenceImage();
                      }}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <span className="upload-icon">Up</span>
                  <p style={{ margin: "6px 0 4px", fontWeight: 500 }}>
                    Drop your reference image here
                  </p>
                  <p className="helper-text">or click to browse</p>
                </>
              )}
            </button>

            <div className="upload-action-row">
              <button
                type="button"
                className="cust-upload-btn pink-upload"
                onClick={() => galleryInputRef.current?.click()}
              >
                Choose From Gallery
              </button>
              <button
                type="button"
                className="cust-upload-btn white-upload"
                onClick={() => cameraInputRef.current?.click()}
              >
                Take Photo
              </button>
            </div>
            <p className="helper-text" style={{ marginTop: "8px" }}>
              Accepted formats: JPG, PNG, HEIC, WebP
            </p>
          </div>

          <div className="card">
            <h3 className="card-title">{builderChoices.dietary.length > 0 ? "8. Personalization" : "7. Personalization"}</h3>
            <label className="field">
              <span className="field-label">Custom Message</span>
              <input
                className="input"
                placeholder="e.g., Happy Birthday Sarah!"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </label>
            <label className="field">
              <span className="field-label">Special Instructions</span>
              <textarea
                className="textarea"
                placeholder="Any dietary requirements, decoration preferences, or special requests..."
                value={special}
                onChange={(e) => setSpecial(e.target.value)}
                style={{ minHeight: "80px" }}
              />
            </label>
          </div>
        </div>

        <aside className="cust-builder-summary">
          <div className="card" style={{ position: "sticky", top: "20px" }}>
            <h3 className="card-title">Your Design</h3>
            {referenceImage ? (
              <img
                src={resolveImageUrl(API_BASE_URL, referenceImage.uploadedUrl || referenceImage.url)}
                alt={referenceImage.name}
                className="cust-summary-preview uploaded"
              />
            ) : (
              <div className="cust-summary-preview" />
            )}
            <div style={{ marginTop: "14px" }}>
              <div className="cust-summary-row"><span>Shape</span><span>{shape}</span></div>
              <div className="cust-summary-row"><span>Size</span><span>{size.label}</span></div>
              <div className="cust-summary-row"><span>Flavour</span><span>{flavour}</span></div>
              <div className="cust-summary-row"><span>Frosting</span><span>{frosting}</span></div>
              <div className="cust-summary-row"><span>Filling</span><span>{fillings[0] || "-"}</span></div>
              <div className="cust-summary-row"><span>Tiers</span><span>{tiers.label}</span></div>
              {dietaryRequests.length > 0 && (
                <div className="cust-summary-row"><span>Dietary</span><span>{dietaryRequests.join(", ")}</span></div>
              )}
            </div>
            <div className="cust-summary-total">
              <span>Estimated Total</span>
              <span className="cust-total-price">${total}</span>
            </div>
            <button
              className="cust-primary-btn wide"
              style={{ marginTop: "14px", padding: "12px" }}
              onClick={() => {
                if (!hasRequiredChoices) {
                  setUploadError("This baker has not finished setting up custom cake options yet.");
                  return;
                }

                if (isUploadingReference) {
                  setUploadError("Please wait for the reference image to finish uploading.");
                  return;
                }

                if (referenceImage && !referenceImage.uploadedUrl) {
                  setUploadError("Your reference image did not finish uploading. Please retry or remove it.");
                  return;
                }

                const draft = {
                  bakerId: id,
                  shape,
                  size: size.label,
                  flavour,
                  fillings,
                  frosting,
                  tiers: tiers.label,
                  message,
                  special,
                  dietaryNotes: dietaryRequests.join(", "),
                  referenceImage: referenceImage?.uploadedUrl || null,
                };
                sessionStorage.setItem("orderDraft", JSON.stringify(draft));
                navigate(`/baker/${id}/checkout`);
              }}
              disabled={isUploadingReference}
            >
              {isUploadingReference ? "Uploading image..." : "Checkout"}
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}
