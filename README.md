# AI-Based-Perinatal-Depression-Screening-and-Support-System

The proposed system is a Sinhala–English AI-based mobile application designed to support postpartum mothers through depression screening, emotional monitoring, personalized support, exercise guidance, and routine management. It uses the EPDS and a Random Forest model to assess depression risk, provides personalized recommendations, supports Sinhala voice and text diaries, and offers an AI chatbot for guidance and daily assistance. Authorized midwives can also monitor relevant risk information to support timely follow-up. Overall, the system aims to provide accessible, continuous, and personalized postpartum mental health support for mothers in Sri Lanka.

# Research Team Members and Individual Components

1. Fernando K H P T

# Assigned Component: AI-Based Depression Screening and Classification Module

Description: This component uses the Edinburgh Postnatal Depression Scale (EPDS) and a Random Forest machine learning model to classify postpartum depression screening results into Low, Medium, and High risk levels. It provides screening results and relevant recommendations to support mothers' mental health. The component also supports Sinhala and English languages and integrates with the overall PeriCare system.

# Key Features

EPDS-based depression screening.
Random Forest model for Low, Medium, and High risk classification.
Personalized recommendations based on screening results.
Sinhala and English language support.
Maternal diary and emotional monitoring support.
Integration with the overall PeriCare application.
Support for authorized midwives to review relevant maternal risk information.

# Technologies Used

Frontend: React Native / Expo
Backend: Node.js and Express.js
Database: MongoDB
Machine Learning: Python and Random Forest
Version Control: Git and GitHub

# Machine Learning Approach

The depression screening component uses a Random Forest classification model to classify screening-related input data into predefined risk categories.
General Development Process
Collect and review the available dataset.
Clean and preprocess the data.
Prepare relevant features for model training.
Split the data into appropriate training and evaluation sets.
Train the Random Forest model.
Evaluate model performance using classification metrics.
Integrate the model with the application backend.
Test the classification workflow and result presentation.

Model performance should be evaluated using suitable metrics such as accuracy, precision, recall, and F1-score. Reported results should reflect the actual experimental evaluation.

# Install Frontend and Backend Dependencies

Navigate to the relevant frontend and backend directories and install their dependencies.

npm install

Run this command separately in each applicable Node.js project directory.

Configure the Environment

Create the required environment configuration using the project's example configuration, if available. Configure the database connection and other required service settings.
Do not commit passwords, API keys, database credentials, or other secrets to GitHub.

# Run the Application

Use the start commands defined in the relevant package.json files. For an Expo frontend, the project may use:

npx expo start

# For the backend, use the start script defined in its package.json.

# Purpose

The component aims to provide accessible, technology-assisted postpartum depression screening and support for mothers in Sri Lanka. It is intended to complement professional assessment and does not replace diagnosis or treatment by qualified healthcare professionals.

# 2. Individual Component Details

## 4. Technologies Used

The component operates within the shared PeriCare technology stack.

- **Mobile Application:** React Native and Expo
- **Frontend Programming:** JavaScript
- **Backend:** Node.js and Express.js
- **Machine Learning and Text Processing:** Python and Scikit-learn
- **Natural Language Processing:** TF-IDF and implemented text-classification methods
- **Machine Learning Models:** Random Forest and rule-based classification, where implemented
- **Database:** MongoDB
- **AI Service Integration:** Flask, where used by the implementation
- **Recommendation Resources:** Curated datasets and application media libraries
- **Version Control:** Git and GitHub

## 5. System Inputs and Outputs

### Inputs

- Maternal diary text
- Detected emotional category and identified concern
- EPDS-derived screening risk information
- User-selected preferences
- Baby-related contextual information
- Previous activity completion information, where available
- Available emotional support and educational resources

### Outputs

- Emotion and concern classification results, where provided
- Personalized emotional support activities
- Relevant educational and media resources
- Baby-care recommendations when appropriate
- Recommendations selected according to implemented eligibility and safety rules

## 6. Recommendation Approach

The component uses a **context-aware recommendation approach** to select and prioritize emotional support resources for postpartum mothers.

Rather than relying exclusively on emotional classification, the recommendation process considers available contextual information, including:

- **Emotional State:** The emotion identified from the maternal diary.
- **Primary Concern:** The concern or difficulty expressed by the mother.
- **Screening Risk Level:** The EPDS-derived risk information supplied by the screening component.
- **Personal Preferences:** The mother's available activity and content preferences.
- **Baby-Related Context:** Relevant baby-care concerns identified from the diary.

The implemented classification services and recommendation logic work together to identify suitable resources from the application's available content libraries.

The system provides **non-clinical emotional support** and does not diagnose postpartum depression, prescribe treatment, or replace professional healthcare guidance.

