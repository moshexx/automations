import { AppBar, Toolbar, IconButton, Button, Box } from '@mui/material';
import { Brightness4, Brightness7 } from '@mui/icons-material';
import { useTheme } from '../context/ThemeContext';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

const StyledLink = styled(Link)`
  text-decoration: none;
  color: inherit;
`;

const Header = () => {
  const { mode, toggleColorMode } = useTheme();

  return (
    <AppBar position="static">
      <Toolbar>
        <Box sx={{ flexGrow: 1, display: 'flex', gap: 2 }}>
          <Button color="inherit" component={StyledLink} to="/">
            דף הבית
          </Button>
          <Button color="inherit" component={StyledLink} to="/about">
            אודות
          </Button>
        </Box>
        
        <IconButton onClick={toggleColorMode} color="inherit">
          {mode === 'dark' ? <Brightness7 /> : <Brightness4 />}
        </IconButton>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
