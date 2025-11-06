"""
Test script for analytics calculation.
Run locally to verify analytics before production deployment.
"""

import json
import sys

def calculate_relevance_score(text: str) -> float:
    """Test relevance scoring algorithm"""
    if not text or len(text.strip()) == 0:
        return 0.0

    score = 0.0

    # Length score (0.0 - 0.3)
    if len(text) >= 50:
        score += 0.3
    elif len(text) >= 20:
        score += 0.15

    # Keyword relevance (0.0 - 0.4)
    keywords = ['improve', 'issue', 'problem', 'suggest', 'feedback', 'better', 'need', 'want', 'should']
    text_lower = text.lower()
    keyword_count = sum(1 for kw in keywords if kw in text_lower)
    score += min(0.4, keyword_count * 0.05)

    # Specificity score (0.0 - 0.3)
    if any(char.isdigit() for char in text):
        score += 0.1
    if any(word in text_lower for word in ['faculty', 'department', 'module', 'building', 'hostel']):
        score += 0.15
    if any(char in text for char in ['!', '?']):
        score += 0.05

    return min(1.0, score)

def calculate_sentiment_score(text: str) -> float:
    """Test sentiment scoring algorithm"""
    if not text:
        return 0.0

    text_lower = text.lower()

    positive_words = ['good', 'great', 'excellent', 'amazing', 'love', 'appreciate', 'thank', 'improve', 'better']
    negative_words = ['bad', 'terrible', 'awful', 'hate', 'poor', 'issue', 'problem', 'broken', 'fail', 'waste']

    positive_count = sum(1 for word in positive_words if word in text_lower)
    negative_count = sum(1 for word in negative_words if word in text_lower)

    total = positive_count + negative_count

    if total == 0:
        return 0.0

    sentiment = (positive_count - negative_count) / total if total > 0 else 0.0
    return max(-1.0, min(1.0, sentiment))

def run_tests():
    """Run test cases for scoring algorithms"""
    
    test_cases = [
        {
            "name": "Low relevance, negative sentiment",
            "text": "bad",
            "expected_relevance": (0.0, 0.15),  # range
            "expected_sentiment": (-1.0, -0.5)
        },
        {
            "name": "Medium relevance, neutral",
            "text": "The library is okay",
            "expected_relevance": (0.15, 0.4),
            "expected_sentiment": (-0.2, 0.2)
        },
        {
            "name": "High relevance, positive",
            "text": "I really love the new module improvements! Faculty E2-03 is amazing for studying.",
            "expected_relevance": (0.6, 1.0),
            "expected_sentiment": (0.5, 1.0)
        },
        {
            "name": "Specific problem report",
            "text": "The canteen in Building 3 needs better wifi. It keeps dropping at 2pm-3pm daily.",
            "expected_relevance": (0.6, 1.0),
            "expected_sentiment": (-0.5, 0.2)
        },
    ]

    print("[v0] Running Analytics Algorithm Tests\n")
    print("-" * 60)

    passed = 0
    failed = 0

    for test in test_cases:
        relevance = calculate_relevance_score(test["text"])
        sentiment = calculate_sentiment_score(test["text"])

        relevance_ok = test["expected_relevance"][0] <= relevance <= test["expected_relevance"][1]
        sentiment_ok = test["expected_sentiment"][0] <= sentiment <= test["expected_sentiment"][1]

        status = "✓ PASS" if (relevance_ok and sentiment_ok) else "✗ FAIL"

        print(f"\n{status}: {test['name']}")
        print(f"  Text: \"{test['text'][:50]}...\"")
        print(f"  Relevance: {relevance:.3f} (expected: {test['expected_relevance']})")
        print(f"  Sentiment: {sentiment:.3f} (expected: {test['expected_sentiment']})")

        if relevance_ok and sentiment_ok:
            passed += 1
        else:
            failed += 1

    print(f"\n{'-' * 60}")
    print(f"Results: {passed} passed, {failed} failed")

    if failed == 0:
        print("[v0] All tests passed!")
        return 0
    else:
        print("[v0] Some tests failed")
        return 1

if __name__ == "__main__":
    sys.exit(run_tests())
