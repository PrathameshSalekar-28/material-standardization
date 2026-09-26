import { useEffect, useState } from "react";

import {
  CopyCheck,
  Search,
  ChevronRight,
  X,
  BrainCircuit,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

import { getDuplicateGroups } from "../services/api";

import "./Duplicates.css";


function Duplicates() {

  // =========================================================
  // STATE
  // =========================================================

  const [groups, setGroups] = useState([]);

  const [search, setSearch] = useState("");

  const [selectedGroup, setSelectedGroup] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");


  // =========================================================
  // LOAD DUPLICATES
  // =========================================================

  useEffect(() => {

    loadDuplicates();

  }, []);


  const loadDuplicates = async () => {

    try {

      setLoading(true);
      setError("");

      const response =
        await getDuplicateGroups();

      setGroups(
        Array.isArray(response.data)
          ? response.data
          : []
      );

    } catch (err) {

      console.error(
        "Duplicate API Error:",
        err
      );

      setError(
        "Unable to load duplicate groups."
      );

    } finally {

      setLoading(false);

    }

  };


  // =========================================================
  // SEARCH
  // =========================================================

  const filteredGroups =
    groups.filter((group) => {

      const searchableText =
        JSON.stringify(group)
          .toLowerCase();

      return searchableText.includes(
        search.toLowerCase()
      );

    });


  // =========================================================
  // SCORE CLASS
  // =========================================================

  const getScoreClass = (score) => {

    if (score >= 90) {
      return "high";
    }

    if (score >= 70) {
      return "medium";
    }

    return "low";

  };


  // =========================================================
  // UI
  // =========================================================

  return (

    <div className="duplicates-page">


      {/* =====================================================
          HEADER
          ===================================================== */}

      <section className="duplicates-header">

        <div>

          <div className="duplicates-eyebrow">

            <CopyCheck size={15} />

            AI QUALITY ENGINE

          </div>


          <h2>
            Duplicate Detection
          </h2>


          <p>
            AI-detected duplicate and
            near-duplicate material groups
            across connected CPSEs.
          </p>

        </div>


        <div className="duplicate-total">

          <strong>
            {groups.length}
          </strong>

          <span>
            Duplicate Groups
          </span>

        </div>

      </section>


      {/* =====================================================
          SEARCH
          ===================================================== */}

      <div className="duplicate-search">

        <Search size={17} />

        <input
          type="text"
          placeholder="Search material codes, descriptions or CPSE..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
        />

      </div>


      {/* =====================================================
          LOADING
          ===================================================== */}

      {loading && (

        <div className="duplicate-empty">

          <BrainCircuit size={32} />

          <h3>
            Loading duplicate groups
          </h3>

          <p>
            AI duplicate detection results
            are being loaded...
          </p>

        </div>

      )}


      {/* =====================================================
          ERROR
          ===================================================== */}

      {!loading && error && (

        <div className="duplicate-empty error-state">

          <AlertTriangle size={32} />

          <h3>
            Unable to load duplicates
          </h3>

          <p>
            {error}
          </p>


          <button
            className="retry-button"
            onClick={loadDuplicates}
          >
            Retry
          </button>

        </div>

      )}


      {/* =====================================================
          EMPTY
          ===================================================== */}

      {!loading &&
        !error &&
        filteredGroups.length === 0 && (

          <div className="duplicate-empty">

            <CheckCircle2 size={32} />

            <h3>
              No duplicate groups found
            </h3>

            <p>
              No AI-detected duplicate groups
              match your search.
            </p>

          </div>

        )}


      {/* =====================================================
          DUPLICATE GROUPS
          ===================================================== */}

      {!loading &&
        !error &&
        filteredGroups.length > 0 && (

          <div className="duplicate-grid">

            {filteredGroups.map((group) => {

              const score =
                Number(
                  group.highestSimilarity || 0
                );


              return (

                <div
                  className="duplicate-card"
                  key={group.groupId}
                >


                  {/* CARD HEADER */}

                  <div className="duplicate-card-top">

                    <div>

                      <span className="duplicate-group-id">

                        {group.groupId}

                      </span>


                      <h3>

                        {group.materialCount}

                        {" "}

                        Similar Materials

                      </h3>

                    </div>


                    <div
                      className={
                        `duplicate-score ${
                          getScoreClass(score)
                        }`
                      }
                    >

                      <strong>

                        {score.toFixed(2)}%

                      </strong>

                      <span>
                        similarity
                      </span>

                    </div>

                  </div>


                  {/* MATERIALS */}

                  <div className="duplicate-materials">

                    {(group.materials || [])
                      .slice(0, 4)
                      .map((material) => (

                        <div
                          className="duplicate-material"
                          key={
                            material.materialCode
                          }
                        >

                          <div className="material-code">

                            <strong>
                              {material.materialCode}
                            </strong>

                            <span>
                              {material.cpseName}
                            </span>

                          </div>


                          <p>
                            {material.description}
                          </p>


                          <div className="material-details">

                            {material.materialType && (

                              <span>
                                {material.materialType}
                              </span>

                            )}

                            {material.grade && (

                              <span>
                                {material.grade}
                              </span>

                            )}

                            {material.size && (

                              <span>
                                {material.size}
                              </span>

                            )}

                            {material.standard && (

                              <span>
                                {material.standard}
                              </span>

                            )}

                          </div>

                        </div>

                      ))}

                  </div>


                  {/* VIEW BUTTON */}

                  <button
                    className="duplicate-view-button"
                    onClick={() =>
                      setSelectedGroup(group)
                    }
                  >

                    <span>
                      View Duplicate Group
                    </span>

                    <ChevronRight size={16} />

                  </button>

                </div>

              );

            })}

          </div>

        )}


      {/* =====================================================
          DETAILS MODAL
          ===================================================== */}

      {selectedGroup && (

        <div
          className="duplicate-modal-overlay"
          onClick={() =>
            setSelectedGroup(null)
          }
        >

          <div
            className="duplicate-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >


            {/* MODAL HEADER */}

            <div className="duplicate-modal-header">

              <div>

                <span>
                  {selectedGroup.groupId}
                </span>

                <h2>
                  Duplicate Material Group
                </h2>

              </div>


              <button
                className="modal-close"
                onClick={() =>
                  setSelectedGroup(null)
                }
              >

                <X size={20} />

              </button>

            </div>


            {/* MODAL SUMMARY */}

            <div className="duplicate-modal-summary">

              <div>

                <span>
                  MATERIALS
                </span>

                <strong>
                  {selectedGroup.materialCount}
                </strong>

              </div>


              <div>

                <span>
                  HIGHEST SIMILARITY
                </span>

                <strong>

                  {Number(
                    selectedGroup.highestSimilarity ||
                      0
                  ).toFixed(2)}%

                </strong>

              </div>

            </div>


            {/* MATERIAL LIST */}

            <div className="duplicate-modal-body">

              <div className="modal-section-title">

                MATERIAL RECORDS

              </div>


              {(selectedGroup.materials || [])
                .map((material) => (

                  <div
                    className="modal-material"
                    key={
                      material.materialCode
                    }
                  >

                    <div className="modal-material-header">

                      <strong>
                        {material.materialCode}
                      </strong>

                      <span>
                        {material.cpseName}
                      </span>

                    </div>


                    <p>
                      {material.description}
                    </p>


                    <div className="modal-material-details">

                      {material.materialType && (

                        <span>
                          Type:{" "}
                          {material.materialType}
                        </span>

                      )}

                      {material.materialGroup && (

                        <span>
                          Group:{" "}
                          {material.materialGroup}
                        </span>

                      )}

                      {material.grade && (

                        <span>
                          Grade:{" "}
                          {material.grade}
                        </span>

                      )}

                      {material.size && (

                        <span>
                          Size:{" "}
                          {material.size}
                        </span>

                      )}

                      {material.standard && (

                        <span>
                          Standard:{" "}
                          {material.standard}
                        </span>

                      )}

                      {material.unit && (

                        <span>
                          UOM:{" "}
                          {material.unit}
                        </span>

                      )}

                    </div>

                  </div>

                ))}


              {/* MATCHING PAIRS */}

              {selectedGroup.matchingPairs &&
                selectedGroup.matchingPairs.length >
                  0 && (

                  <>

                    <div className="modal-section-title pair-title">

                      AI MATCHING EVIDENCE

                    </div>


                    {selectedGroup.matchingPairs.map(
                      (pair, index) => (

                        <div
                          className="matching-pair"
                          key={index}
                        >

                          <div className="pair-header">

                            <strong>

                              {pair.materialCode1}

                              {" "}
                              ↔
                              {" "}
                              {pair.materialCode2}

                            </strong>


                            <span>

                              {Number(
                                pair.similarity || 0
                              ).toFixed(2)}%

                            </span>

                          </div>


                          <div className="pair-descriptions">

                            <p>
                              {pair.description1}
                            </p>

                            <p>
                              {pair.description2}
                            </p>

                          </div>


                          {pair.matchReasons &&
                            pair.matchReasons.length >
                              0 && (

                              <div className="pair-reasons">

                                {pair.matchReasons.map(
                                  (reason) => (

                                    <span
                                      key={reason}
                                    >
                                      {reason}
                                    </span>

                                  )
                                )}

                              </div>

                            )}

                        </div>

                      )
                    )}

                  </>

                )}

            </div>


            {/* MODAL FOOTER */}

            <div className="duplicate-modal-footer">

              <div>

                <BrainCircuit size={16} />

                <span>
                  AI-generated analysis
                </span>

              </div>


              <button
                onClick={() =>
                  setSelectedGroup(null)
                }
              >
                Close
              </button>

            </div>

          </div>

        </div>

      )}

    </div>

  );

}


export default Duplicates;