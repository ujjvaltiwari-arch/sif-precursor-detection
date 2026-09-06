"""TF-IDF feature extractor for safety reports."""

import json
from pathlib import Path

import joblib
from sklearn.feature_extraction.text import TfidfVectorizer


class FeatureExtractor:
    """TF-IDF based feature extraction."""

    def __init__(
        self,
        max_features: int = 50000,
        ngram_range: tuple[int, int] = (1, 3),
        min_df: int = 2,
        max_df: float = 0.95,
        sublinear_tf: bool = True,
    ):
        self.vectorizer = TfidfVectorizer(
            max_features=max_features,
            ngram_range=ngram_range,
            min_df=min_df,
            max_df=max_df,
            sublinear_tf=sublinear_tf,
            strip_accents="unicode",
            analyzer="word",
            token_pattern=r"\b[a-zA-Z]{2,}\b",
        )
        self._fitted = False

    def fit(self, texts: list[str]) -> "FeatureExtractor":
        self.vectorizer.fit(texts)
        self._fitted = True
        return self

    def transform(self, texts: list[str]):
        if not self._fitted:
            raise RuntimeError("FeatureExtractor must be fitted before transform")
        return self.vectorizer.transform(texts)

    def fit_transform(self, texts: list[str]):
        self._fitted = True
        return self.vectorizer.fit_transform(texts)

    def get_feature_names_out(self) -> list[str]:
        return list(self.vectorizer.get_feature_names_out())

    def get_top_features(self, vector, top_k: int = 10) -> list[tuple[str, float]]:
        feature_names = self.get_feature_names_out()
        if hasattr(vector, "toarray"):
            arr = vector.toarray().flatten()
        else:
            arr = vector.flatten()
        top_indices = arr.argsort()[-top_k:][::-1]
        return [(feature_names[i], float(arr[i])) for i in top_indices if arr[i] > 0]

    def save(self, directory: str) -> None:
        path = Path(directory)
        path.mkdir(parents=True, exist_ok=True)
        joblib.dump(self.vectorizer, path / "tfidf_vectorizer.joblib")
        meta = {
            "max_features": self.vectorizer.max_features,
            "ngram_range": list(self.vectorizer.ngram_range),
            "min_df": self.vectorizer.min_df,
            "max_df": self.vectorizer.max_df,
            "vocabulary_size": len(self.vectorizer.vocabulary_),
        }
        with open(path / "feature_extractor_config.json", "w") as f:
            json.dump(meta, f, indent=2)

    @classmethod
    def load(cls, directory: str) -> "FeatureExtractor":
        path = Path(directory)
        instance = cls()
        instance.vectorizer = joblib.load(path / "tfidf_vectorizer.joblib")
        instance._fitted = True
        return instance
