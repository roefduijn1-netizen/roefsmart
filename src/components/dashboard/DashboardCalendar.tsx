import React, { useState } from 'react';
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  isSameMonth, 
  isSameDay, 
  eachDayOfInterval, 
  isToday, 
  parseISO 
} from 'date-fns';
import { nl } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Test, StudySession } from '@shared/types';
interface DashboardCalendarProps {
  tests: Test[];
  sessions: StudySession[];
  className?: string;
}
export function DashboardCalendar({ tests, sessions, className }: DashboardCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 }); // Monday start
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const days = eachDayOfInterval({
    start: startDate,
    end: endDate,
  });
  const weekDays = ['Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za', 'Zo'];
  // Helper to check for events on a day
  const getDayEvents = (day: Date) => {
    const dayTests = tests.filter(t => isSameDay(parseISO(t.date), day));
    const daySessions = sessions.filter(s => isSameDay(parseISO(s.date), day));
    return { tests: dayTests, sessions: daySessions };
  };
  return (
    <div className={cn("luxury-card p-6 md:p-8 rounded-3xl h-full flex flex-col", className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <CalendarIcon className="w-5 h-5 text-amber-500" />
          <h2 className="text-2xl font-display font-semibold text-white capitalize">
            {format(currentDate, 'MMMM yyyy', { locale: nl })}
          </h2>
        </div>
        <div className="flex items-center gap-1">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={prevMonth}
            className="h-8 w-8 text-neutral-400 hover:text-white hover:bg-white/5 rounded-full"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={nextMonth}
            className="h-8 w-8 text-neutral-400 hover:text-white hover:bg-white/5 rounded-full"
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
      </div>
      {/* Calendar Grid */}
      <div className="flex-1 flex flex-col">
        {/* Weekday Headers */}
        <div className="grid grid-cols-7 mb-4">
          {weekDays.map((day) => (
            <div key={day} className="text-center text-xs font-medium text-neutral-500 uppercase tracking-wider">
              {day}
            </div>
          ))}
        </div>
        {/* Days */}
        <div className="grid grid-cols-7 grid-rows-6 gap-2 flex-1">
          {days.map((day, dayIdx) => {
            const { tests: dayTests, sessions: daySessions } = getDayEvents(day);
            const isCurrentMonth = isSameMonth(day, monthStart);
            const isDayToday = isToday(day);
            const hasTest = dayTests.length > 0;
            const hasSession = daySessions.length > 0;
            const isCompletedSession = hasSession && daySessions.every(s => s.isCompleted);
            return (
              <div
                key={day.toString()}
                className={cn(
                  "relative p-2 rounded-xl border transition-all duration-300 flex flex-col justify-between min-h-[80px] group",
                  !isCurrentMonth && "opacity-30 grayscale",
                  isDayToday 
                    ? "bg-amber-500/5 border-amber-500/50 shadow-[0_0_15px_-5px_rgba(245,158,11,0.3)]" 
                    : "bg-white/[0.02] border-white/5 hover:bg-white/5 hover:border-white/10",
                  hasTest && "border-amber-500/80 bg-amber-500/10"
                )}
              >
                <div className="flex justify-between items-start">
                  <span className={cn(
                    "text-sm font-medium",
                    isDayToday ? "text-amber-400" : "text-neutral-400 group-hover:text-neutral-200"
                  )}>
                    {format(day, 'd')}
                  </span>
                  {/* Test Indicator */}
                  {hasTest && (
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)] animate-pulse" />
                  )}
                </div>
                {/* Session Dots */}
                <div className="flex gap-1 mt-auto">
                  {daySessions.slice(0, 3).map((session, i) => (
                    <div 
                      key={i}
                      className={cn(
                        "w-1 h-1 rounded-full",
                        session.isCompleted ? "bg-amber-500/50" : "bg-neutral-600"
                      )}
                    />
                  ))}
                  {daySessions.length > 3 && (
                    <div className="w-1 h-1 rounded-full bg-neutral-700" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {/* Legend */}
      <div className="mt-6 flex items-center gap-6 text-xs text-neutral-500">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_5px_rgba(245,158,11,0.5)]" />
          <span>Toets</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-neutral-600" />
          <span>Leersessie</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-amber-500/50" />
          <span>Voltooid</span>
        </div>
      </div>
    </div>
  );
}