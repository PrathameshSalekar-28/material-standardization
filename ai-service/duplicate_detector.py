from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

from matcher import (
    normalize_text,
    field_similarity,
    classify_match,
)

from semantic_matcher import (
    model,
    create_material_text,
)


def detect_duplicate_groups(materials, threshold=88):

    if not materials:
        return []

    material_count = len(materials)

    # =========================================
    # 1. Create normalized descriptions
    # =========================================

    descriptions = [
        normalize_text(
            material.get("description", "")
        )
        for material in materials
    ]

    # =========================================
    # 2. Calculate TF-IDF ONCE
    # =========================================

    vectorizer = TfidfVectorizer(
        analyzer="char_wb",
        ngram_range=(2, 5)
    )

    tfidf_matrix = vectorizer.fit_transform(
        descriptions
    )

    tfidf_similarity = cosine_similarity(
        tfidf_matrix
    )

    # =========================================
    # 3. Calculate Sentence-BERT ONCE
    # =========================================

    material_texts = [
        create_material_text(material)
        for material in materials
    ]

    embeddings = model.encode(
        material_texts,
        normalize_embeddings=True
    )

    semantic_similarity = cosine_similarity(
        embeddings
    )

    # =========================================
    # 4. Compare unique material pairs
    # =========================================

    matching_pairs = []

    for i in range(material_count):

        for j in range(i + 1, material_count):

            material1 = materials[i]
            material2 = materials[j]

            # =================================
            # HARD MATERIAL TYPE CHECK
            # =================================

            type1 = normalize_text(
                material1.get("materialType")
            )

            type2 = normalize_text(
                material2.get("materialType")
            )

            # If both material types exist and
            # are different, they cannot be
            # treated as duplicates.
            if type1 and type2 and type1 != type2:
                continue

            # =================================
            # Similarity calculations
            # =================================

            tfidf_score = (
                float(tfidf_similarity[i][j]) * 100
            )

            semantic_score = (
                float(semantic_similarity[i][j]) * 100
            )

            material_type_score = field_similarity(
                material1.get("materialType"),
                material2.get("materialType")
            )

            material_group_score = field_similarity(
                material1.get("materialGroup"),
                material2.get("materialGroup")
            )

            grade_score = field_similarity(
                material1.get("grade"),
                material2.get("grade")
            )

            size_score = field_similarity(
                material1.get("size"),
                material2.get("size")
            )

            standard_score = field_similarity(
                material1.get("standard"),
                material2.get("standard")
            )

            unit_score = field_similarity(
                material1.get("unit"),
                material2.get("unit"),
                unit=True
            )

            # =================================
            # Hybrid similarity score
            # =================================

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

            # =================================
            # Threshold
            # =================================

            if final_score < threshold:
                continue

            match_type = classify_match(
                final_score
            )

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

            matching_pairs.append({

                "materialCode1":
                    material1.get("materialCode"),

                "cpseName1":
                    material1.get("cpseName"),

                "description1":
                    material1.get("description"),

                "materialCode2":
                    material2.get("materialCode"),

                "cpseName2":
                    material2.get("cpseName"),

                "description2":
                    material2.get("description"),

                "similarity":
                    final_score,

                "matchType":
                    match_type,

                "matchReasons":
                    reasons
            })

    # =========================================
    # 5. Sort strongest matches first
    # =========================================

    matching_pairs.sort(
        key=lambda x: x["similarity"],
        reverse=True
    )

    # =========================================
    # 6. Union-Find
    # =========================================

    parent = {
        material.get("materialCode"):
            material.get("materialCode")
        for material in materials
    }

    def find(code):

        while parent[code] != code:

            parent[code] = parent[
                parent[code]
            ]

            code = parent[code]

        return code

    def union(code1, code2):

        root1 = find(code1)
        root2 = find(code2)

        if root1 != root2:
            parent[root2] = root1

    for pair in matching_pairs:

        union(
            pair["materialCode1"],
            pair["materialCode2"]
        )

    # =========================================
    # 7. Create groups
    # =========================================

    grouped_materials = {}

    for material in materials:

        code = material.get(
            "materialCode"
        )

        root = find(code)

        if root not in grouped_materials:
            grouped_materials[root] = []

        grouped_materials[root].append(
            material
        )

    # =========================================
    # 8. Build final response
    # =========================================

    groups = []

    for group_materials in grouped_materials.values():

        if len(group_materials) < 2:
            continue

        group_codes = {
            material.get("materialCode")
            for material in group_materials
        }

        group_pairs = [
            pair
            for pair in matching_pairs
            if (
                pair["materialCode1"]
                in group_codes
                and
                pair["materialCode2"]
                in group_codes
            )
        ]

        highest_similarity = max(
            pair["similarity"]
            for pair in group_pairs
        )

        formatted_materials = []

        for material in group_materials:

            formatted_materials.append({

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
                    material.get("unit")
            })

        groups.append({

            "groupId":
                f"DUP-{len(groups) + 1:03d}",

            "materialCount":
                len(formatted_materials),

            "highestSimilarity":
                highest_similarity,

            "materials":
                formatted_materials,

            "matchingPairs":
                group_pairs
        })

    return groups