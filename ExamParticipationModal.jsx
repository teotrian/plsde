import React, { useEffect, useState , useContext} from "react";
import { DetailContext } from "../context/DetailContext";

const ExamParticipationModal = ({ active, handleCreateParticipationModal, token, participationId, inventoryId, inventoryType, inventoryMonth, inventoryYear, setErrorMessage, refreshInsertedParticipations }) => {
  const [detail] = useContext(DetailContext);
  const [school, setSchool] = useState(detail.lastName);
  
  const [schoolEmployees, setSchoolEmployees]=useState([]);
  const [lastName, setLastName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [afm, setAfm] = useState("");
  const [type, setType] = useState(inventoryType);
  const [role, setRole] = useState("");
  const [month, setMonth] = useState(inventoryMonth);
  const [year, setYear] = useState(inventoryYear);
  const [numberOfExams, setNumberOfExams] = useState("");
  

  const getSchoolEmployees = async() => {
    const requestOptions = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
    };
    
    const response = await fetch(`/api/employees/school/${school}`, requestOptions);
      if (!response.ok) {
       setErrorMessage("Kάτι πήγε στραβά. Δεν μπόρεσαν να φορτωθούν οι υπάλληλοι του σχολείου");
      } else {
      const data = await response.json();
      setSchoolEmployees(data);
      //alert("φορτώθηκαν οι υπάλληλοι");
    }
  };
  
  useEffect(() => {
    getSchoolEmployees();
  }, [token, school]);
      
  
  
  const handleCreateParticipation = async (e) => {
    e.preventDefault();
    const requestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify({
        last_name: lastName,
        first_name: firstName,
        afm: afm,
        type : type,
        role : role,
        month: month,
        year: year,
        number_of_exams: numberOfExams,
      }),
    };
    const response = await fetch(`/api/school/examinventory/${inventoryId}/createparticipation`, requestOptions);
    if (!response.ok) {
      setErrorMessage("Κάτι πήγε στραβά. Δεν μπόρεσε να δημιουργηθεί η συμμετοχή εκπαιδευτικού στις Πανελλαδικές");
    } else {
      alert("Η συμμετοχή εκπαιδευτικού εισήχθηκε επιτυχώς");
      cleanFormData();
      refreshInsertedParticipations(); // Refresh the inserted exam participations
      handleCreateParticipationModal();
    }
  };

  useEffect(() => {
    setType(inventoryType);
    setMonth(inventoryMonth);
    setYear(inventoryYear);
  }, [inventoryType, inventoryMonth, inventoryYear]);

  const cleanFormData = () => {
    setLastName("");
    setFirstName("");
    setAfm("");
    setType("");
    setRole("");
    setMonth("");
    setYear("");
    setNumberOfExams("");
  };

  return (
    <div className={`modal ${active && "is-active"}`}>
      <div className="modal-background" onClick={handleCreateParticipationModal}></div>
      <div className="modal-card">
        <header className="modal-card-head has-background-info-light">
          <h1 className="modal-card-title">
             Καταχώριση Συμμετοχής Πανελλαδικών 
          </h1>
        </header>
        <section className="modal-card-body">
          <form>
            <div className="field">
              <label className="label">Επίθετο</label>
              <div className="control">
                <div className="select is-info">
                  <select 
                    onChange={(e) => {
                      const selectedLastName = e.target.value;
                      setLastName(selectedLastName);
                      const selectedEmployee = schoolEmployees.find(employee => employee.last_name === selectedLastName);
                      if (selectedEmployee) {
                        setFirstName(selectedEmployee.first_name);
                        setAfm(selectedEmployee.afm)
                      }
                    }}
                    className="input"
                    required>
                    <option selected disabled>Επιλέξτε το επίθετο του Εκπαιδευτικού</option>
                    {schoolEmployees.map((employee) => (
                      <option key={employee.id} value={employee.last_name}>
                        {employee.last_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="field is-grouped">
              <div className="control is-expanded">
                <label className="label">Όνομα</label>
                <input
                  type="text"
                  placeholder="Όνομα του Εκπαιδευτικού"
                  value={firstName}
                  className="input"
                  readOnly
                />
              </div>
              <div className="control is-expanded">
                <label className="label">ΑΦΜ</label>
                <input
                  type="text"
                  placeholder="ΑΦΜ του Εκπαιδευτικού"
                  value={afm}
                  className="input"
                  readOnly
                />
              </div>
            </div>
            
            <div className="field">
              <label className="label">Τύπος</label>
              <div className="control">
                <input
                  type="text"
                  placeholder={type}
                  value={type}
                  className="input"
                  readOnly
                />
              </div>
            </div>

            <div className="field">
              <label className="label">Ρόλος</label>
              <div className="control">
                <div className="select is-info">
                  <select 
                  onChange={(e) => setRole(e.target.value)}
                  className="input"
                  required>
                  <option selected>Επιλέξτε τον ρόλο του εκπαιδευτικού</option>
                    <option value="Πρόεδρος">Πρόεδρος</option>
                    <option value="Γραμματέας">Γραμματέας</option>
                    <option value="Γραμματέας">ΒοηθόςΓραμματέα</option>
                    <option value="Μέλος">Μέλος</option>
                    <option value="Μέλος">Χειριστής ΣΑΜ</option>
                    <option value="Μέλος">Σύνδεσμος</option>
                    <option value="Επιτηρητής">Επιτηρητής</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="field">
              <label className="label">Μήνας</label>
              <div className="control">
                <input
                  type="text"
                  placeholder = {month}
                  value={month}
                  className="input"
                  readOnly
                />
              </div>
            </div>

            <div className="field">
              <label className="label">Έτος</label>
              <div className="control">
                <input
                  type="text"
                  placeholder = {year}
                  value={year}
                  className="input"
                  readOnly
                />
              </div>
            </div>

            <div className="field">
              <label className="label">Ημέρες</label>
              <div className="control">
                <input
                  type="text"
                  placeholder="Εισάγετε τον αριθμό των Ημερών"
                  value={numberOfExams}
                  onChange={(e) => setNumberOfExams(e.target.value)}
                  className="input"
                  required
                />
              </div>
            </div>
            
          </form>
        </section>
        <footer className="modal-card-foot has-background-info-light">
          <button className="button is-info" onClick={handleCreateParticipation}>
            Δημιουργία
          </button>
          <button className="button" onClick={handleCreateParticipationModal}>
            Άκυρο
          </button>
        </footer>
      </div>
    </div>
  );
};

export default ExamParticipationModal;
