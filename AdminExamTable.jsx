import React, { useContext, useEffect, useState } from "react";
import { UserContext } from "../context/UserContext";
import { PDFDownloadLink, pdf } from '@react-pdf/renderer';
import ErrorMessage from "./ErrorMessage";
import ExamPaymentModal from "./ExamPaymentModal";
import InsertExamInventoryToPaymentModal from "./InsertExamInventoryToPaymentModal";
import ExamPaymentPDF from './ExamPaymentPDF';

 
const AdminExamTable = () => {
  const [token] = useContext(UserContext);
  const [errorMessage, setErrorMessage] = useState("");

  const [loadedInventories, setLoadedInventories] = useState(false); 
  const [loadedPayments, setLoadedPayments] = useState(false);
  const [approvedExamInventories, setApprovedExamInventories] = useState(null);

  const [adminExamPayments, setAdminExamPayments] = useState(null);
  const [paymentId, setPaymentId] = useState(null);
  const [paymentType, setPaymentType] = useState(null);  
  const [paymentName, setPaymentName] = useState(null); 
  const [paymentMonth, setPaymentMonth] = useState(null);
  const [paymentYear, setPaymentYear] = useState(null);

  const [activeCreateModal, setActiveCreateModal] = useState(false);
  const [activeInsertModal, setActiveInsertModal] = useState(false);

  const [id, setId] = useState(null);
  const [disabledAdminExamPaymentButtons, setDisabledAdminExamPaymentButtons] = useState([]);
  const [expandedRow, setExpandedRow] = useState(null);
  const [insertedExamInventories, setInsertedExamInventories] = useState([]);

    
  // Function to get the approved Exam inventories
    useEffect(() => {
      const getApprovedExamInventories = async () => {
        const requestOptions = {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token,
          },
        }; 
        const response = await fetch(`/api/admin/examinventories/approved`, requestOptions);
  
        if (!response.ok) {
          setErrorMessage("Κάτι πήγε στραβά. Δεν μπόρεσαν να φορτωθούν οι εγκεκριμένες καταστάσεις πανελλαδικών  ");
        } else {
          const data = await response.json();
          setApprovedExamInventories(data);
          setErrorMessage("");
          setLoadedInventories(true);
        }
      };
  
      getApprovedExamInventories();
    }, [token, setErrorMessage]);

    const refreshApprovedExamInventories = async () => {
        const requestOptions = {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token,
          },
        };
        const response = await fetch(`/api/admin/examinventories/approved`, requestOptions);
        if (response.ok) {
          const data = await response.json();
          setApprovedExamInventories(data);
        }
      };
  

  //Function to get the Exam payments  
  const getAdminExamPayments = async () => {
    const requestOptions = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
    };
    
    const response = await fetch(`/api/admin/exampayments`, requestOptions);
    if (!response.ok) {
      setErrorMessage("Kάτι πήγε στραβά. Δεν μπόρεσαν να φορτωθούν οι καταστάσεις πληρωμής πανελλαδικών  ");
    } else {
      const data = await response.json();
      setAdminExamPayments(data);
      setErrorMessage("");
      setLoadedPayments(true);
    }
  };
  
  useEffect(() => {
    getAdminExamPayments();
  }, [token]);

  const handleCreateModal = () => {
    setActiveCreateModal(!activeCreateModal);
    getAdminExamPayments();
    setId(null);
  };

  // Function to update an Exam payment
  const handleUpdateExamPayment = async (id) => {
    setId(id);
    setActiveCreateModal(true);
  };


 // Function to delete an Exam payment  
 const handleDeleteExamPayment = async (id) => {
  // Check if the payment has Exam inventories
  const requestOptionsCheck = {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
  };
  const checkResponse = await fetch(`/api/admin/exampayment/${id}/insertedinventories`, requestOptionsCheck);
  if (!checkResponse.ok) {
    setErrorMessage("Κάτι πήγε στραβά. Δεν μπόρεσε να ελεγχθεί η κατάσταση πληρωμής πανελλαδικών");
    return;
  }
  const insertedExamInventories = await checkResponse.json();
  if (insertedExamInventories.length > 0) {
    alert("Δεν μπορείτε να διαγράψετε την κατάσταση πληρωμής πανελλαδικών γιατί περιέχει πανελλαδικές συμμετοχές.");
    return;
  }

  // Proceed with deletion if no exam inventories exist
  const confirmDeleteExamPayment = window.confirm("Είστε σίγουροι ότι θέλετε να διαγράψετε την κατάσταστη πληρωμής πανελλαδικών;");
        if (!confirmDeleteExamPayment) {
          return;
  }
  const requestOptions = {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
  };
  const response = await fetch(`/api/admin/exampayment/${id}`, requestOptions);
  if (!response.ok) {
    setErrorMessage("Κάτι πήγε στραβά. Δεν μπόρεσε να διαγραφεί η κατάσταση πληρωμής πανελλαδικών");
  } else {
    getAdminExamPayments();
    alert("Η κατάσταση πληρωμής πανελλαδικών διαγράφηκε επιτυχώς");
  }
};

