import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import ResultsPanel from "./ResultsPanel";
import { BarChart2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import axios from "axios";
import { ModelType } from "./ModelSelector";

// Define types
export interface ClassificationResult {
  toxic: number;
  severe_toxic?: number;
  obscene: number;
  threat: number;
  insult: number;
  identity_hate?: number;
  overall_classification: string;
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_ROUTE || "",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("guardian-auth-token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("guardian-auth-token");
      // Optionally, redirect to login page:
      // window.location.href = '/login';
    }
    if (!error.response) {
      console.error("Network error:", error);
    }
    return Promise.reject(error);
  }
);

const TextClassifier = ({ selectedModel }: { selectedModel: ModelType }) => {
  const [text, setText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<ClassificationResult | null>(null);

  const handleClassify = async () => {
    if (!text.trim()) {
      toast.warning("Please enter some text to classify");
      return;
    }

    setIsAnalyzing(true);
    try {
      // If selectedModel is "bert" we send "bert", otherwise we force "lr"
      const modelParam = selectedModel === "bert" ? "bert" : "lr";
      const endpoint =
        modelParam === "bert" ? "/api/bert-classify" : "/api/lr-classify";
      const response = await api.post(endpoint, { text, model: modelParam });
      const rawData = response.data;

      let parsedResult: ClassificationResult;
      if (modelParam === "bert") {
        // Transform the response if it contains final_prediction and all_predictions
        if (rawData.final_prediction && rawData.final_prediction.all_predictions) {
          const predictions = rawData.final_prediction.all_predictions;
          // Extract scores for relevant labels (defaulting to 0 if not found)
          const toxic = predictions.find((p: any) => p.label === "toxic")?.score ?? 0;
          const threat = predictions.find((p: any) => p.label === "threat")?.score ?? 0;
          const insult = predictions.find((p: any) => p.label === "insult")?.score ?? 0;
          const obscene = predictions.find((p: any) => p.label === "obscene")?.score ?? 0;
          
          // Compute overall classification as the label with the highest score.
          const labelScores: { label: string; score: number }[] = [
            { label: "toxic", score: toxic },
            { label: "threat", score: threat },
            { label: "insult", score: insult },
            { label: "obscene", score: obscene },
          ];
          const bestPrediction = labelScores.reduce((prev, curr) =>
            curr.score > prev.score ? curr : prev
          );
          // Only show the label if its score exceeds 50%, otherwise use "neutral"
          const overall = bestPrediction.score > 0.5 ? bestPrediction.label : "neutral";

          parsedResult = {
            toxic,
            threat,
            insult,
            obscene,
            overall_classification: overall,
          };
        } else {
          parsedResult = rawData;
        }
      } else {
        // For logistic regression, extract the prediction vector.
        // Assume prediction vector indices:
        // index 0: toxic, index 1: obscene, index 2: insult, index 3: threat, index 4: identity_hate
        const predictionArray = rawData.final_prediction?.prediction;
        parsedResult = {
          toxic: predictionArray?.[0] ?? 0,
          obscene: predictionArray?.[1] ?? 0,
          insult: predictionArray?.[2] ?? 0,
          threat: predictionArray?.[3] ?? 0,
          overall_classification: rawData.final_prediction?.label || "non-toxic",
        };
      }

      setResult(parsedResult);
      console.log(parsedResult);
      toast.success("Text classification complete!");
    } catch (error) {
      console.error("Classification error:", error);
      toast.error("Failed to classify text. Please try again.");
    } finally {
      setIsAnalyzing(false);
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
        <h2 className="text-2xl md:text-3xl font-bold">Text Classification</h2>
        <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
          Analyze text for potentially harmful content using our{" "}
          {selectedModel === "bert"
            ? "BERT Fine-Tuned"
            : "Logistic Regression"}{" "}
          model
        </p>
      </motion.div>

      <div className="max-w-3xl mx-auto space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Label htmlFor="classification-input" className="text-base block">
            Enter text to classify
          </Label>
          <Textarea
            id="classification-input"
            className="guardian-input min-h-32 resize-y"
            placeholder="Type or paste text here..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={isAnalyzing}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex justify-end"
        >
          <Button
            onClick={handleClassify}
            disabled={isAnalyzing || !text.trim()}
            className="guardian-button-primary"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <BarChart2 className="mr-2 h-4 w-4" />
                Classify Text
              </>
            )}
          </Button>
        </motion.div>

        {result && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <ResultsPanel result={result} isLoading={isAnalyzing} />
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default TextClassifier;
