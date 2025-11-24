/**
 * Global State Management with Zustand
 * Manages all application state with persistence
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type {
  AppState,
  InjuryRecord,
  NearMissRecord,
  InspectionRecord,
  ActionItem,
  FilterState,
  ModuleName,
  InjurySubView,
  NearMissSubView,
} from '@/types';

interface AppStore extends AppState {
  // Actions - Data
  setInjuries: (injuries: InjuryRecord[]) => void;
  setNearMisses: (nearMisses: NearMissRecord[]) => void;
  setInspections: (inspections: InspectionRecord[]) => void;
  setActions: (actions: ActionItem[]) => void;

  // Actions - Filters
  setInjuryFilters: (filters: Partial<FilterState>) => void;
  setNearMissFilters: (filters: Partial<FilterState>) => void;
  setInspectionFilters: (filters: Partial<FilterState>) => void;
  resetFilters: (module: 'injury' | 'nearMiss' | 'inspection') => void;

  // Actions - UI
  setCurrentModule: (module: ModuleName) => void;
  setInjurySubView: (view: InjurySubView) => void;
  setNearMissSubView: (view: NearMissSubView) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  toggleSidebar: () => void;

  // Actions - Pagination
  setInjuryPage: (page: number) => void;
  setNearMissPage: (page: number) => void;
  setInspectionPage: (page: number) => void;
  setItemsPerPage: (items: number) => void;

  // Actions - Loading
  setLoading: (module: keyof AppState['loading'], loading: boolean) => void;

  // Actions - Clear
  clearAllData: () => void;
}

const defaultFilterState: FilterState = {
  site: [],
  severity: [],
  dateRange: { start: null, end: null },
  bodyPart: [],
  location: [],
  processPath: [],
  category: [],
  status: [],
  searchQuery: '',
};

const initialState: AppState = {
  injuries: [],
  nearMisses: [],
  inspections: [],
  actions: [],
  filteredInjuries: [],
  filteredNearMisses: [],
  filteredInspections: [],
  currentModule: 'overview',
  injurySubView: 'dashboard',
  nearMissSubView: 'dashboard',
  theme: 'light',
  sidebarCollapsed: false,
  injuryFilters: defaultFilterState,
  nearMissFilters: defaultFilterState,
  inspectionFilters: defaultFilterState,
  injuryPage: 1,
  nearMissPage: 1,
  inspectionPage: 1,
  itemsPerPage: 20,
  loading: {
    injuries: false,
    nearMisses: false,
    inspections: false,
    reports: false,
  },
  injuryQuality: null,
  nearMissQuality: null,
};

export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      ...initialState,

      // Data actions
      setInjuries: (injuries) =>
        set(() => ({
          injuries,
          filteredInjuries: injuries,
        })),

      setNearMisses: (nearMisses) =>
        set(() => ({
          nearMisses,
          filteredNearMisses: nearMisses,
        })),

      setInspections: (inspections) =>
        set(() => ({
          inspections,
          filteredInspections: inspections,
        })),

      setActions: (actions) =>
        set(() => ({ actions })),

      // Filter actions
      setInjuryFilters: (filters) =>
        set((state) => ({
          injuryFilters: { ...state.injuryFilters, ...filters },
        })),

      setNearMissFilters: (filters) =>
        set((state) => ({
          nearMissFilters: { ...state.nearMissFilters, ...filters },
        })),

      setInspectionFilters: (filters) =>
        set((state) => ({
          inspectionFilters: { ...state.inspectionFilters, ...filters },
        })),

      resetFilters: (module) =>
        set((state) => {
          if (module === 'injury') {
            return {
              injuryFilters: defaultFilterState,
              filteredInjuries: state.injuries,
            };
          } else if (module === 'nearMiss') {
            return {
              nearMissFilters: defaultFilterState,
              filteredNearMisses: state.nearMisses,
            };
          } else {
            return {
              inspectionFilters: defaultFilterState,
              filteredInspections: state.inspections,
            };
          }
        }),

      // UI actions
      setCurrentModule: (module) =>
        set(() => ({ currentModule: module })),

      setInjurySubView: (view) =>
        set(() => ({ injurySubView: view })),

      setNearMissSubView: (view) =>
        set(() => ({ nearMissSubView: view })),

      setTheme: (theme) =>
        set(() => {
          // Update document class for Tailwind dark mode
          if (theme === 'dark') {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
          return { theme };
        }),

      toggleSidebar: () =>
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

      // Pagination actions
      setInjuryPage: (page) =>
        set(() => ({ injuryPage: page })),

      setNearMissPage: (page) =>
        set(() => ({ nearMissPage: page })),

      setInspectionPage: (page) =>
        set(() => ({ inspectionPage: page })),

      setItemsPerPage: (items) =>
        set(() => ({ itemsPerPage: items })),

      // Loading actions
      setLoading: (module, loading) =>
        set((state) => ({
          loading: { ...state.loading, [module]: loading },
        })),

      // Clear all data
      clearAllData: () =>
        set(() => ({
          injuries: [],
          nearMisses: [],
          inspections: [],
          actions: [],
          filteredInjuries: [],
          filteredNearMisses: [],
          filteredInspections: [],
          injuryQuality: null,
          nearMissQuality: null,
        })),
    }),
    {
      name: 'safety-analytics-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        theme: state.theme,
        itemsPerPage: state.itemsPerPage,
        sidebarCollapsed: state.sidebarCollapsed,
      }),
    }
  )
);

// Selectors for derived state
export const selectSafetyKPIs = (state: AppStore) => {
  // Will be calculated on-the-fly
  return {
    injuries: state.filteredInjuries,
    nearMisses: state.filteredNearMisses,
  };
};

export const selectFilteredData = (state: AppStore, module: 'injury' | 'nearMiss' | 'inspection') => {
  if (module === 'injury') return state.filteredInjuries;
  if (module === 'nearMiss') return state.filteredNearMisses;
  return state.filteredInspections;
};

export const selectCurrentData = (state: AppStore) => {
  const module = state.currentModule;
  if (module === 'injury') return state.filteredInjuries;
  if (module === 'nearMiss') return state.filteredNearMisses;
  if (module === 'inspections') return state.filteredInspections;
  return [];
};
