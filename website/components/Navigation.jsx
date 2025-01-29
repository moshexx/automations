import { NavLink } from 'react-router-dom';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

const Nav = styled.nav`
  display: flex;
  gap: 1rem;
  padding: 1rem;
`;

const StyledNavLink = styled(NavLink)`
const StyledLink = styled(Link)`
  text-decoration: none;
  color: #333;
  font-weight: 500;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  transition: all 0.2s ease-in-out;

  &:hover {
    background-color: #f0f0f0;
  }

  &.active {
    color: #1976d2;
    background-color: rgba(25, 118, 210, 0.08);
  }
`;

const Navigation = () => {
  return (
    <Nav>
      <StyledNavLink to="/" end>
        דף הבית
      </StyledNavLink>
      <StyledNavLink to="/about">
        עלינו
      </StyledNavLink>
      <StyledNavLink to="/articles">
        מאמרים
      </StyledNavLink>
      <StyledNavLink to="/contact">
        צור קשר
      </StyledNavLink>
      <StyledLink to="/">דף הבית</StyledLink>
      <StyledLink to="/about">עלינו</StyledLink>
      <StyledLink to="/articles">מאמרים</StyledLink>
      <StyledLink to="/contact">צור קשר</StyledLink>
    </Nav>
  );
};

export default Navigation;
