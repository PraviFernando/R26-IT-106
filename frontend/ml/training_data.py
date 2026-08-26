# -*- coding: utf-8 -*-
"""
================================================================
BLOOM -- Training Data Module
================================================================
All training sentences live here. To improve accuracy, just add
more sentences to any category below and run /retrain.

STRUCTURE:
  TRAIN_TEXTS   -> list of diary-like sentences
  TRAIN_REASONS -> matching reason label for each sentence
  TRAIN_EMOTIONS-> matching emotion label for each sentence

CATEGORIES:
  Reasons  : loneliness, fatigue, anxiety, bonding_issues,
             lack_of_support, sleep_problems, loss_of_confidence,
             overwhelmed, physical_discomfort, negative_thoughts
  Emotions : happy, sad, stressed, anxious
  Risk     : low, medium, high  (computed, not trained)

CHANGELOG (v2 -- accuracy improvement):
  - Moved sleep-deprivation sentences from fatigue -> sleep_problems
  - Expanded all categories to 60+ samples
  - Balanced English / Sinhala Unicode / Singlish coverage
  - Reduced keyword overlap between fatigue / sleep_problems / overwhelmed
================================================================
"""

# --------------------------------------------------------------
# LONELINESS  (emotion: sad)
# --------------------------------------------------------------
LONELINESS_TEXTS = [
    # English
    "I feel so alone and nobody is around me",
    "I am completely isolated from everyone I love",
    "Nobody checks on me or asks how I am doing",
    "I feel forgotten by my friends and family",
    "I spend all day without talking to another adult",
    "My husband goes to work and I am left completely alone",
    "I feel invisible like no one even sees me",
    "I miss having conversations with other people",
    "No one visits me or calls to see how I am",
    "I feel abandoned after giving birth",
    "I used to have friends but now they have all disappeared",
    "I sit at home alone with my baby every single day",
    "I feel so disconnected from the world around me",
    "Nobody around me understands what I am going through",
    "I feel like I am on an island all by myself",
    "Even when people are near me I feel deeply alone",
    "I long for someone to talk to and connect with",
    "My social life is gone and I feel empty inside",
    "I have no one to share my struggles with",
    "I feel like I disappeared after becoming a mother",
    "No friends come over anymore since the baby arrived",
    "I feel so cut off from the rest of the world",
    "Being at home all day makes me feel so isolated",
    "I wish someone would reach out and check on me",
    "I cry alone because there is no one to comfort me",
    "I feel like a ghost in my own life",
    "My loneliness is unbearable and it hurts so much",
    "I just want someone to sit with me and talk",
    "The silence in this house makes me feel so alone",
    "I have never felt this lonely in my entire life",
    "I have no adult conversation all day long",
    "I feel like motherhood has made me invisible to others",
    "My world has shrunk to just me and the baby",
    "I miss the days when people would call me just to chat",
    "I feel profoundly isolated since the baby came",
    # Indirect Loneliness expressions & user diary examples (Singlish & Sinhala)
    "kauruth mata kohomada kiyala ahanne na baby kohomada kiyala witharai ahanne",
    "samahara welawata nikan nikan innakota kauruth mata me welawe ona kiyala therum gannawa nam hondai",
    "kauruth nikanma mawa balanna awilla tikak wela inna nam mata godak sathutui",
    "wate aya hitiyath motherhood eka mama thaniyama karagena yanawa wage danenawa",
    "samahara dawas wala ka ekka hari kathaa karanna ona unath kawda call karanne kiyala hithaganna ba",
    "mama godak welawata gedarama inne nisa pita lokayen ath wela wage danenawa",
    "baby enna kalin yaluwo ekka hina wela kathaa karapu kale mata godak mathak wenawa",
    "mage yaluwo eliyata gihilla sathutin innawa dakiddi mama hamogenma ain wela wage danenawa",
    "dan mata mama widihata nemei amma kenek widihata witharai aya salakanawa wage danenawa",
    "mata wage aluth amma kenek langa hitiyanam me dawas therum ganna puluwan wei",
    "baby mage langa hitiyath gedara athule hitata hiskamak wage danenawa",
    "mage hithe godak dewal thiyenawa eth ewa kiyanna mata viswasa karanna kenek na",
    "kauruth mata kohomada kiyala ahanne naha baby kohomada kiyala vitharai ahanne",
    "kauruth mawa balanna awilla tikak wela innam mata sathutui",
    "wate aya hitiyath thaniyama karagena yanawa wage danenawa",
    "gedara athule hitata hiskamak wage danenawa",
    # Sinhala Unicode
    "mage gedara kisima kenek na mata harima paluyi",
    "kavuruth mawa balanna enne na mata taniwela wage danenawa",
    "mage husband wadata giyama mama mulu dawasama taniyen",
    "mage yaluwo kauruth dan mata ekka katha karanne na",
    "mata katha karanna kenek na mage sitha his wela",
    "mama dawasa purama gedara taniyen mata harima paluyi",
    "kisima kenek mage duka ahanne na",
    "mama taniwela innawa wage danenawa",
    "kavuruth mata balanna enney na harima paluwa",
    "mama gedara taniyen inna kama nisa godak duka",
    "mage yaluwo api yana goda kauruth awa na",
    "amma wenata passe mage yaluwo kauruth na",
    "mata kenek inna ona kiyala harima asa hithenawa",
    "gedara hushima kata kalak mata paluyi",
    "mata kavuruth nathi nisa gedara inna baha",
    # Sinhala Unicode proper script
    "\u0db8\u0d9c\u0dda \u0d9c\u0daf\u0dbb \u0d9a\u0dd2\u0dc3\u0dd2\u0db8 \u0d9a\u0dd9\u0db1\u0dda\u0d9a\u0dca \u0db1\u0dda \u0db8\u0da7 \u0dc4\u0dbb\u0dd2\u0db8 \u0db4\u0dcf\u0dbd\u0dd4\u0dba\u0dd2",
    "\u0d9a\u0dc0\u0dd4\u0dbb\u0dd4\u0dad\u0dca \u0db8\u0dcf\u0dc0 \u0db6\u0dbd\u0db1\u0dca\u0db1 \u0d87\u0db1\u0dca\u0db1\u0dda \u0db1\u0dda \u0db8\u0da7 \u0dad\u0db1\u0dd2\u0dc0\u0dda\u0dbd\u0dcf \u0dc0\u0d9c\u0dda \u0daf\u0dd0\u0db1\u0dd9\u0db1\u0dc0\u0dcf",
    "\u0db8\u0d9c\u0dda \u0dc3\u0dd0\u0db8\u0dd2\u0dba\u0dcf \u0dc0\u0dd0\u0da9\u0da7 \u0d9c\u0dd2\u0dba\u0dcf\u0db8 \u0db8\u0db8 \u0db8\u0dd4\u0dbd\u0dd4 \u0daf\u0dc0\u0dc3\u0db8 \u0dad\u0db1\u0dd2\u0dba\u0db8",
    "\u0db8\u0d9c\u0dda \u0dba\u0dcf\u0dbd\u0dd4\u0dc0\u0ddd \u0d9a\u0dc0\u0dd4\u0dbb\u0dd4\u0dad\u0dca \u0daf\u0dd0\u0db1\u0dca \u0db8\u0dcf\u0dad\u0dca \u0d91\u0d9a\u0dca\u0d9a \u0d9a\u0dad\u0dcf \u0d9a\u0dbb\u0db1\u0dca\u0db1\u0dda \u0db1\u0dda",
    "\u0db8\u0da7 \u0d9a\u0dad\u0dcf \u0d9a\u0dbb\u0db1\u0dca\u0db1 \u0d9a\u0dd9\u0db1\u0dd9\u0d9a\u0dca \u0db1\u0dda \u0db8\u0d9c\u0dda \u0dc3\u0dd2\u0dad \u0dc4\u0dd2\u0dc3\u0dca \u0dc0\u0dda\u0dbd\u0dcf",
    "\u0db8\u0db8 \u0daf\u0dc0\u0dc3 \u0db4\u0dd4\u0dbb\u0dcf\u0db8 \u0d9c\u0daf\u0dbb \u0dad\u0db1\u0dd2\u0dba\u0db8 \u0db8\u0da7 \u0dc4\u0dbb\u0dd2\u0db8 \u0db4\u0dcf\u0dbd\u0dd4\u0dba\u0dd2",
    "\u0d9a\u0dd2\u0dc3\u0dd2\u0db8 \u0d9a\u0dd9\u0db1\u0dd9\u0d9a\u0dca \u0db8\u0d9c\u0dda \u0daf\u0dd4\u0d9a \u0d85\u0dc4\u0db1\u0dca\u0db1\u0dda \u0db1\u0dda",
    "\u0db8\u0db8 \u0dad\u0db1\u0dd2\u0dc0\u0dda\u0dbd\u0dcf \u0d89\u0db1\u0dca\u0db1\u0dc0\u0dcf \u0dc0\u0d9c\u0dda \u0daf\u0dd0\u0db1\u0dd9\u0db1\u0dc0\u0dcf",
]
LONELINESS_REASONS = ["loneliness"] * len(LONELINESS_TEXTS)
LONELINESS_EMOTIONS = ["sad"] * len(LONELINESS_TEXTS)

