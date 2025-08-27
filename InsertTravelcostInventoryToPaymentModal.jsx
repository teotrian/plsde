import React, { useEffect, useState } from "react"; 

const InsertTravelcostInventoryToPaymentModal = ({ active, handleInsertModal, token, paymentId, paymentMonth, paymentYear, setErrorMessage, refreshApprovedTravelcostInventories, refreshInsertedTravelcostInventories}) => {
  const [selectedTravelcostInventories, setSelectedTravelcostInventories] = useState([]);
  
  const [loadedTravelcostInventories, setLoadedTravelcostInventories] = useState(false); 
  const [matchedApprovedTravelcostInventories, setMatchedApprovedTravelcostInventories] = useState("");       //Variable for the selected school

  // Function to get the matched approved Travelcost inventories
  useEffect(() => {
    const getMatchedApprovedTravelcostInventories = async () => {
      const requestOptions = {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
      };
      const response = await fetch(`/api/admin/travelcostinventories/${paymentMonth}/${paymentYear}/matchedapproved`, requestOptions);

      if (!response.ok) {
        setErrorMessage("Κάτι πήγε στραβά. Δεν μπόρεσαν να φορτωθούν οι εγκεκριμένες καταστάσεις οδοιπορικών  ");
      } else {
        const data = await response.json();
        setMatchedApprovedTravelcostInventories(data);
        setErrorMessage("");
        setLoadedTravelcostInventories(true);
      }
    };
    if (active) {
      getMatchedApprovedTravelcostInventories();
    }
  }, [token, setErrorMessage, paymentMonth, paymentYear, active]);

    const handleCheckboxChange = (id) => {
      setSelectedTravelcostInventories(prev =>
        prev.includes(id) ? prev.filter(reqId => reqId !== id) : [...prev, id]
      );
    };

// Function to insert an Travelcost inventory to the payment
  const handleInsert = async () => {
    const requestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
       Authorization: "Bearer " + token,
      },
      body: JSON.stringify(selectedTravelcostInventories),    
    };
    const response = await fetch(`/api/admin/travelcostpayment/${paymentId}/insertinventories`, requestOptions);
    
    if (!response.ok) {
      setErrorMessage("Κάτι πήγε στραβά. Δεν μπόρεσαν να εισαχθούν τα συγκεκριμένα οδοιπορικά");
    }
      alert("Τα οδοιπορικά εισήχθησαν επιτυχώς");
      refreshApprovedTravelcostInventories(); // Refresh the approved Travelcost Inventories
      refreshInsertedTravelcostInventories(); // Refresh the inserted Travelcost Inventories
      handleInsertModal();
  };  


return (
    <div className={`modal ${active && "is-active"}`}>
        <div className="modal-background" onClick={handleInsertModal}></div>
        <div className="modal-card">
            <header className="modal-card-head has-background-warning-light">
                <h1 className="modal-card-title">Εισαγωγή Οδοιπορικών στην Κατάστασης Πληρωμής</h1>
            </header>
            <section className="modal-card-body">
                {loadedTravelcostInventories && matchedApprovedTravelcostInventories ? (
                    <table className="table is-striped">
                        <thead>
                            <tr>
                                <th></th>
                                <th>Σχολείο</th>
                                <th>Μήνας</th>
                                <th>Έτος</th>
                            </tr>
                        </thead>
                        <tbody>
                            {matchedApprovedTravelcostInventories.map((travelcostinventory) => (
                                <tr key={travelcostinventory.id}>
                                    <td>
                                        <input
                                            type="checkbox"
                                            checked={selectedTravelcostInventories.includes(travelcostinventory.id)}
                                            onChange={() => handleCheckboxChange(travelcostinventory.id)}
                                        />
                                    </td>
                                    <td>{travelcostinventory.school}</td>
                                    <td>{travelcostinventory.month}</td>
                                    <td>{travelcostinventory.year}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p>Κάτι πήγε στραβά</p>
                )}
            </section>
            <footer className="modal-card-foot has-background-warning-light">
                <button
                    className="button is-info"
                    onClick={() => handleInsert(selectedTravelcostInventories)}
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

export default InsertTravelcostInventoryToPaymentModal;
