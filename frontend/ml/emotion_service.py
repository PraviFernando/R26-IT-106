"""
================================================================
BLOOM  Improved ML Emotion Analysis Service
================================================================
Flask API that predicts emotion, reason, and risk level from
a postpartum mother's diary text entry.

HOW IT WORKS:
  1. Text comes in via POST /analyze
  2. Preprocessor cleans the text
  3. Emotion pipeline (TF-IDF + LinearSVC) predicts emotion
  4. Reason  pipeline (TF-IDF + LinearSVC) predicts reason
  5. Risk engine applies rule-based logic on top of ML output
  6. Returns { emotion, primaryReason, riskLevel }

TO ADD MORE TRAINING DATA:
   Open training_data.py
   Add sentences to the relevant category list
   Call POST /retrain  (or restart the server)

ENDPOINTS:
  GET  /health         service status
  POST /analyze        main prediction
  POST /retrain        re-train models from training_data.py
  GET  /accuracy       show training set size per class

PORTS:
  Default: 5001
================================================================
"""

import re
import pickle
import os
import importlib
import pandas as pd
import numpy as np

from flask import Flask, request, jsonify
from flask_cors import CORS

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.svm import LinearSVC
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier
from sklearn.pipeline import Pipeline
from sklearn.model_selection import cross_val_score

from training_data import (
    TRAIN_TEXTS,
    TRAIN_REASONS,
    TRAIN_EMOTIONS,
    TOTAL_EXAMPLES
)

# ============================================================
# MODEL CONFIGURATION
# ============================================================
# Possible values: "svm", "decision_tree", "random_forest"
MODEL_TYPE = "random_forest"

# ============================================================
# FLASK APP
# ============================================================

app = Flask(__name__)

CORS(
    app,
    supports_credentials=True,
    resources={r"/*": {"origins": "*"}}
)

# ============================================================
# MODEL FILES
# ============================================================

EMOTION_MODEL_PATH = "emotion_model.pkl"
REASON_MODEL_PATH = "reason_model.pkl"

# ============================================================
# LOAD EXCEL RECOMMENDATIONS
# ============================================================

RECOMMENDATIONS_DATA = []

def load_recommendations():
    global RECOMMENDATIONS_DATA

    try:
        df = pd.read_excel("recommendations.xlsx")

        df.columns = df.columns.str.strip()

        df["risk_level"] = df["risk_level"].astype(str).str.strip().str.lower()
        df["reason"] = df["reason"].astype(str).str.strip().str.lower()
        df["emotion"] = df["emotion"].astype(str).str.strip().str.lower()

        RECOMMENDATIONS_DATA = df.to_dict(orient="records")

        print(f"[OK] Loaded {len(RECOMMENDATIONS_DATA)} recommendation rows")
        
        # Print unique values for debugging
        if len(RECOMMENDATIONS_DATA) > 0:
            print(f"[DEBUG] Available risk levels: {set([r['risk_level'] for r in RECOMMENDATIONS_DATA])}")
            print(f"[DEBUG] Available reasons: {set([r['reason'] for r in RECOMMENDATIONS_DATA])}")
            print(f"[DEBUG] Available emotions: {set([r['emotion'] for r in RECOMMENDATIONS_DATA])}")

    except Exception as e:
        print("[ERROR] Error loading recommendations.xlsx")
        print(e)
        RECOMMENDATIONS_DATA = []

load_recommendations()

# ============================================================
# TEXT PREPROCESSING
# ============================================================

CONTRACTIONS = {
    "can't": "cannot",
    "won't": "will not",
    "don't": "do not",
    "i'm": "i am",
    "it's": "it is",
}

def preprocess(text: str) -> str:
    if not text:
        return ""
    text = text.lower().strip()

    for c, expanded in CONTRACTIONS.items():
        text = text.replace(c, expanded)

    # Normalize Singlish spelling variations
    text = re.sub(r"adanawa", "andanawa", text)
    text = re.sub(r"andanne", "andanawa", text)
    text = re.sub(r"andana", "andanawa", text)
    text = re.sub(r"therenne\s*na\b", "therenne naha", text)
    text = re.sub(r"therenne\s*nehe", "therenne naha", text)
    text = re.sub(r"therum\s*ganna\s*ba\b", "therum ganna baha", text)
    text = re.sub(r"therum\s*ganna\s*nehe", "therum ganna baha", text)
    text = re.sub(r"nida\s*na\b", "nida ganne naha", text)
    text = re.sub(r"nida\s*nehe", "nida ganne naha", text)
    text = re.sub(r"ninda\s*yanne\s*na\b", "ninda yanne naha", text)
    text = re.sub(r"baya\s*hithenawa", "baya", text)
    text = re.sub(r"mahansi\b", "mahansiyi", text)
    text = re.sub(r"['’]", "", text)

    # KEEP Sinhala + English
    text = re.sub(r"[^\w\s\u0D80-\u0DFF]", " ", text)

    text = re.sub(r"\s+", " ", text).strip()

    return text

