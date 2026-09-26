import re

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

from semantic_matcher import (
    calculate_semantic_similarity
)


def normalize_text(value):

    if not value:
        return ""

    text = str(value).lower().strip()

    replacements = {
        "stainless steel": "ss",
        "hexagonal": "hex",
        "hexagon": "hex",
        "millimeter": "mm",
        "millimetre": "mm",
        "nos": "pcs",
        "ea": "pcs",
    }

    for old, new in replacements.items():
        text = text.replace(old, new)

    text = text.replace("*", " x ")
    text = text.replace("×", " x ")
    text = text.replace("-", " ")

    text = re.sub(r"([a-z]+)(\d+)", r"\1 \2", text)
    text = re.sub(r"(\d+)(mm)\b", r"\1 mm", text)
    text = re.sub(r"[^a-z0-9\s]", " ", text)
    text = re.sub(r"\s+", " ", text).strip()

    return text


def normalize_unit(value):

    value = normalize_text(value)

    unit_mapping = {
        "pcs": "each",
        "piece": "each",
        "pieces": "each",
        "nos": "each",
        "ea": "each",
        "each": "each"
    }

    return unit_mapping.get(value, value)


def field_similarity(value1, value2, unit=False):

    if unit:
        value1 = normalize_unit(value1)
        value2 = normalize_unit(value2)

    else:
        value1 = normalize_text(value1)
        value2 = normalize_text(value2)

    if not value1 or not value2:
        return 0.0

    if value1 == value2:
        return 1.0

    return 0.0


def create_material_text(material):

    fields = [
        material.get("description", ""),
        material.get("materialType", ""),
        material.get("materialGroup", ""),
        material.get("grade", ""),
        material.get("size", ""),
        material.get("standard", "")
    ]

    return " ".join(
        normalize_text(field)
        for field in fields
        if field
    )


def calculate_description_similarity(target, materials):

    target_description = normalize_text(
        target.get("description", "")
    )

    descriptions = [
        normalize_text(
            material.get("description", "")
        )
        for material in materials
    ]

    all_texts = [
        target_description
    ] + descriptions

    vectorizer = TfidfVectorizer(
        analyzer="char_wb",
        ngram_range=(2, 5)
    )

    vectors = vectorizer.fit_transform(all_texts)

    similarities = cosine_similarity(
        vectors[0:1],
        vectors[1:]
    )[0]

    return similarities


def classify_match(score):

    if score >= 90:
        return "HIGH_SIMILARITY"

    elif score >= 70:
        return "NEAR_DUPLICATE"

    elif score >= 50:
        return "POTENTIAL_MATCH"

    else:
        return "DIFFERENT"


def find_matches(
        target_material,
        materials,
        top_n=5):

    if not materials:
        return []

    # -----------------------------------------
    # 1. TF-IDF similarity
    # -----------------------------------------

    tfidf_scores = calculate_description_similarity(
        target_material,
        materials
    )

    # -----------------------------------------
    # 2. Sentence-BERT similarity
    # -----------------------------------------

    semantic_scores = calculate_semantic_similarity(
        target_material,
        materials
    )

    results = []

    for index, material in enumerate(materials):

        # Don't compare material with itself
        if (
            target_material.get("materialCode")
            and material.get("materialCode")
            == target_material.get("materialCode")
        ):
            continue

        # -----------------------------------------
        # TF-IDF score
        # -----------------------------------------

        tfidf_score = (
            float(tfidf_scores[index]) * 100
        )

        # -----------------------------------------
        # Sentence-BERT score
        # -----------------------------------------

        semantic_score = (
            float(semantic_scores[index]) * 100
        )

        # -----------------------------------------
        # Attribute similarities
        # -----------------------------------------

        material_type_score = field_similarity(
            target_material.get("materialType"),
            material.get("materialType")
        )

        material_group_score = field_similarity(
            target_material.get("materialGroup"),
            material.get("materialGroup")
        )

        grade_score = field_similarity(
            target_material.get("grade"),
            material.get("grade")
        )

        size_score = field_similarity(
            target_material.get("size"),
            material.get("size")
        )

        standard_score = field_similarity(
            target_material.get("standard"),
            material.get("standard")
        )

        unit_score = field_similarity(
            target_material.get("unit"),
            material.get("unit"),
            unit=True
        )

        # -----------------------------------------
        # Hybrid AI score
        # -----------------------------------------

        final_score = (

            tfidf_score * 0.20

            + semantic_score * 0.30

            + material_type_score * 100 * 0.10

            + material_group_score * 100 * 0.05

            + grade_score * 100 * 0.10

            + size_score * 100 * 0.15

            + standard_score * 100 * 0.10

        )

        final_score = round(
            min(final_score, 100),
            2
        )

        match_type = classify_match(
            final_score
        )

        # -----------------------------------------
        # Match reasons
        # -----------------------------------------

        reasons = []

        if semantic_score >= 80:
            reasons.append(
                "High semantic similarity"
            )

        if tfidf_score >= 80:
            reasons.append(
                "High description similarity"
            )

        if material_type_score == 1:
            reasons.append(
                "Same material type"
            )

        if material_group_score == 1:
            reasons.append(
                "Same material group"
            )

        if grade_score == 1:
            reasons.append(
                "Same grade"
            )

        if size_score == 1:
            reasons.append(
                "Same size"
            )

        if standard_score == 1:
            reasons.append(
                "Same standard"
            )

        if unit_score == 1:
            reasons.append(
                "Equivalent UOM"
            )

        results.append({

            "materialCode":
                material.get("materialCode"),

            "cpseName":
                material.get("cpseName"),

            "description":
                material.get("description"),

            "materialType":
                material.get("materialType"),

            "materialGroup":
                material.get("materialGroup"),

            "grade":
                material.get("grade"),

            "size":
                material.get("size"),

            "standard":
                material.get("standard"),

            "unit":
                material.get("unit"),

            "tfidfScore":
                round(tfidf_score, 2),

            "semanticScore":
                round(semantic_score, 2),

            "similarity":
                final_score,

            "matchType":
                match_type,

            "matchReasons":
                reasons
        })

    # -----------------------------------------
    # Sort highest similarity first
    # -----------------------------------------

    results.sort(
        key=lambda x: x["similarity"],
        reverse=True
    )

    return results[:top_n]