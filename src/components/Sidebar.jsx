import React from 'react';
import { Box, Typography, List, ListItem, ListItemButton, ListItemText, Paper, Chip, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

export function Sidebar({ history, onRequestSelect, onDeleteRequest }) {
    const getMethodColor = (method) => {
        switch (method) {
            case 'GET': return 'success';
            case 'POST': return 'warning';
            case 'DELETE': return 'error';
            case 'PUT': return 'secondary';
            case 'PATCH': return 'info';
            default: return 'default';
        }
    };

    return (
        <Paper elevation={0} sx={{
            width: '100%',
            height: '100%',
            borderRadius: 0,
            overflow: 'hidden',
            border: '1px solid',
            borderColor: 'divider',
            display: 'flex',
            flexDirection: 'column'
        }}>
            <Box sx={{ p: 2, display: 'flex', alignItems: 'center', backgroundColor: 'background.paper', borderBottom: '1px solid', borderColor: 'divider', height: 73 }}>
                <Typography variant="subtitle1" fontWeight="bold">History</Typography>
            </Box>
            <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
                <List disablePadding>
                    {history.length === 0 ? (
                        <ListItem>
                            <ListItemText preview="" primary={<Typography variant="body2" color="text.secondary">No requests yet</Typography>} />
                        </ListItem>
                    ) : (
                        history.map((item, index) => {
                            const methodColors = {
                                'GET': '#3b82f6', // blue-500
                                'POST': '#22c55e', // green-500
                                'PUT': '#f97316', // orange-500
                                'DELETE': '#ef4444', // red-500
                                'PATCH': '#eab308' // yellow-500
                            };
                            return (
                                <ListItemButton
                                    key={index}
                                    onClick={() => onRequestSelect(item.request)}
                                    sx={{
                                        borderBottom: '1px solid',
                                        borderColor: 'divider',
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        gap: 2,
                                        p: 1.5,
                                        px: 3,
                                        position: 'relative',
                                        '&:hover': {
                                            bgcolor: 'rgba(255,255,255,0.05)'
                                        }
                                    }}
                                >
                                    <Typography
                                        variant="caption"
                                        sx={{
                                            fontWeight: 700,
                                            fontSize: '10px',
                                            width: 40,
                                            color: methodColors[item.request.method] || '#94a3b8'
                                        }}
                                    >
                                        {item.request.method}
                                    </Typography>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, overflow: 'hidden' }}>
                                        <Typography variant="body2" noWrap sx={{ fontWeight: 500, fontSize: '0.75rem', color: 'text.primary' }}>
                                            {item.request.url || 'Empty URL'}
                                        </Typography>
                                    </Box>
                                    <IconButton
                                        size="small"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onDeleteRequest(index);
                                        }}
                                        sx={{ color: 'text.secondary', '&:hover': { color: '#ef4444' }, p: 0.5 }}
                                    >
                                        <DeleteIcon sx={{ fontSize: 16 }} />
                                    </IconButton>
                                </ListItemButton>
                            );
                        })
                    )}
                </List>
            </Box>
        </Paper>
    );
}