# ============================================================
# BUILD ML PIPELINE
# ============================================================

def build_pipeline():
    """
    Constructs the Scikit-learn pipeline based on MODEL_TYPE.
    """
    if MODEL_TYPE == "decision_tree":
        clf = DecisionTreeClassifier(
            max_depth=20,
            min_samples_split=4,
            random_state=42,
            class_weight="balanced"
        )
    elif MODEL_TYPE == "random_forest":
        clf = RandomForestClassifier(
            n_estimators=200,
            max_depth=25,
            min_samples_split=4,
            random_state=42,
            class_weight="balanced",
            n_jobs=-1
        )
    else:  # default to svm
        clf = LinearSVC(
            C=1.0,
            class_weight="balanced",
            max_iter=3000,
            random_state=42,
        )

    return Pipeline([
        (
            "tfidf",
            TfidfVectorizer(
                ngram_range=(1, 2),
                max_features=5000,
                sublinear_tf=True,
            ),
        ),
        ("clf", clf),
    ])

# ============================================================
# TRAIN MODELS
# ============================================================

def train_models():

    print(f" Training models on {TOTAL_EXAMPLES} examples")

    cleaned = [preprocess(t) for t in TRAIN_TEXTS]

    emotion_model = build_pipeline()
    emotion_model.fit(cleaned, TRAIN_EMOTIONS)

    reason_model = build_pipeline()
    reason_model.fit(cleaned, TRAIN_REASONS)

    pickle.dump(emotion_model, open(EMOTION_MODEL_PATH, "wb"))
    pickle.dump(reason_model, open(REASON_MODEL_PATH, "wb"))

    print(" Models trained and saved")

    return emotion_model, reason_model

# ============================================================
# LOAD OR TRAIN
# ============================================================

try:

    emotion_model = pickle.load(open(EMOTION_MODEL_PATH, "rb"))
    reason_model = pickle.load(open(REASON_MODEL_PATH, "rb"))

    print(" Models loaded from disk")

except Exception:

    print(" No saved models found")

    emotion_model, reason_model = train_models()

# ============================================================
# RISK ENGINE
# ============================================================

CRISIS_KEYWORDS = [
    "kill myself",
    "want to die",
    "end my life",
    "hurt myself",
]

HIGH_RISK_REASONS = {
    "negative_thoughts"
}

MEDIUM_RISK_REASONS = {
    "bonding_issues",
    "anxiety",
    "overwhelmed",
    "lack_of_support",
    "loss_of_confidence",
}

def get_risk_level(text, reason, emotion):

    text = text.lower()

    if any(word in text for word in CRISIS_KEYWORDS):
        return "high"

    if reason in HIGH_RISK_REASONS:
        return "high"

    if reason in MEDIUM_RISK_REASONS:
        return "medium"

    if emotion in ["stressed", "anxious"]:
        return "medium"

    return "low"

# ============================================================
# RECOMMENDATION ENGINE
# ============================================================

