import React, { useEffect } from 'react';
import './styles/Cart.css';

import './styles/datatables/css/jquery.dataTables.min.css';
import './styles/waves.min.css';
import './styles/datatables/css/responsive.dataTables.min.css';
import './styles/datatables/css/dataTables.bootstrap4.min.css';
import './styles/datatables/css/responsive.bootstrap4.min.css';

const Cart = ({ cart, updateCartItem, clearCart }) => {

  useEffect(() => {
    const updateCartTotal = () => {
      let total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
      document.getElementById('cartTotal').textContent = total;
    };
    updateCartTotal();
  }, [cart]);


  return (
    <section className="cart">
      <div className="container_panier" style={{ color: 'aliceblue' }}>
      <div class="cart-total">
          <h2>Votre Panier</h2>
          <p>Total Panier : <span id="cartTotal">0</span> FCFA</p>
      </div>
      </div>
      <div className="table-responsive" data-pattern="priority-columns">
        <table id="cartTable" className="table table-small-font table-bordered table-striped">
          <thead>
            <tr>
              <th>Article</th>
              <th data-priority="1">Qté</th>
              <th data-priority="3">PU.</th>
              <th data-priority="1">Total</th>
              <th data-priority="6">Actions</th>
            </tr>
          </thead>
          <tbody>
            {cart.map(item => (
              <tr key={item.id_produit} id={`cart-item-${item.id_produit}`}>
                <td>{item.nom_produit}</td>
                <td className="cart-qty">{item.quantity}</td>
                <td>{item.price}</td>
                <td className="cart-total">{item.price * item.quantity}</td>
                <td>
                  <button onClick={() => updateCartItem(item.id_produit, 1)}>+</button>
                  <button onClick={() => updateCartItem(item.id_produit, -1)}>-</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div>
      <div className="button-container" style={{ textAlign: 'center', marginTop: '20px' }}>
        <button type="button" className="btn btn-danger btn-rounded btn-bordered waves-effect waves-light" onClick={clearCart} style={{ marginRight: '5px' }}>
          Annuler
        </button>
        <button type="button" className="btn btn-success btn-rounded btn-bordered waves-effect waves-light" id="orderButton" disabled={!cart.length}>
          Commander
        </button>
      </div>
      </div>
    </section>
  );
};

export default Cart;
