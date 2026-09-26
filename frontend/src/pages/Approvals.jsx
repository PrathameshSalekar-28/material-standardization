import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import "./Approvals.css";

const API = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL || "http://localhost:8080/api",
  headers: {
    "Content-Type": "application/json",
  },
});

const Approvals = ({ onPendingCountChange }) => {
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [standardizedMaterials, setStandardizedMaterials] = useState([]);
  const [approvalHistory, setApprovalHistory] = useState([]);
  const [materials, setMaterials] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState("");

  // =========================================================
  // LOAD ALL APPROVAL DATA
  // =========================================================

  const loadData = async () => {
    try {
      setError("");

      const [
        pendingResponse,
        standardizedResponse,
        historyResponse,
        materialsResponse,
      ] = await Promise.all([
        API.get("/standardized-materials/pending"),
        API.get("/standardized-materials"),
        API.get("/standardized-materials/history"),
        API.get("/materials"),
      ]);

      const pendingData = Array.isArray(
         pendingResponse.data
      )
        ? pendingResponse.data
        : [];

      setPendingApprovals(pendingData);

      if (onPendingCountChange) {
        onPendingCountChange(pendingData);
      }

      setStandardizedMaterials(
        Array.isArray(standardizedResponse.data)
          ? standardizedResponse.data
          : []
      );

      setApprovalHistory(
        Array.isArray(historyResponse.data)
          ? historyResponse.data
          : []
      );

      setMaterials(
        Array.isArray(materialsResponse.data)
          ? materialsResponse.data
          : []
      );
    } catch (err) {
      console.error("Failed to load approval data:", err);

      setError(
        err?.response?.data?.message ||
          "Unable to load approval data."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // =========================================================
  // REFRESH
  // =========================================================

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
  };

  // =========================================================
  // APPROVE STANDARDIZATION
  // =========================================================

  const handleApproveStandardization = async (id) => {
    try {
      setActionLoading(`standardization-approve-${id}`);

      await API.post(
        `/standardized-materials/by-id/${id}/approve`,
        null,
        {
          params: {
            reviewer: "Admin",
          },
        }
      );

      await loadData();
    } catch (err) {
      console.error(
        "Failed to approve standardization:",
        err
      );

      alert(
        err?.response?.data?.message ||
          "Failed to approve standardization proposal."
      );
    } finally {
      setActionLoading(null);
    }
  };

  // =========================================================
  // REJECT STANDARDIZATION
  // =========================================================

  const handleRejectStandardization = async (id) => {
    try {
      setActionLoading(`standardization-reject-${id}`);

      await API.post(
        `/standardized-materials/by-id/${id}/reject`,
        null,
        {
          params: {
            reviewer: "Admin",
          },
        }
      );

      await loadData();
    } catch (err) {
      console.error(
        "Failed to reject standardization:",
        err
      );

      alert(
        err?.response?.data?.message ||
          "Failed to reject standardization proposal."
      );
    } finally {
      setActionLoading(null);
    }
  };

  // =========================================================
  // STATUS LISTS
  // =========================================================

  const pendingStandardizations = useMemo(() => {
    return standardizedMaterials.filter(
      (item) =>
        item.status === "PENDING_REVIEW"
    );
  }, [standardizedMaterials]);

  const approvedStandardizations = useMemo(() => {
    return standardizedMaterials.filter(
      (item) =>
        item.status === "APPROVED"
    );
  }, [standardizedMaterials]);

  const rejectedStandardizations = useMemo(() => {
    return standardizedMaterials.filter(
      (item) =>
        item.status === "REJECTED"
    );
  }, [standardizedMaterials]);

  // =========================================================
  // COUNTS
  // =========================================================

  // IMPORTANT:
  // Count comes from the actual standardized_materials status.
  // This keeps summary cards and proposal section synchronized.

  const pendingStandardizationCount =
    pendingStandardizations.length;

  const approvedCount =
    approvedStandardizations.length;

  const rejectedCount =
    rejectedStandardizations.length;

  // =========================================================
  // FIND LEGACY MATERIAL CODES
  // =========================================================

  const getLegacyMaterialCodes = (item) => {
    // -------------------------------------------------------
    // 1. If backend already provides legacyMaterialCodes
    // -------------------------------------------------------

    if (
      Array.isArray(item.legacyMaterialCodes) &&
      item.legacyMaterialCodes.length > 0
    ) {
      return item.legacyMaterialCodes;
    }

    // -------------------------------------------------------
    // 2. If backend provides selected material IDs
    // -------------------------------------------------------

    const selectedIds =
      item.materialIds ||
      item.sourceMaterialIds ||
      item.selectedMaterialIds;

    if (
      Array.isArray(selectedIds) &&
      selectedIds.length > 0
    ) {
      const codes = materials
        .filter((material) =>
          selectedIds.includes(material.id)
        )
        .map((material) => material.materialCode)
        .filter(Boolean);

      if (codes.length > 0) {
        return [...new Set(codes)];
      }
    }

    // -------------------------------------------------------
    // 3. Match materials using standardized fields
    // -------------------------------------------------------

    const normalize = (value) =>
      String(value ?? "")
        .trim()
        .toLowerCase();

    const itemType = normalize(item.materialType);
    const itemGroup = normalize(item.materialGroup);
    const itemGrade = normalize(item.grade);
    const itemSize = normalize(item.size);
    const itemStandard = normalize(item.standard);
    const itemUnit = normalize(item.unit);

    const matchedMaterials = materials.filter(
      (material) => {
        const materialType =
          normalize(material.materialType);

        const materialGroup =
          normalize(material.materialGroup);

        const materialGrade =
          normalize(material.grade);

        const materialSize =
          normalize(material.size);

        const materialStandard =
          normalize(material.standard);

        const materialUnit =
          normalize(material.unit);

        const typeMatches =
          !itemType ||
          !materialType ||
          materialType === itemType;

        const groupMatches =
          !itemGroup ||
          !materialGroup ||
          materialGroup === itemGroup;

        const gradeMatches =
          !itemGrade ||
          !materialGrade ||
          materialGrade === itemGrade;

        const sizeMatches =
          !itemSize ||
          !materialSize ||
          materialSize === itemSize;

        const standardMatches =
          !itemStandard ||
          !materialStandard ||
          materialStandard === itemStandard;

        const unitMatches =
          !itemUnit ||
          !materialUnit ||
          materialUnit === itemUnit;

        return (
          typeMatches &&
          groupMatches &&
          gradeMatches &&
          sizeMatches &&
          standardMatches &&
          unitMatches
        );
      }
    );

    const codes = matchedMaterials
      .map((material) => material.materialCode)
      .filter(Boolean);

    return [...new Set(codes)];
  };

  // =========================================================
  // AUDIT TRAIL
  // =========================================================

  const unifiedAuditTrail = useMemo(() => {
    return approvalHistory
      .map((item) => ({
        ...item,

        governanceType:
          "Standardization",

        auditKey:
          `standardization-${item.id}`,

        displayMaterialCode:
          item.commonMaterialCode ||
          item.materialCode ||
          "—",

        displayDescription:
          item.standardizedDescription ||
          item.description ||
          "—",

        displayLegacyCode:
          item.legacyMaterialCode ||
          "—",
      }))
      .sort((a, b) => {
        const dateA = new Date(
          a.reviewedAt ||
            a.createdAt ||
            0
        ).getTime();

        const dateB = new Date(
          b.reviewedAt ||
            b.createdAt ||
            0
        ).getTime();

        return dateB - dateA;
      });
  }, [approvalHistory]);

  // =========================================================
  // DATE FORMATTER
  // =========================================================

  const formatDate = (dateValue) => {
    if (!dateValue) {
      return "—";
    }

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return "—";
    }

    return date.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // =========================================================
  // STATUS BADGE
  // =========================================================

  const renderStatusBadge = (status) => {
    if (status === "APPROVED") {
      return (
        <span className="approval-status approved">
          APPROVED
        </span>
      );
    }

    if (status === "REJECTED") {
      return (
        <span className="approval-status rejected">
          REJECTED
        </span>
      );
    }

    return (
      <span className="approval-status pending">
        PENDING REVIEW
      </span>
    );
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="approvals-page">
        <div className="approvals-loading">
          <div className="loading-spinner"></div>

          <p>
            Loading approval data...
          </p>
        </div>
      </div>
    );
  }

  // =========================================================
  // PAGE
  // =========================================================

  return (
    <div className="approvals-page">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="approvals-header">

        <div>

          <div className="page-breadcrumb">
            Approvals
            <span>/</span>
            Material Intelligence Platform
          </div>

          <h1>
            Approval Queue
          </h1>

          <p className="page-description">
            Review AI-generated material standardization
            proposals before they become approved national
            master data.
          </p>

        </div>

        <button
          className="refresh-approvals-button"
          onClick={handleRefresh}
          disabled={refreshing}
        >

          <span
            className={
              refreshing
                ? "refresh-icon spinning"
                : "refresh-icon"
            }
          >
            ↻
          </span>

          {refreshing
            ? "Refreshing..."
            : "Refresh"}

        </button>

      </div>

      {/* =====================================================
          ERROR
      ===================================================== */}

      {error && (
        <div className="approval-error">

          <strong>
            Error:
          </strong>{" "}

          {error}

        </div>
      )}

      {/* =====================================================
          SUMMARY CARDS
      ===================================================== */}

      <div className="approval-summary-grid">

        {/* PENDING */}

        <div className="approval-summary-card pending-card">

          <div className="summary-card-icon">
            ⏳
          </div>

          <div className="summary-card-content">

            <span className="summary-card-label">
              Pending Review
            </span>

            <strong className="summary-card-value">
              {pendingStandardizationCount}
            </strong>

            <span className="summary-card-description">
              Awaiting governance decision
            </span>

          </div>

        </div>

        {/* APPROVED */}

        <div className="approval-summary-card approved-card">

          <div className="summary-card-icon">
            ✓
          </div>

          <div className="summary-card-content">

            <span className="summary-card-label">
              Approved
            </span>

            <strong className="summary-card-value">
              {approvedCount}
            </strong>

            <span className="summary-card-description">
              Approved master data
            </span>

          </div>

        </div>

        {/* REJECTED */}

        <div className="approval-summary-card rejected-card">

          <div className="summary-card-icon">
            !
          </div>

          <div className="summary-card-content">

            <span className="summary-card-label">
              Rejected
            </span>

            <strong className="summary-card-value">
              {rejectedCount}
            </strong>

            <span className="summary-card-description">
              Rejected standardization proposals
            </span>

          </div>

        </div>

      </div>

      {/* =====================================================
          GOVERNANCE TYPE COUNTS
      ===================================================== */}

      <div className="pending-breakdown">

        <div className="pending-breakdown-label">
          Pending review
        </div>

        <div className="pending-breakdown-items">

          <span>
            Standardization:
            <strong>
              {pendingStandardizationCount}
            </strong>
          </span>

        </div>

      </div>

      {/* =====================================================
          GOVERNANCE CONTENT
      ===================================================== */}

      <div className="governance-content">

        {/* ===================================================
            PENDING STANDARDIZATION
        =================================================== */}

        <section className="approval-section">

          <div className="section-header">

            <div>

              <span className="section-eyebrow">
                REVIEW QUEUE
              </span>

              <h2>
                Pending Standardization Proposals
              </h2>

              <p>
                AI-generated proposals requiring human
                validation before becoming national material
                master data.
              </p>

            </div>

            <span className="section-count">
              {pendingStandardizationCount} pending
            </span>

          </div>

          {pendingStandardizations.length === 0 ? (

            <div className="empty-state">

              <div className="empty-state-icon">
                ✓
              </div>

              <h3>
                No pending standardization proposals
              </h3>

              <p>
                All AI-generated standardization proposals
                have been reviewed.
              </p>

            </div>

          ) : (

            <div className="approval-list">

              {pendingStandardizations.map((item) => {

                const legacyCodes =
                  getLegacyMaterialCodes(item);

                return (

                  <div
                    className="approval-proposal-card"
                    key={item.id}
                  >

                    <div className="proposal-main">

                      {/* CODE + STATUS */}

                      <div className="proposal-heading">

                        <div>

                          <span className="proposal-label">
                            Proposed National Material Code
                          </span>

                          <h3>
                            {item.commonMaterialCode ||
                              "—"}
                          </h3>

                        </div>

                        {renderStatusBadge(
                          item.status
                        )}

                      </div>

                      {/* DESCRIPTION */}

                      <div className="proposal-description">

                        <span>
                          Standardized Description
                        </span>

                        <strong>
                          {item.standardizedDescription ||
                            "—"}
                        </strong>

                      </div>

                      {/* SPECIFICATIONS */}

                      <div className="proposal-grid">

                        <div>
                          <span>
                            Material Type
                          </span>

                          <strong>
                            {item.materialType ||
                              "—"}
                          </strong>
                        </div>

                        <div>
                          <span>
                            Material Group
                          </span>

                          <strong>
                            {item.materialGroup ||
                              "—"}
                          </strong>
                        </div>

                        <div>
                          <span>
                            Grade
                          </span>

                          <strong>
                            {item.grade ||
                              "—"}
                          </strong>
                        </div>

                        <div>
                          <span>
                            Size
                          </span>

                          <strong>
                            {item.size ||
                              "—"}
                          </strong>
                        </div>

                        <div>
                          <span>
                            Standard
                          </span>

                          <strong>
                            {item.standard ||
                              "—"}
                          </strong>
                        </div>

                        <div>
                          <span>
                            Unit
                          </span>

                          <strong>
                            {item.unit ||
                              "—"}
                          </strong>
                        </div>

                      </div>

                      {/* =================================================
                          LEGACY MATERIAL CODES
                      ================================================= */}

                      <div className="legacy-materials">

                        <span>
                          Legacy Material Codes
                        </span>

                        <div className="legacy-code-list">

                          {legacyCodes.length > 0 ? (

                            legacyCodes.map(
                              (code, index) => (

                                <span
                                  className="legacy-code"
                                  key={`${code}-${index}`}
                                >
                                  {code}
                                </span>

                              )
                            )

                          ) : (

                            <span className="legacy-code">
                              No legacy codes available
                            </span>

                          )}

                        </div>

                      </div>

                    </div>

                    {/* =================================================
                        ACTIONS
                    ================================================= */}

                    <div className="proposal-actions">

                      <button
                        className="approve-button"
                        onClick={() =>
                          handleApproveStandardization(
                            item.id
                          )
                        }
                        disabled={
                          actionLoading ===
                          `standardization-approve-${item.id}`
                        }
                      >

                        {actionLoading ===
                        `standardization-approve-${item.id}`
                          ? "Approving..."
                          : "Approve"}

                      </button>

                      <button
                        className="reject-button"
                        onClick={() =>
                          handleRejectStandardization(
                            item.id
                          )
                        }
                        disabled={
                          actionLoading ===
                          `standardization-reject-${item.id}`
                        }
                      >

                        {actionLoading ===
                        `standardization-reject-${item.id}`
                          ? "Rejecting..."
                          : "Reject"}

                      </button>

                    </div>

                  </div>
                );
              })}

            </div>

          )}

        </section>

        {/* ===================================================
            APPROVED STANDARDIZATION
        =================================================== */}

        <section className="approval-section">

          <div className="section-header">

            <div>

              <span className="section-eyebrow">
                APPROVED MASTER DATA
              </span>

              <h2>
                Approved National Material Codes
              </h2>

              <p>
                Standardized material definitions that have
                passed human governance review.
              </p>

            </div>

            <span className="section-count approved-count">
              {approvedStandardizations.length} approved
            </span>

          </div>

          {approvedStandardizations.length === 0 ? (

            <div className="empty-state compact">

              <h3>
                No approved standardization proposals
              </h3>

            </div>

          ) : (

            <div className="approved-material-list">

              {approvedStandardizations.map((item) => (

                <div
                  className="approved-material-card"
                  key={item.id}
                >

                  <div className="approved-material-code">
                    {item.commonMaterialCode}
                  </div>

                  <div className="approved-material-details">

                    <strong>
                      {item.standardizedDescription}
                    </strong>

                    <span>
                      {item.materialType || "—"}
                      {" • "}
                      {item.materialGroup || "—"}
                      {" • "}
                      {item.grade || "—"}
                    </span>

                  </div>

                  <div className="approved-material-review">

                    {renderStatusBadge(
                      item.status
                    )}

                    <span>
                      Reviewed by{" "}
                      <strong>
                        {item.reviewedBy ||
                          "Admin"}
                      </strong>
                    </span>

                    <span>
                      {formatDate(
                        item.reviewedAt
                      )}
                    </span>

                  </div>

                </div>

              ))}

            </div>

          )}

        </section>

        {/* ===================================================
            REJECTED STANDARDIZATION
        =================================================== */}

        <section className="approval-section">

          <div className="section-header">

            <div>

              <span className="section-eyebrow">
                REJECTED PROPOSALS
              </span>

              <h2>
                Rejected Standardization Proposals
              </h2>

              <p>
                AI-generated proposals that were not accepted
                during human validation.
              </p>

            </div>

            <span className="section-count rejected-count">
              {rejectedStandardizations.length} rejected
            </span>

          </div>

          {rejectedStandardizations.length === 0 ? (

            <div className="empty-state compact">

              <h3>
                No rejected standardization proposals
              </h3>

            </div>

          ) : (

            <div className="rejected-material-list">

              {rejectedStandardizations.map((item) => (

                <div
                  className="rejected-material-card"
                  key={item.id}
                >

                  <div>

                    <span className="rejected-code">
                      {item.commonMaterialCode}
                    </span>

                    <strong>
                      {item.standardizedDescription}
                    </strong>

                  </div>

                  <div className="rejected-review">

                    {renderStatusBadge(
                      item.status
                    )}

                    <span>
                      Reviewed by{" "}
                      <strong>
                        {item.reviewedBy ||
                          "Admin"}
                      </strong>
                    </span>

                    <span>
                      {formatDate(
                        item.reviewedAt
                      )}
                    </span>

                  </div>

                </div>

              ))}

            </div>

          )}

        </section>

      </div>

      {/* =====================================================
          GOVERNANCE CONTROL
      ===================================================== */}

      <section className="governance-control-card">

        <div className="governance-control-icon">
          🔒
        </div>

        <div>

          <span className="section-eyebrow">
            GOVERNANCE CONTROL
          </span>

          <h3>
            Human validation is mandatory
          </h3>

          <p>
            AI recommendations never become approved master
            data automatically. Standardization proposals
            require explicit human validation before approval.
          </p>

        </div>

      </section>

      {/* =====================================================
          AUDIT TRAIL
      ===================================================== */}

      <section className="approval-section audit-section">

        <div className="section-header">

          <div>

            <span className="section-eyebrow">
              GOVERNANCE AUDIT TRAIL
            </span>

            <h2>
              Approval History
            </h2>

            <p>
              A complete record of material standardization
              approval and rejection decisions.
            </p>

          </div>

          <span className="section-count">
            {unifiedAuditTrail.length} records
          </span>

        </div>

        {unifiedAuditTrail.length === 0 ? (

          <div className="empty-state">

            <div className="empty-state-icon">
              —
            </div>

            <h3>
              No governance actions yet
            </h3>

            <p>
              Approval and rejection decisions will appear here.
            </p>

          </div>

        ) : (

          <div className="audit-table-wrapper">

            <table className="audit-table">

              <thead>

                <tr>

                  <th>
                    Material
                  </th>

                  <th>
                    Action
                  </th>

                  <th>
                    Type
                  </th>

                  <th>
                    Details
                  </th>

                  <th>
                    Reviewer
                  </th>

                  <th>
                    Date
                  </th>

                </tr>

              </thead>

              <tbody>

                {unifiedAuditTrail.map((item) => (

                  <tr key={item.auditKey}>

                    <td>

                      <div className="audit-material">

                        <strong>
                          {item.displayMaterialCode}
                        </strong>

                        {item.displayDescription && (
                          <span>
                            {item.displayDescription}
                          </span>
                        )}

                      </div>

                    </td>

                    <td>

                      {item.action === "APPROVED" ? (

                        <span className="audit-action approved">
                          APPROVED
                        </span>

                      ) : (

                        <span className="audit-action rejected">
                          REJECTED
                        </span>

                      )}

                    </td>

                    <td>

                      <span className="audit-type">
                        {item.governanceType}
                      </span>

                    </td>

                    <td>

                      <div className="audit-details">

                        {item.displayLegacyCode &&
                        item.displayLegacyCode !== "—" && (
                          <span>
                            {item.displayLegacyCode}
                            {" → "}
                            {item.commonMaterialCode}
                          </span>
                        )}

                      </div>

                    </td>

                    <td>

                      <span className="audit-reviewer">
                        {item.reviewedBy ||
                          "Admin"}
                      </span>

                    </td>

                    <td>

                      <span className="audit-date">
                        {formatDate(
                          item.reviewedAt
                        )}
                      </span>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        )}

      </section>

    </div>
  );
};

export default Approvals;