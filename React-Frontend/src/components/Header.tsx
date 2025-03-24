
import { useDarkMode } from "@/hooks/useDarkMode";
import { Moon, Shield, Sun } from "lucide-react";
import { motion } from 'framer-motion';
import ModelSelector, { ModelType } from "./ModelSelector";

interface HeaderProps {
  selectedModel: ModelType;
  onModelChange: (model: ModelType) => void;
}

const Header = ({ selectedModel, onModelChange }: HeaderProps) => {
  const { theme, toggleTheme } = useDarkMode();

  return (
    <header className="w-full py-6 px-6 md:px-8 border-b border-border bg-background/95 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <motion.div 
          className="flex items-center space-x-3"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Shield className="h-8 w-8 text-guardian-blue" />
          <div>
            <h1 className="text-xl font-semibold">AI Probabilistic Content Classifier</h1>
            <p className="text-xs text-muted-foreground">Digital Content Sentinel</p>
          </div>
        </motion.div>
        
        <div className="flex items-center space-x-4">
          <ModelSelector selectedModel={selectedModel} onModelChange={onModelChange} />
          
          <motion.button
            onClick={toggleTheme}
            className="p-2 rounded-full bg-secondary hover:bg-secondary/80 transition-colors"
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {theme === 'dark' ? (
              <Sun className="h-5 w-5 text-yellow-400" />
            ) : (
              <Moon className="h-5 w-5 text-guardian-blue" />
            )}
          </motion.button>
        </div>
      </div>
    </header>
  );
};

export default Header;
