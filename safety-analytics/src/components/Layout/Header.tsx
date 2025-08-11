import React from 'react';
import { useSafety } from '../../contexts/SafetyContext';

export default function Header() {
  const { state, dispatch } = useSafety();

  const toggleTheme = () => {
    dispatch({ type: 'TOGGLE_THEME' });
  };

  return (
    <header className="bg-gradient-to-r from-amazon-dark to-amazon-gray text-white sticky top-0 z-50 shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <div className="flex flex-col">
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <span>🛡️</span>
              Safety Analytics Platform
            </h1>
            <div className="text-sm opacity-90 flex items-center gap-2">
              <span>Amazon WHS Austria</span>
              <span className="opacity-70">|</span>
              <span>Developed by Erwin Esener</span>
            </div>
          </div>
          <button
            onClick={toggleTheme}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full hover:bg-white/20 transition-all"
          >
            {state.theme === 'light' ? '🌙 Dark Mode' : '☀️ Light Mode'}
          </button>
        </div>
      </div>
    </header>
  );
}
