import React, { useContext, useEffect, useState } from "react";
import { UserContext } from "../context/UserContext";
import { DetailContext } from "../context/DetailContext";

import ErrorMessage from "./ErrorMessage";
import SchoolOvertimeTable from "./SchoolOvertimeTable";
import UploadOvertimeScheduleModal from "./UploadOvertimeScheduleModal";

import UploadTravelcostScheduleModal from "./UploadTravelcostScheduleModal";
import SchoolTravelcostTable from "./SchoolTravelcostTable";

import SchoolExamTable from "./SchoolExamTable";


const SchoolTable = () => {
  const [token] = useContext(UserContext);
  const [detail] = useContext(DetailContext);
  const [errorMessage, setErrorMessage] = useState("");
  const [school, setSchool] = useState(detail.lastName);
  const [id, setId] = useState(null);
  const [schoolChoice, setSchoolChoice] = useState("");

  const [countOvertimeRequests, setCountOvertimeRequests] = useState(0);  
  const [loadedOvertimeRequests, setLoadedOvertimeRequests] = useState(false); 
  const [schoolOvertimeRequests, setSchoolOvertimeRequests] = useState(null);
  const [activeOvertimeUploadModal, setActiveOvertimeUploadModal] = useState(false);
  const [disabledSchoolOvertimeButtons, setDisabledSchoolOvertimeButtons] = useState([]);
  
  const [countTravelcostRequests, setCountTravelcostRequests] = useState(0); 
  const [loadedTravelcostRequests, setLoadedTravelcostRequests] = useState(false); 
  const [schoolTravelcostRequests, setSchoolTravelcostRequests] = useState(null);
  const [activeTravelcostUploadModal, setActiveTravelcostUploadModal] = useState(false);
  const [disabledSchoolTravelcostButtons, setDisabledSchoolTravelcostButtons] = useState([]);

  useEffect(() => {
    setSchool(detail.lastName);
  }, [detail.lastName]);

  //Function to get the count of the school's overtime requests
  const getCountOfSchoolOvertimeRequests = async () => {
    const requestOptions = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
    };
    
    const response = await fetch(`/api/school/countovertimerequests/${school}`, requestOptions);
    if (!response.ok) {
      setErrorMessage("Kάτι πήγε στραβά. Δεν μπόρεσαν να μετρηθούν τα αιτήματα υπερωριών");
    } else {
      const data = await response.json();
      setCountOvertimeRequests(data);
      setErrorMessage("");
    }
  };

  //Function to get the school's overtime requests  
    const getSchoolOvertimeRequests = async () => {
      const requestOptions = {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
      };
      
      const response = await fetch(`/api/school/overtimerequests/${school}`, requestOptions);
      if (!response.ok) {
        setErrorMessage("Kάτι πήγε στραβά. Δεν μπόρεσαν να φορτωθούν τα αιτήματα υπερωριών");
      } else {
        const data = await response.json();
        setSchoolOvertimeRequests(data);
        setErrorMessage("");
        setLoadedOvertimeRequests(true);
      }
    };
    
    useEffect(() => {
      getCountOfSchoolOvertimeRequests();
      getSchoolOvertimeRequests();
    }, [token, school]);
  
    const handleUploadOvertimeSchedule = async (id) => {
      setId(id);
      setActiveOvertimeUploadModal(true);
    }; 
  
    const handleOvertimeUploadModal = () => {
      setActiveOvertimeUploadModal(!activeOvertimeUploadModal);
      getSchoolOvertimeRequests();
      setId(null);
    };
  
    // Load disabledSchoolOvertimeButtons from localStorage on initial render
    useEffect(() => {
        const savedDisabledSchoolOvertimeButtons = localStorage.getItem("disabledSchoolOvertimeButtons");
        if (savedDisabledSchoolOvertimeButtons) {
          setDisabledSchoolOvertimeButtons(JSON.parse(savedDisabledSchoolOvertimeButtons));
        }
    }, []);
    
    // Update localStorage whenever disabledSchoolOvertimeButtons state changes
    useEffect(() => {
        localStorage.setItem("disabledSchoolOvertimeButtons", JSON.stringify(disabledSchoolOvertimeButtons));
    }, [disabledSchoolOvertimeButtons]);
    
    // Function to approve an overtime request
    const handleApproveOvertimeRequest = async (id,schedule) => {
      if (!schedule){
          alert("Πρέπει πρώτα να μεταφορτώσετε το πρόγραμμα διδασκαλίας του Εκπαιδευτικού"); 
          return;
        } else {
        const confirmApprove = window.confirm("Είστε σίγουροι ότι θέλετε να εγκρίνετε το αίτημα υπερωριών;");
        if (!confirmApprove) {
          return;
        }
        const requestOptions = {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
           Authorization: "Bearer " + token,
          },
        };
        const response = await fetch(`/api/overtimerequests/approve/${id}?flag=1`, requestOptions);
        if (!response.ok) {
          setErrorMessage("Κάτι πήγε στραβά. Δεν μπόρεσε να εγκριθεί το αίτημα υπερωριών");
        }
        //const data = await response.json();
        setDisabledSchoolOvertimeButtons((prev) => [...prev, id]); // Add the index of the disabled button to the state
        getSchoolOvertimeRequests();
        getCountOfSchoolOvertimeRequests(); 
        alert("Το αίτημα υπερωριών εγκρίθηκε επιτυχώς");
      }
    };  
  
    // Function to disapprove an overtime request
    const handleDisapproveOvertimeRequest = async (id) => {
        const confirmDisapprove = window.confirm("Είστε σίγουροι ότι θέλετε να απορρίψετε το αίτημα υπερωριών;");
        if (!confirmDisapprove) {
          return;
        }
        const requestOptions = {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
           Authorization: "Bearer " + token,
          },
        };
        const response = await fetch(`/api/overtimerequests/approve/${id}?flag=-1`, requestOptions);
        if (!response.ok) {
          setErrorMessage("Κάτι πήγε στραβά. Δεν μπόρεσε να απορριφθεί το αίτημα υπερωριών");
        }
        //const data = await response.json();
        setDisabledSchoolOvertimeButtons((prev) => [...prev, id]); // Add the index of the disabled button to the state
        getSchoolOvertimeRequests();
        getCountOfSchoolOvertimeRequests(); 
        alert("Το αίτημα υπερωριών απορρίφθηκε επιτυχώς");
    };  
  
   //Function to get the count of the school's travelcost requests
   const getCountOfSchoolTravelcostRequests = async () => {
      const requestOptions = {
       method: "GET",
       headers: {
         "Content-Type": "application/json",
         Authorization: "Bearer " + token,
       },
      };
    
      const response = await fetch(`/api/school/counttravelcostrequests/${school}`, requestOptions);
      if (!response.ok) {
        setErrorMessage("Kάτι πήγε στραβά. Δεν μπόρεσαν να μετρηθούν τα αιτήματα οδοιπορικών");
      } else {
      const data = await response.json();
      setCountTravelcostRequests(data);
      setErrorMessage("");
   
     }
    };

  // Function to get the school's travelcost requests
  const getSchoolTravelcostRequests = async () => {
    const requestOptions = {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
      };
      
    const response = await fetch(`/api/school/travelcostrequests/${school}`, requestOptions);
    if (!response.ok) {
      setErrorMessage("Kάτι πήγε στραβά. Δεν μπόρεσαν να φορτωθούν τα αιτήματα οδοιπορικών");
    } else {
      const data = await response.json();
      setSchoolTravelcostRequests(data);
      setErrorMessage("");
      setLoadedTravelcostRequests(true);
   }
 };

  useEffect(() => {
    getCountOfSchoolTravelcostRequests();
    getSchoolTravelcostRequests();
  }, [token, school]);

  const handleUploadTravelcostSchedule = async (id) => {
    setId(id);
    setActiveTravelcostUploadModal(true);
  }; 
    
  const handleTravelcostUploadModal = () => {
    setActiveTravelcostUploadModal(!activeTravelcostUploadModal);
    getSchoolTravelcostRequests();
    setId(null);
  };
    
  // Load disabledSchoolTravelcostButtons from localStorage on initial render
  useEffect(() => {
    const savedDisabledSchoolTravelcostButtons = localStorage.getItem("disabledSchoolTravelcostButtons");
    if (savedDisabledSchoolTravelcostButtons) {
      setDisabledSchoolTravelcostButtons(JSON.parse(savedDisabledSchoolTravelcostButtons));
    }
    }, []);
      
  // Update localStorage whenever disabledSchoolTravelcostButtons state changes
  useEffect(() => {
    localStorage.setItem("disabledSchoolTravelcostButtons", JSON.stringify(disabledSchoolTravelcostButtons));
    }, [disabledSchoolTravelcostButtons]);
      
  // Function to approve a school travelcost request
  const handleApproveTravelcostRequest = async (id,schedule) => {
    if (!schedule){
        alert("Πρέπει πρώτα να μεταφορτώσετε το πρόγραμμα διδασκαλίας του Εκπαιδευτικού"); 
          return;
    } else {
      const confirmApprove = window.confirm("Είστε σίγουροι ότι θέλετε να εγκρίνετε το αίτημα οδοιπορικών;");
        if (!confirmApprove) {
          return;
       }
      const requestOptions = {
        method: "PUT",
        headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
        },
      };
      const response = await fetch(`/api/travelcostrequests/approve/${id}?flag=1`, requestOptions);
      if (!response.ok) {
        setErrorMessage("Κάτι πήγε στραβά. Δεν μπόρεσε να εγκριθεί το αίτημα οδοιπορικών");
      }
      setDisabledSchoolTravelcostButtons((prev) => [...prev, id]); // Add the index of the disabled button to the state
      getSchoolTravelcostRequests();
      getCountOfSchoolTravelcostRequests();
      alert("Το αίτημα οδοιπορικών εγκρίθηκε επιτυχώς");
    }
  };  
    
  // Function to disapprove a school travelcost request
  const handleDisapproveTravelcostRequest = async (id) => {
    const confirmDisapprove = window.confirm("Είστε σίγουροι ότι θέλετε να απορρίψετε το αίτημα οδοιπορικών;");
        if (!confirmDisapprove) {
          return;
        }
    const requestOptions = {
    method: "PUT",
    headers: {
    "Content-Type": "application/json",
    Authorization: "Bearer " + token,
    },
    };
    const response = await fetch(`/api/travelcostrequests/approve/${id}?flag=-1`, requestOptions);
    if (!response.ok) {
      setErrorMessage("Κάτι πήγε στραβά. Δεν μπόρεσε να απορριφθεί το αίτημα οδοιπορικών");
    }
    setDisabledSchoolTravelcostButtons((prev) => [...prev, id]); // Add the index of the disabled button to the state
    getSchoolTravelcostRequests();
    getCountOfSchoolTravelcostRequests();
    alert("Το αίτημα οδοιπορικών απορρίφθηκε επιτυχώς");
  };  
  
    return (
      <>
      <ErrorMessage message={errorMessage} /> 
      <UploadOvertimeScheduleModal
      active={activeOvertimeUploadModal}
      handleOvertimeUploadModal={handleOvertimeUploadModal}
      token={token}
      id={id}
      setErrorMessage={setErrorMessage}
      />
      <UploadTravelcostScheduleModal
      active={activeTravelcostUploadModal}
      handleTravelcostUploadModal={handleTravelcostUploadModal}
      token={token}
      id={id}
      setErrorMessage={setErrorMessage}
      />

      <div className="field mt-3">
      <label className="label">Επιλέξτε την κατηγορία με την οποία θέλετε να ασχοληθείτε : </label>
      <div className="control is-flex is-align-items-center">
        <div className="select is-info">
        <select 
        value={schoolChoice} // Bind the value to schoolChoice
        onChange={(e) => setSchoolChoice(e.target.value)}
        className="input"
        required>
          <option value="" disabled>Κατηγορία</option>
          <option value="Υπερωρίες">Υπερωρίες</option>
          <option value="Οδοιπορικά">Οδοιπορικά</option>
          <option value="Πανελλαδικές">Πανελλαδικές</option>
        </select>   
        </div>   
        {!schoolChoice ? (<></>) : (
        <button
        className="button ml-2 is-info "
        onClick={(e) => setSchoolChoice("")}
        >                  
        <span className="icon">
          <i className="fa fa-home" aria-hidden="true"></i>
        </span>
        </button>
        )}
      </div>
      </div>
      
      {!schoolChoice ? (
      <>
      <div className="column ">
      <h4 className="title is-6 mt-3">Υπάρχουν {countOvertimeRequests} νέα οριστικοποιημένα αιτήματα Εκπαιδευτικών για Υπερωρίες :</h4>
      </div>

      { loadedOvertimeRequests && schoolOvertimeRequests ? (
      <>
      <div className="columns has-background-info mb-5 mt-2">
      <div className="column is-10 has-text-centered">
        <h4 className="title is-5 mt-2">Πίνακας νέων Αιτημάτων Υπερωριών Εκπαιδευτικών   {detail.lastName}</h4>
      </div>
      </div>
      
      <table className="table is-fullwidth">
      <thead>
        <tr>
        <th>Επίθετο</th>
        <th>Όνομα</th>
        <th>Μήνας</th>
        <th>Έτος</th>
        <th className="has-text-centered">Υπερωρίες</th>
        <th className="has-text-centered">Απόφαση</th>
        <th className="has-text-centered">Πρόγραμμα</th>
        <th className="has-text-centered">Ενέργειες</th>
       </tr>
      </thead>
      <tbody>
       {schoolOvertimeRequests.map((overtimerequest) => (
        <tr key={overtimerequest.id}>
        <td>{overtimerequest.last_name}</td>
        <td>{overtimerequest.first_name}</td>
        <td>{overtimerequest.month}</td>
        <td>{overtimerequest.year}</td>
        <td className="has-text-centered">{overtimerequest.number_of_overtimes}</td>
        <td className="has-text-centered">
          <button
            className="button ml-2 is-info"
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
         </td>
        <td className="has-text-centered">
        {overtimerequest.schedule ? (
          <span className="icon">
            <i class="fa-solid fa-check"></i>
          </span>
        ) : (
        <button
        key={overtimerequest.id}
        className="button mr-2 is-info is-light"
        onClick={() => handleUploadOvertimeSchedule(overtimerequest.id)}
        > Μεταφόρτωση
        </button>)
        }
        </td>
        <td className="has-text-centered">
        <button
        key={overtimerequest.id}
        disabled={disabledSchoolOvertimeButtons.includes(overtimerequest.id)} // Disable if index is in the state
        className="button mr-2 is-danger is-light"
        onClick={() => handleDisapproveOvertimeRequest(overtimerequest.id)}
        >
        Απόρριψη
        </button>
        <button
        key={overtimerequest.id}
        disabled={disabledSchoolOvertimeButtons.includes(overtimerequest.id)} // Disable if index is in the state
        className="button mr-2 is-primary"
        onClick={() => handleApproveOvertimeRequest(overtimerequest.id, overtimerequest.schedule)}
        >
        Έγκριση
        </button>
        </td>
        </tr>
        ))}
      </tbody>
      </table>
      </>      
      ) : (
      <button className="button is-loading">Loading</button>
      )}

      <div className="column">
      <h4 className="title is-6 mt-2">Υπάρχουν {countTravelcostRequests} νέα οριστικοποιημένα αιτήματα Εκπαιδευτικών για Οδοιπορικά :</h4>
      </div>

      { loadedTravelcostRequests && schoolTravelcostRequests ? (
      <>
      <div className="columns has-background-info mb-5 mt-2">
      <div className="column is-10 has-text-centered">
        <h4 className="title is-5 mt-2">Πίνακας νέων Αιτημάτων Οδοιπορικών Εκπαιδευτικών   {detail.lastName}</h4>
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
        <th className="has-text-centered">Ημέρες</th> 
        <th className="has-text-centered">Απόφαση</th>
        <th className="has-text-centered">Πρόγραμμα</th>
        <th className="has-text-centered">Ενέργειες</th>        
       </tr>
      </thead>
      <tbody>
      {schoolTravelcostRequests.map((travelcostrequest) => (
        <tr key={travelcostrequest.id}>
        <td>{travelcostrequest.last_name}</td>
        <td>{travelcostrequest.first_name}</td>
        <td>{travelcostrequest.start_school}</td>
        <td>{travelcostrequest.destination_school}</td>
        <td>{travelcostrequest.month}</td>
        <td>{travelcostrequest.year}</td>
        <td className="has-text-centered">{travelcostrequest.number_of_travels}</td>
        <td className="has-text-centered">
          <button
            className="button ml-2 is-info"
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
        </td>
        <td className="has-text-centered">
        {travelcostrequest.schedule ? (
          <span className="icon">
            <i class="fa-solid fa-check"></i>
          </span>
        ) : (
        <button
        key={travelcostrequest.id}
        className="button mr-2 is-info is-light"
        onClick={() => handleUploadTravelcostSchedule(travelcostrequest.id)}
        > Μεταφόρτωση
        </button>)
        }
        </td>
        <td>
        <button
        key={travelcostrequest.id}
        disabled={disabledSchoolTravelcostButtons.includes(travelcostrequest.id)} // Disable if index is in the state
        className="button mr-2 is-danger is-light"
        onClick={() => handleDisapproveTravelcostRequest(travelcostrequest.id)}
        >
        Απόρριψη
        </button>
        <button
        key={travelcostrequest.id}
        disabled={disabledSchoolTravelcostButtons.includes(travelcostrequest.id)} // Disable if index is in the state
        className="button mr-2 is-primary"
        onClick={() => handleApproveTravelcostRequest(travelcostrequest.id, travelcostrequest.schedule)}
        >
        Έγκριση
        </button>
        </td>
        </tr>
      ))}
      </tbody>
      </table>
      </>  
      ) : (
      <button className="button is-loading">Loading</button>
      )}

      </> 
      ) : schoolChoice === "Υπερωρίες" ? (
      <SchoolOvertimeTable />
      ) : schoolChoice === "Οδοιπορικά" ? (
      <SchoolTravelcostTable />
      ) : schoolChoice === "Πανελλαδικές" ? (
      <SchoolExamTable />
      ) : (
      <button className="button is-loading">Loading</button>
      )}
    
      </>
    );
};
export default SchoolTable;



