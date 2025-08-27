import React, { useContext, useEffect, useState } from "react";
import { UserContext } from "../context/UserContext";
import { DetailContext } from "../context/DetailContext";
import ErrorMessage from "./ErrorMessage";

import ExamInventoryModal from "./ExamInventoryModal";
import UploadExamFilesModal from "./UploadExamFilesModal";
import InfoExamInventoryModal from "./InfoExamInventoryModal";
import ExamParticipationModal from "./ExamParticipationModal";

 
const SchoolExamTable = () => {
  const [token] = useContext(UserContext);
  const [detail] = useContext(DetailContext);
  const [errorMessage, setErrorMessage] = useState("");
  const [school, setSchool] = useState(detail.lastName);

  //const [examParticipations, setExamParticipations] = useState(null);
  //const [loadedParticipations, setLoadedParticipations] = useState(false);
  const [participationId, setParticipationId] = useState(null);
  const [activeCreateParticipationModal, setActiveCreateParticipationModal] = useState(false);
  const [activeInfoParticipationModal, setActiveInfoParticipationModal] = useState(false);

  const [infoData, setInfoData] = useState({});   

  const [schoolExamInventories, setSchoolExamInventories] = useState(null);
  const [loadedInventories, setLoadedInventories] = useState(false); 
  const [inventoryId, setInventoryId] = useState(null);
  const [activeCreateInventoryModal, setActiveCreateInventoryModal] = useState(false);
  const [activeUploadExamFilesModal, setActiveUploadExamFilesModal] = useState(false);
  const [activeInfoExamInventoryModal, setActiveInfoExamInventoryModal] = useState(false);
  const [disabledSchoolExamInventoryButtons, setDisabledSchoolExamInventoryButtons] = useState([]);

  const [inventoryType, setInventoryType] = useState(null);
  const [inventoryMonth, setInventoryMonth] = useState(null);
  const [inventoryYear, setInventoryYear] = useState(null);
  const [id, setId] = useState(null);
  
  const [expandedRow, setExpandedRow] = useState(null);
  const [insertedParticipations, setInsertedParticipations] = useState([]);
  

  useEffect(() => {
      setSchool(detail.lastName);
  }, [detail.lastName]);

    //Function to get the school's exam inventories  
    const getSchoolExamInventories = async () => {
      const requestOptions = {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
      };
      
      const response = await fetch(`/api/school/examinventories/${school}`, requestOptions);
      if (!response.ok) {
        setErrorMessage("Kάτι πήγε στραβά. Δεν μπόρεσαν να φορτωθούν οι καταστάσεις πανελλαδικών");
      } else {
        const data = await response.json();
        setSchoolExamInventories(data);
        setErrorMessage("");
        setLoadedInventories(true);
      }
    };
    
    useEffect(() => {
      getSchoolExamInventories();
    }, [token, school]);
  
    const handleCreateInventoryModal = () => {
      setActiveCreateInventoryModal(!activeCreateInventoryModal);
      getSchoolExamInventories();
      setInventoryId(null);
    };
  
    // Function to update an Exam inventory
    const handleUpdateExamInventory = async (id) => {
      setInventoryId(id);
      setActiveCreateInventoryModal(true);
    };
  
    // Function to delete an Exam inventory  
    const handleDeleteExamInventory = async (id) => {
      // Check if the inventory has exam participations
    const requestOptionsCheck = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
    };
    const checkResponse = await fetch(`/api/school/examinventory/${id}/insertedparticipations`, requestOptionsCheck);
    if (!checkResponse.ok) {
      setErrorMessage("Κάτι πήγε στραβά. Δεν μπόρεσε να ελεγχθεί η κατάσταση πανελλαδικών");
      return;
    }
    const insertedParticipations = await checkResponse.json();
    if (insertedParticipations.length > 0) {
      alert("Δεν μπορείτε να διαγράψετε την κατάσταση πανελλαδικών γιατί περιέχει συμμετέχοντες εκπαιδευτικούς.");
      return;
    }

    // Proceed with deletion if no exam participation exist
      const confirmDelete = window.confirm("Είστε σίγουροι ότι θέλετε να διαγράψετε την κατάσταστη πανελλαδικών;");
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
      const response = await fetch(`/api/school/examinventory/${id}`, requestOptions);
      if (!response.ok) {
        setErrorMessage("Κάτι πήγε στραβά. Δεν μπόρεσε να διαγραφεί η κατάσταση πανελλαδικών");
      } else {
        getSchoolExamInventories();
        alert("Η κατάσταση πανελλαδικών διαγράφηκε επιτυχώς");
      }
    };
  
    const toggleRow = (id) => {
      setExpandedRow(expandedRow === id ? null : id);
    };
  
    // Function to submit an Exam inventory
    const handleSubmitExamInvetory = async (id,decree) => {
      // Check if the inventory has uploaded files and exam participations 
      if (!decree){
        alert("Πρέπει πρώτα να μεταφορτώσετε την Απόφαση Ορισμού Παναελλαδικών και τη Βεβαίωση Συμμετοχής"); 
        return;
      } else  {
        const confirmSubmit = window.confirm("Είστε σίγουροι ότι θέλετε να υποβάλετε την κατάσταση πανελλαδικών;");
                if (!confirmSubmit) {
                return;
          }

        const requestOptionsCheck = {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token,
          },
        };
        const checkResponse = await fetch(`/api/school/examinventory/${id}/insertedparticipations`, requestOptionsCheck);
        if (!checkResponse.ok) {
          setErrorMessage("Κάτι πήγε στραβά. Δεν μπόρεσε να ελεγχθεί η κατάσταση πανελλαδικών");
          return;
        }
        const insertedParticipations = await checkResponse.json();
        if (insertedParticipations.length == 0) {
          alert("Δεν μπορείτε να υποβάλλετε την κατάσταση πανελλαδικών γιατί δεν περιέχει συμμετέχοντες εκπαιδευτικούς.");
          return;
        }
       
        // Proceed with submiton if  exam participations exist
        const requestOptions = {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          Authorization: "Bearer " + token,
          },
          };
          const response = await fetch(`/api/school/examinventory/submitted/${id}`, requestOptions);
          if (!response.ok) {
            setErrorMessage("Κάτι πήγε στραβά. Δεν μπόρεσε να υποβληθεί η κατάσταση πανελλαδικών");
          }
          setDisabledSchoolExamInventoryButtons((prev) => [...prev, id]); // Add the index of the disabled button to the state
          getSchoolExamInventories();
          alert("H κατάσταση πανελλαδικών υποβλήθηκε επιτυχώς");
        }
      };  
  

    const showInfoExamInventory = (submitted, stimestamp, paid, ptimestamp) => {
        setInfoData({
          submitted,
          stimestamp,
          paid,
          ptimestamp,
        });
        setActiveInfoExamInventoryModal(true); // Open the Info Participation modal
    };
    
      const handleInfoExamInventoryModal = () => {
        setActiveInfoExamInventoryModal(!activeInfoExamInventoryModal); // Close the Info Inventory modal
      };
    
    
    const handleUploadExamFiles = async (id) => {
        setInventoryId(id);
        setActiveUploadExamFilesModal(true);
      }; 
    
    const handleUploadExamFilesModal = () => {
        setActiveUploadExamFilesModal(!activeUploadExamFilesModal);
        getSchoolExamInventories();
        setInventoryId(null);
      };
  
    // Load disabledSchoolExamInventoryButtons from localStorage on initial render
    useEffect(() => {
      const savedDisabledSchoolExamInventoryButtons = localStorage.getItem("disabledSchoolExamInventoryButtons");
        if (savedDisabledSchoolExamInventoryButtons) {
        setDisabledSchoolExamInventoryButtons(JSON.parse(savedDisabledSchoolExamInventoryButtons));
        }
    }, []);
          
    // Update localStorage whenever disabledSchoolExamInventoryButtons state changes
    useEffect(() => {
      localStorage.setItem("disabledSchoolExamInventoryButtons", JSON.stringify(disabledSchoolExamInventoryButtons));
      }, [disabledSchoolExamInventoryButtons]);
    


  // Function to get the inserted exam participations of the selected inventory
  const getInsertedParticipations = async (id) => {
    const requestOptions = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
    };

    const response = await fetch(`/api/school/examinventory/${id}/insertedparticipations`, requestOptions);
    if (!response.ok) {
      setErrorMessage("Kάτι πήγε στραβά. Δεν μπόρεσαν να φορτωθούν οι συμμετέχοντες εκπαιδευτικοί");
    } else {
      const data = await response.json();
      setInsertedParticipations(data);
      setErrorMessage("");
    }
  };

  useEffect(() => {
    if (expandedRow !== null) {
      setInsertedParticipations(expandedRow);
    }
  }, [expandedRow, token]);

  const refreshInsertedParticipations = async (inventoryId) => {
    const requestOptions = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
    };

    const response = await fetch(`/api/school/examinventory/${inventoryId}/insertedparticipations`, requestOptions);
    if (!response.ok) {
      setErrorMessage("Kάτι πήγε στραβά. Δεν μπόρεσαν να φορτωθούν οι συμμετέχοντες εκπαιδευτικοί");
    } else {
      const data = await response.json();
      setInsertedParticipations(data);
      setErrorMessage("");
    }
  };
  
  // Function to remove the inserted the inserted participation from the selected exam inventory
  const removeInsertedParticipation = async (examparticipation_id) => {
    const requestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
    };
  
  const response = await fetch(`/api/school/examinventory/${examparticipation_id}/removeparticipation`, requestOptions);
  if (!response.ok) {
    setErrorMessage("Kάτι πήγε στραβά. Δεν μπόρεσε να αφαιρεθεί η συμμετοχή εκπαιδευτικού από την κατάσταση");
  } else {
    setErrorMessage("");
    getInsertedParticipations(expandedRow);
    // Refresh approved overtime requests after removal
    refreshInsertedParticipations();
  }
};

