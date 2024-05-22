import React, { useState, useEffect } from 'react';
import './styles/CategorySelect.css';
import { envoyerRequeteApi } from './api'; // Import de la fonction API


const CategorySelect = ({ onCategoryChange }) => {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');

  useEffect(() => {
    loadCategory();
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      onCategoryChange(selectedCategory);
    }
  }, [selectedCategory, onCategoryChange]);

  const loadCategory = async () => {
    try {
      const data = await envoyerRequeteApi('SELECT * FROM categorie', '');
      setCategories(data.datas || []);
    } catch (error) {
      console.error('Erreur lors du chargement des catégories:', error);
    }
  };

  const handleCategoryChange = (event) => {
    const category = event.target.value;
    setSelectedCategory(category);
    onCategoryChange(category);
  };

  const handleLoadAllProducts = () => {
    setSelectedCategory('');
    onCategoryChange('');
  };



  return (
    <section className="select-list">
      <label htmlFor="categorySelect">Que voulez-vous acheter? :</label>
      <select id="categorySelect" onChange={handleCategoryChange} value={selectedCategory}>
        <option value="">Choisir une catégorie</option>
        {categories.map((category) => (
          <option key={category.nom_categorie} value={category.nom_categorie}>
            {category.nom_categorie}
          </option>
        ))}
      </select>
      <button type="button" className="btn btn-warning btn-rounded waves-effect waves-light" id="loadAllProductsBtn" onClick={handleLoadAllProducts}>
        Tous nos produits
      </button>
      
    </section>
  );
};

export default CategorySelect;
