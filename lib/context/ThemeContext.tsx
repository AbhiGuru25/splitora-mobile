import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme as useNativeColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextType {
    themeMode: ThemeMode;
    setThemeMode: (mode: ThemeMode) => void;
    activeColorScheme: 'light' | 'dark';
}

const ThemeContext = createContext<ThemeContextType>({
    themeMode: 'system',
    setThemeMode: () => { },
    activeColorScheme: 'dark',
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const systemColorScheme = useNativeColorScheme();
    const [themeMode, setThemeMode] = useState<ThemeMode>('system');
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        loadThemePreference();
    }, []);

    const loadThemePreference = async () => {
        try {
            const savedTheme = await AsyncStorage.getItem('theme_mode');
            if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark' || savedTheme === 'system')) {
                setThemeMode(savedTheme as ThemeMode);
            }
        } catch (error) {
            console.error('Failed to load theme preference:', error);
        } finally {
            setLoaded(true);
        }
    };

    const saveThemePreference = async (mode: ThemeMode) => {
        try {
            await AsyncStorage.setItem('theme_mode', mode);
            setThemeMode(mode);
        } catch (error) {
            console.error('Failed to save theme preference:', error);
        }
    };

    const activeColorScheme =
        themeMode === 'system'
            ? (systemColorScheme ?? 'dark')
            : themeMode;

    if (!loaded) {
        return null;
    }

    return (
        <ThemeContext.Provider value={{
            themeMode,
            setThemeMode: saveThemePreference,
            activeColorScheme
        }}>
            {children}
        </ThemeContext.Provider>
    );
}

export const useTheme = () => useContext(ThemeContext);