# --------------------------------------------------------------
# FATIGUE  (emotion: stressed)
# NOTE: Fatigue = low physical energy, body weakness, exhaustion
#       doing daily tasks. NOT sleep deprivation (sleep_problems).
# --------------------------------------------------------------
FATIGUE_TEXTS = [
    # English -- body energy / physical depletion focus
    "I am extremely tired and have no energy left at all",
    "I feel completely drained and burnt out every single day",
    "I cannot even get out of bed in the morning",
    "I am running on empty and feel exhausted all the time",
    "My body is completely worn out from caring for my baby",
    "I have not had a proper rest in weeks",
    "I feel like a zombie because I am so tired",
    "Every task feels impossible because I have no energy",
    "I am so fatigued that even brushing my teeth is hard",
    "My exhaustion is affecting everything I do",
    "I feel mentally and physically exhausted every day",
    "The tiredness never goes away no matter what I do",
    "I feel like I am falling apart from pure exhaustion",
    "My body aches and I am so desperately tired",
    "I cannot function properly because I am so depleted",
    "I feel like I have nothing left to give",
    "Being this tired is making me feel hopeless",
    "I am too exhausted to even enjoy time with my baby",
    "I have no stamina and feel weak throughout the day",
    "The constant fatigue is overwhelming me completely",
    "I feel sluggish and heavy from the moment I wake up",
    "I am so tired that simple decisions feel impossible",
    "Exhaustion is making me irritable and short tempered",
    "My energy is completely depleted and I feel broken",
    "I cannot remember the last time I felt rested",
    "This level of tiredness feels unbearable and never-ending",
    "I have zero energy and every movement is an effort",
    "I feel physically weak from doing everything alone",
    "My body has hit a wall and I cannot push through it",
    "I feel so drained by the end of the day that I cannot move",
    "Even the smallest chores feel like climbing a mountain",
    "I feel burnt out from the non-stop demands of motherhood",
    "My body feels like it is shutting down from exhaustion",
    "I cannot carry my baby because I am too weak and tired",
    "I feel hollow and empty from sheer physical depletion",
    # Sinhala -- energy / body weakness focus
    "\u0db8\u0da7 \u0d85\u0daf \u0dc4\u0dbb\u0dd2\u0db8 \u0db8\u0dc4\u0db1\u0dca\u0dc3\u0dd2\u0dba\u0dd2 \u0d9a\u0dd2\u0dc3\u0dd2\u0db8 \u0dc1\u0d9a\u0dca\u0dad\u0dd2\u0dba\u0d9a\u0dca \u0db1\u0dda",
    "\u0db8\u0d9c\u0dda \u0d87\u0d9f\u0da7 \u0d9a\u0dd2\u0dc3\u0dd2\u0db8 \u0db4\u0dab\u0d9a\u0dca \u0db1\u0dda \u0db8\u0da7 \u0d9c\u0ddc\u0daf\u0d9a\u0dca \u0dc0\u0dda\u0dc4\u0dda\u0dc3\u0dba\u0dd2",
    "\u0db8\u0db8 \u0daf\u0dc0\u0dc3 \u0db4\u0dd4\u0dbb\u0dcf\u0db8 \u0db8\u0dc4\u0db1\u0dca\u0dc3\u0dd2\u0dba\u0dd9\u0db1\u0dca \u0d89\u0db1\u0dca\u0db1\u0dda",
    "\u0db8\u0d9c\u0dda \u0db8\u0dd4\u0dbd\u0dd4 \u0d87\u0d9f\u0db8 \u0dbb\u0dd2\u0daf\u0dd9\u0db1\u0dc0\u0dcf \u0db8\u0dc4\u0db1\u0dca\u0dc3\u0dd2\u0dba \u0dc0\u0dd0\u0da9\u0dd2\u0dba\u0dd2",
    "\u0db8\u0db8 \u0d9c\u0ddc\u0daf\u0d9a\u0dca \u0dc0\u0dda\u0dc4\u0dda\u0dc3 \u0dc0\u0dda\u0dbd\u0dcf \u0d89\u0db1\u0dca\u0db1\u0dda",
    "\u0db8\u0da7 \u0db4\u0ddc\u0da9\u0dd2 \u0dc0\u0dd2\u0dc0\u0dda\u0d9a\u0dba\u0d9a\u0dca\u0dc0\u0dad\u0dca \u0db1\u0dda",
    "\u0db8\u0dc4\u0db1\u0dca\u0dc3\u0dd2\u0dba \u0dc0\u0dd0\u0da9\u0dd2\u0d9a\u0db8 \u0db1\u0dd2\u0dc3\u0dcf \u0db8\u0da7 \u0db8\u0dd4\u0d9a\u0dd4\u0dad\u0dca \u0d9a\u0dbb\u0db1\u0dca\u0db1 \u0db6\u0dda",
    "\u0db8\u0da7 \u0dc1\u0d9a\u0dca\u0dad\u0dd2\u0dba\u0d9a\u0dca \u0db1\u0dda \u0d9a\u0dd2\u0dc3\u0dd2\u0daf\u0dd9\u0dba\u0d9a\u0dca \u0d9a\u0dbb\u0db1\u0dca\u0db1",
    "\u0dc1\u0dbb\u0dd3\u0dbb\u0dba \u0d9c\u0ddc\u0daf\u0dcf\u0d9a\u0dca \u0daf\u0dd4\u0dbb\u0dca\u0dc0\u0dbd\u0dba\u0dd2",
    "\u0db8\u0da7 \u0dc3\u0dcf\u0db8\u0dcf\u0db1\u0dca\u200d\u0dba \u0daf\u0dda\u0dc0\u0dbd\u0dca \u0dc0\u0dad\u0dca \u0d9a\u0dbb\u0db1\u0dca\u0db1 \u0dc1\u0dbb\u0dd3\u0dbb\u0dba\u0dda\u0db1\u0dca \u0dc1\u0d9a\u0dca\u0dad\u0dd2\u0dba \u0db1\u0dda",
    "\u0d9a\u0dca\u0dbd\u0dcf\u0db1\u0dca\u0dad \u0dc0\u0dda\u0dbd\u0dcf \u0d89\u0db1\u0dca\u0db1\u0dc0\u0dcf",
    "\u0daf\u0dc0\u0dc3 \u0d9c\u0dda\u0dc0\u0dd9\u0db1\u0d9a\u0ddc\u0da7 \u0dc1\u0dbb\u0dd3\u0dbb\u0dba \u0dc4\u0dd2\u0dc3\u0dca \u0dc0\u0dda\u0dbd\u0dcf",
    "\u0dc1\u0d9a\u0dca\u0dad\u0dd2\u0dba \u0d9c\u0dda\u0dc0\u0dd2\u0dbd\u0dcf \u0d9c\u0dd2\u0dc4\u0dd2\u0dbd\u0dca\u0dbd\u0dcf",
    # Singlish -- energy / physical drain focus
    "mata ada harima mahansiyi kisima shakthiyak naha",
    "mage angata kisima panak naha mata godak wehesayi",
    "mama dawasa purama mahansiyen inne",
    "mage mulu angama ridenawa mahansi wadiyi",
    "mata podi wiwekayakwat naha",
    "mahansiya wadi kama nisa mukuth karanna baha",
    "mata shakthiyak naha kisima deyak karanna",
    "shaririya durbalayi kisima karanna baha",
    "mata ada dawasama angata panak nethi mahansiyi",
    "kisima deyak karanna shakthiyak naha",
    "mama godak wehesa wela innawa",
    "mata anga duluwaya kisima deyak karanna baha",
]
FATIGUE_REASONS = ["fatigue"] * len(FATIGUE_TEXTS)
FATIGUE_EMOTIONS = ["stressed"] * len(FATIGUE_TEXTS)

# --------------------------------------------------------------
# ANXIETY  (emotion: anxious)
# --------------------------------------------------------------
ANXIETY_TEXTS = [
    # English
    "I feel anxious and worried about everything all the time",
    "My heart is racing and I cannot calm down",
    "I keep overthinking every little thing and cannot stop",
    "I am scared that something bad is going to happen",
    "I feel nervous and restless and cannot relax",
    "My mind will not stop racing and I feel panicked",
    "I have constant anxiety about being a good mother",
    "I feel on edge all the time and cannot settle",
    "Small things trigger my anxiety and I spiral quickly",
    "I feel a constant sense of dread that never goes away",
    "I worry constantly about my baby's health and safety",
    "I cannot focus on anything because anxiety controls me",
    "I feel a tight chest and shortness of breath from worry",
    "My hands shake when I think about all my responsibilities",
    "I feel so overwhelmed by fear and anxious thoughts",
    "I catastrophize everything and imagine the worst outcomes",
    "I feel panicky even when everything seems fine",
    "My anxiety keeps me awake even when I am exhausted",
    "I check on my baby constantly out of fear",
    "I cannot stop worrying no matter how hard I try",
    "I feel like something terrible is about to happen",
    "My anxiety makes even simple tasks feel impossible",
    "I feel tense in my shoulders and stomach from worry",
    "Anxiety is stealing my joy and my ability to rest",
    "I panic when my baby cries and I cannot calm myself",
    "I feel trapped in a cycle of worry and fear",
    "Every small sound makes me jump and feel afraid",
    "I feel anxious in social situations and avoid going out",
    "The anxiety feels like a storm in my chest and head",
    "I feel like I am always bracing for disaster",
    "I have racing thoughts that I cannot switch off",
    "The worry is constant and I feel powerless to stop it",
    "I am scared of being alone with my baby in case something goes wrong",
    "I cannot enjoy any moment because I am always afraid",
    "I feel a knot in my stomach that never goes away",
    # Sinhala
    "\u0db8\u0da7 \u0dbd\u0ddc\u0d9a\u0dd4 \u0db6\u0dba\u0d9a\u0dca \u0daf\u0dd0\u0db1\u0dd9\u0db1\u0dc0\u0dcf \u0db8\u0ddc\u0db1\u0dc0\u0dcf \u0dc0\u0dda\u0dba\u0dd2\u0daf \u0d9a\u0dd2\u0dba\u0dbd\u0dcf",
    "\u0db8\u0d9c\u0dda \u0dc4\u0dd8\u0daf \u0dc3\u0dca\u0db4\u0db1\u0dca\u0daf\u0db1\u0dba \u0dc0\u0dd0\u0da9\u0dd2 \u0dc0\u0dda\u0dbd\u0dcf \u0db8\u0da7 \u0d9a\u0dcf\u0d82\u0dc3\u0dcf\u0dc0\u0dba\u0dd2",
    "\u0db8\u0db8 \u0dc4\u0dd0\u0db8\u0daf\u0dda\u0db8 \u0d9c\u0dd0\u0db1\u0dca \u0d91\u0db1\u0dc0\u0da7 \u0dc0\u0daf\u0dcf \u0dc4\u0dd2\u0dad\u0db1\u0dc0\u0dcf",
    "\u0db8\u0da7 \u0db6\u0dba\u0dba\u0dd2 \u0db6\u0db6\u0dcf\u0da7 \u0dba\u0db8 \u0daf\u0dd9\u0dba\u0d9a\u0dca \u0dc0\u0dda\u0dba\u0dd2 \u0d9a\u0dd2\u0dba\u0dbd\u0dcf",
    "\u0db8\u0d9c\u0dda \u0dc3\u0dd2\u0dad\u0da7 \u0d9a\u0dd2\u0dc3\u0dd2\u0db8 \u0dc3\u0dc4\u0db1\u0dba\u0d9a\u0dca \u0db1\u0dda \u0db6\u0dba \u0dc4\u0dd2\u0dad\u0dd9\u0db1\u0dc0\u0dcf",
    "\u0db8\u0da7 \u0dbd\u0ddc\u0d9a\u0dd4 \u0d9a\u0db1\u0dc3\u0dca\u0dc3\u0dbd\u0dca\u0dbd\u0d9a\u0dca \u0daf\u0dd0\u0db1\u0dd9\u0db1\u0dc0\u0dcf",
    "\u0db8\u0d9c\u0dda \u0db8\u0db1\u0dc3 \u0d9a\u0dbd\u0db6\u0dbd \u0dc0\u0dda\u0dbd\u0dcf",
    "\u0db8\u0da7 \u0dc4\u0dd0\u0db8\u0dc0\u0dda\u0dbd\u0dda\u0db8 \u0dbd\u0ddc\u0d9a\u0dd4 \u0db6\u0dba\u0d9a\u0dca \u0dad\u0dd2\u0dba\u0dd9\u0db1\u0dc0\u0dcf",
    "\u0d9a\u0dd2\u0dc3\u0dd2\u0db8 \u0daf\u0dd9\u0dba\u0d9a\u0dca \u0db1\u0dd2\u0dc0\u0dd0\u0dbb\u0daf\u0dd2\u0dc0 \u0dc0\u0dda\u0dba\u0dd2\u0daf \u0d9a\u0dd2\u0dba\u0dbd\u0dcf \u0db8\u0da7 \u0d9a\u0db1\u0dc3\u0dca\u0dc3\u0dbd\u0dca\u0dbd\u0dba\u0dd2",
    "\u0db4\u0db4\u0dd4\u0dc0 \u0d9c\u0dd0\u0dc3\u0dca\u0dc3\u0dd9\u0db1\u0dc0\u0dcf \u0dbd\u0db8\u0dcf \u0d9c\u0dd0\u0db1\u0dca \u0dbd\u0ddc\u0d9a\u0dd4 \u0db6\u0dba",
    "\u0dc4\u0dd2\u0dad \u0db1\u0dad\u0dbb \u0db1\u0ddc\u0dc0\u0dd3 \u0daf\u0dd4\u0dc0\u0db1\u0dc0\u0dcf \u0d9a\u0db1\u0dc3\u0dca\u0dc3\u0dbd\u0dca\u0dbd\u0dd9\u0db1\u0dca",
    "\u0dbd\u0db8\u0dcf \u0dad\u0db1\u0dd2 \u0d9a\u0dbb\u0db1\u0dca\u0db1\u0dad\u0dca \u0db6\u0dba",
    # Singlish
    "mata loku baya hithenawa monawa weida kiyala",
    "mage hadawatha ikmanin gahanawa mata kansawai",
    "mama hamadema gana onawata wada hithanawa",
    "mata bayai babata yam deyak wei kiyala",
    "mage sithata kisima sahanayak naha baya hithenawa",
    "mata loku kanasallak danenawa",
    "mage manasa kalabala wela",
    "mata hamawelema loku bayak thiyenawa",
    "mama kanasallata dawasama inna",
    "baba aya kiyada kiyala baya hithenawa",
    "mata panikkuwa denna pewthiwa",
    "hitha nadur nowi duwanawa kanasallaten",
]
ANXIETY_REASONS = ["anxiety"] * len(ANXIETY_TEXTS)
ANXIETY_EMOTIONS = ["anxious"] * len(ANXIETY_TEXTS)

