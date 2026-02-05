import React from 'react';
import { NavLink } from 'react-router-dom';
import { Calendar, PlusCircle, User as UserIcon, Settings, Crown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/sonner';
import { useNotifications } from '@/hooks/use-notifications';
import { motion } from 'framer-motion';
interface AurumLayoutProps {
  children: React.ReactNode;
  showNav?: boolean;
}
export function AurumLayout({ children, showNav = true }: AurumLayoutProps) {
  // Initialize notifications
  useNotifications();
  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-amber-500/30 flex flex-col md:flex-row overflow-hidden transition-colors duration-300">
      {/* Ambient Background - Breathing Effect */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <motion.div
          animate={{
            opacity: [0.3, 0.5, 0.3],
            scale: [1, 1.1, 1]
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-amber-500/5 rounded-full blur-[150px]"
        />
        <motion.div
          animate={{
            opacity: [0.2, 0.4, 0.2],
            scale: [1, 1.2, 1]
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
          className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-amber-600/5 rounded-full blur-[150px]"
        />
      </div>
      {/* Desktop Sidebar Navigation */}
      {showNav && (
        <aside className="hidden md:flex w-72 flex-col fixed inset-y-0 left-0 z-50 liquid-nav border-r">
          <div className="p-8 flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-300 via-amber-500 to-amber-700 flex items-center justify-center shadow-[0_0_20px_-5px_rgba(245,158,11,0.4)]">
              <Crown className="w-5 h-5 text-black fill-black/20" />
            </div>
            <div>
              <span className="text-xl font-display font-bold text-foreground tracking-tight block leading-none">ROEFSMART</span>
              <span className="text-[10px] text-amber-600 dark:text-amber-500/80 tracking-[0.2em] uppercase font-medium">Exclusief</span>
            </div>
          </div>
          <nav className="flex-1 px-4 space-y-2 py-4">
            <DesktopNavItem to="/" icon={<Calendar className="w-5 h-5" />} label="Agenda" />
            <DesktopNavItem to="/add" icon={<PlusCircle className="w-5 h-5" />} label="Nieuwe Toets" />
            <DesktopNavItem to="/profile" icon={<UserIcon className="w-5 h-5" />} label="Profiel" />
            <DesktopNavItem to="/settings" icon={<Settings className="w-5 h-5" />} label="Instellingen" />
          </nav>
          <div className="p-8 border-t border-border/50">
            <div className="p-4 rounded-xl bg-gradient-to-br from-secondary to-background border border-border relative overflow-hidden group">
              <div className="absolute inset-0 bg-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <p className="text-xs text-muted-foreground relative z-10 text-center font-light tracking-wide">
                ROEFSMART <span className="text-amber-500">Premium</span>
              </p>
            </div>
          </div>
        </aside>
      )}
      {/* Main Content Area */}
      <main className={cn(
        "relative z-10 flex-1 w-full min-h-screen transition-all duration-300",
        // Mobile padding for bottom nav
        showNav ? "pb-28 md:pb-0" : "pb-0",
        // Desktop padding for sidebar
        showNav ? "md:pl-72" : ""
      )}>
        <div className="w-full max-w-7xl mx-auto h-full">
            {children}
        </div>
      </main>
      {/* Mobile Bottom Navigation */}
      {showNav && (
        <nav className="md:hidden fixed bottom-6 left-4 right-4 z-50 flex justify-center pointer-events-none">
          <div className="w-full max-w-md liquid-nav pointer-events-auto rounded-2xl px-2 py-2 border border-border/50">
            <div className="flex items-center justify-between h-14 px-2">
              <MobileNavItem to="/" icon={<Calendar className="w-5 h-5" />} label="Agenda" />
              <MobileNavItem to="/add" icon={<PlusCircle className="w-6 h-6" />} label="Nieuw" isPrimary />
              <MobileNavItem to="/profile" icon={<UserIcon className="w-5 h-5" />} label="Profiel" />
              <MobileNavItem to="/settings" icon={<Settings className="w-5 h-5" />} label="Opties" />
            </div>
          </div>
        </nav>
      )}
      <Toaster
        theme="system"
        position="top-center"
        toastOptions={{
          className: "bg-card border border-border text-foreground shadow-2xl backdrop-blur-xl",
          descriptionClassName: "text-muted-foreground"
        }}
      />
    </div>
  );
}
function MobileNavItem({ to, icon, label, isPrimary }: { to: string; icon: React.ReactNode; label: string; isPrimary?: boolean }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) => cn(
        "flex flex-col items-center justify-center w-16 h-full transition-all duration-300 relative",
        isActive && !isPrimary ? "text-amber-600 dark:text-amber-400" : "text-muted-foreground",
        isPrimary && "transform -translate-y-4"
      )}
    >
      {({ isActive }) => (
        <>
          <div className={cn(
            "flex items-center justify-center transition-all duration-300",
            isPrimary
              ? "w-14 h-14 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-black shadow-[0_0_20px_-5px_rgba(245,158,11,0.5)]"
              : "w-10 h-10 rounded-xl",
            isActive && !isPrimary ? "bg-amber-500/10" : ""
          )}>
            {icon}
          </div>
          {!isPrimary && isActive && (
            <motion.div
              layoutId="mobileNavIndicator"
              className="absolute -bottom-1 w-1 h-1 rounded-full bg-amber-500"
            />
          )}
        </>
      )}
    </NavLink>
  );
}
function DesktopNavItem({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) => cn(
        "flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 group relative overflow-hidden",
        isActive
          ? "text-amber-600 dark:text-amber-400 bg-amber-500/5 border border-amber-500/10"
          : "text-muted-foreground hover:text-foreground hover:bg-secondary/50 border border-transparent"
      )}
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
          )}
          <span className={cn("transition-colors relative z-10", isActive ? "text-amber-600 dark:text-amber-400" : "text-muted-foreground group-hover:text-foreground")}>
            {icon}
          </span>
          <span className="font-medium text-sm relative z-10 tracking-wide">{label}</span>
        </>
      )}
    </NavLink>
  );
}