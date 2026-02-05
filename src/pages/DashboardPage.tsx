import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Clock, BookOpen, Trash2, Calendar as CalendarIcon } from 'lucide-react';
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
    staleTime: 60000, // Cache for 1 minute to improve performance
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
          <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </AurumLayout>
    );
  }
  const today = new Date();
  // Flatten all sessions from all tests
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
      <div className="px-6 py-8 md:py-12 space-y-10 max-w-7xl mx-auto">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <p className="text-neutral-400 text-sm font-medium uppercase tracking-wider mb-1 flex items-center gap-2">
              <CalendarIcon className="w-4 h-4" />
              {format(today, 'EEEE d MMMM', { locale: nl })}
            </p>
            <h1 className="text-3xl md:text-4xl font-display font-bold text-white">
              {getGreeting()}, <span className="text-amber-400">{user.name.split(' ')[0]}</span>
            </h1>
          </div>
          <div className="hidden md:block">
             <div className="text-right">
                <p className="text-neutral-500 text-sm">Actieve Focus</p>
                <p className="text-white font-medium">{todaysSessions.filter(s => !s.isCompleted).length} taken over</p>
             </div>
          </div>
        </header>
        {/* Today's Agenda */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">Ritueel van Vandaag</h2>
            <span className="text-xs text-neutral-500 bg-neutral-900 px-3 py-1.5 rounded-full border border-neutral-800">
              {todaysSessions.filter(s => s.isCompleted).length}/{todaysSessions.length} Voltooid
            </span>
          </div>
          <div className={cn(
            "space-y-3",
            todaysSessions.length > 0 && "md:space-y-0 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-4"
          )}>
            {todaysSessions.length === 0 ? (
              <div className="p-8 md:p-12 rounded-2xl bg-neutral-900/30 border border-neutral-800 border-dashed text-center col-span-full">
                <p className="text-neutral-500 text-base">Geen studiesessies gepland voor vandaag.</p>
                <p className="text-neutral-600 text-sm mt-2">Geniet van je rust of plan een nieuwe toets.</p>
              </div>
            ) : (
              <AnimatePresence mode="popLayout">
                {todaysSessions.map((session) => (
                  <motion.div
                    key={session.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    onClick={() => toggleSession.mutate({ testId: session.testId, sessionId: session.id })}
                    className={cn(
                      "group relative p-5 rounded-2xl border transition-all duration-300 cursor-pointer h-full flex flex-col justify-between",
                      session.isCompleted
                        ? "bg-neutral-900/30 border-neutral-800 opacity-60"
                        : "bg-neutral-900/80 border-amber-500/20 shadow-[0_4px_20px_-5px_rgba(0,0,0,0.5)] hover:bg-neutral-800/80 hover:border-amber-500/40 hover:-translate-y-1"
                    )}
                  >
                    <div className="flex items-start gap-4 pointer-events-none mb-4">
                      <div 
                        className={cn(
                          "mt-1 flex-shrink-0 w-6 h-6 rounded-full border flex items-center justify-center transition-all",
                          session.isCompleted 
                            ? "bg-amber-500 border-amber-500 text-black" 
                            : "border-neutral-600 group-hover:border-amber-400"
                        )}
                      >
                        {session.isCompleted && <CheckCircle className="w-4 h-4" />}
                      </div>
                      <div className="flex-1">
                        <h3 className={cn(
                          "font-medium text-lg leading-snug transition-colors",
                          session.isCompleted ? "text-neutral-500 line-through" : "text-white"
                        )}>
                          {session.topic}
                        </h3>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-white/5 mt-auto">
                      <div className="flex items-center gap-2 text-xs text-amber-500/90 font-medium">
                        <BookOpen className="w-3.5 h-3.5" />
                        {session.testTitle}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-neutral-500">
                        <Clock className="w-3.5 h-3.5" />
                        {session.durationMinutes} min
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
          <h2 className="text-xl font-semibold text-white mb-6">Aankomende Toetsen</h2>
          <div className={cn(
            "space-y-3",
            upcomingTests.length > 0 && "md:space-y-0 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-4"
          )}>
            {upcomingTests.length === 0 ? (
              <div className="p-8 text-center text-neutral-500 text-sm col-span-full bg-neutral-900/20 rounded-2xl border border-neutral-800/50">
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
                      className="p-5 rounded-2xl bg-neutral-900/50 border border-neutral-800 flex flex-col justify-between group hover:border-neutral-700 transition-colors h-full"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-medium text-white text-lg">{test.title}</h3>
                          <p className="text-sm text-neutral-500 mt-1">{format(parseISO(test.date), 'd MMMM yyyy', { locale: nl })}</p>
                        </div>
                        <div className="text-right bg-neutral-950/50 px-3 py-2 rounded-lg border border-neutral-800">
                          <span className="block text-2xl font-bold text-amber-400 leading-none">
                            {daysLeft}
                          </span>
                          <span className="text-[10px] uppercase tracking-wider text-neutral-500">Dagen</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-4 border-t border-white/5">
                         <div className="text-xs text-neutral-500">
                            Niveau {test.difficulty}
                         </div>
                         <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-neutral-600 hover:text-red-400 hover:bg-red-950/20 transition-colors rounded-full">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="bg-neutral-900 border-neutral-800 text-white">
                            <AlertDialogHeader>
                              <AlertDialogTitle>Weet je het zeker?</AlertDialogTitle>
                              <AlertDialogDescription className="text-neutral-400">
                                Dit verwijdert de toets "{test.title}" en alle bijbehorende studiesessies permanent. Dit kan niet ongedaan worden gemaakt.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="bg-neutral-800 text-white border-neutral-700 hover:bg-neutral-700 hover:text-white">Annuleren</AlertDialogCancel>
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