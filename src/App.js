import React, { useState, useEffect, useCallback } from 'react';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import Header from './components/Header';
import Banner from './components/Banner';
import CategorySelect from './components/CategorySelect';
import ProductList from './components/ProductList';
import PaymentPopup from './components/PaymentPopup';
import CartPopup from './components/CartPopup';
import './components/styles/App.css'; // Import correct de App.css

const App = () => {
  const [cart, setCart] = useState([]);
  const [showCartPopup, setShowCartPopup] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [products, setProducts] = useState([]); // Assurez-vous d'utiliser `products`

  const handleCategoryChange = useCallback((category) => {
    setSelectedCategory(category);
    setProducts([]); // Vider la liste des produits
  }, []);

  const handleLoadAllProducts = useCallback(() => {
    setSelectedCategory('');
    setProducts([]);
  }, []);

  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem('cart')) || [];
    setCart(storedCart);
    if (storedCart.length > 0) {
      setShowCartPopup(true);
    }
  }, []);

  const addToCart = useCallback((product) => {
    setCart(prevCart => {
      const updatedCart = [...prevCart];
      const existingProductIndex = updatedCart.findIndex(item => item.id_produit === product.id_produit);
      
      if (existingProductIndex > -1) {
        updatedCart[existingProductIndex].quantity += 1;
      } else {
        updatedCart.push({ ...product, quantity: 1 });
      }
      
      localStorage.setItem('cart', JSON.stringify(updatedCart));
      setShowCartPopup(true); // Afficher le popup lorsque l'utilisateur ajoute un article au panier
      return updatedCart;
    });
  }, []);

  const updateCartItem = useCallback((productId, qtyChange) => {
    setCart(prevCart => {
      const updatedCart = [...prevCart];
      const productIndex = updatedCart.findIndex(item => item.id_produit === productId);
      
      if (productIndex > -1) {
        const updatedProduct = { ...updatedCart[productIndex] };
        updatedProduct.quantity += qtyChange;
        
        if (updatedProduct.quantity <= 0) {
          updatedCart.splice(productIndex, 1);
        } else {
          updatedCart[productIndex] = updatedProduct;
        }
      }
      
      localStorage.setItem('cart', JSON.stringify(updatedCart));

      if (updatedCart.length === 0) {
        setShowCartPopup(false); // Masquer le popup lorsque le panier est vide
      }

      return updatedCart;
    });
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
    localStorage.setItem('cart', JSON.stringify([]));
    setShowCartPopup(false); // Masquer le popup lorsque le panier est vide
  }, []);

  const closePopup = useCallback(() => {
    setShowCartPopup(false);
  }, []);

  return (
    <HelmetProvider>
      <div className="App">
        <Helmet>
          <title>CSAMarket</title>
          <meta name="description" content="CSAMarket - Votre marketplace" />
          <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
          <meta http-equiv="X-UA-Compatible" content="IE=edge" />
          <meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no" />
        </Helmet>
        <Header />
        <Banner />
        <CategorySelect onCategoryChange={handleCategoryChange} />
        <ProductList category={selectedCategory} addToCart={addToCart} products={products} clearProduct={handleLoadAllProducts} />
        {showCartPopup && (
          <CartPopup 
            cart={cart} 
            updateCartItem={updateCartItem} 
            clearCart={clearCart}
            closePopup={closePopup} 
          />
        )}
        <PaymentPopup />
      </div>
    </HelmetProvider>
  );
}

export default App;
