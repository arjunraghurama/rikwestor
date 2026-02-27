import React, { useState, useMemo } from 'react';
import { Box, TextField, Select, MenuItem, Button, Tabs, Tab, IconButton, Paper, Typography, useTheme } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import CodeMirror from '@uiw/react-codemirror';
import { json } from '@codemirror/lang-json';
import { Decoration, ViewPlugin } from '@codemirror/view';
import { EditorView } from '@codemirror/view';

function KeyValuePanel({ items, onChange, onAdd, onRemove }) {
    return (
        <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
            {items.map((item, index) => (
                <Box key={index} sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <TextField
                        placeholder="Key"
                        value={item.key}
                        onChange={(e) => onChange(index, 'key', e.target.value)}
                        fullWidth
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
                    />
                    <TextField
                        placeholder="Value"
                        value={item.value}
                        onChange={(e) => onChange(index, 'value', e.target.value)}
                        fullWidth
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
                    />
                    <IconButton color="error" onClick={() => onRemove(index)} sx={{ p: 0.5, '&:hover': { bgcolor: 'error.main', color: '#fff' } }}>
                        <DeleteIcon fontSize="small" />
                    </IconButton>
                </Box>
            ))}
            <Button startIcon={<AddIcon />} onClick={onAdd} sx={{ alignSelf: 'flex-start', mt: 1, color: 'text.secondary' }}>
                Add Item
            </Button>
        </Box>
    );
}

