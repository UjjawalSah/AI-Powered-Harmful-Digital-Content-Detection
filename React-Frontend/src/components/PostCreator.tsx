import { useState, useRef } from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Shield, Image as ImageIcon, Send, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { ModelType } from "./ModelSelector";
import CommentSection from "./CommentSection";

interface Post {
  text: string;
  author: string;
  timestamp: Date;
  commentCount: number;
  imageUrl?: string;
}

interface PostCreatorProps {
  selectedModel: ModelType;
}

const PostCreator = ({ selectedModel }: PostCreatorProps) => {
  const [postText, setPostText] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [post, setPost] = useState<Post | null>(null);
  const [commentCount, setCommentCount] = useState(0);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      const imageURL = URL.createObjectURL(file);
      setSelectedImage(imageURL);
    }
  };

  const handleAddImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleCreatePost = () => {
    if (!postText.trim()) {
      toast.warning("Please enter text for your post");
      return;
    }

    if (!authorName.trim()) {
      toast.warning("Please enter your name");
      return;
    }

    setIsCreating(true);

    // Simulate post creation with a delay
    setTimeout(() => {
      setPost({
        text: postText,
        author: authorName,
        timestamp: new Date(),
        commentCount: 0,
        imageUrl: selectedImage || undefined,
      });
      setIsCreating(false);
      setPostText("");
      setAuthorName("");
      setSelectedImage(null);
      toast.success("Post created successfully!");
    }, 800);
  };

  const handleCommentAdded = () => {
    if (post) {
      const newCount = commentCount + 1;
      setCommentCount(newCount);
      setPost({
        ...post,
        commentCount: newCount,
      });
    }
  };

  return (
    <section className="guardian-section">
      <motion.div 
        className="mb-8 text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-2xl md:text-3xl font-bold">
          Post Creator & Comment Classification
        </h2>
        <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
          Create a post and see how the {selectedModel === "bert" ? "BERT" : "Logistic Regression"} model classifies comments
        </p>
      </motion.div>

      {!post ? (
        <motion.div 
          className="max-w-xl mx-auto guardian-card p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="space-y-4">
            <div>
              <Label htmlFor="author-name" className="text-base mb-2 block">
                Your Name
              </Label>
              <Input
                id="author-name"
                placeholder="Enter your name..."
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                className="guardian-input"
                disabled={isCreating}
              />
            </div>

            <div>
              <Label htmlFor="post-text" className="text-base mb-2 block">
                What's on your mind?
              </Label>
              <Textarea
                id="post-text"
                placeholder="Share your thoughts..."
                value={postText}
                onChange={(e) => setPostText(e.target.value)}
                className="guardian-input min-h-24 resize-y"
                disabled={isCreating}
              />
            </div>

            {selectedImage && (
              <div className="flex justify-center">
                <img
                  src={selectedImage}
                  alt="Selected"
                  className="max-h-60 object-contain rounded"
                />
              </div>
            )}

            <div className="flex justify-between items-center">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="text-muted-foreground"
                onClick={handleAddImageClick}
                disabled={isCreating}
              >
                <ImageIcon className="h-4 w-4 mr-2" />
                Add Image
              </Button>
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleImageSelect}
                className="hidden"
              />
              <Button
                onClick={handleCreatePost}
                disabled={isCreating || !postText.trim() || !authorName.trim()}
                className="guardian-button-primary"
              >
                {isCreating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Shield className="mr-2 h-4 w-4" />
                    Create Post
                  </>
                )}
              </Button>
            </div>
          </div>
        </motion.div>
      ) : (
        <div className="max-w-xl mx-auto space-y-6">
          <motion.div 
            className="guardian-card overflow-hidden"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-400 to-blue-500 flex items-center justify-center">
                    <Shield className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium">{post.author}</p>
                    <p className="text-xs text-muted-foreground">
                      {post.timestamp.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              {post.imageUrl && (
                <div className="mb-4">
                  <img
                    src={post.imageUrl}
                    alt="Post"
                    className="w-full max-h-80 object-cover rounded"
                  />
                </div>
              )}

              <p className="text-foreground/90 mb-4">{post.text}</p>
              
              <div className="border-t border-border pt-4 flex justify-between text-xs text-muted-foreground">
                <span>0 Likes</span>
                <span>{post.commentCount} {post.commentCount === 1 ? 'Comment' : 'Comments'}</span>
                <span>0 Shares</span>
              </div>
            </div>
          </motion.div>
          
          <CommentSection postId="simulated-post" selectedModel={selectedModel} onCommentAdded={handleCommentAdded} />
        </div>
      )}
    </section>
  );
};

export default PostCreator;