GAME_RECOMMENDATION_MAP = {
    "baby_crying":        ["baby_mood", "sequence_order", "memory_match", "number_seq"],
    "baby_needs":         ["baby_mood", "word_match", "spot_diff", "memory_match"],
    "caring_for_baby":    ["baby_mood", "sequence_order", "pattern_repeat", "word_match"],
    "baby_feeding":       ["baby_mood", "pattern_repeat", "number_seq", "memory_match"],
    "baby_sleep":         ["baby_mood", "mindful_tap", "sliding_puzzle", "word_match"],
    "baby_health":        ["baby_mood", "spot_diff", "sequence_order", "memory_match"],
    "bonding_issues":     ["baby_mood", "memory_match", "pattern_repeat", "word_match"],
    "fatigue":            ["coin_maze", "sliding_puzzle", "word_match", "colouring"],
    "sadness":            ["bubble_pop", "memory_match", "pattern_repeat", "word_builder"],
    "anxiety":            ["bubble_pop", "mindful_tap", "spot_diff", "number_seq"],
    "loneliness":         ["memory_match", "word_builder", "word_match", "pattern_repeat"],
    "anger":              ["bubble_pop", "coin_maze", "spot_diff", "sliding_puzzle"],
    "overwhelmed":        ["bubble_pop", "mindful_tap", "sequence_order", "word_match"],
    "stress":             ["bubble_pop", "spot_diff", "sliding_puzzle", "mindful_tap"],
    "loss_of_confidence": ["affirmation_game", "word_builder", "pattern_repeat", "memory_match"],
    "lack_of_support":    ["word_match", "affirmation_game", "memory_match", "coin_maze"],
    "sleep_problems":     ["colouring", "mandala", "mindful_tap", "sliding_puzzle"],
    "physical_discomfort":["mindful_tap", "colouring", "word_match", "sliding_puzzle"],
    "negative_thoughts":  ["affirmation_game", "word_builder", "spot_diff", "mandala"],
    "general":            ["memory_match", "pattern_repeat", "word_builder", "spot_diff"]
}

ACTIVITIES_RECOMMENDATION_MAP = {
    "baby_crying":        ["baby_mood", "new_deep_breathing", "new_gratitude_journal", "new_positive_affirmations"],
    "baby_needs":         ["baby_mood", "new_deep_breathing", "new_gratitude_journal", "new_positive_affirmations"],
    "baby_feeding":       ["baby_mood", "new_drink_water", "new_gentle_stretch", "new_relaxing_music"],
    "baby_sleep":         ["baby_mood", "new_sleep_reflection", "night_breathing", "rest_meditation"],
    "baby_health":        ["baby_mood", "new_deep_breathing", "new_positive_affirmations", "grounding_54321"],
    "caring_for_baby":    ["baby_mood", "new_deep_breathing", "new_gratitude_journal", "new_positive_affirmations"]
}

def get_recommendations(risk, reason, emotion):

    risk = risk.lower()
    reason = reason.lower().replace(" ", "_")
    emotion = emotion.lower()

    print(f"[RECOMMENDATION] Looking for: risk='{risk}', reason='{reason}', emotion='{emotion}'")
    print(f"[RECOMMENDATION] Total rows in Excel: {len(RECOMMENDATIONS_DATA)}")

    # Resolve games using distinct pool
    games = GAME_RECOMMENDATION_MAP.get(reason, GAME_RECOMMENDATION_MAP["general"])
    is_baby = "baby" in reason or reason in ["bonding_issues", "caring_for_baby", "baby_crying", "baby_feeding", "baby_sleep", "baby_health", "baby_needs"]
    if is_baby:
        if "baby_mood" not in games:
            games = ["baby_mood"] + games
        else:
            games = ["baby_mood"] + [g for g in games if g != "baby_mood"]
    else:
        games = [g for g in games if g != "baby_mood"]
    games = list(dict.fromkeys(games))[:4]

    # Resolve activities
    if reason in ACTIVITIES_RECOMMENDATION_MAP:
        activities = ACTIVITIES_RECOMMENDATION_MAP[reason]
    else:
        # Excel lookup for mother reasons
        search_risks = [risk]
        if risk == "high":
            search_risks.append("medium")
        elif risk == "medium":
            search_risks.append("low")

        row_match = None
        for r in search_risks:
            for row in RECOMMENDATIONS_DATA:
                if row["risk_level"] == r and row["reason"] == reason and row["emotion"] == emotion:
                    row_match = row
                    break
            if row_match:
                break

        if not row_match:
            for r in search_risks:
                for row in RECOMMENDATIONS_DATA:
                    if row["risk_level"] == r and row["reason"] == reason:
                        row_match = row
                        break
                if row_match:
                    break

        if not row_match:
            for row in RECOMMENDATIONS_DATA:
                if row["reason"] == reason:
                    row_match = row
                    break

        if not row_match:
            for r in search_risks:
                for row in RECOMMENDATIONS_DATA:
                    if row["risk_level"] == r and row["emotion"] == emotion:
                        row_match = row
                        break
                if row_match:
                    break

        if row_match:
            def split_csv(val):
                if not val or str(val).lower() == "nan":
                    return []
                return [x.strip() for x in str(val).split(",") if x.strip()]
            raw_acts = split_csv(row_match.get("recommended_activities"))
            activities = []
            for a in raw_acts:
                if a in ["baby_bonding", "new_baby_interaction_ideas"]:
                    if "baby_mood" not in activities:
                        activities.append("baby_mood")
                else:
                    activities.append(a)
        else:
            activities = ["deep_breathing", "journaling"]

    if is_baby:
        if "baby_mood" not in activities:
            activities = ["baby_mood"] + activities
        else:
            activities = ["baby_mood"] + [a for a in activities if a != "baby_mood"]
    else:
        activities = [a for a in activities if a != "baby_mood"]
    activities = list(dict.fromkeys(activities))[:4]

    # Resolve music & videos
    music = []
    videos = []

    lookup_reason = reason
    if reason in ["baby_crying", "baby_needs", "baby_feeding", "caring_for_baby"]:
        lookup_reason = "bonding_issues"
    elif reason == "baby_sleep":
        lookup_reason = "sleep_problems"
    elif reason == "baby_health":
        lookup_reason = "anxiety"

    search_risks = [risk]
    if risk == "high":
        search_risks.append("medium")
    elif risk == "medium":
        search_risks.append("low")

    row_match = None
    for r in search_risks:
        for row in RECOMMENDATIONS_DATA:
            if row["risk_level"] == r and row["reason"] == lookup_reason and row["emotion"] == emotion:
                row_match = row
                break
        if row_match:
            break

    if not row_match:
        for r in search_risks:
            for row in RECOMMENDATIONS_DATA:
                if row["risk_level"] == r and row["reason"] == lookup_reason:
                    row_match = row
                    break
            if row_match:
                break

    if not row_match:
        for row in RECOMMENDATIONS_DATA:
            if row["reason"] == lookup_reason:
                row_match = row
                break

    if row_match:
        def split_csv(val):
            if not val or str(val).lower() == "nan":
                return []
            return [x.strip() for x in str(val).split(",") if x.strip()]
        music = split_csv(row_match.get("recommended_music"))
        videos = split_csv(row_match.get("recommended_videos"))

    return {
        "activities": activities,
        "games": games,
        "music": music,
        "videos": videos,
        "videoUrl": videos[0] if videos else "https://youtu.be/jzGyjLGbAUc"
    }

