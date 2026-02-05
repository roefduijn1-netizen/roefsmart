import React from 'react';
import { format, parseISO } from 'date-fns';
import { nl } from 'date-fns/locale';
import { Calendar as CalendarIcon, Trash2, CheckCircle2, Circle, BookOpen, Clock } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { StarRating } from '@/components/ui/star-rating';
import { Test } from '@shared/types';
import { calculateTestProgress } from '@/lib/aurum-utils';
import { cn } from '@/lib/utils';
interface TestDetailDialogProps {
  isOpen: boolean;
  onClose: () => void;
  test: Test | null;
  onDelete: (testId: string) => void;
  isDeleting?: boolean;
}
export function TestDetailDialog({ isOpen, onClose, test, onDelete, isDeleting = false }: TestDetailDialogProps) {
  if (!test) return null;
  const progress = calculateTestProgress(test);
  const testDate = parseISO(test.date);
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-[#0a0a0a]/95 border-white/10 backdrop-blur-xl sm:max-w-[500px] p-0 gap-0 overflow-hidden shadow-2xl">
        {/* Header Section with Gradient */}
        <div className="relative p-6 pb-8 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-amber-500/10 to-transparent pointer-events-none" />
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-[50px] pointer-events-none" />
          <DialogHeader className="relative z-10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-500 bg-amber-500/10 px-2 py-1 rounded-md border border-amber-500/20">
                {test.subject}
              </span>
              <StarRating rating={test.difficulty} />
            </div>
            <DialogTitle className="text-2xl font-display font-bold text-foreground">
              {test.title}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground flex items-center gap-2 mt-1">
              <CalendarIcon className="w-4 h-4" />
              {format(testDate, 'd MMMM yyyy', { locale: nl })}
            </DialogDescription>
          </DialogHeader>
        </div>
        {/* Progress Section */}
        <div className="px-6 pb-6 border-b border-white/5">
          <div className="flex justify-between items-end mb-2">
            <span className="text-sm font-medium text-muted-foreground">Studievoortgang</span>
            <span className="text-lg font-bold text-amber-400">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2 bg-white/5" indicatorClassName="bg-amber-500" />
        </div>
        {/* Sessions List */}
        <div className="p-6 bg-black/20">
          <h3 className="text-sm font-medium text-foreground mb-4 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-amber-500" />
            Studieplanning
          </h3>
          <ScrollArea className="h-[240px] pr-4 -mr-4">
            <div className="space-y-3 pb-4">
              {test.sessions.map((session) => (
                <div 
                  key={session.id}
                  className={cn(
                    "flex items-start gap-3 p-3 rounded-xl border transition-all duration-300",
                    session.isCompleted 
                      ? "bg-amber-500/5 border-amber-500/20 opacity-60" 
                      : "bg-white/5 border-white/5"
                  )}
                >
                  <div className={cn(
                    "mt-0.5 w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0",
                    session.isCompleted ? "text-amber-500" : "text-muted-foreground"
                  )}>
                    {session.isCompleted ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-0.5">
                      <span className="text-xs text-muted-foreground font-medium">
                        {format(parseISO(session.date), 'EEE d MMM', { locale: nl })}
                      </span>
                      <span className="text-[10px] text-muted-foreground flex items-center gap-1 bg-white/5 px-1.5 py-0.5 rounded">
                        <Clock className="w-3 h-3" /> {session.durationMinutes}m
                      </span>
                    </div>
                    <p className={cn(
                      "text-sm font-medium truncate",
                      session.isCompleted ? "text-muted-foreground line-through" : "text-foreground"
                    )}>
                      {session.topic}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
        {/* Footer Actions */}
        <DialogFooter className="p-6 bg-black/40 border-t border-white/5 flex flex-row justify-between items-center sm:justify-between gap-4">
          <Button
            variant="ghost"
            onClick={() => onDelete(test.id)}
            disabled={isDeleting}
            className="text-red-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
          >
            {isDeleting ? (
              <span className="flex items-center gap-2">Verwijderen...</span>
            ) : (
              <span className="flex items-center gap-2">
                <Trash2 className="w-4 h-4" />
                Toets Verwijderen
              </span>
            )}
          </Button>
          <Button 
            onClick={onClose}
            className="luxury-button px-6"
          >
            Sluiten
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}