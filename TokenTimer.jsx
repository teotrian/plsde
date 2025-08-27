import React, {useEffect, useState, useContext} from "react";
import { UserContext } from "../context/UserContext";


const TokenTimer = ({ expiresAt }) => {
  const [remainingTime, setRemainingTime] = useState(expiresAt - Date.now() / 1000);
  const [, setToken] = useContext(UserContext);

  useEffect(() => {
    const interval = setInterval(() => {
      const newRemainingTime = expiresAt - Date.now() / 1000;
      setRemainingTime(newRemainingTime);

      // If the token expires, clear it
      if (newRemainingTime <= 0) {
        clearInterval(interval);
        setToken(null); // This will log out the user or trigger a refresh
      }
    }, 1000);
 
    return () => clearInterval(interval);
  }, [expiresAt,setToken]);

  const minutes = Math.floor(remainingTime / 60);
  const seconds = Math.floor(remainingTime % 60);

  return (
    <div>
      {remainingTime > 0 ? (
        <p> {minutes} λεπτά και {seconds} δευτερόλεπτα</p>
      ) : (
         
        <p>Παρακαλούμε συνδεθείτε ξανά</p>
           
      )}
    </div>
  );
};

export default TokenTimer;