import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Calendar, PlusCircle, User as UserIcon, Settings, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/sonner';
interface AurumLayoutProps {
  children: React.ReactNode;
  showNav?: boolean;
}
export function AurumLayout({ children, showNav = true }: AurumLayoutProps) {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-amber-500/30 flex flex-col md:flex-row">
      {/* Background Ambient Glow - Fixed for all screens */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-amber-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-amber-600/5 rounded-full blur-[120px]" />
      </div>
      {/* Desktop Sidebar Navigation */}
      {showNav && (
        <aside className="hidden md:flex w-64 flex-col fixed inset-y-0 left-0 z-50 bg-neutral-900/90 backdrop-blur-xl border-r border-white/5 shadow-2xl">
          <div className="p-8 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-display font-bold text-white tracking-tight">Aurum</span>
          </div>
          <nav className="flex-1 px-4 space-y-2 py-4">
            <DesktopNavItem to="/" icon={<Calendar className="w-5 h-5" />} label="Agenda" />
            <DesktopNavItem to="/add" icon={<PlusCircle className="w-5 h-5" />} label="Toevoegen" />
            <DesktopNavItem to="/profile" icon={<UserIcon className="w-5 h-5" />} label="Profiel" />
            <DesktopNavItem to="/settings" icon={<Settings className="w-5 h-5" />} label="Instellingen" />
          </nav>
          <div className="p-6 border-t border-white/5">
            <div className="text-xs text-neutral-600 text-center">
              Built with ❤️ by Aurelia
            </div>
          </div>
        </aside>
      )}
      {/* Main Content Area */}
      <main className={cn(
        "relative z-10 flex-1 w-full min-h-screen transition-all duration-300",
        // Mobile padding for bottom nav
        showNav ? "pb-24 md:pb-0" : "pb-0",
        // Desktop padding for sidebar
        showNav ? "md:pl-64" : ""
      )}>
        <div className="w-full max-w-7xl mx-auto h-full">
            {children}
        </div>
      </main>
      {/* Mobile Bottom Navigation */}
      {showNav && (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex justify-center pointer-events-none">
          <div className="w-full bg-neutral-900/90 backdrop-blur-xl border-t border-white/10 pointer-events-auto pb-6 pt-2 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.5)]">
            <div className="flex items-center justify-around h-16 px-2">
              <MobileNavItem to="/" icon={<Calendar className="w-6 h-6" />} label="Agenda" />
              <MobileNavItem to="/add" icon={<PlusCircle className="w-8 h-8 text-amber-400" />} label="Toevoegen" isPrimary />
              <MobileNavItem to="/profile" icon={<UserIcon className="w-6 h-6" />} label="Profiel" />
              <MobileNavItem to="/settings" icon={<Settings className="w-6 h-6" />} label="Instellingen" />
            </div>
          </div>
        </nav>
      )}
      <Toaster theme="dark" position="top-center" />
    </div>
  );
}
function MobileNavItem({ to, icon, label, isPrimary }: { to: string; icon: React.ReactNode; label: string; isPrimary?: boolean }) {
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
function DesktopNavItem({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) => cn(
        "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
        isActive 
          ? "bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-[0_0_15px_-5px_rgba(245,158,11,0.1)]" 
          : "text-neutral-400 hover:text-neutral-200 hover:bg-white/5 border border-transparent"
      )}
    >
      <span className={cn("transition-colors", isActive ? "text-amber-400" : "text-neutral-500 group-hover:text-neutral-300")}>
        {icon}
      </span>
      <span className="font-medium text-sm">{label}</span>
    </NavLink>
  );
}