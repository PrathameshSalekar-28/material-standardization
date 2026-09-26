import { useEffect, useState } from "react";

import {
  ArrowRight,
  Check,
  ChevronRight,
  FileCheck2,
  Loader2,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  X,
  AlertTriangle,
} from "lucide-react";

import "./Standardize.css";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8080/api";

function Standardize() {
  const [materials, setMaterials] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [proposal, setProposal] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // =============================================================
  // LOAD MATERIALS
  // =============================================================

  useEffect(() => {
    loadMaterials();
  }, []);

  const loadMaterials = async () => {
    try {
      const response = await fetch(`${API_URL}/materials`);

      if (!response.ok) {
        throw new Error("Unable to load materials.");
      }

      const data = await response.json();

      setMaterials(data);
    } catch (err) {
      console.error(err);
      setError("Unable to load material records.");
    }
  };

  // =============================================================
  // SELECT / DESELECT MATERIAL
  // =============================================================

  const toggleMaterial = (id) => {
    setError("");
    setSuccess("");

    setSelectedIds((previous) => {
      if (previous.includes(id)) {
        return previous.filter((item) => item !== id);
      }

      return [...previous, id];
    });

    setProposal(null);
  };

  // =============================================================
  // GENERATE STANDARDIZATION PROPOSAL
  // =============================================================

  const generateStandard = async () => {
    setError("");
    setSuccess("");

    if (selectedIds.length < 2) {
      setError("Select at least two equivalent materials.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/standardization`, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify(selectedIds),
      });

      // ---------------------------------------------------------
      // Read response safely
      // ---------------------------------------------------------

      let responseData = null;

      const contentType = response.headers.get("content-type");

      if (
        contentType &&
        contentType.includes("application/json")
      ) {
        responseData = await response.json();
      } else {
        const text = await response.text();

        responseData = {
          message: text,
        };
      }

      // ---------------------------------------------------------
      // Backend returned validation/error
      // ---------------------------------------------------------

      if (!response.ok) {
        let backendMessage =
          responseData?.message ||
          responseData?.error ||
          responseData?.detail;

        if (
          !backendMessage &&
          typeof responseData === "string"
        ) {
          backendMessage = responseData;
        }

        if (!backendMessage) {
          backendMessage =
            "Unable to generate standardization proposal.";
        }

        throw new Error(backendMessage);
      }

      // ---------------------------------------------------------
      // SUCCESS
      // ---------------------------------------------------------

      setProposal(responseData);

      console.log(
        "STANDARDIZATION RESPONSE:",
        responseData
      );

      console.log(
        "LEGACY CODES:",
        responseData.legacyMaterialCodes
      );

      console.log(
        "CPSE NAMES:",
        responseData.cpseNames
      );

      setSuccess(
        "Standardization proposal generated successfully."
      );

    } catch (err) {
      console.error(
        "Standardization error:",
        err
      );

      setProposal(null);

      setError(
        err?.message ||
        "Unable to generate standardization proposal."
      );

    } finally {
      setLoading(false);
    }
  };

  // =============================================================
  // SUBMIT FOR REVIEW
  // =============================================================

  const submitForReview = async () => {
    if (!proposal) {
      return;
    }

    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        `${API_URL}/standardized-materials`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            commonMaterialCode:
              proposal.commonMaterialCode,

            standardizedDescription:
              proposal.standardizedDescription,

            materialType:
              proposal.materialType,

            materialGroup:
              proposal.materialGroup,

            grade:
              proposal.grade,

            size:
              proposal.size,

            standard:
              proposal.standard,

            unit:
              proposal.unit,
          }),
        }
      );

      // ---------------------------------------------------------
      // Read response safely
      // ---------------------------------------------------------

      let responseData = null;

      const contentType =
        response.headers.get("content-type");

      if (
        contentType &&
        contentType.includes("application/json")
      ) {
        responseData = await response.json();
      } else {
        const text = await response.text();

        responseData = {
          message: text,
        };
      }

      // ---------------------------------------------------------
      // ERROR
      // ---------------------------------------------------------

      if (!response.ok) {
        throw new Error(
          responseData?.message ||
          responseData?.error ||
          "Unable to submit proposal for review."
        );
      }

      // =========================================================
      // SUBMISSION SUCCESS
      // =========================================================

      /*
       * Clear the current standardization workflow
       * so the user gets a fresh Step 01 / Step 02 screen.
       */

      setSelectedIds([]);
      setProposal(null);

      // Reload materials from backend
      await loadMaterials();

      // Show success message
      setSuccess(
        "Proposal submitted successfully and sent to Admin for approval."
      );

      // Scroll page to top
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });

    } catch (err) {
      console.error(
        "Submit review error:",
        err
      );

      setError(
        err?.message ||
        "Unable to submit proposal for review."
      );
    }
  };

  // =============================================================
  // RESET
  // =============================================================

  const resetStandardization = () => {
    setSelectedIds([]);
    setProposal(null);
    setError("");
    setSuccess("");
  };

  // =============================================================
  // FORMAT MATERIAL FIELD
  // =============================================================

  const displayValue = (value) => {
    if (
      value === null ||
      value === undefined ||
      value === ""
    ) {
      return "—";
    }

    return value;
  };

  // =============================================================
  // RENDER
  // =============================================================

  return (
    <div className="standardize-page">

      {/* =======================================================
          HEADER
      ======================================================= */}

      <div className="standardize-header">

        <div>

          <div className="standardize-eyebrow">

            <Sparkles size={15} />

            AI STANDARDIZATION ENGINE

          </div>

          <h1>
            Standardize Materials
          </h1>

          <p>
            Select equivalent material records and
            generate a unified national material code
            using the AI standardization engine.
          </p>

        </div>

        <div className="standardize-header-badge">

          <ShieldCheck size={17} />

          <div>

            <strong>
              Human-in-the-loop
            </strong>

            <span>
              AI proposals require review
            </span>

          </div>

        </div>

      </div>

      {/* =======================================================
          ERROR MESSAGE
      ======================================================= */}

      {error && (

        <div className="standardize-alert error">

          <div className="alert-icon">
            <AlertTriangle size={18} />
          </div>

          <div className="alert-content">

            <strong>
              Standardization blocked
            </strong>

            <span>
              {error}
            </span>

          </div>

          <button
            type="button"
            className="alert-close"
            onClick={() => setError("")}
          >
            <X size={17} />
          </button>

        </div>

      )}

      {/* =======================================================
          SUCCESS MESSAGE
      ======================================================= */}

      {success && (

        <div className="standardize-alert success">

          <div className="alert-icon">
            <Check size={18} />
          </div>

          <div className="alert-content">

            <strong>
              Success
            </strong>

            <span>
              {success}
            </span>

          </div>

          <button
            type="button"
            className="alert-close"
            onClick={() => setSuccess("")}
          >
            <X size={17} />
          </button>

        </div>

      )}

      {/* =======================================================
          MAIN CONTENT
      ======================================================= */}

      <div className="standardize-layout">

        {/* =====================================================
            STEP 01
        ===================================================== */}

        <section className="standardize-card materials-card">

          <div className="step-header">

            <div className="step-number">
              STEP 01
            </div>

            <div className="step-title-row">

              <div>

                <h2>
                  Select Materials
                </h2>

                <p>
                  Choose two or more equivalent
                  material records.
                </p>

              </div>

              <div className="selected-count">

                {selectedIds.length}

                <span>
                  selected
                </span>

              </div>

            </div>

          </div>

          {/* MATERIAL LIST */}

          <div className="materials-list">

            {materials.length === 0 ? (

              <div className="materials-loading">

                <Loader2
                  size={22}
                  className="spin"
                />

                <span>
                  Loading materials...
                </span>

              </div>

            ) : (

              materials.map((material) => {

                const isSelected =
                  selectedIds.includes(material.id);

                return (

                  <button
                    type="button"
                    key={material.id}
                    className={
                      isSelected
                        ? "material-select-card selected"
                        : "material-select-card"
                    }
                    onClick={() =>
                      toggleMaterial(material.id)
                    }
                  >

                    <div
                      className={
                        isSelected
                          ? "material-checkbox checked"
                          : "material-checkbox"
                      }
                    >

                      {isSelected && (
                        <Check size={14} />
                      )}

                    </div>

                    <div className="material-main">

                      <div className="material-code-row">

                        <strong>
                          {displayValue(
                            material.materialCode
                          )}
                        </strong>

                        <span className="cpse-badge">
                          {displayValue(
                            material.cpseName
                          )}
                        </span>

                      </div>

                      <div className="material-description">

                        {displayValue(
                          material.description
                        )}

                      </div>

                      <div className="material-specs">

                        <span>
                          {displayValue(
                            material.materialType
                          )}
                        </span>

                        <span>
                          {displayValue(
                            material.grade
                          )}
                        </span>

                        <span>
                          {displayValue(
                            material.size
                          )}
                        </span>

                        <span>
                          {displayValue(
                            material.standard
                          )}
                        </span>

                      </div>

                    </div>

                    <ChevronRight
                      size={18}
                      className="material-arrow"
                    />

                  </button>
                );
              })

            )}

          </div>

          {/* ACTION AREA */}

          <div className="standardize-action">

            <div className="selection-info">

              <FileCheck2 size={18} />

              <span>
                {selectedIds.length === 0
                  ? "No materials selected"
                  : `${selectedIds.length} materials ready for standardization`}
              </span>

            </div>

            <div className="action-buttons">

              {selectedIds.length > 0 && (

                <button
                  type="button"
                  className="reset-button"
                  onClick={resetStandardization}
                >

                  <RefreshCw size={16} />

                  Reset

                </button>

              )}

              <button
                type="button"
                className="generate-button"
                onClick={generateStandard}
                disabled={
                  loading ||
                  selectedIds.length < 2
                }
              >

                {loading ? (

                  <>
                    <Loader2
                      size={17}
                      className="spin"
                    />

                    Generating...
                  </>

                ) : (

                  <>
                    <Sparkles size={17} />

                    Generate Standard

                    <ArrowRight size={17} />
                  </>

                )}

              </button>

            </div>

          </div>

        </section>

        {/* =====================================================
            STEP 02
        ===================================================== */}

        <section className="standardize-card proposal-card">

          <div className="step-header">

            <div className="step-number">
              STEP 02
            </div>

            <div className="step-title-row">

              <div>

                <h2>
                  Standardization Proposal
                </h2>

                <p>
                  AI-generated unified material definition.
                </p>

              </div>

              {proposal && (

                <div className="ai-ready-badge">

                  <Sparkles size={14} />

                  AI READY

                </div>

              )}

            </div>

          </div>

          {/* NO PROPOSAL */}

          {!proposal && !loading && (

            <div className="empty-proposal">

              <div className="empty-icon">

                <Sparkles size={28} />

              </div>

              <h3>
                No proposal generated
              </h3>

              <p>
                Select equivalent materials from the
                left panel and click{" "}
                <strong>
                  Generate Standard
                </strong>.
              </p>

            </div>

          )}

          {/* LOADING */}

          {loading && (

            <div className="empty-proposal">

              <div className="empty-icon">

                <Loader2
                  size={28}
                  className="spin"
                />

              </div>

              <h3>
                Analyzing materials
              </h3>

              <p>
                The standardization engine is
                validating specifications and
                generating a unified material definition.
              </p>

            </div>

          )}

          {/* PROPOSAL */}

          {proposal && !loading && (

            <div className="proposal-content">

              {/* Common code */}

              <div className="common-code-box">

                <div className="proposal-label">
                  COMMON NATIONAL MATERIAL CODE
                </div>

                <div className="common-code">
                  {proposal.commonMaterialCode}
                </div>

                <div className="proposal-status">

                  <Check size={14} />

                  AI-generated proposal

                </div>

              </div>

              {/* Standardized description */}

              <div className="proposal-section">

                <div className="proposal-section-title">
                  Standardized Description
                </div>

                <div className="description-box">
                  {proposal.standardizedDescription}
                </div>

              </div>

              {/* Specifications */}

              <div className="proposal-section">

                <div className="proposal-section-title">
                  Unified Specifications
                </div>

                <div className="spec-grid">

                  <div className="spec-item">

                    <span>
                      Material Type
                    </span>

                    <strong>
                      {displayValue(
                        proposal.materialType
                      )}
                    </strong>

                  </div>

                  <div className="spec-item">

                    <span>
                      Material Group
                    </span>

                    <strong>
                      {displayValue(
                        proposal.materialGroup
                      )}
                    </strong>

                  </div>

                  <div className="spec-item">

                    <span>
                      Grade
                    </span>

                    <strong>
                      {displayValue(
                        proposal.grade
                      )}
                    </strong>

                  </div>

                  <div className="spec-item">

                    <span>
                      Size
                    </span>

                    <strong>
                      {displayValue(
                        proposal.size
                      )}
                    </strong>

                  </div>

                  <div className="spec-item">

                    <span>
                      Standard
                    </span>

                    <strong>
                      {displayValue(
                        proposal.standard
                      )}
                    </strong>

                  </div>

                  <div className="spec-item">

                    <span>
                      Unit
                    </span>

                    <strong>
                      {displayValue(
                        proposal.unit
                      )}
                    </strong>

                  </div>

                </div>

              </div>

              {/* Legacy codes */}

              <div className="proposal-section">

                <div className="proposal-section-title">
                  Legacy Material Codes
                </div>

                <div className="legacy-codes">

                  {proposal.legacyMaterialCodes?.map(
                    (code, index) => (

                      <span
                        key={`${code}-${index}`}
                        className="legacy-code"
                      >
                        {code}
                      </span>

                    )
                  )}

                </div>

              </div>

              {/* CPSEs */}

              <div className="proposal-section">

                <div className="proposal-section-title">
                  Participating CPSEs
                </div>

                <div className="cpse-list">

                  {proposal.cpseNames?.map(
                    (cpse, index) => (

                      <span
                        key={`${cpse}-${index}`}
                        className="proposal-cpse"
                      >
                        {cpse}
                      </span>

                    )
                  )}

                </div>

              </div>

              {/* Human approval */}

              <div className="review-box">

                <div className="review-icon">

                  <ShieldCheck size={20} />

                </div>

                <div className="review-text">

                  <strong>
                    Admin review required
                  </strong>

                  <span>
                    This AI-generated material definition
                    must be reviewed and approved by Admin
                    before becoming an official standardized code.
                  </span>

                </div>

              </div>

              {/* Submit */}

              <button
                type="button"
                className="submit-review-button"
                onClick={submitForReview}
              >

                <FileCheck2 size={17} />

                Submit for Review

                <ArrowRight size={17} />

              </button>

            </div>

          )}

        </section>

      </div>

    </div>
  );
}

export default Standardize;