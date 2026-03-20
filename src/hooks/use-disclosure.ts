"use client";

import { useCallback, useMemo, useState } from "react";

export type DisclosureApi = {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
};

/** Ouvre / ferme un panneau (modale, drawer, etc.) sans multiplier les useState(bool). */
export function useDisclosure(defaultOpen = false): DisclosureApi {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((o) => !o), []);
  return useMemo(
    () => ({ isOpen, open, close, toggle }),
    [isOpen, open, close, toggle]
  );
}
