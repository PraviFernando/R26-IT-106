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
MODEL_TYPE = "svm"

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
    text = re.sub(r"adrae", "adare", text)
    text = re.sub(r"adara", "adare", text)
    text = re.sub(r"huratal", "hurathal", text)
    text = re.sub(r"hithenne\s*na\b", "hithenne naha", text)
    text = re.sub(r"hithenne\s*nehe", "hithenne naha", text)
    text = re.sub(r"udaw\s*na\b", "udaw naha", text)
    text = re.sub(r"udaw\s*nehe", "udaw naha", text)
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
            n_estimators=300,
            max_depth=None,
            min_samples_split=2,
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
    "baby_crying":                ["baby_mood", "sequence_order", "memory_match", "number_seq"],
    "baby_needs":                 ["baby_mood", "word_match", "spot_diff", "memory_match"],
    "difficulty_caring_for_baby": ["baby_mood", "sequence_order", "pattern_repeat", "word_match"],
    "caring_for_baby":            ["baby_mood", "sequence_order", "pattern_repeat", "word_match"],
    "baby_feeding":               ["baby_mood", "pattern_repeat", "number_seq", "memory_match"],
    "baby_sleep":                 ["baby_mood", "mindful_tap", "sliding_puzzle", "word_match"],
    "baby_health":                ["baby_mood", "spot_diff", "sequence_order", "memory_match"],
    "bonding_issues":             ["baby_mood", "memory_match", "pattern_repeat", "word_match"],
    "fatigue":                    ["coin_maze", "sliding_puzzle", "word_match", "colouring"],
    "sadness":                    ["bubble_pop", "memory_match", "pattern_repeat", "word_builder"],
    "anxiety":                    ["bubble_pop", "mindful_tap", "spot_diff", "number_seq"],
    "loneliness":                 ["memory_match", "word_builder", "word_match", "pattern_repeat"],
    "anger":                      ["bubble_pop", "coin_maze", "spot_diff", "sliding_puzzle"],
    "overwhelmed":                ["bubble_pop", "mindful_tap", "sequence_order", "word_match"],
    "stress":                     ["bubble_pop", "spot_diff", "sliding_puzzle", "mindful_tap"],
    "loss_of_confidence":         ["affirmation_game", "word_builder", "pattern_repeat", "memory_match"],
    "lack_of_support":            ["word_match", "affirmation_game", "memory_match", "coin_maze"],
    "sleep_problems":             ["colouring", "mandala", "mindful_tap", "sliding_puzzle"],
    "physical_discomfort":        ["mindful_tap", "colouring", "word_match", "sliding_puzzle"],
    "negative_thoughts":          ["affirmation_game", "word_builder", "spot_diff", "mandala"],
    "general":                    ["memory_match", "pattern_repeat", "word_builder", "spot_diff"]
}

ACTIVITIES_RECOMMENDATION_MAP = {
    "baby_crying":                ["baby_mood", "new_deep_breathing", "new_gratitude_journal", "new_positive_affirmations"],
    "baby_needs":                 ["baby_mood", "new_deep_breathing", "new_gratitude_journal", "new_positive_affirmations"],
    "difficulty_caring_for_baby": ["baby_mood", "new_deep_breathing", "new_gratitude_journal", "new_positive_affirmations"],
    "baby_feeding":               ["baby_mood", "new_drink_water", "new_gentle_stretch", "new_relaxing_music"],
    "baby_sleep":                 ["baby_mood", "new_sleep_reflection", "night_breathing", "rest_meditation"],
    "baby_health":                ["baby_mood", "new_deep_breathing", "new_positive_affirmations", "grounding_54321"],
    "caring_for_baby":            ["baby_mood", "new_deep_breathing", "new_gratitude_journal", "new_positive_affirmations"]
}

