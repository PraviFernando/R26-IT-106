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
Detected emotional category.
Identified primary concern or reason.
EPDS-derived screening risk level supplied by the screening component.
User-selected preferences.
Baby-related context identified from the diary.
Previous activity completion information.
Available activity, educational, and media resources.

Processing
The recommendation workflow consists of the following conceptual stages:
Receive diary information and relevant user context.
Identify the emotional state and primary concern using the available analysis services.
Obtain relevant screening and preference information from the integrated application.
Determine which resources are suitable for the current context.
Apply the implemented eligibility and ranking logic.
Present the selected recommendations to the user.
The exact processing order and ranking method should be documented according to the actual implementation.

Outputs
Emotion and concern classification results, where provided by the component's analysis pipeline.
A set of relevant emotional support activities.
Personalized educational and media resources.
Baby-related resources when relevant to the identified concern.
Recommendations selected according to the available contextual and safety rules.

6. Recommendation Approach
The component uses a context-aware recommendation approach to select suitable support resources for postpartum mothers.
The recommendation process is designed to consider more than one information source, rather than relying exclusively on a diary's emotional classification.

Contextual Information	Purpose
Detected emotion	Helps identify resources appropriate to the mother's expressed emotional state.
Primary concern	Helps match resources to the issue described in the diary.
EPDS risk level	Supports the application of risk-related recommendation eligibility and safety rules.
User preferences	Helps select resources that align with the mother's interests.
Baby-care context	Helps determine whether baby-related educational resources are relevant.
Previous activity history	Helps avoid unsuitable repetition or account for previously completed activities when supported by the implementation.
The final recommendations depend on the available resource library and the selection and ranking logic implemented in the system.

Important: Emotion and concern classification and recommendation ranking are separate tasks. A trained machine learning model should only be described as responsible for recommendation ranking if such a model has actually been trained and evaluated.

7. Multilingual Emotion and Concern Classification
The component is intended to support diary entries written in English, Sinhala Unicode, and Singlish.
Processing multilingual and code-switched text is important because mothers may express their feelings using Sinhala, English, or a mixture of both languages.
The classification pipeline may use rule-based detection and machine learning classification, depending on the implemented workflow. Any language-specific limitations should be considered when interpreting the results.

The supported emotion categories and concern categories must match those defined in the current dataset and source code.

8. Development and Implementation Workflow
The general development workflow for this component includes:
Review the requirements of the personalized emotional support recommendation component.
Identify the required emotional categories, concern categories, and contextual inputs.
Prepare and review the relevant text-classification dataset.
Clean and preprocess the available training data.
Train and evaluate the emotion and concern classification models, where applicable.
Implement the logic that connects classification outputs with contextual recommendation selection.
Prepare and maintain the relevant activity and media resources.
Integrate the component with the PeriCare mobile application and supporting services.

Test recommendation relevance, multilingual inputs, contextual behaviour, and safety-related rules.

Document the evaluation results and known limitations.
This workflow describes the development process conceptually. The completed stages and experimental results should be reported according to the actual work performed.

9. Installation and Setup
The component is part of the wider PeriCare project. Installation instructions depend on the repository structure and the available source code.

Prerequisites
Install the tools required by the relevant project components:
Node.js and npm for applicable JavaScript projects.
Python for the machine learning or text-processing services.

Git for repository management.

MongoDB if required by the integrated application.

Expo-compatible development tools for running the mobile application.

Step 1: Clone the Repository
Clone the PeriCare repository using its actual GitHub URL:

git clone <YOUR_REPOSITORY_URL>
Navigate to the cloned project directory:

cd <YOUR_PROJECT_DIRECTORY>
Replace the placeholders with the correct repository URL and directory name.

Step 2: Install Frontend Dependencies
Navigate to the frontend directory containing its package.json file:

cd <FRONTEND_DIRECTORY>
npm install
Return to the project root before navigating to another component directory, if necessary.

Step 3: Install Backend Dependencies
If the repository contains a separate Node.js backend, navigate to its directory and install its dependencies:

cd <BACKEND_DIRECTORY>
npm install
Run this step only if the relevant backend directory exists.

Step 4: Set Up the Python Environment
If the component includes a Python machine learning service, navigate to the directory containing its Python files.

Create a virtual environment:

python -m venv venv
Activate it on Windows:

venv\Scripts\activate
Activate it on macOS or Linux:

source venv/bin/activate
Install the dependencies listed in the project's actual Python requirements file:

pip install -r requirements.txt
If no requirements.txt file exists, determine the dependencies from the actual project configuration instead of assuming that this command will work.

10. Configuration
Configure the required environment variables and service connections according to the existing project setup.

Depending on the implementation, configuration may include:

Backend service URL.

Machine learning service URL.

Database connection settings.

External media-service credentials, if applicable.

Use the project's existing example environment file when available. Do not publish API keys, database passwords, tokens, or other secrets in source control.

Do not add environment variables that are not required by the actual implementation.

11. Running the Application
Use the commands defined in the relevant project configuration files.

Mobile Application
From the frontend directory, if the project uses Expo:

npx expo start
Backend Service
From the backend directory, run the start command defined in its package.json. For example, if a start script is configured:

npm start
Machine Learning Service
Start the Python service using the actual entry-point file and startup instructions in the repository.



13. Safety and Limitations
The component provides non-clinical emotional support recommendations.
It does not independently diagnose postpartum depression.
EPDS-based screening and risk classification belong to the relevant screening component of the wider PeriCare system.
Recommendations depend on the accuracy of the available classification outputs, contextual information, and resource library.
Multilingual text processing may have limitations when handling spelling variations, informal language, and code-switching.
Recommendations should not replace professional assessment, diagnosis, or treatment.
Risk-related and crisis-related cases must follow the safety procedures defined for the integrated system. General emotional support resources must not be presented as a substitute for appropriate professional or emergency assistance.

14. Integration with PeriCare
This component contributes to the broader PeriCare application by connecting maternal emotional context with personalized support resources.

It complements the application's screening, diary, monitoring, and other support features. Information is exchanged with other components according to the interfaces and data structures defined in the integrated project.

The recommendation component should remain separate from the screening component's responsibility for calculating and classifying EPDS results. It uses relevant screening information as contextual input when that information is available.

15. Purpose and Expected Contribution
The purpose of the Personalized Emotional Support Recommendation System is to make postpartum emotional support more relevant to each mother's expressed needs and circumstances.

By combining emotional signals, identified concerns, personal preferences, screening context, and relevant baby-care information, the component aims to provide accessible and contextually appropriate non-clinical support within PeriCare.

Its contribution is the connection between maternal emotional-context analysis and personalized resource selection, with the objective of supporting mothers in Sri Lanka through a more relevant digital support experience.

16. Project Repository
Repository: <YOUR_REPOSITORY_URL>

Individual Component: Personalized Emotional Support Recommendation System

Student ID: IT22284884

Parent Project: PeriCare – AI-Based Postpartum Depression Screening and Support System


