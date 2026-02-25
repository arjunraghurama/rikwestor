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

export function EnvironmentsMenu({ environments, activeEnvId, setEnvironments, setActiveEnvId }) {
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
            <Tooltip title="Environments">
                <Button
                    onClick={handleOpenMenu}
                    startIcon={<StorageIcon fontSize="small" />}
                    endIcon={<KeyboardArrowDownIcon />}
                    sx={{
                        textTransform: 'none',
                        ml: 2,
                        fontWeight: 'bold',
                        fontFamily: 'monospace',
                        borderRadius: 0,
                        border: '1px solid',
                        borderColor: 'primary.dark',
                        backgroundColor: 'primary.dark',
                        color: 'primary.contrastText',
                        px: 2,
                        '&:hover': {
                            backgroundColor: 'primary.main',
                        }
                    }}
                >
                    {activeEnv ? activeEnv.name : 'No Environment'}
                </Button>
            </Tooltip>

            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleCloseMenu}
                PaperProps={{
                    sx: {
                        minWidth: 260,
                        borderRadius: 0,
                        mt: 1
                    }
                }}
            >
                <MenuItem
                    selected={activeEnvId === null}
                    onClick={() => { setActiveEnvId(null); handleCloseMenu(); }}
                >
                    No Environment
                </MenuItem>
                <Divider />
                {environments.map(env => (
                    <MenuItem
                        key={env.id}
                        selected={activeEnvId === env.id}
                        onClick={() => { setActiveEnvId(env.id); handleCloseMenu(); }}
                    >
                        {env.name}
                    </MenuItem>
                ))}
                <Divider />
                <MenuItem onClick={handleOpenDialog}>
                    <EditIcon fontSize="small" sx={{ mr: 1 }} /> Manage Environments
                </MenuItem>
            </Menu>

            <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
                <DialogTitle>Manage Environments</DialogTitle>
                <DialogContent dividers>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        {editingEnvs.map((env, envIndex) => (
                            <Box key={env.id} sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                                <Box sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' }}>
                                    <TextField
                                        size="small"
                                        label="Environment Name"
                                        value={env.name}
                                        onChange={(e) => updateEnvName(envIndex, e.target.value)}
                                        sx={{ flexGrow: 1 }}
                                    />
                                    <IconButton color="error" onClick={() => deleteEnvironment(envIndex)}>
                                        <DeleteIcon />
                                    </IconButton>
                                </Box>

                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1, fontWeight: 'bold' }}>
                                    VARIABLES
                                </Typography>

                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                    {env.variables.map((v, varIndex) => (
                                        <Box key={varIndex} sx={{ display: 'flex', gap: 1 }}>
                                            <TextField
                                                size="small"
                                                placeholder="Key (e.g. baseUrl)"
                                                value={v.key}
                                                onChange={(e) => updateVariable(envIndex, varIndex, 'key', e.target.value)}
                                                sx={{ flex: 1 }}
                                            />
                                            <TextField
                                                size="small"
                                                placeholder="Value (e.g. https://api.com)"
                                                value={v.value}
                                                onChange={(e) => updateVariable(envIndex, varIndex, 'value', e.target.value)}
                                                sx={{ flex: 2 }}
                                            />
                                            <IconButton size="small" color="error" onClick={() => deleteVariable(envIndex, varIndex)}>
                                                <DeleteIcon fontSize="small" />
                                            </IconButton>
                                        </Box>
                                    ))}
                                    <Button size="small" startIcon={<AddIcon />} onClick={() => addVariable(envIndex)} sx={{ alignSelf: 'flex-start' }}>
                                        Add Variable
                                    </Button>
                                </Box>
                            </Box>
                        ))}

                        <Button variant="outlined" startIcon={<AddIcon />} onClick={addEnvironment} sx={{ borderStyle: 'dashed' }}>
                            Create Environment
                        </Button>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Cancel</Button>
                    <Button variant="contained" onClick={handleSaveEnvironments}>Save</Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
