from fastapi import FastAPI
from pydantic import BaseModel
from typing import List

from matcher import find_matches
from duplicate_detector import detect_duplicate_groups


app = FastAPI(
    title="Material Standardization AI Service",
    description="AI service for material similarity, duplicate detection and standardization",
    version="1.0.0"
)


# =========================================
# Material Model
# =========================================

class Material(BaseModel):

    materialCode: str
    description: str

    materialType: str | None = None
    materialGroup: str | None = None
    grade: str | None = None
    size: str | None = None
    standard: str | None = None
    diameter: str | None = None
    length: str | None = None
    unit: str | None = None
    cpseName: str | None = None


# =========================================
# Request Model - Material Matching
# =========================================

class MatchRequest(BaseModel):

    target: Material
    materials: List[Material]
    top_n: int = 5


# =========================================
# Request Model - Duplicate Detection
# =========================================

class DuplicateRequest(BaseModel):

    materials: List[Material]


# =========================================
# Home
# =========================================

@app.get("/")
def home():

    return {
        "message": "Material AI Service is running",
        "status": "success"
    }


# =========================================
# Health Check
# =========================================

@app.get("/health")
def health():

    return {
        "service": "Material AI Matching Service",
        "status": "UP"
    }


# =========================================
# AI Material Matching
# =========================================

@app.post("/match")
def match_materials(request: MatchRequest):

    target = request.target.model_dump()

    materials = [
        material.model_dump()
        for material in request.materials
    ]

    matches = find_matches(
        target,
        materials,
        request.top_n
    )

    return {
        "target": target,
        "matches": matches
    }


# =========================================
# Duplicate Material Detection
# =========================================

@app.post("/duplicates")
def detect_duplicates(request: DuplicateRequest):

    materials = [
        material.model_dump()
        for material in request.materials
    ]

    groups = detect_duplicate_groups(
        materials
    )

    return {
        "totalMaterials": len(materials),
        "duplicateGroups": groups
    }