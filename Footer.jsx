import React, { useContext } from "react";

import { UserContext } from "../context/UserContext";

const Footer = () => {
  const [token, setToken] = useContext(UserContext);

  const handleLogout = () => {
    setToken(null);
  };

  return (
  <footer className="has-text-centered is-flex is-justify-content-center is-align-items-center p-4" style={{ marginTop: "3rem"}}>
    <div className="is-flex is-align-items-center">
      {token && (
        <button className="button is-danger" onClick={handleLogout}>
          <span className="icon-text">
            <span>Αποσύνδεση</span>
            <span className="icon">
              <i class="fa-solid fa-right-from-bracket"></i>
            </span>
          </span>
        </button>
      )}
    </div>
  </footer>
  ); 

};

export default Footer;
