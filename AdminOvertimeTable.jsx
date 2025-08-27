import React, { useContext, useEffect, useState } from "react";
import { UserContext } from "../context/UserContext";
import { PDFDownloadLink, pdf } from '@react-pdf/renderer';
import ErrorMessage from "./ErrorMessage";
import OvertimePaymentModal from "./OvertimePaymentModal";
import InsertOvertimeInventoryToPaymentModal from "./InsertOvertimeInventoryToPaymentModal";
import OvertimePaymentPDF from "./OvertimePaymentPDF";
 
const AdminOvertimeTable = () => {
  const [token] = useContext(UserContext);
  const [errorMessage, setErrorMessage] = useState("");

  const [loadedInventories, setLoadedInventories] = useState(false); 
  const [loadedPayments, setLoadedPayments] = useState(false);
  const [approvedOvertimeInventories, setApprovedOvertimeInventories] = useState(null);

  const [adminOvertimePayments, setAdminOvertimePayments] = useState(null);
  const [paymentId, setPaymentId] = useState(null);
  const [paymentMonth, setPaymentMonth] = useState(null);
  const [paymentYear, setPaymentYear] = useState(null);

  const [activeCreateModal, setActiveCreateModal] = useState(false);
  const [activeInsertModal, setActiveInsertModal] = useState(false);

  const [id, setId] = useState(null);
  const [disabledAdminOvertimePaymentButtons, setDisabledAdminOvertimePaymentButtons] = useState([]);
  const [expandedRow, setExpandedRow] = useState(null);
  const [insertedOvertimeInventories, setInsertedOvertimeInventories] = useState([]);

    
  // Function to get the approved overtime inventories
    useEffect(() => {
      const getApprovedOvertimeInventories = async () => {
        const requestOptions = {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token,
          },
        };
        const response = await fetch(`/api/admin/overtimeinventories/approved`, requestOptions);
  
        if (!response.ok) {
          setErrorMessage("Κάτι πήγε στραβά. Δεν μπόρεσαν να φορτωθούν οι εγκεκριμένες καταστάσεις υπερωριών  ");
        } else {
          const data = await response.json();
          setApprovedOvertimeInventories(data);
          setErrorMessage("");
          setLoadedInventories(true);
        }
      };
  
      getApprovedOvertimeInventories();
    }, [token, setErrorMessage]);

    const refreshApprovedOvertimeInventories = async () => {
        const requestOptions = {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token,
          },
        };
        const response = await fetch(`/api/admin/overtimeinventories/approved`, requestOptions);
        if (response.ok) {
          const data = await response.json();
          setApprovedOvertimeInventories(data);
        }
      };
  

  //Function to get the overtime payments  
  const getAdminOvertimePayments = async () => {
    const requestOptions = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
    };
    
    const response = await fetch(`/api/admin/overtimepayments`, requestOptions);
    if (!response.ok) {
      setErrorMessage("Kάτι πήγε στραβά. Δεν μπόρεσαν να φορτωθούν οι καταστάσεις πληρωμής υπερωριών");
    } else {
      const data = await response.json();
      setAdminOvertimePayments(data);
      setErrorMessage("");
      setLoadedPayments(true);
    }
  };
  
  useEffect(() => {
    getAdminOvertimePayments();
  }, [token]);

  const handleCreateModal = () => {
    setActiveCreateModal(!activeCreateModal);
    getAdminOvertimePayments();
    setId(null);
  };

  // Function to update an overtime payment
  const handleUpdateOvertimePayment = async (id) => {
    setId(id);
    setActiveCreateModal(true);
  };


 // Function to delete an overtime payment  
 const handleDeleteOvertimePayment = async (id) => {
  // Check if the payment has overtime inventories
  const requestOptionsCheck = {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
  };
  const checkResponse = await fetch(`/api/admin/overtimepayment/${id}/insertedinventories`, requestOptionsCheck);
  if (!checkResponse.ok) {
    setErrorMessage("Κάτι πήγε στραβά. Δεν μπόρεσε να ελεγχθεί η κατάσταση πληρωμής υπερωριών");
    return;
  }
  const insertedOvertimeInventories = await checkResponse.json();
  if (insertedOvertimeInventories.length > 0) {
    alert("Δεν μπορείτε να διαγράψετε την κατάσταση πληρωμής υπερωριών γιατί περιέχει υπερωρίες.");
    return;
  }

  // Proceed with deletion if no overtime inventories exist
  const confirmDeleteOvertimePayment = window.confirm("Είστε σίγουροι ότι θέλετε να διαγράψετε την κατάσταστη πληρωμής υπερωριών;");
        if (!confirmDeleteOvertimePayment) {
          return;
  }
  const requestOptions = {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
  };
  const response = await fetch(`/api/admin/overtimepayment/${id}`, requestOptions);
  if (!response.ok) {
    setErrorMessage("Κάτι πήγε στραβά. Δεν μπόρεσε να διαγραφεί η κατάσταση πληρωμής υπερωριών");
  } else {
    getAdminOvertimePayments();
    alert("Η κατάσταση πληρωμής υπερωριών διαγράφηκε επιτυχώς");
  }
};