export function RequestPane({ requestDetails, setRequestDetails, onSend, loading, environments, activeEnvId }) {
    const [tabIndex, setTabIndex] = useState(0);
    const theme = useTheme();

    // Create a robust CodeMirror extension to highlight variables dynamically
    const variableHighlightPlugin = useMemo(() => {
        // Find the active environment variables
        const activeEnv = environments?.find(e => e.id === activeEnvId);
        const activeVars = activeEnv ? activeEnv.variables.map(v => v.key).filter(Boolean) : [];

        const varRegex = /\{\{([^}]+)\}\}/g;

        const plugin = ViewPlugin.fromClass(class {
            constructor(view) {
                this.decorations = this.buildDecorations(view);
            }

            update(update) {
                if (update.docChanged || update.viewportChanged) {
                    this.decorations = this.buildDecorations(update.view);
                }
            }

            buildDecorations(view) {
                const builder = [];
                for (let { from, to } of view.visibleRanges) {
                    const text = view.state.doc.sliceString(from, to);
                    let match;
                    while ((match = varRegex.exec(text))) {
                        const varName = match[1];
                        const isValid = activeVars.includes(varName);

                        const start = from + match.index;
                        const end = start + match[0].length;
                        const decoration = Decoration.mark({
                            class: isValid ? 'cm-var-valid' : 'cm-var-invalid'
                        });

                        builder.push(decoration.range(start, end));
                    }
                }

                // Sort ranges before building the DecorationSet
                builder.sort((a, b) => a.from - b.from);
                return Decoration.set(builder);
            }
        }, {
            decorations: v => v.decorations
        });

        return plugin;
    }, [environments, activeEnvId]);

    // CodeMirror theme customization based on MUI mode
    const editorTheme = EditorView.theme({
        "&": {
            backgroundColor: "transparent !important",
            color: "inherit",
        },
        ".cm-content": {
            minHeight: "40px",
            display: "flex",
            alignItems: "center",
            padding: "0 14px",
        },
        ".cm-line": {
            padding: 0,
            lineHeight: "40px",
        },
        "&.cm-focused": {
            outline: "none"
        },
        ".cm-cursor": {
            borderLeftColor: theme.palette.text.primary
        },
    });

    const handleMethodChange = (e) => {
        setRequestDetails({ ...requestDetails, method: e.target.value });
    };

    const handleUrlChange = (value) => {
        setRequestDetails({ ...requestDetails, url: value });
    };

    const handleUrlKeyDown = (e) => {
        if (e.key === 'Enter' && !loading && requestDetails.url) {
            e.preventDefault();
            onSend();
        }
    };

    const handleTabChange = (event, newValue) => {
        setTabIndex(newValue);
    };

    const handleKvChange = (type) => (index, field, value) => {
        const newItems = [...requestDetails[type]];
        newItems[index][field] = value;
        setRequestDetails({ ...requestDetails, [type]: newItems });
    };

    const handleAddKv = (type) => () => {
        setRequestDetails({ ...requestDetails, [type]: [...requestDetails[type], { key: '', value: '' }] });
    };

    const handleRemoveKv = (type) => (index) => {
        const newItems = requestDetails[type].filter((_, i) => i !== index);
        setRequestDetails({ ...requestDetails, [type]: newItems });
    };

    const handleBodyChange = (value) => {
        setRequestDetails({ ...requestDetails, body: value });
    };

    return (
        <Paper elevation={0} sx={{ borderRadius: 0, overflow: 'hidden', border: '1px solid', borderColor: 'divider', height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2, backgroundColor: 'background.default', borderBottom: '1px solid', borderColor: 'divider' }}>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <Box sx={{ position: 'relative', width: 140 }}>
                        <Select
                            size="small"
                            value={requestDetails.method}
                            onChange={handleMethodChange}
                            sx={{
                                width: '100%',
                                height: 44,
                                fontWeight: 700,
                                color: requestDetails.method === 'GET' ? '#3b82f6' : requestDetails.method === 'POST' ? '#22c55e' : requestDetails.method === 'PUT' ? '#f97316' : requestDetails.method === 'DELETE' ? '#ef4444' : '#eab308',
                                bgcolor: 'background.paper',
                                '& .MuiOutlinedInput-notchedOutline': { borderColor: 'divider' },
                                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'primary.main' }
                            }}
                        >
                            <MenuItem value="GET" sx={{ fontWeight: 700, color: '#3b82f6' }}>GET</MenuItem>
                            <MenuItem value="POST" sx={{ fontWeight: 700, color: '#22c55e' }}>POST</MenuItem>
                            <MenuItem value="PUT" sx={{ fontWeight: 700, color: '#f97316' }}>PUT</MenuItem>
                            <MenuItem value="PATCH" sx={{ fontWeight: 700, color: '#eab308' }}>PATCH</MenuItem>
                            <MenuItem value="DELETE" sx={{ fontWeight: 700, color: '#ef4444' }}>DELETE</MenuItem>
                        </Select>
                    </Box>
                    <Box sx={{
                        flexGrow: 1,
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 2, // 8px
                        height: 44,
                        overflow: 'hidden',
                        backgroundColor: 'background.paper',
                        '&:hover': { borderColor: 'primary.main' },
                        display: 'flex',
                        alignItems: 'center' // Vertically center inner content
                    }}>
                        <CodeMirror
                            value={requestDetails.url}
                            onChange={handleUrlChange}
                            onKeyDown={handleUrlKeyDown}
                            theme={theme.palette.mode === 'dark' ? 'dark' : 'light'}
                            extensions={[editorTheme, variableHighlightPlugin]}
                            basicSetup={{
                                lineNumbers: false,
                                foldGutter: false,
                                highlightActiveLine: false,
                                highlightSelectionMatches: false,
                                bracketMatching: false
                            }}
                            style={{ flexGrow: 1, display: 'flex' }}
                        />
                    </Box>
                    <Button
                        variant="contained"
                        disabled={loading || !requestDetails.url}
                        onClick={onSend}
                        endIcon={<SendIcon />}
                        sx={{
                            minWidth: 120,
                            height: 44,
                            bgcolor: 'primary.main',
                            color: '#000', // Match deep dark text color from design
                            fontWeight: 700,
                            letterSpacing: '0.05em',
                            '&:hover': { bgcolor: 'primary.light' }
                        }}
                    >
                        {loading ? 'SENDING...' : 'SEND'}
                    </Button>
                </Box>
            </Box>

            <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
                <Tabs
                    value={tabIndex}
                    onChange={handleTabChange}
                    aria-label="request tabs"
                    TabIndicatorProps={{ style: { height: 3, borderTopLeftRadius: 3, borderTopRightRadius: 3 } }}
                >
                    <Tab label="Params" />
                    <Tab label="Headers" />
                    <Tab label="Body" />
                </Tabs>
            </Box>

            <Box sx={{ flexGrow: 1, overflowY: 'auto', minHeight: 0 }}>
                {tabIndex === 0 && (
                    <KeyValuePanel
                        items={requestDetails.params}
                        onChange={handleKvChange('params')}
                        onAdd={handleAddKv('params')}
                        onRemove={handleRemoveKv('params')}
                    />
                )}
                {tabIndex === 1 && (
                    <KeyValuePanel
                        items={requestDetails.headers}
                        onChange={handleKvChange('headers')}
                        onAdd={handleAddKv('headers')}
                        onRemove={handleRemoveKv('headers')}
                    />
                )}
                {tabIndex === 2 && (
                    <Box sx={{ p: 2, height: '100%' }}>
                        <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, height: '100%', overflow: 'hidden' }}>
                            <CodeMirror
                                value={requestDetails.body}
                                onChange={handleBodyChange}
                                theme={theme.palette.mode === 'dark' ? 'dark' : 'light'}
                                extensions={[json(), variableHighlightPlugin]}
                                basicSetup={{
                                    lineNumbers: true,
                                    foldGutter: true,
                                    highlightActiveLine: true,
                                    highlightSelectionMatches: true,
                                }}
                                style={{ height: '100%' }}
                            />
                        </Box>
                    </Box>
                )}
            </Box>
        </Paper>
    );
}
