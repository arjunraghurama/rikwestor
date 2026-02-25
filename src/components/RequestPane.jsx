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
                <Box key={index} sx={{ display: 'flex', gap: 1 }}>
                    <TextField
                        label="Key"
                        value={item.key}
                        onChange={(e) => onChange(index, 'key', e.target.value)}
                        fullWidth
                    />
                    <TextField
                        label="Value"
                        value={item.value}
                        onChange={(e) => onChange(index, 'value', e.target.value)}
                        fullWidth
                    />
                    <IconButton color="error" onClick={() => onRemove(index)}>
                        <DeleteIcon />
                    </IconButton>
                </Box>
            ))}
            <Button startIcon={<AddIcon />} onClick={onAdd} sx={{ alignSelf: 'flex-start', mt: 1 }}>
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
            <Box sx={{ p: 2, display: 'flex', gap: 1, alignItems: 'center', backgroundColor: 'background.paper', borderBottom: '1px solid', borderColor: 'divider' }}>
                <Select
                    size="small"
                    value={requestDetails.method}
                    onChange={handleMethodChange}
                    sx={{ width: 120, height: 40, fontWeight: 'bold' }}
                >
                    <MenuItem value="GET">GET</MenuItem>
                    <MenuItem value="POST">POST</MenuItem>
                    <MenuItem value="PUT">PUT</MenuItem>
                    <MenuItem value="PATCH">PATCH</MenuItem>
                    <MenuItem value="DELETE">DELETE</MenuItem>
                </Select>
                <Box sx={{
                    flexGrow: 1,
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1,
                    height: 40,
                    overflow: 'hidden',
                    backgroundColor: 'background.default',
                    '&:hover': { borderColor: 'text.primary' }
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
                    />
                </Box>
                <Button
                    variant="contained"
                    disabled={loading || !requestDetails.url}
                    onClick={onSend}
                    endIcon={<SendIcon />}
                    sx={{ minWidth: 100, height: 40, boxShadow: 'none' }}
                >
                    {loading ? 'Sending' : 'Send'}
                </Button>
            </Box>

            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={tabIndex} onChange={handleTabChange} aria-label="request tabs">
                    <Tab label="Params" />
                    <Tab label="Headers" />
                    <Tab label="Body" />
                </Tabs>
            </Box>

            <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
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
