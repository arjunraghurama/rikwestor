import React, { useState, useContext, useEffect } from 'react';
import { ThemeProvider, CssBaseline, AppBar, Toolbar, Typography, IconButton, Box } from '@mui/material';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import { ColorModeContext, useColorTheme } from './theme';
import { RequestPane } from './components/RequestPane';
import { ResponsePane } from './components/ResponsePane';
import { Sidebar } from './components/Sidebar';
import { EnvironmentsMenu } from './components/EnvironmentsMenu';
import Split from 'react-split';

const DEFAULT_ENVIRONMENTS = [
  {
    id: '1',
    name: 'Development',
    variables: [{ key: 'baseUrl', value: 'http://localhost:3000' }]
  }
];

function AppContent() {
  const { mode, toggleColorMode } = useContext(ColorModeContext);

  const [requestDetails, setRequestDetails] = useState({
    method: 'GET',
    url: '',
    params: [],
    headers: [],
    body: '',
  });

  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);

  const [environments, setEnvironments] = useState(DEFAULT_ENVIRONMENTS);
  const [activeEnvId, setActiveEnvId] = useState(null);

  // Helper to interpolate {{variables}} in strings
  const interpolate = (str) => {
    if (!str || !activeEnvId) return str;
    const activeEnv = environments.find(e => e.id === activeEnvId);
    if (!activeEnv) return str;

    let result = str;
    activeEnv.variables.forEach(v => {
      if (v.key) {
        // Replace all instances of {{key}} with value
        const regex = new RegExp(`\\{\\{${v.key}\\}\\}`, 'g');
        result = result.replace(regex, v.value);
      }
    });
    return result;
  };

  const handleSendRequest = async () => {
    setLoading(true);
    setResponse(null);
    const startTime = performance.now();

    // Save to history before interpolating so history shows the raw {{vars}}
    setHistory(prev => [{ request: { ...requestDetails }, timestamp: Date.now() }, ...prev]);

    // Interpolate URL
    let finalUrl = interpolate(requestDetails.url);

    // Append query params with interpolation
    if (requestDetails.params.length > 0) {
      try {
        const urlObj = new URL(finalUrl);
        requestDetails.params.forEach(({ key, value }) => {
          if (key.trim() !== '') {
            urlObj.searchParams.append(interpolate(key), interpolate(value));
          }
        });
        finalUrl = urlObj.toString();
      } catch (e) {
        // URL is invalid even after interpolation
      }
    }

    const headers = new Headers();
    requestDetails.headers.forEach(({ key, value }) => {
      if (key.trim() !== '') headers.append(interpolate(key), interpolate(value));
    });

    const init = {
      method: requestDetails.method,
      headers: headers,
    };

    if (requestDetails.method !== 'GET' && requestDetails.method !== 'HEAD' && requestDetails.body) {
      try {
        // Interpolate body
        init.body = interpolate(requestDetails.body);
      } catch (e) { }
    }

    try {
      const res = await fetch(finalUrl, init);
      const endTime = performance.now();
      const time = Math.round(endTime - startTime);

      const resHeaders = [];
      res.headers.forEach((value, key) => {
        resHeaders.push({ key, value });
      });

      let data;
      const contentType = res.headers.get('content-type');
      let size = 'Unknown';

      const rawText = await res.text();
      size = `${(new Blob([rawText]).size / 1024).toFixed(2)} KB`;

      if (contentType && contentType.includes('application/json')) {
        try {
          data = JSON.parse(rawText);
        } catch (e) {
          data = rawText;
        }
      } else {
        data = rawText;
      }

      setResponse({
        status: res.status,
        statusText: res.statusText,
        time,
        size,
        headers: resHeaders,
        data,
      });

    } catch (err) {
      const endTime = performance.now();
      const time = Math.round(endTime - startTime);
      setResponse({
        status: 0,
        statusText: 'Error',
        time,
        size: '0 KB',
        error: err.toString(),
        data: null,
      });
    }

    setLoading(false);
  };

  const handleSelectHistory = (historicalRequest) => {
    setRequestDetails(historicalRequest);
    setResponse(null);
  };

  const handleDeleteHistory = (index) => {
    setHistory(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      <AppBar position="static" color="primary" elevation={1}>
        <Toolbar variant="dense">
          <Box
            component="img"
            src={`${import.meta.env.BASE_URL}logo.svg`}
            alt="Rikwestor Logo"
            sx={{
              height: 28,
              width: 28,
              mr: 2,
              filter: 'drop-shadow(0px 0px 2px rgba(0,0,0,0.2))'
            }}
          />

          <Box sx={{ flexGrow: 1 }} />

          <IconButton onClick={toggleColorMode} color="inherit" sx={{ ml: 2 }}>
            {mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
          </IconButton>

          <EnvironmentsMenu
            environments={environments}
            activeEnvId={activeEnvId}
            setEnvironments={setEnvironments}
            setActiveEnvId={setActiveEnvId}
          />

        </Toolbar>
      </AppBar>

      <Box sx={{ flexGrow: 1, p: 0, overflow: 'hidden', '& .split-flex': { display: 'flex', height: '100%' } }}>
        <Split
          sizes={[20, 40, 40]}
          minSize={[200, 300, 300]}
          expandToMin={false}
          gutterSize={4}
          gutterAlign="center"
          snapOffset={30}
          dragInterval={1}
          direction="horizontal"
          className="split-flex"
          cursor="col-resize"
        >
          <Box sx={{ height: '100%', overflow: 'hidden' }}>
            <Sidebar history={history} onRequestSelect={handleSelectHistory} onDeleteRequest={handleDeleteHistory} />
          </Box>
          <Box sx={{ height: '100%', overflow: 'hidden' }}>
            <RequestPane
              requestDetails={requestDetails}
              setRequestDetails={setRequestDetails}
              onSend={handleSendRequest}
              loading={loading}
              environments={environments}
              activeEnvId={activeEnvId}
            />
          </Box>
          <Box sx={{ height: '100%', overflow: 'hidden' }}>
            <ResponsePane response={response} />
          </Box>
        </Split>
      </Box>
    </Box>
  );
}

function App() {
  const { theme, colorMode } = useColorTheme();

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AppContent />
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

export default App;
