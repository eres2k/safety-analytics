import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { SafetyState, InjuryRecord, NearMissRecord, Module } from '../types';

interface SafetyContextType {
  state: SafetyState;
  dispatch: React.Dispatch<SafetyAction>;
}

type SafetyAction =
  | { type: 'SET_INJURY_DATA'; payload: InjuryRecord[] }
  | { type: 'SET_NEAR_MISS_DATA'; payload: NearMissRecord[] }
  | { type: 'APPLY_INJURY_FILTERS'; payload: InjuryRecord[] }
  | { type: 'APPLY_NEAR_MISS_FILTERS'; payload: NearMissRecord[] }
  | { type: 'SET_MODULE'; payload: Module }
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
    case 'APPLY_INJURY_FILTERS':
      return {
        ...state,
        injury: {
          ...state.injury,
          filteredData: action.payload,
          currentPage: 1
        }
      };
    case 'APPLY_NEAR_MISS_FILTERS':
      return {
        ...state,
        nearMiss: {
          ...state.nearMiss,
          filteredData: action.payload,
          currentPage: 1
        }
      };
    case 'SET_MODULE':
      return {
        ...state,
        currentModule: action.payload
      };
    case 'TOGGLE_THEME':
      const newTheme = state.theme === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme', newTheme);
      document.documentElement.classList.toggle('dark');
      return {
        ...state,
        theme: newTheme
      };
    case 'SET_PAGE':
      return {
        ...state,
        [action.payload.module]: {
          ...state[action.payload.module],
          currentPage: action.payload.page
        }
      };
    case 'SET_TIMELINE_PAGE':
      return {
        ...state,
        [action.payload.module]: {
          ...state[action.payload.module],
          timelinePage: action.payload.page
        }
      };
    default:
      return state;
  }
}

const SafetyContext = createContext<SafetyContextType | undefined>(undefined);

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
