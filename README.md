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


2. Individual Component Details
Component Name: Personalized Emotional Support Recommendation System

Researcher: De Silva S. R. N.

Student ID: IT22284884

Parent Project: PeriCare – AI-Based Postpartum Depression Screening and Support System

Research Area: Artificial Intelligence, Natural Language Processing, and Context-Aware Recommendation Systems

Component Description
This component processes maternal diary information to identify emotional states and the concerns described by the mother. It uses the available classification services and contextual information to select and rank suitable emotional support resources.
The recommendation system can provide resources such as relaxation activities, breathing exercises, meditation, motivational content, educational videos, games, and other suitable well-being activities, depending on the resources available in the application.
It also considers baby-related concerns when selecting baby-care resources, helping ensure that recommendations are relevant to the mother's actual situation.

3. Key Features
Multilingual Diary Analysis: Supports the intended processing of English, Sinhala Unicode, and Singlish diary entries, subject to the capabilities of the implemented classification pipeline.
Emotion Classification: Identifies emotional categories such as Happy, Sad, Stressed, and Anxious using the implemented emotion-analysis component.
Concern Identification: Identifies relevant concerns, such as loneliness, fatigue, anxiety, sleep problems, lack of support, and baby-care difficulties.
Context-Aware Recommendations: Uses available emotional, personal, and contextual information to select relevant support resources.
Risk-Aware Recommendations: Uses the EPDS risk information supplied by the screening component when applying the recommendation system's eligibility and safety rules.
Personalized Activities: Provides suitable activities based on the available user preferences and contextual information.
Baby-Related Recommendations: Selects relevant baby-care resources when the diary indicates a baby-related concern.
Media and Educational Resources: Supports the presentation of available videos and other curated resources, depending on the implemented media-retrieval functionality.

Activity History Awareness: Can consider previous activity completion information when this information is available to the recommendation logic.

Integration with PeriCare: Functions as an individual component within the broader postpartum support application.

4. Technologies Used
The following technologies are associated with the PeriCare project. Confirm the exact dependencies and implementation details in the component's source code before treating this list as the final technology inventory.

Area	Technology
Mobile application	React Native and Expo
Frontend programming	JavaScript
Machine learning and text processing	Python
Classification service	Python with Flask, if used by the current implementation
Backend integration	Node.js and Express.js, where required by the integrated application
Database	MongoDB, where used by the integrated application
Machine learning libraries	Scikit-learn and TF-IDF, if used by the current models
Data and recommendation resources	Curated resource datasets and application libraries
Version control	Git and GitHub

5. System Inputs and Outputs
Inputs
The component may use the following information, depending on availability within the integrated application:
Maternal diary text.
Parent Project: PeriCare – AI-Based Postpartum Depression Screening and Support System
