import React, { useEffect, useState , useContext} from "react";
import { DetailContext } from "../context/DetailContext";

const ExamInventoryModal = ({ active, handleCreateInventoryModal, token, inventoryId, setErrorMessage }) => {
  const [detail] = useContext(DetailContext);
  const [name,setName] = useState("");
  const [type,setType] = useState("");  
  const [school, setSchool] = useState("");       //Variable for the selected school
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  
  
  useEffect(() => {
    const getExamInventory = async () => {
      const requestOptions = {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
      };
      const response = await fetch(`/api/school/examinventory/${inventoryId}`, requestOptions);

      if (!response.ok) {
        setErrorMessage("Κάτι πήγε στραβά. Δεν μπόρεσε να φορτωθεί η κατάσταση πληρωμής πανελλαδικών");
      } else {
        const data = await response.json();
        setName(data.name);
        setType(data.type);
        setSchool(data.school);
        setMonth(data.month);
        setYear(data.year);
      }
    };

    if (inventoryId) {
      getExamInventory();
    }
  }, [inventoryId, token, setErrorMessage]);

  const cleanFormData = () => {
    setName("");
    setType("");
    setSchool("");
    setMonth("");
    setYear("");
  };
 
  const handleCreateExamInventory = async (e) => {
    e.preventDefault();
    
    const requestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify({
        name : name,
        type : type,
        school: detail.lastName,
        month: month,
        year: year,
      }),
    };
    const response = await fetch("/api/school/examinventories", requestOptions);
    if (!response.ok) {
      setErrorMessage("Κάτι πήγε στραβά. Δεν μπόρεσε να δημιουργηθεί η κατάσταση πληρωμής πανελλαδικών");
    } else {
      cleanFormData();
      handleCreateInventoryModal();
    }
  };

  const handleUpdateExamInventory = async (e) => {
    e.preventDefault(); 
    const requestOptions = {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify({
        name : name,
        type : type,
        school: detail.lastName,
        month: month,
        year: year,
      }),
    };
    const response = await fetch(`/api/school/examinventory/${inventoryId}`, requestOptions);
    if (!response.ok) {
      setErrorMessage("Κάτι πήγε στραβά. Δεν μπόρεσε να ενημερωθεί η κατάσταση πληρωμής πανελλαδικών");	
    } else {
      cleanFormData();
      handleCreateInventoryModal();
    }
  };

  return (
    <div className={`modal ${active && "is-active"}`}>
      <div className="modal-background" 
        onClick={()=> {
          cleanFormData();
          handleCreateInventoryModal();
        }}>
      </div>
      <div className="modal-card">
        <header className="modal-card-head has-background-info-light">
          <h1 className="modal-card-title">
            {inventoryId ? "Επεξεργασία Κατάστασης Πληρωμής Πανελλαδικών" : "Δημιουργία Κατάστασης Πληρωμής Πανελλαδικών"}
          </h1>
        </header>
        <section className="modal-card-body">
          <form>
            
            <div className="field">
              <label className="label">Όνομα</label>
              <div className="control">
                <input
                  type="text"
                  placeholder="Εισάγετε ένα όνομα για την κατάσταση πληρωμής"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input"
                  required
                />
              </div>
            </div>

            <div className="field">
              <label className="label">Τύπος</label>
              <div className="control">
                <div class="select is-info">
                  <select 
                  onChange={(e) => setType(e.target.value)}
                  className="input"
                  required>
                  <option selected>Επιλέξτε τον τύπο της αποζημίωσης</option>
                    <option value="Αποζημίωση Επιτροπών">Αποζημίωση Επιτροπών</option>
                    <option value="Αποζημίωση Επιτητηρών">Αποζημίωση Επιτητηρών</option>
                    <option value="Αποζημίωση Εξαιρέσιμων Ημερών">Αποζημίωση Εξαιρέσιμων Ημερών</option>
                  </select>
                </div>
              </div>
            </div>

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
                 <div class="select is-info">
                  <select 
                  onChange={(e) => setMonth(e.target.value)}
                  className="input"
                  required>
                    <option selected>Επιλέξτε τον μήνα των πανελλαδικών</option>
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
                <div className="select is-info">
                  <select 
                    onChange={(e) => setYear(e.target.value)}
                    className="input"
                    required>
                    <option selected>Επιλέξτε το έτος των πανελλαδικών</option>
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
        <footer className="modal-card-foot has-background-info-light">
          {inventoryId ? (
            <button className="button is-info" onClick={handleUpdateExamInventory}>
              Αποθήκευση
            </button>
          ) : (
            <button className="button is-info" onClick={handleCreateExamInventory}>
              Δημιουργία
            </button>
          )}
          <button
            className="button" 
            onClick={()=> {
              cleanFormData();
              handleCreateInventoryModal();
            }}
          >
            Άκυρο
          </button>
        </footer>
      </div>
    </div>
  );
};

export default ExamInventoryModal;
