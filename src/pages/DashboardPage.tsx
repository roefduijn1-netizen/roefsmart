import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Clock, BookOpen, Trash2, Calendar as CalendarIcon, Sparkles } from 'lucide-react';
import { api } from '@/lib/api-client';
import { User } from '@shared/types';
import { getGreeting } from '@/lib/aurum-utils';
import { AurumLayout } from '@/components/layout/AurumLayout';
import { cn } from '@/lib/utils';
import { format, isSameDay, parseISO, differenceInDays } from 'date-fns';
import { nl } from 'date-fns/locale';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
export function DashboardPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const userId = localStorage.getItem('aurum_user_id');
  useEffect(() => {
    if (!userId) navigate('/auth');
  }, [userId, navigate]);
  const { data: user, isLoading } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => api<User>(`/api/users/${userId}`),
    enabled: !!userId,
    staleTime: 60000,
  });
  const toggleSession = useMutation({
    mutationFn: async ({ testId, sessionId }: { testId: string; sessionId: string }) => {
      return api(`/api/users/${userId}/tests/${testId}/sessions/${sessionId}/toggle`, { method: 'POST' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', userId] });
      toast.success('Voortgang bijgewerkt');
    }
  });
  const deleteTestMutation = useMutation({
    mutationFn: async (testId: string) => {
      return api(`/api/users/${userId}/tests/${testId}`, { method: 'DELETE' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', userId] });
      toast.success('Toets verwijderd');
    },
    onError: () => {
      toast.error('Kon toets niet verwijderen');
    }
  });
  if (isLoading || !user) {
    return (
      <AurumLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="w-10 h-10 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </AurumLayout>
    );
  }
  const today = new Date();
  const todaysSessions = user.tests.flatMap(test =>
    test.sessions
      .filter(s => isSameDay(parseISO(s.date), today))
      .map(s => ({ ...s, testTitle: test.title, testId: test.id }))
  );
  const upcomingTests = user.tests
    .filter(t => parseISO(t.date) >= today)
    .sort((a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime());
  return (
    <AurumLayout>
      <div className="px-6 py-8 md:py-12 space-y-12 max-w-7xl mx-auto">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-neutral-400 text-xs font-medium uppercase tracking-widest">
              <CalendarIcon className="w-3 h-3 text-amber-500" />
              {format(today, 'EEEE d MMMM', { locale: nl })}
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-bold text-white tracking-tight">
              {getGreeting()}, <span className="text-gold-premium">{user.name.split(' ')[0]}</span>
            </h1>
          </div>
          <div className="hidden md:block">
             <div className="text-right p-4 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-sm">
                <p className="text-neutral-500 text-xs uppercase tracking-wider mb-1">Actieve Focus</p>
                <p className="text-white font-display text-2xl font-bold">{todaysSessions.filter(s => !s.isCompleted).length} <span className="text-base font-normal text-neutral-400">taken over</span></p>
             </div>
          </div>
        </header>
        {/* Today's Agenda */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-display font-semibold text-white flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-amber-500" />
              Ritueel van Vandaag
            </h2>
            <span className="text-xs font-medium text-amber-500/80 bg-amber-500/10 px-4 py-1.5 rounded-full border border-amber-500/20 tracking-wide">
              {todaysSessions.filter(s => s.isCompleted).length}/{todaysSessions.length} VOLTOOID
            </span>
          </div>
          <div className={cn(
            "space-y-4",
            todaysSessions.length > 0 && "md:space-y-0 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-6"
          )}>
            {todaysSessions.length === 0 ? (
              <div className="luxury-card p-12 rounded-3xl text-center col-span-full flex flex-col items-center justify-center min-h-[200px]">
                <div className="w-16 h-16 rounded-full bg-neutral-900 flex items-center justify-center mb-4 border border-white/5">
                  <CheckCircle className="w-6 h-6 text-neutral-700" />
                </div>
                <p className="text-neutral-400 text-lg font-light">Geen studiesessies gepland voor vandaag.</p>
                <p className="text-neutral-600 text-sm mt-2">Geniet van je rust of plan een nieuwe toets.</p>
              </div>
            ) : (
              <AnimatePresence mode="popLayout">
                {todaysSessions.map((session) => (
                  <motion.div
                    key={session.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    onClick={() => toggleSession.mutate({ testId: session.testId, sessionId: session.id })}
                    className={cn(
                      "luxury-card luxury-card-hover group relative p-6 rounded-3xl cursor-pointer h-full flex flex-col justify-between overflow-hidden",
                      session.isCompleted && "opacity-50 grayscale-[0.5]"
                    )}
                  >
                    {/* Background Gradient for Active State */}
                    {!session.isCompleted && (
                      <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    )}
                    <div className="flex items-start gap-5 pointer-events-none mb-6 relative z-10">
                      <div
                        className={cn(
                          "mt-1 flex-shrink-0 w-7 h-7 rounded-full border flex items-center justify-center transition-all duration-300",
                          session.isCompleted
                            ? "bg-amber-500 border-amber-500 text-black shadow-[0_0_15px_rgba(245,158,11,0.5)]"
                            : "border-white/20 bg-white/5 group-hover:border-amber-500/50 group-hover:text-amber-400"
                        )}
                      >
                        {session.isCompleted && <CheckCircle className="w-4 h-4" />}
                      </div>
                      <div className="flex-1">
                        <h3 className={cn(
                          "font-medium text-lg leading-snug transition-colors duration-300",
                          session.isCompleted ? "text-neutral-500 line-through decoration-neutral-700" : "text-white group-hover:text-amber-100"
                        )}>
                          {session.topic}
                        </h3>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-5 border-t border-white/5 mt-auto relative z-10">
                      <div className="flex items-center gap-2 text-xs text-amber-500 font-medium tracking-wide uppercase">
                        <BookOpen className="w-3.5 h-3.5" />
                        {session.testTitle}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-neutral-500 font-mono">
                        <Clock className="w-3.5 h-3.5" />
                        {session.durationMinutes} MIN
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        </section>
        {/* Upcoming Tests */}
        <section>
          <h2 className="text-2xl font-display font-semibold text-white mb-8 flex items-center gap-3">
            <Clock className="w-5 h-5 text-neutral-400" />
            Aankomende Toetsen
          </h2>
          <div className={cn(
            "space-y-4",
            upcomingTests.length > 0 && "md:space-y-0 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-6"
          )}>
            {upcomingTests.length === 0 ? (
              <div className="p-8 text-center text-neutral-500 text-sm col-span-full bg-white/5 rounded-3xl border border-white/5 border-dashed">
                Geen aankomende toetsen. <br/> Tik op '+' om er een te plannen.
              </div>
            ) : (
              <AnimatePresence mode="popLayout">
                {upcomingTests.map((test) => {
                  const daysLeft = differenceInDays(parseISO(test.date), today);
                  return (
                    <motion.div
                      key={test.id}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="luxury-card p-6 rounded-3xl flex flex-col justify-between group hover:border-white/10 transition-all duration-300 h-full"
                    >
                      <div className="flex justify-between items-start mb-6">
                        <div>
                          <h3 className="font-display font-bold text-white text-xl tracking-tight">{test.title}</h3>
                          <p className="text-sm text-neutral-500 mt-1 font-medium">{format(parseISO(test.date), 'd MMMM yyyy', { locale: nl })}</p>
                        </div>
                        <div className="text-right bg-black/40 px-4 py-3 rounded-xl border border-white/5 shadow-inner">
                          <span className="block text-3xl font-display font-bold text-gold-premium leading-none">
                            {daysLeft}
                          </span>
                          <span className="text-[9px] uppercase tracking-widest text-neutral-600 mt-1 block">Dagen</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-5 border-t border-white/5">
                         <div className="flex items-center gap-2">
                            <div className="flex gap-0.5">
                                {[...Array(5)].map((_, i) => (
                                    <div key={i} className={cn("w-1 h-3 rounded-full", i < test.difficulty ? "bg-amber-500" : "bg-neutral-800")} />
                                ))}
                            </div>
                            <span className="text-xs text-neutral-400 font-medium ml-1">Niveau {test.difficulty}</span>
                         </div>
                         <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-neutral-600 hover:text-red-400 hover:bg-red-500/10 transition-colors rounded-full">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="luxury-card bg-[#0a0a0a] border-white/10 text-white">
                            <AlertDialogHeader>
                              <AlertDialogTitle className="font-display text-xl">Toets Verwijderen?</AlertDialogTitle>
                              <AlertDialogDescription className="text-neutral-400">
                                Dit verwijdert de toets "{test.title}" en alle bijbehorende studiesessies permanent.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="bg-transparent text-white border-white/10 hover:bg-white/5">Annuleren</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteTestMutation.mutate(test.id)}
                                className="bg-red-600 text-white hover:bg-red-700 border-none"
                              >
                                Verwijderen
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            )}
          </div>
        </section>
      </div>
    </AurumLayout>
  );
}