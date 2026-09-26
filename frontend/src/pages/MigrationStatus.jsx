import React, { useEffect, useState } from "react";
import {
  RefreshCw,
  CheckCircle2,
  Clock3,
  Database,
  ArrowRight,
  PackageCheck,
} from "lucide-react";
import "./MigrationStatus.css";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8080/api";
const MigrationStatus = () => {
  const [allMappings, setAllMappings] = useState([]);
  const [approvedMappings, setApprovedMappings] = useState([]);
  const [suggestedMappings, setSuggestedMappings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadMigrationData = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const [
        allResponse,
        approvedResponse,
        suggestedResponse,
      ] = await Promise.all([
        fetch(`${API_URL}/cpse-mappings`),
        fetch(`${API_URL}/cpse-mappings/status/APPROVED`),
        fetch(`${API_URL}/cpse-mappings/status/AI_SUGGESTED`),
      ]);

      if (!allResponse.ok) {
        throw new Error("Failed to load mappings.");
      }

      const allData = await allResponse.json();

      const approvedData = approvedResponse.ok
        ? await approvedResponse.json()
        : [];

      const suggestedData = suggestedResponse.ok
        ? await suggestedResponse.json()
        : [];

      setAllMappings(
        Array.isArray(allData) ? allData : []
      );

      setApprovedMappings(
        Array.isArray(approvedData)
          ? approvedData
          : []
      );

      setSuggestedMappings(
        Array.isArray(suggestedData)
          ? suggestedData
          : []
      );
    } catch (err) {
      console.error("Migration status error:", err);

      setError(
        err.message ||
          "Unable to load migration status."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadMigrationData();
  }, []);

  const getValue = (value) => {
    if (
      value === null ||
      value === undefined ||
      String(value).trim() === ""
    ) {
      return "—";
    }

    return value;
  };

  const getConfidenceClass = (confidence) => {
    const value = Number(confidence);

    if (value >= 90) {
      return "confidence-high";
    }

    if (value >= 70) {
      return "confidence-medium";
    }

    return "confidence-low";
  };

  return (
    <div className="migration-page">

      {/* ERROR */}
      {error && (
        <div className="migration-alert migration-error">
          {error}
        </div>
      )}

      {/* SUMMARY CARDS */}
      <div className="migration-summary-grid">

        <div className="migration-stat-card">
          <div className="migration-stat-icon green">
            <CheckCircle2 size={22} />
          </div>

          <div>
            <span>Ready for Migration</span>

            <strong>
              {approvedMappings.length}
            </strong>

            <small>
              Approved mappings
            </small>
          </div>
        </div>

        <div className="migration-stat-card">
          <div className="migration-stat-icon yellow">
            <Clock3 size={22} />
          </div>

          <div>
            <span>AI Suggested</span>

            <strong>
              {suggestedMappings.length}
            </strong>

            <small>
              Waiting for review
            </small>
          </div>
        </div>

        <div className="migration-stat-card">
          <div className="migration-stat-icon blue">
            <Database size={22} />
          </div>

          <div>
            <span>Total Mappings</span>

            <strong>
              {allMappings.length}
            </strong>

            <small>
              All CPSE mappings
            </small>
          </div>
        </div>

      </div>

      {/* MIGRATION PIPELINE */}
      <section className="migration-section">

        <div className="migration-section-header">

          <div>
            <h2>
              <PackageCheck size={20} />
              Migration Pipeline
            </h2>

            <p>
              Only approved mappings are ready for migration.
            </p>
          </div>

          <div className="migration-ready-badge">
            <CheckCircle2 size={15} />
            {approvedMappings.length} Ready
          </div>

        </div>

        {/* LOADING */}
        {loading ? (
          <div className="migration-empty">

            <RefreshCw
              size={28}
              className="migration-spin"
            />

            <h3>
              Loading migration data...
            </h3>

            <p>
              Fetching approved CPSE mappings.
            </p>

          </div>

        ) : approvedMappings.length === 0 ? (

          /* EMPTY */
          <div className="migration-empty">

            <div className="migration-empty-icon">
              <PackageCheck size={28} />
            </div>

            <h3>
              No mappings ready for migration
            </h3>

            <p>
              Approved CPSE mappings will appear here
              once they are reviewed and approved.
            </p>

          </div>

        ) : (

          /* TABLE */
          <div className="migration-table-wrapper">

            <table className="migration-table">

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

                {approvedMappings.map((mapping) => (

                  <tr key={mapping.id}>

                    {/* CPSE */}
                    <td>
                      <div className="migration-cpse">

                        <div className="migration-cpse-icon">
                          {String(
                            getValue(mapping.cpseName)
                          )
                            .charAt(0)
                            .toUpperCase()}
                        </div>

                        <span>
                          {getValue(mapping.cpseName)}
                        </span>

                      </div>
                    </td>

                    {/* LEGACY CODE */}
                    <td>
                      <span className="migration-code">
                        {getValue(
                          mapping.legacyMaterialCode
                        )}
                      </span>
                    </td>

                    {/* DESCRIPTION */}
                    <td>
                      <div className="migration-description">
                        {getValue(
                          mapping.legacyDescription
                        )}
                      </div>
                    </td>

                    {/* NATIONAL CODE */}
                    <td>
                      <div className="migration-national-code">

                        <span>
                          {getValue(
                            mapping.commonMaterialCode
                          )}
                        </span>

                        <ArrowRight size={14} />

                      </div>
                    </td>

                    {/* CONFIDENCE */}
                    <td>
                      <span
                        className={`migration-confidence ${getConfidenceClass(
                          mapping.matchConfidence
                        )}`}
                      >
                        {mapping.matchConfidence !== null &&
                        mapping.matchConfidence !== undefined
                          ? `${mapping.matchConfidence}%`
                          : "—"}
                      </span>
                    </td>

                    {/* STATUS */}
                    <td>
                      <span className="migration-status-badge">
                        <CheckCircle2 size={14} />
                        READY
                      </span>
                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>
        )}

      </section>

      {/* PIPELINE INFO */}
      <div className="migration-info">

        <div className="migration-info-icon">
          <CheckCircle2 size={19} />
        </div>

        <div>

          <strong>
            Migration readiness rule
          </strong>

          <p>
            Only mappings with <b>APPROVED</b> status are
            included in the migration pipeline. AI-suggested
            mappings remain pending until reviewed by an
            authorized reviewer.
          </p>

        </div>

      </div>

    </div>
  );
};

export default MigrationStatus;