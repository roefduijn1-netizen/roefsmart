import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, CheckCircle2, Search, Calendar as CalendarIcon, BookOpen, BarChart3 } from 'lucide-react';
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
  useEffect(() => {
    if (!userId) {
      navigate('/auth');
    }
  }, [userId, navigate]);
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
      toast.success('Ritueel succesvol vastgelegd');
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
  const steps = [
    { id: 'subject', icon: BookOpen },
    { id: 'date', icon: CalendarIcon },
    { id: 'difficulty', icon: BarChart3 },
    { id: 'confirm', icon: CheckCircle2 },
  ];
  return (
    <AurumLayout showNav={false}>
      <div className="min-h-screen flex items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-2xl mx-auto luxury-card rounded-[2rem] p-8 md:p-12 relative overflow-hidden">
          {/* Background Glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-[80px] pointer-events-none" />
          <div className="flex flex-col h-full min-h-[600px] relative z-10">
            {/* Header */}
            <div className="flex items-center justify-between mb-12">
              <Button variant="ghost" size="icon" onClick={handleBack} className="text-neutral-400 hover:text-white hover:bg-white/5 rounded-full">
                <ChevronLeft className="w-6 h-6" />
              </Button>
              {/* Step Indicators */}
              <div className="flex items-center gap-4">
                {steps.map((s, i) => {
                  const isActive = steps.findIndex(x => x.id === step) >= i;
                  const Icon = s.icon;
                  return (
                    <div key={s.id} className="flex items-center gap-2">
                        <div
                            className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center transition-all duration-500 border",
                            isActive
                                ? "bg-amber-500 text-black border-amber-500 shadow-[0_0_15px_-3px_rgba(245,158,11,0.4)]"
                                : "bg-neutral-900 text-neutral-600 border-neutral-800"
                            )}
                        >
                            <Icon className="w-4 h-4" />
                        </div>
                        {i < steps.length - 1 && (
                            <div className={cn("w-8 h-[1px] transition-colors duration-500", isActive ? "bg-amber-500/50" : "bg-neutral-800")} />
                        )}
                    </div>
                  );
                })}
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
                  <h2 className="text-4xl font-display font-bold text-white mb-3">Kies Vak</h2>
                  <p className="text-neutral-400 mb-8 font-light">Waar bereid je je op voor?</p>
                  <div className="relative mb-6">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
                    <Input
                      placeholder="Zoek vak..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="luxury-input pl-12 h-14 rounded-xl text-lg"
                    />
                  </div>
                  <ScrollArea className="flex-1 -mr-4 pr-4 h-[350px]">
                    <div className="grid grid-cols-1 gap-3 pb-8">
                      {filteredSubjects.length === 0 ? (
                        <p className="text-neutral-500 text-center py-8">Geen vakken gevonden.</p>
                      ) : (
                        filteredSubjects.map((sub) => (
                          <button
                            key={sub}
                            onClick={() => { setSubject(sub); setTimeout(() => setStep('date'), 200); }}
                            className={cn(
                              "p-5 rounded-xl text-left transition-all duration-300 border w-full group",
                              subject === sub
                                ? "bg-amber-500/10 border-amber-500/50 text-amber-400 shadow-[0_0_20px_-5px_rgba(245,158,11,0.2)]"
                                : "bg-white/5 border-white/5 text-neutral-300 hover:border-white/10 hover:bg-white/10"
                            )}
                          >
                            <span className="font-medium text-lg">{sub}</span>
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
                  <h2 className="text-4xl font-display font-bold text-white mb-3">Toetsdatum</h2>
                  <p className="text-neutral-400 mb-8 font-light">Wanneer is de grote dag?</p>
                  <div className="bg-black/40 border border-white/10 rounded-3xl p-6 mb-8 flex justify-center shadow-inner backdrop-blur-sm">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      disabled={(date) => date < new Date()}
                      locale={nl}
                      className="rounded-md"
                      classNames={{
                        head_cell: "text-neutral-500 font-normal text-sm",
                        cell: "text-center text-sm p-0 relative [&:has([aria-selected])]:bg-amber-500/10 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                        day: "h-10 w-10 p-0 font-normal aria-selected:opacity-100 hover:bg-white/10 rounded-full transition-colors text-white",
                        day_selected: "bg-amber-500 text-black hover:bg-amber-600 hover:text-black focus:bg-amber-500 focus:text-black shadow-[0_0_15px_rgba(245,158,11,0.5)]",
                        day_today: "bg-white/10 text-white",
                      }}
                    />
                  </div>
                  <div className="mt-auto">
                    <Button
                      onClick={handleNext}
                      disabled={!date}
                      className="luxury-button w-full h-14 rounded-xl text-lg"
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
                  <h2 className="text-4xl font-display font-bold text-white mb-3">Intensiteit</h2>
                  <p className="text-neutral-400 mb-8 font-light">Hoe intensief wil je studeren?</p>
                  <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <button
                        key={level}
                        onClick={() => setDifficulty(level as DifficultyLevel)}
                        className={cn(
                          "w-full p-5 rounded-2xl flex items-center justify-between border transition-all duration-300 group",
                          difficulty === level
                            ? "bg-amber-500/10 border-amber-500/50 shadow-[0_0_20px_-5px_rgba(245,158,11,0.2)]"
                            : "bg-white/5 border-white/5 hover:border-white/10 hover:bg-white/10"
                        )}
                      >
                        <div className="flex flex-col items-start">
                          <span className={cn("font-bold text-lg transition-colors", difficulty === level ? "text-amber-400" : "text-white")}>
                            Niveau {level}
                          </span>
                          <span className="text-xs text-neutral-500 mt-1">
                            Begint {level} week{level > 1 ? 'en' : ''} voor de toets
                          </span>
                        </div>
                        {/* Custom Progress Bar Visual */}
                        <div className="flex gap-1.5">
                          {[...Array(5)].map((_, i) => (
                            <div
                              key={i}
                              className={cn(
                                "w-2 h-8 rounded-full transition-all duration-300",
                                i < level
                                    ? (difficulty === level ? "bg-gradient-to-t from-amber-600 to-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.5)]" : "bg-neutral-700")
                                    : "bg-neutral-900 border border-white/5"
                              )}
                            />
                          ))}
                        </div>
                      </button>
                    ))}
                  </div>
                  <div className="mt-auto pt-8">
                    <Button onClick={handleNext} className="luxury-button w-full h-14 rounded-xl text-lg">
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
                  <div className="relative mb-8">
                    <div className="absolute inset-0 bg-amber-500/20 rounded-full blur-xl animate-pulse" />
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center relative z-10 shadow-[0_0_40px_-10px_rgba(245,158,11,0.6)]">
                        <CheckCircle2 className="w-12 h-12 text-black" />
                    </div>
                  </div>
                  <h2 className="text-4xl font-display font-bold text-white mb-3">Klaar om te starten?</h2>
                  <p className="text-neutral-400 mb-10 max-w-xs mx-auto font-light">
                    We genereren een gedisciplineerd schema voor je <span className="text-amber-400">{subject}</span> toets.
                  </p>
                  <div className="w-full max-w-sm bg-black/40 border border-white/10 rounded-2xl p-6 mb-10 text-left space-y-4 backdrop-blur-md">
                    <div className="flex justify-between items-center border-b border-white/5 pb-3">
                      <span className="text-neutral-500 text-sm uppercase tracking-wider">Vak</span>
                      <span className="text-white font-medium text-lg">{subject}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-white/5 pb-3">
                      <span className="text-neutral-500 text-sm uppercase tracking-wider">Datum</span>
                      <span className="text-white font-medium text-lg">{date?.toLocaleDateString('nl-NL')}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-neutral-500 text-sm uppercase tracking-wider">Intensiteit</span>
                      <span className="text-amber-400 font-bold text-lg">Niveau {difficulty}</span>
                    </div>
                  </div>
                  <Button
                    onClick={handleConfirm}
                    disabled={isSubmitting}
                    className="luxury-button w-full max-w-sm h-14 rounded-xl text-lg"
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