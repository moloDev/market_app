import React, { useState, useEffect } from 'react';
import './styles/ProductList.css';
import './styles/waves.css';
import './styles/waves.min.css';
import './styles/Button.css';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { envoyerRequeteApi } from './api';

const ProductList = ({ category, addToCart }) => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    loadProducts(category);
  }, [category]);

  const loadProducts = async (category = '') => {
    try {
      let query = 'SELECT * FROM list_produits WHERE id_mag = 8';
      let additionalParam = '';

      if (category) {
        additionalParam = ` AND nom_categorie = '${category}'`;
      }

      const data = await envoyerRequeteApi(query, additionalParam);
      if (data.datas.length === 0) {
   
          toast.info("Aucun produit trouvé pour cette catégorie", { autoClose: 2000 });
       
        return;
      }
      setProducts(data.datas || []);
    } catch (error) {
      console.error('Erreur lors du chargement des produits:', error);
    }
  };

  const addToLocalStorage = (productId, productName, productPrice, productUnite) => {
    console.log(`Ajouter ${productName} au panier`);

    // Ajouter le produit au panier
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const existingProductIndex = cart.findIndex(item => item.id_produit === productId);
    if (existingProductIndex !== -1) {
      cart[existingProductIndex].quantity++;
    } else {
      cart.push({ id_produit: productId, nom_produit: productName, price: productPrice, unite: productUnite, quantity: 1 });
    }
    localStorage.setItem('cart', JSON.stringify(cart));    
  };

  const handleAddToCart = (product) => {
    addToCart({
      id_produit: product.id_produit,
      nom_produit: product.nom_produit,
      price: product.prix_v,
      quantity: 1,
      unite: product.unite
    });
    addToLocalStorage(product.id_produit, product.nom_produit, product.prix_v, product.unite.trim());
  };

  const getImageSrc = (productName) => {
    const basePath = './images/';
    const defaultImage = `${basePath}default_image.png`;
    const possibleImages = [`${basePath}${productName.toLowerCase()}.png`, `${basePath}${productName.toLowerCase()}.jpg`];

    return possibleImages.find((img) => {
      const image = new Image();
      image.src = img;
      return image.complete;
    }) || defaultImage;
  };


  return (
    <section className="product-list">
      <div className="product-container" id="productContainer">
        {products.map(product => (
          <div key={product.id_produit} className="product-card">
            <div className="product-image-container">
              <img 
                src={getImageSrc(product.nom_produit)} 
                alt={product.nom_produit} 
                onError={(e) => e.target.src = '/assets/images/default_image.png'}
              />
            </div>
            <h2>{product.nom_produit}</h2>
            <p>{product.prix_v} F/{product.unite.trim()}</p>
            <p>{product.description}</p>
            <button
              className="btn-panier btn-panier-warning"
              onClick={() => handleAddToCart(product)}
            >
              Ajouter au Panier
            </button>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ProductList;