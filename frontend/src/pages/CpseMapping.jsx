import React, { useEffect, useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import "./CpseMapping.css";

const API_URL =
    import.meta.env.VITE_API_URL || "http://localhost:8080/api";

const CpseMapping = () => {

    const [mappings, setMappings] = useState([]);
    const [loading, setLoading] = useState(true);

    const [searchTerm, setSearchTerm] = useState("");
    const [cpseFilter, setCpseFilter] = useState("ALL");
    const [statusFilter, setStatusFilter] = useState("ALL");

    const [selectedMapping, setSelectedMapping] = useState(null);
    const [showDetails, setShowDetails] = useState(false);
    const [showMigrationView, setShowMigrationView] = useState(false);

    const [processingId, setProcessingId] = useState(null);


    // =========================================================
    // FETCH AI SUGGESTED + APPROVED MAPPINGS
    // =========================================================

    const fetchMappings = async () => {

        try {

            setLoading(true);

            const [suggestedResponse, approvedResponse] =
                await Promise.all([
                    fetch(
                        `${API_URL}/cpse-mappings/status/AI_SUGGESTED`
                    ),
                    fetch(
                        `${API_URL}/cpse-mappings/status/APPROVED`
                    )
                ]);

            if (!suggestedResponse.ok) {
                throw new Error(
                    "Failed to fetch AI suggested mappings"
                );
            }

            if (!approvedResponse.ok) {
                throw new Error(
                    "Failed to fetch approved mappings"
                );
            }

            const suggestedData =
                await suggestedResponse.json();

            const approvedData =
                await approvedResponse.json();

            setMappings([
                ...(Array.isArray(suggestedData)
                    ? suggestedData
                    : []),
                ...(Array.isArray(approvedData)
                    ? approvedData
                    : [])
            ]);

        } catch (error) {

            console.error(
                "Error fetching CPSE mappings:",
                error
            );

            setMappings([]);

        } finally {

            setLoading(false);

        }
    };


    // =========================================================
    // INITIAL LOAD
    // =========================================================

    useEffect(() => {

        fetchMappings();

    }, []);


    // =========================================================
    // APPROVE AI SUGGESTED MAPPING
    // =========================================================

    const approveMapping = async (id) => {

        try {

            setProcessingId(id);

            const response = await fetch(
                `${API_URL}/cpse-mappings/by-id/${id}/approve?reviewer=Admin`,
                {
                    method: "POST"
                }
            );

            if (!response.ok) {
                throw new Error(
                    "Failed to approve mapping"
                );
            }

            await fetchMappings();

        } catch (error) {

            console.error(
                "Error approving mapping:",
                error
            );

            alert(
                "Failed to approve mapping."
            );

        } finally {

            setProcessingId(null);

        }
    };


    // =========================================================
    // REJECT AI SUGGESTED MAPPING
    // =========================================================

    const rejectMapping = async (id) => {

        try {

            setProcessingId(id);

            const response = await fetch(
                `${API_URL}/cpse-mappings/by-id/${id}/reject?reviewer=Admin`,
                {
                    method: "POST"
                }
            );

            if (!response.ok) {
                throw new Error(
                    "Failed to reject mapping"
                );
            }

            await fetchMappings();

        } catch (error) {

            console.error(
                "Error rejecting mapping:",
                error
            );

            alert(
                "Failed to reject mapping."
            );

        } finally {

            setProcessingId(null);

        }
    };


    // =========================================================
    // CPSE LIST
    // =========================================================

    const cpseList = [
        ...new Set(
            mappings
                .map(
                    (mapping) =>
                        mapping.cpseName
                )
                .filter(Boolean)
        )
    ];


    // =========================================================
    // MAPPING STATUS
    // =========================================================

    const getMappingStatus = (mapping) => {

        return mapping.status || "APPROVED";
    };


    // =========================================================
    // FILTER MAPPINGS
    // =========================================================

    const filteredMappings = mappings.filter(
        (mapping) => {

            const search =
                searchTerm
                    .trim()
                    .toLowerCase();


            const matchesSearch =
                !search ||

                mapping.cpseName
                    ?.toLowerCase()
                    .includes(search) ||

                mapping.legacyMaterialCode
                    ?.toLowerCase()
                    .includes(search) ||

                mapping.legacyDescription
                    ?.toLowerCase()
                    .includes(search) ||

                mapping.commonMaterialCode
                    ?.toLowerCase()
                    .includes(search);


            const matchesCpse =
                cpseFilter === "ALL" ||
                mapping.cpseName === cpseFilter;


            const mappingStatus =
                getMappingStatus(mapping);


            const matchesStatus =
                statusFilter === "ALL" ||
                mappingStatus === statusFilter;


            return (
                matchesSearch &&
                matchesCpse &&
                matchesStatus
            );
        }
    );


    // =========================================================
    // SEPARATE AI SUGGESTIONS
    // =========================================================

    const aiSuggestedMappings =
        filteredMappings.filter(
            (mapping) =>
                mapping.status === "AI_SUGGESTED"
        );


    // =========================================================
    // SEPARATE APPROVED MAPPINGS
    // =========================================================

    const approvedMappings =
        filteredMappings.filter(
            (mapping) =>
                mapping.status === "APPROVED"
        );


    // =========================================================
    // SUMMARY
    // =========================================================

    const approvedOnly =
        mappings.filter(
            (mapping) =>
                mapping.status === "APPROVED"
        );


    const totalMappings =
        approvedOnly.length;


    const totalCpse =
        new Set(
            approvedOnly.map(
                (mapping) =>
                    mapping.cpseName
            )
        ).size;


    const totalNationalCodes =
        new Set(
            approvedOnly
                .map(
                    (mapping) =>
                        mapping.commonMaterialCode
                )
                .filter(Boolean)
        ).size;


    const averageConfidence =
        approvedOnly.length > 0
            ? (
                approvedOnly.reduce(
                    (sum, mapping) =>
                        sum +
                        (
                            Number(
                                mapping.matchConfidence
                            ) || 0
                        ),
                    0
                ) / approvedOnly.length
            ).toFixed(2)
            : "0.00";


    // =========================================================
    // OPEN DETAILS
    // =========================================================

    const openDetails = (mapping) => {

        setSelectedMapping(mapping);

        setShowDetails(true);
    };


    // =========================================================
    // CLOSE DETAILS
    // =========================================================

    const closeDetails = () => {

        setSelectedMapping(null);

        setShowDetails(false);
    };


    // =========================================================
    // OPEN MIGRATION VIEW
    // =========================================================

    const openMigrationView = () => {

        setShowMigrationView(true);
    };


    // =========================================================
    // CLOSE MIGRATION VIEW
    // =========================================================

    const closeMigrationView = () => {

        setShowMigrationView(false);
    };


    // =========================================================
    // EXPORT MIGRATION PDF
    // =========================================================

    const exportMigrationPdf = () => {

        if (approvedOnly.length === 0) {

            alert(
                "There are no approved mappings to export."
            );

            return;
        }


        const doc = new jsPDF();

        const generatedDate =
            new Date().toLocaleDateString();


        // =====================================================
        // TITLE
        // =====================================================

        doc.setFontSize(18);

        doc.text(
            "LEGACY → NATIONAL",
            14,
            18
        );


        doc.setFontSize(14);

        doc.text(
            "CPSE Material Migration Report",
            14,
            28
        );


        doc.setFontSize(11);

        doc.text(
            "Migration View",
            14,
            38
        );


        doc.setFontSize(9);

        doc.text(
            `Generated: ${generatedDate}`,
            14,
            46
        );


        // =====================================================
        // MIGRATION SUMMARY
        // =====================================================

        doc.setFontSize(12);

        doc.text(
            "Migration Summary",
            14,
            58
        );


        doc.setFontSize(10);

        doc.text(
            `Legacy Materials: ${totalMappings}`,
            14,
            68
        );


        doc.text(
            `CPSEs Covered: ${totalCpse}`,
            14,
            76
        );


        doc.text(
            `National Codes: ${totalNationalCodes}`,
            14,
            84
        );


        // =====================================================
        // TABLE DATA
        // =====================================================

        const tableData =
            approvedOnly.map(
                (mapping) => [

                    mapping.cpseName || "-",

                    mapping.legacyMaterialCode || "-",

                    mapping.legacyDescription || "-",

                    mapping.commonMaterialCode || "-",

                    "APPROVED"
                ]
            );


        // =====================================================
        // TABLE
        // =====================================================

        autoTable(doc, {

            startY: 94,

            head: [[
                "CPSE",
                "Legacy Code",
                "Legacy Description",
                "Common National Code",
                "Status"
            ]],

            body: tableData,

            theme: "grid",

            styles: {
                fontSize: 8,
                cellPadding: 3
            },

            headStyles: {
                fontSize: 8
            },

            columnStyles: {

                0: {
                    cellWidth: 28
                },

                1: {
                    cellWidth: 28
                },

                2: {
                    cellWidth: 55
                },

                3: {
                    cellWidth: 45
                },

                4: {
                    cellWidth: 25
                }
            }
        });


        // =====================================================
        // MIGRATION INSIGHT
        // =====================================================

        const finalY =
            doc.lastAutoTable.finalY + 15;


        doc.setFontSize(11);

        doc.text(
            "Migration Insight",
            14,
            finalY
        );


        doc.setFontSize(9);

        doc.text(
            "Legacy codes can be consolidated under a common national identity.",
            14,
            finalY + 8
        );


        // =====================================================
        // SAVE
        // =====================================================

        doc.save(
            "CPSE-Migration-View.pdf"
        );
    };


    // =========================================================
    // LOADING
    // =========================================================

    if (loading) {

        return (

            <div className="cpse-mapping-page">

                <div className="empty-state">

                    <h3>
                        Loading CPSE mappings...
                    </h3>

                    <p>
                        Fetching AI suggestions and approved mappings.
                    </p>

                </div>

            </div>
        );
    }


    // =========================================================
    // MAIN UI
    // =========================================================

    return (

        <div className="cpse-mapping-page">


            {/* =================================================
                HEADER
            ================================================= */}

            <div className="page-header">

                <div>

                    <h1>
                        CPSE Mapping
                    </h1>

                    <p>
                        AI-suggested and approved material mappings across CPSEs
                    </p>

                </div>


                <button
                    className="migration-view-btn"
                    onClick={openMigrationView}
                >
                    Migration View
                </button>

            </div>


            {/* =================================================
                AI SUGGESTIONS
            ================================================= */}

            {aiSuggestedMappings.length > 0 && (

                <div className="mapping-table-container">

                    <div style={{
                        padding: "20px 20px 10px"
                    }}>

                        <h2 style={{
                            margin: 0
                        }}>
                            🤖 AI Mapping Suggestions
                        </h2>

                        <p style={{
                            marginTop: "6px",
                            color: "#666"
                        }}>
                            Review AI-generated CPSE mappings before they enter the approved migration list.
                        </p>

                    </div>


                    <table className="mapping-table">

                        <thead>

                            <tr>

                                <th>
                                    CPSE
                                </th>

                                <th>
                                    Legacy Material
                                </th>

                                <th>
                                    Common National Code
                                </th>

                                <th>
                                    AI Confidence
                                </th>

                                <th>
                                    AI Match Reason
                                </th>

                                <th>
                                    Action
                                </th>

                            </tr>

                        </thead>


                        <tbody>

                            {aiSuggestedMappings.map(
                                (mapping) => (

                                    <tr
                                        key={mapping.id}
                                    >

                                        <td>

                                            <strong>
                                                {mapping.cpseName}
                                            </strong>

                                        </td>


                                        <td>

                                            <div className="legacy-material">

                                                <strong>
                                                    {mapping.legacyMaterialCode}
                                                </strong>

                                                <span>
                                                    {mapping.legacyDescription}
                                                </span>

                                            </div>

                                        </td>


                                        <td>

                                            <div className="national-code">

                                                {mapping.commonMaterialCode || "-"}

                                            </div>

                                        </td>


                                        <td>

                                            {mapping.matchConfidence != null
                                                ? `${Number(
                                                    mapping.matchConfidence
                                                ).toFixed(2)}%`
                                                : "-"
                                            }

                                        </td>


                                        <td>

                                            {mapping.matchReason || "-"}

                                        </td>


                                        <td>

                                            <div style={{
                                                display: "flex",
                                                gap: "8px"
                                            }}>

                                                <button
                                                    onClick={() =>
                                                        approveMapping(
                                                            mapping.id
                                                        )
                                                    }
                                                    disabled={
                                                        processingId ===
                                                        mapping.id
                                                    }
                                                    style={{
                                                        padding: "8px 14px",
                                                        border: "none",
                                                        borderRadius: "6px",
                                                        background: "#198754",
                                                        color: "#fff",
                                                        cursor: "pointer"
                                                    }}
                                                >
                                                    {processingId === mapping.id
                                                        ? "..."
                                                        : "Approve"
                                                    }
                                                </button>


                                                <button
                                                    onClick={() =>
                                                        rejectMapping(
                                                            mapping.id
                                                        )
                                                    }
                                                    disabled={
                                                        processingId ===
                                                        mapping.id
                                                    }
                                                    style={{
                                                        padding: "8px 14px",
                                                        border: "none",
                                                        borderRadius: "6px",
                                                        background: "#dc3545",
                                                        color: "#fff",
                                                        cursor: "pointer"
                                                    }}
                                                >
                                                    Reject
                                                </button>

                                            </div>

                                        </td>

                                    </tr>

                                )
                            )}

                        </tbody>

                    </table>

                </div>

            )}


            {/* =================================================
                SUMMARY CARDS
            ================================================= */}

            <div className="summary-grid">


                {/* TOTAL APPROVED MAPPINGS */}

                <div className="summary-card">

                    <div className="summary-icon">
                        📦
                    </div>

                    <div>

                        <h3>
                            {totalMappings}
                        </h3>

                        <p>
                            Approved Mappings
                        </p>

                    </div>

                </div>


                {/* CPSE */}

                <div className="summary-card">

                    <div className="summary-icon">
                        🏢
                    </div>

                    <div>

                        <h3>
                            {totalCpse}
                        </h3>

                        <p>
                            CPSEs Covered
                        </p>

                    </div>

                </div>


                {/* NATIONAL CODES */}

                <div className="summary-card">

                    <div className="summary-icon">
                        🔗
                    </div>

                    <div>

                        <h3>
                            {totalNationalCodes}
                        </h3>

                        <p>
                            National Codes
                        </p>

                    </div>

                </div>


                {/* AI CONFIDENCE */}

                <div className="summary-card">

                    <div className="summary-icon">
                        🤖
                    </div>

                    <div>

                        <h3>
                            {averageConfidence}%
                        </h3>

                        <p>
                            Avg. AI Confidence
                        </p>

                    </div>

                </div>

            </div>


            {/* =================================================
                FILTERS
            ================================================= */}

            <div className="filters-section">


                {/* SEARCH */}

                <div className="search-box">

                    <input
                        type="text"
                        placeholder="Search CPSE, material code or description..."
                        value={searchTerm}
                        onChange={(e) =>
                            setSearchTerm(
                                e.target.value
                            )
                        }
                    />

                </div>


                {/* CPSE FILTER */}

                <select
                    value={cpseFilter}
                    onChange={(e) =>
                        setCpseFilter(
                            e.target.value
                        )
                    }
                >

                    <option value="ALL">
                        All CPSEs
                    </option>


                    {cpseList.map(
                        (cpse) => (

                            <option
                                key={cpse}
                                value={cpse}
                            >
                                {cpse}
                            </option>

                        )
                    )}

                </select>


                {/* STATUS FILTER */}

                <select
                    value={statusFilter}
                    onChange={(e) =>
                        setStatusFilter(
                            e.target.value
                        )
                    }
                >

                    <option value="ALL">
                        All Status
                    </option>

                    <option value="AI_SUGGESTED">
                        AI Suggested
                    </option>

                    <option value="APPROVED">
                        Approved
                    </option>

                    <option value="REJECTED">
                        Rejected
                    </option>

                </select>

            </div>


            {/* =================================================
                APPROVED MAPPING TABLE
            ================================================= */}

            <div className="mapping-table-container">

                <div style={{
                    padding: "20px 20px 10px"
                }}>

                    <h2 style={{
                        margin: 0
                    }}>
                        Approved Mappings
                    </h2>

                    <p style={{
                        marginTop: "6px",
                        color: "#666"
                    }}>
                        CPSE mappings approved for national material migration.
                    </p>

                </div>


                <table className="mapping-table">


                    <thead>

                        <tr>

                            <th>
                                CPSE
                            </th>

                            <th>
                                Legacy Material
                            </th>

                            <th>
                                Common National Code
                            </th>

                            <th>
                                AI Confidence
                            </th>

                            <th>
                                AI Match Reason
                            </th>

                            <th>
                                Mapping Status
                            </th>

                        </tr>

                    </thead>


                    <tbody>


                        {approvedMappings.length > 0 ? (

                            approvedMappings.map(
                                (mapping) => (

                                    <tr
                                        key={mapping.id}
                                        onClick={() =>
                                            openDetails(
                                                mapping
                                            )
                                        }
                                        style={{
                                            cursor: "pointer"
                                        }}
                                    >


                                        {/* CPSE */}

                                        <td>

                                            <strong>
                                                {
                                                    mapping.cpseName
                                                }
                                            </strong>

                                        </td>


                                        {/* LEGACY MATERIAL */}

                                        <td>

                                            <div className="legacy-material">

                                                <strong>
                                                    {
                                                        mapping.legacyMaterialCode
                                                    }
                                                </strong>

                                                <span>
                                                    {
                                                        mapping.legacyDescription
                                                    }
                                                </span>

                                            </div>

                                        </td>


                                        {/* NATIONAL CODE */}

                                        <td>

                                            <div className="national-code">

                                                {
                                                    mapping.commonMaterialCode ||
                                                    "-"
                                                }

                                            </div>

                                        </td>


                                        {/* AI CONFIDENCE */}

                                        <td>

                                            {
                                                mapping.matchConfidence != null
                                                    ? `${Number(
                                                        mapping.matchConfidence
                                                    ).toFixed(2)}%`
                                                    : "-"
                                            }

                                        </td>


                                        {/* AI REASON */}

                                        <td>

                                            {
                                                mapping.matchReason ||
                                                "-"
                                            }

                                        </td>


                                        {/* STATUS */}

                                        <td>

                                            <span
                                                className="status-badge approved"
                                            >
                                                APPROVED
                                            </span>

                                        </td>

                                    </tr>

                                )
                            )

                        ) : (

                            <tr>

                                <td
                                    colSpan="6"
                                >

                                    <div className="empty-state">

                                        <h3>
                                            No approved mappings found
                                        </h3>

                                        <p>
                                            A mapping will appear here only after it is approved by a reviewer.
                                        </p>

                                    </div>

                                </td>

                            </tr>

                        )}

                    </tbody>

                </table>

            </div>


            {/* =================================================
                DETAILS MODAL
            ================================================= */}

            {showDetails &&
                selectedMapping && (

                    <div
                        className="modal-overlay"
                        onClick={closeDetails}
                    >

                        <div
                            className="details-modal"
                            onClick={(e) =>
                                e.stopPropagation()
                            }
                        >


                            <div className="modal-header">

                                <h2>
                                    Mapping Details
                                </h2>

                                <button
                                    onClick={
                                        closeDetails
                                    }
                                >
                                    ×
                                </button>

                            </div>


                            <div className="modal-content">


                                <div className="detail-row">

                                    <strong>
                                        CPSE
                                    </strong>

                                    <span>
                                        {
                                            selectedMapping.cpseName
                                        }
                                    </span>

                                </div>


                                <div className="detail-row">

                                    <strong>
                                        Legacy Material Code
                                    </strong>

                                    <span>
                                        {
                                            selectedMapping.legacyMaterialCode
                                        }
                                    </span>

                                </div>


                                <div className="detail-row">

                                    <strong>
                                        Legacy Description
                                    </strong>

                                    <span>
                                        {
                                            selectedMapping.legacyDescription
                                        }
                                    </span>

                                </div>


                                <div className="detail-row">

                                    <strong>
                                        Common National Code
                                    </strong>

                                    <span>
                                        {
                                            selectedMapping.commonMaterialCode ||
                                            "-"
                                        }
                                    </span>

                                </div>


                                <div className="detail-row">

                                    <strong>
                                        AI Confidence
                                    </strong>

                                    <span>

                                        {
                                            selectedMapping.matchConfidence != null
                                                ? `${Number(
                                                    selectedMapping.matchConfidence
                                                ).toFixed(2)}%`
                                                : "-"
                                        }

                                    </span>

                                </div>


                                <div className="detail-row">

                                    <strong>
                                        AI Match Reason
                                    </strong>

                                    <span>
                                        {
                                            selectedMapping.matchReason ||
                                            "-"
                                        }
                                    </span>

                                </div>


                                <div className="detail-row">

                                    <strong>
                                        Approval Status
                                    </strong>

                                    <span>
                                        {
                                            selectedMapping.status ||
                                            "-"
                                        }
                                    </span>

                                </div>


                                <div className="detail-row">

                                    <strong>
                                        Reviewed By
                                    </strong>

                                    <span>
                                        {
                                            selectedMapping.reviewedBy ||
                                            "-"
                                        }
                                    </span>

                                </div>


                                <div className="detail-row">

                                    <strong>
                                        Reviewed At
                                    </strong>

                                    <span>
                                        {
                                            selectedMapping.reviewedAt ||
                                            "-"
                                        }
                                    </span>

                                </div>

                            </div>

                        </div>

                    </div>

                )
            }


            {/* =================================================
                MIGRATION VIEW
            ================================================= */}

            {showMigrationView && (

                <div
                    className="modal-overlay"
                    onClick={closeMigrationView}
                >

                    <div
                        className="migration-modal"
                        onClick={(e) =>
                            e.stopPropagation()
                        }
                    >


                        <div className="modal-header">

                            <div>

                                <h2>
                                    Migration View
                                </h2>

                                <p>
                                    Approved CPSE mappings ready for national standardization
                                </p>

                            </div>


                            <button
                                onClick={
                                    closeMigrationView
                                }
                            >
                                ×
                            </button>

                        </div>


                        <div className="migration-summary">


                            <div>

                                <strong>
                                    {totalMappings}
                                </strong>

                                <span>
                                    Legacy Materials
                                </span>

                            </div>


                            <div>

                                <strong>
                                    {totalCpse}
                                </strong>

                                <span>
                                    CPSEs Covered
                                </span>

                            </div>


                            <div>

                                <strong>
                                    {totalNationalCodes}
                                </strong>

                                <span>
                                    National Codes
                                </span>

                            </div>

                        </div>


                        <div className="migration-table-container">

                            <table className="migration-table">


                                <thead>

                                    <tr>

                                        <th>
                                            CPSE
                                        </th>

                                        <th>
                                            Legacy Material
                                        </th>

                                        <th>
                                            Common National Code
                                        </th>

                                        <th>
                                            Status
                                        </th>

                                    </tr>

                                </thead>


                                <tbody>


                                    {approvedOnly.length > 0 ? (

                                        approvedOnly.map(
                                            (mapping) => (

                                                <tr
                                                    key={
                                                        mapping.id
                                                    }
                                                >

                                                    <td>
                                                        {
                                                            mapping.cpseName
                                                        }
                                                    </td>


                                                    <td>

                                                        <strong>
                                                            {
                                                                mapping.legacyMaterialCode
                                                            }
                                                        </strong>

                                                        <br />

                                                        <span>
                                                            {
                                                                mapping.legacyDescription
                                                            }
                                                        </span>

                                                    </td>


                                                    <td>

                                                        {
                                                            mapping.commonMaterialCode ||
                                                            "-"
                                                        }

                                                    </td>


                                                    <td>

                                                        <span className="status-badge approved">
                                                            APPROVED
                                                        </span>

                                                    </td>

                                                </tr>

                                            )
                                        )

                                    ) : (

                                        <tr>

                                            <td
                                                colSpan="4"
                                            >

                                                No approved mappings available.

                                            </td>

                                        </tr>

                                    )}

                                </tbody>

                            </table>

                        </div>


                        <div className="migration-insight">

                            <strong>
                                Migration Insight
                            </strong>

                            <p>
                                Legacy codes can be consolidated under a common national identity.
                            </p>

                        </div>


                        <div className="migration-footer">

                            <button
                                className="migration-export-btn"
                                onClick={
                                    exportMigrationPdf
                                }
                            >
                                Export Migration PDF
                            </button>

                        </div>

                    </div>

                </div>

            )}

        </div>
    );
};

export default CpseMapping;