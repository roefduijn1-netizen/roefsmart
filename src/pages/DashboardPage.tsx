import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { CheckCircle, Clock, BookOpen, PartyPopper, Calendar as CalendarIcon, Plus, ArrowRight, AlertCircle, Loader2, LogOut } from 'lucide-react';
import { api } from '@/lib/api-client';
import { User } from '@shared/types';
import { getGreeting } from '@/lib/aurum-utils';
import { AurumLayout } from '@/components/layout/AurumLayout';
import { cn } from '@/lib/utils';
import { format, isSameDay, parseISO, differenceInDays } from 'date-fns';
import { nl } from 'date-fns/locale';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { DashboardCalendar } from '@/components/dashboard/DashboardCalendar';
import { StarRating } from '@/components/ui/star-rating';
export function DashboardPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const userId = localStorage.getItem('aurum_user_id');
  useEffect(() => {
    if (!userId) navigate('/auth');
  }, [userId, navigate]);
  const { data: user, isLoading, isError, refetch } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => api<User>(`/api/users/${userId}`),
    enabled: !!userId,
    staleTime: 60000,
    retry: 1,
  });
  const toggleSession = useMutation({
    mutationFn: async ({ testId, sessionId }: { testId: string; sessionId: string }) => {
      return api(`/api/users/${userId}/tests/${testId}/sessions/${sessionId}/toggle`, { method: 'POST' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', userId] });
      toast.success('Voortgang bijgewerkt');
    },
    onError: () => {
      toast.error('Kon voortgang niet opslaan');
    }
  });
  // Error State
  if (isError) {
    return (
      <AurumLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 space-y-6">
          <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-display font-bold text-foreground">Er is een fout opgetreden</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              We konden je gegevens niet laden. Dit kan komen door een verbindingsprobleem of omdat je sessie is verlopen.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button onClick={() => refetch()} variant="outline" className="border-white/10 hover:bg-white/5">
              Opnieuw proberen
            </Button>
            <Button onClick={() => navigate('/auth')} className="luxury-button">
              <LogOut className="w-4 h-4 mr-2" />
              Opnieuw inloggen
            </Button>
          </div>
        </div>
      </AurumLayout>
    );
  }
  // Loading State
  if (isLoading || !user) {
    return (
      <AurumLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-10 h-10 text-amber-500 animate-spin" />
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
  const allSessions = user.tests.flatMap(t => t.sessions);
  return (
    <AurumLayout>
      <div className="px-6 py-8 md:py-12 space-y-8 max-w-7xl mx-auto">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 text-muted-foreground text-xs font-medium uppercase tracking-widest mb-2">
              <CalendarIcon className="w-3 h-3 text-amber-500" />
              {format(today, 'EEEE d MMMM', { locale: nl })}
            </div>
            <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground tracking-tight">
              {getGreeting()}, <span className="text-gold-premium">{user.name.split(' ')[0]}</span>
            </h1>
          </div>
          <Button
            asChild
            className="luxury-button-primary h-12 px-6 rounded-xl text-sm font-bold shadow-[0_0_20px_-5px_rgba(245,158,11,0.3)]"
          >
            <Link to="/add">
              <Plus className="w-4 h-4 mr-2" />
              Nieuwe Toets
            </Link>
          </Button>
        </header>
        {/* Main Grid Layout - Responsive: 1 col mobile, 2 cols tablet, 3 cols desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Left Column: Status & Upcoming */}
          <div className="col-span-1 space-y-8">
            {/* Today's Status Card */}
            <section>
              {todaysSessions.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="luxury-card p-8 rounded-3xl text-center flex flex-col items-center justify-center min-h-[240px] relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-b from-amber-500/5 to-transparent opacity-50" />
                  <div className="relative z-10">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-500">
                      <PartyPopper className="w-8 h-8 text-amber-500" />
                    </div>
                    <h3 className="text-xl font-display font-bold text-foreground mb-2">Geen leersessies vandaag</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed max-w-[200px] mx-auto">
                      Geniet van je vrije dag of plan een nieuwe toets in!
                    </p>
                  </div>
                </motion.div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between px-1">
                    <h2 className="text-lg font-display font-semibold text-foreground">Vandaag</h2>
                    <span className="text-xs font-medium text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                      {todaysSessions.filter(s => s.isCompleted).length}/{todaysSessions.length}
                    </span>
                  </div>
                  <div className="space-y-3">
                    {todaysSessions.map((session) => (
                      <motion.div
                        key={session.id}
                        layout
                        onClick={() => toggleSession.mutate({ testId: session.testId, sessionId: session.id })}
                        className={cn(
                          "luxury-card p-4 rounded-2xl cursor-pointer group relative overflow-hidden transition-all duration-300",
                          session.isCompleted ? "opacity-60" : "hover:-translate-y-1"
                        )}
                      >
                        <div className="flex items-start gap-3 relative z-10">
                          <div className={cn(
                            "mt-0.5 w-5 h-5 rounded-full border flex items-center justify-center transition-colors",
                            session.isCompleted
                              ? "bg-amber-500 border-amber-500 text-black"
                              : "border-white/20 group-hover:border-amber-500/50"
                          )}>
                            {session.isCompleted && <CheckCircle className="w-3 h-3" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={cn(
                              "text-sm font-medium truncate transition-colors",
                              session.isCompleted ? "text-muted-foreground line-through" : "text-foreground group-hover:text-amber-100"
                            )}>{session.topic}</p>
                            <div className="flex items-center gap-2 mt-1.5">
                              <span className="text-[10px] uppercase tracking-wider text-amber-500 font-bold bg-amber-500/10 px-1.5 py-0.5 rounded">
                                {session.testTitle}
                              </span>
                              <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                <Clock className="w-3 h-3" /> {session.durationMinutes}m
                              </span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </section>
            {/* Upcoming Tests List */}
            <section>
              <div className="flex items-center justify-between px-1 mb-4">
                <h2 className="text-lg font-display font-semibold text-foreground flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-muted-foreground" />
                  Aankomende Toetsen
                </h2>
              </div>
              <div className="space-y-3">
                {upcomingTests.length === 0 ? (
                  <div className="p-6 text-center border border-dashed border-white/10 rounded-2xl bg-white/5">
                    <p className="text-muted-foreground text-sm">Geen toetsen in het vooruitzicht.</p>
                  </div>
                ) : (
                  upcomingTests.slice(0, 3).map((test) => {
                    const daysLeft = differenceInDays(parseISO(test.date), today);
                    return (
                      <div key={test.id} className="luxury-card p-5 rounded-2xl group hover:border-amber-500/30 transition-all duration-300">
                        <div className="flex justify-between items-start mb-3">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-500 bg-amber-500/10 px-2 py-1 rounded-md border border-amber-500/20">
                            {test.subject}
                          </span>
                          <StarRating rating={test.difficulty} className="opacity-50 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <h3 className="text-lg font-display font-bold text-foreground mb-1 group-hover:text-amber-100 transition-colors">
                          {test.title}
                        </h3>
                        <div className="flex items-center gap-2 text-muted-foreground text-xs mb-4">
                          <CalendarIcon className="w-3.5 h-3.5" />
                          {format(parseISO(test.date), 'd MMMM yyyy', { locale: nl })}
                        </div>
                        <div className="flex items-center gap-2 text-xs font-medium text-foreground bg-white/5 px-3 py-2 rounded-lg border border-white/10">
                          <BookOpen className="w-3.5 h-3.5 text-amber-500" />
                          <span>Nog <span className="text-amber-400 font-bold">{daysLeft}</span> dagen</span>
                        </div>
                      </div>
                    );
                  })
                )}
                {upcomingTests.length > 3 && (
                  <Button variant="ghost" className="w-full text-xs text-muted-foreground hover:text-foreground">
                    Bekijk alle {upcomingTests.length} toetsen <ArrowRight className="w-3 h-3 ml-1" />
                  </Button>
                )}
              </div>
            </section>
          </div>
          {/* Right Column: Calendar - Spans 1 col on tablet, 2 cols on desktop */}
          <div className="col-span-1 md:col-span-1 lg:col-span-2 h-full min-h-[500px]">
            <DashboardCalendar
              tests={user.tests}
              sessions={allSessions}
              className="h-full"
            />
          </div>
        </div>
      </div>
    </AurumLayout>
  );
}