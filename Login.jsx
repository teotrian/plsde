import React, { useState, useContext } from "react";

import ErrorMessage from "./ErrorMessage";
import { UserContext } from "../context/UserContext";
import RegisterModal from "./RegisterModal";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [, setToken] = useContext(UserContext);
  const [activeRegisterModal, setActiveRegisterModal] = useState(false);

  const submitLogin = async () => {
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: JSON.stringify(
        `grant_type=&username=${email}&password=${password}&scope=&client_id=&client_secret=`
      ),
    };

    const response = await fetch("/api/token", requestOptions);
    const data = await response.json();

    if (!response.ok) { 
      setErrorMessage(data.detail);
    } else {
      setToken(data.access_token);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    submitLogin();
  };

  const closeModal = () => {
    setActiveRegisterModal(!activeRegisterModal);
   };

  return (
    <>
      <RegisterModal
        active={activeRegisterModal}
        closeModal={closeModal}
      />
    <div className="column"></div>
    <div className="column is-one-third">
      <form className="box" onSubmit={handleSubmit}>
        <h1 className="title has-text-centered">Είσοδος</h1>
        <div className="field">
          <label className="label">Email Address</label>
          <div className="control">
            <input
              type="email"
              placeholder="Εισάγετε το email σας"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input"
              required
            />
          </div>
        </div>
        <div className="field">
          <label className="label">Password</label>
          <div className="control">
            <input
              type="password"
              placeholder="Εισάγετε το password σας"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input"
              required
            />
          </div>
        </div>
        <ErrorMessage message={errorMessage} />
        <br />
        <button className="button is-primary" type="submit">
          Είσοδος
        </button>
        <br /><br />
        <h1 className="has-text-centered">Εάν βρίσκεστε για πρώτη φορά εδώ θα πρέπει να προβείτε σε εγγραφή</h1>
        <br></br>
        <div className=" has-text-centered">
          <button 
            className="button is-link" 
            onClick={() => setActiveRegisterModal(true)}>
              Εγγραφή
          </button>
        </div>  
      </form>
    </div>
    <div className="column"></div>
    </>
  );
};

export default Login;
