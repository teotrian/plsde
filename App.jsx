import React, { useContext, useEffect, useState } from "react";

import Login from "./components/Login";
import Header from "./components/Header";
import SubHeader from "./components/SubHeader";
import UserTable from "./components/UserTable";
import SchoolTable from "./components/SchoolTable";
import AdminTable from "./components/AdminTable";
import Footer from "./components/Footer";
import { UserContext } from "./context/UserContext";

// Define the App component
const App = () => {
  const [message, setMessage] = useState("");
  const [token,,userRole] = useContext(UserContext);
  
  // Get the message from the getWelcomeMessage function
  const getWelcomeMessage = async () => {
    const requestOptions = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    };
    const response = await fetch("/api", requestOptions);
    const data = await response.json();

    if (!response.ok) {
      console.log("Κάτι δεν λειτούργησε σωστά");
    } else {
      setMessage(data.message);
    }
  };

  useEffect(() => {
    getWelcomeMessage();
  }, []);

  return (
    <>
      <Header title={message} />
      {!token ? (
        <div className="columns"><Login /></div>
      ) : (
          <div className="column mt-auto">
          <SubHeader />
          {userRole === 3 ? (
            <div className="column mt-3"> <UserTable /> </div>
          ):userRole === 2 ?(
            <div className="column mt-3"> <SchoolTable /></div>
          ):(
            <div className="column mt-3"> <AdminTable /></div>
          )}
        </div>
      )}
      <Footer />
    </>
  );
}
// Export the App component
export default App;
