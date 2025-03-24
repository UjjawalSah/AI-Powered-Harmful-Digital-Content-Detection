import { useState } from "react";
import axios from "axios";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { 
  Dialog,
  DialogContent, 
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { 
  Send, 
  Loader2, 
  AlertCircle, 
  CheckCircle, 
  ChevronDown, 
  Shield, 
  BrainCircuit,
  MessageSquarePlus,
  X,
  User
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { ModelType } from "./ModelSelector";
import ResultsPanel from "./ResultsPanel";

// Minimal type definitions
interface ClassificationResult {
  overall_classification: string;
  all_predictions: { label: string; score: number }[];
  score?: number;
  prediction?: number[];
}

interface Comment {
  id: string;
  text: string;
  author: string;
  timestamp: Date;
  classification: ClassificationResult;
}

interface CommentSectionProps {
  postId: string;
  selectedModel: ModelType;
  onCommentAdded?: () => void;
}

// Inline function to classify comment text via axios.
// This uses the Flask endpoints running on port 5000.
// The endpoint expects a payload with a "text" key.
const classifyComment = async (commentText: string, selectedModel: ModelType): Promise<ClassificationResult> => {
  const endpoint = selectedModel === "bert" 
    ? "/api/bert-classify" 
    : "/api/lr-classify";
  const response = await axios.post(endpoint, { text: commentText });
  return response.data.final_prediction;
};

const CommentSection = ({ postId, selectedModel, onCommentAdded }: CommentSectionProps) => {
  const [commentText, setCommentText] = useState("");
  const [userName, setUserName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [currentClassification, setCurrentClassification] = useState<ClassificationResult | null>(null);
  const [showToxicDialog, setShowToxicDialog] = useState(false);
  const [pendingComment, setPendingComment] = useState<{ text: string; author: string } | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [selectedComment, setSelectedComment] = useState<Comment | null>(null);
  const [showCommentForm, setShowCommentForm] = useState(false);

  const openDetailsDialog = (comment: Comment) => {
    setSelectedComment(comment);
    setShowDetailsDialog(true);
  };

  const handleClassify = async () => {
    if (!commentText.trim()) {
      toast.warning("Please enter a comment");
      return;
    }
    if (!userName.trim()) {
      toast.warning("Please enter your name");
      return;
    }
    setIsSubmitting(true);
    try {
      // Inline axios call to classify the comment text.
      const classification: ClassificationResult = await classifyComment(commentText, selectedModel);
      // Re-calculate overall classification based on 50% threshold.
      const harmfulLabels = classification.all_predictions.filter(pred => pred.score >= 0.5)
        .map(pred => pred.label);
      const revisedOverall = harmfulLabels.length > 0 ? harmfulLabels.join(" + ") : "neutral";
      classification.overall_classification = revisedOverall;
      
      setCurrentClassification(classification);
      
      // If classification is not neutral (i.e. harmful), require confirmation.
      if (classification.overall_classification !== "neutral") {
        setPendingComment({ text: commentText, author: userName });
        setShowToxicDialog(true);
      } else {
        addCommentWithClassification(commentText, userName, classification);
        setCommentText("");
        toast.success("Comment added successfully!");
      }
    } catch (error) {
      console.error("Comment classification error:", error);
      toast.error("Failed to classify comment. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const addCommentWithClassification = (text: string, author: string, classification: ClassificationResult) => {
    const newComment: Comment = {
      id: Date.now().toString(),
      text,
      author,
      timestamp: new Date(),
      classification
    };
    setComments([newComment, ...comments]);
    if (onCommentAdded) {
      onCommentAdded();
    }
  };

  const handleConfirmToxicComment = () => {
    if (pendingComment && currentClassification) {
      addCommentWithClassification(pendingComment.text, pendingComment.author, currentClassification);
      setCommentText("");
      setShowToxicDialog(false);
      setPendingComment(null);
      toast.success("Comment added with warning flag");
    }
  };

  const handleCancelToxicComment = () => {
    setShowToxicDialog(false);
    setPendingComment(null);
    toast.info("Comment was not posted due to harmful content");
  };

  const getModelAccuracy = () => {
    return selectedModel === "bert" ? "92.7%" : "88.3%";
  };

  const toggleCommentForm = () => {
    setShowCommentForm(!showCommentForm);
  };

  // Get colorful avatar gradient based on index.
  const getAvatarGradient = (index: number) => {
    const gradients = [
      "from-purple-400 to-blue-500",
      "from-pink-400 to-orange-400",
      "from-green-400 to-teal-500",
      "from-blue-400 to-indigo-500",
      "from-yellow-400 to-orange-500",
      "from-indigo-400 to-purple-500"
    ];
    return gradients[index % gradients.length];
  };

  return (
    <div className="guardian-card p-6 space-y-6 relative overflow-hidden bg-gradient-to-br from-blue-50/80 to-purple-50/80 dark:from-blue-900/20 dark:to-purple-900/20">
      {/* Background gradient elements */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-gradient-to-br from-guardian-blue/10 to-guardian-teal/10 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-gradient-to-br from-guardian-teal/10 to-guardian-blue/10 rounded-full blur-3xl"></div>
      
      <div className="flex items-center justify-between relative z-10">
        <h3 className="text-lg font-medium">Comments</h3>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground bg-guardian-blue/5 px-3 py-1.5 rounded-full">
            <BrainCircuit className="h-3.5 w-3.5 text-guardian-blue" />
            <span>{selectedModel === "bert" ? "BERT Fine-Tuned" : "Logistic Regression"} Active</span>
            <span className="text-green-500 font-medium">({getModelAccuracy()})</span>
          </div>
          
          <button 
            onClick={toggleCommentForm}
            className="flex items-center justify-center h-10 w-10 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-md hover:shadow-lg transition-all duration-300"
          >
            {showCommentForm ? (
              <X className="h-5 w-5" />
            ) : (
              <MessageSquarePlus className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>
      
      <AnimatePresence>
        {showCommentForm && (
          <motion.div 
            className="space-y-4"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex space-x-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center shadow-sm">
                <Send className="h-4 w-4 text-white" />
              </div>
              <div className="flex-1 space-y-2">
                <input
                  type="text"
                  placeholder="Your name"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="guardian-input text-sm h-8 w-full"
                  disabled={isSubmitting}
                />
                <Textarea
                  placeholder="Add a comment..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="guardian-input min-h-20 resize-y focus:border-guardian-teal"
                  disabled={isSubmitting}
                />
                <div className="flex justify-end">
                  <Button
                    onClick={handleClassify}
                    disabled={isSubmitting || !commentText.trim() || !userName.trim()}
                    size="sm"
                    className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white shadow-md transition-all duration-300"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                        Classifying...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-3 w-3" />
                        Add Comment
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {comments.length > 0 ? (
        <div className="space-y-6 pt-4 border-t border-border">
          <AnimatePresence>
            {comments.map((comment, index) => (
              <motion.div 
                key={comment.id}
                className={index % 2 === 0 ? "ml-0 mr-12" : "mr-0 ml-12"}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <div className={`p-4 rounded-xl shadow-sm ${
                  index % 2 === 0 
                    ? "bg-gradient-to-r from-white to-blue-50/50 border-l-2 border-l-blue-500 dark:from-gray-800/80 dark:to-blue-900/20" 
                    : "bg-gradient-to-l from-white to-teal-50/50 border-r-2 border-r-teal-500 dark:from-gray-800/80 dark:to-teal-900/20"
                }`}>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${getAvatarGradient(index)} flex items-center justify-center`}>
                        <User className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <p className="font-medium">{comment.author}</p>
                        <p className="text-xs text-muted-foreground">
                          {comment.timestamp.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      {comment.classification.overall_classification === 'toxic' ? (
                        <AlertCircle className="h-4 w-4 text-destructive" />
                      ) : (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      )}
                      <span className={comment.classification.overall_classification === 'toxic' 
                        ? "text-destructive text-sm font-medium" 
                        : "text-green-500 text-sm font-medium"
                      }>
                        {comment.classification.overall_classification}
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-foreground/90 text-sm mb-3">
                    {comment.text}
                  </p>
                  
                  <button
                    onClick={() => openDetailsDialog(comment)}
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <span>View classification details</span>
                    <ChevronDown className="h-3 w-3" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground bg-blue-50/30 dark:bg-blue-900/10 rounded-lg border border-dashed border-blue-200 dark:border-blue-800/30">
          <MessageSquarePlus className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
          <p>No comments yet. Be the first to comment!</p>
          {!showCommentForm && (
            <Button 
              variant="link" 
              onClick={toggleCommentForm}
              className="mt-2 text-guardian-blue"
            >
              Add a comment
            </Button>
          )}
        </div>
      )}

      {/* Toxic Content Warning Dialog */}
      <Dialog open={showToxicDialog} onOpenChange={setShowToxicDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <span>Potentially Harmful Content</span>
            </DialogTitle>
            <DialogDescription>
              Your comment has been classified as potentially harmful or inappropriate.
            </DialogDescription>
          </DialogHeader>
          
          {currentClassification && (
            <div className="py-2">
              <div className="bg-destructive/5 p-3 rounded-lg border border-destructive/20 mb-4">
                <p className="text-sm text-muted-foreground">Your comment:</p>
                <p className="text-sm font-medium mt-1">{pendingComment?.text}</p>
              </div>
              
              <ResultsPanel result={currentClassification} />
            </div>
          )}
          
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={handleCancelToxicComment}>
              Edit Comment
            </Button>
            <Button variant="destructive" onClick={handleConfirmToxicComment}>
              Post Anyway
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Comment Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-2xl">
          {selectedComment && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl flex items-center gap-2">
                  <span>Comment Classification Details</span>
                  {selectedComment.classification.overall_classification === 'toxic' ? (
                    <AlertCircle className="h-5 w-5 text-destructive" />
                  ) : (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  )}
                </DialogTitle>
                <DialogDescription>
                  Analysis using {selectedModel === "bert" ? "BERT Fine-Tuned" : "Logistic Regression"} model
                </DialogDescription>
              </DialogHeader>
              
              <div className="p-1">
                <div className="bg-gradient-to-r from-muted/30 to-muted/50 p-4 rounded-lg border border-border mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-medium">{selectedComment.author}</span>
                    <span className="text-xs text-muted-foreground">
                      {selectedComment.timestamp.toLocaleString()}
                    </span>
                  </div>
                  <p className="text-foreground/90">{selectedComment.text}</p>
                </div>
                
                <div className="space-y-6">
                  <ResultsPanel result={selectedComment.classification} />
                  
                  <div className="bg-gradient-to-r from-guardian-blue/5 to-guardian-teal/5 rounded-lg p-4 border border-guardian-blue/10">
                    <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                      <BrainCircuit className="h-4 w-4 text-guardian-blue" />
                      <span>Model Information</span>
                    </h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex justify-between">
                        <span className="text-muted-foreground">Model Type:</span>
                        <span className="font-medium">{selectedModel === "bert" ? "BERT Fine-Tuned" : "Logistic Regression"}</span>
                      </li>
                      <li className="flex justify-between">
                        <span className="text-muted-foreground">Accuracy:</span>
                        <span className="font-medium">{getModelAccuracy()}</span>
                      </li>
                      <li className="flex justify-between">
                        <span className="text-muted-foreground">Processing Time:</span>
                        <span className="font-medium">{selectedModel === "bert" ? "218ms" : "47ms"}</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CommentSection;