# --------------------------------------------------------------
# BONDING ISSUES  (emotion: sad)
# --------------------------------------------------------------
BONDING_TEXTS = [
    # English - Bonding Difficulty & Attachment
    "I feel like I am not bonding with my baby",
    "Sometimes I look at my baby but I don't feel the connection I thought I would",
    "I feel guilty because I don't feel close to my baby",
    "My baby smiles at me, but I still feel emotionally distant from my baby",
    "I don't know how to connect with my newborn and I feel like I am failing as a mother",
    "I feel like I am not close to my baby and I don't know how to build a bond with my baby",
    "I feel like I am not close to my baby",
    "don't know how to build a bond with my baby",
    "I cannot feel a real connection with my baby",
    "I feel emotionally distant from my newborn",
    "I try to love my baby but feel nothing inside",
    "I feel detached and disconnected from my child",
    "I do not feel the bond everyone told me I would feel",
    "I look at my baby and feel empty instead of love",
    "I feel guilty because I am not attached to my baby",
    "I expected to feel overwhelming love but feel nothing",
    "The bond between me and my baby feels broken",
    "I feel like a caregiver not a mother to my baby",
    "I am scared I will never feel connected to my child",
    "My baby feels like a stranger to me and I feel terrible",
    "I feel no instinct when I am with my baby",
    "I care for my baby but do not feel the love I expected",
    "I watch other mothers and wonder why I feel so different",
    "The lack of bond makes me feel like a bad mother",
    "I feel like I am going through the motions with no feeling",
    "I hold my baby and feel emotionally numb inside",
    "I am ashamed to admit I do not feel attached",
    "I feel distant from my baby even when we are together",
    "I do not enjoy holding my baby the way I thought I would",
    "I feel no connection and it breaks my heart",
    "I cannot understand why I feel so disconnected",
    "I worry my baby can feel my emotional absence",
    "I feel indifferent when my baby smiles at me",
    "The bond I was promised never came and I feel cheated",
    "I feel like a failure as a mother because of this distance",
    "My heart feels closed off from my own baby",
    "I feel grief over the bond I thought I would have",
    "I am desperate to feel connected but it just will not come",
    "I feel no maternal instinct and I am terrified",
    "I look at my baby and do not feel what mothers describe",
    "I feel numb when I hold my baby and I hate myself for it",
    "The disconnection makes me feel like I am failing",
    "I do not feel the rush of love other mothers talk about",
    # Sinhala Unicode
    "මගේ බබාට මම ලං වෙලා නැහැ වගේ දැනෙනවා",
    "මට මගේ බබා එක්ක කලින් හිතුවා වගේ බැඳීමක් දැනෙන්නේ නැහැ",
    "මගේ බබා එක්ක සම්බන්ධ වෙන්න බැරි වගේ මට දැනෙනවා මම හොඳ අම්මා කෙනෙක් නෙමෙයි වගේ",
    "මගේ බබාට මම ලං වෙලා නැහැ",
    "බබා එක්ක බැඳීමක් නැහැ",
    "බබා එක්ක සම්බන්ධ වෙන්න බැහැ",
    "බබා එක්ක connection එකක් නැහැ",
    "බබාගෙන් ඈත් වෙලා වගේ",
    "මට බබා එක්ක ආදරයක් දැනෙන්නේ නැහැ",
    "මගේ බබා එක්ක connection එකක් නැහැ",
    "මට බබා එක්ක bond වෙන්න අමාරුයි",
    "මට මගේ බබා ගැන හැඟීමක් දැනෙන්නේ නැහැ",
    "මම බබාට ආදරෙයි කියලා දැනෙන්නේ නැහැ",
    "මට මගේ බබාගෙන් emotionally distant වගේ දැනෙනවා",
    "මම බබා එක්ක ඉන්නවා නමුත් connection එකක් නැහැ",
    "මට බබා එක්ක ලොකු ආදරයක් දැනෙන්නේ නැහැ",
    "මගේ බබාට මම ලං වෙලා නැහැ වගේ දැනෙනවා",
    "මට කිසිම ආදර හැඟීමක් එන්නේ නැහැ",
    "මම බබා දිහා බැලුවම හිස් බවක් දැනෙනවා",
    "බබා එක්ක ඉද්දී ආදරය දැනෙන්නේ නැහැ",
    "බබාට ආදරය දෙන්නට පුළුවන් බැහැ",
    "බබා ළඟ ඉද්දී හිස් බවක් දැනෙනවා",
    # Singlish
    "mata mage baba ekka bond wenna amarui wage danenawa",
    "mage baba langa innakotath mata eya ekka emotional connection ekak danenne na",
    "mata hithenawa mama mage babata hariyata adare pennanne na wage mata eka gana guilt ekak thiyenawa",
    "baba wa balagena innakota mata sathutu wenna one wage hithenawa habai mata ehema feeling ekak enne na",
    "mage baba ekka bond wenna amarui",
    "mage baba ekka connection ekak na",
    "baba ekka close na",
    "baba ekka emotional connection na",
    "baba ekka sambandha wenna ba",
    "mata mage baba ekka bond ekak danenne naha",
    "mata baba ekka adarayak danenne naha",
    "mage babata mama langa wela naha wage danenawa",
    "baba ekka bond wenna amarui",
    "mata baba ekka loku adarayak danenne naha",
    "mage babata mama lan wela naha wage danenawa",
    "mata kisima adara hangimak enne naha",
    "mama baba diha baluwama his bawak danenawa",
    "mata baba ekka connection ekak naha",
    "baba ekka connection ne",
    "baba ekka bandenna ba",
    "baba ekka sambandha wenna ba",
    "baby gena adarayak danenne naha",
    "baby ta adarayak danenne na",
    "baby mata stranger wage",
    "mata babywa therenne naha",
    "baby ektama mata feel ne",
    "mata amma kenek wage danenne naha",
    "caregiver kenek wage danenawa",
    "babywa wagedenath feeling naha",
    "baby ekka emotionally athiwela wage",
    "bond eka naha",
    "attachment ekak naha",
    "I feel disconnected from my baby and I struggle to feel that motherly affection. It makes me feel terribly guilty.",
    "මට බබා එක්ක ලොකු බැඳීමක් දැනෙන්නේ නැහැ. මම හොඳ අම්මා කෙනෙක් නෙවෙයිද කියලා හිතෙනවා.",
    "mata baby ekka loku bandeemak danenne na, baby langa hitiyath wenas feeling ekak enne."
]
BONDING_REASONS = ["bonding_issues"] * len(BONDING_TEXTS)
BONDING_EMOTIONS = ["sad"] * len(BONDING_TEXTS)

# --------------------------------------------------------------
# LACK OF SUPPORT  (emotion: sad)
# --------------------------------------------------------------
SUPPORT_TEXTS = [
    # English
    "Nobody helps me with the baby and I feel so alone",
    "I am doing absolutely everything by myself",
    "My family is not supportive at all during this time",
    "My husband does not help with the baby or housework",
    "I feel abandoned by the people who should support me",
    "No one is there for me when I need help the most",
    "I have to handle everything with zero assistance",
    "My partner leaves all responsibility to me alone",
    "I feel invisible and unsupported by my loved ones",
    "I wish someone would offer to help without me asking",
    "Nobody in my family understands what I am going through",
    "I feel like I am in this parenting journey completely alone",
    "My mother-in-law gives criticism not help",
    "I have no support system and it is destroying me",
    "I beg for help but nobody listens or responds",
    "I feel like a single parent even though I am married",
    "My friends do not check on me after the baby arrived",
    "I cannot rely on anyone around me to help me",
    "Everyone gives advice but nobody actually helps",
    "I feel resentment because I carry this burden alone",
    "I asked for help and was told to manage on my own",
    "No one takes my exhaustion seriously enough to help",
    "I need more support than I am getting from everyone",
    "I feel like I am failing because I have no backup",
    "The people around me do not see how much I am struggling",
    "I am burning out from doing everything without support",
    "I feel let down by my partner during this hard time",
    "Nobody steps in unless I explicitly beg for it",
    "I feel used and unsupported by the people around me",
    "I am running on empty because no one shares the load",
    "My husband comes home and does not help at all",
    "I have no one to call when things get too hard",
    "My family lives far away and I have no practical help",
    "I expected support but got none after having the baby",
    "I carry all the emotional and physical load entirely alone",
    # Sinhala Unicode
    "මට උදව් කරන්න ගෙදර කවුරුත් නෑ",
    "මම හැමදේම තනියම කරන්න ඕනේ",
    "මගේ පවුලේ අය මට සහය දක්වන්නේ නෑ",
    "මට කාගෙන්වත් උදව්වක් නැතුව අමාරුයි",
    "මට උදව් ඉල්ලුවත් කවුරුත් අහන්නේ නෑ",
    "මට තනියම මේ ඔක්කොම බර දරන්න බෑ",
    "කිසිම කෙනෙක් මට සහයක් දෙන්නේ නෑ",
    "සැමියා ගෙදර ආවත් උදව් කරන්නේ නෑ",
    "කවුරුත් මට උදව් කරන්න එන්නේ නෑ",
    # Singlish
    "mage husband mata kisima udawwak karanne naha",
    "mata udaw karanna gedara kauruth naha",
    "mama hamadema taniyen karanna one",
    "mage pawule aya mata support karanne naha",
    "mata kagegenwat udawwak nathuwa amaruwi",
    "mata taniyen me okkoma bara daranna baha",
    "kavuruth mata udaw karanna ewee naha",
    "mama taniyen baba balanna one kavuruth naha",
    "mage husband gedara awat help karanne naha",
    "mata udaw iguwat kavuruth nehawa kiuwe",
]
SUPPORT_REASONS = ["lack_of_support"] * len(SUPPORT_TEXTS)
SUPPORT_EMOTIONS = ["sad"] * len(SUPPORT_TEXTS)

