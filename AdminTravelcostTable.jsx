import React, { useContext, useEffect, useState } from "react";
import { UserContext } from "../context/UserContext";
import { PDFDownloadLink, pdf } from '@react-pdf/renderer';
import ErrorMessage from "./ErrorMessage";
import TravelcostPaymentModal from "./TravelcostPaymentModal";
import InsertTravelcostInventoryToPaymentModal from "./InsertTravelcostInventoryToPaymentModal";
import TravelcostPaymentPDF from "./TravelcostPaymentPDF";

 
const AdminTravelcostTable = () => {
  const [token] = useContext(UserContext);
  const [errorMessage, setErrorMessage] = useState("");

  const [loadedInventories, setLoadedInventories] = useState(false); 
  const [loadedPayments, setLoadedPayments] = useState(false);
  const [approvedTravelcostInventories, setApprovedTravelcostInventories] = useState(null);

  const [adminTravelcostPayments, setAdminTravelcostPayments] = useState(null);
  const [paymentId, setPaymentId] = useState(null);
  const [paymentMonth, setPaymentMonth] = useState(null);
  const [paymentYear, setPaymentYear] = useState(null);
  

  const [activeCreateModal, setActiveCreateModal] = useState(false);
  const [activeInsertModal, setActiveInsertModal] = useState(false);

  const [id, setId] = useState(null);
  const [disabledAdminTravelcostPaymentButtons, setDisabledAdminTravelcostPaymentButtons] = useState([]);
  const [expandedRow, setExpandedRow] = useState(null);
  const [insertedTravelcostInventories, setInsertedTravelcostInventories] = useState([]);

    
  // Function to get the approved Travelcost inventories
    useEffect(() => {
      const getApprovedTravelcostInventories = async () => {
        const requestOptions = {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token,
          },
        };
        const response = await fetch(`/api/admin/travelcostinventories/approved`, requestOptions);
  
        if (!response.ok) {
          setErrorMessage("Κάτι πήγε στραβά. Δεν μπόρεσαν να φορτωθούν οι εγκεκριμένες καταστάσεις οδοιπορικών  ");
        } else {
          const data = await response.json();
          setApprovedTravelcostInventories(data);
          setErrorMessage("");
          setLoadedInventories(true);
        }
      };
  
      getApprovedTravelcostInventories();
    }, [token, setErrorMessage]);

    const refreshApprovedTravelcostInventories = async () => {
        const requestOptions = {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token,
          },
        };
        const response = await fetch(`/api/admin/travelcostinventories/approved`, requestOptions);
        if (response.ok) {
          const data = await response.json();
          setApprovedTravelcostInventories(data);
        }
      };
  

  //Function to get the Travelcost payments  
  const getAdminTravelcostPayments = async () => {
    const requestOptions = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
    };
    
    const response = await fetch(`/api/admin/travelcostpayments`, requestOptions);
    if (!response.ok) {
      setErrorMessage("Kάτι πήγε στραβά. Δεν μπόρεσαν να φορτωθούν οι καταστάσεις πληρωμής οδοιπορικών");
    } else {
      const data = await response.json();
      setAdminTravelcostPayments(data);
      setErrorMessage("");
      setLoadedPayments(true);
    }
  };
  
  useEffect(() => {
    getAdminTravelcostPayments();
  }, [token]);

  const handleCreateModal = () => {
    setActiveCreateModal(!activeCreateModal);
    getAdminTravelcostPayments();
    setId(null);
  };

  // Function to update an Travelcost payment
  const handleUpdateTravelcostPayment = async (id) => {
    setId(id);
    setActiveCreateModal(true);
  };


 // Function to delete an Travelcost payment  
 const handleDeleteTravelcostPayment = async (id) => {
  // Check if the payment has Travelcost inventories
  const requestOptionsCheck = {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
  };
  const checkResponse = await fetch(`/api/admin/travelcostpayment/${id}/insertedinventories`, requestOptionsCheck);
  if (!checkResponse.ok) {
    setErrorMessage("Κάτι πήγε στραβά. Δεν μπόρεσε να ελεγχθεί η κατάσταση πληρωμής οδοιπορικών");
    return;
  }
  const insertedTravelcostInventories = await checkResponse.json();
  if (insertedTravelcostInventories.length > 0) {
    alert("Δεν μπορείτε να διαγράψετε την κατάσταση πληρωμής οδοιπορικών γιατί περιέχει οδοιπορικά.");
    return;
  }

  // Proceed with deletion if no Travelcost inventories exist
  const confirmDeleteTravelcostPayment = window.confirm("Είστε σίγουροι ότι θέλετε να διαγράψετε την κατάσταστη πληρωμής οδοιπορικών;");
        if (!confirmDeleteTravelcostPayment) {
          return;
  }
  const requestOptions = {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
  };
  const response = await fetch(`/api/admin/travelcostpayment/${id}`, requestOptions);
  if (!response.ok) {
    setErrorMessage("Κάτι πήγε στραβά. Δεν μπόρεσε να διαγραφεί η κατάσταση πληρωμής οδοιπορικών");
  } else {
    getAdminTravelcostPayments();
    alert("Η κατάσταση πληρωμής οδοιπορικών διαγράφηκε επιτυχώς");
  }
};

