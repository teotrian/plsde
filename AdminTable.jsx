import React, { useContext, useEffect, useState } from "react";
import { UserContext } from "../context/UserContext";
import { DetailContext } from "../context/DetailContext";

import ErrorMessage from "./ErrorMessage";
import AdminOvertimeTable from "./AdminOvertimeTable";
import AdminTravelcostTable from "./AdminTravelcostTable";
import AdminExamTable from "./AdminExamTable";
import AdminMaintenanceTable from "./AdminMaintenanceTable";

const AdminTable = () => {
  const [token] = useContext(UserContext);
  const [detail] = useContext(DetailContext);
  const [errorMessage, setErrorMessage] = useState("");
  const [school, setSchool] = useState(detail.lastName);
  const [id, setId] = useState(null);
  const [adminChoice, setAdminChoice] = useState("");
  const [modeChoice, setModeChoice] = useState("");
  const [expandedOvertimeRow, setExpandedOvertimeRow] = useState(null);  
  const [expandedTravelcostRow, setExpandedTravelcostRow] = useState(null);  
  const [expandedExamRow, setExpandedExamRow] = useState(null);

  const [inventoryId, setInventoryId] = useState(null);

  const [countRegisterRequests, setCountRegisterRequests] = useState(0);
  const [loadedRegisterRequests, setLoadedRegisterRequests] = useState(false);
  const [registerRequests, setRegisterRequests] = useState(null);
  
  const [countOvertimeInventories, setCountOvertimeInventories] = useState(0);  
  const [loadedOvertimeInventories, setLoadedOvertimeInventories] = useState(false); 
  const [overtimeInventories, setOvertimeInventories] = useState(null);
  const [insertedOvertimeRequests, setInsertedOvertimeRequests] = useState([]);
  const [disabledAdminOvertimeButtons, setDisabledAdminOvertimeButtons] = useState([]);
  
  const [countTravelcostInventories, setCountTravelcostInventories] = useState(0);  
  const [loadedTravelcostInventories, setLoadedTravelcostInventories] = useState(false); 
  const [travelcostInventories, setTravelcostInventories] = useState(null);
  const [insertedTravelcostRequests, setInsertedTravelcostRequests] = useState([]);
  const [disabledAdminTravelcostButtons, setDisabledAdminTravelcostButtons] = useState([]);
    
  const [countExamInventories, setCountExamInventories] = useState(0);  
  const [loadedExamInventories, setLoadedExamInventories] = useState(false); 
  const [examInventories, setExamInventories] = useState(null);
  const [insertedExamParticipations, setInsertedExamParticipations] = useState([]);
  const [disabledAdminExamButtons, setDisabledAdminExamButtons] = useState([]);


  const toggleOvertimeRow = (id) => {
    setExpandedOvertimeRow(expandedOvertimeRow === id ? null : id);
  };

  const toggleTravelcostRow = (id) => {
    setExpandedTravelcostRow(expandedTravelcostRow === id ? null : id);
  };

  const toggleExamRow = (id) => {
    setExpandedExamRow(expandedExamRow === id ? null : id);
  };

  //Function to get the count of the register requests
  const getCountOfRegisterRequests = async () => {
    const requestOptions = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
    };
    
    const response = await fetch(`/api/admin/countregisterrequests`, requestOptions);
    if (!response.ok) {
      setErrorMessage("Kάτι πήγε στραβά. Δεν μπόρεσαν να μετρηθούν τα αιτήματα εγγραφής νέων χρηστών");
    } else {
      const data = await response.json();
      setCountRegisterRequests(data);
      setErrorMessage("");
    }
  };

  //Function to get the of the new register requests  
  const getRegisterRequests = async () => {
    const requestOptions = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
    };
      
    const response = await fetch(`/api/admin/registerrequests`, requestOptions);
    if (!response.ok) {
      setErrorMessage("Kάτι πήγε στραβά. Δεν μπόρεσαν να φορτωθούν τα αιτήματα εγγραφής νέων χρηστών");
    } else {
      const data = await response.json();
      setRegisterRequests(data);
      setErrorMessage("");
      setLoadedRegisterRequests(true);
    }
  };
    
  useEffect(() => {
    getCountOfRegisterRequests();
    getRegisterRequests();
  }, [token]);

  // Function to check a register request
  const handleCheckRegisterRequest = async (id) => {
    const requestOptions = {
      method: "GET",
      headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
      },
    };
    const response = await fetch(`/api/admin/registerrequests/check/${id}`, requestOptions);
    const checkresult = await response.json();
    if (!response.ok) {
        setErrorMessage("Κάτι πήγε στραβά. Δεν μπόρεσε να ελεγχθεί το αίτημα εγγραφής");
    } else {
        alert(checkresult.message);
    }  
  };  

  
  // Function to approve a register request
  const handleApproveRegisterRequest = async (id) => {
    const confirmApproveRegisterRequest = window.confirm("Είστε σίγουροι ότι θέλετε να εγκρίνετε το αίτημα εγγραφής;");
      if (!confirmApproveRegisterRequest) {
        return;
      }  
    const requestOptions = {
      method: "PUT",
      headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
      },
    };
    const response = await fetch(`/api/admin/registerrequests/approve/${id}`, requestOptions);
      if (!response.ok) {
        setErrorMessage("Κάτι πήγε στραβά. Δεν μπόρεσε να εγκριθεί το αίτημα εγγραφής");
      }
    getRegisterRequests();
    getCountOfRegisterRequests(); 
    alert("Το αίτημα εγγραφής εγκρίθηκε επιτυχώς και ο νέος χρήστης έχει δημιουργηθεί");
  };  
      
  // Function to disapprove a register request
  const handleDisapproveRegisterRequest = async (id) => {
    const confirmDisapproveRegisterRequest = window.confirm("Είστε σίγουροι ότι θέλετε να απορρίψετε το αίτημα εγγραφής;");
      if (!confirmDisapproveRegisterRequest) {
        return;
      }
    const requestOptions = {
      method: "PUT",
      headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
      },
    };
    const response = await fetch(`/api/admin/registerrequests/disapprove/${id}`, requestOptions);
      if (!response.ok) {
        setErrorMessage("Κάτι πήγε στραβά. Δεν μπόρεσε να απορριφθεί το αίτημα εγγραφής");
      }
    getRegisterRequests();
    getCountOfRegisterRequests();
    alert("Tο αίτημα εγγραφής απορρίφθηκε επιτυχώς");
  };



  //Function to get the count of the submitted overtime inventories
  const getCountOfOvertimeInventories = async () => {
    const requestOptions = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
    };
    
    const response = await fetch(`/api/admin/countovertimeinventories`, requestOptions);
    if (!response.ok) {
      setErrorMessage("Kάτι πήγε στραβά. Δεν μπόρεσαν να μετρηθούν οι καταστάσεις υπερωριών");
    } else {
      const data = await response.json();
      setCountOvertimeInventories(data);
      setErrorMessage("");
    }
  };

  //Function to get the of the submitted overtime inventories  
    const getOvertimeInventories = async () => {
      const requestOptions = {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
      };
      
      const response = await fetch(`/api/admin/overtimeinventories`, requestOptions);
      if (!response.ok) {
        setErrorMessage("Kάτι πήγε στραβά. Δεν μπόρεσαν να φορτωθούν οι καταστάσεις υπερωριών");
      } else {
        const data = await response.json();
        setOvertimeInventories(data);
        setErrorMessage("");
        setLoadedOvertimeInventories(true);
      }
    };
    
    useEffect(() => {
      getCountOfOvertimeInventories();
      getOvertimeInventories();
    }, [token]);

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
          setInsertedOvertimeRequests(data);
          setErrorMessage("");
        }
      };
    
      useEffect(() => {
        if (expandedOvertimeRow !== null) {
          getInsertedOvertimeRequests(expandedOvertimeRow);
        }
      }, [expandedOvertimeRow, token]);
     
    // Load disabledAdminOvertimeButtons from localStorage on initial render
        useEffect(() => {
            const savedDisabledAdminOvertimeButtons = localStorage.getItem("disabledAdminOvertimeButtons");
            if (savedDisabledAdminOvertimeButtons) {
              setDisabledAdminOvertimeButtons(JSON.parse(savedDisabledAdminOvertimeButtons));
            }
        }, []);
        
    // Update localStorage whenever disabledAdminOvertimeButtons state changes
        useEffect(() => {
            localStorage.setItem("disabledAdminOvertimeButtons", JSON.stringify(disabledAdminOvertimeButtons));
        }, [disabledAdminOvertimeButtons]);
        
    // Function to approve an overtime inventory
        const handleApproveOvertimeInventory = async (id) => {
          const confirmApproveOvertimeInventory = window.confirm("Είστε σίγουροι ότι θέλετε να εγκρίνετε την κατάσταση υπερωριών;");
              if (!confirmApproveOvertimeInventory) {
                return;
              }  
          const requestOptions = {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
               Authorization: "Bearer " + token,
              },
            };
            const response = await fetch(`/api/admin/overtimeinventories/approve/${id}`, requestOptions);
            if (!response.ok) {
              setErrorMessage("Κάτι πήγε στραβά. Δεν μπόρεσε να εγκριθεί η κατάσταση υπερωριών");
            }
            setDisabledAdminOvertimeButtons((prev) => [...prev, id]); // Add the index of the disabled button to the state
            getOvertimeInventories();
            getCountOfOvertimeInventories(); 
            alert("Η κατάσταση υπερωριών εγκρίθηκε επιτυχώς");
        };  
      
    // Function to disapprove an overtime inventory

    const handleDisapproveOvertimeInventory = async (id) => {
             const confirmDisapproveOvertimeInventory = window.confirm("Είστε σίγουροι ότι θέλετε να απορρίψετε την κατάσταση υπερωριών;");
              if (!confirmDisapproveOvertimeInventory) {
                return;
              }
              const requestOptions = {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
               Authorization: "Bearer " + token,
              },
            };
            const response = await fetch(`/api/admin/overtimeinventories/disapprove/${id}`, requestOptions);
            if (!response.ok) {
              setErrorMessage("Κάτι πήγε στραβά. Δεν μπόρεσε να απορριφθεί η κατάσταση υπερωριών");
            }
            setDisabledAdminOvertimeButtons((prev) => [...prev, id]); // Add the index of the disabled button to the state
            getOvertimeInventories();
            getCountOfOvertimeInventories(); 
            alert("Η κατάσταση υπερωριών απορρίφθηκε επιτυχώς");
        };  

  //Travelcost      
  //Function to get the count of the submitted travelcost inventories
  const getCountOfTravelcostInventories = async () => {
    const requestOptions = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
    };
    
    const response = await fetch(`/api/admin/counttravelcostinventories`, requestOptions);
    if (!response.ok) {
      setErrorMessage("Kάτι πήγε στραβά. Δεν μπόρεσαν να μετρηθούν οι καταστάσεις οδοιπορικών");
    } else {
      const data = await response.json();
      setCountTravelcostInventories(data);
      setErrorMessage("");
    }
  };

  //Function to get the of the submitted travelcost inventories  
  const getTravelcostInventories = async () => {
    const requestOptions = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
    };
    
    const response = await fetch(`/api/admin/travelcostinventories`, requestOptions);
    if (!response.ok) {
      setErrorMessage("Kάτι πήγε στραβά. Δεν μπόρεσαν να φορτωθούν οι καταστάσεις οδοιπορικών");
    } else {
      const data = await response.json();
      setTravelcostInventories(data);
      setErrorMessage("");
      setLoadedTravelcostInventories(true);
    }
  };
  
  useEffect(() => {
    getCountOfTravelcostInventories();
    getTravelcostInventories();
  }, [token]);
  
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
      setInsertedTravelcostRequests(data);
      setErrorMessage("");
    }
  };

  useEffect(() => {
    if (expandedTravelcostRow !== null) {
      getInsertedTravelcostRequests(expandedTravelcostRow);
    }
  }, [expandedTravelcostRow, token]);
  