# --------------------------------------------------------------
# FINANCIAL WORRY  (emotion: stressed)
# --------------------------------------------------------------
FINANCIAL_TEXTS = [
    # English
    "I am worried about money after having the baby",
    "I am struggling financially after having my baby",
    "I don't know how I will manage our finances",
    "Having a baby has created financial stress",
    "I cannot afford everything my baby needs right now",
    "We are having major money problems after the birth",
    "I am constantly stressed about expenses and bills",
    "Money is very tight and I am worried about the future",
    "I don't know how we will manage our baby expenses",
    "Financial pressure is making me feel hopeless",
    "I keep worrying about whether we can afford everything the baby needs",
    "The cost of diapers and baby supplies is putting a lot of pressure on me",
    "I am scared that our money will not be enough for the baby's expenses",
    "I constantly think about how we are going to pay our household bills",
    "Having a baby has made our financial situation much harder",
    "I feel stressed whenever I look at our monthly expenses",
    "I do not know how we will manage all these new baby costs",
    "I worry that we will run out of money before the end of the month",
    "The price of baby products is making me very anxious",
    "I feel helpless because our income is not enough for everything",
    "I keep calculating our expenses in my head every night",
    "I am worried about paying for the things my baby will need",
    "Our savings are disappearing faster than I expected",
    "I am afraid of having an unexpected expense because we have very little money left",
    "Money problems are making this period much harder for me",
    "I feel guilty when I cannot afford something my baby needs",
    "I keep thinking about our debt and how we will manage it",
    "We are struggling to cover our basic household expenses",
    "I am worried about the cost of my baby's medical needs",
    "I cannot stop thinking about how expensive everything has become",
    # Sinhala Unicode
    "මට බබා ලැබුණාට පස්සේ සල්ලි ගැන ලොකු බයක් තියෙනවා",
    "මට වියදම් ගැන ගොඩක් කනස්සල්ලයි",
    "බබාගේ වියදම් කොහොමද දරන්නේ කියලා බයයි",
    "සල්ලි ප්රශ්න නිසා මට stress",
    "මට බබා ලැබුණාට පස්සේ සල්ලි ගැන ගොඩක් stress",
    "සල්ලි ප්‍රශ්න නිසා මට හරිම අමාරුයි",
    "වියදම් වැඩි නිසා මට මූල්‍යමය කනස්සල්ලක් තියෙනවා",
    "මුදල් ප්‍රශ්න නිසා හිතට කිසිම සහනයක් නැහැ",
     "බබාට අවශ්‍ය හැම දෙයක්ම ගන්න අපිට සල්ලි මදි වෙයි කියලා මට බයයි",
    "ඩයපර් සහ බබාගේ අනෙකුත් දේවල්වල වියදම ගොඩක් වැඩියි",
    "මේ මාසේ ගෙදර බිල් ගෙවන්නේ කොහොමද කියලා මම නිතරම හිතනවා",
    "බබාගේ වියදම් නිසා අපේ මුදල් ප්‍රශ්න වැඩි වෙලා වගේ දැනෙනවා",
    "අපේ ආදායම හැම වියදමකටම ප්‍රමාණවත් නැහැ",
    "අපේ ඉතිරිකිරීම් ඉක්මනින් අඩු වෙනවා කියලා මට බයයි",
    "බබාට අවශ්‍ය දේවල් ගන්න බැරි වෙයි කියලා මට කනගාටුයි",
    "ගෙදර වියදම් සහ බබාගේ වියදම් දෙකම කළමනාකරණය කරන්න අමාරුයි",
    "හදිසි වියදමක් ආවොත් අපිට ඒක දරාගන්න බැරි වෙයි කියලා බයයි",
    "බබාගේ වෛද්‍ය වියදම් ගැන මම ගොඩක් කනස්සල්ලෙන් ඉන්නේ",
    "මුදල් ප්‍රශ්න නිසා මගේ හිතට ලොකු පීඩනයක් දැනෙනවා",
    "හැම මාසෙම වියදම් ගණන් කරමින් ඉන්න එක මට හරිම මහන්සියි",
    "අපේ ණය ගෙවන්නේ කොහොමද කියලා මම නිතරම කල්පනා කරනවා",
    "බබා ලැබුණට පස්සේ අපේ ආර්ථික තත්ත්වය අමාරු වෙලා",
    "හැම දේම මිල වැඩි නිසා අපිට ජීවත් වෙන්න අමාරුයි",
    # Singlish
    "mata salli gana godak baya hithenawa",
    "mata financial problems thiyenawa",
    "baba nisa expenses manage karanna amarui",
    "mata salli prashna nisa stress",
    "baba labunata passe salli gana baya hithenawa",
    "expenses wadi nisa financial stress",
    "salli naha baby ge wada walata",
    "mudal gatalu nisa mata harima amaruwi"
    "mata baya hitheenne baba ta ona dewal okkoma ganna salli madi wei kiyala",
    "ape income eka athi wenne naha baba ge expenses ekka",
    "diapers saha baba ge dewal walata yanawata godak salli yanawa",
    "mata hamadama hithenne me maseta bills gewanne kohomada kiyala",
    "ape savings tika ikmanata iwara wenawa wage danenawa",
    "baba ge wiyadam nisa ape mudal prashna godak wadi wela",
    "mata salli gana hithala godak baya hithenawa",
    "unexpected expense ekak awoth api kohomada karanne kiyala mata baya",
    "baba ta ona dewal ganna bari wei kiyala mata dukai",
    "ape gedara expenses manage karanna mata amarui",
    "salli madi nisa mata godak pressure ekak danenawa",
    "mata hamadama bills saha baba ge wiyadam gana hithenawa",
    "ape atha thiyena salli tika godak ikmanin adu wenawa",
    "baba ge medical expenses gana mama godak worry wenawa",
    "api me wage salli prashna ekka kohomada issarahata yanne kiyala danne naha",

]
FINANCIAL_REASONS = ["financial_worry"] * len(FINANCIAL_TEXTS)
FINANCIAL_EMOTIONS = ["stressed"] * len(FINANCIAL_TEXTS)

# --------------------------------------------------------------
# RELATIONSHIP / FAMILY PROBLEMS  (emotion: stressed)
# --------------------------------------------------------------
RELATIONSHIP_TEXTS = [
    # English
    "My relationship with my husband has changed since the baby arrived",
    "We argue all the time after having the baby",
    "I feel like my husband and I are becoming distant",
    "Having the baby has created problems in our relationship",
    "My husband and I are constantly fighting after childbirth",
    "I feel disconnected from my partner since becoming a mother",
    "There is so much conflict with my in-laws and family",
    "My partner and I cannot communicate without arguing",
    "Family problems are making my postpartum recovery harder",
    "I feel like my marriage is breaking apart after the baby",
    "My husband and I keep arguing since the baby was born",
    "I feel hurt because my partner and I cannot communicate properly anymore",
    "There is constant tension between me and my husband",
    "My family keeps criticizing the way I care for my baby",
    "I argue with my mother whenever she gives me advice about the baby",
    "My partner does not understand why I am upset with him",
    "Small conversations with my husband quickly turn into arguments",
    "I feel emotionally hurt by the way my husband speaks to me",
    "My family and I disagree about how the baby should be raised",
    "I feel like my relationship with my partner has changed completely",
    "We cannot discuss parenting without getting into an argument",
    "My husband and I have been distant because we keep fighting",
    "I feel frustrated by the constant disagreements at home",
    "My parents keep interfering in decisions about my baby",
    "I do not feel understood by my partner when we discuss the baby",
    "There has been so much conflict between our families lately",
    "My husband gets angry whenever I tell him how I feel",
    "I feel hurt after the arguments I have with my family",
    "We have different opinions about almost everything concerning the baby",
    "My relationship feels tense since becoming parents",

    # Sinhala Unicode
    "මට බබා ලැබුණාට පස්සේ මගේ husband එක්ක ප්රශ්න",
    "අපි දෙන්නා අතර නිතරම රණ්ඩු වෙනවා",
    "බබා ලැබුණාට පස්සේ අපේ relationship එක වෙනස් වෙලා",
    "මගේ පවුලේ අය එක්ක ප්රශ්න තියෙනවා",
    "බබා ලැබුණාට පස්සේ මගේ husband එක්ක නිතරම ප්රශ්න",
    "සැමියා එක්ක නිතරම ආරවුල් ඇතිවෙනවා",
    "පවුලේ අය මට සහයෝගය නොදී ප්‍රශ්න ඇතිකරනවා",
    "අපේ අඹුසැමි සබඳතාවය බබා ලැබුණාට පස්සේ දුරස් වෙලා",
    "බබා ලැබුණට පස්සේ මගේ මහත්තයා එක්ක නිතරම වාද වෙනවා",
    "මට මගේ සහකරු එක්ක හොඳින් කතා කරගන්න බැරි වෙලා",
    "මම මගේ මහත්තයා එක්ක කතා කරන හැම වෙලාවකම ප්‍රශ්නයක් ඇති වෙනවා",
    "මගේ පවුලේ අය බබාව බලාගන්න විදිහ ගැන නිතරම විවේචනය කරනවා",
    "බබාව හදන විදිහ ගැන අපේ අදහස් එකිනෙකට වෙනස්",
    "මගේ සහකරු මට දැනෙන දේ තේරුම් ගන්නේ නැහැ",
    "ගෙදර පොඩි කතා පවා දැන් වාදයකට යනවා",
    "මගේ මහත්තයා මට කතා කරන විදිහ නිසා මට ගොඩක් රිදෙනවා",
    "බබා ගැන තීරණ ගන්නකොට අපි දෙන්නා එකඟ වෙන්නේ නැහැ",
    "දරුවා ලැබුණට පස්සේ අපේ සම්බන්ධය ගොඩක් වෙනස් වෙලා",
    "මගේ දෙමාපියන් බබා ගැන ගන්න තීරණවලට වැඩිපුර මැදිහත් වෙනවා",
    "ගෙදර හැමදාම වගේ ආතතියක් සහ මතභේදයක් තියෙනවා",
    "මගේ මහත්තයා එක්ක ඇති වෙන වාද නිසා මගේ හිත ගොඩක් රිදෙනවා",
    "අපේ පවුල් දෙක අතරත් මේ දවස්වල ගොඩක් ප්‍රශ්න තියෙනවා",
    # Singlish
    "mata husband ekka relationship eka gana prashna thiyenawa",
    "baba labunata passe ape relationship eka hari naha",
    "baba labunata passe mage husband ekka nitharama prashna",
    "husband ekka hamawelama randu wenawa",
    "pawule aya ekka prashna nisa stress",
    "ape relationship eka badaga wela baba labuna passe"
    "baba ipaduna passe mage husband ekka hamadama wage tharah wenawa",
    "ape dekadena athara podi dewal walatath arguments wenawa",
    "mage husband mata mama danena widihata therum ganneth naha",
    "gedara aya baba hadana widihata gana hamadama comment karanawa",
    "mama mage husband ekka kathaa karanna giyama eka arguments ekakin iwara wenawa",
    "ape relationship eka kalin wage nemei kiyala danenawa",
    "mage family eka baba gana ganna decisions walata atha danawa",
    "mage husband mata hithena dewal kiyuwama tharah wenawa",
    "baba gana ape dekadena athara eka ekkena ekka agree wenne naha",
    "gedara hamadama tension ekak thiyenawa",
    "mama husband ekka tharah wela passe godak dukai",
    "ape family dekama athara godak prashna thiyenawa",
    "mage husband mata support karanne kohomada kiyala api dekadena athara arguments thiyenawa",
    "mage amma baba gana kiyala dena dewal walata mama godak upset wenawa",
    "api baba hadana widiya gana hemadama agree wenne naha",
]
RELATIONSHIP_REASONS = ["relationship_family_problem"] * len(RELATIONSHIP_TEXTS)
RELATIONSHIP_EMOTIONS = ["stressed"] * len(RELATIONSHIP_TEXTS)


