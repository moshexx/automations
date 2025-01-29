import { Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        textAlign: 'center',
      }}
    >
      <Typography variant="h2" component="h1" gutterBottom>
        404
      </Typography>
      <Typography variant="h5" component="h2" gutterBottom>
        העמוד שחיפשת לא נמצא
      </Typography>
      <Button 
        variant="contained" 
        onClick={() => navigate('/')}
        sx={{ mt: 2 }}
      >
        חזרה לדף הבית
      </Button>
    </Box>
  );
};

export default NotFound;
