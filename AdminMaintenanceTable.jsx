import React, { useContext, useEffect, useState } from "react";
import { UserContext } from "../context/UserContext";
import ErrorMessage from "./ErrorMessage";
import UploadSchoolStandardModal from "./UploadSchoolStandardModal";
import UploadEmployeeStandardModal from "./UploadEmployeeStandardModal";
import ChangeCompensationValueModal from "./ChangeCompensationValueModal";

 
const AdminMaintenanceTable = () => {
  const { user } = useContext(UserContext);
  const [maintenanceChoice, setMaintenanceChoice] = useState("");
  const [token] = useContext(UserContext);
  const [errorMessage, setErrorMessage] = useState("");
  const [activeUploadSchoolModal, setActiveUploadSchoolModal] = useState(false);
  const [activeUploadEmployeeModal, setActiveUploadEmployeeModal] = useState(false);
  const [activeChangeCompensationValueModal, setActiveChangeCompensationValueModal] = useState(false);
  const [overtimeCompensationValue, setOvertimeCompensationValue] = useState(0); // Default value for overtime compensation
  const [travelcostCompensationValue, setTravelcostCompensationValue] = useState(0); // Default value for travel cost compensation
  const [presidentCompensationValue, setPresidentCompensationValue] = useState(0); // Default value for president compensation
  const [secretaryCompensationValue, setSecretaryCompensationValue] = useState(0); // Default value for secretary compensation    
  const [secretaryAssistantCompensationValue, setSecretaryAssistantCompensationValue] = useState(0); // Default value for secretary assistant compensation
  const [memberCompensationValue, setMemberCompensationValue] = useState(0); // Default value for member compensation
  const [samCompensationValue, setSamCompensationValue] = useState(0); // Default value for sam compensation
  const [supervisorCompensationValue, setSupervisorCompensationValue] = useState(0); // Default value for supervisor compensation 

  // Function to clear all school registrations
  const handleClearSchools = async () => {
    const confirmClearSchools = window.confirm("Είστε σίγουροι ότι θέλετε να διαγράψετε όλα τα Σχολεία;");
      if (!confirmClearSchools) {
        return;
      }
      const requestOptions = {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      };
    
    const response = await fetch(`/api/admin/clearschools`, requestOptions);
    if (!response.ok) {
      setErrorMessage("Κάτι πήγε στραβά. Δεν μπόρεσε να εκκαθαριστεί ο πίνακας με τα Σχολεία");
    } else {
      alert("Ο πίνακας με τα Σχολεία εκκαθαρίστηκε επιτυχώς");
    }
    };
  

  // Function to download the standard template for schools
  const handleDownloadSchoolStandard = async () => {
      const link = document.createElement("a");
      link.href = "/SCHOOL_STANDARD.XLSX";
      link.download = "SCHOOL_STANDARD.XLSX"; // Optional: this sets the filename
      link.click();
   };
  
  // Function to handle the submission of a file with new schools
  const handleSubmitSchools = async () => {
    setActiveUploadSchoolModal(true);
  };

  // Function to toggle the upload school modal
  const handleUploadSchoolModal = () => {
    setActiveUploadSchoolModal(!activeUploadSchoolModal);
    setErrorMessage("");
  };

  // Function to clear all employees registrations
  const handleClearEmployees = async () => {
    const confirmClearEmployees = window.confirm("Είστε σίγουροι ότι θέλετε να διαγράψετε όλους του Υπαλλήλους;");
      if (!confirmClearEmployees) {
        return;
      }
    const requestOptions = {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
    };
    
    const response = await fetch(`/api/admin/clearemployees`, requestOptions);
    if (!response.ok) {
      setErrorMessage("Κάτι πήγε στραβά. Δεν μπόρεσε να εκκαθαριστεί ο πίνακας με τoς Υπαλλήλους");
    } else {
      alert("Ο πίνακας με τους Υπαλλήλους εκκαθαρίστηκε επιτυχώς");
    }
    };

  // Function to download the standard template for employees
  const handleDownloadEmployeeStandard = async () => {
      const link = document.createElement("a");
      link.href = "/EMPLOYEE_STANDARD.XLSX";
      link.download = "EMPLOYEE_STANDARD.XLSX"; // Optional: this sets the filename
      link.click();
   };
  
// Function to handle the submission of a file with new schools
  const handleSubmitEmployees = async () => {
    setActiveUploadEmployeeModal(true);
  };

  // Function to toggle the upload school modal
  const handleUploadEmployeeModal = () => {
    setActiveUploadEmployeeModal(!activeUploadEmployeeModal);
    setErrorMessage("");
  };

  //Function to get the value of the overtime compensation  
  const getOvertimeCompensation = async () => {
    const requestOptions = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
    };
    
    const response = await fetch(`/api/admin/overtimecompensationvalue`, requestOptions);
    if (!response.ok) {
      setErrorMessage("Kάτι πήγε στραβά. Δεν μπόρεσε να βρεθεί η κσθορισμένη αποζημίωση των υπερωριών");
    } else {
      const data = await response.json();
      setOvertimeCompensationValue(data);
      setErrorMessage("");
    }
  };

   //Function to get the value of the travelcost compensation  
  const getTravelcostCompensation = async () => {
    const requestOptions = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
    };
    
    const response = await fetch(`/api/admin/travelcostcompensationvalue`, requestOptions);
    if (!response.ok) {
      setErrorMessage("Kάτι πήγε στραβά. Δεν μπόρεσε να βρεθεί η κσθορισμένη αποζημίωση των οδοιπορικών");
    } else {
      const data = await response.json();
      setTravelcostCompensationValue(data);
      setErrorMessage("");
    }
  };

  //Function to get the value of the president compensation  
  const getPresidentCompensation = async () => {
    const requestOptions = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
    };
    
    const response = await fetch(`/api/admin/presidentcompensationvalue`, requestOptions);
    if (!response.ok) {
      setErrorMessage("Kάτι πήγε στραβά. Δεν μπόρεσε να βρεθεί η κσθορισμένη αποζημίωση του προεδρεύοντα");
    } else {
      const data = await response.json();
      setPresidentCompensationValue(data);
      setErrorMessage("");
    }
  };

  //Function to get the value of the secretary compensation  
  const getSecretaryCompensation = async () => {
    const requestOptions = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
    };
    
    const response = await fetch(`/api/admin/secretarycompensationvalue`, requestOptions);
    if (!response.ok) {
      setErrorMessage("Kάτι πήγε στραβά. Δεν μπόρεσε να βρεθεί η κσθορισμένη αποζημίωση του γραμματέα");
    } else {
      const data = await response.json();
      setSecretaryCompensationValue(data);
      setErrorMessage("");
    }
  };

    //Function to get the value of the secretary assistant compensation  
  const getSecretaryAssistantCompensation = async () => {
    const requestOptions = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
    };
    
    const response = await fetch(`/api/admin/secretaryassistantcompensationvalue`, requestOptions);
    if (!response.ok) {
      setErrorMessage("Kάτι πήγε στραβά. Δεν μπόρεσε να βρεθεί η κσθορισμένη αποζημίωση του βοηθού γραμματέα");
    } else {
      const data = await response.json();
      setSecretaryAssistantCompensationValue(data);
      setErrorMessage("");
    }
  };

    //Function to get the value of the member compensation  
  const getMemberCompensation = async () => {
    const requestOptions = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
    };
    
    const response = await fetch(`/api/admin/membercompensationvalue`, requestOptions);
    if (!response.ok) {
      setErrorMessage("Kάτι πήγε στραβά. Δεν μπόρεσε να βρεθεί η κσθορισμένη αποζημίωση του μέλους");
    } else {
      const data = await response.json();
      setMemberCompensationValue(data);
      setErrorMessage("");
    }
  };

  //Function to get the value of the sam compensation  
  const getSamCompensation = async () => {
    const requestOptions = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
    };
    
    const response = await fetch(`/api/admin/samcompensationvalue`, requestOptions);
    if (!response.ok) {
      setErrorMessage("Kάτι πήγε στραβά. Δεν μπόρεσε να βρεθεί η κσθορισμένη αποζημίωση του Χειριστή ΣΑΜ");
    } else {
      const data = await response.json();
      setSamCompensationValue(data);
      setErrorMessage("");
    }
  };

  //Function to get the value of the supervisor compensation  
  const getSupervisorCompensation = async () => {
    const requestOptions = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
    };
    
    const response = await fetch(`/api/admin/supervisorcompensationvalue`, requestOptions);
    if (!response.ok) {
      setErrorMessage("Kάτι πήγε στραβά. Δεν μπόρεσε να βρεθεί η κσθορισμένη αποζημίωση του επιτηρητή");
    } else {
      const data = await response.json();
      setSupervisorCompensationValue(data);
      setErrorMessage("");
    }
  };

  useEffect(() => {
    getOvertimeCompensation();
    getTravelcostCompensation();
    getPresidentCompensation();
    getSecretaryCompensation();
    getSecretaryAssistantCompensation();
    getMemberCompensation();
    getSamCompensation();
    getSupervisorCompensation();
  }, [token]);

  // Function to handle the changing of the compensation variables
  const handleChangeCompensationValues = async () => {
    setActiveChangeCompensationValueModal(true);
  };

  // Function to toggle the change compensation variable modal
  const handleChangeCompensationValueModal = () => {
    setActiveChangeCompensationValueModal(!activeChangeCompensationValueModal);
    setErrorMessage("");
    getOvertimeCompensation();
    getTravelcostCompensation();
    getPresidentCompensation();
    getSecretaryCompensation();
    getSecretaryAssistantCompensation();
    getMemberCompensation();
    getSamCompensation();
    getSupervisorCompensation();

  };

