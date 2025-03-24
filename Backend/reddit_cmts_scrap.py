import time
import re
import praw

# Initialize Reddit instance using PRAW with your credentials
reddit = praw.Reddit(
    client_id="f_kjl0GdLYz9icxUxfek5w",
    client_secret="VjiyNn-VRZq9ljO5pwX3_1s9GW4nCQ",
    user_agent="Ujjawal_Sah_Comments_Scraper"
)

def scrape_reddit_comments(url, limit=30, retries=3, delay=2):
    """Scrapes comments from a given Reddit URL using PRAW."""
    if "reddit.com" not in url:
        return "Invalid Reddit URL!"
    
    attempt = 0
    while attempt < retries:
        try:
            submission = reddit.submission(url=url)
            submission.comments.replace_more(limit=0)
            all_comments = submission.comments.list()
            comments = [comment.body for comment in all_comments[:limit]]
            return comments if comments else ["No comments found!"]
        except Exception as e:
            print(f"Attempt {attempt+1} encountered error: {e}")
            attempt += 1
            time.sleep(delay)
    return [f"Error fetching data from Reddit API after {retries} attempts."]
