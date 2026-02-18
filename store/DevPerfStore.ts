import { create } from "zustand";

type DevPerfState = {
  disableMemoization: boolean;
  setDisableMemoization: (value: boolean) => void;
  toggleDisableMemoization: () => void;
};

export const useDevPerfStore = create<DevPerfState>()((set) => ({
  disableMemoization: false,
  setDisableMemoization: (value) => set({ disableMemoization: value }),
  toggleDisableMemoization: () =>
    set((state) => ({ disableMemoization: !state.disableMemoization })),
}));