## 7. Integration with PeriCare

The **Personalized Emotional Support Recommendation System** operates as an individual component within the PeriCare application.

It integrates with available diary analysis services, screening information, backend services, and recommendation resources to provide contextually relevant emotional support and educational content for postpartum mothers.




#2. Individual Component Details
# Personalized Emotional Support Recommendation System

###De Silva S.R.N
**Parent Project:** PeriCare – AI-Based Postpartum Depression Screening and Support System

## 1. Project Overview

The **Personalized Emotional Support Recommendation System** is an AI-based component of PeriCare designed to provide **context-aware emotional support resources** for postpartum mothers.

The component analyzes maternal diary entries using available emotion and concern classification services. It considers relevant contextual information, screening risk levels, personal preferences, and baby-related concerns to select suitable emotional well-being activities and educational resources.

The system aims to provide personalized, non-clinical support rather than generic recommendations, helping mothers access resources relevant to their emotional states and individual situations.

## 2. Key Features

- **Multilingual Diary Analysis:** Supports the intended processing of English, Sinhala Unicode, and Singlish through the implemented analysis pipeline.
- **Emotion and Concern Classification:** Identifies emotional states and relevant concerns using available classification services.
- **Context-Aware Recommendations:** Selects suitable support resources based on diary information, preferences, and contextual details.
- **Risk-Aware Personalization:** Uses available EPDS-derived risk information to apply recommendation eligibility and safety rules.
- **Personalized Emotional Support:** Recommends available relaxation activities, breathing exercises, meditation, motivational content, games, and educational resources.
- **Baby-Care Recommendations:** Provides relevant baby-care resources when the diary indicates baby-related concerns.
- **Activity History Awareness:** Considers previous activity completion information when supported by the recommendation logic.

## 3. System Workflow

The component follows a context-aware recommendation workflow:

1. Receive maternal diary entries and relevant user information.
2. Obtain emotion and concern classification results from available analysis services.
3. Retrieve relevant screening risk information and personal preferences.
4. Identify suitable emotional support activities and educational resources based on the available context.
5. Apply recommendation eligibility rules and rank suitable resources using the implemented logic.
6. Present personalized recommendations within the PeriCare application.

## 4. Technologies Used

The component operates within the shared PeriCare technology stack.

- **Mobile Application:** React Native and Expo
- **Frontend Programming:** JavaScript
- **Backend:** Node.js and Express.js
- **Machine Learning and Text Processing:** Python and Scikit-learn
- **Natural Language Processing:** TF-IDF and implemented text-classification methods
- **Machine Learning Models:** Random Forest and rule-based classification, where implemented
- **Database:** MongoDB
- **AI Service Integration:** Flask, where used by the implementation
- **Recommendation Resources:** Curated datasets and application media libraries
- **Version Control:** Git and GitHub

## 5. System Inputs and Outputs

### Inputs

- Maternal diary text
- Detected emotional category and identified concern
- EPDS-derived screening risk information
- User-selected preferences
- Baby-related contextual information
- Previous activity completion information, where available
- Available emotional support and educational resources

### Outputs

- Emotion and concern classification results, where provided
- Personalized emotional support activities
- Relevant educational and media resources
- Baby-care recommendations when appropriate
- Recommendations selected according to implemented eligibility and safety rules

## 6. Recommendation Approach

The component uses a **context-aware recommendation approach** to select and prioritize emotional support resources for postpartum mothers.

Rather than relying exclusively on emotional classification, the recommendation process considers available contextual information, including:

- **Emotional State:** The emotion identified from the maternal diary.
- **Primary Concern:** The concern or difficulty expressed by the mother.
- **Screening Risk Level:** The EPDS-derived risk information supplied by the screening component.
- **Personal Preferences:** The mother's available activity and content preferences.
- **Baby-Related Context:** Relevant baby-care concerns identified from the diary.

The implemented classification services and recommendation logic work together to identify suitable resources from the application's available content libraries.

The system provides **non-clinical emotional support** and does not diagnose postpartum depression, prescribe treatment, or replace professional healthcare guidance.

## 7. Integration with PeriCare

The **Personalized Emotional Support Recommendation System** operates as an individual component within the PeriCare application.

It integrates with available diary analysis services, screening information, backend services, and recommendation resources to provide contextually relevant emotional support and educational content for postpartum mothers.


# 3. Individual Component Details
## Component Name: Safety-First Personalised Postpartum Exercise Recommendation and Real-Time Movement Accuracy Tracking
### Perera K.T.S.N
**Parent Project:** PeriCare – AI-Based Postpartum Depression Screening and Support System

## 1. Project Overview