# --------------------------------------------------------------
# SLEEP PROBLEMS  (emotion: stressed)
# NOTE: Sleep problems = mother cannot sleep / insufficient sleep /
#       waking at night / insomnia. NOT generic energy depletion.
#       Includes sentences MOVED FROM FATIGUE category.
# --------------------------------------------------------------
SLEEP_TEXTS = [
    # English
    "I cannot sleep at night even when my baby is sleeping",
    "I keep waking up every hour throughout the night",
    "I am severely sleep deprived and it is affecting everything",
    "My sleep is broken and interrupted and I feel terrible",
    "I barely sleep anymore and my mind cannot switch off",
    "I have not had more than two hours of sleep in weeks",
    "I feel delirious from the lack of continuous sleep",
    "Even when I close my eyes my mind keeps racing",
    "I wake up multiple times a night and feel destroyed",
    "The sleep deprivation is making me emotional and unstable",
    "I cannot get my baby to sleep and I am exhausted",
    "I feel like a walking zombie from no proper sleep",
    "I lie awake worrying even when I have a chance to sleep",
    "I cannot fall asleep and it is making me anxious",
    "My insomnia is making everything feel worse than it is",
    "I am struggling to function on so little sleep daily",
    "I have chronic sleep deprivation and my body is suffering",
    "I feel irritable and tearful because I am so sleep deprived",
    "Every night is a battle and I dread going to bed",
    "I feel desperate for just one full night of unbroken sleep",
    "The exhaustion from no sleep is breaking my mental health",
    "I cannot nap during the day even though I am desperate",
    "Sleep deprivation feels like a form of torture",
    "I am so tired but cannot sleep and it is so frustrating",
    "My baby wakes up constantly and I have no sleep left",
    "I feel like I am losing my mind from sleep deprivation",
    "I cannot remember what a good night sleep feels like",
    "I am so tired I could cry but I still cannot sleep",
    "Sleep feels like a luxury I am no longer allowed to have",
    "The night feeds are destroying me mentally and physically",
    # sleep-deprivation specific (previously miscategorized)
    "I cannot sleep enough and it makes everything so hard",
    "Not getting enough sleep is ruining my health",
    "I need more sleep but cannot get it because of the baby",
    "The lack of sleep is the hardest part of being a new mother",
    "Insufficient sleep has made me feel completely broken",
    # Sinhala
    "\u0db8\u0d9c\u0dda \u0db4\u0dd4\u0dad\u0dcf \u0dbb\u0dd1\u0da7 \u0db1\u0dd2\u0daf\u0dcf\u0d9c\u0db1\u0dca\u0db1\u0dda \u0db1\u0dd0\u0dc4\u0dd0",
    "\u0db8\u0da7 \u0dbb\u0dd1\u0da7 \u0db4\u0ddc\u0da9\u0dca\u0da9\u0d9a\u0dca\u0dc0\u0dad\u0dca \u0db1\u0dd2\u0daf\u0dcf\u0d9c\u0db1\u0dca\u0db1 \u0db6\u0dd0\u0dc4\u0dd0",
    "\u0db8\u0d9c\u0dda \u0db1\u0dd2\u0db1\u0dca\u0daf \u0db1\u0dd2\u0dad\u0dbb\u0db8 \u0d9a\u0dd0\u0da9\u0dd9\u0db1\u0dc0\u0dcf",
    "\u0db6\u0db6\u0dcf \u0db1\u0dd2\u0daf\u0dcf\u0d9c\u0dad\u0dca\u0dad\u0dad\u0dca \u0db8\u0da7 \u0db1\u0dd2\u0db1\u0dca\u0daf \u0dba\u0db1\u0dca\u0db1\u0dda \u0db1\u0dd0\u0dc4\u0dd0",
    "\u0db8\u0db8 \u0db1\u0dd2\u0daf\u0dd2 \u0db1\u0dd0\u0dad\u0dd4\u0dc0 \u0db8\u0dd4\u0dbd\u0dd4 \u0dbb\u0dd1\u0db8 \u0d89\u0db1\u0dca\u0db1\u0dc0\u0dcf",
    "\u0db8\u0da7 \u0db1\u0dd2\u0db1\u0dca\u0daf\u0d9a\u0dca \u0db1\u0dd0\u0dad\u0dd4\u0dc0 \u0d94\u0dbd\u0dd4\u0dc0 \u0dbb\u0dd2\u0daf\u0dd9\u0db1\u0dc0\u0dcf",
    "\u0db8\u0da7 \u0db1\u0dd2\u0daf\u0dcf\u0d9c\u0db1\u0dca\u0db1 \u0dc4\u0dbb\u0dd2\u0db8 \u0d85\u0db8\u0dcf\u0dbb\u0dd4\u0dba\u0dd2",
    # MOVED FROM FATIGUE (sleep-deprivation specific Sinhala)
    "\u0db8\u0da7 \u0db1\u0dd2\u0db1\u0dca\u0daf \u0db8\u0daf\u0dd2 \u0db1\u0dd2\u0dc3\u0dcf \u0dc4\u0dbb\u0dd2\u0db8 \u0d85\u0db8\u0dcf\u0dbb\u0dd4\u0dba\u0dd2",
    "\u0db1\u0dd2\u0db1\u0dca\u0daf \u0db1\u0ddc\u0dbd\u0dd0\u0db6\u0dd9\u0db1 \u0db1\u0dd2\u0dc3\u0dcf \u0dc1\u0dbb\u0dd3\u0dbb\u0dba \u0d9c\u0ddc\u0daf\u0dcf\u0d9a\u0dca \u0daf\u0dd4\u0dbb\u0dca\u0dc0\u0dbd\u0dba\u0dd2",
    "\u0dbb\u0dd1\u0da7 \u0dc4\u0dbb\u0dd2\u0dba\u0da7 \u0db1\u0dd2\u0daf\u0dcf\u0d9c\u0db1\u0dca\u0db1\u0da7 \u0db1\u0ddc\u0dc4\u0dd0\u0d9a\u0dd2\u0dc0 \u0d89\u0db1\u0dca\u0db1\u0dc0\u0dcf",
    "\u0db1\u0dd2\u0daf\u0dcf\u0d9c\u0db1\u0dca\u0db1\u0dda \u0db1\u0dd0\u0dad\u0dd2\u0dc0 \u0dc4\u0dd2\u0dad\u0dad\u0dca \u0d9c\u0ddc\u0daf\u0dcf\u0d9a\u0dca \u0dbd\u0dda\u0daf",
    "\u0db6\u0db6\u0dcf \u0db1\u0dd2\u0dc3\u0dcf \u0dbb\u0dd1 \u0db1\u0dd2\u0daf\u0dcf \u0d9c\u0dad \u0db1\u0ddc\u0dc4\u0dd0\u0d9a\u0dd2\u0dc0 \u0d89\u0db1\u0dca\u0db1\u0dda",
    "\u0db1\u0dd2\u0db1\u0dca\u0daf \u0dc4\u0dd2\u0d82\u0d9c \u0db1\u0dd2\u0dc3\u0dcf \u0dc1\u0dbb\u0dd3\u0dbb\u0dba\u0da7 \u0dc1\u0d9a\u0dca\u0dad\u0dd2\u0dba \u0d89\u0dbd\u0dca\u0dbd\u0db1\u0dc0\u0dcf",
    # Singlish
    "mage putha rata nida ganne naha",
    "mata rata poddakwat nidaganna baha",
    "mage ninda nitharama kadenawa",
    "baba nidagattat mata ninda yanne naha",
    "mama nidi nathuwa mulu rama innawa",
    "mata nindak nathuwa oluwa ridenawa",
    "mata nidaganna harima amaruwi",
    # MOVED FROM FATIGUE (sleep-deprivation Singlish)
    "mata ninda madi nisa harima amaruwi",
    "ninda nadapu nisa shaririyata shakthiyak naha",
    "rata hariyata nida ganna baha nisa godak amaruwi",
    "ninda labenna baha baby nisa",
    "rata nida natha inna nisa hitha leda",
    "mama rata nidaganna bari inna nisa dawasata amaruwi",
]
SLEEP_REASONS = ["sleep_problems"] * len(SLEEP_TEXTS)
SLEEP_EMOTIONS = ["stressed"] * len(SLEEP_TEXTS)

# --------------------------------------------------------------
# LOSS OF CONFIDENCE  (emotion: sad)
# --------------------------------------------------------------
CONFIDENCE_TEXTS = [
    # English
    "I feel like a terrible mother and I am failing my baby",
    "I have lost all confidence in myself as a parent",
    "I feel useless and completely incapable of doing this",
    "I doubt every single decision I make for my baby",
    "I feel like I am getting everything wrong all the time",
    "I am not the mother I wanted to be and I hate myself",
    "I feel worthless and like I contribute nothing",
    "I cannot trust my own instincts as a mother",
    "I feel like other mothers are doing so much better than me",
    "I compare myself to others and always feel less than",
    "My confidence has completely disappeared since giving birth",
    "I feel like a fraud pretending to be a good mother",
    "I cannot do anything right no matter how hard I try",
    "I feel incompetent and ashamed of my parenting",
    "I worry constantly that I am damaging my baby",
    "I feel small and inadequate in every area of my life",
    "I used to feel capable but now I doubt everything",
    "I feel like I am not enough for my baby or anyone",
    "My self-worth has hit rock bottom since becoming a mother",
    "I feel broken and unsure about everything I do",
    "I am constantly second-guessing myself as a mother",
    "I feel like a failure and I cannot shake this feeling",
    "I have lost my sense of self and feel so unsure",
    "I feel humiliated by my own inability to cope",
    "I used to be confident but now I feel like nobody",
    "I do not trust myself to make the right choices",
    "I feel like my identity has been completely erased",
    "I am ashamed of how much I struggle every day",
    "I feel defeated and have given up on believing in myself",
    "I feel like everyone can see how bad of a mother I am",
    "I feel like I have failed at the most important job",
    "I cannot make a decision without feeling it is wrong",
    "I feel like I am not cut out for motherhood",
    "I keep comparing myself to other mothers and feeling inferior",
    "I have no confidence left and feel like giving up",
    "I keep wondering whether I am good enough to be a mother",
    "I do not trust myself to make the right decisions for my baby",
    "I feel like other mothers know what they are doing but I do not",
    "I doubt myself every time my baby needs something",
    "I feel like I am failing at motherhood",
    "I am constantly questioning whether I am taking care of my baby correctly",
    "I have lost confidence in my ability to look after my child",
    "I feel incapable whenever something goes wrong with the baby",
    "I compare myself with other mothers and feel inadequate",
    "I keep thinking that another mother would do a better job than me",
    "I am afraid that I am not a good enough mother",
    "I second guess almost every parenting decision I make",
    "I feel unsure about myself as a parent",
    "I do not feel confident when handling my baby",
    "I feel like everyone else understands motherhood better than I do",
    "I worry that I am making mistakes as a mother",
    "I have stopped believing that I can handle motherhood well",
    "I feel embarrassed when I do not know what to do for my baby",
    "I keep asking myself whether I am doing enough for my child",
    "My confidence as a mother has become very low",

    # Sinhala
    "මම හොඳ අම්මා කෙනෙක්ද කියලා නිතරම මට සැක හිතෙනවා",
    "බබා වෙනුවෙන් හොඳ තීරණ ගන්න මට මාවම විශ්වාස නැහැ",
    "අනිත් අම්මලාට හැම දෙයක්ම තේරෙනවා වගේ මට කිසි දෙයක් තේරෙන්නේ නැහැ",
    "බබාට මොනවා හරි වුණාම මම මගේ හැකියාව ගැන සැක කරනවා",
    "මම අම්මා කෙනෙක් විදිහට අසාර්ථකයි වගේ මට දැනෙනවා",
    "බබාව හරියට බලාගන්නවාද කියලා මම හැමදාම සැක කරනවා",
    "අම්මා කෙනෙක් විදිහට මගේ විශ්වාසය ගොඩක් අඩු වෙලා",
    "බබාට මොනවා කරන්නද කියලා නොදන්න වෙලාවට මට මම ගැනම ලැජ්ජයි",
    "අනිත් අම්මලා එක්ක මාව සසඳනකොට මම ප්‍රමාණවත් නැහැ වගේ දැනෙනවා",
    "මම කරන හැම parenting decision එකක් ගැනම ආයෙ ආයෙ හිතනවා",
    "මට බබාව හරියට බලාගන්න පුළුවන්ද කියලා විශ්වාස නැහැ",
    "අම්මා කෙනෙක් විදිහට මගේ හැකියාව ගැන මට සැකයි",
    "මම බබා වෙනුවෙන් ප්‍රමාණවත් දෙයක් කරනවාද කියලා නිතරම හිතනවා",
    "මගේ අම්මා කෙනෙක් විදිහට තිබුණු විශ්වාසය දැන් ගොඩක් අඩුයි",
    "\u0db8\u0db8 \u0db1\u0dbb\u0d9a \u0d85\u0db8\u0dca\u0db8\u0dcf \u0d9a\u0dd9\u0db1\u0dd9\u0d9a\u0dca \u0db8\u0da7 \u0d9a\u0dd2\u0dc3\u0dd2\u0db8 \u0daf\u0dd9\u0dba\u0d9a\u0dca \u0db6\u0dd0\u0dc4\u0dd0",
    "\u0db8\u0da7 \u0db8\u0d82 \u0d9c\u0dd0\u0db1 \u0d9a\u0dd2\u0dc3\u0dd2\u0db8 \u0dc5\u0dc1\u0dca\u0dc0\u0dcf\u0dc3\u0dba\u0d9a\u0dca \u0db1\u0dd0\u0dc4\u0dd0",
    "\u0db8\u0db8 \u0d9a\u0dbb\u0db1\u0dca\u0db1\u0dda \u0dc4\u0dd0\u0db8\u0daf\u0dda\u0db8 \u0dc0\u0dbb\u0daf\u0dd2\u0db1\u0dc0\u0dcf",
    "\u0d85\u0db1\u0dd2\u0dad\u0dca \u0d85\u0db8\u0dca\u0db8\u0dbd\u0dcf \u0dc0\u0d9c\u0dda \u0db8\u0da7 \u0dc4\u0ddc\u0da9\u0da7 \u0d9a\u0dbb\u0db1\u0dca\u0db1 \u0db6\u0dda",
    "\u0db8\u0da7 \u0d9a\u0dd2\u0dc3\u0dd2\u0db8 \u0d86\u0dad\u0dca\u0db8 \u0dc5\u0dc1\u0dca\u0dc0\u0dcf\u0dc3\u0dba\u0d9a\u0dca \u0db1\u0dda",
    "\u0db8\u0db8 \u0d85\u0dc3\u0dcf\u0dbb\u0dca\u0dad\u0d9a \u0d85\u0db8\u0dca\u0db8\u0dcf \u0d9a\u0dd9\u0db1\u0dd9\u0d9a\u0dca",
    "\u0db8\u0da7 \u0d85\u0db8\u0dca\u0db8\u0dcf \u0dc0\u0dd2\u0daf\u0dd2\u0dba\u0da7 \u0d89\u0db1\u0dca\u0db1 \u0db6\u0dda \u0d9a\u0dd2\u0dba\u0dbd\u0dcf \u0dc4\u0dd2\u0dad\u0dd9\u0db1\u0dcf",
    "\u0db8\u0db8 \u0d9a\u0dbb\u0db1\u0dca\u0db1 \u0d9c\u0ddc\u0daf\u0d9a\u0dca \u0d9a\u0dd2\u0dba\u0dcf\u0dc0\u0dd9 \u0db8\u0dad\u0dca \u0dc4\u0dd0\u0db8\u0daf\u0dda\u0db8 \u0dc0\u0dbb\u0daf\u0dd2\u0db1\u0dc0\u0dcf",
    "\u0db8\u0da7 \u0db8\u0d82 \u0d9c\u0dd0\u0db1 \u0dc5\u0dc1\u0dca\u0dc0\u0dcf\u0dc3\u0dba\u0d9a\u0dca \u0db1\u0dda \u0d85\u0db8\u0dca\u0db8\u0dcf \u0dc0\u0dd9\u0db1\u0dca\u0db1 \u0db6\u0dda \u0d9a\u0dd2\u0dba\u0dbd\u0dcf",
    "\u0db8\u0db8 \u0d85\u0db1\u0dd2\u0dad\u0dca \u0d85\u0db8\u0dca\u0db8\u0dbd\u0dcf \u0dc0\u0d9c\u0dda \u0d9a\u0dbb\u0db1\u0dca\u0db1 \u0db6\u0dda",
    # Singlish
    "mama naraka amma kenek mata kisima deyak baha",
    "mata man gana kisima wishwasayak naha",
    "mama karanne hamadema waradinawa",
    "anith ammala wage mata hodata karanna baha",
    "mata kisima self confidence naha",
    "mama asarthaka amma kenek",
    "mama godak try karanawa bat hamadema waradinawa",
    "mata amma widiyata inna baha kiyala hithena",
    "mata man gana wishwasayak naha amma wenna baha kiyala",
    "mama anith ammala wage karana baha kiyala harima duka",
    "mama hithanne mama hondama amm kenekda kiyala",
    "baba gana hari decision ekak ganna mata wiswasayak naha",
    "anith amma la okkoma danne wage mata witharak kisima deyak therenneth naha",
    "baba ta mokak hari unama mama mage gana doubt wenawa",
    "mata hithenne mama ammek widihata fail wela wage",
    "mama baba balaganne hariyata da kiyala hamadama hithanawa",
    "mata baba handle karanna confidence ekak naha",
    "anith amma la ekka compare karala mama madi wage hithenawa",
    "mata hithenne wena amma kenek mata wada hondin baba balagani kiyala",
    "mama hondama amma kenek nemei wage hithenawa",
    "parenting decisions gannakota mama hamadama doubt wenawa",
    "mata amma kenek widihata loku confidence ekak naha",
    "baba gana mama karana dewal hari da kiyala sure naha",
    "mama baba care karana eka gana self confidence eka adu wela",
    "mata hithenne anith aya motherhood eka mata wada hondin karanawa kiyala",
]
CONFIDENCE_REASONS = ["loss_of_confidence"] * len(CONFIDENCE_TEXTS)
CONFIDENCE_EMOTIONS = ["sad"] * len(CONFIDENCE_TEXTS)

