import requests
from flask import Blueprint, request, jsonify
import json
import os
import time
import numpy as np
import re
import math

classifier_bp = Blueprint('classifier', __name__)

# -------------------------------
# BERT Toxicity Classifier Endpoint
# -------------------------------

# Hugging Face Inference API details for the BERT toxicity classifier
API_URL = "https://api-inference.huggingface.co/models/ujjawalsah/bert-toxicity-classifier"
headers = {"Authorization": "Bearer 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"}

# Mapping dictionary to convert generic labels to human-readable labels.
label_mapping = {
    "LABEL_0": "toxic",
    "LABEL_1": "obscene",
    "LABEL_2": "insult",
    "LABEL_3": "threat",
    "LABEL_4": "identity_hate"
}

# Threshold for toxicity classification. If no label exceeds this, the text is considered "not toxic".
THRESHOLD = 0.5

def query_huggingface(payload):
    print("DEBUG: Querying Hugging Face with payload:", payload)
    response = requests.post(API_URL, headers=headers, json=payload)
    print("DEBUG: Hugging Face response status:", response.status_code)
    if response.status_code != 200:
        raise Exception(f"Request failed with status code {response.status_code}: {response.text}")
    try:
        result = response.json()
        print("DEBUG: Hugging Face response JSON:", result)
        return result
    except Exception as e:
        print("Failed to decode JSON from response:")
        print(response.text)
        raise e

def query_with_retries(payload, retries=3, delay=2):
    for attempt in range(retries):
        try:
            return query_huggingface(payload)
        except Exception as e:
            print(f"Attempt {attempt+1} failed: {e}")
            time.sleep(delay)
    # After retries, raise exception so that fallback can be used.
    raise Exception("Hugging Face API is unavailable after multiple attempts.")

@classifier_bp.route('/api/bert-classify', methods=['POST'])
def classify_text():
    data = request.get_json()
    if not data or 'text' not in data:
        return jsonify({'error': 'Missing "text" parameter in JSON payload'}), 400

    text = data['text']
    # Check that the model parameter (if provided) is "bert"
    model = data.get('model', 'bert')
    if model != 'bert':
        return jsonify({'error': 'Only the BERT toxicity classifier is currently supported.'}), 400

    try:
        hf_response = query_with_retries({"inputs": text})
        predictions = hf_response[0] if isinstance(hf_response, list) and len(hf_response) > 0 else []
    except Exception as e:
        print("ERROR: Hugging Face API error:", e)
        # Fallback: use local logistic regression classifier
        prob_vector = predict_logistic(text)
        labelOrder = ["toxic", "obscene", "insult", "threat", "identity_hate"]
        predictions = []
        for idx, label in enumerate(labelOrder):
            predictions.append({"label": label, "score": prob_vector[idx]})

    processed_predictions = []
    for pred in predictions:
        # If the prediction is coming from the logistic regression fallback, the labels are already human readable.
        human_label = label_mapping.get(pred.get("label"), pred.get("label"))
        score = pred.get("score", 0.0)
        processed_predictions.append({
            "label": human_label,
            "score": score
        })

    # Determine the final prediction based on the highest score.
    if predictions:
        final_pred = max(predictions, key=lambda x: x.get("score", 0.0))
        final_score = final_pred.get("score", 0.0)
        final_label = (
            label_mapping.get(final_pred.get("label"), final_pred.get("label"))
            if final_score >= THRESHOLD
            else "not toxic"
        )
    else:
        final_label = "not toxic"
        final_score = 0.0

    result = {
        "final_prediction": {
            "label": final_label,
            "score": final_score,
            "all_predictions": processed_predictions
        }
    }
    print("DEBUG: Final processed result:", result)
    return jsonify(result)

# -------------------------------
# Logistic Regression Classifier Endpoint (Without sklearn)
# Now using model_parameters.json
# -------------------------------

MODEL_PARAMETERS_FILE = "model_parameters.json"

if not os.path.exists(MODEL_PARAMETERS_FILE):
    raise Exception(f"Model parameters file {MODEL_PARAMETERS_FILE} not found.")

with open(MODEL_PARAMETERS_FILE, "r") as f:
    model_params = json.load(f)

# Extract TF-IDF parameters from JSON
tfidf_params = model_params.get("tfidf", {})
vocabulary = tfidf_params.get("vocabulary", {})  # mapping token -> index
idf_values = np.array(tfidf_params.get("idf", []))  # list/array of idf values
# (max_features is available if needed)
max_features = tfidf_params.get("max_features", None)

# Extract logistic regression parameters from JSON
lr_params = model_params.get("logistic_regression", {})

def sigmoid(x):
    return 1 / (1 + np.exp(-x))

def custom_vectorize(text, vocab):
    """
    A simple bag-of-words count vectorizer.
    Lowercases the text, splits on whitespace,
    and counts occurrences of words that are in the vocabulary.
    If no vocabulary is available, returns a zero vector with the expected number of features.
    """
    if not vocab:
        # Use the number of features from the idf_values.
        n_features = len(idf_values)
        return np.zeros(n_features)
    else:
        vector = np.zeros(len(vocab))
        for word in text.lower().split():
            if word in vocab:
                vector[vocab[word]] += 1
        return vector

def predict_logistic(text):
    # Transform the text using the custom vectorizer and TF-IDF.
    # First, get bag-of-words counts.
    counts = custom_vectorize(text, vocabulary)
    # Then, compute the TF-IDF vector.
    tfidf_vector = counts * idf_values
    # Now, compute the probability for each label.
    # The lr_params from JSON is a dictionary mapping label to its parameters.
    labelOrder = ["toxic", "obscene", "insult", "threat", "identity_hate"]
    prob_vector = []
    for label in labelOrder:
        params = lr_params.get(label, None)
        if params is None:
            prob_vector.append(0.0)
        else:
            coef = np.array(params["coef"])
            intercept = params["intercept"]
            z = np.dot(tfidf_vector, coef) + intercept
            prob = sigmoid(z)
            prob_vector.append(prob)
    return prob_vector

@classifier_bp.route('/api/lr-classify', methods=['POST'])
def classify_text_logistic():
    data = request.get_json()
    if not data or 'text' not in data:
        return jsonify({'error': 'Missing "text" parameter in JSON payload'}), 400

    text = data['text']
    # Check that the model parameter (if provided) is "lr" (logistic regression).
    model = data.get('model', 'lr')
    if model != 'lr':
        return jsonify({'error': 'Only the Logistic Regression classifier is currently supported.'}), 400

    try:
        prob_vector = predict_logistic(text)
    except Exception as e:
        print("ERROR: Logistic regression prediction error:", e)
        return jsonify({'error': str(e)}), 500

    print("DEBUG: Logistic predict_proba vector:", prob_vector)
    # Define the order of labels (adjust as needed for your model)
    labelOrder = ["toxic", "obscene", "insult", "threat", "identity_hate"]
    labelScores = []
    for idx, label in enumerate(labelOrder):
        score = prob_vector[idx] if idx < len(prob_vector) else 0
        labelScores.append({"label": label, "score": score})

    # Determine overall classification: choose the label with highest probability if above threshold.
    bestPrediction = max(labelScores, key=lambda x: x["score"])
    overall = bestPrediction["score"] > THRESHOLD and bestPrediction["label"] or "neutral"

    result = {
        "final_prediction": {
            "label": overall,
            "score": bestPrediction["score"],
            "all_predictions": labelScores,
            "prediction": prob_vector  # raw probability vector for reference
        }
    }

    return jsonify(result)
