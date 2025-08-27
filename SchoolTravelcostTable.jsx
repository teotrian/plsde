import React, { useContext, useEffect, useState } from "react";
import { UserContext } from "../context/UserContext";
import { DetailContext } from "../context/DetailContext";
import ErrorMessage from "./ErrorMessage";
import TravelcostInventoryModal from "./TravelcostInventoryModal";
import InsertTravelcostRequestToInventoryModal from "./InsertTravelcostRequestToInventoryModal";

const SchoolTravelcostTable = () => {
  const [token] = useContext(UserContext);
  const [detail] = useContext(DetailContext);
  const [errorMessage, setErrorMessage] = useState("");

  const [loadedRequests, setLoadedRequests] = useState(false); 
  const [approvedTravelcostRequests, setApprovedTravelcostRequests] = useState(null);
  
  const [loadedInventories, setLoadedInventories] = useState(false); 
  const [school, setSchool] = useState(detail.lastName);
  const [schoolTravelcostInventories, setSchoolTravelcostInventories] = useState(null);
  const [inventoryId, setInventoryId] = useState(null);
  const [inventoryMonth, setInventoryMonth] = useState(null);
  const [inventoryYear, setInventoryYear] = useState(null);

  const [activeCreateModal, setActiveCreateModal] = useState(false);
  const [activeInsertModal, setActiveInsertModal] = useState(false);

  const [id, setId] = useState(null);
  const [disabledSchoolTravelcostInventoryButtons, setDisabledSchoolTravelcostInventoryButtons] = useState([]);
  const [expandedRow, setExpandedRow] = useState(null);
  const [insertedRequests, setInsertedRequests] = useState([]);

  useEffect(() => {
    setSchool(detail.lastName);
  }, [detail.lastName]);

  // Function to get the approved travelcost requests of the selected school
    useEffect(() => {
      const getApprovedTravelcostRequests = async () => {
        const requestOptions = {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token,
          },
        };
        const response = await fetch(`/api/school/travelcostrequests/approved/${school}`, requestOptions);
  
        if (!response.ok) {
          setErrorMessage("Κάτι πήγε στραβά. Δεν μπόρεσαν να φορτωθούν τα εγκεκριμένα αιτήματα οδοιπορικών  ");	
        } else {
          const data = await response.json();
          setApprovedTravelcostRequests(data);
          setErrorMessage("");
          setLoadedRequests(true);
        }
      };
  
      getApprovedTravelcostRequests();
    }, [token, setErrorMessage]);

    const refreshApprovedTravelcostRequests = async () => {
        const requestOptions = {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token,
          },
        };
        const response = await fetch(`/api/school/travelcostrequests/approved/${school}`, requestOptions);
        if (response.ok) {
          const data = await response.json();
          setApprovedTravelcostRequests(data);
        }
      };
  
    //Function to get the school's travelcost inventories  
    const getSchoolTravelcostInventories = async () => {
        const requestOptions = {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: "Bearer " + token,
            },
        };
          
        const response = await fetch(`/api/school/travelcostinventories/${school}`, requestOptions);
          if (!response.ok) {
            setErrorMessage("Kάτι πήγε στραβά. Δεν μπόρεσαν να φορτωθούν οι καταστάσεις οδοιπορικών");
          } else {
            const data = await response.json();
            setSchoolTravelcostInventories(data);
            setErrorMessage("");
            setLoadedInventories(true);
          }
        };
        
      useEffect(() => {
          getSchoolTravelcostInventories();
        }, [token, school]);
      
      const handleCreateModal = () => {
          setActiveCreateModal(!activeCreateModal);
          getSchoolTravelcostInventories();
          setId(null);
        };
      
      // Function to update an travelcost inventory
        const handleUpdateTravelcostInventory = async (id) => {
          setId(id);
          setActiveCreateModal(true);
        };
      
        // Function to delete an travelcost inventory  
        const handleDeleteTravelcostInventory = async (id) => {
          // Check if the inventory has travelcost requests
          const requestOptionsCheck = {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: "Bearer " + token,
            },
          };
          const checkResponse = await fetch(`/api/school/travelcostinventory/${id}/insertedrequests`, requestOptionsCheck);
          if (!checkResponse.ok) {
            setErrorMessage("Κάτι πήγε στραβά. Δεν μπόρεσε να ελεγχθεί η κατάσταση οδοιπορικών");
            return;
          }
          const insertedRequests = await checkResponse.json();
          if (insertedRequests.length > 0) {
            alert("Δεν μπορείτε να διαγράψετε την κατάσταση οδοιπορικών γιατί περιέχει αιτήματα οδοιπορικών.");
            return;
          }

          // Proceed with deletion if no travelcost requests exist
          const confirmDelete = window.confirm("Είστε σίγουροι ότι θέλετε να διαγράψετε την κατάσταση οδοιπορικών;");
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
          const response = await fetch(`/api/school/travelcostinventory/${id}`, requestOptions);
          if (!response.ok) {
            setErrorMessage("Κάτι πήγε στραβά. Δεν μπόρεσε να διαγραφεί η κατάσταση οδοιπορικών");
          } else {
            getSchoolTravelcostInventories();
            alert("Η κατάσταση οδοιπορικών διαγράφηκε επιτυχώς");
          }
        };
      
        // Function to submit an travelcost inventory
        const handleSubmitTravelcostInventory = async (id) => {
            // Check if the inventory has travelcost requests
            const requestOptionsCheck = {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + token,
              },
            };
            const checkResponse = await fetch(`/api/school/travelcostinventory/${id}/insertedrequests`, requestOptionsCheck);
            if (!checkResponse.ok) {
              setErrorMessage("Κάτι πήγε στραβά. Δεν μπόρεσε να ελεγχθεί η κατάσταση οδοιπορικών");
              return;
            }
            const insertedRequests = await checkResponse.json();
            if (insertedRequests.length == 0) {
              alert("Δεν μπορείτε να υποβάλλετε την κατάσταση οδοιπορικών γιατί δεν περιέχει αιτήματα οδοιπορικών.");
              return;
            }

            // Proceed with submiton if  travelcost requests exist
            const confirmSubmit = window.confirm("Είστε σίγουροι ότι θέλετε να υποβάλετε την κατάσταση οδοιπορικών;");
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
            const response = await fetch(`/api/school/travelcostinventory/submitted/${id}`, requestOptions);
            if (!response.ok) {
              setErrorMessage("Κάτι πήγε στραβά. Δεν μπόρεσε να υποβληθεί η κατάσταση οδοιπορικών");
            }
            setDisabledSchoolTravelcostInventoryButtons((prev) => [...prev, id]); // Add the index of the disabled button to the state
            getSchoolTravelcostInventories();
            alert("Η κατάσταση οδοιπορικών υποβλήθηκε επιτυχώς");
            
          };  

    const toggleRow = (id) => {
        setExpandedRow(expandedRow === id ? null : id);
      };
    
      const handleInsertModal = () => {
        setActiveInsertModal(!activeInsertModal);
        getSchoolTravelcostInventories();
        setId(null);
      };
    

    
      // Function to get the inserted travelcost requests of the selected inventory
      const getInsertedTravelcostRequests = async (id) => {
        const requestOptions = {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token,
          },
        };
    
        const response = await fetch(`/api/school/travelcostinventory/${id}/insertedrequests`, requestOptions);
        if (!response.ok) {
          setErrorMessage("Kάτι πήγε στραβά. Δεν μπόρεσαν να φορτωθούν τα αιτήματα εισηγμένων οδοιπορικών");
        } else {
          const data = await response.json();
          setInsertedRequests(data);
          setErrorMessage("");
        }
      };
    
      useEffect(() => {
        if (expandedRow !== null) {
          getInsertedTravelcostRequests(expandedRow);
        }
      }, [expandedRow, token]);
    
      const refreshInsertedTravelcostRequests = async (id) => {
        const requestOptions = {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token,
          },
        };
    
        const response = await fetch(`/api/school/travelcostinventory/${id}/insertedrequests`, requestOptions);
        if (!response.ok) {
          setErrorMessage("Kάτι πήγε στραβά. Δεν μπόρεσαν να φορτωθούν τα αιτήματα εισηγμένων οδοιπορικών");
        } else {
          const data = await response.json();
          setInsertedRequests(data);
          setErrorMessage("");
        }
      };
    
      // Function to remove the inserted travelcost request from the selected inventory
      const removeInsertedlTravelcostRequest = async (travelcostrequest_id) => {
        const requestOptions = {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token,
          },
        };
      
      const response = await fetch(`/api/school/travelcostinventory/${travelcostrequest_id}/removerequest`, requestOptions);
      if (!response.ok) {
        setErrorMessage("Kάτι πήγε στραβά. Δεν μπόρεσε να αφαιρεθεί το αίτημα οδοιπορικών από την κατάσταση οδοιπορικών");
      } else {
        setErrorMessage("");
        getInsertedTravelcostRequests(expandedRow);
        // Refresh approved travelcost requests after removal
        refreshApprovedTravelcostRequests();
        refreshInsertedTravelcostRequests();
        alert("Το αίτημα οδοιπορικών αφαιρέθηκε επιτυχώς");
      }
    };
    

    // Load disabledSchoolTravelcostInventoryButtons from localStorage on initial render
        useEffect(() => {
            const savedDisabledSchoolTravelcostInventoryButtons = localStorage.getItem("disabledSchoolTravelcostInventoryButtons");
            if (savedDisabledSchoolTravelcostInventoryButtons) {
              setDisabledSchoolTravelcostInventoryButtons(JSON.parse(savedDisabledSchoolTravelcostInventoryButtons));
            }
        }, []);
        
        // Update localStorage whenever disabledSchoolTravelcostInventoryButtons state changes
        useEffect(() => {
            localStorage.setItem("disabledSchoolTravelcostInventoryButtons", JSON.stringify(disabledSchoolTravelcostInventoryButtons));
        }, [disabledSchoolTravelcostInventoryButtons]);
  


