import React, { useState, useRef } from "react";

const UploadTravelcostScheduleModal = ({ active, handleTravelcostUploadModal, token, id, setErrorMessage }) => {
  const [scheduleFile, setScheduleFile] = useState(null); 
  const fileInputRef = useRef(null); // Used for referrence of the input element
  

  const cleanFormData = () => {
    setScheduleFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; // Reset the input value
    }
  }; 

  const handleUploadSchedule = async (e) => {
    e.preventDefault(); 
    
    const formData = new FormData();
    formData.append("file", scheduleFile);
    
    const requestOptions = {
      method: "PUT",
      headers: {
        Authorization: "Bearer " + token,
      },
      body: formData,
    };
    
    const response = await fetch(`/api/travelcostrequests/uploadschedule/${id}`, requestOptions);
    if (!response.ok) {
      setErrorMessage("Κάτι πήγε στραβά. Δεν μπόρεσε να μεταφορτωθεί το πρόγραμμα οδοιπορικών");
    } else {
      cleanFormData();
      handleTravelcostUploadModal();
      alert("Το πρόγραμμα οδοιπορικών μεταφορτώθηκε επιτυχώς");
    }
  };
 
  return (
  <div className={`modal ${active && "is-active"}`}>
    <div className="modal-background" onClick={handleTravelcostUploadModal}></div>
    <div className="modal-card">
      <header className="modal-card-head has-background-info-light">
        <h1 className="modal-card-title">
          Μεταφόρτωση Προγράμματος Σχολείου
        </h1>
      </header>
      <section className="modal-card-body">
        <form>
          <div className="field">
              <label className="label">Πρόγραμμα Οδοιπορικών</label>
              <div className="control">
              <input 
                type="file" 
                accept=".pdf" 
                ref={fileInputRef} // Set the ref to the input element
                onChange={(e) => setScheduleFile(e.target.files[0])} />
              </div>
          </div>
        </form>
      </section>
      <footer className="modal-card-foot has-background-primary-light">
          <button className="button is-info" onClick={handleUploadSchedule}>
            Μεταφόρτωση
          </button>
      
          <button className="button" onClick={handleTravelcostUploadModal}>
            Άκυρο
          </button>
      </footer>
    </div>
  </div>
  );
};

export default UploadTravelcostScheduleModal;



