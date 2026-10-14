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

Parent Project: PeriCare – AI-Based Postpartum Depression Screening and Support System

Research Area: Artificial Intelligence, Natural Language Processing, and Context-Aware Recommendation Systems

1. Project Overview
The Personalized Emotional Support Recommendation System is an AI-based component of PeriCare designed to provide context-aware emotional support resources for postpartum mothers.
The component analyzes maternal diary entries using the available emotion and concern classification services. It considers relevant contextual information, screening risk levels, personal preferences, and baby-related concerns to select suitable emotional well-being activities and educational resources.
The system aims to provide personalized, non-clinical support rather than generic recommendations, helping mothers access resources that are relevant to their emotional states and individual situations.

2. Key Features
Multilingual Diary Analysis: Supports the intended processing of English, Sinhala Unicode, and Singlish through the implemented analysis pipeline.
Emotion and Concern Classification: Identifies emotional states and relevant concerns using the available classification services.
Context-Aware Recommendations: Selects suitable support resources based on diary information, preferences, and contextual details.
Risk-Aware Personalization: Uses available EPDS-derived risk information to apply recommendation eligibility and safety rules.
Personalized Emotional Support: Recommends available relaxation activities, breathing exercises, meditation, motivational content, games, and educational resources.
Baby-Care Recommendations: Provides relevant baby-care resources when the mother's diary indicates baby-related concerns.
Activity History Awareness: Can use previous activity completion information when supported by the recommendation logic.

3. System Workflow
The component follows a context-aware recommendation workflow:
Receive maternal diary entries and relevant user information.
Obtain emotion and concern classification results from the available analysis services.
Retrieve relevant screening risk information and personal preferences.
Identify suitable emotional support activities and educational resources based on the available context.
Apply recommendation eligibility rules and rank suitable resources using the implemented logic.
Present personalized recommendations within the PeriCare application.
The recommendations are intended to support emotional well-being and do not replace professional medical assessment or treatment.

4. Technologies Used
The component is developed within the shared PeriCare technology stack:
Mobile Application: React Native and Expo
Frontend Programming: JavaScript
Backend: Node.js and Express.js
Machine Learning and Text Processing: Python and Scikit-learn
Natural Language Processing: TF-IDF and the implemented text-classification methods
Machine Learning Models: Random Forest and rule-based classification, where implemented
Database: MongoDB

AI Service Integration: Flask, where used by the implemented service
Data and Resources: Curated recommendation datasets and application media libraries
Version Control: Git and GitHub

5. System Inputs and Outputs
Inputs
Maternal diary text
Detected emotion and identified concern
EPDS-derived risk information
User-selected preferences
Baby-related contextual information
Previous activity completion information, where available
Available emotional support and educational resources

Outputs
Emotion and concern classification results, where provided
Personalized emotional support activities
Contextually relevant educational and media resources
Baby-care recommendations when relevant
Recommendations selected according to implemented eligibility and safety rules

6. Recommendation Approach
The component uses a context-aware approach to select and prioritize emotional support resources for postpartum mothers.
Rather than relying exclusively on emotional classification, the recommendation process considers available contextual information, including the mother's primary concern, personal preferences, screening risk level, and baby-related needs.
The implemented classification services and recommendation logic work together to identify relevant resources from the application's available content libraries.
The system is intended for non-clinical emotional support. It does not diagnose postpartum depression, prescribe treatment, or replace guidance from qualified healthcare professionals.

7. Integration with PeriCare
The Personalized Emotional Support Recommendation System operates as an individual component within the PeriCare application. It integrates with the available diary analysis, screening information, backend services, and recommendation resources to deliver contextually relevant support to postpartum mothers.



Component Description