const toggleRow = (id) => {
  setExpandedRow(expandedRow === id ? null : id);
};


  const handleInsertModal = () => {
    setActiveInsertModal(!activeInsertModal);
    getAdminOvertimePayments();
    setId(null);
  };

// Function to get the inserted overtime inventories of the selected payment
  const getInsertedOvertimeInventories = async (id) => {
    const requestOptions = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
    };

    const response = await fetch(`/api/admin/overtimepayment/${id}/insertedinventories`, requestOptions);
    if (!response.ok) {
      setErrorMessage("Kάτι πήγε στραβά. Δεν μπόρεσαν να φορτωθούν οι καταστάσεις εισηγμένων υπερωριών");
    } else {
      const data = await response.json();
      setInsertedOvertimeInventories(data);
      setErrorMessage("");
    }
  };

  useEffect(() => {
    if (expandedRow !== null) {
      getInsertedOvertimeInventories(expandedRow);
    }
  }, [expandedRow, token]);

  const refreshInsertedOvertimeInventories = async (id) => {
    const requestOptions = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
    };

    const response = await fetch(`/api/admin/overtimepayment/${id}/insertedinventories`, requestOptions);
    if (!response.ok) {
      setErrorMessage("Kάτι πήγε στραβά. Δεν μπόρεσαν να φορτωθούν τα αιτήματα εισηγμένων υπερωριών");
    } else {
      const data = await response.json();
      setInsertedOvertimeInventories(data);
      setErrorMessage("");
    }
  };
 
  // Function to remove the inserted overtime inventory from the selected payment
  const removeInsertedlOvertimeInventory = async (overtimeinventory_id) => {
    const confirmRemoveInsertedlOvertimeInventory = window.confirm("Είστε σίγουροι ότι θέλετε να αφαιρέσετε τις συγκεκριμένες υπερωρίες από την κατάσταση πληρωμής;");
        if (!confirmRemoveInsertedlOvertimeInventory) {
          return; 
    }   
    const requestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
    };
  
  const response = await fetch(`/api/admin/overtimepayment/${overtimeinventory_id}/removeinventory`, requestOptions);
  if (!response.ok) {
    setErrorMessage("Kάτι πήγε στραβά. Δεν μπόρεσαν να αφαιρεούν οι υπερωρίες από την κατάσταση πληρωμής");
  } else {
    setErrorMessage("");
    getInsertedOvertimeInventories(expandedRow);
    // Refresh approved overtime requests after removal
    refreshApprovedOvertimeInventories();
    refreshInsertedOvertimeInventories();
    alert("Οι υπερωρίες αφαιρέθηκαν επιτυχώς");
  }
};


  // Function to submit an overtime payment
  const handleFinalOvertimePayment = async (id) => {
    // Check if the payment has overtime inventories
    const requestOptionsCheck = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
    };
    const checkResponse = await fetch(`/api/admin/overtimepayment/${id}/insertedinventories`, requestOptionsCheck);
    if (!checkResponse.ok) {
      setErrorMessage("Κάτι πήγε στραβά. Δεν μπόρεσε να ελεγχθεί η κατάσταση πληρωμής υπερωριών");
      return;
    }
    const insertedOvertimeInventories = await checkResponse.json();
    if (insertedOvertimeInventories.length == 0) {
      alert("Δεν μπορείτε να ολοκληρώσετε την κατάσταση πληρωμής υπερωριών γιατί δεν περιέχει υπερωρίες.");
      return;
    }

    // Proceed with submiton if  overtime inventory exist
      const confirmFinalOvertimePayment = window.confirm("Είστε σίγουροι ότι θέλετε να ολοκληρώσετε την κατάσταση πληρωμής υπερωριών;");
        if (!confirmFinalOvertimePayment) {
          return;
      }
      const requestOptions = {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
         Authorization: "Bearer " + token,
        },
      };
      const response = await fetch(`/api/admin/overtimepayment/submitted/${id}`, requestOptions);
      if (!response.ok) {
        setErrorMessage("Κάτι πήγε στραβά. Δεν μπόρεσε να ολοκληρωθεί η κατάσταση πληρωμής υπερωριών");
      }
      setDisabledAdminOvertimePaymentButtons((prev) => [...prev, id]); // Add the index of the disabled button to the state
      getAdminOvertimePayments();
      alert("H κατάσταση πληρωμής υπερωριών ολοκληρώθηκε επιτυχώς");
      
    };  

    //function for creating a pdf with the overtime payment requests
    const handlePrintOvertimePayment = async (paymentId, paymentName) => {
      try {
        const requestOptions = {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
           Authorization: "Bearer " + token,
          },
        };
        const response = await fetch(`/api/admin/printovertimerequests/${paymentId}`, requestOptions);
        const data = await response.json();
    
        const blob = await pdf(<OvertimePaymentPDF requests={data} name={paymentName} />).toBlob();
    
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `overtime-payment-${paymentId}.pdf`;
        link.click();
        URL.revokeObjectURL(link.href);
      } catch (err) {
        console.error("Κάτι πήγε στραβά. Δεν μπόρεσε να δημιουργηθεί το PDF", err);
      }
    };

    //function for exporting an xml with the overtime payment requests
    const handleExportOvertimePayment = async (paymentId) => {
      try {
        const requestOptions = {
          method: "GET",
          headers: {
            Accept: "application/xml",
           Authorization: "Bearer " + token,
          },
        };
        const response = await fetch(`/api/admin/exportovertimepayment/${paymentId}`, requestOptions);
    
        if (!response.ok) {
          throw new Error("Δεν μπόρεσε να δημιουργηθεί το XML");
        }
    
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `overtime_payment_${paymentId}.xml`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      } catch (err) {
        console.error("Κάτι πήγε στραβά. Δεν μπόρεσε να δημιουργηθεί το XML", err);
      }
    };



 
    // Load disabledAdminOvertimePaymentButtons from localStorage on initial render
        useEffect(() => {
            const savedDisabledAdminOvertimePaymentButtons = localStorage.getItem("disabledAdminOvertimePaymentButtons");
            if (savedDisabledAdminOvertimePaymentButtons) {
              setDisabledAdminOvertimePaymentButtons(JSON.parse(savedDisabledAdminOvertimePaymentButtons));
            }
        }, []);
        
        // Update localStorage whenever disabledAdminOvertimePaymentButtons state changes
        useEffect(() => {
            localStorage.setItem("disabledAdminOvertimePaymentButtons", JSON.stringify(disabledAdminOvertimePaymentButtons));
        }, [disabledAdminOvertimePaymentButtons]);

 
  return ( 
    <>
      <ErrorMessage message={errorMessage} /> 
      <OvertimePaymentModal
        active={activeCreateModal}
        handleCreateModal={handleCreateModal}
        token={token}
        id={id}
        setErrorMessage={setErrorMessage}
      />
      <InsertOvertimeInventoryToPaymentModal
        active={activeInsertModal}
        handleInsertModal={handleInsertModal}
        paymentId={paymentId}
        paymentMonth={paymentMonth}
        paymentYear={paymentYear}
        token={token}
        setErrorMessage={setErrorMessage}
        refreshApprovedOvertimeInventories={refreshApprovedOvertimeInventories}
        refreshInsertedOvertimeInventories={() => refreshInsertedOvertimeInventories(paymentId)} // Pass the callback
        />  
    
      { loadedInventories && approvedOvertimeInventories ? (
        <>
          <div className="columns has-background-warning mb-5 mt-5 colSpan=5">
            <div className="column is-10 has-text-centered">
              <h4 className="title is-5 mt-2">Πίνακας Εγκεκριμένων Καταστάσεων Υπερωριών Εκπαιδευτικών</h4>
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
             {approvedOvertimeInventories.map((overtimeinventory, index) => (
              <tr key={overtimeinventory.id}>
                <td>{index+1}</td>
                <td>{overtimeinventory.school}</td>
                <td>{overtimeinventory.month}</td>
                <td>{overtimeinventory.year}</td>
              </tr>
              ))}
            </tbody>
          </table>
          </>      
        ) : (
        <button class="button is-loading">Loading</button>
      )}

      {loadedPayments && adminOvertimePayments ? (
        <>
          <div className="columns has-background-warning mb-5 mt-6">
            <div className="column is-10 has-text-centered">
              <h4 className="title is-5 mt-2">
                Πίνακας Καταστάσεων Πληρωμής Υπερωριών Διαχειριστή 
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
              {adminOvertimePayments.map((overtimepayment, index) => (
                <React.Fragment key={overtimepayment.id}>
                  {/* Parent Row */}
                  <tr key={overtimepayment.id}>
                    <td>
                      <button
                        className="button is-small"
                        onClick={() => {
                          setPaymentId(overtimepayment.id);
                          setPaymentMonth(overtimepayment.month);
                          setPaymentYear(overtimepayment.year);
                          toggleRow(overtimepayment.id)}
                        }
                      >
                        {expandedRow === overtimepayment.id ? (
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
                    <td>{overtimepayment.name}</td>
                    <td>{overtimepayment.month}</td> 
                    <td>{overtimepayment.year}</td>

                    <td className="has-text-centered">
                      <button
                        key={overtimepayment.id}
                        disabled={disabledAdminOvertimePaymentButtons.includes(overtimepayment.id)}
                        className="button mr-2 is-link is-light"
                        onClick={() => handleUpdateOvertimePayment(overtimepayment.id)}
                      >
                        Επεξεργασία
                      </button>
                      <button
                        key={overtimepayment.id}
                        disabled={disabledAdminOvertimePaymentButtons.includes(overtimepayment.id)}
                        className="button mr-2 is-danger is-light"
                        onClick={() => handleDeleteOvertimePayment(overtimepayment.id)}
                      >
                        Διαγραφή
                      </button>
                      <button
                        key={overtimepayment.id}
                        disabled={disabledAdminOvertimePaymentButtons.includes(overtimepayment.id)}
                        className="button mr-2 is-primary"
                        onClick={() => handleFinalOvertimePayment(overtimepayment.id)}
                      >
                        Ολοκλήρωση
                      </button>
                      </td>
                    <td>
                    {disabledAdminOvertimePaymentButtons.includes(overtimepayment.id) ? (
                        <>
                          <button
                            key={overtimepayment.id}
                            className="button mr-2 is-warning is-light"
                            onClick={() => handlePrintOvertimePayment(overtimepayment.id, overtimepayment.name)}
                          >
                            Σύνοψη
                          </button>
                          <button
                            key={overtimepayment.id}
                            className="button mr-2 is-warning"
                            onClick={() => handleExportOvertimePayment(overtimepayment.id)}
                          >
                            Δημιουργία xml
                          </button>
                        </>
                      ) : null}
                    </td>
                  </tr>

                  {/* Child Row - Requests */}
                  {expandedRow === overtimepayment.id && (
                    <tr>
                      <td colSpan="7">
                        <table className="table is-fullwidth is-narrow ml-6">
                          <thead>
                            <tr>
                              <th>
                                <button
                                  className="button is-small"
                                  onClick={() => {
                                    setPaymentId(overtimepayment.id);
                                    setPaymentMonth(overtimepayment.month);
                                    setPaymentYear(overtimepayment.year);
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
                            { insertedOvertimeInventories.length > 0 ? (
                                insertedOvertimeInventories.map((overtimeinventory, inventoryIndex) => (
                                  <tr key={overtimeinventory.id}>
                                    <td></td>
                                    <td>{inventoryIndex + 1}</td>
                                    <td>{overtimeinventory.school}</td>
                                    <td>{overtimeinventory.month}</td>
                                    <td>{overtimeinventory.year}</td>
                                    <td>
                                      <button 
                                      className="button is-danger"
                                      disabled={disabledAdminOvertimePaymentButtons.includes(overtimepayment.id)}
                                      onClick={() => removeInsertedlOvertimeInventory(overtimeinventory.id)}
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
                                  Δεν υπάρχουν υπερωρίες στην κατάσταση πληρωμής
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

export default AdminOvertimeTable;
