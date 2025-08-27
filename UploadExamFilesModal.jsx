import React, { useState, useRef } from "react";

const UploadExamFilesModal = ({ active, handleUploadExamFilesModal, token, inventoryId, setErrorMessage }) => {
  const [decreeFile, setDecreeFile] = useState(null); 
  const [affirmationFile, setAffirmationFile] = useState(null);
  const fileDecreeRef = useRef(null); // Used for referrence of the input element
  const fileAffirmationRef = useRef(null); // Used for referrence of the input element

  const cleanFormData = () => {
    setDecreeFile(null);
    setAffirmationFile(null);
    if (fileDecreeRef.current) {
      fileDecreeRef.current.value = ""; // Reset the input value
    }
    if (fileAffirmationRef.current) {
      fileAffirmationRef.current.value = ""; // Reset the input value
    }
  };

  const handleUploadExamFiles = async (e) => {
    e.preventDefault(); 
    
    const formData = new FormData();
    formData.append("files", decreeFile);
    formData.append("files", affirmationFile);
    
    const requestOptions = {
      method: "PUT",
      headers: {
        Authorization: "Bearer " + token,
      },
      body: formData,
    };
    
    const response = await fetch(`/api/school/examinventory/uploadfiles/${inventoryId}`, requestOptions);
    if (!response.ok) {
      setErrorMessage("Κάτι πήγε στραβά. Δεν μπόρεσαν να μεταφορτωθούν τα αρχεία");
    } else {
      cleanFormData();
      handleUploadExamFilesModal();
      alert("Τα αρχεία μεταφορτώθηκαν επιτυχώς");
    }
  };
 
  return (
  <div className={`modal ${active && "is-active"}`}>
    <div className="modal-background" 
        onClick={()=>{
            cleanFormData();
            handleUploadExamFilesModal();
          }}>
        </div>
        <div className="modal-card">
          <header className="modal-card-head has-background-info-light">
          <h1 className="modal-card-title">
            Μεταφόρτωση Αρχείων Πανελλαδικών 
          </h1>
          </header>
          <section className="modal-card-body">
          <form>
            <div className="field">
              <label className="label">Απόφαση Ορισμού</label>
              <div className="control">
              <input 
              type="file" 
              accept=".pdf, image/jpeg" 
              ref={fileDecreeRef}
              onChange={(e) => setDecreeFile(e.target.files[0])} />
              </div>
            </div>
            <div className="field">
              <label className="label">Βεβαίωση Συμμετοχής</label>
              <div className="control">
              <input 
              type="file" 
              accept=".pdf, image/jpeg"
              ref={fileAffirmationRef}
              onChange={(e) => setAffirmationFile(e.target.files[0])} />
              </div>
            </div>
          </form>
          </section>
          <footer className="modal-card-foot has-background-info-light">
            <button className="button is-info" onClick={handleUploadExamFiles}>
            Μεταφόρτωση
            </button>
          
            <button className="button" 
            onClick={()=>{
            cleanFormData();
            handleUploadExamFilesModal();
            }}> Άκυρο
          </button>
      </footer>
    </div>
  </div>
  );
};

export default UploadExamFilesModal;



