import React, { createContext, useContext, useState } from 'react';

export interface Window {
    id: string;
    title: string;
    icon: string;
    component: React.ComponentType<any>;
    minimized: boolean;
    maximized: boolean;
    x: number;
    y: number;
    width: number;
    height: number;
    zIndex: number;
}

interface OSContextType {
    windows: Window[];
    activeWindow: string | null;
    openWindow: (window: Omit<Window, 'id' | 'zIndex'>) => void;
    closeWindow: (id: string) => void;
    minimizeWindow: (id: string) => void;
    maximizeWindow: (id: string) => void;
    setActiveWindow: (id: string) => void;
    moveWindow: (id: string, x: number, y: number) => void;
    resizeWindow: (id: string, width: number, height: number) => void;
}

const OSContext = createContext<OSContextType | undefined>(undefined);

export function OSProvider({ children }: { children: React.ReactNode }) {
    const [windows, setWindows] = useState<Window[]>([]);
    const [activeWindow, setActiveWindow] = useState<string | null>(null);
    const [nextZIndex, setNextZIndex] = useState(100);

    const openWindow = (window: Omit<Window, 'id' | 'zIndex'>) => {
        const id = `window-${Date.now()}`;
        const newWindow: Window = { ...window, id, zIndex: nextZIndex };
        setWindows([...windows, newWindow]);
        setActiveWindow(id);
        setNextZIndex(nextZIndex + 1);
    };

    const closeWindow = (id: string) => {
        setWindows(windows.filter((w) => w.id !== id));
        if (activeWindow === id) { setActiveWindow(null); }
    };

    const minimizeWindow = (id: string) => {
        setWindows(windows.map((w) => w.id === id ? { ...w, minimized: !w.minimized } : w));
    };

    const maximizeWindow = (id: string) => {
        setWindows(windows.map((w) => w.id === id ? { ...w, maximized: !w.maximized } : w));
    };

    const moveWindow = (id: string, x: number, y: number) => {
        setWindows(windows.map((w) => w.id === id ? { ...w, x, y } : w));
    };

    const resizeWindow = (id: string, width: number, height: number) => {
        setWindows(windows.map((w) => w.id === id ? { ...w, width, height } : w));
    };

    const updateActiveWindow = (id: string) => {
        setActiveWindow(id);
        setWindows(windows.map((w) => ({ ...w, zIndex: w.id === id ? nextZIndex : w.zIndex })));
        setNextZIndex(nextZIndex + 1);
    };

    return (
        <OSContext.Provider value={{ windows, activeWindow, openWindow, closeWindow, minimizeWindow, maximizeWindow, setActiveWindow: updateActiveWindow, moveWindow, resizeWindow }}>
            {children}
        </OSContext.Provider>
    );
}

export function useOS() {
    const context = useContext(OSContext);
    if (!context) {
        throw new Error('useOS must be used within OSProvider');
    }
    return context;
}