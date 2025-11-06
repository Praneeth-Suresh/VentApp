import os
import json
from datetime import datetime
from typing import Dict, List, Tuple
import firebase_admin
from firebase_admin import credentials, firestore

# Initialize Firebase
FIREBASE_CREDS = os.getenv('FIREBASE_CREDS_JSON')
if not FIREBASE_CREDS:
    print("[v0] FIREBASE_CREDS_JSON not set")
    exit(1)

try:
    creds_dict = json.loads(FIREBASE_CREDS)
    creds = credentials.Certificate(creds_dict)
    firebase_admin.initialize_app(creds)
except Exception as e:
    print(f"[v0] Firebase init error: {e}")
    exit(1)

db = firestore.client()

def calculate_relevance_score(text: str) -> float:
    """
    Calculate relevance score based on text length and keyword presence.
    Range: 0.0 - 1.0
    """
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
    """
    Calculate sentiment score. Range: -1.0 (negative) to 1.0 (positive)
    """
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

def process_submissions() -> Dict:
    """
    Process all approved submissions and calculate analytics.
    """
    try:
        # Get all approved submissions
        approved_docs = db.collection('submissions').where(
            'status', '==', 'approved'
        ).stream()

        submissions = []
        for doc in approved_docs:
            data = doc.to_dict()
            data['id'] = doc.id
            submissions.append(data)

        print(f"[v0] Processing {len(submissions)} approved submissions")

        if len(submissions) == 0:
            return {
                'total_submissions': 0,
                'average_relevance': 0.0,
                'average_sentiment': 0.0,
                'flagged_count': 0,
                'sentiment_distribution': {}
            }

        # Calculate scores for each submission
        relevance_scores = []
        sentiment_scores = []
        sentiment_dist = {'positive': 0, 'neutral': 0, 'negative': 0}

        for submission in submissions:
            content = submission.get('content', '')

            # Calculate scores
            relevance = calculate_relevance_score(content)
            sentiment = calculate_sentiment_score(content)

            relevance_scores.append(relevance)
            sentiment_scores.append(sentiment)

            # Classify sentiment
            if sentiment > 0.2:
                sentiment_dist['positive'] += 1
            elif sentiment < -0.2:
                sentiment_dist['negative'] += 1
            else:
                sentiment_dist['neutral'] += 1

            # Update submission with scores
            db.collection('submissions').document(submission['id']).update({
                'relevance_score': relevance,
                'sentiment_score': sentiment
            })

        # Get flagged count
        flagged_docs = db.collection('submissions').where(
            'status', '==', 'flagged'
        ).stream()
        flagged_count = sum(1 for _ in flagged_docs)

        # Calculate averages
        avg_relevance = sum(relevance_scores) / len(relevance_scores) if relevance_scores else 0.0
        avg_sentiment = sum(sentiment_scores) / len(sentiment_scores) if sentiment_scores else 0.0

        analytics = {
            'total_submissions': len(submissions),
            'average_relevance': avg_relevance,
            'average_sentiment': avg_sentiment,
            'flagged_count': flagged_count,
            'sentiment_distribution': sentiment_dist
        }

        return analytics

    except Exception as e:
        print(f"[v0] Analytics processing error: {e}")
        raise

def save_analytics(analytics: Dict) -> None:
    """
    Save analytics to Firestore.
    """
    try:
        today = datetime.utcnow().strftime('%Y-%m-%d')

        db.collection('analytics').add({
            'date': today,
            'total_submissions': analytics['total_submissions'],
            'average_relevance': analytics['average_relevance'],
            'average_sentiment': analytics['average_sentiment'],
            'flagged_count': analytics['flagged_count'],
            'sentiment_distribution': analytics['sentiment_distribution'],
            'timestamp': datetime.utcnow().isoformat()
        })

        print(f"[v0] Analytics saved: {analytics}")

    except Exception as e:
        print(f"[v0] Analytics save error: {e}")
        raise

if __name__ == '__main__':
    try:
        analytics = process_submissions()
        save_analytics(analytics)
        print("[v0] Analytics job completed successfully")
    except Exception as e:
        print(f"[v0] Analytics job failed: {e}")
        exit(1)
