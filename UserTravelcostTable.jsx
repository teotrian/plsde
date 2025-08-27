import React, { useContext, useEffect, useState } from "react";
import { UserContext } from "../context/UserContext";
import ErrorMessage from "./ErrorMessage";
import TravelcostRequestModal from "./TravelcostRequestModal";
import UploadDistributionModal from "./UploadDistributionModal";
import InfoModal from "./InfoModal";

const UserTravelcostTable = () => {
  const [token] = useContext(UserContext);
  const [travelcostrequests, setTravelcostRequests] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [activeModal, setActiveModal] = useState(false);
  const [activeUploadModal, setActiveUploadModal] = useState(false);
  const [activeInfoModal, setActiveInfoModal] = useState(false);
  const [infoData, setInfoData] = useState({});   
  const [id, setId] = useState(null);
  const [disabledTravelcostButtons, setDisabledTravelcostButtons] = useState([]);
 

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
    getTravelcostRequests();
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
  
  const handleDelete = async (id) => {
    const confirmDeleteTravelcostRequest = window.confirm("Είστε σίγουροι ότι θέλετε να διαγράψετε το συγκεκριμένο αίτημα υπερωριών;");
      if (!confirmDeleteTravelcostRequest) {
        return; 
    }   
    const requestOptions = {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
    };
    const response = await fetch(`/api/travelcostrequests/${id}`, requestOptions);
    if (!response.ok) {
      setErrorMessage("Κάτι πήγε στραβά. Δεν μπόρεσε να διαγραφεί το αίτημα οδοιπορικών");
    } else {
      getTravelcostRequests();
      alert("Το αίτημα οδοιπορικών διαγράφηκε επιτυχώς");
    }
  };

  const getTravelcostRequests = async () => {
    const requestOptions = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
    };
    const response = await fetch("/api/travelcostrequests", requestOptions);
    if (!response.ok) {
      setErrorMessage("Κάτι πήγε στραβά. Δεν μπόρεσαν να φορτωθούν τα αιτήματα οδοιπορικών");
    } else {
      const data = await response.json();
      setTravelcostRequests(data);
      setLoaded(true);
    }
  };


  useEffect(() => {
    getTravelcostRequests();
  }, [token]);

  const handleModal = () => {
    setActiveModal(!activeModal);
    getTravelcostRequests();
    setId(null);
  };

  // Load disabledTravelcostButtons from localStorage on initial render
   useEffect(() => {
    const savedDisabledTravelcostButtons = localStorage.getItem("disabledTravelcostButtons");
    if (savedDisabledTravelcostButtons) {
      setDisabledTravelcostButtons(JSON.parse(savedDisabledTravelcostButtons));
    }
  }, []);

  // Update localStorage whenever disabledTravelcostButtons state changes
  useEffect(() => {
    localStorage.setItem("disabledTravelcostButtons", JSON.stringify(disabledTravelcostButtons));
  }, [disabledTravelcostButtons]);
  
  const handleFinal = async (id,distribution) => {
    if (!distribution){
      alert("Πρέπει πρώτα να μεταφορτώσσετε την απόφαση διάθεσης Οδοιπορικών");
      return;
    }else{
    const requestOptions = {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
       Authorization: "Bearer " + token,
      },
    };
    const response = await fetch(`/api/travelcostrequests/final/${id}`, requestOptions);
    if (!response.ok) {
      setErrorMessage("Κάτι πήγε στραβά. Δεν μπόρεσε να οριστικοποιηθεί το αίτημα οδοιπορικών");
    }
    //const data = await response.json();
    setDisabledTravelcostButtons((prev) => [...prev, id]); // Add the index of the disabled button to the state
    getTravelcostRequests();
    alert("Το αίτημα οδοιπορικών οριστικοποιήθηκε επιτυχώς");
    }
  };

  return (
    <>
      <InfoModal
        active={activeInfoModal}
        handleInfoModal={handleInfoModal}
        infoData={infoData}
      />
      <TravelcostRequestModal
        active={activeModal}
        handleModal={handleModal}
        token={token}
        id={id}
        setErrorMessage={setErrorMessage}
      />
      <UploadDistributionModal
        active={activeUploadModal}
        handleUploadModal={handleUploadModal}
        token={token}
        id={id}
        setErrorMessage={setErrorMessage}
      />
      <div className="columns has-background-primary mb-5">
        <div className="column is-10 has-text-centered">
            <h4 className="title is-5 mt-2">Πίνακας Αιτημάτων Οδοιπορικών Εκπαιδευτικού</h4>
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
      {loaded && travelcostrequests ? (
        <table className="table is-fullwidth">
          <thead>
            <tr>
              <th>Όνομα</th>
              <th>Επίθετο</th>
              <th>Σχολείο Οργανικής</th>
              <th>Σχολείο Διάθεσης</th>
              <th>Μήνας</th>
              <th>Έτος</th>
              <th className="has-text-centered">Ημέρες</th>
              <th className="has-text-centered">Απόφαση</th>
              <th className="has-text-centered">Ενέργειες</th>
              <th>Κατάσταση</th>
            </tr>
          </thead>
          <tbody>
            {travelcostrequests.map((travelcostrequest) => (
              <tr key={travelcostrequest.id}>
                <td>{travelcostrequest.first_name}</td>
                <td>{travelcostrequest.last_name}</td>
                <td>{travelcostrequest.start_school}</td>
                <td>{travelcostrequest.destination_school}</td>
                <td>{travelcostrequest.month}</td>
                <td>{travelcostrequest.year}</td>
                <td className="has-text-centered">{travelcostrequest.number_of_travels}</td>
                <td className="has-text-centered"> 
                {travelcostrequest.distribution ? (
                  <span className="icon">
                    <i class="fa-solid fa-check"></i>
                  </span>
                  ) : (
                  <button
                    key={travelcostrequest.id}
                    className="button mr-2 is-info is-light"
                    onClick={() => handleUpload(travelcostrequest.id)}
                  > Μεταφόρτωση
                  </button>)
                }
                </td>
                <td className="has-text-centered">
                  <button
                    key={travelcostrequest.id}
                    disabled={disabledTravelcostButtons.includes(travelcostrequest.id)} // Disable if index is in the state
                    className="button mr-2 is-link is-light"
                    onClick={() => handleUpdate(travelcostrequest.id)}
                  >
                    Επεξεργασία
                  </button>
                  <button
                    key={travelcostrequest.id}
                    disabled={disabledTravelcostButtons.includes(travelcostrequest.id)} // Disable if index is in the state
                    className="button mr-2 is-danger is-light"
                    onClick={() => handleDelete(travelcostrequest.id)}
                  >
                    Διαγραφή
                  </button>
                  <button
                    key={travelcostrequest.id}
                    disabled={disabledTravelcostButtons.includes(travelcostrequest.id)} // Disable if index is in the state
                    className="button mr-2 is-primary"
                    onClick={() => handleFinal(travelcostrequest.id, travelcostrequest.distribution)}
                  >
                    Οριστικοποίηση
                  </button>
                </td>
                <td>
                  <button 
                    key={travelcostrequest.id}
                    className="button mr-2 is-info"
                    onClick={() => showInfo(travelcostrequest.final, travelcostrequest.ftimestamp, travelcostrequest.approved, travelcostrequest.atimestamp, travelcostrequest.submitted, travelcostrequest.stimestamp, travelcostrequest.paid, travelcostrequest.ptimestamp)}  
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

export default UserTravelcostTable;