// Load disabledAdminTravelcostButtons from localStorage on initial render
    useEffect(() => {
        const savedDisabledAdminTravelcostButtons = localStorage.getItem("disabledAdminTravelcostButtons");
        if (savedDisabledAdminTravelcostButtons) {
          setDisabledAdminTravelcostButtons(JSON.parse(savedDisabledAdminTravelcostButtons));
        }
    }, []);
    
// Update localStorage whenever disabledAdminTravelcostButtons state changes
    useEffect(() => {
        localStorage.setItem("disabledAdminTravelcostButtons", JSON.stringify(disabledAdminTravelcostButtons));
    }, [disabledAdminTravelcostButtons]);
    
// Function to approve an Travelcost inventory
    const handleApproveTravelcostInventory = async (id) => {
      const confirmApproveTravelcostInventory = window.confirm("Είστε σίγουροι ότι θέλετε να εγκρίνετε την κατάσταση οδοιπορικών;");
          if (!confirmApproveTravelcostInventory) {
            return;
      }    
      const requestOptions = {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
           Authorization: "Bearer " + token,
          },
        };
        const response = await fetch(`/api/admin/travelcostinventories/approve/${id}`, requestOptions);
        if (!response.ok) {
          setErrorMessage("Κάτι πήγε στραβά. Δεν μπόρεσε να εγκριθεί η κατάσταση οδοιπορικών");
        }
        setDisabledAdminTravelcostButtons((prev) => [...prev, id]); // Add the index of the disabled button to the state
        getTravelcostInventories();
        getCountOfTravelcostInventories(); 
        alert("Η κατάσταση οδοιπορικών εγκρίθηκε επιτυχώς");
    };  
  