const toggleRow = (id) => {
  setExpandedRow(expandedRow === id ? null : id);
};


  const handleInsertModal = () => {
    setActiveInsertModal(!activeInsertModal);
    getAdminTravelcostPayments();
    setId(null);
  };

// Function to get the inserted Travelcost inventories of the selected payment
  const getInsertedTravelcostInventories = async (id) => {
    const requestOptions = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
    };

    const response = await fetch(`/api/admin/travelcostpayment/${id}/insertedinventories`, requestOptions);
    if (!response.ok) {
      setErrorMessage("Kάτι πήγε στραβά. Δεν μπόρεσαν να φορτωθούν οι καταστάσεις εισηγμένων οδοιπορικών");
    } else {
      const data = await response.json();
      setInsertedTravelcostInventories(data);
      setErrorMessage("");
    }
  };

  useEffect(() => {
    if (expandedRow !== null) {
      getInsertedTravelcostInventories(expandedRow);
    }
  }, [expandedRow, token]);

  const refreshInsertedTravelcostInventories = async (id) => {
    const requestOptions = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
    };

    const response = await fetch(`/api/admin/travelcostpayment/${id}/insertedinventories`, requestOptions);
    if (!response.ok) {
      setErrorMessage("Kάτι πήγε στραβά. Δεν μπόρεσαν να φορτωθούν τα αιτήματα εισηγμένων οδοιπορικών");
    } else {
      const data = await response.json();
      setInsertedTravelcostInventories(data);
      setErrorMessage("");
    }
  };
 
  // Function to remove the inserted Travelcost inventory from the selected payment
  const removeInsertedlTravelcostInventory = async (travelcostinventory_id) => {
    const confirmRemoveInsertedlTravelcostInventory = window.confirm("Είστε σίγουροι ότι θέλετε να αφαιρέσετε τα οδοιπορικά από την κατάσταση πληρωμής;");
        if (!confirmRemoveInsertedlTravelcostInventory) {
          return;
    }   
    const requestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
    };
  
  const response = await fetch(`/api/admin/travelcostpayment/${travelcostinventory_id}/removeinventory`, requestOptions);
  if (!response.ok) {
    setErrorMessage("Kάτι πήγε στραβά. Δεν μπόρεσαν να αφαιρεθούν τα οδοιπορικά από την κατάσταση πληρωμής");
  } else {
    setErrorMessage("");
    getInsertedTravelcostInventories(expandedRow);
    refreshApprovedTravelcostInventories();
    refreshInsertedTravelcostInventories();
    alert("Τα οδοιπορικά αφαιρέθηκαν επιτυχώς");
  }
};


  // Function to submit an Travelcost payment
  const handleFinalTravelcostPayment = async (id) => {
    // Check if the payment has Travelcost inventories
    const requestOptionsCheck = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
    };
    const checkResponse = await fetch(`/api/admin/travelcostpayment/${id}/insertedinventories`, requestOptionsCheck);
    if (!checkResponse.ok) {
      setErrorMessage("Κάτι πήγε στραβά. Δεν μπόρεσε να ελεγχθεί η κατάσταση πληρωμής οδοιπορικών");
      return;
    }
    const insertedTravelcostInventories = await checkResponse.json();
    if (insertedTravelcostInventories.length == 0) {
      alert("Δεν μπορείτε να ολοκληρώσετε την κατάσταση πληρωμής οδοιπορικών γιατί δεν περιέχει οδοιπορικά.");
      return;
    }

    // Proceed with submiton if  Travelcost inventory exist
    const confirmFinalTravelcostPayment = window.confirm("Είστε σίγουροι ότι θέλετε να ολοκληρώσετε την κατάσταση πληρωμής οδοιπορικών;");
        if (!confirmFinalTravelcostPayment) {
          return;
    }  
    const requestOptions = {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
         Authorization: "Bearer " + token,
        },
      };
      const response = await fetch(`/api/admin/travelcostpayment/submitted/${id}`, requestOptions);
      if (!response.ok) {
        setErrorMessage("Κάτι πήγε στραβά. Δεν μπόρεσε να ολοκληρωθεί η κατάσταση πληρωμής οδοιπορικών");
      }
      setDisabledAdminTravelcostPaymentButtons((prev) => [...prev, id]); // Add the index of the disabled button to the state
      getAdminTravelcostPayments();
      alert("H κατάσταση πληρωμής οδοιπορικών ολοκληρώθηκε επιτυχώς");
      
    };  

    const handlePrintTravelcostPayment = async (paymentId, paymentName) => {
      try {
        const requestOptions = {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
           Authorization: "Bearer " + token,
          },
        };
        const response = await fetch(`/api/admin/printtravelcostrequests/${paymentId}`, requestOptions);
        const data = await response.json();
    
        const blob = await pdf(<TravelcostPaymentPDF requests={data} name={paymentName}/>).toBlob();
    
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `travelcost-payment-${paymentId}.pdf`;
        link.click();
        URL.revokeObjectURL(link.href);
      } catch (err) {
        console.error("Κάτι πήγε στραβά. Δεν μπόρεσε να δημιουργηθεί το PDF", err);
      }
    };

    const handleExportTravelcostPayment = async (paymentId) => {
      try {
        const requestOptions = {
          method: "GET",
          headers: {
            Accept: "application/xml",
           Authorization: "Bearer " + token,
          },
        };
        const response = await fetch(`/api/admin/exporttravelcostpayment/${paymentId}`, requestOptions);
    
        if (!response.ok) {
          throw new Error("Δεν μπόρεσε να δημιουργηθεί το XML");
        }
    
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `travelcost_payment_${paymentId}.xml`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      } catch (err) {
        console.error("Κάτι πήγε στραβά. Δεν μπόρεσε να δημιουργηθεί το XML", err);
      }
    };



 
    // Load disabledAdminTravelcostPaymentButtons from localStorage on initial render
        useEffect(() => {
            const savedDisabledAdminTravelcostPaymentButtons = localStorage.getItem("disabledAdminTravelcostPaymentButtons");
            if (savedDisabledAdminTravelcostPaymentButtons) {
              setDisabledAdminTravelcostPaymentButtons(JSON.parse(savedDisabledAdminTravelcostPaymentButtons));
            }
        }, []);
        
        // Update localStorage whenever disabledAdminTravelcostPaymentButtons state changes
        useEffect(() => {
            localStorage.setItem("disabledAdminTravelcostPaymentButtons", JSON.stringify(disabledAdminTravelcostPaymentButtons));
        }, [disabledAdminTravelcostPaymentButtons]);

 
  return (
    <>
      <ErrorMessage message={errorMessage} /> 
      <TravelcostPaymentModal
        active={activeCreateModal}
        handleCreateModal={handleCreateModal}
        token={token}
        id={id}
        setErrorMessage={setErrorMessage}
      />
      <InsertTravelcostInventoryToPaymentModal
        active={activeInsertModal}
        handleInsertModal={handleInsertModal}
        paymentId={paymentId}
        paymentMonth={paymentMonth}
        paymentYear={paymentYear}
        token={token}
        setErrorMessage={setErrorMessage}
        refreshApprovedTravelcostInventories={refreshApprovedTravelcostInventories}
        refreshInsertedTravelcostInventories={() => refreshInsertedTravelcostInventories(paymentId)} // Pass the callback
        />  
    
      { loadedInventories && approvedTravelcostInventories ? (
        <>
          <div className="columns has-background-warning mb-5 mt-5 colSpan=5">
            <div className="column is-10 has-text-centered">
              <h4 className="title is-5 mt-2">Πίνακας Εγκεκριμένων Καταστάσεων Οδοιπορικών Εκπαιδευτικών</h4>
            </div>
          </div>
        
         <table className="table is-fullwidth">
            <thead>
              <tr>
                <th>A/A</th>
                <th>Σχολείο</th>
                <th>Μήνας</th>
                <th>Έτος</th>
             </tr>
            </thead>
            <tbody>
             {approvedTravelcostInventories.map((travelcostinventory, index) => (
              <tr key={travelcostinventory.id}>
                <td>{index+1}</td>
                <td>{travelcostinventory.school}</td>
                <td>{travelcostinventory.month}</td>
                <td>{travelcostinventory.year}</td>
              </tr>
              ))}
            </tbody>
          </table>
          </>      
        ) : (
        <button class="button is-loading">Loading</button>
      )}

      {loadedPayments && adminTravelcostPayments ? (
        <>
          <div className="columns has-background-warning mb-5 mt-6">
            <div className="column is-10 has-text-centered">
              <h4 className="title is-5 mt-2">
                Πίνακας Καταστάσεων Πληρωμής Οδοιπορικών Διαχειριστή 
              </h4>
            </div>
            <div className="column">
              <button
                className="button mr-2 is-info is-light"
                onClick={() => setActiveCreateModal(true)}
              >
                Δημιουργία
              </button>
            </div>
          </div>

          <table className="table is-fullwidth is-hoverable is-striped">
            <thead>
              <tr>
                <th></th>
                <th>A/A</th>
                <th>Όνομα</th>
                <th>Μήνας</th>
                <th>Έτος</th>
                <th className="has-text-centered">Ενέργειες</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {adminTravelcostPayments.map((travelcostpayment, index) => (
                <React.Fragment key={travelcostpayment.id}>
                  {/* Parent Row */}
                  <tr key={travelcostpayment.id}>
                    <td>
                      <button
                        className="button is-small"
                        onClick={() => {
                          setPaymentId(travelcostpayment.id);
                          setPaymentMonth(travelcostpayment.month);
                          setPaymentYear(travelcostpayment.year);
                          toggleRow(travelcostpayment.id)}
                        }
                      >
                        {expandedRow === travelcostpayment.id ? (
                          <span className="icon">
                            <i className="fas fa-angle-down"></i>
                          </span>
                        ) : (
                          <span className="icon">
                            <i className="fas fa-angle-right"></i>
                          </span>
                        )}
                      </button>
                    </td>
                    <td>{index + 1}</td>
                    <td>{travelcostpayment.name}</td>
                    <td>{travelcostpayment.month}</td> 
                    <td>{travelcostpayment.year}</td>

                    <td className="has-text-centered">
                      <button
                        key={travelcostpayment.id}
                        disabled={disabledAdminTravelcostPaymentButtons.includes(travelcostpayment.id)}
                        className="button mr-2 is-link is-light"
                        onClick={() => handleUpdateTravelcostPayment(travelcostpayment.id)}
                      >
                        Επεξεργασία
                      </button>
                      <button
                        key={travelcostpayment.id}
                        disabled={disabledAdminTravelcostPaymentButtons.includes(travelcostpayment.id)}
                        className="button mr-2 is-danger is-light"
                        onClick={() => handleDeleteTravelcostPayment(travelcostpayment.id)}
                      >
                        Διαγραφή
                      </button>
                      <button
                        key={travelcostpayment.id}
                        disabled={disabledAdminTravelcostPaymentButtons.includes(travelcostpayment.id)}
                        className="button mr-2 is-primary"
                        onClick={() => handleFinalTravelcostPayment(travelcostpayment.id)}
                      >
                        Ολοκλήρωση
                      </button>
                      </td>
                    <td>
                      {disabledAdminTravelcostPaymentButtons.includes(travelcostpayment.id) ? (
                        <>
                          <button
                            key={travelcostpayment.id}
                            className="button mr-2 is-warning is-light"
                            onClick={() => handlePrintTravelcostPayment(travelcostpayment.id, travelcostpayment.name)}
                          >
                            Σύνοψη
                          </button>
                          <button
                            key={travelcostpayment.id}
                            className="button mr-2 is-warning"
                            onClick={() => handleExportTravelcostPayment(travelcostpayment.id)}
                          >
                            Δημιουργία xml
                          </button>
                        </>
                      ) : null}
                    </td>
                  </tr>

                  {/* Child Row - Requests */}
                  {expandedRow === travelcostpayment.id && (
                    <tr>
                      <td colSpan="7">
                        <table className="table is-fullwidth is-narrow ml-6">
                          <thead>
                            <tr>
                              <th>
                                <button
                                  className="button is-small"
                                  onClick={() => {
                                    setPaymentId(travelcostpayment.id);
                                    setPaymentMonth(travelcostpayment.month);
                                    setPaymentYear(travelcostpayment.year);
                                    //alert(paymentId);
                                    //alert(paymentMonth);
                                    setActiveInsertModal(true);
                                  }}
                                >
                                  <span className="icon">
                                    <i className="fas fa-plus"></i>
                                  </span>
                                </button>
                              </th>
                              <th>A/A</th>
                              <th>Σχολείο</th>
                              <th>Μήνας</th>
                              <th>Έτος</th>
                              <th></th>
                            </tr>
                          </thead>
                          <tbody>
                            { insertedTravelcostInventories.length > 0 ? (
                                insertedTravelcostInventories.map((travelcostinventory, inventoryIndex) => (
                                  <tr key={travelcostinventory.id}>
                                    <td></td>
                                    <td>{inventoryIndex + 1}</td>
                                    <td>{travelcostinventory.school}</td>
                                    <td>{travelcostinventory.month}</td>
                                    <td>{travelcostinventory.year}</td>
                                    <td>
                                      <button 
                                      className="button is-danger"
                                      disabled={disabledAdminTravelcostPaymentButtons.includes(travelcostpayment.id)}
                                      onClick={() => removeInsertedlTravelcostInventory(travelcostinventory.id)}
                                      >
                                        <span className="icon">
                                        <i class="fa-solid fa-trash"></i>
                                        </span>
                                      </button>
                                    </td>
                                  </tr>
                                ))
                            ) : (
                              <tr>
                                <td colSpan="7" className="has-text-centered">
                                  Δεν υπάρχουν οδοιπορικά στην κατάσταση πληρωμής
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </>
      ) : (
        <button class="button is-loading">Loading</button>
      )}
    </>
  );
};

export default AdminTravelcostTable;
