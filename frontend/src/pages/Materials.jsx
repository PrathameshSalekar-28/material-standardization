import { useEffect, useMemo, useState } from "react";

import {
  Search,
  Filter,
  BrainCircuit,
  ChevronLeft,
  ChevronRight,
  X,
  Loader2,
  Package,
  Building2,
  Tag,
  Ruler,
  FileText,
} from "lucide-react";

import {
  getMaterials,
  getMaterialMatches,
} from "../services/api";

import "./Materials.css";


function Materials() {

  const [materials, setMaterials] = useState([]);

  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  const [cpseFilter, setCpseFilter] = useState("ALL");

  const [typeFilter, setTypeFilter] = useState("ALL");

  const [currentPage, setCurrentPage] = useState(1);

  const [selectedMaterial, setSelectedMaterial] =
    useState(null);

  const [matches, setMatches] = useState([]);

  const [matchLoading, setMatchLoading] =
    useState(false);

  const itemsPerPage = 10;


  // =====================================================
  // LOAD MATERIALS
  // =====================================================

  useEffect(() => {

    loadMaterials();

  }, []);


  const loadMaterials = async () => {

    try {

      setLoading(true);

      const response = await getMaterials();

      setMaterials(
        Array.isArray(response.data)
          ? response.data
          : []
      );

    } catch (error) {

      console.error(
        "Failed to load materials:",
        error
      );

    } finally {

      setLoading(false);

    }

  };


  // =====================================================
  // FILTER OPTIONS
  // =====================================================

  const cpseOptions = useMemo(() => {

    return [
      "ALL",
      ...new Set(
        materials
          .map((material) => material.cpseName)
          .filter(Boolean)
      ),
    ];

  }, [materials]);


  const typeOptions = useMemo(() => {

    return [
      "ALL",
      ...new Set(
        materials
          .map((material) => material.materialType)
          .filter(Boolean)
      ),
    ];

  }, [materials]);


  // =====================================================
  // FILTER MATERIALS
  // =====================================================

  const filteredMaterials = useMemo(() => {

    const query = search
      .toLowerCase()
      .trim();

    return materials.filter((material) => {

      const matchesSearch =
        !query ||
        material.materialCode
          ?.toLowerCase()
          .includes(query) ||
        material.description
          ?.toLowerCase()
          .includes(query) ||
        material.cpseName
          ?.toLowerCase()
          .includes(query) ||
        material.materialType
          ?.toLowerCase()
          .includes(query);

      const matchesCpse =
        cpseFilter === "ALL" ||
        material.cpseName === cpseFilter;

      const matchesType =
        typeFilter === "ALL" ||
        material.materialType === typeFilter;

      return (
        matchesSearch &&
        matchesCpse &&
        matchesType
      );

    });

  }, [
    materials,
    search,
    cpseFilter,
    typeFilter,
  ]);


  // =====================================================
  // PAGINATION
  // =====================================================

  const totalPages =
    Math.max(
      1,
      Math.ceil(
        filteredMaterials.length /
          itemsPerPage
      )
    );


  const safePage =
    Math.min(
      currentPage,
      totalPages
    );


  const startIndex =
    (safePage - 1) *
    itemsPerPage;


  const paginatedMaterials =
    filteredMaterials.slice(
      startIndex,
      startIndex + itemsPerPage
    );


  useEffect(() => {

    setCurrentPage(1);

  }, [
    search,
    cpseFilter,
    typeFilter,
  ]);


  // =====================================================
  // AI MATCHING
  // =====================================================

  const openAiMatches = async (material) => {

    try {

      setSelectedMaterial(material);

      setMatches([]);

      setMatchLoading(true);

      const response =
        await getMaterialMatches(
          material.id,
          5
        );

      setMatches(
        response.data?.matches || []
      );

    } catch (error) {

      console.error(
        "AI matching failed:",
        error
      );

      setMatches([]);

    } finally {

      setMatchLoading(false);

    }

  };


  const closeAiMatches = () => {

    setSelectedMaterial(null);

    setMatches([]);

  };


  // =====================================================
  // SIMILARITY COLOR
  // =====================================================

  const getSimilarityClass = (score) => {

    if (score >= 90) {
      return "similarity-high";
    }

    if (score >= 70) {
      return "similarity-medium";
    }

    return "similarity-low";

  };


  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {

    return (

      <div className="materials-page">

        <div className="materials-loading">

          <Loader2
            size={28}
            className="spin"
          />

          <span>
            Loading material master...
          </span>

        </div>

      </div>

    );

  }


  // =====================================================
  // PAGE
  // =====================================================

  return (

    <div className="materials-page">


      {/* =================================================
          HEADER
      ================================================= */}

      <div className="materials-header">

        <div>

          <div className="page-eyebrow">
            MATERIAL MASTER
          </div>

          <h1>
            Materials
          </h1>

          <p>
            Browse, search and analyze materials
            across connected CPSEs.
          </p>

        </div>


        <div className="material-count-card">

          <Package size={20} />

          <div>

            <strong>
              {materials.length}
            </strong>

            <span>
              Total Materials
            </span>

          </div>

        </div>

      </div>


      {/* =================================================
          FILTER BAR
      ================================================= */}

      <div className="materials-toolbar">


        <div className="material-search">

          <Search size={18} />

          <input
            type="text"
            placeholder="Search material code, description, CPSE..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />

          {search && (

            <button
              className="clear-search"
              onClick={() => setSearch("")}
            >

              <X size={15} />

            </button>

          )}

        </div>


        <div className="filter-control">

          <Filter size={16} />

          <select
            value={cpseFilter}
            onChange={(e) =>
              setCpseFilter(e.target.value)
            }
          >

            {cpseOptions.map((cpse) => (

              <option
                key={cpse}
                value={cpse}
              >

                {cpse === "ALL"
                  ? "All CPSEs"
                  : cpse}

              </option>

            ))}

          </select>

        </div>


        <div className="filter-control">

          <Tag size={16} />

          <select
            value={typeFilter}
            onChange={(e) =>
              setTypeFilter(e.target.value)
            }
          >

            {typeOptions.map((type) => (

              <option
                key={type}
                value={type}
              >

                {type === "ALL"
                  ? "All Types"
                  : type}

              </option>

            ))}

          </select>

        </div>


        <div className="result-count">

          {filteredMaterials.length}
          {" "}
          results

        </div>

      </div>


      {/* =================================================
          TABLE
      ================================================= */}

      <div className="materials-card">

        <div className="materials-table-wrapper">

          <table className="materials-table">

            <thead>

              <tr>

                <th>
                  Material Code
                </th>

                <th>
                  CPSE
                </th>

                <th>
                  Description
                </th>

                <th>
                  Type
                </th>

                <th>
                  Grade
                </th>

                <th>
                  Size
                </th>

                <th>
                  Standard
                </th>

                <th>
                  UOM
                </th>

                <th>
                  AI Action
                </th>

              </tr>

            </thead>


            <tbody>

              {paginatedMaterials.length === 0 ? (

                <tr>

                  <td
                    colSpan="9"
                    className="empty-materials"
                  >

                    <Package size={32} />

                    <strong>
                      No materials found
                    </strong>

                    <span>
                      Try changing your search
                      or filters.
                    </span>

                  </td>

                </tr>

              ) : (

                paginatedMaterials.map(
                  (material) => (

                    <tr
                      key={material.id}
                    >

                      <td>

                        <span className="material-code">
                          {material.materialCode}
                        </span>

                      </td>


                      <td>

                        <span className="cpse-badge">
                          {material.cpseName}
                        </span>

                      </td>


                      <td>

                        <div className="description-cell">

                          <strong>
                            {material.description}
                          </strong>

                          {material.materialGroup && (

                            <span>
                              {material.materialGroup}
                            </span>

                          )}

                        </div>

                      </td>


                      <td>

                        <span className="type-text">
                          {material.materialType || "—"}
                        </span>

                      </td>


                      <td>
                        {material.grade || "—"}
                      </td>


                      <td>
                        {material.size || "—"}
                      </td>


                      <td>
                        {material.standard || "—"}
                      </td>


                      <td>

                        <span className="uom">
                          {material.unit || "—"}
                        </span>

                      </td>


                      <td>

                        <button
                          className="ai-match-button"
                          onClick={() =>
                            openAiMatches(
                              material
                            )
                          }
                        >

                          <BrainCircuit
                            size={15}
                          />

                          AI Match

                        </button>

                      </td>

                    </tr>

                  )
                )

              )}

            </tbody>

          </table>

        </div>


        {/* =================================================
            PAGINATION
        ================================================= */}

        <div className="materials-pagination">

          <span>

            Showing{" "}

            <strong>
              {filteredMaterials.length === 0
                ? 0
                : startIndex + 1}
            </strong>

            {" "}–{" "}

            <strong>
              {Math.min(
                startIndex +
                  itemsPerPage,
                filteredMaterials.length
              )}
            </strong>

            {" "}of{" "}

            <strong>
              {filteredMaterials.length}
            </strong>

          </span>


          <div className="pagination-buttons">

            <button
              disabled={safePage === 1}
              onClick={() =>
                setCurrentPage(
                  (page) =>
                    Math.max(
                      1,
                      page - 1
                    )
                )
              }
            >

              <ChevronLeft size={17} />

            </button>


            <span className="page-number">

              {safePage}

              {" / "}

              {totalPages}

            </span>


            <button
              disabled={
                safePage === totalPages
              }
              onClick={() =>
                setCurrentPage(
                  (page) =>
                    Math.min(
                      totalPages,
                      page + 1
                    )
                )
              }
            >

              <ChevronRight size={17} />

            </button>

          </div>

        </div>

      </div>


      {/* =================================================
          AI MATCH MODAL
      ================================================= */}

      {selectedMaterial && (

        <div
          className="modal-overlay"
          onClick={closeAiMatches}
        >

          <div
            className="ai-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >


            <div className="modal-header">

              <div>

                <div className="modal-eyebrow">
                  AI MATERIAL INTELLIGENCE
                </div>

                <h2>
                  Similar Materials
                </h2>

                <p>
                  AI-generated matches for{" "}
                  <strong>
                    {selectedMaterial.materialCode}
                  </strong>
                </p>

              </div>


              <button
                className="modal-close"
                onClick={closeAiMatches}
              >

                <X size={20} />

              </button>

            </div>


            <div className="selected-material">

              <div className="selected-icon">
                <Package size={20} />
              </div>

              <div>

                <strong>
                  {selectedMaterial.description}
                </strong>

                <span>

                  {selectedMaterial.cpseName}
                  {" • "}
                  {selectedMaterial.materialType}
                  {" • "}
                  {selectedMaterial.grade}

                </span>

              </div>

            </div>


            <div className="matches-content">

              {matchLoading ? (

                <div className="matches-loading">

                  <Loader2
                    size={26}
                    className="spin"
                  />

                  <span>
                    AI is analyzing material
                    similarities...
                  </span>

                </div>

              ) : matches.length === 0 ? (

                <div className="no-matches">

                  <BrainCircuit size={30} />

                  <strong>
                    No similar materials found
                  </strong>

                  <span>
                    The AI engine did not find
                    suitable matches.
                  </span>

                </div>

              ) : (

                <>

                  <div className="matches-title">

                    <span>
                      AI detected
                    </span>

                    <strong>
                      {matches.length} potential
                      matches
                    </strong>

                  </div>


                  <div className="match-list">

                    {matches.map(
                      (match, index) => (

                        <div
                          className="match-item"
                          key={
                            `${match.materialCode}-${index}`
                          }
                        >

                          <div className="match-main">

                            <div className="match-code-row">

                              <strong>
                                {match.materialCode}
                              </strong>

                              <span
                                className={
                                  `similarity-badge ${
                                    getSimilarityClass(
                                      match.similarity
                                    )
                                  }`
                                }
                              >

                                {Number(
                                  match.similarity
                                ).toFixed(2)}
                                %

                              </span>

                            </div>


                            <p className="match-description">
                              {match.description}
                            </p>


                            <div className="match-meta">

                              <span>
                                <Building2
                                  size={13}
                                />
                                {match.cpseName}
                              </span>

                              <span>
                                <Tag size={13} />
                                {match.materialType}
                              </span>

                              <span>
                                <Ruler size={13} />
                                {match.size || "—"}
                              </span>

                              <span>
                                <FileText
                                  size={13}
                                />
                                {match.standard || "—"}
                              </span>

                            </div>


                            {match.matchReasons
                              ?.length > 0 && (

                              <div className="match-reasons">

                                {match.matchReasons
                                  .slice(0, 4)
                                  .map(
                                    (
                                      reason,
                                      reasonIndex
                                    ) => (

                                      <span
                                        key={
                                          reasonIndex
                                        }
                                      >
                                        {reason}
                                      </span>

                                    )
                                  )}

                              </div>

                            )}

                          </div>


                          <div
                            className={
                              `match-type ${
                                getSimilarityClass(
                                  match.similarity
                                )
                              }`
                            }
                          >

                            {match.matchType
                              ?.replaceAll(
                                "_",
                                " "
                              )}

                          </div>

                        </div>

                      )
                    )}

                  </div>

                </>

              )}

            </div>

          </div>

        </div>

      )}

    </div>

  );

}


export default Materials;