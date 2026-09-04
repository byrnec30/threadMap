import { useSyncExternalStore } from "react";

type DevPerfState = {
  disableMemoization: boolean;
  setDisableMemoization: (value: boolean) => void;
  toggleDisableMemoization: () => void;
};

type Selector<T> = (state: DevPerfState) => T;
type Listener = () => void;
type DevPerfStoreHook = {
  <T>(selector: Selector<T>): T;
  getState: () => DevPerfState;
};

const listeners = new Set<Listener>();

function emitChange(): void {
  listeners.forEach((listener) => {
    listener();
  });
}

function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function setDisableMemoization(value: boolean): void {
  if (state.disableMemoization === value) {
    return;
  }

  state = {
    ...state,
    disableMemoization: value,
  };
  emitChange();
}

function toggleDisableMemoization(): void {
  setDisableMemoization(!state.disableMemoization);
}

let state: DevPerfState = {
  disableMemoization: false,
  setDisableMemoization,
  toggleDisableMemoization,
};

export const useDevPerfStore = ((selector) =>
  useSyncExternalStore(
    subscribe,
    () => selector(state),
    () => selector(state)
  )) as DevPerfStoreHook;

useDevPerfStore.getState = () => state;