const toggleRow = (id) => {
  setExpandedRow(expandedRow === id ? null : id);
};


  const handleInsertModal = () => {
    setActiveInsertModal(!activeInsertModal);
    getAdminExamPayments();
    setId(null);
  };

// Function to get the inserted Exam inventories of the selected payment
  const getInsertedExamInventories = async (id) => {
    const requestOptions = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
    };

    const response = await fetch(`/api/admin/exampayment/${id}/insertedinventories`, requestOptions);
    if (!response.ok) {
      setErrorMessage("Kάτι πήγε στραβά. Δεν μπόρεσαν να φορτωθούν οι καταστάσεις εισηγμένων πανελλαδικών ");
    } else {
      const data = await response.json();
      setInsertedExamInventories(data);
      setErrorMessage("");
    }
  };

  useEffect(() => {
    if (expandedRow !== null) {
      getInsertedExamInventories(expandedRow);
    }
  }, [expandedRow, token]);

  const refreshInsertedExamInventories = async (id) => {
    const requestOptions = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
    };

    const response = await fetch(`api/admin/exampayment/${id}/insertedinventories`, requestOptions);
    if (!response.ok) {
      setErrorMessage("Kάτι πήγε στραβά. Δεν μπόρεσαν να φορτωθούν τα αιτήματα εισηγμένων πανελλαδικών ");
    } else {
      const data = await response.json();
      setInsertedExamInventories(data);
      setErrorMessage("");
    }
  };
 
  // Function to remove the inserted Exam inventory from the selected payment
  const removeInsertedlExamInventory = async (examinventory_id) => {
    const confirmRemoveInsertedlExamInventory = window.confirm("Είστε σίγουροι ότι θέλετε να αφαιρέσετε τις συμμετοχές εκπαιδευτικών από την κατάσταση πληρωμής;");
        if (!confirmRemoveInsertedlExamInventory) {
          return;
    }       
    const requestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
    };
  
  const response = await fetch(`/api/admin/exampayment/${examinventory_id}/removeinventory`, requestOptions);
  if (!response.ok) {
    setErrorMessage("Kάτι πήγε στραβά. Δεν μπόρεσε να αφαιρεθούν οι συμμετοχές πανελλαδικών από την κατάσταση πληρωμής");
  } else {
    setErrorMessage("");
    getInsertedExamInventories(expandedRow);
    // Refresh approved Exam requests after removal
    refreshApprovedExamInventories();
    refreshInsertedExamInventories();
    alert("Οι συμμετοχές πανελλαδικών αφαιρέθηκαν επιτυχώς");
  }
};


  // Function to submit an Exam payment
  const handleFinalExamPayment = async (id) => {
    // Check if the payment has Exam inventories
    const requestOptionsCheck = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
    };
    const checkResponse = await fetch(`/api/admin/exampayment/${id}/insertedinventories`, requestOptionsCheck);
    if (!checkResponse.ok) {
      setErrorMessage("Κάτι πήγε στραβά. Δεν μπόρεσε να ελεγχθεί η κατάσταση πληρωμής πανελλαδικών");
      return;
    }
    const insertedExamInventories = await checkResponse.json();
    if (insertedExamInventories.length === 0) {
      alert("Δεν μπορείτε να ολοκληρώσετε την κατάσταση πληρωμής πανελλαδικών γιατί δεν περιέχει συμμετοχές εκπαιδευτικών.");
      return;
    }

    // Proceed with submiton if Exam inventory exist
    const confirmFinalExamPayment = window.confirm("Είστε σίγουροι ότι θέλετε να ολοκληρώσετε την κατάσταστη πληρωμής πανελλαδικών;");
        if (!confirmFinalExamPayment) {
          return;
  }  
    const requestOptions = {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
         Authorization: "Bearer " + token,
        },
      };
      const response = await fetch(`/api/admin/exampayment/submitted/${id}`, requestOptions);
      if (!response.ok) {
        setErrorMessage("Κάτι πήγε στραβά. Δεν μπόρεσε να ολοκληρωθεί η κατάσταση πληρωμής πανελλαδικών");
      }
      setDisabledAdminExamPaymentButtons((prev) => [...prev, id]); // Add the index of the disabled button to the state
      getAdminExamPayments();
      alert("H κατάσταση πληρωμής πανελλαδικών ολοκληρώθηκε επιτυχώς");
      
    };  

    const handlePrintExamPayment = async (paymentId, paymentType, paymentName) => {
      try {
        const requestOptions = {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
           Authorization: "Bearer " + token,
          },
        };
        const response = await fetch(`/api/admin/printexampayment/${paymentId}`, requestOptions);
        const data = await response.json();
    
        const blob = await pdf(<ExamPaymentPDF participations={data} type={paymentType} name={paymentName}/>).toBlob();
    
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `exam-payment-${paymentId}.pdf`;
        link.click();
        URL.revokeObjectURL(link.href);
      } catch (err) {
        console.error("Κάτι πήγε στραβά. Δεν μπόρεσε να δημιουργηθεί το PDF", err);
      }
    };

    const handleExportExamPayment = async (paymentId) => {
      try {
        const requestOptions = {
          method: "GET",
          headers: {
            Accept: "application/xml",
           Authorization: "Bearer " + token,
          },
        };
        const response = await fetch(`/api/admin/exportexampayment/${paymentId}`, requestOptions);
    
        if (!response.ok) {
          throw new Error("Δεν μπόρεσε να δημιουργηθεί το XML");
        }
    
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `exam_payment_${paymentId}.xml`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      } catch (err) {
        console.error("Κάτι πήγε στραβά. Δεν μπόρεσε να δημιουργηθεί το XML", err);
      }
    };

 
    // Load disabledAdminExamPaymentButtons from localStorage on initial render
        useEffect(() => {
            const savedDisabledAdminExamPaymentButtons = localStorage.getItem("disabledAdminExamPaymentButtons");
            if (savedDisabledAdminExamPaymentButtons) {
              setDisabledAdminExamPaymentButtons(JSON.parse(savedDisabledAdminExamPaymentButtons));
            }
        }, []);
        
        // Update localStorage whenever disabledAdminExamPaymentButtons state changes
        useEffect(() => {
            localStorage.setItem("disabledAdminExamPaymentButtons", JSON.stringify(disabledAdminExamPaymentButtons));
        }, [disabledAdminExamPaymentButtons]);

 
  return (
    <>
      <ErrorMessage message={errorMessage} /> 
      <ExamPaymentModal
        active={activeCreateModal}
        handleCreateModal={handleCreateModal}
        token={token}
        id={id}
        setErrorMessage={setErrorMessage}
      />
      <InsertExamInventoryToPaymentModal
        active={activeInsertModal}
        handleInsertModal={handleInsertModal}
        paymentId={paymentId}
        paymentType={paymentType}
        paymentMonth={paymentMonth}
        paymentYear={paymentYear}
        token={token}
        setErrorMessage={setErrorMessage}
        refreshApprovedExamInventories={refreshApprovedExamInventories}
        refreshInsertedExamInventories={() => refreshInsertedExamInventories(paymentId)} // Pass the callback
        />  
    
      { loadedInventories && approvedExamInventories ? (
        <>
          <div className="columns has-background-warning mb-5 mt-5 colSpan=5">
            <div className="column is-10 has-text-centered">
              <h4 className="title is-5 mt-2">Πίνακας Εγκεκριμένων Καταστάσεων Πανελλαδικών Εκπαιδευτικών</h4>
            </div>
          </div>
        
         <table className="table is-fullwidth">
            <thead>
              <tr>
                <th>A/A</th>
                <th>Σχολείο</th>
                <th>Τύπος</th>
                <th>Όνομα</th>
                <th>Μήνας</th>
                <th>Έτος</th>
             </tr>
            </thead>
            <tbody>
             {approvedExamInventories.map((examinventory,inventoryIndex) => (
              <tr key={examinventory.id}>
                <td>{inventoryIndex+1}</td>
                <td>{examinventory.school}</td>
                <td>{examinventory.type}</td>
                <td>{examinventory.name}</td>
                <td>{examinventory.month}</td>
                <td>{examinventory.year}</td>
              </tr>
              ))}
            </tbody>
          </table>
          </>      
        ) : (
        <button class="button is-loading">Loading</button>
      )}

      {loadedPayments && adminExamPayments ? (
        <>
          <div className="columns has-background-warning mb-5 mt-6">
            <div className="column is-10 has-text-centered">
              <h4 className="title is-5 mt-2">
                Πίνακας Καταστάσεων Πληρωμής Πανελλαδικών Διαχειριστή 
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
                <th>Τύπος</th>
                <th>Μήνας</th>
                <th>Έτος</th>
                <th className="has-text-centered">Ενέργειες</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {adminExamPayments.map((exampayment, paymentIndex) => (
                <React.Fragment key={exampayment.id}>
                  {/* Parent Row */}
                  <tr key={exampayment.id}>
                    <td>
                      <button
                        className="button is-small"
                        onClick={() => {
                          setPaymentId(exampayment.id);
                          setPaymentType(exampayment.type);
                          setPaymentName(exampayment.name);
                          setPaymentMonth(exampayment.month);
                          setPaymentYear(exampayment.year);
                          toggleRow(exampayment.id)}
                        }
                      >
                        {expandedRow === exampayment.id ? (
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
                    <td>{paymentIndex + 1}</td>
                    <td>{exampayment.name}</td>
                    <td>{exampayment.type}</td>
                    <td>{exampayment.month}</td> 
                    <td>{exampayment.year}</td>

                    <td className="has-text-centered">
                      <button
                        key={exampayment.id}
                        disabled={disabledAdminExamPaymentButtons.includes(exampayment.id)}
                        className="button mr-2 is-link is-light"
                        onClick={() => handleUpdateExamPayment(exampayment.id)}
                      >
                        Επεξεργασία
                      </button>
                      <button
                        key={exampayment.id}
                        disabled={disabledAdminExamPaymentButtons.includes(exampayment.id)}
                        className="button mr-2 is-danger is-light"
                        onClick={() => handleDeleteExamPayment(exampayment.id)}
                      >
                        Διαγραφή
                      </button>
                      <button
                        key={exampayment.id}
                        disabled={disabledAdminExamPaymentButtons.includes(exampayment.id)}
                        className="button mr-2 is-primary"
                        onClick={() => handleFinalExamPayment(exampayment.id)}
                      >
                        Ολοκλήρωση
                      </button>
                      </td>
                    <td>
                    {disabledAdminExamPaymentButtons.includes(exampayment.id) ? (
                        <>
                          <button
                            key={exampayment.id}
                            className="button mr-2 is-warning is-light"
                            onClick={() => handlePrintExamPayment(exampayment.id, exampayment.type, exampayment.name)}
                          >
                            Σύνοψη
                          </button>
                          <button
                            key={exampayment.id}
                            className="button mr-2 is-warning"
                            onClick={() => handleExportExamPayment(exampayment.id)}
                          >
                            Δημιουργία xml
                          </button>
                        </>
                      ) : null}
                    </td>
                  </tr>

                  {/* Child Row - Requests */}
                  {expandedRow === exampayment.id && (
                    <tr>
                      <td colSpan="7">
                        <table className="table is-fullwidth is-narrow ml-6">
                          <thead>
                            <tr>
                              <th>
                                <button
                                  className="button is-small"
                                  onClick={() => {
                                    setPaymentId(exampayment.id);
                                    setPaymentType(exampayment.type);
                                    setPaymentMonth(exampayment.month);
                                    setPaymentYear(exampayment.year);
                                    //alert(paymentType);
                                    //alert(paymentMonth);
                                    //alert(paymentYear);
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
                              <th>Όνομα</th>
                              <th>Μήνας</th>
                              <th>Έτος</th>
                              <th></th>
                            </tr>
                          </thead>
                          <tbody>
                            { insertedExamInventories.length > 0 ? (
                                insertedExamInventories.map((examinventory, examinventoryIndex) => (
                                  <tr key={examinventory.id}>
                                    <td></td>
                                    <td>{examinventoryIndex + 1}</td>
                                    <td>{examinventory.school}</td>
                                    <td>{examinventory.name}</td>
                                    <td>{examinventory.month}</td>
                                    <td>{examinventory.year}</td>
                                    <td>
                                      <button 
                                      className="button is-danger"
                                      disabled={disabledAdminExamPaymentButtons.includes(exampayment.id)}
                                      onClick={() => removeInsertedlExamInventory(examinventory.id)}
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
                                  Δεν υπάρχουν πανελλαδικές συμμετοχές στην κατάσταση πληρωμής
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

export default AdminExamTable;
