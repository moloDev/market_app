import React from 'react';
import './styles/Header.css'; // Import the CSS for this component

const Header = () => {
  return (
    <header className="header">
      <div className="container">
        <div className="left">
          <img src="./logo.png" alt="Logo" />
        </div>
        <div className="center">
          <h1>CSAMarket</h1>
        </div>
        <div className="right">
          <p>Contact: +221 77 123 45 67</p>
        </div>
      </div>
    </header>
  );
};

export default Header;
