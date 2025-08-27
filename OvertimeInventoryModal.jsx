import React, { useEffect, useState , useContext} from "react";
import { DetailContext } from "../context/DetailContext";

const OvertimeInventoryModal = ({ active, handleCreateModal, token, id, setErrorMessage }) => {
  const [detail] = useContext(DetailContext);
  const [school, setSchool] = useState("");       //Variable for the selected school
  const [month, setMonth] = useState("");
  const [year, setYear] = useState(""); 
  
  useEffect(() => {
    const getOvertimeInventory = async () => {
      const requestOptions = {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
      };
      const response = await fetch(`/api/school/overtimeinventory/${id}`, requestOptions);

      if (!response.ok) {
        setErrorMessage("Κάτι πήγε στραβά. Δεν μπόρεσε να φορτωθεί η κατάσταση υπερωριών");
      } else {
        const data = await response.json();
        setSchool(data.school);
        setMonth(data.month);
        setYear(data.year);
      }
    };

    if (id) {
      getOvertimeInventory();
    }
  }, [id, token, setErrorMessage]);

  const cleanFormData = () => {
    setSchool("");
    setMonth("");
    setYear("");
  };

  const handleCreateOvertimeInventory = async (e) => {
    e.preventDefault();
    
    const requestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify({
        school: detail.lastName,
        month: month,
        year: year,
      }),
    };
    const response = await fetch("/api/school/overtimeinventories", requestOptions);
    if (!response.ok) {
      setErrorMessage("Κάτι πήγε στραβά. Δεν μπόρεσε να δημιουργηθεί η κατάσταση υπερωριών");
    } else {
      cleanFormData();
      handleCreateModal();
    }
  };

  const handleUpdateOvertimeInventory = async (e) => {
    e.preventDefault(); 
    const requestOptions = {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify({
        school: detail.lastName,
        month: month,
        year: year,
      }),
    };
    const response = await fetch(`/api/school/overtimeinventory/${id}`, requestOptions);
    if (!response.ok) {
      setErrorMessage("Κάτι πήγε στραβά. Δεν μπόρεσε να ενημερωθεί η κατάσταση υπερωριών");	
    } else {
      cleanFormData();
      handleCreateModal();
    }
  };

  return (
    <div className={`modal ${active && "is-active"}`}>
      <div className="modal-background" onClick={handleCreateModal}></div>
      <div className="modal-card">
        <header className="modal-card-head has-background-primary-light">
          <h1 className="modal-card-title">
            {id ? "Επεξεργασία Κατάστασης Υπερωριών" : "Δημιουργία Κατάστασης Υπερωριών"}
          </h1>
        </header>
        <section className="modal-card-body">
          <form>
            
            <div className="field">
              <label className="label">Σχολείο</label>
              <div className="control">
                <input
                  type="text"
                  placeholder={detail.lastName}
                  value={detail.lastName}
                  className="input"
                  readonly
                />
              </div>
            </div>
            
            <div className="field">
              <label className="label">Μήνας</label>
              <div className="control">
                 <div class="select is-primary">
                  <select 
                  onChange={(e) => setMonth(e.target.value)}
                  className="input"
                  required>
                    <option selected>Επιλέξτε τον μήνα των υπερωριών</option>
                    <option value="Ιανουάριος">Ιανουάριος</option>
                    <option value="Φεβρουάριος">Φεβρουάριος</option>
                    <option value="Μάρτιος">Μάρτιος</option>
                    <option value="Απρίλιος">Απρίλιος</option>
                    <option value="Μάιος">Μάιος</option>
                    <option value="Ιούνιος">Ιούνιος</option>
                    <option value="Ιούλιος">Ιούλιος</option>
                    <option value="Αύγουστος">Αύγουστος</option>
                    <option value="Σεπτέμβριος">Σεπτέμβριος</option>
                    <option value="Οκτώβριος">Οκτώβριος</option>
                    <option value="Νοέμβριος">Νοέμβριος</option>
                    <option value="Δεκέμβριος">Δεκέμβριος</option>
                  </select>   
               </div>                      
              </div>
            </div>
            <div className="field">
              <label className="label">Έτος</label>
              <div className="control">
                <div class="select is-primary">
                  <select 
                    onChange={(e) => setYear(e.target.value)}
                    className="input"
                    required>
                    <option selected>Επιλέξτε το έτος των υπερωριών</option>
                    <option value="2025">2025</option>
                    <option value="2026">2026</option>
                    <option value="2027">2027</option>
                    <option value="2028">2028</option>
                    <option value="2029">2029</option>
                    <option value="2030">2030</option>
                  </select>   
               </div>                      
              </div>
            </div>
            
          </form>
        </section>
        <footer className="modal-card-foot has-background-primary-light">
          {id ? (
            <button className="button is-info" onClick={handleUpdateOvertimeInventory}>
              Αποθήκευση
            </button>
          ) : (
            <button className="button is-primary" onClick={handleCreateOvertimeInventory}>
              Δημιουργία
            </button>
          )}
          <button className="button" onClick={handleCreateModal}>
            Άκυρο
          </button>
        </footer>
      </div>
    </div>
  );
};

export default OvertimeInventoryModal;
