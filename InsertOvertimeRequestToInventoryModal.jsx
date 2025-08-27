import React, { useEffect, useState , useContext} from "react";
import { DetailContext } from "../context/DetailContext";

const InsertOvertimeRequestToInventoryModal = ({ active, handleInsertModal, token, inventoryId, inventoryMonth, inventoryYear, setErrorMessage, refreshApprovedOvertimeRequests, refreshInsertedOvertimeRequests}) => {
  const [detail] = useContext(DetailContext);
  const [school, setSchool] = useState(detail.lastName);
  const [selectedRequests, setSelectedRequests] = useState([]);
  
  const [loadedRequests, setLoadedRequests] = useState(false); 
  const [matchedApprovedOvertimeRequests, setMatchedApprovedOvertimeRequests] = useState("");       //Variable for the selected school

  // Function to get the approved overtime requests of the selected school
  useEffect(() => {
    const getMatchedApprovedOvertimeRequests = async () => { 
      const requestOptions = {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
      };
      const response = await fetch(`/api/school/overtimerequests/matchedapproved/${school}?month=${inventoryMonth}&year=${inventoryYear}`, requestOptions);

      if (!response.ok) {
        setErrorMessage("Κάτι πήγε στραβά. Δεν μπόρεσαν να φορτωθούν τα εγκεκριμένα αιτήματα υπερωριών  ");
      } else {
        const data = await response.json();
        setMatchedApprovedOvertimeRequests(data);
        setErrorMessage("");
        setLoadedRequests(true);
      }
    };
    if (active) {
      getMatchedApprovedOvertimeRequests();
    }
  }, [token, setErrorMessage, school, inventoryMonth, inventoryYear, active]);


    useEffect(() => {
      setSchool(detail.lastName);
    }, [detail.lastName]);

    const handleCheckboxChange = (id) => {
      setSelectedRequests(prev =>
        prev.includes(id) ? prev.filter(reqId => reqId !== id) : [...prev, id]
      );
    };

// Function to insert an overtime request to the inventory
  const handleInsert = async () => {
    const requestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
       Authorization: "Bearer " + token,
      },
      body: JSON.stringify(selectedRequests),    
    };
    const response = await fetch(`/api/school/overtimeinventory/${inventoryId}/insertrequests`, requestOptions);
    
    if (!response.ok) {
      setErrorMessage("Κάτι πήγε στραβά. Δεν μπόρεσαν να εισαχθούν τα αιτήματα υπερωριών");
    }
      alert("Τα αιτήματα υπερωριών εισήχθησαν επιτυχώς");
      refreshApprovedOvertimeRequests(); // Refresh the approved overtime requests
      refreshInsertedOvertimeRequests(); // Refresh the inserted overtime requests
      handleInsertModal();
  };  


return (
    <div className={`modal ${active && "is-active"}`}>
        <div className="modal-background" onClick={handleInsertModal}></div>
        <div className="modal-card">
            <header className="modal-card-head has-background-info-light">
                <h1 className="modal-card-title">Εισαγωγή Υπερωριών στην Κατάσταση </h1>
            </header>
            <section className="modal-card-body">
                {loadedRequests && matchedApprovedOvertimeRequests ? (
                    <table className="table is-striped">
                        <thead>
                            <tr>
                                <th></th>
                                <th>Επίθετο</th>
                                <th>Όνομα</th>
                                <th>Μήνας</th>
                                <th>Έτος</th>
                                <th>Υπερωρίες</th>
                            </tr>
                        </thead>
                        <tbody>
                            {matchedApprovedOvertimeRequests.map((overtimerequest) => (
                                <tr key={overtimerequest.id}>
                                    <td>
                                        <input
                                            type="checkbox"
                                            checked={selectedRequests.includes(overtimerequest.id)}
                                            onChange={() => handleCheckboxChange(overtimerequest.id)}
                                        />
                                    </td>
                                    <td>{overtimerequest.last_name}</td>
                                    <td>{overtimerequest.first_name}</td>
                                    <td>{overtimerequest.month}</td>
                                    <td>{overtimerequest.year}</td>
                                    <td>{overtimerequest.number_of_overtimes}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p>Κάτι πήγε στραβά</p>
                )}
            </section>
            <footer className="modal-card-foot has-background-info-light">
                <button
                    className="button is-info"
                    onClick={() => handleInsert(selectedRequests)}
                >
                    Εισαγωγή
                </button>

                <button className="button" onClick={handleInsertModal}>
                    Άκυρο
                </button>
            </footer>
        </div>
    </div>
);
};

export default InsertOvertimeRequestToInventoryModal;
