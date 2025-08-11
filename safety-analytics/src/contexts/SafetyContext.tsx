import React, { createContext, useContext, useReducer, ReactNode } from 'react';

export interface SafetyState {
  injury: {
    rawData: any[];
    filteredData: any[];
    currentPage: number;
    timelinePage: number;
  };
  nearMiss: {
    rawData: any[];
    filteredData: any[];
    currentPage: number;
    timelinePage: number;
  };
  currentModule: string;
  theme: 'light' | 'dark';
  itemsPerPage: number;
}

type SafetyAction =
  | { type: 'SET_INJURY_DATA'; payload: any[] }
  | { type: 'SET_NEAR_MISS_DATA'; payload: any[] }
  | { type: 'APPLY_INJURY_FILTERS'; payload: any[] }
  | { type: 'APPLY_NEAR_MISS_FILTERS'; payload: any[] }
  | { type: 'SET_MODULE'; payload: string }
  | { type: 'TOGGLE_THEME' }
  | { type: 'SET_PAGE'; payload: { module: 'injury' | 'nearMiss'; page: number } }
  | { type: 'SET_TIMELINE_PAGE'; payload: { module: 'injury' | 'nearMiss'; page: number } };

const initialState: SafetyState = {
  injury: {
    rawData: [],
    filteredData: [],
    currentPage: 1,
    timelinePage: 1
  },
  nearMiss: {
    rawData: [],
    filteredData: [],
    currentPage: 1,
    timelinePage: 1
  },
  currentModule: 'overview',
  theme: (localStorage.getItem('theme') as 'light' | 'dark') || 'light',
  itemsPerPage: 15
};

function safetyReducer(state: SafetyState, action: SafetyAction): SafetyState {
  switch (action.type) {
    case 'SET_INJURY_DATA':
      return {
        ...state,
        injury: {
          ...state.injury,
          rawData: action.payload,
          filteredData: action.payload
        }
      };
    case 'SET_NEAR_MISS_DATA':
      return {
        ...state,
        nearMiss: {
          ...state.nearMiss,
          rawData: action.payload,
          filteredData: action.payload
        }
      };
    case 'TOGGLE_THEME':
      const newTheme = state.theme === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme', newTheme);
      document.documentElement.classList.toggle('dark');
      return {
        ...state,
        theme: newTheme
      };
    default:
      return state;
  }
}

const SafetyContext = createContext<any>(undefined);

export function SafetyProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(safetyReducer, initialState);

  return (
    <SafetyContext.Provider value={{ state, dispatch }}>
      {children}
    </SafetyContext.Provider>
  );
}

export function useSafety() {
  const context = useContext(SafetyContext);
  if (!context) {
    throw new Error('useSafety must be used within a SafetyProvider');
  }
  return context;
}
