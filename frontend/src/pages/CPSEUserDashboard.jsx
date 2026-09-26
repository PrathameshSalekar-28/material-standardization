import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  LayoutDashboard,
  Package,
  FileCheck,
  GitBranch,
  ArrowRightLeft,
  LogOut,
  Clock3,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Upload,
  FileSpreadsheet,
  ShieldCheck,
  Sparkles,
  AlertCircle,
} from "lucide-react";

import axios from "axios";

import Standardize from "./Standardize";
import MigrationStatus from "./MigrationStatus";
import MyMaterials from "./MyMaterials";

import "./CPSEUserDashboard.css";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8080/api";

const CPSEUserDashboard = () => {
  const [currentPage, setCurrentPage] = useState("dashboard");

  const [materials, setMaterials] = useState([]);
  const [standardizedMaterials, setStandardizedMaterials] = useState([]);
  const [mappings, setMappings] = useState([]);

  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const fileInputRef = useRef(null);

  // =====================================================
  // LOAD MATERIALS
  // =====================================================

  const loadMaterials = async () => {
    try {
      const response = await axios.get(`${API_URL}/materials`);

      setMaterials(
        Array.isArray(response.data)
          ? response.data
          : []
      );
    } catch (err) {
      console.error(err);
      setError("Unable to load materials.");
    }
  };

  // =====================================================
  // LOAD STANDARDIZED MATERIALS
  // =====================================================

  const loadStandardizedMaterials = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/standardized-materials`
      );

      setStandardizedMaterials(
        Array.isArray(response.data)
          ? response.data
          : []
      );
    } catch (err) {
      console.error(err);
    }
  };

  // =====================================================
  // LOAD CPSE MAPPINGS
  // =====================================================

  const loadMappings = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/cpse-mappings`
      );

      setMappings(
        Array.isArray(response.data)
          ? response.data
          : []
      );
    } catch (err) {
      console.error(err);
    }
  };

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);

      await Promise.all([
        loadMaterials(),
        loadStandardizedMaterials(),
        loadMappings(),
      ]);

      setLoading(false);
    };

    loadData();
  }, []);

  // =====================================================
  // REFRESH
  // =====================================================

  const handleRefresh = async () => {
    setMessage("");
    setError("");
    setLoading(true);

    await Promise.all([
      loadMaterials(),
      loadStandardizedMaterials(),
      loadMappings(),
    ]);

    setLoading(false);
  };

  // =====================================================
  // UPLOAD
  // =====================================================

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    setUploading(true);
    setMessage("");
    setError("");

    try {
      const formData = new FormData();

      formData.append("file", file);

      const response = await axios.post(
        `${API_URL}/materials/upload`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setMessage(
        response.data?.message ||
          "Materials uploaded successfully."
      );

      await loadMaterials();
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          "Failed to upload materials."
      );
    } finally {
      setUploading(false);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // =====================================================
  // LOGOUT
  // =====================================================

  const handleLogout = () => {
    localStorage.removeItem("role");
    localStorage.removeItem("user");

    window.location.reload();
  };

  // =====================================================
  // COUNTS
  // =====================================================

  const approvedStandardizedMaterials =
    standardizedMaterials.filter(
      (item) => item.status === "APPROVED"
    );

  const pendingStandardizedMaterials =
    standardizedMaterials.filter(
      (item) => item.status === "PENDING_REVIEW"
    );

  const rejectedStandardizedMaterials =
    standardizedMaterials.filter(
      (item) => item.status === "REJECTED"
    );

  const aiSuggestedMappings = mappings.filter(
    (mapping) => mapping.status === "AI_SUGGESTED"
  );

  const approvedMappings = mappings.filter(
    (mapping) => mapping.status === "APPROVED"
  );

  // =====================================================
  // RECENT MATERIALS
  // =====================================================

  const recentMaterials = useMemo(() => {
    return [...materials]
      .sort(
        (a, b) =>
          Number(b.id || 0) - Number(a.id || 0)
      )
      .slice(0, 5);
  }, [materials]);

  // =====================================================
  // MATERIAL STATUS
  // =====================================================

  const renderMaterialStatus = (status) => {
    if (status === "APPROVED") {
      return (
        <span className="cpse-status approved">
          <CheckCircle2 size={12} />
          Approved
        </span>
      );
    }

    if (status === "REJECTED") {
      return (
        <span className="cpse-status rejected">
          <XCircle size={12} />
          Rejected
        </span>
      );
    }

    return (
      <span className="cpse-status pending">
        <Clock3 size={12} />
        Pending
      </span>
    );
  };

  // =====================================================
  // MAPPING STATUS
  // =====================================================

  const renderMappingStatus = (status) => {
    if (status === "AI_SUGGESTED") {
      return (
        <span className="cpse-status pending">
          <Sparkles size={12} />
          AI Suggested
        </span>
      );
    }

    if (status === "APPROVED") {
      return (
        <span className="cpse-status approved">
          <CheckCircle2 size={12} />
          Approved
        </span>
      );
    }

    return (
      <span className="cpse-status rejected">
        <XCircle size={12} />
        Rejected
      </span>
    );
  };

  // =====================================================
  // SIDEBAR
  // =====================================================

  const renderSidebar = () => (
    <aside className="cpse-sidebar">

      <div className="cpse-brand">

        <div className="cpse-brand-icon">
          <ShieldCheck size={21} />
        </div>

        <div>
          <h2>MaterialAI</h2>
          <span>CPSE USER PORTAL</span>
        </div>

      </div>

      <nav className="cpse-nav">

        {/* MATERIALS */}

        <div className="cpse-nav-section">
          MATERIALS
        </div>

        <button
          className={`cpse-nav-item ${
            currentPage === "dashboard"
              ? "active"
              : ""
          }`}
          onClick={() =>
            setCurrentPage("dashboard")
          }
        >
          <LayoutDashboard size={16} />
          <span>Dashboard</span>
        </button>

        <button
          className={`cpse-nav-item ${
            currentPage === "my-materials"
              ? "active"
              : ""
          }`}
          onClick={() =>
            setCurrentPage("my-materials")
          }
        >
          <Package size={16} />
          <span>My Materials</span>
        </button>

        {/* STANDARDIZATION */}

        <div className="cpse-nav-section">
          STANDARDIZATION
        </div>

        <button
          className={`cpse-nav-item ${
            currentPage === "standardized-codes"
              ? "active"
              : ""
          }`}
          onClick={() =>
            setCurrentPage("standardized-codes")
          }
        >
          <FileCheck size={16} />
          <span>Standardized Codes</span>
        </button>

        <button
          className={`cpse-nav-item ${
            currentPage === "cpse-mappings"
              ? "active"
              : ""
          }`}
          onClick={() =>
            setCurrentPage("cpse-mappings")
          }
        >
          <GitBranch size={16} />
          <span>CPSE Mappings</span>
        </button>

        {/* MIGRATION */}

        <div className="cpse-nav-section">
          MIGRATION
        </div>

        <button
          className={`cpse-nav-item ${
            currentPage === "migration"
              ? "active"
              : ""
          }`}
          onClick={() =>
            setCurrentPage("migration")
          }
        >
          <ArrowRightLeft size={16} />
          <span>Migration Status</span>
        </button>

      </nav>

      <button
        className="cpse-logout"
        onClick={handleLogout}
      >
        <LogOut size={16} />
        <span>Logout</span>
      </button>

    </aside>
  );

  // =====================================================
  // HEADER
  // =====================================================

  const pageTitle = {
    dashboard: "Dashboard",
    "my-materials": "My Materials",
    "standardized-codes": "Standardized Codes",
    "cpse-mappings": "CPSE Mappings",
    migration: "Migration Status",
  };

  const renderHeader = () => (
    <header className="cpse-header">

      <div>

        <p className="cpse-eyebrow">
          CPSE MATERIAL STANDARDIZATION
        </p>

        <h1>
          {pageTitle[currentPage]}
        </h1>

      </div>

      <div className="cpse-user-info">

        <div className="cpse-avatar">
          CP
        </div>

        <div>
          <strong>CPSE User</strong>
          <span>Material Management</span>
        </div>

      </div>

    </header>
  );

  // =====================================================
// ALERT
// =====================================================

const renderAlert = () => {
  // Show upload/error message only on Dashboard
  if (currentPage !== "dashboard") {
    return null;
  }

  if (!message && !error) {
    return null;
  }

  return (
    <div
      className={`cpse-alert ${
        error ? "error" : "success"
      }`}
    >
      {error ? (
        <AlertCircle size={16} />
      ) : (
        <CheckCircle2 size={16} />
      )}

      <span>
        {error || message}
      </span>
    </div>
  );
};

  // =====================================================
  // DASHBOARD
  // =====================================================

  const renderDashboard = () => (
    <>

      <div className="cpse-summary-grid">

        <div className="cpse-stat-card">

          <div className="cpse-stat-icon blue">
            <Package size={20} />
          </div>

          <div>
            <span>Total Materials</span>

            <strong>
              {materials.length}
            </strong>
          </div>

        </div>

        <div className="cpse-stat-card">

          <div className="cpse-stat-icon yellow">
            <Clock3 size={20} />
          </div>

          <div>
            <span>Pending Review</span>

            <strong>
              {pendingStandardizedMaterials.length}
            </strong>
          </div>

        </div>

        <div className="cpse-stat-card">

          <div className="cpse-stat-icon green">
            <CheckCircle2 size={20} />
          </div>

          <div>
            <span>Approved Codes</span>

            <strong>
              {approvedStandardizedMaterials.length}
            </strong>
          </div>

        </div>

        <div className="cpse-stat-card">

          <div className="cpse-stat-icon blue">
            <GitBranch size={20} />
          </div>

          <div>
            <span>CPSE Mappings</span>

            <strong>
              {mappings.length}
            </strong>
          </div>

        </div>

      </div>

      <div className="cpse-upload-section">

        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleFileUpload}
          hidden
        />

        <div
          className="cpse-upload-box"
          onClick={handleUploadClick}
        >

          <div className="cpse-upload-icon">
            <FileSpreadsheet size={34} />
          </div>

          <h2>
            Upload Material Master
          </h2>

          <p>
            Upload your CPSE material master CSV
            to add materials to the platform.
          </p>

          <span>
            Supported format: CSV
          </span>

          <button
            className="cpse-upload-materials-btn"
            onClick={(event) => {
              event.stopPropagation();
              handleUploadClick();
            }}
            disabled={uploading}
          >
            <Upload size={16} />

            {uploading
              ? "Uploading..."
              : "Upload Materials"}
          </button>

        </div>

      </div>

      <div className="cpse-section">

        <div className="cpse-section-header">

          <div>
            <h2>
              Recent Materials
            </h2>

            <p>
              Latest materials added to the system
            </p>
          </div>

          <button
            className="cpse-outline-button"
            onClick={() =>
              setCurrentPage("my-materials")
            }
          >
            View All
          </button>

        </div>

        {recentMaterials.length === 0 ? (

          <div className="cpse-empty">

            <Package size={28} />

            <h3>
              No materials found
            </h3>

            <p>
              Upload a material master CSV to get started.
            </p>

          </div>

        ) : (

          <div className="cpse-table-wrapper">

            <table className="cpse-table">

              <thead>
                <tr>
                  <th>Material Code</th>
                  <th>Description</th>
                  <th>Type</th>
                  <th>Group</th>
                  <th>CPSE</th>
                </tr>
              </thead>

              <tbody>

                {recentMaterials.map(
                  (material) => (
                    <tr key={material.id}>

                      <td>
                        <strong>
                          {material.materialCode}
                        </strong>
                      </td>

                      <td>
                        {material.description}
                      </td>

                      <td>
                        {material.materialType || "-"}
                      </td>

                      <td>
                        {material.materialGroup || "-"}
                      </td>

                      <td>
                        {material.cpseName || "-"}
                      </td>

                    </tr>
                  )
                )}

              </tbody>

            </table>

          </div>

        )}

      </div>

    </>
  );

  // =====================================================
  // MY MATERIALS
  // =====================================================

  const renderMyMaterials = () => (
    <MyMaterials />
  );

  // =====================================================
  // STANDARDIZED CODES
  // =====================================================

  const renderStandardizedCodes = () => (
    <>

      <div className="cpse-materials-toolbar">

        <div className="cpse-materials-toolbar-content">

          <h2>
            Approved Standardized Codes
          </h2>

          <p>
            Only Admin/Reviewer approved codes are
            displayed here.
          </p>

        </div>

        <div className="cpse-materials-toolbar-actions">

          <button
            className="cpse-outline-button"
            onClick={handleRefresh}
            disabled={loading}
          >
            <RefreshCw
              size={14}
              className={
                loading
                  ? "cpse-spin"
                  : ""
              }
            />

            Refresh
          </button>

        </div>

      </div>

      <div className="cpse-section">

        <div className="cpse-section-header">

          <div>

            <h2>
              National Material Codes
            </h2>

            <p>
              Verified standardized materials
            </p>

          </div>

        </div>

        {approvedStandardizedMaterials.length === 0 ? (

          <div className="cpse-empty">

            <FileCheck size={28} />

            <h3>
              No approved standardized codes
            </h3>

            <p>
              Codes appear here after Admin approval.
            </p>

          </div>

        ) : (

          <div className="cpse-table-wrapper">

            <table className="cpse-table">

              <thead>

                <tr>
                  <th>National Code</th>
                  <th>Description</th>
                  <th>Type</th>
                  <th>Group</th>
                  <th>Grade</th>
                  <th>Size</th>
                  <th>Standard</th>
                  <th>Reviewed By</th>
                  <th>Status</th>
                </tr>

              </thead>

              <tbody>

                {approvedStandardizedMaterials.map(
                  (item) => (
                    <tr key={item.id}>

                      <td>
                        <strong>
                          {item.commonMaterialCode}
                        </strong>
                      </td>

                      <td>
                        {item.standardizedDescription}
                      </td>

                      <td>
                        {item.materialType || "-"}
                      </td>

                      <td>
                        {item.materialGroup || "-"}
                      </td>

                      <td>
                        {item.grade || "-"}
                      </td>

                      <td>
                        {item.size || "-"}
                      </td>

                      <td>
                        {item.standard || "-"}
                      </td>

                      <td>
                        {item.reviewedBy || "-"}
                      </td>

                      <td>
                        {renderMaterialStatus(
                          item.status
                        )}
                      </td>

                    </tr>
                  )
                )}

              </tbody>

            </table>

          </div>

        )}

      </div>

    </>
  );

  // =====================================================
  // CPSE MAPPINGS
  // =====================================================

  const renderCpseMappings = () => (
    <>

      <div className="cpse-materials-toolbar">

        <div className="cpse-materials-toolbar-content">

          <h2>
            CPSE Mappings
          </h2>

          <p>
            Legacy CPSE codes mapped to national
            standardized codes.
          </p>

        </div>

        <div className="cpse-materials-toolbar-actions">

          <button
            className="cpse-outline-button"
            onClick={handleRefresh}
            disabled={loading}
          >
            <RefreshCw
              size={14}
              className={
                loading
                  ? "cpse-spin"
                  : ""
              }
            />

            Refresh
          </button>

        </div>

      </div>

      <div className="cpse-section">

        <div className="cpse-section-header">

          <div>

            <h2>
              Mapping Registry
            </h2>

            <p>
              AI suggested and approved mappings
            </p>

          </div>

        </div>

        {mappings.length === 0 ? (

          <div className="cpse-empty">

            <GitBranch size={28} />

            <h3>
              No CPSE mappings available
            </h3>

            <p>
              Mappings will be generated after
              standardization approval.
            </p>

          </div>

        ) : (

          <div className="cpse-table-wrapper">

            <table className="cpse-table">

              <thead>

                <tr>
                  <th>CPSE</th>
                  <th>Legacy Code</th>
                  <th>Legacy Description</th>
                  <th>National Code</th>
                  <th>Confidence</th>
                  <th>Status</th>
                </tr>

              </thead>

              <tbody>

                {mappings.map(
                  (mapping) => (
                    <tr key={mapping.id}>

                      <td>
                        {mapping.cpseName || "-"}
                      </td>

                      <td>
                        <strong>
                          {mapping.legacyMaterialCode}
                        </strong>
                      </td>

                      <td>
                        {mapping.legacyDescription}
                      </td>

                      <td>
                        {mapping.commonMaterialCode}
                      </td>

                      <td>
                        {mapping.matchConfidence != null
                          ? `${mapping.matchConfidence}%`
                          : "-"}
                      </td>

                      <td>
                        {renderMappingStatus(
                          mapping.status
                        )}
                      </td>

                    </tr>
                  )
                )}

              </tbody>

            </table>

          </div>

        )}

      </div>

    </>
  );

  // =====================================================
  // MIGRATION STATUS
  // =====================================================

  const renderMigrationStatus = () => (
    <MigrationStatus />
  );

  // =====================================================
  // CONTENT
  // =====================================================

  const renderContent = () => {

    if (
      loading &&
      materials.length === 0
    ) {
      return (
        <div className="cpse-empty">

          <RefreshCw
            size={28}
            className="cpse-spin"
          />

          <h3>
            Loading materials...
          </h3>

          <p>
            Please wait.
          </p>

        </div>
      );
    }

    switch (currentPage) {

      case "dashboard":
        return renderDashboard();

      case "my-materials":
        return renderMyMaterials();

      case "standardized-codes":
        return renderStandardizedCodes();

      case "cpse-mappings":
        return renderCpseMappings();

      case "migration":
        return renderMigrationStatus();

      default:
        return renderDashboard();
    }
  };

  // =====================================================
  // MAIN UI
  // =====================================================

  return (
    <div className="cpse-dashboard">

      {renderSidebar()}

      <main className="cpse-main">

        {/* SAME MAIN HEADER FOR ALL PAGES */}
        {renderHeader()}

        {renderAlert()}

        {renderContent()}

      </main>

    </div>
  );
};

export default CPSEUserDashboard;