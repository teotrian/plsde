import React, { useEffect, useState , useContext} from "react";
import { DetailContext } from "../context/DetailContext";

const OvertimeRequestModal = ({ active, handleModal, token, id, setErrorMessage }) => {
  const [detail] = useContext(DetailContext);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [afm, setAfm] = useState(""); //Variable for the AFM of the logged in user
  const [school, setSchool] = useState("");       //Variable for the selected school
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [numberOfOvertimes, setNumberOfOvertimes] = useState("");

  const [schools, setSchools] = useState([]);                     // Variable for a list of the schools

  //Fetch the schools from the database and stores them in the schools variable  
  useEffect(() => {
    const getSchools = async () => {
      const requestOptions = {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
      };
      const response = await fetch(`/api/schools`, requestOptions);

      if (!response.ok) {
        setErrorMessage("Κάτι πήγε στραβά. Δεν μπόρεσε να φορτωθούν τα σχολεία");
      } else {
        const data = await response.json();
        setSchools(data);
      }
    };
    getSchools();
  }, [ token, setErrorMessage]);
  
  useEffect(() => {
    const getOvertimeRequest = async () => {
      const requestOptions = {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
      };
      const response = await fetch(`/api/overtimerequests/${id}`, requestOptions);

      if (!response.ok) {
        setErrorMessage("Κάτι πήγε στραβά. Δεν μπόρεσε να φορτωθεί το αίτημα υπερωριών");
      } else {
        const data = await response.json();
        setFirstName(data.first_name);
        setLastName(data.last_name);
        setAfm(data.afm);
        setSchool(data.school);
        setMonth(data.month);
        setYear(data.year);
        setNumberOfOvertimes(data.number_of_overtimes);
      }
    };

    if (id) {
      getOvertimeRequest();
    }
  }, [id, token, setErrorMessage]);

  const cleanFormData = () => {
    setFirstName("");
    setLastName("");
    setAfm("");
    setSchool("");
    setMonth("");
    setYear("");
    setNumberOfOvertimes("");
  };

  useEffect(() => {
      if (!active) {
        cleanFormData();
      }
    }, [active]);

  const handleCreateRequest = async (e) => {
    e.preventDefault();
    
    const requestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify({
        first_name: detail.firstName,
        last_name: detail.lastName,
        afm: detail.afm,
        school: school,
        month: month,
        year: year,
        number_of_overtimes: numberOfOvertimes,
      }),
    };
    const response = await fetch("/api/overtimerequests", requestOptions);
    if (!response.ok) {
      setErrorMessage("Κάτι πήγε στραβά. Δεν μπόρεσε να δημιουργηθεί το αίτημα υπερωριών");
    } else {
      cleanFormData();
      handleModal();
    }
  };

  const handleUpdateRequest = async (e) => {
    e.preventDefault(); 
    const requestOptions = {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify({
        first_name: firstName,
        last_name: lastName,
        afm: afm,
        school: school,
        month: month,
        year: year,
        number_of_overtimes: numberOfOvertimes,
      }),
    };
    const response = await fetch(`/api/overtimerequests/${id}`, requestOptions);
    if (!response.ok) {
      setErrorMessage("Κάτι πήγε στραβά. Δεν μπόρεσε να ενημερωθεί το αίτημα υπερωριών");	
    } else {
      cleanFormData();
      handleModal();
    }
  };

  return (
    <div className={`modal ${active && "is-active"}`}>
      <div className="modal-background" onClick={handleModal}></div>
      <div className="modal-card">
        <header className="modal-card-head has-background-primary-light">
          <h1 className="modal-card-title">
            {id ? "Επεξεργασία Αιτήματος Υπερωριών" : "Δημιουργία Αιτήματος Υπερωριών"}
          </h1>
        </header>
        <section className="modal-card-body">
          <form>
            <div className="field">
              <label className="label">Όνομα</label>
              <div className="control">
                <input
                  type="text"
                  placeholder={detail.firstName}
                  value={detail.firstName}
                  className="input"
                  readonly
                  
                />
              </div>
            </div>
            <div className="field">
              <label className="label">Επίθετο</label>
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
              <label className="label">Σχολείο</label>
              <div className="control">
                <div class="select is-primary">
                <select 
                  onChange={(e) => setSchool(e.target.value)}
                  className="input"
                  required
                  >
                  <option value="">Επιλέξτε το σχολείο των υπερωριών</option>
                 {schools.map(school => (
                  <option key={school.id} value={school.name}>
                  {school.name}
                </option>
                ))}
                </select>
                </div>
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
            <div className="field">
              <label className="label">Υπερωρίες</label>
              <div className="control">
                <input
                  type="text"
                  placeholder="Εισάγετε τον αριθμό των Υπερωριών σας"
                  value={numberOfOvertimes}
                  onChange={(e) => setNumberOfOvertimes(e.target.value)}
                  className="input"
                  required
                />
              </div>
            </div>
            
          </form>
        </section>
        <footer className="modal-card-foot has-background-primary-light">
          {id ? (
            <button className="button is-info" onClick={handleUpdateRequest}>
              Αποθήκευση
            </button>
          ) : (
            <button className="button is-primary" onClick={handleCreateRequest}>
              Δημιουργία
            </button>
          )}
          <button className="button" onClick={handleModal}>
            Άκυρο
          </button>
        </footer>
      </div>
    </div>
  );
};

export default OvertimeRequestModal;