def get_recommendations(risk, reason, emotion):

    risk = risk.lower()
    reason = reason.lower().replace(" ", "_")
    emotion = emotion.lower()

    print(f"[RECOMMENDATION] Looking for: risk='{risk}', reason='{reason}', emotion='{emotion}'")
    print(f"[RECOMMENDATION] Total rows in Excel: {len(RECOMMENDATIONS_DATA)}")

    # Resolve games using distinct pool
    games = GAME_RECOMMENDATION_MAP.get(reason, GAME_RECOMMENDATION_MAP["general"])
    is_baby = "baby" in reason or reason in ["bonding_issues", "difficulty_caring_for_baby", "caring_for_baby", "baby_crying", "baby_feeding", "baby_sleep", "baby_health", "baby_needs"]
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
    if reason in ["baby_crying", "baby_needs", "caring_for_baby"]:
        lookup_reason = "bonding_issues"
    elif reason == "baby_sleep":
        lookup_reason = "sleep_problems"
    elif reason == "baby_health":
        lookup_reason = "anxiety"
    elif reason in ["bonding_issues", "financial_worry", "relationship_family_problem"]:
        lookup_reason = reason

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

    if lookup_reason == "bonding_issues":
        videos = [
            "https://www.youtube.com/watch?v=kQiT2tO3KeE",
            "https://www.youtube.com/watch?v=4VuEIeDrwAM"
        ]

    return {
        "activities": activities,
        "games": games,
        "music": music,
        "videos": videos,
        "videoUrl": videos[0] if videos else "https://www.youtube.com/watch?v=kQiT2tO3KeE"
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
                "loneliness": [
                    "lonely", "alone", "isolated", "isolation", "disconnected", "cut off", "forgotten", "ignored", "invisible",
                    "no one around", "nobody around", "no one to talk to", "nobody to talk to", "no one checks on me", "nobody checks on me",
                    "no one visits me", "nobody visits me", "no one calls me", "nobody calls me", "no adult conversation", "need someone to talk to",
                    "wish someone would come", "wish someone was here", "want some company", "need company", "miss my friends",
                    "miss having friends around", "miss talking to people", "social life is gone", "feel left out", "feel forgotten",
                    "feel like a ghost", "everyone has moved on", "no one understands me", "nobody understands me", "feel socially isolated",
                    "තනිවෙලා", "පාළුයි", "තනියම", "තනිකම", "තනිවීම", "ඈත් වෙලා", "හැමෝගෙන්ම ඈත්", "කවුරුත් නැහැ", "කතා කරන්න කෙනෙක් නැහැ",
                    "මගේ දුක අහන්න කෙනෙක් නැහැ", "මාව බලන්න කවුරුත් නැහැ", "මාව බලන්න එන්නේ නැහැ", "කවුරුත් මාව අහන්නේ නැහැ",
                    "කාත් එක්කවත් කතා කරන්න බැහැ", "යාළුවෝ නැහැ", "යාළුවෝ එක්ක කතා කරන්න බැහැ", "පරණ යාළුවෝ මතක් වෙනවා",
                    "පිට ලෝකයෙන් ඈත්", "ලෝකයෙන් ඈත් වෙලා", "කවුරුහරි මගේ ළඟ ඉන්න", "කවුරුහරි මාව බලන්න එනවා නම්", "මට කවුරුහරි ඕන",
                    "සමාජයෙන් ඈත්", "හිත හිස්", "හිස්කමක් දැනෙනවා", "තනිකමක් දැනෙනවා",
                    "taniwela", "taniyen", "taniyama", "thanikama", "thanikamak danenawa", "paluyi", "ath wela", "ath wela wage",
                    "ain wela", "ain wela wage", "hamogenma ath wela", "hamogenma ain wela", "kauruth na", "kawuruth na", "katha karanna kenek na",
                    "duk ahanna kenek na", "mava balanna kauruth na", "mava balanna enne na", "kauruth mava ahanne na", "yaluwo na",
                    "yaluwo ekka katha karanna ba", "kalin yaluwo mathak wenawa", "pita lokayen ath wela", "kauruhari ona", "kauruhari langa inna ona",
                    "company ona", "hithata hiskama", "hiskamak danenawa", "kohomada kiyala ahanne na", "kohomada kiyala witharai ahanne",
                    "therum gannawa nam hondai", "mawa balanna awilla", "taniyama karagena yanawa", "viswasa karanna kenek na",
                    "amma kenek widihata witharai"
                ],
                "baby_crying": [
                    "crying", "cries", "cry", "baby cries", "baby crying", "keeps crying", "constant crying", "nonstop crying",
                    "cannot stop crying", "will not stop crying", "screaming baby", "baby screams", "cry all day", "cries at night", "cries constantly",
                    "andanawa", "adanawa", "andana", "අඬනවා", "අඬන", "අඩනවා", "අඩන", "කෑගහනවා", "කෑගහන", "නවත්තන්නේ නැහැ",
                    "baby andanawa", "baba andanawa", "baba nitharama andanawa", "digatama andanawa", "nawaththanne naha", "hariyata andanawa",
                    "ka gahala andanawa", "ka gahala inne", "බබා අඬනවා", "බබා නිතරම අඬනවා", "බබා දිගටම අඬනවා"
                ],
                "baby_needs": [
                    "therenne naha baby", "therenne na baby", "monawada baby ta one", "තේරෙන්නේ නැහැ දරුවා",
                    "do not know what my baby needs", "don't know what my baby needs", "cannot understand my baby", "can't understand my baby",
                    "don't know what baby wants", "do not know what baby wants", "what does my baby need", "cannot figure out my baby",
                    "don't understand why baby is crying", "do not understand why baby is crying",
                    "තේරෙන්නේ නැහැ දරුවා", "තේරෙන්නේ නැහැ බබා", "බබාට මොනවා ඕනද තේරෙන්නේ නැහැ", "බබාට මොනවද ඕන", "බබාට මොනවා වෙලාද", "බබාගේ අවශ්යතාවය තේරෙන්නේ නැහැ",
                    "therenne naha baby", "therenne na baby", "baby ta monawada one", "baby ta monawada ona", "baba ta monawada one", "baba monawada one",
                    "babywa therum ganna ba", "baba wa therum ganna ba", "baby monawada one kiyala danne na", "baba monawada one kiyala danne na"
                ],
                "baby_feeding": [
                    "feeding", "feed", "breastfeeding", "breast feed", "feeding problem", "feeding problems", "trouble feeding",
                    "baby won't feed", "baby will not feed", "baby refuses milk", "not drinking milk", "milk supply", "breast milk", "milk", "kiri",
                    "කිරි", "කිරි දෙනවා", "කිරි දෙන්න", "කිරි දීම", "කිරි බොන්නේ නැහැ", "කිරි බොන්නෙ නැහැ", "බබා කිරි බොන්නේ නැහැ", "කිරි දෙනකොට", "කිරි දීමේ ප්රශ්නය",
                    "kiri denawa", "kiri meema", "kiri denakota", "baba kiri bonne na", "baba kiri bonna ba", "kiri bonne naha", "kiri prashna", "feeding eka", "feed karanna"
                ],
                "baby_sleep": [
                    "baby won't sleep", "baby will not sleep", "baby not sleeping", "baby keeps waking", "baby wakes frequently", "baby wakes every hour",
                    "baby does not settle", "baby refuses to sleep", "cannot get baby to sleep", "baby sleep problem", "baby sleeping problem",
                    "බබා නිදාගන්නේ නැහැ", "බබා නිදාගන්නෙ නැහැ", "බබාට නින්ද යන්නේ නැහැ", "බබා නිතරම නැගිටිනවා", "බබා හැම වෙලාවෙම නැගිටිනවා", "බබා රෑට නිදාගන්නේ නැහැ", "බබා නිදි කරවන්න බැහැ",
                    "baba nida ganne naha", "baba nida ganne na", "baba nida na", "baba nidaganne naha", "baba nitharama nagitinawa", "baba raata nida ganne naha", "baba nidikara ganna ba"
                ],
                "baby_health": [
                    "fever", "sick", "unwell", "ill", "temperature", "high temperature", "baby is sick", "baby feels sick", "baby has fever", "baby is unwell",
                    "baby is not well", "baby seems unwell", "rash", "vomiting", "diarrhea", "breathing problem", "difficulty breathing", "una", "asanipa", "leda",
                    "උණ", "උණ තියෙනවා", "අසනීප", "ලෙඩ", "බබාට උණ", "බබා අසනීපයි", "බබා ලෙඩයි", "බබාට අසනීපයි", "වමනය", "හුස්ම ගන්න අමාරුයි", "කුෂ්ඨය",
                    "asaneepayi", "baba ta una", "baba asanipayi", "baba ledayi", "baba hari naha", "vomit wenawa", "husma ganna amarui"
                ],
                "fatigue": [
                    "tired", "fatigue", "exhausted", "no energy", "very tired", "extremely tired", "drained", "physically drained", "low energy", "zero energy",
                    "worn out", "run down", "weak", "physically weak", "no strength", "lost my strength", "completely drained", "physically exhausted",
                    "body feels heavy", "body is heavy", "cannot keep going", "everything feels like effort", "too weak to do anything", "too tired to do anything", "body is worn out",
                    "මහන්සියි", "වෙහෙසයි", "mahansiyi", "wehesayi", "mahansi", "හොඳටම මහන්සියි", "ශක්තියක් නැහැ", "ශක්තිය නැහැ", "දුර්වලයි", "ඇඟ දුර්වලයි", "ඇඟ බරයි", "ඇඟට පණ නැහැ", "ශරීරයට ශක්තියක් නැහැ", "සම්පූර්ණයෙන්ම මහන්සියි",
                    "godak mahansiyi", "harima mahansiyi", "shakthiyak naha", "shakthiya naha", "durbalai", "anga durbalai", "anga bara wage", "angata pana naha", "shakthiyak nathi"
                ],
                "anxiety": [
                    "anxious", "worry", "panic", "scared", "afraid", "fear", "nervous", "restless", "on edge", "cannot calm down", "racing thoughts", "keep worrying",
                    "something bad will happen", "feel something is wrong", "anxiety", "worried", "constant worry", "overthinking", "panic attack", "panicking",
                    "බයයි", "කාංසාව", "baye", "baya", "බය", "බයක් දැනෙනවා", "කාංසාවක්", "කනස්සල්ල", "කනස්සල්ලෙන්", "බියෙන්", "බය හිතෙනවා", "හිත කලබලයි", "හිත සන්සුන් නැහැ", "නිතරම හිතනවා", "මොනවා වෙයිද කියලා බයයි",
                    "bayayi", "bayak danenawa", "kansawaya", "kansallai", "worry wenawa", "godak worry", "overthink karanawa", "hitha kalabalai", "hitha sansun naha", "mokak wei da kiyala baya", "badak wei wage danenawa"
                ],
                "bonding_issues": [
                    "bonding", "bond with my baby", "bonding with baby", "feel close to my baby", "not close to my baby",
                    "emotionally distant", "emotionally distant from my baby", "don't feel connected to my baby", "do not feel connected to my baby", "can't connect with my baby", "cannot connect with my baby", "cannot connect with my newborn", "connect with my newborn", "how to connect with my newborn",
                    "connection with my baby", "attachment to my baby", "not attached to my baby", "feel disconnected from my baby",
                    "not bonding with my baby", "don't feel the connection", "do not feel the connection", "don't feel close", "do not feel close",
                    "don't know how to connect", "do not know how to connect", "building a bond", "build a bond", "close to my baby", "cannot feel a real connection",
                    "detached from my child", "feel empty instead of love", "like a caregiver not a mother", "baby feels like a stranger",
                    " disconnected", "attachment", "maternal instinct", "guilt", "guilty",
                    "මගේ බබාට ලං වෙලා නැහැ", "බබා එක්ක බැඳීමක් නැහැ", "බබා එක්ක සම්බන්ධ වෙන්න බැහැ", "බබා එක්ක connection එකක් නැහැ",
                    "බබාගෙන් ඈත් වෙලා වගේ", "මගේ බබාට මම ලං වෙලා නැහැ වගේ දැනෙනවා", "මට මගේ බබා එක්ක කලින් හිතුවා වගේ බැඳීමක් දැනෙන්නේ නැහැ",
                    "මගේ බබා එක්ක සම්බන්ධ වෙන්න බැරි වගේ මට දැනෙනවා", "හොඳ අම්මා කෙනෙක් නෙමෙයි වගේ", "ආදරයක් දැනෙන්නේ නැහැ", "බැඳීමක් නැහැ", "සම්බන්ධයක් නැහැ",
                    "mage baba ekka bond wenna amarui", "mage baba ekka connection ekak na", "baba ekka close na", "baba ekka emotional connection na",
                    "baba ekka sambandha wenna ba", "mata mage baba ekka bond wenna amarui wage danenawa", "mage baba langa innakotath mata eya ekka emotional connection ekak danenne na",
                    "mata hithenawa mama mage babata hariyata adare pennanne na wage mata eka gana guilt ekak thiyenawa",
                    "baba wa balagena innakota mata sathutu wenna one wage hithenawa habai mata ehema feeling ekak enne na",
                    "mata mage baba ekka bond ekak danenne naha", "mata baba ekka adarayak danenne naha", "mage babata mama langa wela naha wage danenawa",
                    "bond ekak naha", "bandimak ne", "sambandhayak naha", "baby ekka connection ekak naha", "baby ekka connection ne",
                    "baby ekka bandenna ba", "baby ekka sambandha wenna ba", "baby gena adarayak danenne naha", "baby ta adarayak danenne na",
                    "baby mata stranger wage", "mata babywa therenne naha", "baby ektama mata feel ne", "mata amma kenek wage danenne naha",
                    "caregiver kenek wage danenawa", "babywa wagedenath feeling naha", "baby ekka emotionally athiwela wage", "baby ekka emotionally distant",
                    "bond eka naha", "attachment ekak naha", "motherly affection", "terribly guilty", "disconnected from my baby",
                    "loku bandeemak", "bandeemak danenne na", "bandeemak danenne naha", "bandimak danenne na", "bandimak danenne naha",
                    "loku bandeemak danenne na", "wenas feeling", "wenas feeling ekak", "feeling ekak enne", "baby langa hitiyath",
                    "ලොකු බැඳීමක්", "බැඳීමක් දැනෙන්නේ නැහැ", "බැඳීමක් දැනෙන්නේ නෑ", "හොඳ අම්මා කෙනෙක් නෙවෙයිද"
                ],
                "financial_worry": [
                    "financial", "finance", "money", "money problems", "financial worry", "financial stability", "expenses", "costs", "afford", "can't afford",
                    "cannot afford", "bills", "budget", "financial stress", "financial pressure", "money stress", "financial struggle", "financial security",
                    "worried about money", "struggling financially", "manage our finances", "financial problems", "baby expenses",
                    "salli", "salli prashna", "salli naha", "mila mudal", "mudal prashna", "sallith naha", "wiyadam", "mila mudal gatalu", "financial stress",
                    "සල්ලි", "මුදල්", "සල්ලි ප්‍රශ්න", "මුදල් ප්‍රශ්න", "වියදම්", "සල්ලි නෑ", "මුදල් හිඟකම", "සල්ලි ගැන ලොකු බයක්", "වියදම් ගැන ගොඩක් කනස්සල්ලයි", "සල්ලි ගැන"
                ],
                "relationship_family_problem": [
                    "husband", "partner", "relationship", "marriage", "argue", "arguing", "fighting", "fight", "distant from partner",
                    "relationship with my husband", "argue all the time", "husband and i are becoming distant", "problems in our relationship",
                    "husband and i are constantly fighting", "disconnected from my partner", "conflict with my in-laws", "family conflict",
                    "husband ekka prashna", "relationship eka hari naha", "husband ekka nitharama prashna", "husband ekka randu",
                    "husband ekka", "relationship eka", "husband", "රණ්ඩු", "ආරවුල්", "සැමියා එක්ක ප්‍රශ්න", "පවුලේ අය එක්ක ප්‍රශ්න"
                ],
                "lack_of_support": [
                    "support", "help", "සහයෝගය", "උදව්වක් නෑ", "udawwak naha", "doing everything myself", "left to handle everything",
                    "my partner does not help", "my family does not help", "no emotional support", "feel unsupported", "I need help",
                    "need someone to help me", "wish my family supported me", "no one to help me", "do all the baby work and household work",
                    "හැමදේම මම තනියම කරනවා", "මට සහාය නැහැ", "පවුලෙන් උදව් නැහැ", "මට උදව් කරන්නේ නැහැ",
                    "මට උදව් කරන්න කවුරුත් නැහැ", "මට උදව් කරන්න කවුරුත් නෑ", "උදව් කරන්න කවුරුත් නැහැ", "උදව් කරන්න කවුරුත් නෑ",
                    "බබාගේ වැඩ සහ ගෙදර වැඩ ඔක්කොම මට තනියම කරන්න වෙලා තියෙන්නේ",
                    "බබාගේ වැඩ සහ ගෙදර වැඩ ඔක්කොම මට තනියම කරන්න වෙලා",
                    "ගෙදර වැඩ ඔක්කොම මට තනියම කරන්න වෙලා", "වැඩ ඔක්කොම මට තනියම කරන්න වෙලා",
                    "තනියම කරන්න වෙලා තියෙන්නේ", "තනියම කරන්න වෙලා", "මට තනියම කරන්න වෙලා",
                    "mama thaniyama karanawa", "hamadema mama thaniyama karanawa", "pawulen udaw naha", "gedarin udaw naha", "support ekak naha",
                    "mata udaw karanna kauruth naha", "udaw karanna kauruth naha", "babage wada saha gedara wada okkoma mata thaniyama karanna wela"
                ],
                "sleep_problems": [
                    "sleep", "insomnia", "awake", "නින්ද", "නිදාගන්නේ නැහැ", "can't sleep", "cannot sleep", "cannot fall asleep", "unable to sleep",
                    "awake all night", "my sleep is broken", "broken sleep", "trouble sleeping", "not getting enough sleep", "no proper sleep", "restless sleep",
                    "lie awake", "wide awake at night", "ninda madi", "ninda madi nisa", "ninda adui",
                    "මට නින්ද යන්නේ නැහැ", "මට නින්ද නැහැ", "නිදාගන්න බැහැ", "නිදාගන්නේ නැහැ", "රෑට නින්ද නැහැ", "මුළු රෑම ඇහැරලා", "නින්ද කැඩෙනවා", "නින්ද හරියට නැහැ", "හොඳ නින්දක් නැහැ", "නින්ද අඩුයි", "නිදාගන්න අමාරුයි", "මට නින්ද මදි නිසා හරිම අමාරුයි", "නින්ද අඩු නිසා මට හරිම අමාරුයි",
                    "mata ninda yanne naha", "mata ninda na", "nida ganna ba", "nidaganne naha", "raata ninda naha", "mulu raama aharala", "ninda kadenawa", "ninda hariyata naha", "hoda nindakw naha", "ninda adui", "ninda ganna amarui", "mata ninda madi nisa harima amaruwi", "mata ninda madi nisa dawasa purama amarui"
                ],
                "loss_of_confidence": [
                    "confidence", "failure", "not good enough", "විශ්වාසයක් නෑ", "නරක අම්මා", "naraka amma", "no confidence", "lost confidence", "lack confidence",
                    "not confident", "I don't trust myself", "feel like a failure", "not a good mother", "bad mother", "terrible mother", "feel inadequate", "feel incapable",
                    "cannot do anything right", "keep making mistakes", "failing as a mother", "do not know what I am doing", "not capable of being a mother",
                    "විශ්වාසයක් නැහැ", "මට මාව විශ්වාස නැහැ", "මට මාවම විශ්වාස නැහැ", "ආත්ම විශ්වාසයක් නැහැ", "මම අසාර්ථකයි", "අසාර්ථක වෙලා", "හොඳ අම්මා කෙනෙක් නෙමෙයි", "මම වැරදි කරනවා",
                    "vishwasayak naha", "mata mawa vishwasa naha", "mata mamawa vishwasa naha", "athma vishwasayak naha", "mama asarthakai", "hoda amma kenek nemei", "mata ba", "mata meka karaganna ba", "mama waradi karanawa", "mama hariyata karanne naha", "mama fail wage"
                ],
                "overwhelmed": [
                    "overwhelmed", "too much", "cope", "දරාගන්න බැහැ", "daraganna baha", "too much to handle", "cannot cope", "can't cope", "struggling to cope",
                    "everything is too much", "cannot handle this", "too many things", "too much responsibility", "feel overloaded", "at my limit", "reached my limit",
                    "stretched too thin", "cannot keep up", "everything is piling up",
                    "දරාගන්න බැහැ", "මට දරාගන්න බැහැ", "ගොඩක් වැඩියි", "හැමදේම වැඩියි", "එකවර හැමදේම", "කරගන්න බැහැ", "සියල්ලම බරයි", "වගකීම් ගොඩයි", "මට මේක දරාගන්න බැහැ", "මට මේ හැමදේම අමාරුයි", "මට සීමාවට ඇවිල්ලා",
                    "daraganna baha", "mata daraganna baha", "godak wadiyi", "hamadema wadiyi", "okkom eka para", "karaganna ba", "wagakeem godai", "mata meka daraganna ba", "hamadema bara wage", "mata limit eka awilla", "mama limit eke"
                ],
                "physical_discomfort": [
                    "pain", "hurt", "body", "recovery", "කැක්කුමයි", "රිදෙනවා", "kakkumai", "ridenawa", "sore", "soreness", "body pain", "physical pain", "physical discomfort",
                    "back pain", "lower back pain", "abdominal pain", "stomach pain", "pelvic pain", "pelvic discomfort", "headache", "headaches", "stitches hurt", "stitches painful",
                    "wound hurts", "c-section pain", "c section pain", "incision pain", "breastfeeding hurts", "pain while breastfeeding", "pain when sitting", "pain when standing",
                    "pain when walking", "difficult to move", "body aches", "body feels sore", "not recovered", "slow recovery", "physical recovery", "swollen", "tender", "discomfort",
                    "වේදනාව", "වේදනාවක්", "රිදෙනවා", "ඇඟ රිදෙනවා", "ඇඟේ අමාරුව", "කැක්කුමයි", "කොන්දේ අමාරුව", "බඩ රිදෙනවා", "යටිබඩ රිදෙනවා", "හිසරදය", "තුවාලය රිදෙනවා", "මැහුම් රිදෙනවා", "සිසේරියන් තුවාලය", "කිරි දෙනකොට වේදනාව", "ඇවිදින්න බැහැ", "හෙලවෙන්න බැහැ", "ශරීරය සුව වෙලා නැහැ", "තාමත් සුව වෙලා නැහැ", "ශාරීරික අපහසුතාවය",
                    "wedanawa", "wedanawak", "anga ridenawa", "ange amaruwa", "konda amarui", "bada ridenawa", "yatibada ridenawa", "hisaradayak", "thuwalaya ridenawa", "mahum ridenawa", "c section thuwala", "kiri denakota wedanai", "awidinna ba", "helawenna ba", "shariraya suwa wela naha", "thama suwa wela naha", "sharirika apahasu"
                ],
                "negative_thoughts": [
                    "hopeless", "dark", "die", "pointless", "ජීවිතේ එපා වෙලා", "මැරෙන්න හිතෙනවා", "merenna hithenawa",
                    "want to die", "wish I was dead", "thinking about dying", "do not want to be here", "don't want to be here", "do not want to live",
                    "kill myself", "hurt myself", "harm myself", "end my life", "suicidal", "cannot go on",
                    "මැරෙන්න ඕන", "ජීවත් වෙන්න හිතෙන්නේ නැහැ", "ජීවිතය එපා වෙලා", "මම නැතිවුණොත් හොඳයි", "මම නැති වුණා නම් හොඳයි",
                    "merenna ona", "jeewath wenna hithenne naha", "mama nathi wunoth hoda wei", "mama nathi una nam", "jeewithe therumak naha"
                ]
            }

            # Define Category Priority Order for resolving ties among specific matches
            REASON_PRIORITY_ORDER = [
                "negative_thoughts",
                "bonding_issues",
                "financial_worry",
                "relationship_family_problem",
                "baby_health",
                "baby_crying",
                "baby_needs",
                "baby_feeding",
                "baby_sleep",
                "sleep_problems",
                "physical_discomfort",
                "fatigue",
                "anxiety",
                "overwhelmed",
                "lack_of_support",
                "loss_of_confidence"
            ]

            # Find all matching keywords across all categories
            matches = []
            for r in REASON_PRIORITY_ORDER:
                kws = keywords.get(r, [])
                for kw in kws:
                    kw_clean = kw.lower().strip()
                    if kw_clean in cleaned:
                        word_count = len(kw_clean.split())
                        char_count = len(kw_clean)
                        # Mark generic terms like "sleep" or "worry" vs specific phrases
                        is_generic = char_count < 6 or word_count == 1
                        matches.append({
                            "reason": r,
                            "kw": kw_clean,
                            "word_count": word_count,
                            "char_count": char_count,
                            "is_generic": is_generic,
                            "priority_idx": REASON_PRIORITY_ORDER.index(r)
                        })

            if matches:
                # 1. Prefer specific non-generic multi-word or long phrase matches first
                # 2. Sort by char length (descending), then priority index (ascending)
                specific_matches = [m for m in matches if not m["is_generic"]]
                if specific_matches:
                    specific_matches.sort(key=lambda x: (-x["char_count"], x["priority_idx"]))
                    reason = specific_matches[0]["reason"]
                else:
                    matches.sort(key=lambda x: (x["priority_idx"], -x["char_count"]))
                    reason = matches[0]["reason"]

            # If no keyword found, use ML model
            if not reason:
                reason = reason_model.predict([cleaned])[0]

        risk = get_risk_level(text, reason, emotion)

        print("\n" + "="*60)
        print("[PERICARE DIARY ANALYSIS]")
        print(f"Raw Input: '{text}'")
        print(f"Preprocessed: '{cleaned}'")
        print(f"Predicted Emotion: '{emotion}'")
        print(f"Predicted Reason: '{reason}'")
        print(f"Assigned Risk Level: '{risk}'")
        print("="*60 + "\n")

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