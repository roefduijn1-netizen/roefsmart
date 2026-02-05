import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Calendar as CalendarIcon, Book, BarChart, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { api } from '@/lib/api-client';
import { generateStudyPlan, SUBJECTS } from '@/lib/aurum-utils';
import { DifficultyLevel, Subject, Test } from '@shared/types';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import { AurumLayout } from '@/components/layout/AurumLayout';
import { cn } from '@/lib/utils';
type Step = 'subject' | 'date' | 'difficulty' | 'confirm';
export function AddTestPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('subject');
  const [subject, setSubject] = useState<Subject | null>(null);
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [difficulty, setDifficulty] = useState<DifficultyLevel>(3);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const userId = localStorage.getItem('aurum_user_id');
  const handleNext = () => {
    if (step === 'subject' && subject) setStep('date');
    else if (step === 'date' && date) setStep('difficulty');
    else if (step === 'difficulty') setStep('confirm');
  };
  const handleBack = () => {
    if (step === 'date') setStep('subject');
    else if (step === 'difficulty') setStep('date');
    else if (step === 'confirm') setStep('difficulty');
    else navigate('/');
  };
  const handleConfirm = async () => {
    if (!userId || !subject || !date) return;
    setIsSubmitting(true);
    try {
      const sessions = generateStudyPlan(subject, date, difficulty);
      const newTest: Test = {
        id: uuidv4(),
        subject,
        title: `${subject} Test`,
        date: date.toISOString(),
        difficulty,
        sessions,
        createdAt: Date.now()
      };
      await api(`/api/users/${userId}/tests`, {
        method: 'POST',
        body: JSON.stringify(newTest)
      });
      toast.success('Test scheduled successfully');
      navigate('/');
    } catch (error) {
      console.error(error);
      toast.error('Failed to schedule test');
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <AurumLayout showNav={false}>
      <div className="flex flex-col min-h-screen px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button variant="ghost" size="icon" onClick={handleBack} className="text-neutral-400 hover:text-white">
            <ChevronLeft className="w-6 h-6" />
          </Button>
          <div className="flex gap-2">
            {['subject', 'date', 'difficulty', 'confirm'].map((s, i) => (
              <div 
                key={s} 
                className={cn(
                  "w-2 h-2 rounded-full transition-colors duration-300",
                  ['subject', 'date', 'difficulty', 'confirm'].indexOf(step) >= i 
                    ? "bg-amber-500" 
                    : "bg-neutral-800"
                )} 
              />
            ))}
          </div>
          <div className="w-10" /> {/* Spacer */}
        </div>
        <AnimatePresence mode="wait">
          {step === 'subject' && (
            <motion.div 
              key="subject"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-1"
            >
              <h2 className="text-3xl font-display font-bold text-white mb-2">Select Subject</h2>
              <p className="text-neutral-400 mb-8">What are you preparing for?</p>
              <div className="grid grid-cols-2 gap-3">
                {SUBJECTS.map((sub) => (
                  <button
                    key={sub}
                    onClick={() => { setSubject(sub); setTimeout(() => setStep('date'), 200); }}
                    className={cn(
                      "p-4 rounded-xl text-left transition-all duration-200 border",
                      subject === sub 
                        ? "bg-amber-500/10 border-amber-500/50 text-amber-400 shadow-[0_0_15px_-3px_rgba(245,158,11,0.2)]" 
                        : "bg-neutral-900/50 border-neutral-800 text-neutral-300 hover:border-neutral-700"
                    )}
                  >
                    <span className="font-medium">{sub}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
          {step === 'date' && (
            <motion.div 
              key="date"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-1 flex flex-col"
            >
              <h2 className="text-3xl font-display font-bold text-white mb-2">Test Date</h2>
              <p className="text-neutral-400 mb-8">When is the big day?</p>
              <div className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-4 mb-8">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  disabled={(date) => date < new Date()}
                  className="rounded-md mx-auto"
                />
              </div>
              <div className="mt-auto">
                <Button 
                  onClick={handleNext} 
                  disabled={!date}
                  className="w-full h-12 bg-amber-500 text-black hover:bg-amber-600"
                >
                  Continue
                </Button>
              </div>
            </motion.div>
          )}
          {step === 'difficulty' && (
            <motion.div 
              key="difficulty"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-1 flex flex-col"
            >
              <h2 className="text-3xl font-display font-bold text-white mb-2">Intensity</h2>
              <p className="text-neutral-400 mb-8">How rigorous should the prep be?</p>
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((level) => (
                  <button
                    key={level}
                    onClick={() => setDifficulty(level as DifficultyLevel)}
                    className={cn(
                      "w-full p-4 rounded-xl flex items-center justify-between border transition-all",
                      difficulty === level
                        ? "bg-amber-500/10 border-amber-500/50 shadow-[0_0_15px_-3px_rgba(245,158,11,0.2)]"
                        : "bg-neutral-900/50 border-neutral-800 hover:border-neutral-700"
                    )}
                  >
                    <div className="flex flex-col items-start">
                      <span className={cn("font-bold text-lg", difficulty === level ? "text-amber-400" : "text-white")}>
                        Level {level}
                      </span>
                      <span className="text-xs text-neutral-500">
                        Starts {level} week{level > 1 ? 's' : ''} before test
                      </span>
                    </div>
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <div 
                          key={i} 
                          className={cn(
                            "w-1.5 h-6 rounded-full",
                            i < level ? (difficulty === level ? "bg-amber-500" : "bg-neutral-600") : "bg-neutral-800"
                          )} 
                        />
                      ))}
                    </div>
                  </button>
                ))}
              </div>
              <div className="mt-auto pt-8">
                <Button onClick={handleNext} className="w-full h-12 bg-amber-500 text-black hover:bg-amber-600">
                  Review Plan
                </Button>
              </div>
            </motion.div>
          )}
          {step === 'confirm' && (
            <motion.div 
              key="confirm"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex-1 flex flex-col items-center justify-center text-center"
            >
              <div className="w-20 h-20 rounded-full bg-amber-500/10 flex items-center justify-center mb-6 border border-amber-500/30 shadow-[0_0_30px_-5px_rgba(245,158,11,0.3)]">
                <CheckCircle2 className="w-10 h-10 text-amber-500" />
              </div>
              <h2 className="text-3xl font-display font-bold text-white mb-2">Ready to Commit?</h2>
              <p className="text-neutral-400 mb-8 max-w-xs mx-auto">
                We will generate a disciplined schedule for your {subject} test on {date?.toLocaleDateString()}.
              </p>
              <div className="w-full max-w-xs bg-neutral-900/50 border border-neutral-800 rounded-xl p-4 mb-8 text-left space-y-3">
                <div className="flex justify-between">
                  <span className="text-neutral-500">Subject</span>
                  <span className="text-white font-medium">{subject}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Date</span>
                  <span className="text-white font-medium">{date?.toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Intensity</span>
                  <span className="text-amber-400 font-medium">Level {difficulty}</span>
                </div>
              </div>
              <Button 
                onClick={handleConfirm} 
                disabled={isSubmitting}
                className="w-full max-w-xs h-12 bg-amber-500 text-black hover:bg-amber-600 shadow-lg shadow-amber-500/20"
              >
                {isSubmitting ? 'Generating Plan...' : 'Confirm Schedule'}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AurumLayout>
  );
}