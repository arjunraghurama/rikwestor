import { useState, useMemo, createContext } from 'react';
import { createTheme } from '@mui/material';

export const ColorModeContext = createContext({ toggleColorMode: () => { } });

export function useColorTheme() {
    const [mode, setMode] = useState('dark');

    const colorMode = useMemo(
        () => ({
            toggleColorMode: () => {
                setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
            },
        }),
        []
    );

    const theme = useMemo(
        () =>
            createTheme({
                palette: {
                    mode,
                    primary: {
                        main: '#00d084', // Mint green, similar to postman/httpie accents
                    },
                    secondary: {
                        main: '#f50057',
                    },
                    background: {
                        default: mode === 'dark' ? '#000000' : '#f4f6f8',
                        paper: mode === 'dark' ? '#111111' : '#ffffff',
                    },
                },
                typography: {
                    fontFamily: '"Roboto Mono", "Roboto", "Inter", "Helvetica", "Arial", sans-serif',
                    button: {
                        textTransform: 'none',
                        fontWeight: 600,
                    },
                },
                shape: {
                    borderRadius: 12,
                },
                components: {
                    MuiButton: {
                        styleOverrides: {
                            root: {
                                boxShadow: 'none',
                            },
                        },
                    },
                    MuiTextField: {
                        defaultProps: {
                            variant: 'outlined',
                            size: 'small',
                        },
                    },
                },
            }),
        [mode]
    );

    return { colorMode, theme, mode };
}
