// src/components/PortalWrapper.tsx
"use client";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export default function PortalWrapper({ children }: { children: React.ReactNode }) {
    const [mounted, setMounted] = useState(false);
    const el = useRef<HTMLElement | null>(null);

    useEffect(() => {
        el.current = document.createElement("div");
        document.body.appendChild(el.current);
        setMounted(true);
        return () => {
            if (el.current) document.body.removeChild(el.current);
        };
    }, []);

    return mounted && el.current ? createPortal(children, el.current) : null;
}
