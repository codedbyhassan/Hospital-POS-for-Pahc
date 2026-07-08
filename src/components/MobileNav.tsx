import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useLoading } from '@/context/LoadingContext';
import { cn } from '@/lib/utils';
import { Home, Clock, Package, Database } from 'lucide-react';

const MobileNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { showLoader, hideLoader } = useLoading();
  const currentPath = location.pathname;

  const handleNavigation = (path: string) => {
    if (currentPath !== path) {
      showLoader();
      setTimeout(() => {
        navigate(path);
        setTimeout(() => hideLoader(), 300);
      }, 200);
    }
  };

  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/history', icon: Clock, label: 'History' },
    { path: '/items', icon: Package, label: 'Items' },
    { path: '/data', icon: Database, label: 'Data' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-lg border-t border-border/50 md:hidden">
      <div className="flex items-center justify-around px-2 py-2 safe-area-bottom">
        {navItems.map(({ path, icon: Icon, label }) => {
          const isActive = currentPath === path;
          return (
            <button
              key={path}
              onClick={() => handleNavigation(path)}
              className={cn(
                "flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-200 min-w-0 flex-1",
                isActive
                  ? "bg-black shadow-2xl text-white"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
              )}
              style={isActive ? {
                boxShadow: `0 0 15px hsl(var(--primary)), 0 0 30px hsl(var(--primary) / 0.5), 0 0 45px hsl(var(--primary) / 0.3)`
              } : {}}
            >
              <Icon
                className={cn(
                  "w-5 h-5 mb-1 transition-colors",
                  isActive ? "text-white" : "text-muted-foreground"
                )}
                style={isActive ? { color: `hsl(var(--primary))` } : {}}
              />
              <span className={cn(
                "text-xs font-medium transition-colors",
                isActive ? "text-white" : "text-muted-foreground"
              )}>
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default MobileNav;