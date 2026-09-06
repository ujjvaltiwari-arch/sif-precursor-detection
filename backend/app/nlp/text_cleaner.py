"""Text cleaning and normalization for safety reports."""

import re
from typing import Optional

SAFETY_ABBREVIATIONS = {
    "LOTO": "Lockout Tagout",
    "PPE": "Personal Protective Equipment",
    "SIF": "Serious Injury Fatality",
    "JSA": "Job Safety Analysis",
    "PTW": "Permit to Work",
    "H2S": "Hydrogen Sulfide",
    "EHS": "Environment Health Safety",
    "OSHA": "Occupational Safety Health Administration",
    "MOC": "Management of Change",
    "SIMOPS": "Simultaneous Operations",
    "HAZOP": "Hazard and Operability Study",
    "TA": "Turnaround",
    "BBS": "Behavior Based Safety",
    "NEBOSH": "National Examination Board Occupational Safety Health",
}

PATTERNS_TO_REMOVE = [
    r"\b\d{3,}\b",                       # long numbers (IDs, codes)
    r"[^\w\s.,;:!?()/'-]",               # special chars except common punctuation
    r"\s+",                               # extra whitespace
]


class TextCleaner:
    """Clean and normalize safety report text."""

    def __init__(
        self,
        expand_abbreviations: bool = True,
        lowercase: bool = False,
        remove_numbers: bool = False,
    ):
        self.expand_abbreviations = expand_abbreviations
        self.lowercase = lowercase
        self.remove_numbers = remove_numbers

    def clean(self, text: str) -> str:
        if not text or not text.strip():
            return ""

        text = text.strip()
        text = self._normalize_whitespace(text)
        text = self._expand_abbreviations(text)
        text = self._remove_pii_patterns(text)

        if self.remove_numbers:
            text = re.sub(r"\b\d+\b", "", text)

        if self.lowercase:
            text = text.lower()

        text = self._normalize_whitespace(text)
        return text

    def _normalize_whitespace(self, text: str) -> str:
        return re.sub(r"\s+", " ", text).strip()

    def _expand_abbreviations(self, text: str) -> str:
        if not self.expand_abbreviations:
            return text
        for abbr, full in SAFETY_ABBREVIATIONS.items():
            text = re.sub(rf"\b{abbr}\b", full, text, flags=re.IGNORECASE)
        return text

    def _remove_pii_patterns(self, text: str) -> str:
        text = re.sub(r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b", "[EMAIL]", text)
        text = re.sub(r"\b\d{10,}\b", "[PHONE]", text)
        return text


class SafetyKeywordExtractor:
    """Extract safety-relevant keywords from report text."""

    HAZARD_KEYWORDS = {
        "electrical": ["electrical", "shock", "electrocution", "arc flash", "wiring", "cable"],
        "mechanical": ["mechanical", "moving parts", "entanglement", "crush", "pinch point"],
        "gravity": ["fall", "height", "elevation", "scaffold", "ladder", "working above"],
        "chemical": ["chemical", "exposure", "spill", "leak", "toxic", "fume", "vapor"],
        "pressure": ["pressure", "rupture", "burst", "pipeline", "vessel"],
        "fire": ["fire", "flame", "combustion", "ignition", "burn"],
        "confined_space": ["confined space", "enclosed", "tank", "vessel entry"],
        "loto": ["lockout", "tagout", "isolation", "energy isolation"],
        "ppe": ["PPE", "helmet", "gloves", "safety shoes", "goggles", "harness"],
        "procedures": ["procedure", "permit", "authorization", "approval", "protocol"],
    }

    CONTROL_KEYWORDS = {
        "gas_testing": ["gas test", "atmosphere test", "gas monitoring"],
        "isolation": ["isolation", "lockout", "tagout", "de-energize"],
        "permit": ["permit", "PTW", "permit to work", "work permit"],
        "supervision": ["supervision", "supervisor", "monitoring", " oversight"],
        "training": ["training", "certification", "competent person"],
        "barriers": ["barrier", "barricade", "fencing", "warning sign"],
        "emergency": ["emergency", "rescue", "first aid", "evacuation"],
    }

    def extract_hazards(self, text: str) -> list[str]:
        text_lower = text.lower()
        found = []
        for hazard_type, keywords in self.HAZARD_KEYWORDS.items():
            if any(kw in text_lower for kw in keywords):
                found.append(hazard_type)
        return found

    def extract_missing_controls(self, text: str) -> list[str]:
        text_lower = text.lower()
        found = []
        absence_patterns = [
            r"without\s+(?:proper\s+)?(?:a\s+)?(.+?)(?:\.|,|$)",
            r"failed to\s+(.+?)(?:\.|,|$)",
            r"did not\s+(?:have|use|wear|perform|conduct)\s+(.+?)(?:\.|,|$)",
            r"lack of\s+(.+?)(?:\.|,|$)",
            r"no\s+(?:proper\s+)?(.+?)(?:\.|,|$)",
            r"absence of\s+(.+?)(?:\.|,|$)",
        ]
        for pattern in absence_patterns:
            matches = re.findall(pattern, text_lower)
            for match in matches:
                found.append(match.strip())
        return list(set(found))

    def extract_phrases(self, text: str, top_k: int = 5) -> list[str]:
        """Extract important phrases using simple frequency scoring."""
        sentences = re.split(r"[.!?]", text)
        scored = []
        for sent in sentences:
            sent = sent.strip()
            if len(sent) < 10:
                continue
            score = 0
            text_lower = sent.lower()
            for keywords in self.HAZARD_KEYWORDS.values():
                score += sum(1 for kw in keywords if kw in text_lower)
            for keywords in self.CONTROL_KEYWORDS.values():
                score += sum(1 for kw in keywords if kw in text_lower)
            if any(word in text_lower for word in ["without", "failed", "did not", "lack", "no ", "absence"]):
                score += 2
            if score > 0:
                scored.append((sent.strip(), score))
        scored.sort(key=lambda x: x[1], reverse=True)
        return [s[0] for s in scored[:top_k]]
