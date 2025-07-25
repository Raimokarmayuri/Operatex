
import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

const Footer = () => {
  return (
    <footer
      className="footer text-dark fw-bold text-center py-0"
      style={{
        marginTop: '3rem',
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        width: '100%',
        height: '1.5rem',
        fontSize: "1rem",
        backgroundColor: '#ff7f0e',
        zIndex: 9999, // Ensure it stays above the content
        padding: '1.2rem',
        fontFamily: "Montserrat, sans-serif"
      }}
    >
      &copy; 2025 Thetavega Tech Pvt. Ltd.
    </footer>
  );
};

export default Footer;