# ============================================================
# HEALTH ROUTE
# ============================================================

@app.route("/health", methods=["GET"])
def health():

    return jsonify({
        "status": "running",
        "training_examples": TOTAL_EXAMPLES,
        "recommendation_rows": len(RECOMMENDATIONS_DATA)
    })

# ============================================================
# ANALYZE ROUTE
# ============================================================

@app.route("/analyze", methods=["POST"])
def analyze():

    try:

        data = request.get_json()

        text = data.get("text", "").strip()
        # Optional explicit override from request
        explicit_reason = data.get("reason") or data.get("issue")

        if len(text) < 5 and not explicit_reason:
            return jsonify({
                "error": "Text too short"
            }), 400

        cleaned = preprocess(text)

        # 1. Detect Emotion (Keyword priority to match Excel)
        emotion = None
        emotion_keywords = {
            "exhausted": ["exhausted", "burnt out", "no energy", "drained"],
            "worried": ["worried", "nervous", "scared", "fear"],
            "hopeless": ["hopeless", "pointless", "give up", "no future"],
            "sleepy": ["sleepy", "drowsy", "cannot stay awake"],
            "lonely": ["lonely", "alone", "isolated"],
            "alone": ["alone", "nobody"],
        }
        
        for e_key, e_kws in emotion_keywords.items():
            if any(kw in cleaned for kw in e_kws):
                emotion = e_key
                break
        
        if not emotion:
            emotion = emotion_model.predict([cleaned])[0]

        # 2. Detect Reason (prioritize explicit or keywords)
        reason = None

        if explicit_reason:
            reason = explicit_reason.lower().replace(" ", "_")
        else:
            keywords = {
                "baby_crying": ["crying", "cries", "cry", "andanawa", "adanawa", "andana", "අඬනවා", "අඬන", "කෑගහනවා"],
                "baby_needs": ["therenne naha", "therenne na", "therum ganna baha", "one kiyala", "monawada one", "තේරෙන්නේ නැහැ", "තේරෙන්නේ නෑ", "ඕන කියලා"],
                "baby_feeding": ["feeding", "feed", "breastfeeding", "milk", "kiri", "කිරි", "කිරි දෙන්න"],
                "baby_sleep": ["ninda", "nida ganne naha", "nida na", "නින්ද", "නිදාගන්නේ නැහැ"],
                "baby_health": ["fever", "sick", "unwell", "una", "asanipa", "leda", "උණ", "අසනීප", "ලෙඩ"],
                "loneliness": ["lonely", "alone", "isolated", "තනිවෙලා", "පාළුයි", "තනියම", "paluyi", "taniyen", "taniwela"],
                "fatigue": ["tired", "fatigue", "exhausted", "no energy", "මහන්සියි", "වෙහෙසයි", "mahansiyi", "wehesayi", "mahansi"],
                "anxiety": ["anxious", "worry", "panic", "scared", "බයයි", "කාංසාව", "baye", "baya"],
                "bonding_issues": ["bond", "connection", "baby", "attach", "ආදරයක් දැනෙන්නේ නෑ", "බැඳීමක් නෑ", "bandimak naha"],
                "lack_of_support": ["support", "help", "husband", "family", "සැමියා", "උදව්වක් නෑ", "udawwak naha"],
                "sleep_problems": ["sleep", "insomnia", "awake", "නින්ද", "නිදාගන්නේ නැහැ"],
                "loss_of_confidence": ["confidence", "failure", "not good enough", "විශ්වාසයක් නෑ", "නරක අම්මා", "naraka amma"],
                "overwhelmed": ["overwhelmed", "too much", "cope", "දරාගන්න බැහැ", "daraganna baha"],
                "physical_discomfort": ["pain", "hurt", "body", "recovery", "කැක්කුමයි", "රිදෙනවා", "kakkumai", "ridenawa"],
                "negative_thoughts": ["hopeless", "dark", "die", "pointless", "ජීවිතේ එපා වෙලා", "මැරෙන්න හිතෙනවා", "merenna hithenawa"]
            }

            for r, kws in keywords.items():
                if any(kw in cleaned for kw in kws):
                    reason = r
                    break

            # If no keyword found, use ML model
            if not reason:
                reason = reason_model.predict([cleaned])[0]

        risk = get_risk_level(text, reason, emotion)

        print(f"[ANALYZE] Predicted: emotion='{emotion}', reason='{reason}', risk='{risk}'")

        recommendations = get_recommendations(
            risk,
            reason,
            emotion
        )

        return jsonify({
            "emotion": emotion,
            "primaryReason": reason,
            "riskLevel": risk,
            "recommendations": recommendations
        })

    except Exception as e:

        return jsonify({
            "error": str(e)
        }), 500

