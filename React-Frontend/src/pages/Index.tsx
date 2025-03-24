
import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import TextClassifier from "@/components/TextClassifier";
import RedditClassifier from "@/components/RedditClassifier";
import WelcomeModal from "@/components/WelcomeModal";
import PostCreator from "@/components/PostCreator";
import { motion } from "framer-motion";
import { Separator } from "@/components/ui/separator";
import { Shield, Lock, Server } from "lucide-react";
import { ModelType } from "@/components/ModelSelector";

const Index = () => {
  const [showModal, setShowModal] = useState(true);
  const [selectedModel, setSelectedModel] = useState<ModelType>("bert");

  const handleModalClose = () => {
    setShowModal(false);
  };

  const handleModelChange = (model: ModelType) => {
    setSelectedModel(model);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {showModal && <WelcomeModal onClose={handleModalClose} />}
      
      <Header selectedModel={selectedModel} onModelChange={handleModelChange} />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-20 px-6">
          <div className="absolute inset-0 bg-guardian-gradient opacity-5 dark:opacity-10"></div>
          
          <motion.div 
            className="max-w-4xl mx-auto text-center relative z-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              className="bg-guardian-blue/10 dark:bg-guardian-blue/20 p-4 rounded-full inline-block mb-6"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ 
                type: "spring", 
                stiffness: 260, 
                damping: 20, 
                delay: 0.2 
              }}
            >
              <Shield className="h-10 w-10 text-guardian-blue" />
            </motion.div>
            
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-6">
              <span className="text-gradient">AI-Powered Probabilistic Analysis for Harmful Digital Content Classification</span>
              <span className="block text-xl sm:text-2xl md:text-3xl mt-2 text-foreground/90">
                Digital Content Sentinel
              </span>
            </h1>
            
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
              Empowering safe digital conversations through innovative artificial intelligence and state-of-the-art NLP models
            </p>
          </motion.div>
        </section>
        
        {/* Features */}
        <section className="guardian-section">
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <motion.div 
              className="guardian-card p-6"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className="bg-guardian-blue/10 dark:bg-guardian-blue/20 p-3 rounded-full inline-block mb-4">
                <Shield className="h-6 w-6 text-guardian-blue" />
              </div>
              <h3 className="text-xl font-medium mb-2">Advanced Protection</h3>
              <p className="text-muted-foreground">
                Guardian AI uses state-of-the-art NLP models to detect harmful content across multiple categories.
              </p>
            </motion.div>
            
            <motion.div 
              className="guardian-card p-6"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="bg-guardian-blue/10 dark:bg-guardian-blue/20 p-3 rounded-full inline-block mb-4">
                <Lock className="h-6 w-6 text-guardian-blue" />
              </div>
              <h3 className="text-xl font-medium mb-2">Dual-Model Approach</h3>
              <p className="text-muted-foreground">
                Combines BERT fine-tuned model for deep comprehension with Logistic Regression for speed and efficiency.
              </p>
            </motion.div>
            
            <motion.div 
              className="guardian-card p-6"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <div className="bg-guardian-blue/10 dark:bg-guardian-blue/20 p-3 rounded-full inline-block mb-4">
                <Server className="h-6 w-6 text-guardian-blue" />
              </div>
              <h3 className="text-xl font-medium mb-2">Real-time Analysis</h3>
              <p className="text-muted-foreground">
                Process and analyze text and social media content in real-time with detailed classification results.
              </p>
            </motion.div>
          </div>
        </section>
        
        <Separator className="max-w-5xl mx-auto" />
        
        {/* Text Classification Section */}
        <TextClassifier selectedModel={selectedModel} />
        
        {/* Reddit Classification Section */}
        <RedditClassifier selectedModel={selectedModel} />
        
        {/* Post Creation & Comment Classification Section */}
        <PostCreator selectedModel={selectedModel} />
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
