import React, { useState } from 'react';
import { Box, Typography, Tabs, Tab, Paper, Chip, Skeleton } from '@mui/material';
import ReactJson from '@uiw/react-json-view';
import { useTheme } from '@mui/material/styles';

export function ResponsePane({ response }) {
    const [tabIndex, setTabIndex] = useState(0);
    const theme = useTheme();

    const handleTabChange = (event, newValue) => {
        setTabIndex(newValue);
    };

    if (!response) {
        return (
            <Paper elevation={0} sx={{ borderRadius: 0, overflow: 'hidden', border: '1px solid', borderColor: 'divider', height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ p: 2, display: 'flex', gap: 2, alignItems: 'center', backgroundColor: 'background.paper', borderBottom: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="subtitle1" fontWeight="bold" color="text.disabled">Response</Typography>
                    <Skeleton variant="rounded" width={80} height={24} animation={false} />
                    <Skeleton variant="rounded" width={60} height={24} animation={false} />
                    <Skeleton variant="rounded" width={60} height={24} animation={false} />
                </Box>
                <Box sx={{ borderBottom: 1, borderColor: 'divider', backgroundColor: 'background.paper' }}>
                    <Tabs value={0}>
                        <Tab label="Body" disabled />
                        <Tab label="Headers" disabled />
                    </Tabs>
                </Box>
                <Box sx={{ flexGrow: 1, p: 2, backgroundColor: theme.palette.mode === 'dark' ? '#0a0a0a' : '#f5f5f5' }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, opacity: 0.2 }}>
                        <Skeleton variant="text" width="40%" animation={false} />
                        <Skeleton variant="text" width="80%" animation={false} />
                        <Skeleton variant="text" width="60%" animation={false} />
                        <Skeleton variant="text" width="70%" animation={false} />
                        <Skeleton variant="text" width="50%" animation={false} />
                        <Skeleton variant="text" width="75%" animation={false} />
                    </Box>
                </Box>
            </Paper>
        );
    }

    const { status, statusText, time, size, data, headers, error } = response;

    const getStatusColor = (code) => {
        if (code >= 200 && code < 300) return 'success';
        if (code >= 400 && code < 600) return 'error';
        return 'warning';
    };

    return (
        <Paper elevation={0} sx={{ borderRadius: 0, overflow: 'hidden', border: '1px solid', borderColor: 'divider', height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ p: 2, display: 'flex', gap: 2, alignItems: 'center', backgroundColor: 'background.paper', borderBottom: '1px solid', borderColor: 'divider' }}>
                <Typography variant="subtitle1" fontWeight="bold">Response</Typography>
                <Chip
                    label={`${status} ${statusText || ''}`}
                    color={getStatusColor(status)}
                    size="small"
                    variant="outlined"
                    sx={{ fontWeight: 'bold' }}
                />
                <Chip label={`${time} ms`} size="small" variant="outlined" />
                <Chip label={size} size="small" variant="outlined" />
            </Box>

            <Box sx={{ borderBottom: 1, borderColor: 'divider', backgroundColor: 'background.paper' }}>
                <Tabs value={tabIndex} onChange={handleTabChange}>
                    <Tab label="Body" />
                    <Tab label="Headers" />
                </Tabs>
            </Box>

            <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 2, backgroundColor: theme.palette.mode === 'dark' ? '#0a0a0a' : '#f5f5f5' }}>
                {tabIndex === 0 && (
                    <Box>
                        {error ? (
                            <Typography color="error">{error}</Typography>
                        ) : typeof data === 'object' ? (
                            <ReactJson
                                value={data}
                                className={theme.palette.mode === 'dark' ? 'dark-mode' : ''}
                                style={{
                                    backgroundColor: 'transparent',
                                    '--w-rjv-font-family': 'monospace',
                                    '--w-rjv-color': theme.palette.mode === 'dark' ? '#d4d4d4' : '#1e1e1e',
                                    '--w-rjv-key-string': theme.palette.mode === 'dark' ? '#9cdcfe' : '#001080',
                                    '--w-rjv-background-color': 'transparent',
                                }}
                                collapsed={false}
                            />
                        ) : (
                            <Typography component="pre" sx={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                                {data}
                            </Typography>
                        )}
                    </Box>
                )}
                {tabIndex === 1 && (
                    <Box>
                        {headers && headers.map((h, i) => (
                            <Box key={i} sx={{ display: 'flex', gap: 2, mb: 1 }}>
                                <Typography fontWeight="bold" sx={{ width: 200 }}>{h.key}:</Typography>
                                <Typography sx={{ fontFamily: 'monospace' }}>{h.value}</Typography>
                            </Box>
                        ))}
                    </Box>
                )}
            </Box>
        </Paper>
    );
}
