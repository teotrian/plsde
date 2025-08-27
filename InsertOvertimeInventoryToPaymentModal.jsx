import React, { useEffect, useState } from "react"; 

const InsertOvertimeInventoryToPaymentModal = ({ active, handleInsertModal, token, paymentId, paymentMonth, paymentYear, setErrorMessage, refreshApprovedOvertimeInventories, refreshInsertedOvertimeInventories}) => {
  const [selectedOvertimeInventories, setSelectedOvertimeInventories] = useState([]);
  
  const [loadedOvertimeInventories, setLoadedOvertimeInventories] = useState(false); 
  const [matchedApprovedOvertimeInventories, setMatchedApprovedOvertimeInventories] = useState("");       //Variable for the selected school

  // Function to get the matched approved overtime inventories
  useEffect(() => {
    const getMatchedApprovedOvertimeInventories = async () => {
      const requestOptions = {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
      };
      const response = await fetch(`/api/admin/overtimeinventories/${paymentMonth}/${paymentYear}/matchedapproved`, requestOptions);

      if (!response.ok) {
        setErrorMessage("Κάτι πήγε στραβά. Δεν μπόρεσαν να φορτωθούν οι εγκεκριμένες υπερωρίες  ");
      } else {
        const data = await response.json();
        setMatchedApprovedOvertimeInventories(data);
        setErrorMessage("");
        setLoadedOvertimeInventories(true);
      }
    };

    if (active) {
      getMatchedApprovedOvertimeInventories();
    }
  }, [token, setErrorMessage, paymentMonth, paymentYear, active]);


    const handleCheckboxChange = (id) => {
      setSelectedOvertimeInventories(prev =>
        prev.includes(id) ? prev.filter(reqId => reqId !== id) : [...prev, id]
      );
    };

// Function to insert an overtime inventory to the payment
  const handleInsert = async () => {
    const requestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
       Authorization: "Bearer " + token,
      },
      body: JSON.stringify(selectedOvertimeInventories),    
    };
    const response = await fetch(`/api/admin/overtimepayment/${paymentId}/insertinventories`, requestOptions);
    
    if (!response.ok) {
      setErrorMessage("Κάτι πήγε στραβά. Δεν μπόρεσαν να εισαχθούν οι  υπερωρίες");
    }
      alert("Οι υπερωρίες εισήχθησαν επιτυχώς");
      refreshApprovedOvertimeInventories(); // Refresh the approved overtime Inventories
      refreshInsertedOvertimeInventories(); // Refresh the inserted overtime Inventories
      handleInsertModal();
  };  


return (
    <div className={`modal ${active && "is-active"}`}>
        <div className="modal-background" onClick={handleInsertModal}></div>
        <div className="modal-card">
            <header className="modal-card-head has-background-warning-light">
                <h1 className="modal-card-title">Εισαγωγή Υπερωριών στην Κατάστασης Πληρωμής</h1>
            </header>
            <section className="modal-card-body">
                {loadedOvertimeInventories && matchedApprovedOvertimeInventories ? (
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
                            {matchedApprovedOvertimeInventories.map((overtimeinventory) => (
                                <tr key={overtimeinventory.id}>
                                    <td>
                                        <input
                                            type="checkbox"
                                            checked={selectedOvertimeInventories.includes(overtimeinventory.id)}
                                            onChange={() => handleCheckboxChange(overtimeinventory.id)}
                                        />
                                    </td>
                                    <td>{overtimeinventory.school}</td>
                                    <td>{overtimeinventory.month}</td>
                                    <td>{overtimeinventory.year}</td>
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
                    onClick={() => handleInsert(selectedOvertimeInventories)}
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

export default InsertOvertimeInventoryToPaymentModal;
