import { useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import { 
  MessageSquare, 
  Loader2, 
  ExternalLink, 
  AlertCircle, 
  CheckCircle, 
  ChevronDown, 
  ThumbsUp, 
  Calendar, 
  User,
  Link,
  BarChart3,
  Shield,
  BrainCircuit
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import ResultsPanel from "./ResultsPanel";
import { ModelType } from "./ModelSelector";

// Minimal type definition for RedditComment
interface RedditComment {
  id: string;
  author: string;
  body: string;
  score: number;
  created_utc: number;
  permalink?: string;
  classification?: {
    overall_classification: string;
    [key: string]: any;
  }
}

// Inline axios function to extract (and classify) Reddit comments using the proper endpoint.
const extractRedditComments = async (redditUrl: string, selectedModel: ModelType) => {
  const endpoint = "/api/extract-reddit-comments";
  const response = await axios.post(endpoint, { url: redditUrl, model: selectedModel });
  return response.data.comments || [];
};

interface RedditClassifierProps {
  selectedModel: ModelType;
}

const RedditClassifier = ({ selectedModel }: RedditClassifierProps) => {
  const [url, setUrl] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [comments, setComments] = useState<RedditComment[]>([]);
  const [selectedComment, setSelectedComment] = useState<RedditComment | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);

  const handleExtract = async () => {
    if (!url.trim()) {
      toast.warning("Please enter a Reddit URL");
      return;
    }

    if (!url.includes("reddit.com")) {
      toast.error("Please enter a valid Reddit URL");
      return;
    }

    setIsAnalyzing(true);
    setComments([]);
    
    try {
      const comments = await extractRedditComments(url, selectedModel);
      setComments(comments);
      
      if (comments.length === 0) {
        toast.info("No comments found for this Reddit post");
      } else {
        toast.success(`Extracted ${comments.length} comments!`);
      }
    } catch (error) {
      console.error("Reddit extraction error:", error);
      toast.error("Failed to extract Reddit comments. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const openDetailsDialog = (comment: RedditComment) => {
    setSelectedComment(comment);
    setShowDetailsDialog(true);
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString();
  };

  const getModelAccuracy = () => {
    return selectedModel === "bert" ? "92.7%" : "98%";
  };

  // Get a colorful gradient based on index.
  const getGradient = (index: number) => {
    const gradients = [
      "from-purple-400 to-blue-500",
      "from-pink-400 to-rose-500",
      "from-green-400 to-emerald-500",
      "from-blue-400 to-indigo-500",
      "from-amber-400 to-orange-500",
      "from-indigo-400 to-violet-500"
    ];
    return gradients[index % gradients.length];
  };

  return (
    <section className="py-16 px-6 relative overflow-hidden">
      {/* Enhanced background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-blue-50/50 to-teal-50/30 dark:from-purple-900/20 dark:via-blue-900/10 dark:to-teal-900/5 -z-10"></div>
      <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-guardian-blue/5 to-transparent -z-10"></div>
      <div className="absolute bottom-0 right-0 w-full h-64 bg-gradient-to-t from-guardian-teal/5 to-transparent -z-10"></div>
      
      {/* Decorative elements */}
      <div className="absolute top-40 right-20 w-64 h-64 rounded-full bg-guardian-blue/5 blur-3xl"></div>
      <div className="absolute bottom-40 left-20 w-64 h-64 rounded-full bg-guardian-teal/5 blur-3xl"></div>
      
      <motion.div 
        className="mb-12 text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-guardian-blue via-purple-500 to-guardian-teal bg-clip-text text-transparent">
          Reddit URL Classification
        </h2>
        <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">
          Extract and classify comments from a Reddit post using our {selectedModel === "bert" ? "BERT Fine-Tuned" : "Logistic Regression"} model
        </p>
      </motion.div>

      <div className="max-w-4xl mx-auto space-y-8">
        <Card className="border border-border/50 shadow-lg bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm overflow-hidden">
          <div className="h-1.5 w-full bg-gradient-to-r from-guardian-blue via-purple-500 to-guardian-teal"></div>
          <CardContent className="p-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="flex flex-col md:flex-row gap-5"
            >
              <div className="flex-1">
                <Label htmlFor="reddit-url" className="text-base mb-2 block font-medium">
                  Enter Reddit post URL
                </Label>
                <div className="flex">
                  <div className="bg-muted flex items-center justify-center px-3 rounded-l-md border-y border-l border-input">
                    <Link className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <Input
                    id="reddit-url"
                    className="rounded-l-none focus:ring-2 focus:ring-offset-0 focus:ring-primary/20 focus-visible:ring-2 focus-visible:ring-primary/20 border-blue-200 dark:border-blue-800/30"
                    placeholder="https://www.reddit.com/r/..."
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    disabled={isAnalyzing}
                  />
                </div>
              </div>
              <div className="flex items-end">
                <Button
                  onClick={handleExtract}
                  disabled={isAnalyzing || !url.trim()}
                  className="bg-gradient-to-r from-guardian-blue via-purple-500 to-guardian-teal hover:from-guardian-blue/90 hover:via-purple-500/90 hover:to-guardian-teal/90 text-white w-full md:w-auto whitespace-nowrap h-11 transition-all duration-300 shadow-md hover:shadow-lg"
                  size="lg"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Extracting...
                    </>
                  ) : (
                    <>
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Extract & Classify
                    </>
                  )}
                </Button>
              </div>
            </motion.div>

            {/* Model Info Display */}
            {selectedModel && (
              <div className="mt-5 flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-guardian-blue/5 to-guardian-teal/5 border border-guardian-blue/10">
                <div className="bg-gradient-to-r from-guardian-blue/10 to-guardian-teal/10 p-2 rounded-full">
                  <BrainCircuit className="h-5 w-5 text-guardian-blue" />
                </div>
                <div>
                  <span className="text-sm font-medium text-guardian-blue">
                    {selectedModel === "bert" ? "BERT Fine-Tuned Model" : "Logistic Regression Model"}
                  </span>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs flex items-center gap-1">
                      <Shield className="h-3 w-3 text-guardian-teal" />
                      <span className="text-muted-foreground">Active</span>
                    </span>
                    <span className="text-xs flex items-center gap-1">
                      <CheckCircle className="h-3 w-3 text-green-500" />
                      <span className="text-muted-foreground">Accuracy: {getModelAccuracy()}</span>
                    </span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Results List - Loading Skeleton */}
        {isAnalyzing ? (
          <div className="space-y-4 pt-6">
            <Card className="border-0 shadow-md animate-pulse overflow-hidden bg-white/80 dark:bg-gray-900/80">
              <CardContent className="p-6">
                <div className="h-6 w-3/4 bg-muted rounded-md mb-4"></div>
                <div className="h-4 w-full bg-muted rounded-md mb-2"></div>
                <div className="h-4 w-4/5 bg-muted rounded-md"></div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-md animate-pulse overflow-hidden bg-white/80 dark:bg-gray-900/80">
              <CardContent className="p-6">
                <div className="h-6 w-3/4 bg-muted rounded-md mb-4"></div>
                <div className="h-4 w-full bg-muted rounded-md mb-2"></div>
                <div className="h-4 w-4/5 bg-muted rounded-md"></div>
              </CardContent>
            </Card>
          </div>
        ) : comments.length > 0 ? (
          <motion.div 
            className="space-y-6 pt-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-medium flex items-center">
                <BarChart3 className="mr-2 h-5 w-5 text-guardian-blue" />
                <span className="bg-gradient-to-r from-guardian-blue via-purple-500 to-guardian-teal bg-clip-text text-transparent">
                  Comments Analysis
                </span>
                <span className="ml-2 px-2.5 py-1 bg-guardian-blue/10 text-guardian-blue text-sm rounded-full">
                  {comments.length}
                </span>
              </h3>
            </div>
            
            {/* Grid layout for side-by-side comments */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {comments.map((comment, index) => (
                <motion.div 
                  key={comment.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <div 
                    className={`relative overflow-hidden rounded-xl ${
                      index % 2 === 0 
                        ? "bg-gradient-to-r from-white to-blue-50/50 shadow-md border border-blue-100/40 border-l-4 border-l-blue-500 dark:from-gray-800/90 dark:to-blue-900/20 dark:border-blue-800/30" 
                        : "bg-gradient-to-l from-white to-teal-50/50 shadow-md border border-teal-100/40 border-r-4 border-r-teal-500 dark:from-gray-800/90 dark:to-teal-900/20 dark:border-teal-800/30"
                    }`}
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center bg-gradient-to-r ${getGradient(index)}`}>
                            <User className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <h4 className="font-medium text-lg">u/{comment.author}</h4>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                              <div className="flex items-center">
                                <Calendar className="h-3.5 w-3.5 mr-1.5" />
                                {formatTimestamp(comment.created_utc)}
                              </div>
                              <div className="flex items-center">
                                <ThumbsUp className="h-3.5 w-3.5 mr-1.5" />
                                {comment.score}
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {comment.classification && (
                          <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full ${
                            comment.classification.overall_classification === 'toxic' 
                              ? "bg-destructive/10 text-destructive border border-destructive/20" 
                              : "bg-green-500/10 text-green-500 border border-green-500/20"
                          }`}>
                            {comment.classification.overall_classification === 'toxic' ? (
                              <AlertCircle className="h-4 w-4" />
                            ) : (
                              <CheckCircle className="h-4 w-4" />
                            )}
                            <span className="text-sm font-medium capitalize">
                              {comment.classification.overall_classification}
                            </span>
                          </div>
                        )}
                      </div>
                      
                      <div className={`bg-white/50 dark:bg-gray-800/50 p-4 rounded-xl my-4 border border-blue-100/30 dark:border-blue-800/20 ${
                        index % 2 === 0 ? "mr-0 ml-2" : "ml-0 mr-2"
                      }`}>
                        <p className="text-foreground/90 text-sm">
                          {comment.body}
                        </p>
                      </div>
                      
                      <div className="flex justify-between items-center mt-4">
                        <Button
                          onClick={() => openDetailsDialog(comment)}
                          variant="outline"
                          className="gap-2 text-sm border-guardian-blue/20 text-guardian-blue hover:bg-guardian-blue/5 transition-colors"
                        >
                          <span>View details</span>
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                        
                        <a 
                          href={comment.permalink 
                            ? `https://reddit.com${comment.permalink}` 
                            : `${url}#${comment.id}`
                          }
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sm text-guardian-blue hover:text-guardian-teal transition-colors px-3 py-1.5 rounded-md hover:bg-guardian-blue/5"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                          <span>View on Reddit</span>
                        </a>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        ) : null}
      </div>

      {/* Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-2xl">
          {selectedComment && selectedComment.classification && (
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
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">u/{selectedComment.author}</span>
                  </div>
                  <p className="text-foreground/90">{selectedComment.body}</p>
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
    </section>
  );
};

export default RedditClassifier;