# --------------------------------------------------------------
# OVERWHELMED  (emotion: stressed)
# NOTE: Overwhelmed = too many responsibilities / tasks / pressure.
#       NOT sleep problems or physical pain.
# --------------------------------------------------------------
OVERWHELMED_TEXTS = [
    # English
    "Everything feels like too much and I cannot cope",
    "I feel overwhelmed by all my responsibilities at once",
    "I cannot handle all this pressure and I am breaking down",
    "I am drowning in responsibilities and cannot breathe",
    "I feel like I am about to completely break down",
    "There is too much to do and not enough of me to do it",
    "I feel crushed under the weight of everything I must do",
    "I cannot keep up with everything and feel like I am sinking",
    "My to-do list never ends and I feel paralyzed by it",
    "I feel like I am constantly failing at everything at once",
    "The demands of motherhood are too much for me right now",
    "I feel like I am being pulled in every direction at once",
    "I cannot manage the baby the house and my own needs",
    "Everything is falling apart and I cannot fix any of it",
    "I feel so overwhelmed I want to run away from everything",
    "I cannot find a moment of peace or calm in my day",
    "I feel like I am always behind and can never catch up",
    "The weight of everything I must do is crushing me",
    "I feel like I am at my absolute breaking point right now",
    "I have too many responsibilities and zero capacity left",
    "I feel suffocated by all the demands placed on me",
    "Everything feels urgent and important and I cannot focus",
    "I feel overwhelmed to tears nearly every single day",
    "I cannot prioritize because everything feels critical",
    "I feel like I need help with everything but get none",
    "I am maxed out and have nothing left to give anyone",
    "I feel like a hamster in a wheel going nowhere",
    "The chaos of my life feels unmanageable and endless",
    "I feel overwhelmed by even the smallest tasks now",
    "I cannot see a way through this mountain of responsibilities",
    "I have so many tasks I do not know where to start",
    "The pressure of doing everything is crushing me completely",
    "I feel swamped by the endless demands of daily life",
    "I cannot cope with all these responsibilities at once",
    "I feel like I am constantly running but never finishing anything",
    # Sinhala
    "\u0db8\u0da7 \u0db8\u0dda \u0d94\u0d9a\u0dca\u0d9a\u0ddc\u0db8 \u0dc0\u0dd0\u0da9 \u0daf\u0dbb\u0dcf\u0d9c\u0db1\u0dca\u0db1 \u0db6\u0dd0\u0dc4\u0dd0",
    "\u0db8\u0da7 \u0db4\u0dd3\u0daf\u0db1\u0dba \u0dc0\u0dd0\u0da9\u0dd2\u0dba\u0dd2 \u0db8\u0da7 \u0db8\u0dd4\u0d9a\u0dd4\u0dad\u0dca \u0d9a\u0dbb\u0d9c\u0db1\u0dca\u0db1 \u0db6\u0dda",
    "\u0dc4\u0dd0\u0db8\u0daf\u0dda\u0db8 \u0db8\u0d9c\u0dda \u0db4\u0dd2\u0da7\u0da7 \u0d87\u0dc0\u0dd2\u0dad\u0dca \u0db8\u0da7 \u0d85\u0db8\u0dcf\u0dbb\u0dd4\u0dba\u0dd2",
    "\u0db8\u0da7 \u0d94\u0dbd\u0dd4\u0dc0 \u0dc5\u0d9a\u0dcf\u0dbb \u0dc0\u0dd9\u0db1\u0dc0\u0dcf \u0dc0\u0dd0\u0da9 \u0dc0\u0dd0\u0da9\u0dd2\u0dba\u0dd2",
    "\u0db8\u0db8 \u0db1\u0dd2\u0dad\u0dbb\u0db8 \u0d9a\u0dbd\u0db6\u0dbd \u0dc0\u0dd9\u0db1\u0dc0\u0dcf \u0daf\u0dbb\u0dcf\u0d9c\u0db1\u0dca\u0db1 \u0db6\u0dda",
    "\u0dc4\u0dd0\u0db8\u0daf\u0dda\u0db8 \u0db8\u0d9c\u0dda \u0d94\u0d9a\u0dca\u0d9a\u0ddc\u0db8 \u0d9a\u0dbb\u0db1\u0dca\u0db1\u0da7 \u0db8\u0da7 \u0db6\u0dda",
    "\u0dc0\u0dd0\u0da9 \u0dc0\u0dd0\u0da9\u0dd2\u0dba\u0dd2 \u0dc4\u0dd2\u0dad \u0d9a\u0dbd\u0db6\u0dbd\u0dba\u0dd2",
    "\u0db8\u0da7 \u0d94\u0d9a\u0dca\u0d9a\u0ddc\u0db8 \u0d9a\u0da7\u0dba\u0dd4\u0dad\u0dca \u0d9a\u0dbb\u0db1\u0dca\u0db1 \u0db6\u0dda",
    "\u0dc4\u0dd0\u0db8\u0daf\u0dda\u0db8\u0da7 \u0db8\u0dd4\u0dc4\u0dd4\u0dab \u0db4\u0dd3\u0daf\u0db1\u0dba \u0daf\u0dd9\u0db1\u0dd9\u0db1\u0dc0\u0dcf",
    "\u0db8\u0d9c\u0dda \u0d94\u0d9a\u0dca\u0d9a\u0ddc\u0db8 \u0d9a\u0dd3\u0dbb\u0dca\u0db8\u0dca \u0daf\u0dd9\u0db1\u0dd9\u0db1\u0dc0\u0dcf",
    # Singlish
    "mata me okkoma wada daraganna baha",
    "mata pressure wadiyi mata mukuth karaganna baha",
    "hamadema mage pitata awith mata amaruwi",
    "mata oluwa wikara wenawa wada wadiyi",
    "mama nitharama kalabala wenawa daraganna ba",
    "hamadema wada ekama karana eka mata burden",
    "mata okkoma wada manage karanna shakathiyak naha",
    "mama hamawelema piyawela innawa bat adiwela",
    "okkoma wada mage pitata wela tiyenawa daraganna ba",
    "mata okkoma deyam manage karanna bari pressure",
]
OVERWHELMED_REASONS = ["overwhelmed"] * len(OVERWHELMED_TEXTS)
OVERWHELMED_EMOTIONS = ["stressed"] * len(OVERWHELMED_TEXTS)

