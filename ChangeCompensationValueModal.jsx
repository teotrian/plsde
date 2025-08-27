import React, { useState, useEffect} from "react";

const ChangeCompensationValueModal = ({ activeModal, handleModal, token, setErrorMessage }) => {
  const [compensation, setCompensation] = useState("");  
  const [newValue, setNewValue] = useState("");

  const cleanFormData = () => {
    setCompensation("");
    setNewValue("");
  }; 

  useEffect(() => {
    if (!activeModal) { 
      cleanFormData();
    }
  }, [activeModal]);

  const handleChangeCompensationValue = async (e) => {
    e.preventDefault();

    const requestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },

    };
    
    const response = await fetch(`/api/admin/changecompensationvalues?compensation=${compensation}&newvalue=${newValue}`, requestOptions);
    const data = await response.json();
    if (!response.ok) {
      setErrorMessage("Κάτι πήγε στραβά. Δεν μπόρεσε να ενημερωθεί η τιμή της αποζημίωσης");
    } else {
      cleanFormData();
      handleModal();
      alert(data.message);
    }
  };
 
  return (
    <div className={`modal ${activeModal && "is-active"}`}>
      <div className="modal-background" onClick={handleModal}></div>
      <div className="modal-card">
        <header className="modal-card-head has-background-warning-light">
          <h1 className="modal-card-title">
            Αλλαγή Τιμών Αποζημίωσης
          </h1>
        </header>
        <section className="modal-card-body">
          <form>
            <div className="field">
              <label className="label">Αποζημίωση</label>
              <div className="control">
                <div className="select is-info">
                  <select 
                  value={compensation} 
                  onChange={(e) => setCompensation(e.target.value)}
                  className="input"
                  required>
                    <option value="" disabled>Επιλέξτε το είδος της Αποζημίωσης</option>
                    <option value="Υπερωρίες">Υπερωρίες</option>
                    <option value="Οδοιπορικά">Οδοιπορικά</option>
                    <option value="Πρόεδρος">Πρόεδρος</option>
                    <option value="Γραμματέας">Γραμματέας</option>
                    <option value="Βοηθός Γραμματέα">Βοηθός Γραμματέα</option>
                    <option value="Μέλος">Μέλος</option>
                    <option value="Χειριστής ΣΑΜ">Χειριστής ΣΑΜ</option>
                    <option value="Επιτηρητής">Επιτηρητής</option>

                  </select>
                </div>
              </div>
            </div>

            <div className="field">
              <label className="label">Νέα Τιμή</label>
              <div className="control">
                <input
                  type="text"
                  placeholder = "Εισάγετε την νέα τιμή της αποζημίωσης"
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  className="input"
                  required
                />
              </div>
            </div>
          </form>
        </section>
        <footer className="modal-card-foot has-background-warning-light">
          <button className="button is-info" onClick={handleChangeCompensationValue}>
            Αλλαγή Τιμής
          </button>
          <button className="button" onClick={handleModal}>
            Άκυρο
          </button>
        </footer>
      </div>
    </div>
  );
};

export default ChangeCompensationValueModal;