const deleteExamParticipation = async (id) => {
  const requestOptions = {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
  };
  const response = await fetch(`/api/school/examparticipations/${id}`, requestOptions);
  if (!response.ok) {
    setErrorMessage("Κάτι πήγε στραβά. Δεν μπόρεσε να διαγραφεί η συμμετοχή πανελλαδικών");
  } else {
    getInsertedParticipations(inventoryId);
    alert("Η συμμετοχή πανελλαδικών διαγράφηκε επιτυχώς");
  }
};

const handleCreateParticipationModal = () => {
    setActiveCreateParticipationModal(!activeCreateParticipationModal);
    setParticipationId(null);
  };
  

 
  return (
      <>
      <ErrorMessage message={errorMessage} /> 
      <InfoExamInventoryModal
        active={activeInfoExamInventoryModal}
        handleInfoExamInventoryModal={handleInfoExamInventoryModal}
        infoData={infoData}
      />
       <ExamParticipationModal
        active={activeCreateParticipationModal}
        handleCreateParticipationModal={handleCreateParticipationModal}
        token={token}
        participationId={participationId}
        inventoryId={inventoryId}
        inventoryType={inventoryType}
        inventoryMonth={inventoryMonth}
        inventoryYear={inventoryYear}
        setErrorMessage={setErrorMessage}
        refreshInsertedParticipations={() => refreshInsertedParticipations(inventoryId)} // Pass the callback

      />
      <ExamInventoryModal
        active={activeCreateInventoryModal}
        handleCreateInventoryModal={handleCreateInventoryModal}
        token={token}
        inventoryId={inventoryId}
        setErrorMessage={setErrorMessage}
      />
      <UploadExamFilesModal
        active={activeUploadExamFilesModal}
        handleUploadExamFilesModal={handleUploadExamFilesModal}
        token={token}
        inventoryId={inventoryId}
        setErrorMessage={setErrorMessage}
      />
       
           
      {loadedInventories && schoolExamInventories ? (
        <>
          <div className="columns has-background-info mb-5 mt-6">
            <div className="column is-10 has-text-centered">
              <h4 className="title is-5 mt-2">
                Πίνακας Καταστάσεων Πανελλαδικών {detail.lastName}
              </h4>
            </div>
            <div className="column">
              <button
                className="button mr-2 is-info is-light"
                onClick={() => setActiveCreateInventoryModal(true)}
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
                <th>Κατηγορία</th>
                <th>Σχολείο</th>
                <th>Μήνας</th>
                <th>Έτος</th>
                <th className="has-text-centered">Αρχεία</th>
                <th className="has-text-centered">Ενέργειες</th>
              </tr>
            </thead>
            <tbody>
              {schoolExamInventories.map((examinventory, index) => (
                <React.Fragment key={examinventory.id}>
                  {/* Parent Row */}
                  <tr key={examinventory.id}>
                    <td>
                      <button
                        className="button is-small"
                        onClick={() => {
                          setInventoryId(examinventory.id);
                          setInventoryType(examinventory.type);
                          setInventoryMonth(examinventory.month);
                          setInventoryYear(examinventory.year);
                          getInsertedParticipations(examinventory.id)
                          toggleRow(examinventory.id)}
                        }
                      >
                        {expandedRow === examinventory.id ? (
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
                    <td>{examinventory.name}</td>
                    <td>{examinventory.type}</td>
                    <td>{examinventory.school}</td>
                    <td>{examinventory.month}</td>
                    <td>{examinventory.year}</td>
                    <td className="has-text-centered">
                      {examinventory.decree ? (
                      <span className="icon">
                            <i class="fa-solid fa-check"></i>
                          </span>
                      ) : (
                      <button
                      key={examinventory.id}
                      disabled={disabledSchoolExamInventoryButtons.includes(examinventory.id)}
                      className="button mr-2 is-info is-light"
                      onClick={() => handleUploadExamFiles(examinventory.id)}
                      > Μεταφόρτωση
                      </button>)
                      }
                    </td>

                    <td className="has-text-centered">
                      <button
                        key={examinventory.id}
                        disabled={disabledSchoolExamInventoryButtons.includes(examinventory.id)}
                        className="button mr-2 is-link is-light"
                        onClick={() => handleUpdateExamInventory(examinventory.id)}
                      >
                        Επεξεργασία
                      </button>
                      <button
                        key={examinventory.id}
                        disabled={disabledSchoolExamInventoryButtons.includes(examinventory.id)}
                        className="button mr-2 is-danger is-light"
                        onClick={() => handleDeleteExamInventory(examinventory.id)}
                      >
                        Διαγραφή
                      </button>
                      <button
                        key={examinventory.id}
                        disabled={disabledSchoolExamInventoryButtons.includes(examinventory.id)}
                        className="button mr-2 is-primary"
                        onClick={() => handleSubmitExamInvetory(examinventory.id,examinventory.decree)}
                      >
                        Υποβολή
                      </button>
                    </td>
                    <td>
                  <button 
                    key={examinventory.id}
                    className="button mr-2 is-info"
                    onClick={() => showInfoExamInventory(examinventory.submitted, examinventory.stimestamp, examinventory.paid, examinventory.ptimestamp )}
                  >                  
                    <span className="icon">
                      <i className="fa-solid fa-info"></i>
                    </span>
                  </button>
                </td>   
                  </tr>
                  
                  {/* Child Row - Requests */}
                  {expandedRow === examinventory.id && (
                    <tr>
                      <td colSpan="9">
                        <table className="table is-fullwidth is-narrow ml-6">
                          <thead>
                            <tr>
                              <th>
                                <button
                                  className="button is-small"
                                  onClick={() => {
                                    setInventoryId(examinventory.id);
                                    setInventoryType(examinventory.type);
                                    setInventoryMonth(examinventory.month);
                                    setInventoryYear(examinventory.year);
                                    //alert(inventoryId);
                                    //alert(inventoryType);
                                    setActiveCreateParticipationModal(true);
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
                              <th>Ρόλος</th>
                              <th>Μήνας</th>
                              <th>Έτος</th>
                              <th>Ημέρες</th>
                              <th></th>
                            </tr>
                          </thead>
                          <tbody>
                            { insertedParticipations.length > 0 ? (
                                insertedParticipations.map((examparticipation, participationIndex) => (
                                  <tr key={examparticipation.id}>
                                    <td></td>
                                    <td>{participationIndex + 1}</td>
                                    <td>{examparticipation.last_name}</td>
                                    <td>{examparticipation.first_name}</td>
                                    <td>{examparticipation.role}</td>
                                    <td>{examparticipation.month}</td>
                                    <td>{examparticipation.year}</td>
                                    <td>{examparticipation.number_of_exams}</td>
                                    <td>
                                      <button 
                                      className="button is-danger"
                                      disabled={disabledSchoolExamInventoryButtons.includes(examinventory.id)}
                                      onClick={() => {
                                        removeInsertedParticipation(examparticipation.id)
                                        deleteExamParticipation(examparticipation.id)}
                                      }
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
                                <td colSpan="9" className="has-text-centered">
                                  Δεν υπάρχουν συμμετέχοντες εκπαιδευτικοί σε Πανελλαδικές στην κατάσταση 
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

export default SchoolExamTable;
