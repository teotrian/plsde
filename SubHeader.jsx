import React, {useContext, useEffect, useState} from "react";
import { UserContext } from "../context/UserContext";
import { DetailContext } from "../context/DetailContext";
import ErrorMessage from "./ErrorMessage";
import TokenTimer from "./TokenTimer";

const SubHeader = () => {
  const [token] = useContext(UserContext); 
  const [detail] = useContext(DetailContext);
  const [expirationTime, setExpirationTime] = useState("");
  

   useEffect(() => {
           const getExpirationTime = async () => {
               const requestOptions = {
                   method: "GET",
                   headers: {
                       "Content-Type": "application/json",
                       Authorization: "Bearer " + token,
                   },
                };
           const response = await fetch("/api/token_expiration", requestOptions);
           const data = await response.json();

          if (!response.ok) {
            console.log("Κάτι δεν λειτούργησε σωστά");
          } else {
            setExpirationTime(data.expiration_time);
            console.log({expirationTime});
            } };
           getExpirationTime();
       }, [token]);
  
  return (
    <div className="has-text-centered">
       <h1 className="subtitle m-2">Καλωσορίσατε {detail.lastName} {detail.firstName} </h1>
       <ErrorMessage message={detail.errorMessage} />
       <TokenTimer expiresAt={expirationTime} />  
    </div>
  );
};

export default SubHeader;

