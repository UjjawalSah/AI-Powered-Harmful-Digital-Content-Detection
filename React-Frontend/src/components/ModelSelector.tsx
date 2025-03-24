
import { useState } from "react";
import { Check } from "lucide-react";
import { motion } from "framer-motion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type ModelType = "bert" | "logistic";

interface ModelSelectorProps {
  selectedModel: ModelType;
  onModelChange: (model: ModelType) => void;
}

const ModelSelector = ({ selectedModel, onModelChange }: ModelSelectorProps) => {
  return (
    <div className="flex items-center space-x-2">
      <span className="text-sm text-muted-foreground">Model:</span>
      <Select 
        value={selectedModel} 
        onValueChange={(value) => onModelChange(value as ModelType)}
      >
        <SelectTrigger className="h-9 w-[180px] bg-secondary/60">
          <SelectValue placeholder="Select model" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="bert">BERT Fine-Tuned Model</SelectItem>
          <SelectItem value="logistic">Logistic Regression Model</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default ModelSelector;
