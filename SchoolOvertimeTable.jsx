import React, { useContext, useEffect, useState } from "react";
import { UserContext } from "../context/UserContext";
import { DetailContext } from "../context/DetailContext";
import ErrorMessage from "./ErrorMessage";
import OvertimeInventoryModal from "./OvertimeInventoryModal";
import InsertOvertimeRequestToInventoryModal from "./InsertOvertimeRequestToInventoryModal";
 
const SchoolOvertimeTable = () => {
  const [token] = useContext(UserContext);
  const [detail] = useContext(DetailContext);
  const [errorMessage, setErrorMessage] = useState("");

  const [loadedRequests, setLoadedRequests] = useState(false); 
  const [approvedOvertimeRequests, setApprovedOvertimeRequests] = useState(null);

  const [loadedInventories, setLoadedInventories] = useState(false); 
  const [school, setSchool] = useState(detail.lastName);
  const [schoolOvertimeInventories, setSchoolOvertimeInventories] = useState(null);
  const [inventoryId, setInventoryId] = useState(null);
  const [inventoryMonth, setInventoryMonth] = useState(null);
  const [inventoryYear, setInventoryYear] = useState(null);

  const [activeCreateModal, setActiveCreateModal] = useState(false);
  const [activeInsertModal, setActiveInsertModal] = useState(false);

  const [id, setId] = useState(null);
  const [disabledSchoolOvertimeInventoryButtons, setDisabledSchoolOvertimeInventoryButtons] = useState([]);
  const [expandedRow, setExpandedRow] = useState(null);
  const [insertedRequests, setInsertedRequests] = useState([]);


    useEffect(() => {
      setSchool(detail.lastName);
    }, [detail.lastName]);
    
  // Function to get the approved overtime requests of the selected school
    useEffect(() => {
      const getApprovedOvertimeRequests = async () => {
        const requestOptions = {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token,
          },
        };
        const response = await fetch(`/api/school/overtimerequests/approved/${school}`, requestOptions);
  
        if (!response.ok) {
          setErrorMessage("Κάτι πήγε στραβά. Δεν μπόρεσαν να φορτωθούν τα εγκεκριμένα αιτήματα υπερωριών  ");
        } else {
          const data = await response.json();
          setApprovedOvertimeRequests(data);
          setErrorMessage("");
          setLoadedRequests(true);
        }
      };
  
      getApprovedOvertimeRequests();
    }, [token, setErrorMessage]);

    const refreshApprovedOvertimeRequests = async () => {
        const requestOptions = {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token,
          },
        };
        const response = await fetch(`/api/school/overtimerequests/approved/${school}`, requestOptions);
        if (response.ok) {
          const data = await response.json();
          setApprovedOvertimeRequests(data);
        }
      };
  

  //Function to get the school's overtime inventories  
  const getSchoolOvertimeInventories = async () => {
    const requestOptions = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
    };
    
    const response = await fetch(`/api/school/overtimeinventories/${school}`, requestOptions);
    if (!response.ok) {
      setErrorMessage("Kάτι πήγε στραβά. Δεν μπόρεσαν να φορτωθούν οι καταστάσεις υπερωριών");
    } else {
      const data = await response.json();
      setSchoolOvertimeInventories(data);
      setErrorMessage("");
      setLoadedInventories(true);
    }
  };
  
  useEffect(() => {
    getSchoolOvertimeInventories();
  }, [token, school]);

  const handleCreateModal = () => {
    setActiveCreateModal(!activeCreateModal);
    getSchoolOvertimeInventories();
    setId(null);
  };

  // Function to update an overtime inventory
  const handleUpdateOvertimeInventory = async (id) => {
    setId(id);
    setActiveCreateModal(true);
  };

  // Function to delete an overtime inventory  
  const handleDeleteOvertimeInventory = async (id) => {
    // Check if the inventory has overtime requests
    const requestOptionsCheck = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
    };
    const checkResponse = await fetch(`/api/school/overtimeinventory/${id}/insertedrequests`, requestOptionsCheck);
    if (!checkResponse.ok) {
      setErrorMessage("Κάτι πήγε στραβά. Δεν μπόρεσε να ελεγχθείη κατάσταση υπερωριών");
      return;
    }
    const insertedRequests = await checkResponse.json();
    if (insertedRequests.length > 0) {
      alert("Δεν μπορείτε να διαγράψετε την κατάσταση υπερωριών γιατί περιέχει αιτήματα υπερωριών.");
      return;
    }

    // Proceed with deletion if no overtime requests exist
    const confirmDelete = window.confirm("Είστε σίγουροι ότι θέλετε να διαγράψετε την κατάσταση υπερωριών;");
        if (!confirmDelete) {
          return;
    }
    const requestOptions = {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
    };
    const response = await fetch(`/api/school/overtimeinventory/${id}`, requestOptions);
    if (!response.ok) {
      setErrorMessage("Κάτι πήγε στραβά. Δεν μπόρεσε να διαγραφεί η κατάσταση υπερωριών");
    } else {
      getSchoolOvertimeInventories();
      alert("Η κατάσταση υπερωριών διαγράφηκε επιτυχώς");
    }
  };

  const toggleRow = (id) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  const handleInsertModal = () => {
    setActiveInsertModal(!activeInsertModal);
    getSchoolOvertimeInventories();
    setId(null);
  };



  // Function to get the inserted overtime requests of the selected inventory
  const getInsertedOvertimeRequests = async (id) => {
    const requestOptions = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
    };

    const response = await fetch(`/api/school/overtimeinventory/${id}/insertedrequests`, requestOptions);
    if (!response.ok) {
      setErrorMessage("Kάτι πήγε στραβά. Δεν μπόρεσαν να φορτωθούν τα αιτήματα εισηγμένων υπερωριών");
    } else {
      const data = await response.json();
      setInsertedRequests(data);
      setErrorMessage("");
    }
  };

  useEffect(() => {
    if (expandedRow !== null) {
      getInsertedOvertimeRequests(expandedRow);
    }
  }, [expandedRow, token]);

  const refreshInsertedOvertimeRequests = async (id) => {
    const requestOptions = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
    };

    const response = await fetch(`/api/school/overtimeinventory/${id}/insertedrequests`, requestOptions);
    if (!response.ok) {
      setErrorMessage("Kάτι πήγε στραβά. Δεν μπόρεσαν να φορτωθούν τα αιτήματα εισηγμένων υπερωριών");
    } else {
      const data = await response.json();
      setInsertedRequests(data);
      setErrorMessage("");
    }
  };

  // Function to remove the inserted overtime request from the selected inventory
  const removeInsertedlOvertimeRequest = async (overtimerequest_id) => {
    const requestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
    };
  
  const response = await fetch(`/api/school/overtimeinventory/${overtimerequest_id}/removerequest`, requestOptions);
  if (!response.ok) {
    setErrorMessage("Kάτι πήγε στραβά. Δεν μπόρεσε να αφαιρεθεί το αίτημα υπερωριών από την κατάσταση ");
  } else {
    setErrorMessage("");
    getInsertedOvertimeRequests(expandedRow);
    // Refresh approved overtime requests after removal
    refreshApprovedOvertimeRequests();
    refreshInsertedOvertimeRequests();
    alert("Το αίτημα υπερωριών αφαιρέθηκε επιτυχώς");
  }
};


  // Function to submit an overtime inventory
  const handleSubmitOvertimeInvetory = async (id) => {
    // Check if the inventory has overtime requests
    const requestOptionsCheck = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
    };
    const checkResponse = await fetch(`/api/school/overtimeinventory/${id}/insertedrequests`, requestOptionsCheck);
    if (!checkResponse.ok) {
      setErrorMessage("Κάτι πήγε στραβά. Δεν μπόρεσε να ελεγχθεί η κατάσταση υπερωριών");
      return;
    }
    const insertedRequests = await checkResponse.json();
    if (insertedRequests.length == 0) {
      alert("Δεν μπορείτε να υποβάλλετε την κατάσταση υπερωριών γιατί δεν περιέχει αιτήματα υπερωριών.");
      return;
    }

    // Proceed with submiton if  overtime requests exist
      const confirmSubmit = window.confirm("Είστε σίγουροι ότι θέλετε να υποβάλετε την κατάσταση υπερωριών;");
        if (!confirmSubmit) {
          return;
      }
      const requestOptions = {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
         Authorization: "Bearer " + token,
        },
      };
      const response = await fetch(`/api/school/overtimeinventory/submitted/${id}`, requestOptions);
      if (!response.ok) {
        setErrorMessage("Κάτι πήγε στραβά. Δεν μπόρεσε να υποβληθεί την κατάσταση υπερωριών");
      }
      setDisabledSchoolOvertimeInventoryButtons((prev) => [...prev, id]); // Add the index of the disabled button to the state
      getSchoolOvertimeInventories();
      alert("H κατάσταση υπερωριών υποβλήθηκε επιτυχώς");
      
    };  

    // Load disabledSchoolOvertimeInventoryButtons from localStorage on initial render
        useEffect(() => {
            const savedDisabledSchoolOvertimeInventoryButtons = localStorage.getItem("disabledSchoolOvertimeInventoryButtons");
            if (savedDisabledSchoolOvertimeInventoryButtons) {
              setDisabledSchoolOvertimeInventoryButtons(JSON.parse(savedDisabledSchoolOvertimeInventoryButtons));
            }
        }, []);
        
        // Update localStorage whenever disabledSchoolOvertimeInventoryButtons state changes
        useEffect(() => {
            localStorage.setItem("disabledSchoolOvertimeInventoryButtons", JSON.stringify(disabledSchoolOvertimeInventoryButtons));
        }, [disabledSchoolOvertimeInventoryButtons]);

 
  return (
    <>
      <ErrorMessage message={errorMessage} /> 
      <OvertimeInventoryModal
        active={activeCreateModal}
        handleCreateModal={handleCreateModal}
        token={token}
        id={id}
        setErrorMessage={setErrorMessage}
      />
      <InsertOvertimeRequestToInventoryModal
        active={activeInsertModal}
        handleInsertModal={handleInsertModal}
        inventoryId={inventoryId}
        inventoryMonth={inventoryMonth}
        inventoryYear={inventoryYear}
        token={token}
        setErrorMessage={setErrorMessage}
        refreshApprovedOvertimeRequests={refreshApprovedOvertimeRequests}
        refreshInsertedOvertimeRequests={() => refreshInsertedOvertimeRequests(inventoryId)} // Pass the callback
        />
      { loadedRequests && approvedOvertimeRequests ? (
        <>
          <div className="columns has-background-info mb-5 mt-5 colSpan=5">
            <div className="column is-10 has-text-centered">
              <h4 className="title is-5 mt-2">Πίνακας Εγκεκριμένων Αιτημάτων Υπερωριών Εκπαιδευτικών   {detail.lastName}</h4>
            </div>
          </div>
        
         <table className="table is-fullwidth">
            <thead>
              <tr>
                <th>Επίθετο</th>
                <th>Όνομα</th>
                <th>Μήνας</th>
                <th>Έτος</th>
                <th>Υπερωρίες</th>
             </tr>
            </thead>
            <tbody>
             {approvedOvertimeRequests.map((overtimerequest) => (
              <tr key={overtimerequest.id}>
                <td>{overtimerequest.last_name}</td>
                <td>{overtimerequest.first_name}</td>
                <td>{overtimerequest.month}</td>
                <td>{overtimerequest.year}</td>
                <td>{overtimerequest.number_of_overtimes}</td>
              </tr>
              ))}
            </tbody>
          </table>
          </>      
        ) : (
        <button class="button is-loading">Loading</button>
      )}

      {loadedInventories && schoolOvertimeInventories ? (
        <>
          <div className="columns has-background-info mb-5 mt-6">
            <div className="column is-10 has-text-centered">
              <h4 className="title is-5 mt-2">
                Πίνακας Καταστάσεων Υπερωριών {detail.lastName}
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
                <th>Κατηγορία</th>
                <th>Σχολείο</th>
                <th>Μήνας</th>
                <th>Έτος</th>
                <th>Ενέργειες</th>
              </tr>
            </thead>
            <tbody>
              {schoolOvertimeInventories.map((overtimeinventory, index) => (
                <React.Fragment key={overtimeinventory.id}>
                  {/* Parent Row */}
                  <tr key={overtimeinventory.id}>
                    <td>
                      <button
                        className="button is-small"
                        onClick={() => {
                          setInventoryId(overtimeinventory.id);
                          setInventoryMonth(overtimeinventory.month);
                          setInventoryYear(overtimeinventory.year);
                          toggleRow(overtimeinventory.id)}
                        }
                      >
                        {expandedRow === overtimeinventory.id ? (
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
                    <td>Υπερωρίες</td>
                    <td>{overtimeinventory.school}</td>
                    <td>{overtimeinventory.month}</td>
                    <td>{overtimeinventory.year}</td>

                    <td>
                      <button
                        key={overtimeinventory.id}
                        disabled={disabledSchoolOvertimeInventoryButtons.includes(overtimeinventory.id)}
                        className="button mr-2 is-link is-light"
                        onClick={() => handleUpdateOvertimeInventory(overtimeinventory.id)}
                      >
                        Επεξεργασία
                      </button>
                      <button
                        key={overtimeinventory.id}
                        disabled={disabledSchoolOvertimeInventoryButtons.includes(overtimeinventory.id)}
                        className="button mr-2 is-danger is-light"
                        onClick={() => handleDeleteOvertimeInventory(overtimeinventory.id)}
                      >
                        Διαγραφή
                      </button>
                      <button
                        key={overtimeinventory.id}
                        disabled={disabledSchoolOvertimeInventoryButtons.includes(overtimeinventory.id)}
                        className="button mr-2 is-primary"
                        onClick={() => handleSubmitOvertimeInvetory(overtimeinventory.id)}
                      >
                        Υποβολή
                      </button>
                    </td>
                  </tr>

                  {/* Child Row - Requests */}
                  {expandedRow === overtimeinventory.id && (
                    <tr>
                      <td colSpan="7">
                        <table className="table is-fullwidth is-narrow ml-6">
                          <thead>
                            <tr>
                              <th>
                                <button
                                  className="button is-small"
                                  onClick={() => {
                                    setInventoryId(overtimeinventory.id);
                                    setInventoryMonth(overtimeinventory.month);
                                    setInventoryYear(overtimeinventory.year);
                                    //alert(inventoryId);
                                    //alert(inventoryYear);
                                    setActiveInsertModal(true);
                                  }}
                                >
                                  <span className="icon">
                                    <i className="fas fa-plus"></i>
                                  </span>
                                </button>
                              </th>
                              <th>A/A</th>
                              <th>Επίθετο</th>
                              <th>Όνομα</th>
                              <th>Μήνας</th>
                              <th>Έτος</th>
                              <th>Υπερωρίες</th>
                              <th></th>
                            </tr>
                          </thead>
                          <tbody>
                            { insertedRequests.length > 0 ? (
                                insertedRequests.map((overtimerequest, requestIndex) => (
                                  <tr key={overtimerequest.id}>
                                    <td></td>
                                    <td>{requestIndex + 1}</td>
                                    <td>{overtimerequest.last_name}</td>
                                    <td>{overtimerequest.first_name}</td>
                                    <td>{overtimerequest.month}</td>
                                    <td>{overtimerequest.year}</td>
                                    <td>{overtimerequest.number_of_overtimes}</td>
                                    <td>
                                      <button 
                                      className="button is-danger"
                                      disabled={disabledSchoolOvertimeInventoryButtons.includes(overtimeinventory.id)}
                                      onClick={() => removeInsertedlOvertimeRequest(overtimerequest.id)}
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
                                  Δεν υπάρχουν υπερωρίες στην κατάσταση 
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

export default SchoolOvertimeTable;
