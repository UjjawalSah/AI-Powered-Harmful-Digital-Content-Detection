import time
import re
from flask import Blueprint, request, jsonify
import praw

# Import necessary helpers from classifier.py
from Backend.classifier import query_huggingface, predict_logistic, label_mapping, THRESHOLD

reddit_bp = Blueprint('reddit', __name__)

# Initialize Reddit instance using PRAW with your credentials
reddit = praw.Reddit(
    client_id="f_kjl0GdLYz9icxUxfek5w",
    client_secret="VjiyNn-VRZq9ljO5pwX3_1s9GW4nCQ",
    user_agent="Ujjawal_Sah_Comments_Scraper"
)

# Maximum number of comments to extract
MAX_COMMENTS = 20

def extract_comments(reddit_url, limit=MAX_COMMENTS, retries=3, delay=2):
    """
    Extract comments from a Reddit post using PRAW.
    """
    # Validate that the URL is for Reddit and extract the post ID (optional)
    if "reddit.com" not in reddit_url:
        print("Invalid Reddit URL!")
        return []
    
    attempt = 0
    while attempt < retries:
        try:
            # Use PRAW to get the submission using the URL directly
            submission = reddit.submission(url=reddit_url)
            # Ensure we get all comments
            submission.comments.replace_more(limit=0)
            all_comments = submission.comments.list()
            # Limit to desired number of comments
            selected_comments = all_comments[:limit]
            print(f"Found {len(selected_comments)} comments using PRAW.")
            comments = []
            for comment in selected_comments:
                comments.append({
                    "id": comment.id,
                    "author": comment.author.name if comment.author else "unknown",
                    "body": comment.body,
                    "score": comment.score,
                    "created_utc": comment.created_utc
                })
            return comments if comments else ["No comments found!"]
        except Exception as e:
            print(f"Attempt {attempt+1} encountered error: {e}")
            attempt += 1
            time.sleep(delay)
    return [f"Error fetching data from Reddit API after {retries} attempts."]

@reddit_bp.route('/api/extract-reddit-comments', methods=['POST'])
def extract_and_classify():
    """
    Extracts Reddit comments from the given URL (using PRAW) and classifies
    each comment using the selected model. The request JSON must include:
      - url: The Reddit post URL.
      - model: "bert" or "lr" (or "logistic") indicating the model to use.
    """
    data = request.get_json()
    print("Received payload:", data)
    if not data or 'url' not in data or 'model' not in data:
        return jsonify({'error': 'Missing "url" or "model" parameter in JSON payload'}), 400

    reddit_url = data['url']
    model = data['model']
    print("Model received:", model)
    
    if "reddit.com" not in reddit_url:
        return jsonify({'error': 'Please enter a valid Reddit URL'}), 400

    # Normalize model value: treat "logistic" as "lr"
    if model.lower() == "logistic":
        model = "lr"

    # Extract comments using PRAW
    comments = extract_comments(reddit_url)
    
    classified_comments = []
    for comment in comments:
        # Skip error strings or empty comment bodies
        if isinstance(comment, str) or not comment.get("body", "").strip():
            continue

        print(f"Classifying comment {comment['id']} with text: {comment['body'][:50]}...")
        if model == "bert":
            try:
                hf_response = query_huggingface({"inputs": comment["body"]})
                print("Hugging Face response for comment", comment["id"], ":", hf_response)
            except Exception as e:
                print("ERROR: Hugging Face API error for comment:", comment["id"], e)
                classification = {"overall_classification": "error", "error": str(e)}
            else:
                predictions = hf_response[0] if isinstance(hf_response, list) and len(hf_response) > 0 else []
                print("Predictions for comment", comment["id"], ":", predictions)
                processed_predictions = []
                for pred in predictions:
                    human_label = label_mapping.get(pred["label"], pred["label"])
                    processed_predictions.append({
                        "label": human_label,
                        "score": pred["score"]
                    })
                if predictions:
                    final_pred = max(predictions, key=lambda x: x["score"])
                    final_score = final_pred["score"]
                    final_label = (label_mapping.get(final_pred["label"], final_pred["label"])
                                   if final_score >= THRESHOLD else "not toxic")
                else:
                    final_label = "not toxic"
                    final_score = 0.0

                classification = {
                    "overall_classification": final_label,
                    "all_predictions": processed_predictions,
                    "score": final_score
                }
        elif model == "lr":
            try:
                prob_vector = predict_logistic(comment["body"])
                print("Logistic regression prob_vector for comment", comment["id"], ":", prob_vector)
            except Exception as e:
                print("ERROR: Logistic regression prediction error for comment:", comment["id"], e)
                classification = {"overall_classification": "error", "error": str(e)}
            else:
                labelOrder = ["toxic", "obscene", "insult", "threat", "identity_hate"]
                labelScores = []
                for idx, label in enumerate(labelOrder):
                    score = prob_vector[idx] if idx < len(prob_vector) else 0
                    labelScores.append({"label": label, "score": score})
                bestPrediction = max(labelScores, key=lambda x: x["score"])
                overall = bestPrediction["score"] > THRESHOLD and bestPrediction["label"] or "neutral"
                classification = {
                    "overall_classification": overall,
                    "all_predictions": labelScores,
                    "score": bestPrediction["score"],
                    "prediction": prob_vector
                }
        else:
            print("Received unsupported model:", model)
            classification = {"overall_classification": "unsupported model"}
        
        comment["classification"] = classification
        classified_comments.append(comment)

    print("Final classified comments:", classified_comments)
    return jsonify({"comments": classified_comments})