return (
  <>
    <UploadSchoolStandardModal
        activeUploadSchoolModal={activeUploadSchoolModal}
        handleUploadSchoolModal={handleUploadSchoolModal}
        token={token}
        setErrorMessage={setErrorMessage}
    />
    <UploadEmployeeStandardModal
        activeUploadEmployeeModal={activeUploadEmployeeModal}
        handleUploadEmployeeModal={handleUploadEmployeeModal}
        token={token}
        setErrorMessage={setErrorMessage}
    />
    <ChangeCompensationValueModal
        activeModal={activeChangeCompensationValueModal}
        handleModal={handleChangeCompensationValueModal}
        token={token}
        setErrorMessage={setErrorMessage}
    />
    <div className="columns has-background-warning mb-5 mt-5 colSpan=5">
      <div className="column is-12 has-text-centered">
        <h4 className="title is-5 mt-2">Επιλογές Συντήρησης & Διαχείρισης Βάσης Δεδομένων</h4>
      </div>
    </div>

    <div className="field">
      <label className="label">Επιλέξτε την κατηγορία με την οποία θέλετε να ασχοληθείτε : </label>
      <div className="control is-flex is-align-items-center">
        <div className="select is-warning">
          <select
            value={maintenanceChoice}
            onChange={(e) => setMaintenanceChoice(e.target.value)}
            className="input"
            required
          >
            <option value="" disabled>Κατηγορία</option>
            <option value="Σχολεία">Σχολεία</option>
            <option value="Υπάλληλοι">Υπάλληλοι</option>
            <option value="Αποζημιώσεις">Αποζημιώσεις</option>

          </select>
        </div>
      </div>
    </div>

    {maintenanceChoice === "Σχολεία" ? (
      <>
      <div className="field is-flex is-align-items-center" style={{ marginLeft: "3rem", marginTop: "2rem" }}>
        <label className="label mb-0" style={{ marginRight: "1rem" }}>
          1) Μπορείτε να διαγράψετε όλες τις εγγραφές των Σχολείων που υπάρχουν στη Βάση Δεδομένων:
        </label>
        <button
          className="button is-danger"
          onClick={() => handleClearSchools()}
        >
          Εκκαθάριση Σχολείων
        </button>
      </div>
      
      <div className="field is-flex is-align-items-center" style={{ marginLeft: "3rem" , marginTop: "2rem"}}>
        <label className="label mb-0" style={{ marginRight: "1rem" }}>
          2) Μπορείτε να κατεβάσετε ένα πρότυπο αρχείο για εισαγωγή νέων Σχολείων στη Βάση Δεδομένων:
        </label>
        <button
          className="button is-primary"
          onClick={() => handleDownloadSchoolStandard()}
        >
          Λήψη Προτύπου 
        </button>
      </div>
      
      <div className="field is-flex is-align-items-center" style={{ marginLeft: "3rem" , marginTop: "2rem"}}>
        <label className="label mb-0" style={{ marginRight: "1rem" }}>
          3) Μπορείτε να υποβάλλετε ένα αρχείο για εισαγωγή νέων Σχολείων στη Βάση Δεδομένων:
        </label>
        <button
          className="button is-info"
          onClick={() => handleSubmitSchools()}
        >
          Εισαγωγή Σχολείων 
        </button>
      </div>

      </>      
    ) : maintenanceChoice === "Υπάλληλοι" ? (
      <>
      <div className="field is-flex is-align-items-center" style={{ marginLeft: "3rem", marginTop: "2rem" }}>
        <label className="label mb-0" style={{ marginRight: "1rem" }}>
          1) Μπορείτε να διαγράψετε όλες τις εγγραφές των Υπαλλήλων που υπάρχουν στη Βάση Δεδομένων:
        </label>
        <button
          className="button is-danger"
          onClick={() => handleClearEmployees()}
        >
          Εκκαθάριση Υπαλλήλων
        </button>
      </div>
      
      <div className="field is-flex is-align-items-center" style={{ marginLeft: "3rem" , marginTop: "2rem"}}>
        <label className="label mb-0" style={{ marginRight: "1rem" }}>
          2) Μπορείτε να κατεβάσετε ένα πρότυπο αρχείο για εισαγωγή νέων Υπαλλήλων στη Βάση Δεδομένων:
        </label>
        <button
          className="button is-primary"
          onClick={() => handleDownloadEmployeeStandard()}
        >
          Λήψη Προτύπου 
        </button>
      </div>
      
      <div className="field is-flex is-align-items-center" style={{ marginLeft: "3rem" , marginTop: "2rem"}}>
        <label className="label mb-0" style={{ marginRight: "1rem" }}>
          3) Μπορείτε να υποβάλλετε ένα αρχείο για εισαγωγή νέων Υπαλλήλων στη Βάση Δεδομένων:
        </label>
        <button
          className="button is-info"
          onClick={() => handleSubmitEmployees()}
        >
          Εισαγωγή Υπαλλήλων 
        </button>
      </div>

      </>   

    ) : maintenanceChoice === "Αποζημιώσεις" ? (
      <>
      <div className="field is-flex is-align-items-center" style={{ marginLeft: "3rem", marginTop: "2rem" }}>
        <label className="label mb-0" style={{ marginRight: "1rem" }}>
        Οι καθορισμένες τιμές αποζημίωσης είναι :
        </label>
      </div>
      <div className="field is-flex is-align-items-center" style={{ marginLeft: "5rem", marginTop: "1rem" }}>        
        <label className="label mb-0" style={{ marginRight: "1rem" }}>
          1) Για τις υπερωρίες : {overtimeCompensationValue} ευρώ
        </label>
      </div>
      <div className="field is-flex is-align-items-center" style={{ marginLeft: "5rem", marginTop: "1rem" }}>
        <label className="label mb-0" style={{ marginRight: "1rem" }}>
          2) Για τα οδοιπορικά : {travelcostCompensationValue} ευρώ
        </label>
      </div>
      <div className="field is-flex is-align-items-center" style={{ marginLeft: "5rem", marginTop: "1rem" }}>
        <label className="label mb-0" style={{ marginRight: "1rem" }}>
          3) Για τις Πανελλαδικές : 
        </label>
      </div>
      <div className="field is-flex is-align-items-center" style={{ marginLeft: "15rem", marginTop: "1rem" }}>
        <label className="label mb-0" style={{ marginRight: "1rem" }}>
          Πρόεδρος : {presidentCompensationValue} ευρώ
        </label>
      </div>
      <div className="field is-flex is-align-items-center" style={{ marginLeft: "15rem", marginTop: "1rem" }}>
        <label className="label mb-0" style={{ marginRight: "1rem" }}>
          Γραμματέας : {secretaryCompensationValue} ευρώ
        </label>
      </div>
        <div className="field is-flex is-align-items-center" style={{ marginLeft: "15rem", marginTop: "1rem" }}>
        <label className="label mb-0" style={{ marginRight: "1rem" }}>
          Βοηθός Γραμματέα : {secretaryAssistantCompensationValue} ευρώ
        </label>
      </div>
        <div className="field is-flex is-align-items-center" style={{ marginLeft: "15rem", marginTop: "1rem" }}>
        <label className="label mb-0" style={{ marginRight: "1rem" }}>
          Μέλος : {memberCompensationValue} ευρώ
        </label>
      </div>
      <div className="field is-flex is-align-items-center" style={{ marginLeft: "15rem", marginTop: "1rem" }}>
        <label className="label mb-0" style={{ marginRight: "1rem" }}>
          Χειριστής ΣΑΜ : {samCompensationValue} ευρώ
        </label>
      </div>
      <div className="field is-flex is-align-items-center" style={{ marginLeft: "15rem", marginTop: "1rem" }}>
        <label className="label mb-0" style={{ marginRight: "1rem" }}>
          Επιτηρητής : {supervisorCompensationValue} ευρώ
        </label>
      </div>
      <div className="field is-flex is-align-items-center" style={{ marginLeft: "3rem", marginTop: "1rem" }}>
        <label className="label mb-0" style={{ marginRight: "1rem" }}>
          Μπορείτε να αλλάξετε τις τιμές των αποζημιώσεων :
        </label>
        <button
          className="button is-primary"
          onClick={() => handleChangeCompensationValues()}
        >
          Αλλαγή
        </button>
      </div>
      </>       
    ) : (<> </> )
  }
  </>
)}

export default AdminMaintenanceTable;
