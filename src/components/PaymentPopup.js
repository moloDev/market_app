import React from 'react';
import './styles/PaymentPopup.css';

const PaymentPopup = ({ isVisible, onClose, total }) => {
  if (!isVisible) return null;

  return (
    <div className="popup">
      <div className="popup-content">
        <span className="close" onClick={onClose}>×</span>
        <p>Total à payer: {total} FCFA</p>
        <form>
          <div className="form-group">
            <label htmlFor="inputName">Client</label>
            <input type="text" id="inputName" className="form-control" placeholder="Votre nom" required />
          </div>
          <div className="form-group">
            <label htmlFor="inputTel">Téléphone</label>
            <input type="text" id="inputTel" className="form-control" placeholder="Votre numéro" required />
          </div>
          <div className="form-group button-group">
            <button type="submit" className="btn btn-success">Valider</button>
            <button type="button" className="btn btn-danger" onClick={onClose}>Annuler</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentPopup;