# --------------------------------------------------------------
# PHYSICAL DISCOMFORT  (emotion: stressed)
# NOTE: Physical = pain, body aches, c-section recovery,
#       postpartum body pain. NOT sleep or energy depletion.
# --------------------------------------------------------------
PHYSICAL_TEXTS = [
    # English
    "My body is in constant pain since giving birth",
    "I feel sore and very uncomfortable all the time",
    "My recovery from birth has been extremely painful",
    "I cannot move properly because of the pain in my body",
    "My body hurts all the time and I cannot get relief",
    "My c-section wound is painful and healing very slowly",
    "I am struggling with severe physical pain after delivery",
    "My stitches are uncomfortable and make everything harder",
    "Breastfeeding is causing me a lot of physical pain",
    "My back hurts constantly from carrying and nursing my baby",
    "I have headaches every day and my body feels broken",
    "My physical recovery is much harder than I expected",
    "I feel physical pain every time I try to do something",
    "My body does not feel like my own anymore after birth",
    "I am in pain and no one seems to take it seriously",
    "The physical discomfort is affecting my mood and mental state",
    "I feel like my body is falling apart after childbirth",
    "I have aches and pains in places I never expected",
    "My pelvic floor is so sore and daily tasks are agony",
    "I feel physically weak and cannot do basic things",
    "The pain is constant and it is wearing me down mentally",
    "I feel like my body betrayed me during and after birth",
    "I am struggling with physical discomfort around the clock",
    "I cannot sleep comfortably because of the physical pain",
    "My body needs rest but my baby needs me and I cannot stop",
    "I have not felt physically comfortable in a very long time",
    "The soreness is relentless and I do not know how to cope",
    "I feel like I am trapped in a body that is constantly hurting",
    "My physical symptoms are being dismissed by my doctor",
    "I feel broken physically and I do not know when it will end",
    "The postpartum pain in my back is unbearable every day",
    "My abdominal pain after delivery has not gone away",
    "I am still recovering from a difficult labour and it hurts",
    "My body has not healed properly and everything aches",
    "I feel sore in my entire body from the delivery",
    # Sinhala
    "\u0db8\u0d9c\u0dda \u0dc3\u0dd0\u0dad\u0dca\u0d9a\u0db8 \u0d9a\u0dbd \u0dad\u0dd0\u0db1 \u0d9c\u0ddc\u0daf\u0d9a\u0dca \u0dbb\u0dd2\u0daf\u0dd9\u0db1\u0dc0\u0dcf",
    "\u0db8\u0d9c\u0dda \u0db8\u0dd4\u0dbd\u0dd4 \u0d87\u0d9f\u0db8 \u0d9a\u0dd0\u0d9a\u0dca\u0d9a\u0dd4\u0db8\u0dba\u0dd2 \u0d85\u0db8\u0dcf\u0dbb\u0dd4\u0dba\u0dd2",
    "\u0db8\u0da7 \u0dad\u0dd4\u0dc0\u0dcf\u0dbd\u0dba \u0db1\u0dd2\u0dc3\u0dcf \u0d87\u0dc0\u0dd2\u0daf\u0dd2\u0db1\u0dca\u0db1\u0dad\u0dca \u0db6\u0dda",
    "\u0db8\u0d9c\u0dda \u0d9a\u0ddc\u0db1\u0dca\u0daf \u0d9c\u0ddc\u0daf\u0d9a\u0dca \u0dbb\u0dd2\u0daf\u0dd9\u0db1\u0dc0\u0dcf",
    "\u0db8\u0da7 \u0dc1\u0dcf\u0dbb\u0dd3\u0dbb\u0dd2\u0d9a\u0dc0 \u0d9c\u0ddc\u0daf\u0d9a\u0dca \u0dc0\u0dda\u0daf\u0db1\u0dcf\u0dba\u0dd2",
    "\u0db4\u0dca\u200d\u0dbb\u0dc3\u0dd6\u0dad\u0dd2\u0dba \u0d9a\u0dbb\u0dbd\u0dcf \u0d87\u0d9f \u0dbb\u0dd2\u0daf\u0dd9\u0db1\u0dc0\u0dcf",
    "\u0dc1\u0dbb\u0dd3\u0dbb\u0dba \u0dc3\u0dd4\u0dc0 \u0db1\u0ddc\u0dc0\u0dda\u0dbd\u0dcf\u0db8 \u0d89\u0db1\u0dca\u0db1\u0dda",
    "\u0d9a\u0ddc\u0db1\u0dca\u0daf \u0dbb\u0dd2\u0daf\u0dd9\u0db1\u0dc0\u0dcf \u0daf\u0dbb\u0dd4\u0dc0\u0dcf \u0d9c\u0dd9\u0db1 \u0d89\u0db1\u0dca\u0db1\u0d9a\u0ddc\u0da7",
    "\u0dc1\u0dcf\u0dbb\u0dd3\u0dbb\u0dd2\u0d9a \u0dc0\u0dda\u0daf\u0db1\u0dcf\u0dc0 \u0d9c\u0ddc\u0daf\u0dcf\u0d9a\u0dca \u0daf\u0dbb\u0dcf\u0d9c\u0db1\u0dca\u0db1\u0dda",
    "\u0dc1\u0dbb\u0dd3\u0dbb\u0dba \u0dbb\u0dd2\u0daf\u0dd9\u0db1\u0dc0\u0dcf \u0dc1\u0dd2\u0dc1\u0dd4 \u0dbd\u0dd0\u0db6\u0dd2\u0dbd\u0dcf",
    # Singlish
    "mage c section thuwala ridenawa",
    "mage mulu angama kakkumai amaruwi",
    "mata thuwalaya nisa awidinnath baha",
    "mage konda godak ridenawa",
    "mata sharirikawa godak wedanayi",
    "prasuthiya karala anga ridenawa",
    "shariraya suwa nowela innawa",
    "konda ridenawa darua geninna",
    "mata prasuthiyata passe anga godak ridenawa",
    "shariraya hariyata suwa nowela tiyenawa",
]
PHYSICAL_REASONS = ["physical_discomfort"] * len(PHYSICAL_TEXTS)
PHYSICAL_EMOTIONS = ["stressed"] * len(PHYSICAL_TEXTS)

# --------------------------------------------------------------
# NEGATIVE THOUGHTS  (emotion: sad)
# --------------------------------------------------------------
NEGATIVE_TEXTS = [
    # English
    "I feel completely hopeless and cannot see any future",
    "I have dark thoughts that scare and frighten me",
    "I feel like giving up on everything in my life",
    "I cannot see any light at the end of this tunnel",
    "I feel mentally broken and beyond the point of repair",
    "I have thoughts that I wish I could make disappear",
    "I feel like the world would be fine without me",
    "I feel deep despair that I cannot shake off",
    "I feel worthless and like nothing will ever improve",
    "I have intrusive thoughts that I am ashamed of",
    "I feel like I am stuck in a dark hole I cannot escape",
    "I feel a heavy sadness that never seems to lift",
    "I am having thoughts about not wanting to be here",
    "I feel like I have lost all hope and purpose in life",
    "Dark and scary thoughts come to me when I least expect it",
    "I feel like a burden to everyone around me",
    "I feel like no one would miss me if I disappeared",
    "I feel like I cannot go on much longer like this",
    "I have thoughts that frighten me and I cannot stop them",
    "I feel mentally unwell and I do not know who to tell",
    "I feel so low that I wonder what the point of anything is",
    "I cannot escape the darkness in my mind",
    "I feel numb and detached from everything and everyone",
    "I feel grief for who I was before all of this",
    "I feel like I am disappearing into a very dark place",
    "I have given up hope that things will ever get better",
    "I feel deep sadness and emptiness all the time",
    "I feel like my brain is working against me",
    "I feel trapped in negative thoughts with no way out",
    "I feel devastated and broken in ways I cannot explain",
    "I think about not being here and it scares me",
    "I feel completely empty and see no reason to go on",
    "The dark thoughts come even when things seem okay",
    "I feel like I will always feel this bad and never recover",
    "I feel hopeless about my future and my baby's future",
    "My mind keeps filling with negative thoughts about myself",
    "I keep telling myself that nothing I do is good enough",
    "I cannot seem to stop thinking badly about myself",
    "Every day I find another reason to criticize myself",
    "I keep expecting everything in my life to go wrong",
    "My thoughts have become very negative since becoming a mother",
    "I automatically think about the worst side of everything",
    "I keep blaming myself for things that are not completely my fault",
    "I feel trapped in a cycle of negative thinking",
    "My mind keeps reminding me of everything I think I have done wrong",
    "I struggle to see anything positive about myself these days",
    "I keep thinking that I am a burden to everyone around me",
    "Even good moments quickly turn into negative thoughts in my head",
    "I constantly put myself down without meaning to",
    "I cannot get away from the negative things I tell myself",
    "My thoughts make me feel worthless sometimes",
    "I keep replaying my mistakes in my head",
    "I always assume that I am the problem",
    "It is difficult for me to think positively about my life",
    "My mind feels stuck on negative thoughts all day",
    # Sinhala
     "මගේ හිතේ හැමදාම මම ගැන නරක සිතුවිලි එනවා",
    "මම කරන කිසිම දෙයක් ප්‍රමාණවත් නැහැ වගේ මට හිතෙනවා",
    "මම ගැන නරක විදිහට හිතන එක නවත්වන්න මට බැහැ",
    "මම හැමදාම මගේ වැරදි විතරක් මතක් කරනවා",
    "හැම දෙයක්ම වැරදියි කියලා මම කලින්ම හිතනවා",
    "අම්මා කෙනෙක් වුණාට පස්සේ මගේ සිතුවිලි ගොඩක් නරක වෙලා",
    "මම කරන දේවල් ගැන නිතරම මටම දොස් කියාගන්නවා",
    "මගේ හිත නරක සිතුවිලි වලින් පිරුණා වගේ දැනෙනවා",
    "මට මගේ ජීවිතයේ හොඳ පැත්තක් දකින්න අමාරුයි",
    "මම හැම වෙලාවකම මමම ප්‍රශ්නය කියලා හිතනවා",
    "මම හැමදාම අනිත් අයට බරක් වගේ දැනෙනවා",
    "හොඳ දෙයක් වුණත් මගේ හිත ඉක්මනින්ම නරක පැත්තට යනවා",
    "මම ගැනම පහත් විදිහට හිතන එක නවත්වන්න බැහැ",
    "මගේ වැරදි ආයෙ ආයෙ මතක් කරමින් ඉන්නවා",
    "දවස පුරාම මගේ හිත නරක සිතුවිලි වල හිර වෙලා වගේ",
    "\u0db8\u0da7 \u0da2\u0dd3\u0dc5\u0dd2\u0dad\u0dda \u0d91\u0db4\u0dcf \u0dc0\u0dda\u0dbd\u0dcf \u0db8\u0dd0\u0dbb\u0dd9\u0db1\u0dca\u0db1 \u0dc4\u0dd2\u0dad\u0dd9\u0db1\u0dc0\u0dcf",
    "\u0db8\u0da7 \u0d85\u0da9\u0dd4\u0dbb\u0dd4 \u0dc3\u0dd2\u0dad\u0dd4\u0dc5\u0dd2\u0dbd\u0dd2 \u0d91\u0db1\u0dc0\u0dcf \u0db8\u0da7 \u0db6\u0dba\u0dba\u0dd2",
    "\u0db8\u0db8 \u0db1\u0dd0\u0dad\u0dd2 \u0dc0\u0dd4\u0dab\u0ddc\u0dad\u0dca \u0d94\u0d9a\u0dca\u0d9a\u0ddc\u0db8 \u0dc4\u0ddc\u0da9 \u0dc0\u0dda\u0dba\u0dd2",
    "\u0db8\u0da7 \u0d9a\u0dd2\u0dc3\u0dd2\u0db8 \u0db6\u0dbd\u0dcf\u0db4\u0ddc\u0dbb\u0ddc\u0dad\u0dca\u0dad\u0dd4\u0dc0\u0d9a\u0dca \u0db1\u0dda",
    "\u0db8\u0da7 \u0da2\u0dd3\u0dc5\u0dad\u0dca \u0dc0\u0dd9\u0db1\u0dca\u0db1 \u0dc4\u0dd2\u0dad\u0dd9\u0db1\u0dca\u0db1\u0dda \u0db1\u0dda",
    "\u0da2\u0dd3\u0dc5\u0dd2\u0dad\u0dba \u0d9c\u0dd9\u0dc0\u0dd9\u0db1\u0d9a\u0ddc\u0da7 \u0d85\u0da9\u0dd4\u0dbb\u0dd4 \u0dc3\u0dd2\u0dad\u0dd2\u0dc5\u0dd2\u0dbd\u0dd2",
    "\u0db8\u0da7 \u0db6\u0dbd\u0dcf\u0db4\u0ddd\u0dad\u0dca\u0dad\u0dd4\u0dc0\u0d9a\u0dca \u0db1\u0dda \u0dc4\u0ddc\u0da9 \u0dc0\u0dda\u0dbd\u0d9a\u0dca \u0d91\u0db1\u0dc0\u0dcf \u0d9a\u0dd2\u0dba\u0dbd\u0dcf",
    "\u0d85\u0da9\u0dd4\u0dbb\u0dd4 \u0dc4\u0dd2\u0dad\u0dd4\u0dc5\u0dd2\u0dbd\u0dd2 \u0dc3\u0dca\u0da7\u0ddc\u0db4\u0dca \u0d9a\u0dbb\u0db1\u0dca\u0db1 \u0db6\u0dda",
    "\u0db8\u0da7 \u0d9a\u0dd2\u0dc3\u0dd2\u0db8 \u0d86\u0dc3 \u0db1\u0dda \u0da2\u0dd3\u0dc5\u0dd2\u0dad\u0dba \u0d9c\u0dd9\u0db1",
    "\u0db8\u0db8 \u0db1\u0dd0\u0dad\u0dd2 \u0dc0\u0dd4\u0dab\u0dcf \u0db1\u0db8 \u0dc4\u0ddc\u0da9 \u0dc0\u0dda\u0dba\u0dd2 \u0d9a\u0dd2\u0dba\u0dbd\u0dcf \u0dc4\u0dd2\u0dad\u0dd9\u0db1\u0dca\u0db1\u0dda",
    # Singlish
    "mage hitha hamadama mama gana naraka dewal hithanawa",
    "mama karana kisima deyak hari naha wage mata hithenawa",
    "mama gana naraka widihata hithana eka nawaththanna baha",
    "mama hamadama mage waradi witharai mathak karanawa",
    "hamadema waradi wenawa kiyala mama kalinma hithanawa",
    "amma kenek una passe mage hithili godak negative wela",
    "mama karapu dewal gana mata hamadama waradak wage hithenawa",
    "mama hamadama mama waraddak kiyala hithanawa",
    "mage hitha negative thoughts walin pirila wage",
    "mata mage hondama dewal penenne naha",
    "mama hamadama mata mawa blame karanawa",
    "mama hamadama mama anith ayata burden ekak kiyala hithanawa",
    "honda deyak unath mata eka gana positive widihata hithanna baha",
    "mata mage gana naraka hithili nawaththanna baha",
    "mama karapu podi waradi pawa aye aye mathak wenawa",
    "mata jeewithe epa wela merenna hithenawa",
    "mata anduru sithuwili enawa mata bayai",
    "mama nathiwunot okkoma hoda wei",
    "mata kisima balaporoththuwak naha",
    "mata jeewath wenna hithenne naha",
    "jeewithaya geneema anduru sithiwili",
    "mata balapoththuwak naha hoda welak enawa kiyala",
    "mama nathi wuna nama hoda wei kiyala hithenne",
    "mata kisima asa naha jeewithe gena",
    "anduru hithuwili enawa stop karanna baha",
]
NEGATIVE_REASONS = ["negative_thoughts"] * len(NEGATIVE_TEXTS)
NEGATIVE_EMOTIONS = ["sad"] * len(NEGATIVE_TEXTS)

