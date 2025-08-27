import React, { createContext, useEffect, useState } from "react";

export const UserContext = createContext();

export const UserProvider = (props) => {
  const [token, setToken] = useState(localStorage.getItem("plsdeToken"));
  const [userRole, setUserRole] = useState(0);
  

  useEffect(() => {
    const fetchUser = async () => {
      const requestOptions = {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
      };

      const response = await fetch("/api/users/me", requestOptions);

      if (!response.ok) {
        setToken(null);
      }
      localStorage.setItem("plsdeToken", token);  
      const data = await response.json();
      setUserRole(data.role);
      
    };
    fetchUser();
  }, [token]);

  return (
    <UserContext.Provider value={[token, setToken, userRole, setUserRole]}>
      {props.children}
    </UserContext.Provider>
  );
};
