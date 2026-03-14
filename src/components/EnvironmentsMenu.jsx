import React, { useState } from 'react';
import {
    Box, Button, Menu, MenuItem, IconButton, Typography,
    Dialog, DialogTitle, DialogContent, DialogActions, TextField,
    Divider, Tooltip
} from '@mui/material';
import StorageIcon from '@mui/icons-material/Storage';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

export function EnvironmentsMenu({ environments, activeEnvId, setEnvironments, setActiveEnvId, isDarkMode }) {
    const [anchorEl, setAnchorEl] = useState(null);
    const [dialogOpen, setDialogOpen] = useState(false);

    // Local state for editing environments in the dialog
    const [editingEnvs, setEditingEnvs] = useState([]);

    const handleOpenMenu = (event) => setAnchorEl(event.currentTarget);
    const handleCloseMenu = () => setAnchorEl(null);

    const handleOpenDialog = () => {
        setEditingEnvs(JSON.parse(JSON.stringify(environments))); // deep copy
        setDialogOpen(true);
        handleCloseMenu();
    };

    const handleCloseDialog = () => setDialogOpen(false);

    const handleSaveEnvironments = () => {
        setEnvironments(editingEnvs);
        // If active env was deleted, reset activeEnvId
        if (activeEnvId && !editingEnvs.find(e => e.id === activeEnvId)) {
            setActiveEnvId(null);
        }
        setDialogOpen(false);
    };

    const addEnvironment = () => {
        setEditingEnvs([...editingEnvs, { id: Date.now().toString(), name: 'New Environment', variables: [] }]);
    };

    const updateEnvName = (index, name) => {
        const newEnvs = [...editingEnvs];
        newEnvs[index].name = name;
        setEditingEnvs(newEnvs);
    };

    const deleteEnvironment = (index) => {
        const newEnvs = editingEnvs.filter((_, i) => i !== index);
        setEditingEnvs(newEnvs);
    };

    const addVariable = (envIndex) => {
        const newEnvs = [...editingEnvs];
        newEnvs[envIndex].variables.push({ key: '', value: '' });
        setEditingEnvs(newEnvs);
    };

    const updateVariable = (envIndex, varIndex, field, value) => {
        const newEnvs = [...editingEnvs];
        newEnvs[envIndex].variables[varIndex][field] = value;
        setEditingEnvs(newEnvs);
    };

    const deleteVariable = (envIndex, varIndex) => {
        const newEnvs = [...editingEnvs];
        newEnvs[envIndex].variables = newEnvs[envIndex].variables.filter((_, i) => i !== varIndex);
        setEditingEnvs(newEnvs);
    };

    const activeEnv = environments.find(e => e.id === activeEnvId);

    return (
        <>
            <button
                onClick={handleOpenMenu}
                className="flex items-center gap-2 px-3 py-1.5 bg-slate-200 dark:bg-surface-dark border border-slate-300 dark:border-border-dark rounded-lg text-xs font-bold hover:bg-slate-300 dark:hover:bg-white/5 transition-colors text-slate-700 dark:text-slate-300"
            >
                <span className="material-symbols-outlined text-sm">public</span>
                {activeEnv ? activeEnv.name : 'No Environment'}
                <span className="material-symbols-outlined text-sm">expand_more</span>
            </button>

            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleCloseMenu}
                PaperProps={{
                    sx: {
                        minWidth: 260,
                        borderRadius: 2,
                        mt: 1,
                        bgcolor: isDarkMode ? '#16161e' : '#f8fafc',
                        color: isDarkMode ? '#f8fafc' : '#1e293b',
                        border: isDarkMode ? '1px solid #2d2d3a' : '1px solid #e2e8f0'
                    }
                }}
            >
                <MenuItem
                    selected={activeEnvId === null}
                    onClick={() => { setActiveEnvId(null); handleCloseMenu(); }}
                    sx={{ '&.Mui-selected': { bgcolor: 'rgba(139, 92, 246, 0.15)', color: '#8b5cf6' }, '&:hover': { bgcolor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)' } }}
                >
                    No Environment
                </MenuItem>
                <Divider sx={{ borderColor: isDarkMode ? '#2d2d3a' : '#e2e8f0' }} />
                {environments.map(env => (
                    <MenuItem
                        key={env.id}
                        selected={activeEnvId === env.id}
                        onClick={() => { setActiveEnvId(env.id); handleCloseMenu(); }}
                        sx={{ '&.Mui-selected': { bgcolor: 'rgba(139, 92, 246, 0.15)', color: '#8b5cf6' }, '&:hover': { bgcolor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)' } }}
                    >
                        {env.name}
                    </MenuItem>
                ))}
                <Divider sx={{ borderColor: isDarkMode ? '#2d2d3a' : '#e2e8f0' }} />
                <MenuItem onClick={handleOpenDialog} sx={{ '&:hover': { bgcolor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)' } }}>
                    <EditIcon fontSize="small" sx={{ mr: 1, color: isDarkMode ? '#94a3b8' : '#64748b' }} /> Manage Environments
                </MenuItem>
            </Menu>

            <Dialog
                open={dialogOpen}
                onClose={handleCloseDialog}
                maxWidth="md"
                fullWidth
                PaperProps={{
                    sx: {
                        bgcolor: isDarkMode ? '#16161e' : '#f8fafc',
                        color: isDarkMode ? '#f8fafc' : '#1e293b',
                        border: isDarkMode ? '1px solid #2d2d3a' : '1px solid #e2e8f0',
                        borderRadius: 3
                    }
                }}
            >
                <DialogTitle sx={{ borderBottom: '1px solid #2d2d3a', fontWeight: 'bold' }}>Manage Environments</DialogTitle>
                <DialogContent sx={{ mt: 2 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        {editingEnvs.map((env, envIndex) => (
                            <Box key={env.id} sx={{ p: 3, border: isDarkMode ? '1px solid #2d2d3a' : '1px solid #e2e8f0', bgcolor: isDarkMode ? '#0a0a0c' : '#f1f5f9', borderRadius: 2 }}>
                                <Box sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'center' }}>
                                    <TextField
                                        size="small"
                                        label="Environment Name"
                                        value={env.name}
                                        onChange={(e) => updateEnvName(envIndex, e.target.value)}
                                        sx={{
                                            flexGrow: 1,
                                            '& .MuiOutlinedInput-root': { color: isDarkMode ? '#f8fafc' : '#1e293b', '& fieldset': { borderColor: isDarkMode ? '#2d2d3a' : '#e2e8f0' }, '&:hover fieldset': { borderColor: '#8b5cf6' }, '&.Mui-focused fieldset': { borderColor: '#8b5cf6' } },
                                            '& .MuiInputLabel-root': { color: isDarkMode ? '#94a3b8' : '#64748b' },
                                            '& .MuiInputLabel-root.Mui-focused': { color: '#8b5cf6' }
                                        }}
                                    />
                                    <IconButton color="error" onClick={() => deleteEnvironment(envIndex)} sx={{ '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.1)' } }}>
                                        <DeleteIcon />
                                    </IconButton>
                                </Box>

                                <Typography variant="caption" sx={{ display: 'block', mb: 1.5, fontWeight: 'bold', color: isDarkMode ? '#94a3b8' : '#64748b', letterSpacing: '0.05em' }}>
                                    VARIABLES
                                </Typography>

                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                    {env.variables.map((v, varIndex) => (
                                        <Box key={varIndex} sx={{ display: 'flex', gap: 1.5 }}>
                                            <TextField
                                                size="small"
                                                placeholder="Key (e.g. baseUrl)"
                                                value={v.key}
                                                onChange={(e) => updateVariable(envIndex, varIndex, 'key', e.target.value)}
                                                sx={{
                                                    flex: 1,
                                                    '& .MuiOutlinedInput-root': { color: isDarkMode ? '#f8fafc' : '#1e293b', '& fieldset': { borderColor: isDarkMode ? '#2d2d3a' : '#e2e8f0' }, '&:hover fieldset': { borderColor: '#8b5cf6' }, '&.Mui-focused fieldset': { borderColor: '#8b5cf6' } }
                                                }}
                                            />
                                            <TextField
                                                size="small"
                                                placeholder="Value (e.g. https://api.com)"
                                                value={v.value}
                                                onChange={(e) => updateVariable(envIndex, varIndex, 'value', e.target.value)}
                                                sx={{
                                                    flex: 2,
                                                    '& .MuiOutlinedInput-root': { color: isDarkMode ? '#f8fafc' : '#1e293b', '& fieldset': { borderColor: isDarkMode ? '#2d2d3a' : '#e2e8f0' }, '&:hover fieldset': { borderColor: '#8b5cf6' }, '&.Mui-focused fieldset': { borderColor: '#8b5cf6' } }
                                                }}
                                            />
                                            <IconButton size="small" color="error" onClick={() => deleteVariable(envIndex, varIndex)} sx={{ '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.1)' } }}>
                                                <DeleteIcon fontSize="small" />
                                            </IconButton>
                                        </Box>
                                    ))}
                                    <Button size="small" startIcon={<AddIcon />} onClick={() => addVariable(envIndex)} sx={{ alignSelf: 'flex-start', color: '#8b5cf6', '&:hover': { bgcolor: 'rgba(139, 92, 246, 0.1)' } }}>
                                        Add Variable
                                    </Button>
                                </Box>
                            </Box>
                        ))}

                        <Button variant="outlined" startIcon={<AddIcon />} onClick={addEnvironment} sx={{ borderStyle: 'dashed', borderColor: isDarkMode ? '#2d2d3a' : '#e2e8f0', color: isDarkMode ? '#e2e8f0' : '#475569', '&:hover': { borderColor: '#8b5cf6', bgcolor: 'rgba(139, 92, 246, 0.05)' } }}>
                            Create Environment
                        </Button>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 3, borderTop: '1px solid #2d2d3a' }}>
                    <Button onClick={handleCloseDialog} sx={{ color: isDarkMode ? '#94a3b8' : '#64748b', '&:hover': { bgcolor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)' } }}>Cancel</Button>
                    <Button variant="contained" onClick={handleSaveEnvironments} sx={{ bgcolor: '#8b5cf6', color: '#000', fontWeight: 'bold', '&:hover': { bgcolor: '#7c3aed' } }}>Save</Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
