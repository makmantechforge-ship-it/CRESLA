'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const steps = [
  {
    id: 0,
    title: 'Find Your Dream Property',
    description: 'Explore thousands of premium listings verified for quality and authenticity, tailored to your exact lifestyle and needs.',
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 1,
    title: 'List & Manage Properties',
    description: 'Seamlessly list your real estate portfolio and manage inquiries, showings, and offers in one centralized premium dashboard.',
    image: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 2,
    title: 'Connect with Confidence',
    description: 'Communicate securely and directly with verified buyers, sellers, and top-tier agents to close deals faster.',
    image: 'https://images.unsplash.com/photo-1560518883-ce09059eeefa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
  },
];

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const router = useRouter();

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setDirection(1);
      setCurrentStep((prev) => prev + 1);
    } else {
      router.push('/auth/login');
    }
  };

  const handleSkip = () => {
    router.push('/auth/login');
  };

  const variants = {
    enter: (direction: number) => {
      return {
        x: direction > 0 ? 1000 : -1000,
        opacity: 0,
      };
    },
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => {
      return {
        zIndex: 0,
        x: direction < 0 ? 1000 : -1000,
        opacity: 0,
      };
    },
  };

  return (
    <div className="relative min-h-screen bg-slate-50 overflow-hidden flex flex-col">
      {/* Top Header - Skip Button */}
      <header className="absolute top-0 left-0 right-0 p-6 flex justify-end z-50">
        <button
          onClick={handleSkip}
          className="text-slate-500 hover:text-primary transition-colors font-medium px-4 py-2 rounded-full hover:bg-slate-100"
        >
          Skip
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center w-full max-w-5xl mx-auto px-6 pt-20 pb-32">
        <div className="relative w-full aspect-[4/3] md:aspect-[21/9] max-h-[500px] mb-12 rounded-3xl overflow-hidden shadow-2xl bg-white border border-slate-100">
          <AnimatePresence initial={false} custom={direction}>
            <motion.div
              key={currentStep}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: 'spring', stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 },
              }}
              className="absolute inset-0 w-full h-full"
            >
              <img
                src={steps[currentStep].image}
                alt={steps[currentStep].title}
                className="object-cover w-full h-full"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="text-center max-w-2xl mx-auto relative h-32">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0"
            >
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 tracking-tight">
                {steps[currentStep].title}
              </h1>
              <p className="text-lg text-slate-600 leading-relaxed">
                {steps[currentStep].description}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Bottom Navigation */}
      <footer className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          {/* Progress Indicators */}
          <div className="flex items-center space-x-3">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentStep
                    ? 'w-8 bg-primary'
                    : 'w-2 bg-slate-300 hover:bg-slate-400 cursor-pointer'
                }`}
                onClick={() => {
                  setDirection(index > currentStep ? 1 : -1);
                  setCurrentStep(index);
                }}
              />
            ))}
          </div>

          {/* Next / Get Started Button */}
          <button
            onClick={handleNext}
            className="group flex items-center justify-center bg-primary hover:bg-blue-800 text-white px-8 py-4 rounded-full font-medium transition-all hover:scale-[1.02] active:scale-95 shadow-xl shadow-primary/25"
          >
            <span className="mr-2">
              {currentStep === steps.length - 1 ? 'Get Started' : 'Continue'}
            </span>
            {currentStep === steps.length - 1 ? (
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            ) : (
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            )}
          </button>
        </div>
      </footer>
    </div>
  );
}