// Function to disapprove an Travelcost inventory
    const handleDisapproveTravelcostInventory = async (id) => {
      const confirmDisapproveTravelcostInventory = window.confirm("Είστε σίγουροι ότι θέλετε να απορρίψετε την κατάσταση οδοιπορικών;");
          if (!confirmDisapproveTravelcostInventory) {
            return;
      }    
      const requestOptions = {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
           Authorization: "Bearer " + token,
          },
        };
        const response = await fetch(`/api/admin/travelcostinventories/disapprove/${id}`, requestOptions);
        if (!response.ok) {
          setErrorMessage("Κάτι πήγε στραβά. Δεν μπόρεσε να απορριφθεί η κατάσταση οδοιπορικών");
        }
        setDisabledAdminTravelcostButtons((prev) => [...prev, id]); // Add the index of the disabled button to the state
        getTravelcostInventories();
        getCountOfTravelcostInventories(); 
        alert("Η κατάσταση οδοιπορικών απορρίφθηκε επιτυχώς");
    };  


  //Exam 
  //Function to get the count of the submitted exam inventories
  const getCountOfExamInventories = async () => {
    const requestOptions = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
    };
    
    const response = await fetch(`/api/admin/countexaminventories`, requestOptions);
    if (!response.ok) {
      setErrorMessage("Kάτι πήγε στραβά. Δεν μπόρεσαν να μετρηθούν οι καταστάσεις πανελλαδικών");
    } else {
      const data = await response.json();
      setCountExamInventories(data);
      setErrorMessage("");
    }
  };

