document.addEventListener('DOMContentLoaded', () => {
    // Bannière défilante
    let currentIndex = 0;
    const slides = document.querySelectorAll('.banner-slide');
    const totalSlides = slides.length;

    setInterval(() => {
        slides[currentIndex].style.display = 'none';
        currentIndex = (currentIndex + 1) % totalSlides;
        slides[currentIndex].style.display = 'block';
    }, 3000); // Change slide every 3 seconds

    // Charger les catégories
    loadCategory();

    // Charger les produits selon la catégorie sélectionnée
    const categorySelect = document.getElementById('categorySelect');
    categorySelect.addEventListener('change', () => {
        const selectedCategory = categorySelect.value;
        loadProducts(selectedCategory);
    });
});

function loadCategory() {
    const requete_sql = 'SELECT * FROM categorie WHERE id_mag = 8';
    envoyerRequeteApi(requete_sql, "").then(remplir_categorie).catch(error => console.error('Erreur lors du chargement des catégories:', error));
}

// Remplir la liste des catégories
function remplir_categorie(data) {
    const categorySelect = document.getElementById('categorySelect');
    const CategoryArray = data.datas;
    if (Array.isArray(CategoryArray)) {
        CategoryArray.forEach(category => {
            const option = document.createElement('option');
            option.value = category.nom_categorie;
            option.textContent = category.nom_categorie;
            categorySelect.appendChild(option);
        });
    } else {
        console.error('Erreur lors du chargement des catégories');
    }
}

async function loadProducts(category = '') {
    const productContainer = document.getElementById('productContainer');
    productContainer.innerHTML = ''; // Vider le conteneur

    let query = 'SELECT * FROM list_produits WHERE id_mag = 8';
    let additionalParam = '';

    if (category) {
        additionalParam = ` WHERE nom_categorie = '${category}'`;
    }

    try {
        const data = await envoyerRequeteApi(query, additionalParam);
        if (data) {
            data.forEach(product => {
                const productCard = document.createElement('div');
                productCard.className = 'product-card';
                productCard.innerHTML = `
                    <img src="${product.image}" alt="${product.name}">
                    <h2>${product.name}</h2>
                    <p>Prix: ${product.price} FCFA/kg</p>
                    <button onclick="addToCart(${product.id}, '${product.name}', ${product.price})">Ajouter au Panier</button>
                `;
                productContainer.appendChild(productCard);
            });
        } else {
            console.error('Erreur lors du chargement des produits');
        }
    } catch (error) {
        console.error('Erreur lors du chargement des produits:', error);
    }
}

// Fonction pour ajouter un produit au panier
function addToCart(productId, productName, productPrice) {
    const cartTable = document.getElementById('cartTable').getElementsByTagName('tbody')[0];
    const existingRow = document.getElementById(`cart-item-${productId}`);

    if (existingRow) {
        const qtyCell = existingRow.querySelector('.cart-qty');
        const totalCell = existingRow.querySelector('.cart-total');
        const qty = parseInt(qtyCell.textContent) + 1;
        qtyCell.textContent = qty;
        totalCell.textContent = productPrice * qty;
    } else {
        const row = cartTable.insertRow();
        row.id = `cart-item-${productId}`;
        row.innerHTML = `
            <td>${productName}</td>
            <td class="cart-qty">1</td>
            <td>${productPrice}</td>
            <td class="cart-total">${productPrice}</td>
            <td>
                <button onclick="updateCartItem(${productId}, 1)">+</button>
                <button onclick="updateCartItem(${productId}, -1)">-</button>
            </td>
        `;
    }
    updateCartTotal();
}

// Fonction pour mettre à jour les articles du panier
function updateCartItem(productId, qtyChange) {
    const row = document.getElementById(`cart-item-${productId}`);
    const qtyCell = row.querySelector('.cart-qty');
    const totalCell = row.querySelector('.cart-total');
    const price = parseFloat(row.children[2].textContent);
    let qty = parseInt(qtyCell.textContent) + qtyChange;

    if (qty <= 0) {
        row.remove();
    } else {
        qtyCell.textContent = qty;
        totalCell.textContent = price * qty;
    }
    updateCartTotal();
}

