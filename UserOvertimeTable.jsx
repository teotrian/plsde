import React, { useContext, useEffect, useState } from "react";
import { UserContext } from "../context/UserContext";
import ErrorMessage from "./ErrorMessage";
import OvertimeRequestModal from "./OvertimeRequestModal";
import UploadAssignmentModal from "./UploadAssignmentModal";
import InfoModal from "./InfoModal";

const UserOvertimeTable = () => {
  const [token] = useContext(UserContext);
  const [overtimerequests, setOvertimeRequests] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [activeModal, setActiveModal] = useState(false);
  const [activeUploadModal, setActiveUploadModal] = useState(false);
  const [activeInfoModal, setActiveInfoModal] = useState(false);
  const [infoData, setInfoData] = useState({});   
  const [id, setId] = useState(null);
  const [disabledOvertimeButtons, setDisabledOvertimeButtons] = useState([]);
 

  const handleUpdate = async (id) => {
    setId(id);
    setActiveModal(true);
  };

  const handleUpload = async (id) => {
    setId(id);
    setActiveUploadModal(true);
  }; 

  const handleUploadModal = () => {
    setActiveUploadModal(!activeUploadModal);
    getOvertimeRequests();
    setId(null);
  };

  const showInfo = (final, ftimestamp, approved, atimestamp, submitted, stimestamp, paid, ptimestamp) => {
    setInfoData({
      final,
      ftimestamp,
      approved,
      atimestamp,
      submitted,
      stimestamp,
      paid,
      ptimestamp,
    });
    setActiveInfoModal(true); // Open the modal
  };
 
  const handleInfoModal = () => {
    setActiveInfoModal(!activeInfoModal); // Close the modal
  };

  // Function to handle deletion of overtime requests
  // It prompts the user for confirmation before proceeding with the deletion
  const handleDelete = async (id) => {
    const confirmDeleteOvertimeRequest = window.confirm("Είστε σίγουροι ότι θέλετε να διαγράψετε το συγκεκριμένο αίτημα υπερωριών;");
        if (!confirmDeleteOvertimeRequest) {
          return; 
    }   
    const requestOptions = {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
    };
    const response = await fetch(`/api/overtimerequests/${id}`, requestOptions);
    if (!response.ok) {
      setErrorMessage("Κάτι πήγε στραβά. Δεν μπόρεσε να διαγραφεί το αίτημα");
    } else {
      getOvertimeRequests();
      alert("Το αίτημα διαγράφηκε επιτυχώς");
    }
  };

  const getOvertimeRequests = async () => {
    const requestOptions = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
    };
    const response = await fetch("/api/overtimerequests", requestOptions);
    if (!response.ok) {
      setErrorMessage("Kάτι πήγε στραβά. Δεν μπόρεσαν να φορτωθούν τα αιτήματα υπερωριών");
    } else {
      const data = await response.json();
      setOvertimeRequests(data);
      setLoaded(true);
    }
  };

  useEffect(() => {
    getOvertimeRequests();
  }, [token]);

  const handleModal = () => {
    setActiveModal(!activeModal);
    getOvertimeRequests();
    setId(null);
  };

  // Load disabledOvertimeButtons from localStorage on initial render
   useEffect(() => {
    const savedDisabledOvertimeButtons = localStorage.getItem("disabledOvertimeButtons");
    if (savedDisabledOvertimeButtons) {
      setDisabledOvertimeButtons(JSON.parse(savedDisabledOvertimeButtons));
    }
  }, []);

  // Update localStorage whenever disabledOvertimeButtons state changes
  useEffect(() => {
    localStorage.setItem("disabledOvertimeButtons", JSON.stringify(disabledOvertimeButtons));
  }, [disabledOvertimeButtons]);
  
  const handleFinal = async (id,assignment) => {
    if (!assignment){
      alert("Πρέπει πρώτα να μεταφορτώσετε την απόφαση ανάθεσης Υπερωριών"); 
      return;
    }else{
    const confirmFinalOvertimeRequest = window.confirm("Είστε σίγουροι ότι θέλετε να ολοκληρώσετε το αίτημα υπερωριών;");
        if (!confirmFinalOvertimeRequest) {
          return;
    }
    const requestOptions = {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
       Authorization: "Bearer " + token,
      },
    };
    const response = await fetch(`/api/overtimerequests/final/${id}`, requestOptions);
    if (!response.ok) {
      setErrorMessage("Κάτι πήγε στραβά. Δεν μπόρεσε να οριστικοποιηθεί το αίτημα υπερωριών");
    }
    setDisabledOvertimeButtons((prev) => [...prev, id]); // Add the index of the disabled button to the state
    getOvertimeRequests();
    alert("Το αίτημα υπερωριών οριστικοποιήθηκε επιτυχώς");
    }
  };

  return (
    <>
       <InfoModal
        active={activeInfoModal}
        handleInfoModal={handleInfoModal}
        infoData={infoData}
      />
       <OvertimeRequestModal
        active={activeModal}
        handleModal={handleModal}
        token={token}
        id={id}
        setErrorMessage={setErrorMessage}
      />
      <UploadAssignmentModal
        activeUploadModal={activeUploadModal}
        handleUploadModal={handleUploadModal}
        token={token}
        id={id}
        setErrorMessage={setErrorMessage}
      />
      <div className="columns has-background-primary mb-5">
        <div className="column is-10 has-text-centered">
            <h4 className="title is-5 mt-2">Πίνακας Αιτημάτων Υπερωριών Εκπαιδευτικού</h4>
        </div>
        <div className="column">
          <button
             className="button mr-2 is-primary is-light"
            onClick={() => setActiveModal(true)}
          >
            Δημιουργία   
          </button>
        </div>
      </div>
 
      <ErrorMessage message={errorMessage} />
      {loaded && overtimerequests ? (
        <table className="table is-fullwidth">
          <thead>
            <tr>
              <th>Επίθετο</th>
              <th>Όνομα</th>
              <th>Σχολείο</th>
              <th>Μήνας</th>
              <th>Έτος</th>
              <th className="has-text-centered">Υπερωρίες</th>
              <th className="has-text-centered">Απόφαση</th>
              <th className="has-text-centered">Ενέργειες</th>
              <th>Κατάσταση</th>
            </tr>
          </thead>
          <tbody>
            {overtimerequests.map((overtimerequest) => (
              <tr key={overtimerequest.id}>
                <td>{overtimerequest.last_name}</td>
                <td>{overtimerequest.first_name}</td>
                <td>{overtimerequest.school}</td>
                <td>{overtimerequest.month}</td>
                <td>{overtimerequest.year}</td>
                <td className="has-text-centered">{overtimerequest.number_of_overtimes}</td>
                <td className="has-text-centered">
                {overtimerequest.assignment ? (
                  <span className="icon">
                    <i class="fa-solid fa-check"></i>
                  </span>
                  ) : (
                  <button
                    key={overtimerequest.id}
                    className="button mr-2 is-info is-light"
                    onClick={() => handleUpload(overtimerequest.id)}
                  > Μεταφόρτωση
                  </button>)
                }
                </td>
                <td className="has-text-centered"> 
                  <button
                    key={overtimerequest.id}
                    disabled={disabledOvertimeButtons.includes(overtimerequest.id)} // Disable if index is in the state
                    className="button mr-2 is-link is-light"
                    onClick={() => handleUpdate(overtimerequest.id)}
                  >
                    Επεξεργασία
                  </button>
                  <button
                    key={overtimerequest.id}
                    disabled={disabledOvertimeButtons.includes(overtimerequest.id)} // Disable if index is in the state
                    className="button mr-2 is-danger is-light"
                    onClick={() => handleDelete(overtimerequest.id)}
                  >
                    Διαγραφή
                  </button>
                  <button
                    key={overtimerequest.id}
                    disabled={disabledOvertimeButtons.includes(overtimerequest.id)} // Disable if index is in the state
                    className="button mr-2 is-primary"
                    onClick={() => handleFinal(overtimerequest.id, overtimerequest.assignment)}
                  >
                    Οριστικοποίηση
                  </button>
                </td>
                <td>
                  <button 
                    key={overtimerequest.id}
                    className="button mr-2 is-info"
                    onClick={() => showInfo(overtimerequest.final, overtimerequest.ftimestamp, overtimerequest.approved, overtimerequest.atimestamp, overtimerequest.submitted, overtimerequest.stimestamp, overtimerequest.paid, overtimerequest.ptimestamp)}
                  >                  
                    <span className="icon">
                      <i className="fa-solid fa-info"></i>
                    </span>
                  </button>
                </td>   
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <button class="button is-loading">Loading</button>
      )}
    </>
  );
};

export default UserOvertimeTable;
