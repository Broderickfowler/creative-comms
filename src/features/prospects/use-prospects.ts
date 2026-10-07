"use client";
import { useEffect, useSyncExternalStore } from "react";
import {
  getSnapshot,
  getServerSnapshot,
  initializeStore,
  subscribe,
  refreshStore,
  STORAGE_KEY,
} from "@/services/prospect-store";
export function useProspects() {
  const store = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  useEffect(() => {
    initializeStore();
    const onStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY || event.key === null) refreshStore();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);
  return store;
}