// Fonction pour mettre à jour le total du panier
function updateCartTotal() {
    const cartTotal = document.getElementById('cartTotal');
    const cartTable = document.getElementById('cartTable').getElementsByTagName('tbody')[0];
    let total = 0;

    for (let row of cartTable.rows) {
        const totalCell = row.querySelector('.cart-total');
        total += parseFloat(totalCell.textContent);
    }

    cartTotal.textContent = total;
}

// Fonction pour ouvrir le pop-up de paiement
function openPaymentPopup() {
    const paymentPopup = document.getElementById('paymentPopup');
    const cartTotal = document.getElementById('cartTotal').textContent;
    const totalToPay = document.getElementById('totalToPay');

    totalToPay.textContent = parseFloat(cartTotal) + 500; // Ajouter les frais de retrait
    paymentPopup.style.display = 'flex';
}

// Fonction pour fermer le pop-up de paiement
function closePaymentPopup() {
    const paymentPopup = document.getElementById('paymentPopup');
    paymentPopup.style.display = 'none';
}

// Fonction d'initialisation de la carte Google
function initMap() {
    const map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: -34.397, lng: 150.644 },
        zoom: 8
    });

    const geocoder = new google.maps.Geocoder();
    const addressInput = document.getElementById('address');

    addressInput.addEventListener('change', () => {
        geocodeAddress(geocoder, map);
    });
}

function geocodeAddress(geocoder, resultsMap) {
    const address = document.getElementById('address').value;
    geocoder.geocode({ 'address': address }, (results, status) => {
        if (status === 'OK') {
            resultsMap.setCenter(results[0].geometry.location);
            new google.maps.Marker({
                map: resultsMap,
                position: results[0].geometry.location
            });
        } else {
            alert('Geocode was not successful for the following reason: ' + status);
        }
    });
}

// Fonction pour construire la requête SQL
function construireRequeteSql(pSQL_Request, additionalParam) {
    let sqlQuery = pSQL_Request;
    if (additionalParam !== "") {
        sqlQuery += additionalParam;
    }
    return sqlQuery;
}

// Fonction pour construire la requête XML acceptée par l'API
function construireXml(requeteSql) {
    let sql_text = requeteSql.replace(/\n/g, '');
    return `<?xml version="1.0" encoding="UTF-8"?>
        <requete>
            <application>csamarket</application>
            <requete_sql>${sql_text}</requete_sql>
            <mode>SELECT</mode>
            <json_contenu>{ "code":"400"}</json_contenu>
            <table_name></table_name>
            <id_name></id_name>
            <condition>aucune</condition>
        </requete>`;
}

// Appeler l'api pour envoyer la requête et récupérer les données
async function envoyerRequeteApi(pRequete, additionalParam) {
    let sqlQuery = construireRequeteSql(pRequete, additionalParam);
    let xml;

    try {
        xml = construireXml(sqlQuery); 
    } catch (error) {
        console.error("Error constructing SQL query:", error);
        return null; // Renvoie null en cas d'erreur
    }

    try {
        const response = await fetch('http://154.12.224.173/api/execute_requete_from_xml', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/xml'
            },
            body: new TextEncoder().encode(xml) // Encoder explicitement en UTF-8
        });

        if (!response.ok) {
            console.error(`HTTP error! status: ${response.status}`);
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        console.log('Réponse API:', data); // Ajouter un console.log pour voir la réponse de l'API
        // Vérifier si data est un tableau non vide
        if (Array.isArray(data) && data.length > 0) {
            return data;
        }
        // Vérifier si data est un objet non vide
        else if (data && typeof data === 'object' && Object.keys(data).length > 0) {
            return data;
        } else {
            return null;
        }
    } catch (error) {
        console.error('Erreur lors de la requête API:', error);
        return null;
    }
}
