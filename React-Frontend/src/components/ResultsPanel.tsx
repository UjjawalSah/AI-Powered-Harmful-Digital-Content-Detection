import { useState } from "react";
import { CheckCircle, AlertCircle, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Inline type definition for ClassificationResult supporting both structures.
interface ClassificationResult {
  overall_classification: string;
  all_predictions?: { label: string; score: number }[];
  toxic?: number;
  obscene?: number;
  insult?: number;
  threat?: number;
  [key: string]: any;
}

interface ResultsPanelProps {
  result: ClassificationResult;
  isLoading?: boolean;
}

// Helper to get score for a given label.
// First try to find it in result.all_predictions; if that doesn't exist, use result[label].
const getScore = (result: ClassificationResult, label: string): number => {
  if (result.all_predictions) {
    const found = result.all_predictions.find(
      (item) => item.label.toLowerCase() === label.toLowerCase()
    );
    return found ? found.score : 0;
  } else {
    // Fallback: check if the result directly has the property.
    return result[label.toLowerCase()] || 0;
  }
};

// Helper to safely calculate the width percentage string with logging.
const safeWidth = (label: string, value: number): string => {
  console.log(`Debug: ${label} raw score:`, value);
  const num = Number(value);
  const widthStr = isNaN(num) ? "0%" : `${(num * 100).toFixed(1)}%`;
  console.log(`Debug: ${label} safe width:`, widthStr);
  return widthStr;
};

const ResultsPanel = ({ result, isLoading = false }: ResultsPanelProps) => {
  const [detailsOpen, setDetailsOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="guardian-card p-6 animate-pulse">
        <div className="h-6 w-3/4 bg-muted rounded-md mb-4"></div>
        <div className="h-4 w-1/2 bg-muted rounded-md"></div>
      </div>
    );
  }

  const isToxic = result.overall_classification === "toxic";

  const formatPercentage = (value: number) => {
    return (value * 100).toFixed(1) + "%";
  };

  // Retrieve scores for each label.
  const toxicScore = getScore(result, "toxic");
  const threatScore = getScore(result, "threat");
  const insultScore = getScore(result, "insult");
  const obsceneScore = getScore(result, "obscene");

  return (
    <motion.div
      className="guardian-card overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="p-6">
        <div className="flex items-center gap-3 mb-4">
          {isToxic ? (
            <AlertCircle className="h-6 w-6 text-destructive" />
          ) : (
            <CheckCircle className="h-6 w-6 text-green-500" />
          )}
          <h3 className="text-lg font-medium">
            This text is classified as:
            <span className={isToxic ? "text-destructive ml-2" : "text-green-500 ml-2"}>
              {result.overall_classification}
            </span>
          </h3>
        </div>

        <button
          onClick={() => setDetailsOpen((prev) => !prev)}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mt-2"
        >
          {detailsOpen ? (
            <>
              <span>Hide details</span>
              <ChevronUp className="h-4 w-4" />
            </>
          ) : (
            <>
              <span>See details</span>
              <ChevronDown className="h-4 w-4" />
            </>
          )}
        </button>
      </div>

      <AnimatePresence>
        {detailsOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-6 border-t border-border pt-4">
              <h4 className="text-sm font-medium mb-3">Confidence Scores:</h4>
              <div className="space-y-3">
                {/* Toxic Score */}
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Toxic</span>
                    <span className={toxicScore > 0.5 ? "text-destructive" : "text-muted-foreground"}>
                      {formatPercentage(toxicScore)}
                    </span>
                  </div>
                  <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-guardian-gradient rounded-full"
                      initial={{ width: "0%" }}
                      animate={{ width: safeWidth("Toxic", toxicScore) }}
                      transition={{ duration: 0.5, delay: 0.1 }}
                    />
                  </div>
                </div>

                {/* Threat Score */}
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Threat</span>
                    <span className={threatScore > 0.5 ? "text-destructive" : "text-muted-foreground"}>
                      {formatPercentage(threatScore)}
                    </span>
                  </div>
                  <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-guardian-gradient rounded-full"
                      initial={{ width: "0%" }}
                      animate={{ width: safeWidth("Threat", threatScore) }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                    />
                  </div>
                </div>

                {/* Insult Score */}
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Insult</span>
                    <span className={insultScore > 0.5 ? "text-destructive" : "text-muted-foreground"}>
                      {formatPercentage(insultScore)}
                    </span>
                  </div>
                  <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-guardian-gradient rounded-full"
                      initial={{ width: "0%" }}
                      animate={{ width: safeWidth("Insult", insultScore) }}
                      transition={{ duration: 0.5, delay: 0.3 }}
                    />
                  </div>
                </div>

                {/* Obscene Score */}
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Obscene</span>
                    <span className={obsceneScore > 0.5 ? "text-destructive" : "text-muted-foreground"}>
                      {formatPercentage(obsceneScore)}
                    </span>
                  </div>
                  <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-guardian-gradient rounded-full"
                      initial={{ width: "0%" }}
                      animate={{ width: safeWidth("Obscene", obsceneScore) }}
                      transition={{ duration: 0.5, delay: 0.4 }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ResultsPanel;
