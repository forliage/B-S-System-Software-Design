import React, { createContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    // Default theme state
    const [themeColor, setThemeColor] = useState('blue'); // blue, purple, rose, emerald, amber
    const [isGlass, setIsGlass] = useState(false);

    // Load from local storage
    useEffect(() => {
        const savedColor = localStorage.getItem('themeColor');
        const savedGlass = localStorage.getItem('isGlass');
        if (savedColor) setThemeColor(savedColor);
        if (savedGlass) setIsGlass(savedGlass === 'true');
    }, []);

    const changeThemeColor = (color) => {
        setThemeColor(color);
        localStorage.setItem('themeColor', color);
    };

    const toggleGlass = () => {
        const newState = !isGlass;
        setIsGlass(newState);
        localStorage.setItem('isGlass', newState);
    };

    // Helper to get active classes based on state
    const getGlassClasses = (baseOpacity = 'bg-white') => {
        return isGlass
            ? 'backdrop-blur-md bg-white/70 border border-white/20 shadow-xl'
            : `${baseOpacity} shadow-md border-transparent`;
    };

    const value = {
        themeColor,
        isGlass,
        changeThemeColor,
        toggleGlass,
        getGlassClasses
    };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};

export default ThemeContext;
