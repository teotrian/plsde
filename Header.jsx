import React from "react";

// Define the Header component
const Header = ({ title }) => {
  return (
    <div className="mt-5 mb-1" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
      <img
        src="/EAP_LOGO.png"
        alt="Logo"
        style={{
          height: '60px',
          position: 'absolute',
          left: 0,
          top: '50%',
          transform: 'translateY(-50%)',
          marginLeft: '1rem'
        }}
      />
      <h1 className="title" style={{ margin: '0 auto' }}>{title}</h1>
    </div>
  );
};

// Export the Header component
export default Header;
