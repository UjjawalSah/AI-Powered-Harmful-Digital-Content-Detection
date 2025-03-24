from flask import Flask
from flask_cors import CORS
from Backend.classifier import classifier_bp
from Backend.reddit import reddit_bp

app = Flask(__name__)
CORS(app)  
app.register_blueprint(classifier_bp)
app.register_blueprint(reddit_bp)

if __name__ == '__main__':
    app.run(debug=True)