# ============================================================
# RETRAIN ROUTE
# ============================================================

@app.route("/retrain", methods=["POST"])
def retrain():

    global emotion_model
    global reason_model

    import training_data as td

    importlib.reload(td)

    from training_data import (
        TRAIN_TEXTS,
        TRAIN_REASONS,
        TRAIN_EMOTIONS,
        TOTAL_EXAMPLES
    )

    cleaned = [preprocess(t) for t in TRAIN_TEXTS]

    emotion_model = build_pipeline()
    emotion_model.fit(cleaned, TRAIN_EMOTIONS)

    reason_model = build_pipeline()
    reason_model.fit(cleaned, TRAIN_REASONS)

    pickle.dump(emotion_model, open(EMOTION_MODEL_PATH, "wb"))
    pickle.dump(reason_model, open(REASON_MODEL_PATH, "wb"))

    load_recommendations()

    return jsonify({
        "status": "retrained",
        "training_examples": TOTAL_EXAMPLES,
        "recommendation_rows": len(RECOMMENDATIONS_DATA)
    })

# ============================================================
# ACCURACY
# ============================================================

@app.route("/accuracy", methods=["GET"])
def accuracy():

    cleaned = [preprocess(t) for t in TRAIN_TEXTS]

    emotion_scores = cross_val_score(
        build_pipeline(),
        cleaned,
        TRAIN_EMOTIONS,
        cv=5,
    )

    reason_scores = cross_val_score(
        build_pipeline(),
        cleaned,
        TRAIN_REASONS,
        cv=5,
    )

    return jsonify({
        "emotion_accuracy":
            round(float(np.mean(emotion_scores)), 3),

        "reason_accuracy":
            round(float(np.mean(reason_scores)), 3),
    })

# ============================================================
# START SERVER
# ============================================================

if __name__ == "__main__":

    print("\nBloom ML Service Running")
    print("Port: 5001")
    print("--- Endpoints:")
    print("   /health")
    print("   /analyze")
    print("   /retrain")
    print("   /accuracy\n")

    app.run(
        host="0.0.0.0",
        port=5001,
        debug=True
    )