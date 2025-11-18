import { ReactNode } from 'react';
import { Graph, Info } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';

interface AppLayoutProps {
  children: ReactNode;
  currentPage: 'models' | 'about';
  onNavigate: (page: 'models' | 'about') => void;
}

export function AppLayout({ children, currentPage, onNavigate }: AppLayoutProps) {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background">
      <aside className="w-64 border-r border-border bg-card flex flex-col">
        <div className="p-6 border-b border-border">
          <h1 className="text-xl font-bold text-foreground">DL4J Graph Explorer</h1>
          <p className="text-xs text-muted-foreground mt-1">Model Visualization Tool</p>
        </div>
        
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            <li>
              <button
                onClick={() => onNavigate('models')}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  currentPage === 'models'
                    ? "bg-accent text-accent-foreground"
                    : "text-foreground hover:bg-muted"
                )}
              >
                <Graph size={20} weight={currentPage === 'models' ? 'fill' : 'regular'} />
                Models
              </button>
            </li>
            <li>
              <button
                onClick={() => onNavigate('about')}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  currentPage === 'about'
                    ? "bg-accent text-accent-foreground"
                    : "text-foreground hover:bg-muted"
                )}
              >
                <Info size={20} weight={currentPage === 'about' ? 'fill' : 'regular'} />
                About
              </button>
            </li>
          </ul>
        </nav>
        
        <div className="p-4 border-t border-border">
          <p className="text-xs text-muted-foreground">
            Read-only visualization tool for DeepLearning4J computational graphs
          </p>
        </div>
      </aside>
      
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
