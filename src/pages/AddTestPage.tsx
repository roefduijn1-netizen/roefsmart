import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, CheckCircle2, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { api } from '@/lib/api-client';
import { generateStudyPlan, SUBJECTS } from '@/lib/aurum-utils';
import { DifficultyLevel, Subject, Test } from '@shared/types';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import { AurumLayout } from '@/components/layout/AurumLayout';
import { cn } from '@/lib/utils';
import { nl } from 'date-fns/locale';
type Step = 'subject' | 'date' | 'difficulty' | 'confirm';
export function AddTestPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('subject');
  const [subject, setSubject] = useState<Subject | null>(null);
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [difficulty, setDifficulty] = useState<DifficultyLevel>(3);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
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
        title: `${subject} Toets`,
        date: date.toISOString(),
        difficulty,
        sessions,
        createdAt: Date.now()
      };
      await api(`/api/users/${userId}/tests`, {
        method: 'POST',
        body: JSON.stringify(newTest)
      });
      toast.success('Toets succesvol gepland');
      navigate('/');
    } catch (error) {
      console.error(error);
      toast.error('Kon toets niet plannen');
    } finally {
      setIsSubmitting(false);
    }
  };
  const filteredSubjects = SUBJECTS.filter(sub => 
    sub.toLowerCase().includes(searchQuery.toLowerCase())
  );
  return (
    <AurumLayout showNav={false}>
      <div className="min-h-screen flex items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-lg mx-auto md:bg-neutral-900/60 md:backdrop-blur-xl md:border md:border-white/10 md:rounded-3xl md:p-8 md:shadow-2xl transition-all">
          <div className="flex flex-col h-full min-h-[600px]">
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
                  className="flex-1 flex flex-col h-full"
                >
                  <h2 className="text-3xl font-display font-bold text-white mb-2">Kies Vak</h2>
                  <p className="text-neutral-400 mb-6">Waar bereid je je op voor?</p>
                  <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                    <Input 
                      placeholder="Zoek vak..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 bg-neutral-900/50 border-neutral-800 focus:border-amber-500/50 text-white placeholder:text-neutral-600 h-12"
                    />
                  </div>
                  <ScrollArea className="flex-1 -mr-4 pr-4 h-[400px]">
                    <div className="grid grid-cols-1 gap-3 pb-8">
                      {filteredSubjects.length === 0 ? (
                        <p className="text-neutral-500 text-center py-8">Geen vakken gevonden.</p>
                      ) : (
                        filteredSubjects.map((sub) => (
                          <button
                            key={sub}
                            onClick={() => { setSubject(sub); setTimeout(() => setStep('date'), 200); }}
                            className={cn(
                              "p-4 rounded-xl text-left transition-all duration-200 border w-full",
                              subject === sub 
                                ? "bg-amber-500/10 border-amber-500/50 text-amber-400 shadow-[0_0_15px_-3px_rgba(245,158,11,0.2)]" 
                                : "bg-neutral-900/50 border-neutral-800 text-neutral-300 hover:border-neutral-700 hover:bg-neutral-800/50"
                            )}
                          >
                            <span className="font-medium">{sub}</span>
                          </button>
                        ))
                      )}
                    </div>
                  </ScrollArea>
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
                  <h2 className="text-3xl font-display font-bold text-white mb-2">Toetsdatum</h2>
                  <p className="text-neutral-400 mb-8">Wanneer is de grote dag?</p>
                  <div className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-4 mb-8 flex justify-center">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      disabled={(date) => date < new Date()}
                      locale={nl}
                      className="rounded-md"
                    />
                  </div>
                  <div className="mt-auto">
                    <Button 
                      onClick={handleNext} 
                      disabled={!date}
                      className="w-full h-12 bg-amber-500 text-black hover:bg-amber-600 font-medium"
                    >
                      Verder
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
                  <h2 className="text-3xl font-display font-bold text-white mb-2">Intensiteit</h2>
                  <p className="text-neutral-400 mb-8">Hoe intensief wil je studeren?</p>
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
                            Niveau {level}
                          </span>
                          <span className="text-xs text-neutral-500">
                            Begint {level} week{level > 1 ? 'en' : ''} voor de toets
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
                    <Button onClick={handleNext} className="w-full h-12 bg-amber-500 text-black hover:bg-amber-600 font-medium">
                      Bekijk Plan
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
                  <h2 className="text-3xl font-display font-bold text-white mb-2">Klaar om te starten?</h2>
                  <p className="text-neutral-400 mb-8 max-w-xs mx-auto">
                    We genereren een gedisciplineerd schema voor je {subject} toets op {date?.toLocaleDateString('nl-NL')}.
                  </p>
                  <div className="w-full max-w-xs bg-neutral-900/50 border border-neutral-800 rounded-xl p-4 mb-8 text-left space-y-3">
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Vak</span>
                      <span className="text-white font-medium">{subject}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Datum</span>
                      <span className="text-white font-medium">{date?.toLocaleDateString('nl-NL')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Intensiteit</span>
                      <span className="text-amber-400 font-medium">Niveau {difficulty}</span>
                    </div>
                  </div>
                  <Button 
                    onClick={handleConfirm} 
                    disabled={isSubmitting}
                    className="w-full max-w-xs h-12 bg-amber-500 text-black hover:bg-amber-600 shadow-lg shadow-amber-500/20 font-medium"
                  >
                    {isSubmitting ? 'Plan Genereren...' : 'Bevestig Schema'}
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </AurumLayout>
  );
}