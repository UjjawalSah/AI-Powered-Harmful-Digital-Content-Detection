
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { shield } from "@/components/icons/shield";
import { useEffect, useState } from "react";
import { Shield, Github, Linkedin, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";

interface WelcomeModalProps {
  onClose: () => void;
}

const WelcomeModal = ({ onClose }: WelcomeModalProps) => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Check if the user has seen the modal before
    const hasSeenModal = localStorage.getItem("guardian-welcome-seen");
    
    if (!hasSeenModal) {
      // Show modal after a short delay for better UX
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    // Mark modal as seen
    localStorage.setItem("guardian-welcome-seen", "true");
    setIsOpen(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-xl guardian-card">
        <DialogHeader className="text-center space-y-4">
          <div className="mx-auto bg-guardian-blue/10 dark:bg-guardian-blue/20 p-3 rounded-full">
            <Shield className="h-10 w-10 text-guardian-blue mx-auto" />
          </div>
          <DialogTitle className="text-2xl md:text-3xl font-bold text-gradient">
          AI Probabilistic Content Classifier
          </DialogTitle>
          <DialogDescription className="text-base text-foreground/90">
            Empowering safe digital conversations using state-of-the-art NLP models
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Our Dual-Model Approach:</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <motion.div 
                className="guardian-card p-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <h4 className="font-medium text-guardian-blue">BERT Fine-Tuned Model</h4>
                <p className="text-sm text-muted-foreground mt-1">Advanced language understanding for accurate content analysis</p>
              </motion.div>
              
              <motion.div 
                className="guardian-card p-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h4 className="font-medium text-guardian-blue">Logistic Regression Model</h4>
                <p className="text-sm text-muted-foreground mt-1">Fast and efficient classification for real-time feedback</p>
              </motion.div>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-medium">Developer Links:</h3>
            <div className="flex flex-wrap gap-3">
              <motion.a 
                href="https://github.com/UjjawalSah" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <Github className="h-4 w-4" />
                <span className="text-sm">GitHub</span>
              </motion.a>
              
              <motion.a 
                href="https://www.linkedin.com/in/ujjawal-kumar-9b7719228/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <Linkedin className="h-4 w-4" />
                <span className="text-sm">LinkedIn</span>
              </motion.a>
              
              <motion.a 
                href="https://portfolio-ujjawal-kumars-projects-40f5a3a4.vercel.app/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <ExternalLink className="h-4 w-4" />
                <span className="text-sm">Portfolio</span>
              </motion.a>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button 
            onClick={handleClose}
            className="w-full sm:w-auto guardian-button-primary"
          >
            Get Started
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default WelcomeModal;
