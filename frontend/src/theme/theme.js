import { createTheme } from '@mui/material/styles';

const getTheme = (mode) => {
    const isDark = mode === 'dark';

    return createTheme({
        spacing: 8,
        palette: {
            mode,
            primary: {
                main: '#50C878',
                light: '#72D694',
                dark: '#0B6E4F',
                contrastText: '#ffffff',
            },
            secondary: {
                main: '#0B6E4F',
                light: '#148F66',
                dark: '#074D36',
                contrastText: '#ffffff',
            },
            background: {
                default: isDark ? '#0f172a' : '#D1F2EB',
                paper: isDark ? '#1e293b' : '#ffffff',
            },
            text: {
                primary: isDark ? '#f1f5f9' : '#0f172a',
                secondary: isDark ? '#94a3b8' : '#64748b',
                disabled: isDark ? '#475569' : '#cbd5e1',
            },
            divider: isDark ? '#334155' : '#e2e8f0',
            action: {
                active: isDark ? '#94a3b8' : '#64748b',
                hover: isDark ? 'rgba(148, 163, 184, 0.08)' : 'rgba(100, 116, 139, 0.04)',
                selected: isDark ? 'rgba(148, 163, 184, 0.16)' : 'rgba(100, 116, 139, 0.08)',
                disabled: isDark ? 'rgba(148, 163, 184, 0.3)' : 'rgba(100, 116, 139, 0.3)',
                disabledBackground: isDark ? 'rgba(148, 163, 184, 0.12)' : 'rgba(100, 116, 139, 0.12)',
            },
        },
        typography: {
            fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
            h1: {
                fontSize: '2.5rem',
                fontWeight: 700,
                lineHeight: 1.2,
                letterSpacing: '-0.02em',
            },
            h2: {
                fontSize: '2rem',
                fontWeight: 700,
                lineHeight: 1.3,
                letterSpacing: '-0.01em',
            },
            h3: {
                fontSize: '1.75rem',
                fontWeight: 600,
                lineHeight: 1.3,
            },
            h4: {
                fontSize: '1.5rem',
                fontWeight: 600,
                lineHeight: 1.4,
            },
            h5: {
                fontSize: '1.25rem',
                fontWeight: 600,
                lineHeight: 1.4,
            },
            h6: {
                fontSize: '1.125rem',
                fontWeight: 600,
                lineHeight: 1.4,
            },
            subtitle1: {
                fontSize: '1rem',
                fontWeight: 500,
                lineHeight: 1.5,
            },
            subtitle2: {
                fontSize: '0.875rem',
                fontWeight: 500,
                lineHeight: 1.5,
            },
            body1: {
                fontSize: '1rem',
                lineHeight: 1.6,
            },
            body2: {
                fontSize: '0.875rem',
                lineHeight: 1.6,
            },
            button: {
                textTransform: 'none',
                fontWeight: 500,
                fontSize: '0.9375rem',
            },
            caption: {
                fontSize: '0.75rem',
                lineHeight: 1.5,
            },
            overline: {
                fontSize: '0.75rem',
                fontWeight: 600,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
            },
        },
        shape: {
            borderRadius: 12,
        },
        shadows: [
            'none',
            isDark ? '0 1px 2px 0 rgba(0, 0, 0, 0.5)' : '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
            isDark ? '0 1px 3px 0 rgba(0, 0, 0, 0.5), 0 1px 2px -1px rgba(0, 0, 0, 0.5)' : '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
            isDark ? '0 4px 6px -1px rgba(0, 0, 0, 0.5), 0 2px 4px -2px rgba(0, 0, 0, 0.5)' : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
            isDark ? '0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 4px 6px -4px rgba(0, 0, 0, 0.5)' : '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
            isDark ? '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5)' : '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
            ...Array(19).fill('none'),
        ],
        components: {
            MuiCssBaseline: {
                styleOverrides: {
                    body: {
                        scrollbarWidth: 'thin',
                        scrollbarColor: isDark ? '#475569 #1e293b' : '#cbd5e1 #f8fafc',
                        WebkitFontSmoothing: 'antialiased',
                        MozOsxFontSmoothing: 'grayscale',
                        '&::-webkit-scrollbar': {
                            width: '8px',
                            height: '8px',
                        },
                        '&::-webkit-scrollbar-track': {
                            background: isDark ? '#1e293b' : '#f8fafc',
                        },
                        '&::-webkit-scrollbar-thumb': {
                            background: isDark ? '#475569' : '#cbd5e1',
                            borderRadius: '4px',
                            '&:hover': {
                                background: isDark ? '#64748b' : '#94a3b8',
                            },
                        },
                    },
                },
            },
            MuiButton: {
                defaultProps: {
                    disableElevation: true,
                },
                styleOverrides: {
                    root: {
                        borderRadius: 10,
                        padding: '10px 20px',
                        fontWeight: 500,
                        boxShadow: 'none',
                        '&:hover': {
                            boxShadow: 'none',
                        },
                    },
                    contained: {
                        '&:hover': {
                            transform: 'translateY(-1px)',
                            transition: 'transform 0.2s ease-in-out',
                        },
                    },
                    sizeSmall: {
                        padding: '6px 14px',
                        fontSize: '0.8125rem',
                    },
                    sizeLarge: {
                        padding: '12px 24px',
                        fontSize: '1rem',
                    },
                },
            },
            MuiCard: {
                styleOverrides: {
                    root: {
                        borderRadius: 16,
                        boxShadow: isDark
                            ? '0 4px 6px -1px rgba(0, 0, 0, 0.5), 0 2px 4px -2px rgba(0, 0, 0, 0.5)'
                            : '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
                        border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
                        transition: 'box-shadow 0.3s ease-in-out, transform 0.2s ease-in-out',
                        '&:hover': {
                            boxShadow: isDark
                                ? '0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 4px 6px -4px rgba(0, 0, 0, 0.5)'
                                : '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
                        },
                    },
                },
            },
            MuiCardHeader: {
                styleOverrides: {
                    root: {
                        padding: '20px 24px 12px',
                    },
                    action: {
                        marginTop: 0,
                    },
                },
            },
            MuiCardContent: {
                styleOverrides: {
                    root: {
                        padding: 24,
                        '&:last-child': {
                            paddingBottom: 24,
                        },
                    },
                },
            },
            MuiPaper: {
                styleOverrides: {
                    root: {
                        backgroundImage: 'none',
                    },
                    elevation1: {
                        boxShadow: isDark
                            ? '0 1px 3px 0 rgba(0, 0, 0, 0.5), 0 1px 2px -1px rgba(0, 0, 0, 0.5)'
                            : '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
                    },
                },
            },
            MuiTextField: {
                styleOverrides: {
                    root: {
                        '& .MuiOutlinedInput-root': {
                            borderRadius: 10,
                            '&:hover fieldset': {
                                borderColor: isDark ? '#475569' : '#cbd5e1',
                            },
                        },
                    },
                },
            },
            MuiOutlinedInput: {
                styleOverrides: {
                    root: {
                        borderRadius: 10,
                    },
                    input: {
                        paddingTop: 12,
                        paddingBottom: 12,
                    },
                },
            },
            MuiDialog: {
                styleOverrides: {
                    paper: {
                        borderRadius: 16,
                        boxShadow: isDark
                            ? '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5)'
                            : '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                    },
                },
            },
            MuiChip: {
                styleOverrides: {
                    root: {
                        borderRadius: 8,
                        fontWeight: 500,
                        fontSize: '0.8125rem',
                    },
                },
            },
            MuiTableContainer: {
                styleOverrides: {
                    root: {
                        borderRadius: 16,
                    },
                },
            },
            MuiTableCell: {
                styleOverrides: {
                    root: {
                        borderBottom: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
                    },
                    head: {
                        fontWeight: 600,
                        backgroundColor: isDark ? '#1e293b' : '#f8fafc',
                        color: isDark ? '#f1f5f9' : '#0f172a',
                    },
                },
            },
            MuiTableRow: {
                styleOverrides: {
                    root: {
                        '&:last-child td, &:last-child th': {
                            borderBottom: 0,
                        },
                    },
                },
            },
            MuiDrawer: {
                styleOverrides: {
                    paper: {
                        borderRight: 'none',
                        backgroundColor: isDark ? '#1e293b' : '#ffffff',
                        boxShadow: isDark
                            ? '4px 0 6px -1px rgba(0, 0, 0, 0.5)'
                            : '4px 0 6px -1px rgba(0, 0, 0, 0.1)',
                    },
                },
            },
            MuiAppBar: {
                styleOverrides: {
                    root: {
                        boxShadow: 'none',
                        borderBottom: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
                    },
                },
            },
            MuiMenu: {
                styleOverrides: {
                    paper: {
                        borderRadius: 14,
                        border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
                    },
                    list: {
                        paddingTop: 8,
                        paddingBottom: 8,
                    },
                },
            },
            MuiTooltip: {
                styleOverrides: {
                    tooltip: {
                        backgroundColor: isDark ? '#334155' : '#0f172a',
                        fontSize: '0.8125rem',
                        borderRadius: 8,
                        padding: '8px 12px',
                    },
                },
            },
            MuiSkeleton: {
                styleOverrides: {
                    root: {
                        backgroundColor: isDark ? 'rgba(148, 163, 184, 0.11)' : 'rgba(100, 116, 139, 0.11)',
                    },
                },
            },
        },
    });
};

export default getTheme;
