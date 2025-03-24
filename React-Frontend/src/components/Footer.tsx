import { Shield, Github, Linkedin, ExternalLink, Heart } from "lucide-react";
import { motion } from "framer-motion";

const Footer = () => {
  return (
    <footer className="bg-gradient-to-r from-blue-500 to-purple-500 dark:from-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between">
          {/* Branding Section */}
          <motion.div 
            className="flex items-center gap-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Shield className="h-6 w-6 text-white" />
            <p className="text-base text-white">
              Powered by{" "}
              <span className="font-semibold">
                AI Probabilistic Content Classifier: Digital Content Sentinel
              </span>{" "}
              by{" "}
              <span className="font-semibold">Ujjawal Kumar</span>
              <span className="inline-flex items-center ml-2">
                Made with <Heart className="h-5 w-5 text-red-500 ml-1" />
              </span>
            </p>
          </motion.div>
          
          {/* Social Icons Section */}
          <motion.div 
            className="flex gap-6 mt-4 md:mt-0"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <a 
              href="https://github.com/UjjawalSah" 
              target="_blank" 
              rel="noopener noreferrer"
              aria-label="GitHub"
              className="transition-colors text-white hover:text-gray-200"
            >
              <Github className="h-6 w-6" />
            </a>
            <a 
              href="https://linkedin.com/in/ujjawal-kumar-9b7719228/" 
              target="_blank" 
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className="transition-colors text-white hover:text-gray-200"
            >
              <Linkedin className="h-6 w-6" />
            </a>
            <a 
              href="https://portfolio-ujjawal-kumars-projects-40f5a3a4.vercel.app/" 
              target="_blank" 
              rel="noopener noreferrer"
              aria-label="Portfolio"
              className="transition-colors text-white hover:text-gray-200"
            >
              <ExternalLink className="h-6 w-6" />
            </a>
          </motion.div>
        </div>
        {/* Copyright */}
        <motion.p 
          className="mt-6 text-sm text-center text-white"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          © {new Date().getFullYear()} AI Probabilistic Content Classifier. All rights reserved.
        </motion.p>
      </div>
    </footer>
  );
};

export default Footer;