return (
    <>
      <ErrorMessage message={errorMessage} /> 
      <TravelcostInventoryModal
        active={activeCreateModal}
        handleCreateModal={handleCreateModal}
        token={token}
        id={id}
        setErrorMessage={setErrorMessage}
      />
      <InsertTravelcostRequestToInventoryModal
        active={activeInsertModal}
        handleInsertModal={handleInsertModal}
        inventoryId={inventoryId}
        inventoryMonth={inventoryMonth}
        inventoryYear={inventoryYear}
        token={token}
        setErrorMessage={setErrorMessage}
        refreshApprovedTravelcostRequests={refreshApprovedTravelcostRequests}
        refreshInsertedTravelcostRequests={() => refreshInsertedTravelcostRequests(inventoryId)} // Pass the callback
        />
      { loadedRequests && approvedTravelcostRequests ? (
        <>
          <div className="columns has-background-info mb-5 mt-5">
            <div className="column is-10 has-text-centered">
              <h4 className="title is-5 mt-2">Πίνακας Εγκεκριμένων Αιτημάτων Οδοιπορικών Εκπαιδευτικών   {detail.lastName}</h4>
            </div>
          </div>
                     
         <table className="table is-fullwidth">
            <thead>
              <tr>
                <th>Επίθετο</th>
                <th>Όνομα</th>
                <th>Σχολείο Οργανικής</th>
                <th>Σχολείο Διάθεσης</th>
                <th>Μήνας</th>
                <th>Έτος</th>
                <th>Ημέρες</th>      
             </tr>
            </thead>
            <tbody>
            {approvedTravelcostRequests.map((travelcostrequest) => (
              <tr key={travelcostrequest.id}>
                <td>{travelcostrequest.last_name}</td>
                <td>{travelcostrequest.first_name}</td>
                <td>{travelcostrequest.start_school}</td>
                <td>{travelcostrequest.destination_school}</td>
                <td>{travelcostrequest.month}</td>
                <td>{travelcostrequest.year}</td>
                <td>{travelcostrequest.number_of_travels}</td>
              </tr>
            ))}
            </tbody>
          </table>
        </>
      
    ) : (
      <button class="button is-loading">Loading</button>
    )
      }

    { loadedInventories && schoolTravelcostInventories ? (
            <>
          <div className="columns has-background-info mb-5 mt-6">
            <div className="column is-10 has-text-centered">
              <h4 className="title is-5 mt-2">Πίνακας Καταστάσεων Οδοιπορικών {detail.lastName}</h4>
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
             {schoolTravelcostInventories.map((travelcostinventory, index) => (
                             <React.Fragment key={travelcostinventory.id}>
                               {/* Parent Row */}
                               <tr key={travelcostinventory.id}>
                                 <td>
                                   <button
                                     className="button is-small"
                                     onClick={() => {
                                       setInventoryId(travelcostinventory.id);
                                       setInventoryMonth(travelcostinventory.month);
                                       setInventoryYear(travelcostinventory.year);
                                       toggleRow(travelcostinventory.id)}
                                     }
                                   >
                                     {expandedRow === travelcostinventory.id ? (
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
                                 <td>Οδοιπορικά</td>
                                 <td>{travelcostinventory.school}</td>
                                 <td>{travelcostinventory.month}</td>
                                 <td>{travelcostinventory.year}</td>
             
                                 <td>
                                   <button
                                     key={travelcostinventory.id}
                                     disabled={disabledSchoolTravelcostInventoryButtons.includes(travelcostinventory.id)}
                                     className="button mr-2 is-link is-light"
                                     onClick={() => handleUpdateTravelcostInventory(travelcostinventory.id)}
                                   >
                                     Επεξεργασία
                                   </button>
                                   <button
                                     key={travelcostinventory.id}
                                     disabled={disabledSchoolTravelcostInventoryButtons.includes(travelcostinventory.id)}
                                     className="button mr-2 is-danger is-light"
                                     onClick={() => handleDeleteTravelcostInventory(travelcostinventory.id)}
                                   >
                                     Διαγραφή
                                   </button>
                                   <button
                                     key={travelcostinventory.id}
                                     disabled={disabledSchoolTravelcostInventoryButtons.includes(travelcostinventory.id)}
                                     className="button mr-2 is-primary"
                                     onClick={() => handleSubmitTravelcostInventory(travelcostinventory.id)}
                                   >
                                     Υποβολή
                                   </button>
                                 </td>
                               </tr>
             
                               {/* Child Row - Requests */}
                               {expandedRow === travelcostinventory.id && (
                                 <tr>
                                   <td colSpan="7">
                                     <table className="table is-fullwidth is-narrow ml-6">
                                       <thead>
                                         <tr>
                                           <th>
                                             <button
                                               className="button is-small"
                                               onClick={() => {
                                                 setInventoryId(travelcostinventory.id);
                                                 setInventoryMonth(travelcostinventory.month);
                                                 setInventoryYear(travelcostinventory.year);
                                                 //alert(inventoryMonth);
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
                                           <th>Ημέρες</th>
                                           <th></th>
                                         </tr>
                                       </thead>
                                       <tbody>
                                         { insertedRequests.length > 0 ? (
                                             insertedRequests.map((travelcostrequest, requestIndex) => (
                                               <tr key={travelcostrequest.id}>
                                                 <td></td>
                                                 <td>{requestIndex + 1}</td>
                                                 <td>{travelcostrequest.last_name}</td>
                                                 <td>{travelcostrequest.first_name}</td>
                                                 <td>{travelcostrequest.month}</td>
                                                 <td>{travelcostrequest.year}</td>
                                                 <td>{travelcostrequest.number_of_travels}</td>
                                                 <td>
                                                   <button 
                                                   className="button  is-danger"
                                                   disabled={disabledSchoolTravelcostInventoryButtons.includes(travelcostinventory.id)}
                                                   onClick={() => removeInsertedlTravelcostRequest(travelcostrequest.id)}
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
                                               Δεν υπάρχουν οδοιπορικά στην κατάσταση οδοιπορικών
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
             

export default SchoolTravelcostTable;
