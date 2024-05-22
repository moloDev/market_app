import React, { useState, useEffect } from 'react';
import './styles/CartPopup.css';
import './styles/Button.css';
import './styles/bootstrap.min.css';
import { envoyerRequeteApi } from './api'; // Import de la fonction API



const CartPopup = ({ cart, updateCartItem, clearCart, closePopup }) => {
  const [nomClient, setNomClient] = useState('');
  const [telClient, setTelClient] = useState('');
  const [localiteClient, setLocaliteClient] = useState('Dakar');
  const [tarifLivraison] = useState(1000);
  const [tauxRemise] = useState(0);
  const [netAPayer, setNetAPayer] = useState(0);

  useEffect(() => {
    const totalPanier = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const remise = totalPanier * (tauxRemise / 100);
    const net = (totalPanier - remise) + tarifLivraison;
    setNetAPayer(net);
  }, [cart, tauxRemise, tarifLivraison]);

  useEffect(() => {
    const updateCartTotal = () => {
      let total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
      document.getElementById('cartTotal').textContent = total;
    };
    updateCartTotal();
  }, [cart]);

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleOrder = async () => {
    const produits = cart.map(item => ({ id_produit: item.id_produit, qte: item.quantity }));
    const pRequete = `
      SELECT create_commande(
        8, -- pid_mag (magasin ID, à ajuster)
        '${telClient}', -- ptel_client
        '${nomClient}', -- pnom_client
        1, -- pid_localite (localité ID, à ajuster)
        ${netAPayer}, -- ptotal_mouv
        ${tauxRemise}, -- premise
        '${JSON.stringify(produits)}'::json
      );
    `; try {
      const result = await envoyerRequeteApi(pRequete, '');
      if (result && result.datas) {
        alert(`Commande réussie avec le numéro : ${result.datas[0].create_commande}`);
        clearCart();
        closePopup();
      } else {
        alert('Erreur lors de la commande. Veuillez réessayer.');
      }
    } catch (error) {
      console.error('Erreur lors de la commande :', error);
      alert('Erreur lors de la commande. Veuillez réessayer.');
    }
  };

  return (
    <div className="cart-popup">
      <div className="cart-header">
        <h2>Votre Panier ({totalItems} {totalItems > 1 ? 'articles' : 'article'})</h2>
        <button className="close-btn" onClick={closePopup}>X</button>
      </div>
      <div className="cart-content">
        {cart.length === 0 ? (
          <p>Votre panier est vide.</p>
        ) : (
          <div>
            <table className="table table-striped table-bordered table-responsive">
              <thead className="cart-header-th">
                <tr>
                  <th scope="col">Article</th>
                  <th scope="col">Actions</th>
                </tr>
              </thead>
              <tbody className="cart-td">
                {cart.map(item => (
                  <tr key={item.id_produit} id={`cart-item-${item.id_produit}`}>
                    <td>{item.quantity} {item.unite} {item.nom_produit} pour {item.price * item.quantity} F</td>
                    <td className="text-center">
                      <button onClick={() => updateCartItem(item.id_produit, 1)}>
                        <img className="cart-btn-action" src="./plus64.png" alt="Plus" />
                      </button>
                      <button onClick={() => updateCartItem(item.id_produit, -1)}>
                        <img className="cart-btn-action" src="./moins64.png" alt="Minus" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="cart-footer d-flex justify-content-between align-items-center mt-3">
              
              
             <div className="command_side mt-3">
               <input 
                type="tel" 
                placeholder="Téléphone mobile" 
                value={telClient}
                onChange={(e) => setTelClient(e.target.value)}
                className="rounded-input" required
              />
             
             <input 
                type="text" 
                placeholder="Nom complet" 
                value={nomClient}
                onChange={(e) => setNomClient(e.target.value)}
                className="rounded-input"
              />
              <select 
                value={localiteClient}
                onChange={(e) => setLocaliteClient(e.target.value)}
                className="rounded-input"
              >
                <option value="Dakar">Dakar</option>
                <option value="Pikine">Pikine</option>
                <option value="Parcelles">Parcelles</option>
                <option value="Rufisque">Rufisque</option>
              </select>
              <input 
                type="text" 
                value={`${tarifLivraison} frs`}
                readOnly
                className="rounded-input"
              />
              <input 
                type="text" 
                value={`${tauxRemise}%`}
                readOnly
                className="rounded-input"
              />
              <p class="font-weight-bold">Net: <span class="cart-span-total" id="cartTotal">{`${netAPayer} frs`}</span> FCFA</p>
             
            </div>
              
              <div className="command_button mt-3">
                <span> <button type="button" className="btn-panier btn-panier-danger" onClick={clearCart}>
                  Vider tout
                </button></span>
                <span> <button type="button" className="btn-panier btn-panier-success" id="orderButton" onClick={handleOrder} disabled={!cart.length}>
                  Commander
                </button></span>
              </div>
            </div>

           
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPopup;
