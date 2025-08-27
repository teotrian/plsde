import React, { useState, useEffect, useContext, useRef } from "react";

const UploadEmployeeStandardModal = ({ activeUploadEmployeeModal, handleUploadEmployeeModal, token, setErrorMessage }) => {
  const [employeeFile, setEmployeeFile] = useState(null); 
  const fileInputRef = useRef(null); // Used for referrence of the input element
  
  const cleanFormData = () => {
    setEmployeeFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; // Reset the input value
    }
  }; 

  useEffect(() => {
    if (!activeUploadEmployeeModal) { 
      cleanFormData();
    }
  }, [activeUploadEmployeeModal]);

  const handleUploadEmployeeStandard = async (e) => {
    e.preventDefault(); // Prevent the default form submission behavior
    
    const formData = new FormData();
    formData.append("file", employeeFile);  

    const requestOptions = {
      method: "POST",
      headers: {
        Authorization: "Bearer " + token,
      },
      body: formData,
    };
    
    const response = await fetch(`/api/admin/uploademployeesstandard`, requestOptions);
    const data = await response.json();
    if (!response.ok) {
      setErrorMessage("Κάτι πήγε στραβά. Δεν μπόρεσε να μεταφορτωθεί το πρότυπο με τους Υπαλλήλους");
    } else {
      cleanFormData();
      handleUploadEmployeeModal();
      alert(data.message);
    }
  };
 
  return (
    <div className={`modal ${activeUploadEmployeeModal && "is-active"}`}>
      <div className="modal-background" onClick={handleUploadEmployeeModal}></div>
      <div className="modal-card">
        <header className="modal-card-head has-background-warning-light">
          <h1 className="modal-card-title">
            Μεταφόρτωση Πρότυπου Υπαλλήλων
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
                  onChange={(e) => setEmployeeFile(e.target.files[0])} />
              </div>
            </div>
          </form>
        </section>
        <footer className="modal-card-foot has-background-warning-light">
          <button className="button is-info" onClick={handleUploadEmployeeStandard}>
            Μεταφόρτωση
          </button>
          <button className="button" onClick={handleUploadEmployeeModal}>
            Άκυρο
          </button>
        </footer>
      </div>
    </div>
  );
};

export default UploadEmployeeStandardModal;
