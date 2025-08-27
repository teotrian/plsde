import React, { useState } from "react";
import moment from "moment";

const InfoExamInventoryModal = ({ active, handleInfoExamInventoryModal, infoData }) => {



return (
    <div className={`modal ${active && "is-active"}`}>
      <div className="modal-background" onClick={handleInfoExamInventoryModal}></div>
      <div className="modal-card">
        <header className="modal-card-head has-background-info-light">
          <h1 className="modal-card-title">Πληροφορίες Κατάστασης Πανελλαδικών</h1>
        </header>
        <section className="modal-card-body">
          <p>
            <strong>Υποβολή:</strong>{" "}
            {infoData.submitted === 1
              ? `Υποβλήθηκε στις ${moment(infoData.stimestamp).format("DD-MM-YYYY")}`
              : "Δεν Υποβλήθηκε ακόμη"}
          </p>
          <p>
            <strong>Πληρωμή:</strong>{" "}
            {infoData.paid === 1
              ? `Πληρώθηκε στις ${moment(infoData.ptimestamp).format("DD-MM-YYYY")}`
              : "Δεν Πληρώθηκε ακόμη"}
          </p>
        </section>
        <footer className="modal-card-foot has-background-info-light">
          <button className="button" onClick={handleInfoExamInventoryModal}>
            Κλείσιμο
          </button>
        </footer>
      </div>
    </div>
  )};

  export default InfoExamInventoryModal;


