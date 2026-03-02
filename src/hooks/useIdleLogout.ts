"use client";

/**
 * useIdleLogout - Hook de logout automático por inatividade (RNF-004)
 * Monitora atividade do usuário e executa callback após timeout
 */
import { useEffect, useRef, useCallback } from "react";

const IDLE_EVENTS: (keyof WindowEventMap)[] = [
    "mousemove",
    "keydown",
    "click",
    "scroll",
    "touchstart",
];

/** Tempo padrão de inatividade: 15 minutos */
const DEFAULT_TIMEOUT_MS = 15 * 60 * 1000;

interface UseIdleLogoutOptions {
    /** Timeout em ms (padrão: 15 min) */
    timeoutMs?: number;
    /** Callback executado ao atingir inatividade */
    onIdle: () => void;
    /** Se o hook está habilitado (ex: só quando autenticado) */
    enabled?: boolean;
}

export function useIdleLogout({
    timeoutMs = DEFAULT_TIMEOUT_MS,
    onIdle,
    enabled = true,
}: UseIdleLogoutOptions): void {
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const onIdleRef = useRef(onIdle);
    onIdleRef.current = onIdle;

    const resetTimer = useCallback(() => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
        }
        timerRef.current = setTimeout(() => {
            onIdleRef.current();
        }, timeoutMs);
    }, [timeoutMs]);

    useEffect(() => {
        if (!enabled) return;

        // Inicializa o timer
        resetTimer();

        // Adiciona listeners de atividade
        const handleActivity = () => resetTimer();
        IDLE_EVENTS.forEach((event) =>
            window.addEventListener(event, handleActivity, { passive: true })
        );

        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
            IDLE_EVENTS.forEach((event) =>
                window.removeEventListener(event, handleActivity)
            );
        };
    }, [enabled, resetTimer]);
}
