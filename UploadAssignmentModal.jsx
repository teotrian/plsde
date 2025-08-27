import React, { useState, useEffect, useContext, useRef } from "react";
import { DetailContext } from "../context/DetailContext";

const UploadAssignmentModal = ({ activeUploadModal, handleUploadModal, token, id, setErrorMessage }) => {
  const [detail] = useContext(DetailContext);
  const [assignmentFile, setAssignmentFile] = useState(null); 
  const fileInputRef = useRef(null); // Used for referrence of the input element
  
  const cleanFormData = () => {
    setAssignmentFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; // Reset the input value
    }
  }; 

  useEffect(() => {
    if (!activeUploadModal) { 
      cleanFormData();
    }
  }, [activeUploadModal]);

  const handleUploadAssignment = async (e) => {
    e.preventDefault(); 
    
    const formData = new FormData();
    formData.append("file", assignmentFile);
    formData.append("last_name", detail.lastName);
    formData.append("first_name", detail.firstName);

    const requestOptions = {
      method: "PUT",
      headers: {
        Authorization: "Bearer " + token,
      },
      body: formData,
    };
    
    const response = await fetch(`/api/overtimerequests/uploadassignment/${id}`, requestOptions);
    if (!response.ok) {
      setErrorMessage("Κάτι πήγε στραβά. Δεν μπόρεσε να μεταφορτωθεί η απόφαση");
    } else {
      cleanFormData();
      handleUploadModal();
      alert("Η απόφαση μεταφορτώθηκε επιτυχώς");
    }
  };
 
  return (
    <div className={`modal ${activeUploadModal && "is-active"}`}>
      <div className="modal-background" onClick={handleUploadModal}></div>
      <div className="modal-card">
        <header className="modal-card-head has-background-info-light">
          <h1 className="modal-card-title">
            Μεταφόρτωση Απόφασης Ανάθεσης Υπερωριών
          </h1>
        </header>
        <section className="modal-card-body">
          <form>
            <div className="field">
              <label className="label">Απόφαση</label>
              <div className="control">
                <input 
                  type="file" 
                  accept=".pdf" 
                  ref={fileInputRef} // Attach the referrence to the input element
                  onChange={(e) => setAssignmentFile(e.target.files[0])} />
              </div>
            </div>
          </form>
        </section>
        <footer className="modal-card-foot has-background-primary-light">
          <button className="button is-info" onClick={handleUploadAssignment}>
            Μεταφόρτωση
          </button>
          <button className="button" onClick={handleUploadModal}>
            Άκυρο
          </button>
        </footer>
      </div>
    </div>
  );
};

export default UploadAssignmentModal;