The **Safety-First Personalised Postpartum Exercise Recommendation and Real-Time Movement Accuracy Tracking** component helps postpartum mothers exercise safely during recovery.

It collects daily health information, applies safety rules based on delivery type, weeks after delivery, bleeding complications, and doctor restrictions, and then recommends suitable exercises using a machine learning model. While the mother performs an exercise, the camera-based movement tracker compares her posture with the reference movement in real time and provides accuracy feedback. Sessions are timed with a built-in stopwatch, and results are saved to track progress over time.

## 2. Key Features

- **Daily Health Data Collection:** Records weeks after delivery, delivery type (normal / C-section), pelvic, back, and abdominal pain, fatigue, mobility, bleeding complications, doctor restrictions, and willingness to exercise.
- **Safety-First Evaluation:** Blocks exercise when a doctor has restricted it, and limits recommendations to breathing or gentle activities when there are bleeding complications or within the first 6 weeks after a C-section.
- **Personalised Exercise Recommendations:** A Random Forest model recommends suitable postpartum exercises with demonstration videos.
- **Real-Time Movement Accuracy Tracking:** Uses MediaPipe Pose to detect body landmarks and compares joint angles and posture against the reference movement, showing live accuracy scores and corrective feedback.
- **Stopwatch / Session Timer:** Tracks exercise duration with start, pause, and stop controls.
- **Progress Tracking:** Stores exercise records and movement sessions and displays progress, accuracy, and completion history.
- **Sinhala and English Support:** Safety messages and movement feedback are available in both languages.

## 3. System Workflow

1. The mother submits her daily health information.
2. The system evaluates safety status (safe, limited, or blocked).
3. If exercise is allowed, the recommendation model suggests suitable exercises.
4. The mother selects an exercise and watches the demonstration video.
5. The movement tracker monitors her posture through the camera and calculates accuracy in real time, while the stopwatch records the duration.
6. The session result (duration, accuracy, completion) is saved.
7. Progress is displayed through the progress screens.

## 4. Technologies Used

- **Mobile Application:** React Native and Expo
- **Pose Estimation:** MediaPipe Pose (running inside a WebView)
- **Backend:** Node.js and Express.js
- **Database:** MongoDB
- **Machine Learning:** Python, Scikit-learn (Random Forest), Pandas, Joblib
- **Version Control:** Git and GitHub

## 5. System Inputs and Outputs

### Inputs

- Weeks after delivery and delivery type
- Pain levels (pelvic, back, abdominal)
- Fatigue level, mobility level, and willingness to exercise
- Bleeding complications, doctor restrictions, and muscle weakness
- Live camera feed during exercise

### Outputs

- Safety status and safety message
- Personalised exercise recommendations with videos
- Real-time movement accuracy and corrective feedback
- Exercise duration
- Progress history and accuracy summaries

## 6. Main Files

- **Backend:** `backend/controllers/exercise.js`, `backend/routes/exercise.js`, `backend/models/Exercise.js`, `backend/models/ExerciseRecord.js`, `backend/models/ExerciseMovementSession.js`
- **Frontend:** `frontend/screens/ExerciseScreen.js`, `frontend/screens/MovementTrackingScreen.js`, `frontend/screens/ExerciseProgressScreen.js`, `frontend/screens/ProgressScreen.js`, `frontend/services/exerciseService.js`
- **Machine Learning:** `ml_training/train_exercise_recommendation_model.py`, `ml_training/train_exercise_model.py`

## 7. Integration with PeriCare

This component operates within the PeriCare application and shares its user accounts, backend, and database. It supports mothers' physical recovery, which complements the emotional and mental health support provided by the other components.

The component provides general exercise guidance only and does not replace advice from doctors, midwives, or physiotherapists.

Researcher: Perera K.T.S.N





# 4. Individual Component Details

## Assigned Component: AI-Powered Postpartum Depression Support Chatbot

### Kavindu Jayawardhana IT22186423

**Parent Project:** PeriCare – AI-Based Postpartum Depression Screening and Support System

## 1. Project Overview

Description: This component is an AI-powered chatbot designed to provide postpartum mothers with information, guidance, and non-clinical emotional support related to postpartum depression and maternal mental health. It uses a Retrieval-Augmented Generation (RAG) architecture to retrieve relevant information from a curated knowledge base and generate contextually relevant responses. The system integrates Pinecone for vector-based knowledge retrieval and Ollama for local Large Language Model (LLM) response generation. It also incorporates text normalization, domain validation, greeting detection, and crisis detection mechanisms to improve the relevance and safety of chatbot interactions. The component supports English and Sinhala, including Sinhala Unicode input and Singlish text normalization, and integrates with the overall PeriCare application.

## 2. Key Features

