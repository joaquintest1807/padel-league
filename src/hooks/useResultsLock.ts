import { useState } from "react";

const STORAGE_KEY = "padel_results_unlocked";

/**
 * Candado simple (no es seguridad real) para que solo quien conoce el PIN
 * pueda cargar/editar resultados desde su celular. El PIN vive en una
 * variable de entorno (VITE_RESULTS_PIN) — si no esta configurada, no hay
 * candado (todos pueden cargar, como antes). Una vez correcto, el navegador
 * lo recuerda (localStorage) y no vuelve a pedirlo en ese dispositivo.
 */
export function useResultsLock() {
  const correctPin = import.meta.env.VITE_RESULTS_PIN as string | undefined;
  const lockEnabled = !!correctPin;

  const [unlockedFlag, setUnlockedFlag] = useState<boolean>(
    () => localStorage.getItem(STORAGE_KEY) === "true"
  );

  function tryUnlock(pin: string): boolean {
    if (!correctPin) return true;
    const ok = pin === correctPin;
    if (ok) {
      localStorage.setItem(STORAGE_KEY, "true");
      setUnlockedFlag(true);
    }
    return ok;
  }

  return {
    lockEnabled,
    isUnlocked: lockEnabled ? unlockedFlag : true,
    tryUnlock,
  };
}
