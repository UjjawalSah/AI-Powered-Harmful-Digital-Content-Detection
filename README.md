# 🌐 AI Probabilistic Content Classifier - Digital Content Sentinel

![AI-Powered](https://img.shields.io/badge/AI-Powered-blue.svg) ![BERT Model](https://img.shields.io/badge/BERT-Fine--Tuned-green.svg) ![Logistic Regression](https://img.shields.io/badge/Logistic-Regression-orange.svg)

Empowering safe digital conversations through innovative artificial intelligence and state-of-the-art NLP models.

## 🚀 Features

- **Advanced Protection**: Uses state-of-the-art NLP models to detect harmful content across multiple categories.
- **Dual-Model Approach**: Combines a **BERT fine-tuned model** for deep comprehension with **Logistic Regression** for speed and efficiency.
- **Real-time Analysis**: Processes and analyzes text and social media content in real-time with detailed classification results.
- **Text Classification**: Analyze text for potentially harmful content using our AI models.
- **Reddit URL Classification**: Extract and classify comments from a Reddit post.
- **Post & Comment Classification**: Create posts and classify comments dynamically.

## 🏆 Dual-Model Approach: BERT Fine-Tuned & Logistic Regression

This AI system integrates two powerful models for content classification:

### 🔹 BERT Fine-Tuned Model
- BERT (Bidirectional Encoder Representations from Transformers) is a state-of-the-art NLP model.
- It has been fine-tuned on a dataset of harmful and non-harmful digital content to improve classification accuracy.
- BERT analyzes the context and meaning of words in sentences, allowing for nuanced and high-accuracy classification.
- **Accuracy**: 92.7% on our validation dataset.

### 🔸 Logistic Regression Model
- A lightweight and efficient model trained on TF-IDF vectorized text data.
- Designed to provide **fast** and **low-resource** classifications where deep learning is unnecessary.
- Complements the BERT model by handling simpler classifications and providing immediate results.
- Ensures a balance between performance and computational efficiency.

The system dynamically chooses between these models based on the complexity of the input data, ensuring optimal performance and accuracy.

## 🔗 Live Demo
[🌍 Click here to try the live version](#) *(Replace with actual link)*

## 📌 Usage
### Text Classification
Enter text and classify it using our AI-powered model.
```
Enter text to classify
Type or paste text here...
[Classify Text]
```

### Reddit URL Classification
Extract and classify comments from a Reddit post.
```
Enter Reddit post URL
https://www.reddit.com/r/...
[Extract & Classify]
```

### Post & Comment Classification
Create a post and see how the BERT model classifies comments.
```
Your Name: [Enter your name]
What's on your mind? [Share your thoughts]
[Create Post]
```

## 🛠️ Installation
To run locally:
```sh
git clone https://github.com/UjjawalSah/AI-Powered-Harmful-Digital-Content-Detection.git
cd AI-Powered-Harmful-Digital-Content-Detection
pip install -r requirements.txt
python app.py
```

## 👨‍💻 Author
**Ujjawal Kumar**

📌 Made with ❤️ and AI 🚀

© 2025 AI Probabilistic Content Classifier. All rights reserved.