AI-powered conversational support for postpartum mothers.
Retrieval-Augmented Generation (RAG) for context-aware response generation.
Pinecone vector database integration for retrieving relevant knowledge.
Ollama integration for local Large Language Model response generation.
Multilingual text processing for English and Sinhala inputs.
Singlish text normalization to improve input processing.
Domain validation to identify relevant maternal mental health queries.
Greeting detection for handling introductory messages.
Crisis detection for identifying potentially concerning messages.
Conversation history management for contextual follow-up responses.
Risk-aware response generation using available user risk information.
Knowledge-based responses using curated postpartum mental health resources.

## 3. Technologies Used

Frontend: React Native and Expo
Backend: Node.js and Express.js
Database: MongoDB
Large Language Model Runtime: Ollama
Language Model: gemma3n:e2b
Retrieval-Augmented Generation: RAG
Vector Database: Pinecone
Embedding Model: multilingual-e5-large
Text Processing: JavaScript and Sinhala/Singlish normalization
Version Control: Git and GitHub

## 4. System Workflow

The chatbot follows a Retrieval-Augmented Generation (RAG) workflow to process user queries and generate responses.

1. Receive a message from the user through the chatbot interface.
2. Normalize and process the input text.
3. Detect crisis-related messages and greetings before performing knowledge retrieval.
4. Classify the query according to the relevant domain.
5. Generate a query embedding using Pinecone's hosted embedding model.
6. Retrieve relevant knowledge-base content from the Pinecone vector index.
7. Apply retrieval guardrails to determine whether the retrieved information is sufficiently relevant.
8. Construct a prompt using the retrieved context, conversation history, risk-level information, and language instructions.
9. Generate a response using the Ollama-hosted language model when the query is eligible for generation.
10. Return the response to the user and store the conversation in MongoDB, subject to the implemented crisis-message handling rules.

## 5. System Inputs and Outputs

### Inputs

User questions related to postpartum depression and maternal mental health.
English and Sinhala text messages.
Sinhala Unicode and Singlish input.
Follow-up questions and conversation history.
Available user depression risk-level information.
Relevant information from the curated knowledge base.

### Outputs

Contextually relevant chatbot responses.
Information retrieved from the postpartum mental health knowledge base.
General emotional support and self-care guidance.
Responses in the supported conversation language.
Appropriate crisis-related safety responses.
Relevant source information associated with retrieved knowledge, where provided by the implementation.

## 6. RAG-Based Chatbot Approach

The chatbot uses a Retrieval-Augmented Generation (RAG) approach to combine information retrieval with Large Language Model response generation.

The knowledge base contains relevant postpartum mental health resources, including curated research documents and healthcare information. These documents are processed into smaller text chunks and indexed in Pinecone for semantic retrieval.

When a user submits a question, the system processes the query and retrieves relevant information from the Pinecone vector database. The retrieval process uses the multilingual-e5-large embedding model and applies domain filtering, duplicate-source limits, and relevance-based guardrails. The most relevant retrieved information is then included in the prompt supplied to the Ollama language model.

The system also incorporates crisis detection, greeting detection, language instructions, conversation history, and risk-aware response guidance to support appropriate chatbot interactions.

## 7. Main Files

Backend: backend/controllers/chat.js
RAG Configuration: backend/config/ragConfig.js
Response Generation: backend/services/rag/generationService.js
Knowledge Retrieval: backend/services/rag/retrievalService.js
Pinecone Integration: backend/services/rag/pineconeClient.js
Ollama Integration: backend/services/rag/ollamaClient.js
Context Construction: backend/services/rag/contextBuilder.js
Prompt Templates: backend/services/rag/promptTemplates.js
Text Normalization: backend/services/rag/textNormalize.js
Domain Validation: backend/services/rag/domainGate.js
Crisis Detection: backend/services/rag/crisisDetector.js
Greeting Detection: backend/services/rag/greetingDetector.js
Language Script Detection: backend/services/rag/scriptDetect.js
Risk-Level Handling: backend/services/rag/riskLevelService.js
Chat Message Model: backend/models/ChatMessage.js

## 8. Integration with PeriCare

The AI-Powered Postpartum Depression Support Chatbot operates as an individual component within the PeriCare application. It complements the depression screening and classification, personalized emotional support recommendation, and postpartum exercise components by providing a conversational interface through which mothers can obtain relevant information and guidance.

The chatbot uses available user risk-level information to support risk-aware response generation and stores conversation messages in MongoDB. Pinecone provides semantic knowledge retrieval, while Ollama generates responses using the retrieved context.

The component provides informational and non-clinical emotional support. It does not replace professional medical assessment, diagnosis, or treatment. Crisis-related responses are handled through the implemented safety mechanisms, with the aim of directing users toward appropriate assistance when necessary.
