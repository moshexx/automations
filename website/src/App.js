import { ThemeProvider as MuiThemeProvider } from '@mui/material';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import { prefixer } from 'stylis';
import rtlPlugin from 'stylis-plugin-rtl';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { getTheme } from './theme';
import Layout from './components/Layout';
import Routes from './routes';
import { useTheme } from './context/ThemeContext';

const cacheRtl = createCache({
  key: 'muirtl',
  stylisPlugins: [prefixer, rtlPlugin],
});

function ThemedApp() {
  const { mode } = useTheme();
  const theme = getTheme(mode);

  return (
    <MuiThemeProvider theme={theme}>
      <BrowserRouter>
        <Layout>
          <Routes />
        </Layout>
      </BrowserRouter>
    </MuiThemeProvider>
  );
}

function App() {
  return (
    <CacheProvider value={cacheRtl}>
      <ThemeProvider>
        <ThemedApp />
      </ThemeProvider>
    </CacheProvider>
  );
}

export default App;
