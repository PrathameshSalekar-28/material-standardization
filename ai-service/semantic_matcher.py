from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity


# Load model once when the AI service starts
model = SentenceTransformer("all-MiniLM-L6-v2")


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
        str(field)
        for field in fields
        if field
    )


def calculate_semantic_similarity(target, materials):

    target_text = create_material_text(target)

    material_texts = [
        create_material_text(material)
        for material in materials
    ]

    target_embedding = model.encode(
        [target_text],
        normalize_embeddings=True
    )

    material_embeddings = model.encode(
        material_texts,
        normalize_embeddings=True
    )

    similarities = cosine_similarity(
        target_embedding,
        material_embeddings
    )[0]

    return similarities