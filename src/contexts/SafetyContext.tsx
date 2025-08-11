import { createContext, useContext, useReducer, ReactNode, Dispatch } from 'react';
import { SafetyState, InjuryRecord, NearMissRecord, ActionItem, Module } from '../types';

type SafetyAction =
  | { type: 'SET_INJURY_DATA'; payload: InjuryRecord[] }
  | { type: 'SET_NEARMISS_DATA'; payload: NearMissRecord[] }
  | { type: 'SET_FILTERED_INJURY'; payload: InjuryRecord[] }
  | { type: 'SET_FILTERED_NEARMISS'; payload: NearMissRecord[] }
  | { type: 'ADD_ACTION'; payload: ActionItem }
  | { type: 'UPDATE_ACTION'; payload: ActionItem }
  | { type: 'DELETE_ACTION'; payload: string }
  | { type: 'SET_MODULE'; payload: Module }
  | { type: 'SET_PAGE'; module: 'injury' | 'nearMiss'; page: number }
  | { type: 'SET_FILTERS'; payload: Record<string, any> }
  | { type: 'TOGGLE_THEME' }
  | { type: 'CLEAR_DATA' };

interface SafetyContextType {
  state: SafetyState;
  dispatch: Dispatch<SafetyAction>;
}

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
  actions: [],
  currentModule: 'overview',
  theme: (localStorage.getItem('theme') as 'light' | 'dark') || 'light',
  itemsPerPage: 15,
  filters: {}
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
    
    case 'SET_NEARMISS_DATA':
      return {
        ...state,
        nearMiss: {
          ...state.nearMiss,
          rawData: action.payload,
          filteredData: action.payload
        }
      };
    
    case 'SET_FILTERED_INJURY':
      return {
        ...state,
        injury: {
          ...state.injury,
          filteredData: action.payload,
          currentPage: 1
        }
      };
    
    case 'SET_FILTERED_NEARMISS':
      return {
        ...state,
        nearMiss: {
          ...state.nearMiss,
          filteredData: action.payload,
          currentPage: 1
        }
      };
    
    case 'ADD_ACTION':
      return {
        ...state,
        actions: [...state.actions, action.payload]
      };
    
    case 'UPDATE_ACTION':
      return {
        ...state,
        actions: state.actions.map(a => 
          a.id === action.payload.id ? action.payload : a
        )
      };
    
    case 'DELETE_ACTION':
      return {
        ...state,
        actions: state.actions.filter(a => a.id !== action.payload)
      };
    
    case 'SET_MODULE':
      return {
        ...state,
        currentModule: action.payload
      };
    
    case 'SET_PAGE':
      if (action.module === 'injury') {
        return {
          ...state,
          injury: {
            ...state.injury,
            currentPage: action.page
          }
        };
      } else {
        return {
          ...state,
          nearMiss: {
            ...state.nearMiss,
            currentPage: action.page
          }
        };
      }
    
    case 'SET_FILTERS':
      return {
        ...state,
        filters: action.payload
      };
    
    case 'TOGGLE_THEME':
      const newTheme = state.theme === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme', newTheme);
      document.documentElement.setAttribute('data-theme', newTheme);
      return {
        ...state,
        theme: newTheme
      };
    
    case 'CLEAR_DATA':
      return {
        ...state,
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
        actions: [],
        filters: {}
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
