"""Tests for text cleaner and keyword extractor."""

from app.nlp.text_cleaner import TextCleaner, SafetyKeywordExtractor


def test_cleaner_removes_extra_whitespace():
    cleaner = TextCleaner()
    result = cleaner.clean("  Worker   fell   from   height  ")
    assert result == "Worker fell from height"


def test_cleaner_expands_abbreviations():
    cleaner = TextCleaner(expand_abbreviations=True)
    result = cleaner.clean("Worker did not wear PPE near LOTO zone")
    assert "Personal Protective Equipment" in result
    assert "Lockout Tagout" in result


def test_cleaner_handles_empty_input():
    cleaner = TextCleaner()
    assert cleaner.clean("") == ""
    assert cleaner.clean("   ") == ""
    assert cleaner.clean(None) == ""


def test_cleaner_removes_pii():
    cleaner = TextCleaner()
    result = cleaner.clean("Contact john@example.com for details or call 9876543210")
    assert "john@example.com" not in result
    assert "9876543210" not in result


def test_keyword_extractor_finds_hazards():
    extractor = SafetyKeywordExtractor()
    hazards = extractor.extract_hazards("Worker entered confined space without gas testing")
    assert "confined_space" in hazards


def test_keyword_extractor_finds_multiple_hazards():
    extractor = SafetyKeywordExtractor()
    hazards = extractor.extract_hazards(
        "Electrician performed live electrical work without LOTO near flammable chemicals"
    )
    assert "electrical" in hazards
    assert "chemical" in hazards


def test_keyword_extractor_extracts_phrases():
    extractor = SafetyKeywordExtractor()
    phrases = extractor.extract_phrases(
        "Worker entered confined space. Without proper gas testing. Isolation was not performed."
    )
    assert len(phrases) > 0
    assert any("confined" in p.lower() for p in phrases)


def test_missing_controls_detection():
    extractor = SafetyKeywordExtractor()
    controls = extractor.extract_missing_controls(
        "Worker entered without proper gas testing and no permit to work"
    )
    assert len(controls) > 0
