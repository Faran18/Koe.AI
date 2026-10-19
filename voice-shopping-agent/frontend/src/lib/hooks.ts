"use client";
import { useEffect, useState } from "react";
/** True after mount. Persisted stores read localStorage, so gate their output on this. */
export function useHydrated() { const [h, setH] = useState(false); useEffect(() => setH(true), []); return h; }
