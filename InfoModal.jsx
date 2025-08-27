import React, { useState } from "react";
import moment from "moment";

const InfoModal = ({ active, handleInfoModal, infoData }) => {



return (
    <div className={`modal ${active && "is-active"}`}>
      <div className="modal-background" onClick={handleInfoModal}></div>
      <div className="modal-card">
        <header className="modal-card-head has-background-info-light">
          <h1 className="modal-card-title">Πληροφορίες Αιτήματος</h1>
        </header>
        <section className="modal-card-body">
          <p>
            <strong>Οριστικοποίηση:</strong>{" "}
            {infoData.final === 1
              ? `Οριστικοποιήθηκε στις ${moment(infoData.ftimestamp).format("DD-MM-YYYY")}`
              : "Δεν οριστικοποιήθηκε"}
          </p>
          <p>
            <strong>Έγκριση:</strong>{" "}
            {infoData.approved === 1
              ? `Εγκρίθηκε στις ${moment(infoData.atimestamp).format("DD-MM-YYYY")}`
              : infoData.approved === -1
              ? `Απορίφθηκε στις ${moment(infoData.atimestamp).format("DD-MM-YYYY")}`
              : "Δεν Εξετάστηκε από το σχολείο"}
          </p>
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
          <button className="button" onClick={handleInfoModal}>
            Κλείσιμο
          </button>
        </footer>
      </div>
    </div>
  )};

  export default InfoModal;


