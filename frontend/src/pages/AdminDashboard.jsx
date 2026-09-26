import { useEffect, useState } from "react";

import {
  LayoutDashboard,
  Database,
  CopyCheck,
  ShieldCheck,
  Building2,
  Bell,
  Search,
  ArrowUpRight,
  Clock3,
  CheckCircle2,
  BrainCircuit,
} from "lucide-react";

import {
  getMaterials,
  getDuplicateGroups,
  getPendingApprovals,
} from "../services/api";

import Materials from "./Materials";
import Duplicates from "./Duplicates";
import Approvals from "./Approvals";
import CpseMapping from "./CpseMapping";

import "./AdminDashboard.css";

const AdminDashboard = () => {
  const [activePage, setActivePage] = useState("dashboard");

  const [materials, setMaterials] = useState([]);
  const [duplicateGroups, setDuplicateGroups] = useState([]);
  const [pendingApprovals, setPendingApprovals] = useState([]);

  const [loading, setLoading] = useState(true);

  // =========================================================
  // SEARCH
  // =========================================================

  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);

  // =========================================================
  // LOAD DASHBOARD DATA
  // =========================================================

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      const [
        materialsResponse,
        duplicatesResponse,
        approvalsResponse,
      ] = await Promise.all([
        getMaterials(),
        getDuplicateGroups(),
        getPendingApprovals(),
      ]);

      setMaterials(
        Array.isArray(materialsResponse.data)
          ? materialsResponse.data
          : []
      );

      setDuplicateGroups(
        Array.isArray(duplicatesResponse.data)
          ? duplicatesResponse.data
          : []
      );

      setPendingApprovals(
        Array.isArray(approvalsResponse.data)
          ? approvalsResponse.data
          : []
      );
    } catch (error) {
      console.error(
        "Failed to load admin dashboard data:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // =========================================================
  // PAGE TITLES
  // =========================================================

  const pageTitles = {
    dashboard: "Dashboard",
    materials: "Materials",
    duplicates: "Duplicates",
    approvals: "Approvals",
    cpseMapping: "CPSE Mapping",
  };

  // =========================================================
  // LOGOUT
  // =========================================================

  const handleLogout = () => {
    localStorage.removeItem("role");
    localStorage.removeItem("user");
    window.location.reload();
  };

  // =========================================================
  // DASHBOARD COUNTS
  // =========================================================

  const totalMaterials = materials.length;

  const cpseNames = [
    ...new Set(
      materials
        .map((material) => material.cpseName)
        .filter(
          (name) =>
            name &&
            String(name).trim() !== ""
        )
        .map((name) =>
          String(name).trim().toUpperCase()
        )
    ),
  ];

  const totalCPSEs = cpseNames.length;

  const totalDuplicateGroups =
    duplicateGroups.length;

  const totalPendingApprovals =
    pendingApprovals.length;

  // =========================================================
  // AVERAGE AI CONFIDENCE
  // =========================================================

  const aiConfidenceValues = [];

  duplicateGroups.forEach((group) => {
    if (Array.isArray(group.matchingPairs)) {
      group.matchingPairs.forEach((pair) => {
        const similarity = Number(
          pair.similarity
        );

        if (
          !Number.isNaN(similarity) &&
          similarity > 0
        ) {
          aiConfidenceValues.push(similarity);
        }
      });
    }
  });
  console.log(
  "Duplicate Groups:",
  JSON.stringify(duplicateGroups, null, 2)
  );

  console.log(
  "AI Confidence Values:",
  JSON.stringify(aiConfidenceValues)
  );
  const averageAIConfidence =
    aiConfidenceValues.length > 0
      ? (
          aiConfidenceValues.reduce(
            (sum, value) => sum + value,
            0
          ) / aiConfidenceValues.length
        ).toFixed(2)
      : "0.00";

  // =========================================================
  // SEARCH RESULTS
  // =========================================================

  const filteredSearchMaterials =
    searchQuery.trim()
      ? materials
          .filter((material) => {
            const query =
              searchQuery.toLowerCase().trim();

            const materialCode =
              material.materialCode?.toLowerCase() ||
              "";

            const description =
              material.description?.toLowerCase() ||
              "";

            const cpseName =
              material.cpseName?.toLowerCase() ||
              "";

            return (
              materialCode.includes(query) ||
              description.includes(query) ||
              cpseName.includes(query)
            );
          })
          .slice(0, 6)
      : [];

  const handleSearchChange = (event) => {
    const value = event.target.value;

    setSearchQuery(value);

    setShowSearchResults(
      value.trim().length > 0
    );
  };

  const handleSearchResultClick = () => {
    setActivePage("materials");
    setShowSearchResults(false);
  };

  const handleSearchKeyDown = (event) => {
    if (
      event.key === "Enter" &&
      searchQuery.trim()
    ) {
      setActivePage("materials");
      setShowSearchResults(false);
    }

    if (event.key === "Escape") {
      setShowSearchResults(false);
    }
  };

  // =========================================================
  // SIDEBAR
  // =========================================================

  const renderSidebar = () => (
    <aside className="admin-sidebar">

      {/* BRAND */}
      <div className="sidebar-brand">

        <div className="sidebar-logo">
          <ShieldCheck size={21} />
        </div>

        <div className="sidebar-brand-text">
          <h2>MaterialAI</h2>
          <span>ADMIN PORTAL</span>
        </div>

      </div>

      {/* NAVIGATION */}
      <nav className="sidebar-navigation">

        {/* PLATFORM */}
        <div className="sidebar-section">

          <p className="sidebar-label">
            PLATFORM
          </p>

          <button
            type="button"
            className={`sidebar-item ${
              activePage === "dashboard"
                ? "active"
                : ""
            }`}
            onClick={() =>
              setActivePage("dashboard")
            }
          >
            <LayoutDashboard size={16} />
            <span>Dashboard</span>
          </button>

          <button
            type="button"
            className={`sidebar-item ${
              activePage === "materials"
                ? "active"
                : ""
            }`}
            onClick={() =>
              setActivePage("materials")
            }
          >
            <Database size={16} />
            <span>Materials</span>
          </button>

          <button
            type="button"
            className={`sidebar-item ${
              activePage === "duplicates"
                ? "active"
                : ""
            }`}
            onClick={() =>
              setActivePage("duplicates")
            }
          >
            <CopyCheck size={16} />
            <span>Duplicates</span>
          </button>

        </div>

        {/* GOVERNANCE */}
        <div className="sidebar-section">

          <p className="sidebar-label">
            GOVERNANCE
          </p>

          <button
            type="button"
            className={`sidebar-item ${
              activePage === "approvals"
                ? "active"
                : ""
            }`}
            onClick={() =>
              setActivePage("approvals")
            }
          >
            <ShieldCheck size={16} />

            <span>Approvals</span>

            {pendingApprovals.length > 0 && (
              <span
                className="pending-count"
                style={{
                  marginLeft: "auto",
                }}
              >
                {pendingApprovals.length}
              </span>
            )}
          </button>

          <button
            type="button"
            className={`sidebar-item ${
              activePage === "cpseMapping"
                ? "active"
                : ""
            }`}
            onClick={() =>
              setActivePage("cpseMapping")
            }
          >
            <Building2 size={16} />
            <span>CPSE Mapping</span>
          </button>

        </div>

      </nav>

      {/* SIDEBAR BOTTOM */}
      <div className="sidebar-bottom">

        <div className="admin-profile">

          <div className="profile-avatar">
            AD
          </div>

          <div className="profile-info">
            <strong>Administrator</strong>
            <span>System Admin</span>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            style={{
              border: "none",
              background: "transparent",
              color: "#7486a3",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "4px",
            }}
            title="Logout"
          >
            <ArrowUpRight size={16} />
          </button>

        </div>

      </div>

    </aside>
  );

  // =========================================================
  // TOP BAR
  // =========================================================

  const renderTopbar = () => (
    <header className="admin-topbar">

      <div className="topbar-title">

        <h1>
          {pageTitles[activePage]}
        </h1>

        <p>
          CPSE Material Standardization & Governance
        </p>

      </div>

      <div className="topbar-actions">

        {/* SEARCH */}
        <div
          className="search-box"
          style={{
            position: "relative",
          }}
        >

          <Search size={15} />

          <input
            type="text"
            placeholder="Search materials..."
            value={searchQuery}
            onChange={handleSearchChange}
            onFocus={() => {
              if (searchQuery.trim()) {
                setShowSearchResults(true);
              }
            }}
            onKeyDown={handleSearchKeyDown}
          />

          {showSearchResults &&
            searchQuery.trim() && (
              <div
                style={{
                  position: "absolute",
                  top: "calc(100% + 8px)",
                  right: 0,
                  width: "320px",
                  background: "#ffffff",
                  border: "1px solid #e1e7ef",
                  borderRadius: "10px",
                  boxShadow:
                    "0 12px 30px rgba(20, 40, 70, 0.12)",
                  zIndex: 1000,
                  overflow: "hidden",
                }}
              >

                {filteredSearchMaterials.length ===
                0 ? (

                  <div
                    style={{
                      padding: "16px",
                      color: "#7b8798",
                      fontSize: "12px",
                    }}
                  >
                    No materials found.
                  </div>

                ) : (

                  filteredSearchMaterials.map(
                    (material) => (
                      <button
                        key={material.id}
                        type="button"
                        onClick={
                          handleSearchResultClick
                        }
                        style={{
                          width: "100%",
                          display: "block",
                          textAlign: "left",
                          border: "none",
                          background: "#ffffff",
                          padding: "11px 13px",
                          cursor: "pointer",
                          borderBottom:
                            "1px solid #eef1f5",
                        }}
                      >

                        <strong
                          style={{
                            display: "block",
                            color: "#172033",
                            fontSize: "12px",
                            marginBottom: "3px",
                          }}
                        >
                          {material.materialCode}
                        </strong>

                        <span
                          style={{
                            display: "block",
                            color: "#7b8798",
                            fontSize: "10px",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {material.description}
                        </span>

                        {material.cpseName && (
                          <span
                            style={{
                              display: "block",
                              color: "#2563eb",
                              fontSize: "9px",
                              marginTop: "3px",
                            }}
                          >
                            {material.cpseName}
                          </span>
                        )}

                      </button>
                    )
                  )

                )}

              </div>
            )}

        </div>

        {/* NOTIFICATION */}
        <button
          type="button"
          className="notification-button"
          title={
            totalPendingApprovals > 0
              ? `${totalPendingApprovals} pending approval${
                  totalPendingApprovals > 1
                    ? "s"
                    : ""
                }`
              : "Open approval queue"
          }
          onClick={() =>
            setActivePage("approvals")
          }
        >

          <Bell size={17} />

          {totalPendingApprovals > 0 && (
            <span className="notification-dot" />
          )}

        </button>

      </div>

    </header>
  );

  // =========================================================
  // WELCOME HERO
  // =========================================================

  const renderWelcome = () => (
    <section className="dashboard-welcome">

      <div className="welcome-content">

        <span className="dashboard-eyebrow">
          MATERIALAI ADMINISTRATION
        </span>

        <h2>
          Material Standardization
          <span> Control Center</span>
        </h2>

        <p>
          Monitor material intelligence, review
          standardization proposals, manage CPSE
          mappings and oversee governance workflows.
        </p>

      </div>

      <div className="welcome-status">

        <span className="online-dot" />

        System Operational

      </div>

    </section>
  );

  // =========================================================
  // STAT CARDS
  // =========================================================

  const renderStats = () => (
    <div className="stats-grid">

      {/* TOTAL MATERIALS */}
      <div className="stat-card">

        <div className="stat-top">

          <div className="stat-icon blue">
            <Database size={18} />
          </div>

        </div>

        <p>Total Materials</p>

        <h3>
          {totalMaterials}
        </h3>

        <span className="stat-note">
          Materials in master database
        </span>

      </div>

      {/* CPSEs COVERED */}
      <div className="stat-card">

        <div className="stat-top">

          <div className="stat-icon green">
            <Building2 size={18} />
          </div>

        </div>

        <p>CPSEs Covered</p>

        <h3>
          {totalCPSEs}
        </h3>

        <span className="stat-note">
          Organizations in material master
        </span>

      </div>

      {/* PENDING APPROVALS */}
      <div className="stat-card">

        <div className="stat-top">

          <div className="stat-icon orange">
            <Clock3 size={18} />
          </div>

        </div>

        <p>Pending Approvals</p>

        <h3>
          {totalPendingApprovals}
        </h3>

        <span className="stat-note">
          Awaiting Admin review
        </span>

      </div>

      {/* AVG AI CONFIDENCE */}
      <div className="stat-card">

        <div className="stat-top">

          <div className="stat-icon purple">
            <BrainCircuit size={18} />
          </div>

        </div>

        <p>Avg. AI Confidence</p>

        <h3>
          {averageAIConfidence}%
        </h3>

        <span className="stat-note">
          Average similarity confidence
        </span>

      </div>

    </div>
  );

  // =========================================================
  // AI ACTIVITY
  // =========================================================

  const renderAIActivity = () => (
    <div className="dashboard-card">

      <div className="card-header">

        <div>

          <h3>
            AI Matching Activity
          </h3>

          <p>
            Recent material intelligence activity
          </p>

        </div>

        <button
          type="button"
          className="view-button"
          onClick={() =>
            setActivePage("duplicates")
          }
        >
          View Details
          <ArrowUpRight size={13} />
        </button>

      </div>

      <div className="activity-list">

        {/* DUPLICATE DETECTION */}
        <div className="activity-row">

          <div className="activity-icon blue">
            <BrainCircuit size={15} />
          </div>

          <div className="activity-content">

            <strong>
              AI duplicate detection
            </strong>

            <span>
              {duplicateGroups.length} duplicate
              groups detected
            </span>

          </div>

          <span className="activity-score high">
            Active
          </span>

        </div>

        {/* MATERIAL MATCHING */}
        <div className="activity-row">

          <div className="activity-icon green">
            <CheckCircle2 size={15} />
          </div>

          <div className="activity-content">

            <strong>
              Material matching engine
            </strong>

            <span>
              AI matching service operational
            </span>

          </div>

          <span className="activity-score high">
            Ready
          </span>

        </div>

        {/* APPROVAL WORKFLOW */}
        <div className="activity-row">

          <div className="activity-icon orange">
            <Clock3 size={15} />
          </div>

          <div className="activity-content">

            <strong>
              Approval workflow
            </strong>

            <span>
              {pendingApprovals.length} proposals
              awaiting review
            </span>

          </div>

          <span
            className={`activity-score ${
              pendingApprovals.length > 0
                ? "warning"
                : "high"
            }`}
          >
            {pendingApprovals.length > 0
              ? "Pending"
              : "Clear"}
          </span>

        </div>

      </div>

    </div>
  );

  // =========================================================
  // APPROVAL QUEUE
  // =========================================================

  const renderApprovalQueue = () => (
    <div className="dashboard-card">

      <div className="card-header">

        <div>

          <h3>
            Approval Queue
          </h3>

          <p>
            Standardization proposals awaiting review
          </p>

        </div>

        <div className="pending-count">
          {pendingApprovals.length}
        </div>

      </div>

      {pendingApprovals.length === 0 ? (

        <div
          style={{
            padding: "25px 10px",
            textAlign: "center",
            color: "#8995a7",
          }}
        >

          <CheckCircle2
            size={28}
            style={{
              color: "#16a34a",
              marginBottom: "8px",
            }}
          />

          <div
            style={{
              color: "#253149",
              fontSize: "11px",
              fontWeight: 600,
            }}
          >
            All approvals cleared
          </div>

          <div
            style={{
              marginTop: "4px",
              fontSize: "9px",
            }}
          >
            No proposals are waiting for review.
          </div>

        </div>

      ) : (

        <div className="approval-list">

          {pendingApprovals
            .slice(0, 4)
            .map((item) => (

              <div
                className="approval-item"
                key={item.id}
              >

                <div className="approval-icon">
                  <Clock3 size={14} />
                </div>

                <div
                  style={{
                    flex: 1,
                    minWidth: 0,
                  }}
                >

                  <strong>
                    {item.commonMaterialCode ||
                      "Pending Proposal"}
                  </strong>

                  <span>
                    {item.standardizedDescription ||
                      "Standardization proposal"}
                  </span>

                </div>

              </div>

            ))}

          <button
            type="button"
            className="full-button"
            onClick={() =>
              setActivePage("approvals")
            }
          >
            Review Approval Queue
            <ArrowUpRight size={13} />
          </button>

        </div>

      )}

    </div>
  );

  // =========================================================
  // DUPLICATE SUMMARY
  // =========================================================

  const renderDuplicateSummary = () => (
    <div className="dashboard-card">

      <div className="card-header">

        <div>

          <h3>
            Duplicate Detection
          </h3>

          <p>
            AI identified material groups
          </p>

        </div>

        <button
          type="button"
          className="view-button"
          onClick={() =>
            setActivePage("duplicates")
          }
        >
          Explore
          <ArrowUpRight size={13} />
        </button>

      </div>

      <div className="duplicate-summary">

        <div className="duplicate-number">
          {duplicateGroups.length}
        </div>

        <div>

          <strong>
            Duplicate groups detected
          </strong>

          <span>
            Materials with similar descriptions,
            specifications or characteristics.
          </span>

        </div>

      </div>

      <div className="progress-bar">

        <div
          className="progress-value"
          style={{
            width:
              totalMaterials > 0
                ? `${Math.min(
                    (
                      duplicateGroups.length /
                      totalMaterials
                    ) * 100,
                    100
                  )}%`
                : "0%",
          }}
        />

      </div>

      <span className="progress-label">
        AI duplicate detection coverage
      </span>

    </div>
  );

  // =========================================================
  // CPSE COVERAGE
  // =========================================================

  const renderCPSECoverage = () => (
    <div className="dashboard-card">

      <div className="card-header">

        <div>

          <h3>
            CPSE Coverage
          </h3>

          <p>
            Material master coverage
          </p>

        </div>

        <button
          type="button"
          className="view-button"
          onClick={() =>
            setActivePage("cpseMapping")
          }
        >
          View Mapping
          <ArrowUpRight size={13} />
        </button>

      </div>

      {/* ONLY CPSE LIST */}
      <div className="cpse-coverage-content">

        <span className="cpse-row-label">
          CPSEs Covered
        </span>

        <div className="cpse-name-list">

          {cpseNames.length > 0 ? (

            cpseNames.map((name) => (

              <div
                key={name}
                className="cpse-name"
              >
                {name}
              </div>

            ))

          ) : (

            <span className="cpse-no-data">
              No CPSE data available
            </span>

          )}

        </div>

      </div>

    </div>
  );

  // =========================================================
  // DASHBOARD
  // =========================================================

  const renderDashboard = () => (
    <>

      {renderWelcome()}

      {renderStats()}

      <div className="dashboard-grid">

        {renderAIActivity()}

        {renderApprovalQueue()}

      </div>

      <div className="dashboard-grid bottom-grid">

        {renderDuplicateSummary()}

        {renderCPSECoverage()}

      </div>

    </>
  );

  // =========================================================
  // PAGE CONTENT
  // =========================================================

  const renderContent = () => {

    if (
      loading &&
      activePage === "dashboard"
    ) {

      return (
        <div
          style={{
            padding: "60px",
            textAlign: "center",
            color: "#78869a",
          }}
        >

          <Clock3
            size={28}
            style={{
              marginBottom: "10px",
            }}
          />

          <div>
            Loading dashboard...
          </div>

        </div>
      );
    }

    switch (activePage) {

      case "materials":
        return <Materials />;

      case "duplicates":
        return <Duplicates />;

      case "approvals":
        return (
         <Approvals
         onPendingCountChange={setPendingApprovals}/>
         );

      case "cpseMapping":
        return <CpseMapping />;

      case "dashboard":
      default:
        return renderDashboard();

    }
  };

  // =========================================================
  // MAIN LAYOUT
  // =========================================================

  return (
    <div className="admin-dashboard">

      {/* SIDEBAR */}
      {renderSidebar()}

      {/* MAIN */}
      <main className="admin-main">

        {renderTopbar()}

        <div className="dashboard-content">
          {renderContent()}
        </div>

      </main>

    </div>
  );
};

export default AdminDashboard;