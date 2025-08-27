import React, { useState, useEffect, useContext, useRef } from "react";
import { DetailContext } from "../context/DetailContext";

const UploadDistributionModal = ({ active, handleUploadModal, token, id, setErrorMessage }) => {
  const [detail] = useContext(DetailContext);
  const [distributionFile, setDistributionFile] = useState(null); 
  const [licenseFile, setLicenseFile] = useState(null);
  const fileDistributionRef = useRef(null); // Used for referrence of the input element
  const fileLicenseRef = useRef(null); // Used for referrence of the input element

  

  const cleanFormData = () => {
    setDistributionFile(null);
    setLicenseFile(null);
    if (fileDistributionRef.current) {
      fileDistributionRef.current.value = ""; // Reset the input value
    }
    if (fileLicenseRef.current) {
      fileLicenseRef.current.value = ""; // Reset the input value
    }
  };
    
  useEffect(() => {
      if (!active) {
        cleanFormData();
      }
  }, [active]);

  const handleUploadDistribution = async (e) => {
    e.preventDefault(); 
    
    const formData = new FormData();
    formData.append("files", distributionFile);
    formData.append("files", licenseFile);
    formData.append("last_name", detail.lastName);
    formData.append("first_name", detail.firstName);
    
    const requestOptions = {
      method: "PUT",
      headers: {
        Authorization: "Bearer " + token,
      },
      body: formData,
    };
    
    const response = await fetch(`/api/travelcostrequests/uploaddistribution/${id}`, requestOptions);
    if (!response.ok) {
      setErrorMessage("Κάτι πήγε στραβά. Δεν μπόρεσαν να μεταφορτωθούν τα αρχεία");
    } else {
      cleanFormData();
      handleUploadModal();
      alert("Τα αρχεία μεταφορτώθηκαν επιτυχώς");
    }
  };
 
  return (
  <div className={`modal ${active && "is-active"}`}>
    <div className="modal-background" onClick={handleUploadModal}></div>
    <div className="modal-card">
      <header className="modal-card-head has-background-info-light">
        <h1 className="modal-card-title">
          Μεταφόρτωση Αρχείων Οδοιπορικών Εκπαιδευτικού
        </h1>
      </header>
      <section className="modal-card-body">
        <form>
          <div className="field">
              <label className="label">Απόφαση Διάθεσης</label>
              <div className="control">
              <input 
                type="file" 
                accept=".pdf, image/jpeg" 
                ref={fileDistributionRef} // Attach the referrence to the input element
                onChange={(e) => setDistributionFile(e.target.files[0])} />
              </div>
          </div>
          <div className="field">
              <label className="label">Άδεια Οδήγησης</label>
              <div className="control">
              <input 
                type="file" 
                accept=".pdf, image/jpeg"
                ref={fileLicenseRef} // Attach the referrence to the input element
                onChange={(e) => setLicenseFile(e.target.files[0])} />
              </div>
          </div>
        </form>
      </section>
      <footer className="modal-card-foot has-background-primary-light">
          <button className="button is-info" onClick={handleUploadDistribution}>
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

export default UploadDistributionModal;



