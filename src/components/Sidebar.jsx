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
                        history.map((item, index) => (
                            <ListItemButton
                                key={index}
                                onClick={() => onRequestSelect(item.request)}
                                sx={{ borderBottom: '1px solid', borderColor: 'divider', flexDirection: 'column', alignItems: 'flex-start', p: 1.5, position: 'relative' }}
                            >
                                <IconButton
                                    size="small"
                                    color="error"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onDeleteRequest(index);
                                    }}
                                    sx={{ position: 'absolute', top: 4, right: 4 }}
                                >
                                    <DeleteIcon sx={{ fontSize: 16 }} />
                                </IconButton>
                                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 0.5, width: '100%', pr: 3 }}>
                                    <Chip label={item.request.method} size="small" color={getMethodColor(item.request.method)} sx={{ fontWeight: 'bold', fontSize: '0.7rem', height: 20 }} />
                                    <Typography variant="caption" color="text.secondary">
                                        {new Date(item.timestamp).toLocaleTimeString()}
                                    </Typography>
                                </Box>
                                <Typography variant="body2" noWrap sx={{ width: '100%', fontWeight: 500 }}>
                                    {item.request.url || 'Empty URL'}
                                </Typography>
                            </ListItemButton>
                        ))
                    )}
                </List>
            </Box>
        </Paper>
    );
}
