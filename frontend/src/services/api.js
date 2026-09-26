
import axios from "axios";
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8080/api",
  headers: {
    "Content-Type": "application/json",
  },
});


// ================================
// MATERIAL APIs
// ================================

export const getMaterials = () => {
  return API.get("/materials");
};


// ================================
// AI APIs
// ================================

export const getDuplicateGroups = async () => {

  const response = await API.get("/ai/duplicates");

  return {
    ...response,
    data: response.data?.duplicateGroups || [],
  };

};


export const getMaterialMatches = (
  materialId,
  topN = 5
) => {

  return API.get(`/ai/match/${materialId}`, {
    params: {
      topN,
    },
  });

};


// ================================
// STANDARDIZATION APIs
// ================================

export const getStandardizedMaterials = () => {
  return API.get("/standardized-materials");
};


export const getPendingApprovals = () => {
  return API.get("/standardized-materials/pending");
};


// ================================
// APPROVAL HISTORY APIs
// ================================

export const getApprovalHistory = () => {
  return API.get("/standardized-materials/history");
};


// CPSE Mapping Audit History
export const getCpseMappingHistory = () => {
  return API.get("/cpse-mappings/history");
};


// ================================
// APPROVAL APIs
// ================================

export const approveMaterial = (
  id,
  reviewer = "Admin"
) => {

  return API.post(
    `/standardized-materials/${id}/approve`,
    null,
    {
      params: {
        reviewer,
      },
    }
  );

};


export const rejectMaterial = (
  id,
  reviewer = "Admin"
) => {

  return API.post(
    `/standardized-materials/${id}/reject`,
    null,
    {
      params: {
        reviewer,
      },
    }
  );

};


export default API;

