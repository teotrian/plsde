import React, { createContext, useEffect, useState, useContext } from "react";
import { UserContext } from "./UserContext";

export const DetailContext = createContext();

export const DetailProvider = (props) => {
    const [token,,userRole] = useContext(UserContext);
    const [detail, setDetail] = useState({firstName: "", lastName: "", afm: "", errorMessage:""});

    useEffect(() => {
        const getDetails = async () => {
            const requestOptions = {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + token,
                },
            };

            if (userRole ===3) {
                const response = await fetch("/api/employees/me", requestOptions);

                if (!response.ok) {
                    setDetail({firstName: "", lastName: "", afm: "", errorMessage: "Σφάλμα κατά την ανάκτηση των στοιχείων του χρήστη"});
                } else {
                    const data = await response.json();
                    setDetail({firstName: data.first_name, lastName: data.last_name, afm: data.afm, errorMessage:""});
                }
            } else if (userRole === 2) {
                const response = await fetch("/api/schools/me", requestOptions);
                if (!response.ok) {
                    setDetail({firstName: "", lastName: "", afm: "", errorMessage: "Σφάλμα κατά την ανάκτηση των στοιχείων του χρήστη"});
                } else {
                    const data = await response.json();
                    setDetail({firstName: "", lastName: data.name, afm: "", errorMessage:""});
                }   
            } else if (userRole === 1) {
                setDetail({firstName: "", lastName: "Διαχειριστή", afm: "", errorMessage:""});
            }
        };
        getDetails();
    }, [token, userRole]);

  return (
    <DetailContext.Provider value={[detail, setDetail]}>
      {props.children}
    </DetailContext.Provider>
  );
};
