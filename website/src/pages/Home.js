import { motion } from 'framer-motion';
import { Box, Typography, Container, Button, Grid } from '@mui/material';
import styled from 'styled-components';

const StyledHero = styled(Box)`
  padding: 4rem 0;
  text-align: center;
`;

const Home = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <StyledHero>
        <Container maxWidth="lg">
          <Typography
            variant="h1"
            component="h1"
            sx={{
              fontSize: { xs: '2.5rem', md: '3.75rem' },
              fontWeight: 'bold',
              mb: 4
            }}
          >
            ברוכים הבאים
          </Typography>
          <Typography
            variant="h5"
            component="h2"
            sx={{ mb: 4 }}
          >
            כאן יבוא הטקסט הראשי שלך
          </Typography>
          <Button
            variant="contained"
            size="large"
            sx={{ mt: 2 }}
          >
            התחל כאן
          </Button>
        </Container>
      </StyledHero>

      <Container maxWidth="lg">
        <Grid container spacing={4} sx={{ my: 4 }}>
          {/* Add your grid items here */}
        </Grid>
      </Container>
    </motion.div>
  );
};

export default Home;
