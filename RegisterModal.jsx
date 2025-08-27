import { useEffect, useState } from "react";

import ErrorMessage from "./ErrorMessage";

const RegisterModal = ({active, closeModal}) => {
  const [categoryChoice, setCategoryChoice] = useState(""); // State for category choice
  const [afm, setAFM] = useState(""); // State for AFM
  const [kodikos, setKodikos] = useState(""); // State for school code
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmationPassword, setConfirmationPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
 
//Function to clean the data if the modal closes
  useEffect(() => {
    if (!active) {
      cleanFormData();
    }
  }, [active]);

//   // Function to clean form data  
  const cleanFormData = () => {
    setCategoryChoice("");
    setAFM("");
    setKodikos("");
    setEmail("");
    setPassword("");
    setConfirmationPassword("");
    setErrorMessage("");
  };
  
  //Funcτion to handle the submit of the registration form
  // It checks if the password and confirmation password match and if they are longer than 5 characters
  const handleSubmitRegistration = (e) => {
    e.preventDefault();

    if (password === confirmationPassword && password.length > 5) {
      if (categoryChoice === "Υπάλληλος" && afm.length !== 9) {
        setErrorMessage("Σιγουρευτείτε οτι τo ΑΦΜ σας έχει 9 ψηφία");
      } else if (categoryChoice === "Σχολείο" && kodikos.length !== 7) {
        setErrorMessage("Σιγουρευτείτε οτι ο κωδικός του Σχολείου σας έχει 7 ψηφία");
      } else {
    submitRegistration(e);
      }
    } else {
      setErrorMessage("Σιγουρευτείτε οτι τα password ταυτίζονται και είναι πάνω από 5 χαρακτήρες");
    }
  };


  // Function to handle the submission of the registration form
  // It sends a POST request to the server with the form data 
  const submitRegistration = async () => {

    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        category: categoryChoice, 
        afm:afm, 
        kodikos:kodikos, 
        email: email, 
        hashed_password: password,
       }),
    };

    const response = await fetch("/api/registerrequests", requestOptions);
    const data = await response.json();

    if (!response.ok) {
      setErrorMessage(data.detail);
    } else {
      alert("Η Εγγραφή σας ολοκληρώθηκε επιτυχώς. Θα ενημερωθείτε για την έγκριση σας.");	
      cleanFormData();
      closeModal();
    }
  };


  return (
    <div className={`modal ${active ? "is-active" : ""}`}>
      <div className="modal-background" onClick={closeModal}></div>
      <div className="modal-card">
        <header className="modal-card-head has-background-info-light">
          <h1 className="modal-card-title">
            Εγγραφή Χρήστη
          </h1>
        </header>
        <section className="modal-card-body">
          <form onSubmit={handleSubmitRegistration}>
            <div className="field is-grouped">
              <div className="control is-expanded">
                <label className="label">Επιλέξτε κατηγορία : </label>
                <div className="select is-info">
                  <select
                    value={categoryChoice}
                    onChange={(e) => {
                      setCategoryChoice(e.target.value);
                      setAFM(null)
                      setKodikos(null);
                    }}
                    required
                  >
                    <option value="" disabled>Κατηγορία</option>
                    <option value="Υπάλληλος">Υπάλληλος</option>
                    <option value="Σχολείο">Σχολείο</option>
                  </select>
                </div>
              </div>

              {categoryChoice === "Υπάλληλος" && (
                <div className="control is-expanded">
                  <label className="label">ΑΦΜ</label>
                  <input
                    type="text"
                    placeholder="Εισάγετε το ΑΦΜ σας"
                    value={afm}
                    onChange={(e) => setAFM(e.target.value)}
                    className="input"
                    required
                  />
                </div>
              )}
              {categoryChoice === "Σχολείο" && (
                <div className="control is-expanded">
                  <label className="label">Κωδικός Σχολείου</label>
                  <input
                    type="text"
                    placeholder="Εισάγετε τον κωδικό του Σχολείου σας"
                    value={kodikos}
                    onChange={(e) => setKodikos(e.target.value)}
                    className="input"
                    required
                  />
                </div>
              )}
            </div>

            <div className="field">
              <label className="label">Email Address</label>
              <div className="control">
                <input
                  type="email"
                  placeholder="Εισάγετε το email σας"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input"
                  required
                />
              </div>
            </div>
            <div className="field">
              <label className="label">Password</label>
              <div className="control">
                <input
                  type="password"
                  placeholder="Εισάγετε το password σας"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input"
                  required
                />
              </div>
            </div>
            <div className="field">
              <label className="label">Confirm Password</label>
              <div className="control">
                <input
                  type="password"
                  placeholder="Επικυρώστε το password σας"
                  value={confirmationPassword}
                  onChange={(e) => setConfirmationPassword(e.target.value)}
                  className="input"
                  required
                />
              </div>
            </div>
          </form>
        </section>
        <footer className="modal-card-foot has-background-info-light">
          <ErrorMessage message={errorMessage} />
          <br />
          <button className="button is-link" onClick={handleSubmitRegistration} type="button">
            Εγγραφή
          </button>
          <button className="button" onClick={closeModal} type="button">
            Άκυρο
          </button>
        </footer>
      </div>
    </div>
  );
};

export default RegisterModal;
