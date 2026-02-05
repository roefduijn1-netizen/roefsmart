import React from 'react';
import { NavLink } from 'react-router-dom';
import { Calendar, PlusCircle, User as UserIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/sonner';
interface AurumLayoutProps {
  children: React.ReactNode;
  showNav?: boolean;
}
export function AurumLayout({ children, showNav = true }: AurumLayoutProps) {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-amber-500/30">
      {/* Background Ambient Glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-amber-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-amber-600/5 rounded-full blur-[120px]" />
      </div>
      {/* Main Content Area */}
      <main className={cn(
        "relative z-10 min-h-screen pb-24 max-w-md mx-auto bg-background/50 shadow-2xl min-[450px]:border-x border-white/5",
        !showNav && "pb-0"
      )}>
        {children}
      </main>
      {/* Bottom Navigation */}
      {showNav && (
        <nav className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pointer-events-none">
          <div className="w-full max-w-md bg-neutral-900/80 backdrop-blur-xl border-t border-white/10 pointer-events-auto pb-6">
            <div className="flex items-center justify-around h-16 px-2">
              <NavItem to="/" icon={<Calendar className="w-6 h-6" />} label="Agenda" />
              <NavItem to="/add" icon={<PlusCircle className="w-8 h-8 text-amber-400" />} label="Add" isPrimary />
              <NavItem to="/profile" icon={<UserIcon className="w-6 h-6" />} label="Profile" />
            </div>
          </div>
        </nav>
      )}
      <Toaster theme="dark" position="top-center" />
    </div>
  );
}
function NavItem({ to, icon, label, isPrimary }: { to: string; icon: React.ReactNode; label: string; isPrimary?: boolean }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) => cn(
        "flex flex-col items-center justify-center w-16 h-full transition-all duration-200",
        isActive && !isPrimary ? "text-amber-400" : "text-neutral-500 hover:text-neutral-300",
        isPrimary && "transform hover:scale-105 active:scale-95"
      )}
    >
      <div className={cn(
        "flex items-center justify-center rounded-full transition-all",
        isPrimary ? "bg-amber-500/10 p-2 shadow-[0_0_15px_-3px_rgba(245,158,11,0.3)]" : ""
      )}>
        {icon}
      </div>
      {!isPrimary && <span className="text-[10px] font-medium mt-1">{label}</span>}
    </NavLink>
  );
}