# --------------------------------------------------------------
# HAPPY  (emotion: happy)
# --------------------------------------------------------------
HAPPY_TEXTS = [
    # English
    "I feel happy and peaceful and grateful today",
    "My baby smiled at me and it made my whole day beautiful",
    "I feel blessed to have this little one in my life",
    "Today was a calm and genuinely lovely day",
    "I feel hopeful and positive about the future ahead",
    "I had a wonderful moment with my baby today",
    "I feel content and at peace with where I am right now",
    "My heart is full of love for my little family",
    "I feel joyful and happy despite the challenges",
    "Today I felt like myself again and it was wonderful",
    "I am grateful for the small beautiful moments with my baby",
    "I feel optimistic and energetic today which is amazing",
    "My baby laughed today and I cried happy tears",
    "I feel like I am finally finding my rhythm as a mother",
    "Today was a good day and I feel proud of myself",
    "I feel loved and supported by my partner today",
    "I had a moment of pure joy playing with my baby",
    "I feel more confident today than I have in weeks",
    "Things are looking up and I feel hopeful again",
    "I feel a deep sense of purpose and love in my role",
    "Today I noticed the beauty in the simple quiet moments",
    "I feel recharged and more like myself today",
    "My baby is healthy and I feel overwhelming gratitude",
    "I feel warmth and connection with my baby today",
    "Today felt manageable and even enjoyable at times",
    "I am starting to feel like myself again and that is wonderful",
    "I feel calm and present in this beautiful moment",
    "I feel so much love it fills me completely",
    "Today I smiled and laughed and it felt so good",
    "I am proud of myself for getting through another day well",
    # Sinhala
    "\u0d85\u0daf \u0db8\u0d9c\u0dda \u0db6\u0db6\u0dcf \u0dc4\u0dd2\u0db1\u0dcf \u0dc0\u0dd4\u0dab\u0dcf \u0db8\u0da7 \u0dc4\u0dbb\u0dd2\u0db8 \u0dc3\u0dad\u0dd4\u0da7\u0dd4\u0dba\u0dd2",
    "\u0db8\u0d9c\u0dda \u0dc4\u0dd2\u0dad\u0da7 \u0dbd\u0ddc\u0d9a\u0dd4 \u0dc3\u0dad\u0dd4\u0da7\u0d9a\u0dca \u0daf\u0dd0\u0db1\u0dd9\u0db1\u0dc0\u0dcf",
    "\u0d85\u0daf \u0dc4\u0dbb\u0dd2\u0db8 \u0dbd\u0dc3\u0dca\u0dc3\u0db1 \u0daf\u0dc0\u0dc3\u0d9a\u0dca \u0db8\u0db8 \u0dc3\u0db1\u0dca\u0dad\u0ddd\u0dc3\u0dd9\u0db1\u0dca \u0d89\u0db1\u0dca\u0db1\u0dda",
    "\u0db8\u0da7 \u0db6\u0db6\u0dcf \u0d91\u0d9a\u0dca\u0d9a \u0dc4\u0dbb\u0dd2\u0db8 \u0d86\u0dc3\u0dba\u0dd2",
    "\u0d85\u0daf \u0db8\u0d9c\u0dda \u0dc3\u0dd2\u0dad\u0da7 \u0dbd\u0ddc\u0d9a\u0dd4 \u0dc3\u0dc4\u0db1\u0dba\u0dca\u0dad\u0dd2\u0dba\u0dd9\u0db1\u0dc0\u0dcf",
    "\u0d85\u0daf \u0dc4\u0ddc\u0da9 \u0daf\u0dc0\u0dc3\u0d9a\u0dca \u0db8\u0db8 \u0dc3\u0db1\u0dca\u0dad\u0ddc\u0dc3\u0dba\u0dca\u0dad\u0dd2\u0dba\u0d9a\u0dca \u0daf\u0dd0\u0db1\u0dd9\u0db1\u0dc0\u0dcf",
    "\u0db6\u0db6\u0dcf \u0dc4\u0dd9\u0db1\u0dc0\u0dd9\u0db1\u0dc0\u0dcf \u0daf\u0dd2\u0dc0 \u0db8\u0d9c\u0dda \u0dc4\u0dd2\u0dad \u0db4\u0dd2\u0dbb\u0dd2 \u0dc0\u0dda\u0dbd\u0dcf",
    "\u0d85\u0daf \u0db8\u0db8 \u0db8\u0db8 \u0dc0\u0d9c\u0dda \u0daf\u0dd0\u0db1\u0dd9\u0db1\u0dc0\u0dcf \u0dc4\u0dbb\u0dd2\u0db8 \u0dc4\u0ddc\u0da9",
    "\u0db8\u0d9c\u0dda \u0db6\u0db6\u0dcf \u0dc3\u0dd4\u0dc0 \u0db1\u0dd2\u0dc3\u0dcf \u0db8\u0da7 \u0dbd\u0ddc\u0d9a\u0dd4 \u0dc3\u0db1\u0dca\u0dad\u0ddc\u0dc3\u0d9a\u0dca",
    "\u0d85\u0daf \u0daf\u0dc0\u0dc3 \u0dc4\u0ddc\u0da9 \u0dc0\u0dda\u0dbd\u0d9a\u0dca \u0dad\u0dd2\u0db6\u0db6\u0dcf \u0db8\u0db8 \u0dc3\u0db1\u0dca\u0dad\u0ddc\u0dc3\u0dba\u0dd2",
    # Singlish
    "ada mage baba hina wuna mata harima sathutuyi",
    "mage hithata loku sathutak danenawa",
    "ada harima lassana dawasak mama sathoshen inne",
    "mata baba ekka harima aasayi",
    "ada mage sithata loku sahanayak thiyenawa",
    "ada hoda dawasak mama santhosayak danenawa",
    "baba hena wenawa diwa mage hitha piri wela",
    "ada mama mama wage danenawa harima hoda",
    "mage baba suwa nisa mata loku santhosak",
    "ada dawasa hoda welak thibba mama santhosayi",
]
HAPPY_REASONS = ["loneliness"] * len(HAPPY_TEXTS)   # fallback reason for happy
HAPPY_EMOTIONS = ["happy"] * len(HAPPY_TEXTS)

# --------------------------------------------------------------
# COMBINE ALL DATA
# --------------------------------------------------------------
TRAIN_TEXTS = (
    LONELINESS_TEXTS + FATIGUE_TEXTS + ANXIETY_TEXTS + BONDING_TEXTS +
    SUPPORT_TEXTS + SLEEP_TEXTS + CONFIDENCE_TEXTS + OVERWHELMED_TEXTS +
    PHYSICAL_TEXTS + NEGATIVE_TEXTS + HAPPY_TEXTS + FINANCIAL_TEXTS + RELATIONSHIP_TEXTS
)

TRAIN_REASONS = (
    LONELINESS_REASONS + FATIGUE_REASONS + ANXIETY_REASONS + BONDING_REASONS +
    SUPPORT_REASONS + SLEEP_REASONS + CONFIDENCE_REASONS + OVERWHELMED_REASONS +
    PHYSICAL_REASONS + NEGATIVE_REASONS + HAPPY_REASONS + FINANCIAL_REASONS + RELATIONSHIP_REASONS
)

TRAIN_EMOTIONS = (
    LONELINESS_EMOTIONS + FATIGUE_EMOTIONS + ANXIETY_EMOTIONS + BONDING_EMOTIONS +
    SUPPORT_EMOTIONS + SLEEP_EMOTIONS + CONFIDENCE_EMOTIONS + OVERWHELMED_EMOTIONS +
    PHYSICAL_EMOTIONS + NEGATIVE_EMOTIONS + HAPPY_EMOTIONS + FINANCIAL_EMOTIONS + RELATIONSHIP_EMOTIONS
)

assert len(TRAIN_TEXTS) == len(TRAIN_REASONS) == len(TRAIN_EMOTIONS), \
    "Mismatch: texts/reasons/emotions must have equal length!"

TOTAL_EXAMPLES = len(TRAIN_TEXTS)

# ============================================================
# STANDALONE MODEL EVALUATION
# ============================================================
if __name__ == "__main__":
    """
    Run this file directly (python training_data.py) to see
    dataset quality report and cross-validation accuracy.
    """
    try:
        from sklearn.feature_extraction.text import TfidfVectorizer
        from sklearn.svm import LinearSVC
        from sklearn.tree import DecisionTreeClassifier
        from sklearn.ensemble import RandomForestClassifier
        from sklearn.pipeline import Pipeline
        from sklearn.model_selection import cross_val_score
        import numpy as np
        import re
        from collections import Counter

        def simple_clean(text):
            return re.sub(r"[^\w\s]", " ", text.lower().strip())

        print("\n[BLOOM ML EVALUATION]")
        print("Dataset Size: {} examples\n".format(TOTAL_EXAMPLES))

        # -- Data Quality Report --
        print("-- DATA QUALITY REPORT --")
        reason_counts = Counter(TRAIN_REASONS)
        emotion_counts = Counter(TRAIN_EMOTIONS)
        print("Reason distribution:")
        for r, c in sorted(reason_counts.items()):
            print("  {:<25} {:>4} samples".format(r, c))
        print("\nEmotion distribution:")
        for e, c in sorted(emotion_counts.items()):
            print("  {:<12} {:>4} samples".format(e, c))

        # Duplicate check
        seen = set()
        dupes = 0
        for t in TRAIN_TEXTS:
            if t in seen:
                dupes += 1
            seen.add(t)
        print("\nExact duplicates found: {}".format(dupes))
        print("-" * 50)

        cleaned = [simple_clean(t) for t in TRAIN_TEXTS]

        MODELS = {
            "SVM (LinearSVC)": LinearSVC(
                class_weight='balanced',
                random_state=42,
                max_iter=3000
            ),
            "Decision Tree": DecisionTreeClassifier(
                max_depth=20,
                min_samples_split=4,
                class_weight='balanced',
                random_state=42
            ),
            "Random Forest": RandomForestClassifier(
                n_estimators=200,
                max_depth=25,
                min_samples_split=4,
                class_weight='balanced',
                random_state=42,
                n_jobs=-1
            )
        }

        for name, clf in MODELS.items():
            pipeline = Pipeline([
                ("tfidf", TfidfVectorizer(ngram_range=(1, 2))),
                ("clf", clf)
            ])
            e_scores = cross_val_score(pipeline, cleaned, TRAIN_EMOTIONS, cv=5)
            r_scores = cross_val_score(pipeline, cleaned, TRAIN_REASONS, cv=5)

            print("[OK] {}:".format(name))
            print("   - Emotion Accuracy: {:.3f}".format(np.mean(e_scores)))
            print("   - Reason Accuracy:  {:.3f}\n".format(np.mean(r_scores)))

    except ImportError:
        print("[ERROR] Scikit-learn not found. Please install: pip install scikit-learn")
