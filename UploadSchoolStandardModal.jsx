import React, { useState, useEffect, useContext, useRef } from "react";

const UploadSchoolStandardModal = ({ activeUploadSchoolModal, handleUploadSchoolModal, token, setErrorMessage }) => {
  const [schoolFile, setSchoolFile] = useState(null); 
  const fileInputRef = useRef(null); // Used for referrence of the input element
  
  const cleanFormData = () => {
    setSchoolFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; // Reset the input value
    }
  }; 

  useEffect(() => {
    if (!activeUploadSchoolModal) { 
      cleanFormData();
    }
  }, [activeUploadSchoolModal]);

  const handleUploadSchoolStandard = async (e) => {
    e.preventDefault(); // Prevent the default form submission behavior
    
    const formData = new FormData();
    formData.append("file", schoolFile);

    const requestOptions = {
      method: "POST",
      headers: {
        Authorization: "Bearer " + token,
      },
      body: formData,
    };
    
    const response = await fetch(`/api/admin/uploadschoolsstandard`, requestOptions);
    const data = await response.json();
    if (!response.ok) {
      setErrorMessage("Κάτι πήγε στραβά. Δεν μπόρεσε να μεταφορτωθεί το πρότυπο με τα Σχολεία");
    } else {
      cleanFormData();
      handleUploadSchoolModal();
      alert(data.message);
    }
  };
 
  return (
    <div className={`modal ${activeUploadSchoolModal && "is-active"}`}>
      <div className="modal-background" onClick={handleUploadSchoolModal}></div>
      <div className="modal-card">
        <header className="modal-card-head has-background-warning-light">
          <h1 className="modal-card-title">
            Μεταφόρτωση Πρότυπου Σχολείων
          </h1>
        </header>
        <section className="modal-card-body">
          <form>
            <div className="field">
              <label className="label">Αρχείο</label>
              <div className="control">
                <input 
                  type="file" 
                  accept=".xlsx, .xls, .csv" // Accepts Excel and CSV files
                  ref={fileInputRef} // Attach the referrence to the input element
                  onChange={(e) => setSchoolFile(e.target.files[0])} />
              </div>
            </div>
          </form>
        </section>
        <footer className="modal-card-foot has-background-warning-light">
          <button className="button is-info" onClick={handleUploadSchoolStandard}>
            Μεταφόρτωση
          </button>
          <button className="button" onClick={handleUploadSchoolModal}>
            Άκυρο
          </button>
        </footer>
      </div>
    </div>
  );
};

export default UploadSchoolStandardModal;
