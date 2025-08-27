import React, { useEffect, useState , useContext} from "react";
import { DetailContext } from "../context/DetailContext";

const InsertTravelcostRequestToInventoryModal = ({ active, handleInsertModal, token, inventoryId, inventoryMonth, inventoryYear, setErrorMessage, refreshApprovedTravelcostRequests, refreshInsertedTravelcostRequests}) => {
  const [detail] = useContext(DetailContext);
  const [school, setSchool] = useState(detail.lastName);
  const [selectedRequests, setSelectedRequests] = useState([]);
  
  const [loadedRequests, setLoadedRequests] = useState(false); 
  const [matchedApprovedTravelcostRequests, setMatchedApprovedTravelcostRequests] = useState("");       //Variable for the selected school

  // Function to get the approved Travelcost requests of the selected school
  useEffect(() => {
    const getMatchedApprovedTravelcostRequests = async () => {
      const requestOptions = {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
      };
      const response = await fetch(`/api/school/travelcostrequests/matchedapproved/${school}?month=${inventoryMonth}&year=${inventoryYear}`, requestOptions);

      if (!response.ok) {
        setErrorMessage("Κάτι πήγε στραβά. Δεν μπόρεσαν να φορτωθούν τα εγκεκριμένα αιτήματα οδοιπορικών  ");
      } else {
        const data = await response.json();
        setMatchedApprovedTravelcostRequests(data);
        setErrorMessage("");
        setLoadedRequests(true);
      }
    };
    if (active) {
      getMatchedApprovedTravelcostRequests();
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

// Function to insert an Travelcost request to the inventory
  const handleInsert = async () => {
    const requestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
       Authorization: "Bearer " + token,
      },
      body: JSON.stringify(selectedRequests),    
    };
    const response = await fetch(`/api/school/travelcostinventory/${inventoryId}/insertrequests`, requestOptions);
    
    if (!response.ok) {
      setErrorMessage("Κάτι πήγε στραβά. Δεν μπόρεσαν να εισαχθούν τα αιτήματα οδοιπορικών");
    }
      alert("Τα αιτήματα οδοιπορικών εισήχθησαν επιτυχώς");
      refreshApprovedTravelcostRequests(); // Refresh the approved Travelcost requests
      refreshInsertedTravelcostRequests(); // Refresh the inserted Travelcost requests
      handleInsertModal();
  };  


return (
    <div className={`modal ${active && "is-active"}`}>
        <div className="modal-background" onClick={handleInsertModal}></div>
        <div className="modal-card">
            <header className="modal-card-head has-background-info-light">
                <h1 className="modal-card-title">Εισαγωγή Οδοιπορικών στην Κατάσταση</h1>
            </header>
            <section className="modal-card-body">
                {loadedRequests && matchedApprovedTravelcostRequests ? (
                    <table className="table is-striped">
                        <thead>
                            <tr>
                                <th></th>
                                <th>Επίθετο</th>
                                <th>Όνομα</th>
                                <th>Μήνας</th>
                                <th>Έτος</th>
                                <th>Ημέρες</th>
                            </tr>
                        </thead>
                        <tbody>
                            {matchedApprovedTravelcostRequests.map((travelcostrequest) => (
                                <tr key={travelcostrequest.id}>
                                    <td>
                                        <input
                                            type="checkbox"
                                            checked={selectedRequests.includes(travelcostrequest.id)}
                                            onChange={() => handleCheckboxChange(travelcostrequest.id)}
                                        />
                                    </td>
                                    <td>{travelcostrequest.last_name}</td>
                                    <td>{travelcostrequest.first_name}</td>
                                     <td>{travelcostrequest.month}</td>
                                    <td>{travelcostrequest.year}</td>
                                    <td>{travelcostrequest.number_of_travels}</td>
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

export default InsertTravelcostRequestToInventoryModal;
