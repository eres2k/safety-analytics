/**
 * Main Layout Component
 * Header, navigation, and content area
 */

import React from 'react';
import { Moon, Sun, Menu, X, BarChart3 } from 'lucide-react';
import { Button } from './ui/Button';
import { useAppStore } from '@/store';
import { cn } from '@/lib/utils';
import type { ModuleName } from '@/types';

const modules: Array<{ id: ModuleName; label: string }> = [
  { id: 'overview', label: 'Overview' },
  { id: 'injury', label: 'Injuries' },
  { id: 'nearMiss', label: 'Near Misses' },
  { id: 'combined', label: 'Analytics' },
  { id: 'inspections', label: 'Inspections' },
  { id: 'reports', label: 'Reports' },
  { id: 'actions', label: 'Actions' },
];

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const theme = useAppStore(state => state.theme);
  const currentModule = useAppStore(state => state.currentModule);
  const sidebarCollapsed = useAppStore(state => state.sidebarCollapsed);
  const setTheme = useAppStore(state => state.setTheme);
  const setCurrentModule = useAppStore(state => state.setCurrentModule);
  const toggleSidebar = useAppStore(state => state.toggleSidebar);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center px-4">
          {/* Logo */}
          <div className="flex items-center gap-3 mr-6">
            <div className="p-2 bg-primary rounded-lg">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Safety Analytics</h1>
              <p className="text-xs text-muted-foreground">Amazon WHS Austria</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 flex-1">
            {modules.map((module) => (
              <Button
                key={module.id}
                variant={currentModule === module.id ? "primary" : "ghost"}
                size="sm"
                onClick={() => setCurrentModule(module.id)}
                className={cn(
                  'font-medium',
                  currentModule === module.id && 'shadow-sm'
                )}
              >
                {module.label}
              </Button>
            ))}
          </nav>

          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            className="ml-auto"
          >
            {theme === 'light' ? (
              <Moon className="h-5 w-5" />
            ) : (
              <Sun className="h-5 w-5" />
            )}
          </Button>

          {/* Mobile Menu Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleSidebar}
            className="md:hidden ml-2"
          >
            {sidebarCollapsed ? <Menu className="h-5 w-5" /> : <X className="h-5 w-5" />}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {!sidebarCollapsed && (
          <nav className="md:hidden border-t p-4 space-y-2">
            {modules.map((module) => (
              <Button
                key={module.id}
                variant={currentModule === module.id ? "primary" : "ghost"}
                size="sm"
                onClick={() => {
                  setCurrentModule(module.id);
                  toggleSidebar();
                }}
                className="w-full justify-start"
              >
                {module.label}
              </Button>
            ))}
          </nav>
        )}
      </header>

      {/* Main Content */}
      <main className="container px-4 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t mt-auto">
        <div className="container px-4 py-6 text-center text-sm text-muted-foreground">
          <p>© 2025 Amazon WHS Austria - Safety Analytics Platform v2.0</p>
          <p className="mt-1">Modernized with React, TypeScript, and Intelligent Analytics</p>
        </div>
      </footer>
    </div>
  );
};
