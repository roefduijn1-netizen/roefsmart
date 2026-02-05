import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { CheckCircle, Circle, Clock, CalendarDays, BookOpen } from 'lucide-react';
import { api } from '@/lib/api-client';
import { User, StudySession, Test } from '@shared/types';
import { getGreeting } from '@/lib/aurum-utils';
import { AurumLayout } from '@/components/layout/AurumLayout';
import { cn } from '@/lib/utils';
import { format, isSameDay, parseISO, differenceInDays } from 'date-fns';
import { toast } from 'sonner';
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
  });
  const toggleSession = useMutation({
    mutationFn: async ({ testId, sessionId }: { testId: string; sessionId: string }) => {
      return api(`/api/users/${userId}/tests/${testId}/sessions/${sessionId}/toggle`, { method: 'POST' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', userId] });
      toast.success('Progress updated');
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
      <div className="px-6 py-8 space-y-8">
        {/* Header */}
        <header>
          <p className="text-neutral-400 text-sm font-medium uppercase tracking-wider mb-1">
            {format(today, 'EEEE, MMMM do')}
          </p>
          <h1 className="text-3xl font-display font-bold text-white">
            {getGreeting()}, <span className="text-amber-400">{user.name.split(' ')[0]}</span>
          </h1>
        </header>
        {/* Today's Agenda */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Today's Ritual</h2>
            <span className="text-xs text-neutral-500 bg-neutral-900 px-2 py-1 rounded-full border border-neutral-800">
              {todaysSessions.filter(s => s.isCompleted).length}/{todaysSessions.length} Completed
            </span>
          </div>
          <div className="space-y-3">
            {todaysSessions.length === 0 ? (
              <div className="p-6 rounded-2xl bg-neutral-900/30 border border-neutral-800 border-dashed text-center">
                <p className="text-neutral-500 text-sm">No study sessions scheduled for today.</p>
                <p className="text-neutral-600 text-xs mt-1">Enjoy your rest.</p>
              </div>
            ) : (
              todaysSessions.map((session) => (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "group relative p-4 rounded-2xl border transition-all duration-300",
                    session.isCompleted 
                      ? "bg-neutral-900/30 border-neutral-800 opacity-60" 
                      : "bg-neutral-900/80 border-amber-500/20 shadow-[0_4px_20px_-5px_rgba(0,0,0,0.5)]"
                  )}
                >
                  <div className="flex items-start gap-4">
                    <button
                      onClick={() => toggleSession.mutate({ testId: session.testId, sessionId: session.id })}
                      className={cn(
                        "mt-1 flex-shrink-0 w-6 h-6 rounded-full border flex items-center justify-center transition-all",
                        session.isCompleted
                          ? "bg-amber-500 border-amber-500 text-black"
                          : "border-neutral-600 group-hover:border-amber-400"
                      )}
                    >
                      {session.isCompleted && <CheckCircle className="w-4 h-4" />}
                    </button>
                    <div className="flex-1">
                      <h3 className={cn(
                        "font-medium text-base mb-1 transition-colors",
                        session.isCompleted ? "text-neutral-500 line-through" : "text-white"
                      )}>
                        {session.topic}
                      </h3>
                      <div className="flex items-center gap-3 text-xs text-neutral-500">
                        <span className="flex items-center gap-1 text-amber-500/80">
                          <BookOpen className="w-3 h-3" />
                          {session.testTitle}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {session.durationMinutes} min
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </section>
        {/* Upcoming Tests */}
        <section>
          <h2 className="text-lg font-semibold text-white mb-4">Upcoming Tests</h2>
          <div className="space-y-3">
            {upcomingTests.length === 0 ? (
              <div className="p-4 text-center text-neutral-500 text-sm">
                No upcoming tests. <br/> Tap '+' to schedule one.
              </div>
            ) : (
              upcomingTests.map((test) => {
                const daysLeft = differenceInDays(parseISO(test.date), today);
                return (
                  <div key={test.id} className="p-4 rounded-2xl bg-neutral-900/50 border border-neutral-800 flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-white">{test.title}</h3>
                      <p className="text-xs text-neutral-500">{format(parseISO(test.date), 'MMM do, yyyy')}</p>
                    </div>
                    <div className="text-right">
                      <span className="block text-2xl font-bold text-amber-400 leading-none">
                        {daysLeft}
                      </span>
                      <span className="text-[10px] uppercase tracking-wider text-neutral-500">Days Left</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>
      </div>
    </AurumLayout>
  );
}