//Function to get the of the submitted exam inventories  
    const getExamInventories = async () => {
      const requestOptions = {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
      };
      
      const response = await fetch(`/api/admin/examinventories`, requestOptions);
      if (!response.ok) {
        setErrorMessage("Kάτι πήγε στραβά. Δεν μπόρεσαν να φορτωθούν οι καταστάσεις πανελλαδικών");
      } else {
        const data = await response.json();
        setExamInventories(data);
        setErrorMessage("");
        setLoadedExamInventories(true);
      }
    };
    
    useEffect(() => {
      getCountOfExamInventories();
      getExamInventories();
    }, [token]);

    // Function to get the inserted Exam participations of the selected inventory
      const getInsertedExamPaticipations = async (id) => {
        const requestOptions = {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token,
          },
        };
    
        const response = await fetch(`/api/school/examinventory/${id}/insertedparticipations`, requestOptions);
        if (!response.ok) {
          setErrorMessage("Kάτι πήγε στραβά. Δεν μπόρεσαν να φορτωθούν οι συμμετοχές πανελλαδικών");
        } else {
          const data = await response.json();
          setInsertedExamParticipations(data);
          setErrorMessage("");
        }
      };
    
      useEffect(() => {
        if (expandedExamRow !== null) {
          getInsertedExamPaticipations(expandedExamRow);
        }
      }, [expandedExamRow, token]);

    // Load disabledAdminExamButtons from localStorage on initial render
        useEffect(() => {
            const savedDisabledAdminExamButtons = localStorage.getItem("disabledAdminExamButtons");
            if (savedDisabledAdminExamButtons) {
              setDisabledAdminExamButtons(JSON.parse(savedDisabledAdminExamButtons));
            }
        }, []);
        
    // Update localStorage whenever disabledAdminExamButtons state changes
        useEffect(() => {
            localStorage.setItem("disabledAdminExamButtons", JSON.stringify(disabledAdminExamButtons));
        }, [disabledAdminExamButtons]);
        
    // Function to approve an Exam inventory
        const handleApproveExamInventory = async (id) => {
          const confirmApproveExamInventory = window.confirm("Είστε σίγουροι ότι θέλετε να εγκρίνετε την κατάσταση πανελλαδικών;");
          if (!confirmApproveExamInventory) {
            return;
          }      
          const requestOptions = {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
               Authorization: "Bearer " + token,
              },
            };
            const response = await fetch(`/api/admin/examinventories/approve/${id}`, requestOptions);
            if (!response.ok) {
              setErrorMessage("Κάτι πήγε στραβά. Δεν μπόρεσε να εγκριθεί η κατάσταση πανελλαδικών");
            }
            setDisabledAdminExamButtons((prev) => [...prev, id]); // Add the index of the disabled button to the state
            getExamInventories();
            getCountOfExamInventories(); 
            alert("Η κατάσταση πανελλαδικών εγκρίθηκε επιτυχώς");
        };  
      
    // Function to disapprove an Exam inventory
        const handleDisapproveExamInventory = async (id) => {
          const confirmDisapproveExamInventory = window.confirm("Είστε σίγουροι ότι θέλετε να απορρίψετε την κατάσταση πανελλαδικών;");
          if (!confirmDisapproveExamInventory) {
            return;
          }    
          const requestOptions = {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
               Authorization: "Bearer " + token,
              },
            };
            const response = await fetch(`/api/admin/examinventories/disapprove/${id}`, requestOptions);
            if (!response.ok) {
              setErrorMessage("Κάτι πήγε στραβά. Δεν μπόρεσε να απορριφθεί η κατάσταση πανελλαδικών");
            }
            setDisabledAdminExamButtons((prev) => [...prev, id]); // Add the index of the disabled button to the state
            getExamInventories();
            getCountOfExamInventories(); 
            alert("Η κατάσταση πανελλαδικών απορρίφθηκε επιτυχώς");
        };  

  return (
      <>
      <ErrorMessage message={errorMessage} /> 

      <div className="field" style={{ display: "flex", justifyContent: "flex-end" }}>
        <button
          className="button ml-2 is-warning "
          onClick={(e) => setModeChoice("Συντήρηση")}
        >
          <span className="icon-text">
            <span>Συντήρηση</span>
            <span className="icon">
              <i className="fa-solid fa-screwdriver-wrench"></i>
            </span>
          </span>
        </button>
         {!modeChoice ? (<></>) : (
        <button
        className="button ml-2 is-warning"
        onClick={(e) => setModeChoice("")}
        >                  
        <span className="icon">
          <i className="fa fa-home" aria-hidden="true"></i>
        </span>
        </button>
        
        )}
      </div>
    {!modeChoice ? (
      <>

      <div className="field">
      <label className="label">Επιλέξτε την κατηγορία με την οποία θέλετε να ασχοληθείτε : </label>
      <div className="control is-flex is-align-items-center">
        <div className="select is-warning">
        <select 
        value={adminChoice} // Bind the value to schoolChoice
        onChange={(e) => setAdminChoice(e.target.value)}
        className="input"
        required>
          <option value="" disabled>Κατηγορία</option>
          <option value="Υπερωρίες">Υπερωρίες</option>
          <option value="Οδοιπορικά">Οδοιπορικά</option>
          <option value="Πανελλαδικές">Πανελλαδικές</option>
        </select>   
        </div>

        {!adminChoice ? (<></>) : (
        <button
        className="button ml-2 is-warning"
        onClick={(e) => setAdminChoice("")}
        >                  
        <span className="icon">
          <i className="fa fa-home" aria-hidden="true"></i>
        </span>
        </button>
        
        )}
      </div> 
      </div>




      {!adminChoice ? (
      <>

      <div className="column ">
      <h4 className="title is-6 mt-3">Υπάρχουν {countRegisterRequests} νέα αιτήματα εγγραφής Χρηστών :</h4>
      </div>

      { loadedRegisterRequests && registerRequests ? (
      <>
      <div className="columns has-background-warning mb-5 mt-2">
      <div className="column is-12 has-text-centered">
        <h4 className="title is-5 mt-2">Πίνακας νέων αιτημάτων Εγγραφής Χρηστών</h4>
      </div>
      </div>
      
      <table className="table is-fullwidth">
      <thead>
        <tr>
        <th>A/A</th>
        <th>Κατηγορία</th>
        <th className="has-text-centered">ΑΦΜ </th>
        <th>Κωδικός Σχολείου</th>
        <th className="has-text-centered">Email</th>
        <th>Έλεγχος</th>
        <th className="has-text-centered">Ενέργειες</th>
       </tr>
      </thead>
      <tbody>
       {registerRequests.map((registerRequest,index) => (
        <React.Fragment key={registerRequest.id}>

        <tr key={registerRequest.id}>
          <td>{index+1}</td>
          <td>{registerRequest.category}</td>
          <td className="has-text-centered">{registerRequest.afm}</td>
          <td>{registerRequest.kodikos}</td>
          <td className="has-text-centered">{registerRequest.email}</td>
          <td >
          <button
          key={registerRequest.id}
          className="button mr-2 is-info is-light"
          onClick={() => handleCheckRegisterRequest(registerRequest.id)}
          >
          
          <span className="icon">
            <i class="fa-solid fa-magnifying-glass"></i>
          </span>
          </button>
          </td>
          <td className="has-text-centered">
          <button
          key={registerRequest.id}
          className="button mr-2 is-danger is-light"
          onClick={() => handleDisapproveRegisterRequest(registerRequest.id)}
          >
          Απόρριψη
          </button>
          <button
          key={registerRequest.id}
          className="button mr-2 is-primary"
          onClick={() => handleApproveRegisterRequest(registerRequest.id)}
          >
          Έγκριση
          </button>
          </td>
        </tr>
        </React.Fragment>
        ))}
      </tbody>
      </table>
      </>      
      ) : (
      <button className="button is-loading">Loading</button>
      )}



      <div className="column ">
      <h4 className="title is-6 mt-3">Υπάρχουν {countOvertimeInventories} νέες καταστάσεις Υπερωριών από σχολεία :</h4>
      </div>

      { loadedOvertimeInventories && overtimeInventories ? (
      <>
      <div className="columns has-background-warning mb-5 mt-2">
      <div className="column is-12 has-text-centered">
        <h4 className="title is-5 mt-2">Πίνακας νέων Καταστάσεων Υπερωριών Σχολείων</h4>
      </div>
      </div>
      
      <table className="table is-fullwidth">
      <thead>
        <tr>
        <th></th>
        <th>A/A</th>
        <th>Σχολείο</th>
        <th>Μήνας</th>
        <th>Έτος</th>
        <th className="has-text-centered">Ενέργειες</th>
       </tr>
      </thead>
      <tbody>
       {overtimeInventories.map((overtimeinventory,index) => (
        <React.Fragment key={overtimeinventory.id}>
        {/* Parent Row */}
        <tr key={overtimeinventory.id}>
          <td>
            <button
            className="button is-small"
            onClick={() => {
            setInventoryId(overtimeinventory.id);
            toggleOvertimeRow(overtimeinventory.id)}
            }
            >
            {expandedOvertimeRow === overtimeinventory.id ? (
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
          <td>{index+1}</td>
          <td>{overtimeinventory.school}</td>
          <td>{overtimeinventory.month}</td>
          <td>{overtimeinventory.year}</td>
          <td className="has-text-centered">
          <button
          key={overtimeinventory.id}
          disabled={disabledAdminOvertimeButtons.includes(overtimeinventory.id)} // Disable if index is in the state
          className="button mr-2 is-danger is-light"
          onClick={() => handleDisapproveOvertimeInventory(overtimeinventory.id)}
          >
          Απόρριψη
          </button>
          <button
          key={overtimeinventory.id}
          disabled={disabledAdminOvertimeButtons.includes(overtimeinventory.id)} // Disable if index is in the state
          className="button mr-2 is-primary"
          onClick={() => handleApproveOvertimeInventory(overtimeinventory.id)}
          >
          Έγκριση
          </button>
          </td>
        </tr>
          {/* Child Row - Requests */}
            {expandedOvertimeRow === overtimeinventory.id && (
              <tr>
                <td colSpan="7">
                <table className="table is-fullwidth is-narrow ml-6">
                <thead>
                  <tr>
                  <th>A/A</th>
                  <th>Επίθετο</th>
                  <th>Όνομα</th>
                  <th>Μήνας</th>
                  <th>Έτος</th>
                  <th className="has-text-centered">Υπερωρίες</th>
                  <th>Έγγραφα</th>
                  </tr>
                </thead>
                <tbody>
                { insertedOvertimeRequests.length > 0 ? (
                  insertedOvertimeRequests.map((overtimerequest, requestIndex) => (
                  <tr key={overtimerequest.id}>
                  <td>{requestIndex + 1}</td>
                  <td>{overtimerequest.last_name}</td>
                  <td>{overtimerequest.first_name}</td>
                  <td>{overtimerequest.month}</td>
                  <td>{overtimerequest.year}</td>
                  <td className="has-text-centered">{overtimerequest.number_of_overtimes}</td>
                  <td>
                  <button 
                    key={overtimerequest.id}
                    className="button mr-2 is-warning"
                    onClick={() => {
                      if (overtimerequest.assignment) {
                        const url = `http://localhost:8000/uploads/${overtimerequest.assignment}`;
                        const encodedUrl = encodeURI(url);
                        window.open(encodedUrl, "_blank");
                      } else {
                        alert("Δεν υπάρχει αρχείο απόφασης για αυτό το αίτημα.");
                      }
                  }}
                  >                                 
                  <span className="icon">
                      <i className="fa-solid fa-file"></i>
                  </span>
                  </button>
                  <button 
                    key={overtimerequest.id}
                    className="button mr-2 is-warning"
                    onClick={() => {
                      if (overtimerequest.schedule) {
                        const url = `http://localhost:8000/uploads/${overtimerequest.schedule}`;
                        const encodedUrl = encodeURI(url);
                        window.open(encodedUrl, "_blank");
                      } else {
                        alert("Δεν υπάρχει αρχείο προγράμματος για αυτό το αίτημα.");
                      }
                  }}
                  >
                    <span className="icon">
                      <i className="fa-solid fa-file"></i>
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
      <button className="button is-loading">Loading</button>
      )}

    <div className="column">
      <h4 className="title is-6 m t-2">Υπάρχουν {countTravelcostInventories} νέες καταστάσεις Οδοιπορικών από σχολεία :</h4>
    </div>
     
    { loadedTravelcostInventories && travelcostInventories ? (
      <>
      <div className="columns has-background-warning mb-5 mt-2">
      <div className="column is-12 has-text-centered">
        <h4 className="title is-5 mt-2">Πίνακας νέων Καταστάσεων Οδοιπορικών Σχολείων</h4>
      </div>
      </div>
      
      <table className="table is-fullwidth">
      <thead>
        <tr>
        <th></th>
        <th>A/A</th>
        <th>Σχολείο</th>
        <th>Μήνας</th>
        <th>Έτος</th>
        <th className="has-text-centered">Ενέργειες</th>
       </tr>
      </thead>
      <tbody>
       {travelcostInventories.map((travelcostinventory,index) => (
        <React.Fragment key={travelcostinventory.id}>
        {/* Parent Row */}
        <tr key={travelcostinventory.id}>
          <td>
            <button
            className="button is-small"
            onClick={() => {
            setInventoryId(travelcostinventory.id);
            toggleTravelcostRow(travelcostinventory.id)}
            }
            >
            {expandedTravelcostRow === travelcostinventory.id ? (
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
          <td>{index+1}</td>
          <td>{travelcostinventory.school}</td>
          <td>{travelcostinventory.month}</td>
          <td >{travelcostinventory.year}</td>
          <td className="has-text-centered">
          <button
          key={travelcostinventory.id}
          disabled={disabledAdminTravelcostButtons.includes(travelcostinventory.id)} // Disable if index is in the state
          className="button mr-2 is-danger is-light"
          onClick={() => handleDisapproveTravelcostInventory(travelcostinventory.id)}
          >
          Απόρριψη
          </button>
          <button
          key={travelcostinventory.id}
          disabled={disabledAdminTravelcostButtons.includes(travelcostinventory.id)} // Disable if index is in the state
          className="button mr-2 is-primary"
          onClick={() => handleApproveTravelcostInventory(travelcostinventory.id)}
          >
          Έγκριση
          </button>
          </td>
        </tr>
          {/* Child Row - Requests */}
            {expandedTravelcostRow === travelcostinventory.id && (
              <tr>
                <td colSpan="7">
                <table className="table is-fullwidth is-narrow ml-6">
                <thead>
                  <tr>
                  <th>A/A</th>
                  <th>Επίθετο</th>
                  <th>Όνομα</th>
                  <th>Μήνας</th>
                  <th>Έτος</th>
                  <th className="has-text-centered">Ημέρες</th>
                  <th className="has-text-centered">Έγγραφα</th>
                  </tr>
                </thead>
                <tbody>
                { insertedTravelcostRequests.length > 0 ? (
                  insertedTravelcostRequests.map((travelcostrequest, requestIndex) => (
                  <tr key={travelcostrequest.id}>
                  <td>{requestIndex + 1}</td>
                  <td>{travelcostrequest.last_name}</td>
                  <td>{travelcostrequest.first_name}</td>
                  <td>{travelcostrequest.month}</td>
                  <td>{travelcostrequest.year}</td>
                  <td className="has-text-centered">{travelcostrequest.number_of_travels}</td>
                  <td className="has-text-centered">
                  <button 
                    key={travelcostrequest.id}
                    className="button mr-2 is-warning"
                    onClick={() => {
                      if (travelcostrequest.distribution) {
                        const url = `http://localhost:8000/uploads/${travelcostrequest.distribution}`;
                        const encodedUrl = encodeURI(url);
                        window.open(encodedUrl, "_blank");
                      } else {
                        alert("Δεν υπάρχει αρχείο απόφασης για αυτό το αίτημα.");
                      }
                  }}
                  >                                 
                  <span className="icon">
                      <i className="fa-solid fa-file"></i>
                  </span>
                  </button>
                                    <button 
                    key={travelcostrequest.id}
                    className="button mr-2 is-warning"
                    onClick={() => {
                      if (travelcostrequest.license) {
                        const url = `http://localhost:8000/uploads/${travelcostrequest.license}`;
                        const encodedUrl = encodeURI(url);
                        window.open(encodedUrl, "_blank");
                      } else {
                        alert("Δεν υπάρχει άδεια οδήγησης για αυτό το αίτημα.");
                      }
                  }}
                  >                                 
                  <span className="icon">
                      <i className="fa-solid fa-file"></i>
                  </span>
                  </button>
                  <button 
                    key={travelcostrequest.id}
                    className="button mr-2 is-warning"
                    onClick={() => {
                      if (travelcostrequest.schedule) {
                        const url = `http://localhost:8000/uploads/${travelcostrequest.schedule}`;
                        const encodedUrl = encodeURI(url);
                        window.open(encodedUrl, "_blank");
                      } else {
                        alert("Δεν υπάρχει αρχείο προγράμματος για αυτό το αίτημα.");
                      }
                  }}
                  >
                    <span className="icon">
                      <i className="fa-solid fa-file"></i>
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
      <button className="button is-loading">Loading</button>
      )}

      
      <div className="column">
      <h4 className="title is-6 m t-2">Υπάρχουν {countExamInventories} νέες καταστάσεις Πανελλαδικών από σχολεία :</h4>
      </div>

      { loadedExamInventories && examInventories ? (
      <>
      <div className="columns has-background-warning mb-5 mt-2">
      <div className="column is-12 has-text-centered">
        <h4 className="title is-5 mt-2">Πίνακας νέων Καταστάσεων Πανελλαδικών Σχολείων</h4>
      </div>
      </div>
      
      <table className="table is-fullwidth">
      <thead>
        <tr>
        <th></th>
        <th>A/A</th>
        <th>Σχολείο</th>
        <th>Όνομα</th>
        <th>Μήνας</th>
        <th>Έτος</th>
        <th>Έγγραφα</th>
        <th className="has-text-centered">Ενέργειες</th>
       </tr>
      </thead>
      <tbody>
       {examInventories.map((examinventory,index) => (
        <React.Fragment key={examinventory.id}>
        {/* Parent Row */}
        <tr key={examinventory.id}>
          <td>
            <button
            className="button is-small"
            onClick={() => {
            setInventoryId(examinventory.id);
            toggleExamRow(examinventory.id)}
            }
            >
            {expandedExamRow === examinventory.id ? (
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
          <td>{index+1}</td>
          <td>{examinventory.school}</td>
          <td>{examinventory.name}</td>
          <td>{examinventory.month}</td>
          <td>{examinventory.year}</td>
          <td>
                  <button 
                    key={examinventory.id}
                    className="button mr-2 is-warning"
                    onClick={() => {
                      if (examinventory.decree) {
                        const url = `http://localhost:8000/uploads/${examinventory.decree}`;
                        const encodedUrl = encodeURI(url);
                        window.open(encodedUrl, "_blank");
                      } else {
                        alert("Δεν υπάρχει αρχείο απόφασης για αυτήν την κατάσταση.");
                      }
                  }}
                  >                                 
                  <span className="icon">
                      <i className="fa-solid fa-file"></i>
                  </span>
                  </button>
                  <button 
                    key={examinventory.id}
                    className="button mr-2 is-warning"
                    onClick={() => {
                      if (examinventory.affirmation) {
                        const url = `http://localhost:8000/uploads/${examinventory.affirmation}`;
                        const encodedUrl = encodeURI(url);
                        window.open(encodedUrl, "_blank");
                      } else {
                        alert("Δεν υπάρχει αρχείο βεβαίωσης για αυτήν την κατάσταση.");
                      }
                  }}
                  >
                    <span className="icon">
                      <i className="fa-solid fa-file"></i>
                    </span>
                  </button>
          </td>   
          <td className="has-text-centered">
          <button
          key={examinventory.id}
          disabled={disabledAdminExamButtons.includes(examinventory.id)} // Disable if index is in the state
          className="button mr-2 is-danger is-light"
          onClick={() => handleDisapproveExamInventory(examinventory.id)}
          >
          Απόρριψη
          </button>
          <button
          key={examinventory.id}
          disabled={disabledAdminExamButtons.includes(examinventory.id)} // Disable if index is in the state
          className="button mr-2 is-primary"
          onClick={() => handleApproveExamInventory(examinventory.id)}
          >
          Έγκριση
          </button>
          </td>
        </tr>
          {/* Child Row - Requests */}
            {expandedExamRow === examinventory.id && (
              <tr>
                <td colSpan="7">
                <table className="table is-fullwidth is-narrow ml-6">
                <thead>
                  <tr>
                  <th>A/A</th>
                  <th>Επίθετο</th>
                  <th>Όνομα</th>
                  <th>Μήνας</th>
                  <th>Έτος</th>
                  <th>Ρόλος</th>
                  <th>Ημέρες</th>
                  </tr>
                </thead>
                <tbody>
                { insertedExamParticipations.length > 0 ? (
                  insertedExamParticipations.map((examparticipation,participationIndex) => (
                  <tr key={examparticipation.id}>
                  <td>{participationIndex+1}</td>
                  <td>{examparticipation.last_name}</td>
                  <td>{examparticipation.first_name}</td>
                  <td>{examparticipation.month}</td>
                  <td>{examparticipation.year}</td>
                  <td>{examparticipation.role}</td>
                  <td>{examparticipation.number_of_exams}</td>
                  
                  </tr>
                  ))
                ) : (
                  <tr>
                   <td colSpan="7" className="has-text-centered">
                   Δεν υπάρχουν πανελλαδικές στην κατάσταση πληρωμής
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
      <button className="button is-loading">Loading</button>
      )}



      </> 
      ) : adminChoice === "Υπερωρίες" ? (
      <AdminOvertimeTable />
      ) : adminChoice === "Οδοιπορικά" ? (
      <AdminTravelcostTable />
      ) : adminChoice === "Πανελλαδικές" ? (
      <AdminExamTable />
       ) : (
      <button className="button is-loading">Loading</button>
      )}

      </>

      ) : modeChoice === "Συντήρηση" ? (
      <AdminMaintenanceTable />
      ) : (
      <button className="button is-loading">Loading</button>
      )}
      </>
    );
};
export default AdminTable;



