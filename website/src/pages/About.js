import { motion } from 'framer-motion';
import { Container, Typography, Box, Paper } from '@mui/material';
import styled from 'styled-components';

const StyledPaper = styled(Paper)`
  padding: 2rem;
  margin: 2rem 0;
`;

const About = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Container maxWidth="lg">
        <Box sx={{ py: 4 }}>
          <Typography
            variant="h2"
            component="h1"
            sx={{ mb: 4 }}
          >
            אודות
          </Typography>
          
          <StyledPaper elevation={3}>
            <Typography variant="body1" paragraph>
              כאן יבוא הטקסט אודות העסק או השירות שלך
            </Typography>
          </StyledPaper>
        </Box>
      </Container>
    </motion.div>
  );
};

export default About;
