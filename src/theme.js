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
                        main: '#8b5cf6', // Stitch purple
                    },
                    secondary: {
                        main: '#f50057',
                    },
                    background: {
                        default: mode === 'dark' ? '#0a0a0c' : '#f5f8f7',
                        paper: mode === 'dark' ? '#16161e' : '#ffffff',
                    },
                    divider: mode === 'dark' ? '#2d2d3a' : 'rgba(0,0,0,0.12)',
                    text: {
                        primary: mode === 'dark' ? '#f1f5f9' : '#0f172a',
                        secondary: mode === 'dark' ? '#94a3b8' : '#64748b',
                    }
                },
                typography: {
                    fontFamily: '"Space Grotesk", sans-serif',
                    button: {
                        textTransform: 'none',
                        fontWeight: 700,
                    },
                    subtitle1: {
                        fontWeight: 600,
                    },
                    body2: {
                        fontSize: '0.875rem',
                    }
                },
                shape: {
                    borderRadius: 8,
                },
                components: {
                    MuiButton: {
                        styleOverrides: {
                            root: {
                                boxShadow: 'none',
                                borderRadius: 8,
                                padding: '8px 16px',
                                '&:hover': {
                                    boxShadow: 'none',
                                },
                            },
                        },
                    },
                    MuiTextField: {
                        defaultProps: {
                            variant: 'outlined',
                            size: 'small',
                        },
                        styleOverrides: {
                            root: {
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 8,
                                    backgroundColor: mode === 'dark' ? 'rgba(0,0,0,0.2)' : 'transparent',
                                }
                            }
                        }
                    },
                    MuiSelect: {
                        styleOverrides: {
                            root: {
                                borderRadius: 8,
                            }
                        }
                    },
                    MuiTab: {
                        styleOverrides: {
                            root: {
                                textTransform: 'none',
                                fontWeight: 600,
                                minWidth: 100,
                            }
                        }
                    },
                    MuiPaper: {
                        styleOverrides: {
                            root: {
                                backgroundImage: 'none',
                            }
                        }
                    }
                },
            }),
        [mode]
    );

    return { colorMode, theme, mode };
}
