import React, { useEffect, useState } from "react"; 

const InsertExamInventoryToPaymentModal = ({ active, handleInsertModal, token, paymentId, paymentType, paymentMonth, paymentYear, setErrorMessage, refreshApprovedExamInventories, refreshInsertedExamInventories}) => {
  const [selectedExamInventories, setSelectedExamInventories] = useState([]);
  
  const [loadedExamInventories, setLoadedExamInventories] = useState(false); 
  const [matchedApprovedExamInventories, setMatchedApprovedExamInventories] = useState("");       //Variable for the selected school

  // Function to get the matched approved exam inventories
  useEffect(() => {
    const getMatchedApprovedExamInventories = async () => {
      const requestOptions = {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
      };
      const response = await fetch(`/api/admin/examinventories/${paymentType}/${paymentMonth}/${paymentYear}/matchedapproved`, requestOptions);
      if (!response.ok) {
        setErrorMessage("Κάτι πήγε στραβά. Δεν μπόρεσαν να φορτωθούν οι εγκεκριμένες συμμετοχές πανελλαδικών  ");
      } else {
        const data = await response.json();
        setMatchedApprovedExamInventories(data);
        setErrorMessage("");
        setLoadedExamInventories(true);
      }
    };
    if (active) {
      getMatchedApprovedExamInventories();
    }
  }, [token, setErrorMessage, paymentType, paymentMonth, paymentYear, active]);

    const handleCheckboxChange = (id) => {
      setSelectedExamInventories(prev =>
        prev.includes(id) ? prev.filter(reqId => reqId !== id) : [...prev, id]
      );
    };

// Function to insert an exam inventory to the payment
  const handleInsert = async () => {
    const requestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
       Authorization: "Bearer " + token,
      },
      body: JSON.stringify(selectedExamInventories),    
    };
    const response = await fetch(`/api/admin/exampayment/${paymentId}/insertinventories`, requestOptions);
    
    if (!response.ok) {
      setErrorMessage("Κάτι πήγε στραβά. Δεν μπόρεσαν να εισαχθούν οι συμμετοχές πανελλαδικών");
    }
      alert("Οι συμμετοχές πανελλαδικών εισήχθησαν επιτυχώς");
      refreshApprovedExamInventories(); // Refresh the approved exam Inventories
      refreshInsertedExamInventories(); // Refresh the inserted exam Inventories
      handleInsertModal();
  };  


return (
    <div className={`modal ${active && "is-active"}`}>
        <div className="modal-background" onClick={handleInsertModal}></div>
        <div className="modal-card">
            <header className="modal-card-head has-background-warning-light">
                <h1 className="modal-card-title">Εισαγωγή Πανελλαδικών στην Κατάστασης Πληρωμής</h1>
            </header>
            <section className="modal-card-body">
                {loadedExamInventories && matchedApprovedExamInventories ? (
                    <table className="table is-striped">
                        <thead>
                            <tr>
                                <th></th>
                                <th>Σχολείο</th>
                                <th>Τύπος</th>
                                <th>Μήνας</th>
                                <th>Έτος</th>
                            </tr>
                        </thead>
                        <tbody>
                            {matchedApprovedExamInventories.map((examinventory) => (
                                <tr key={examinventory.id}>
                                    <td>
                                        <input
                                            type="checkbox"
                                            checked={selectedExamInventories.includes(examinventory.id)}
                                            onChange={() => handleCheckboxChange(examinventory.id)}
                                        />
                                    </td>
                                    <td>{examinventory.school}</td>
                                    <td>{examinventory.type}</td>
                                    <td>{examinventory.month}</td>
                                    <td>{examinventory.year}</td>
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
                    onClick={() => handleInsert(selectedExamInventories)}
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

export default InsertExamInventoryToPaymentModal;
