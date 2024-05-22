document.addEventListener('DOMContentLoaded', () => {
    // Bannière défilante
    let currentIndex = 0;
    const slides = document.querySelectorAll('.banner-slide');
    const totalSlides = slides.length;

    setInterval(() => {
        slides[currentIndex].classList.remove('active');
        currentIndex = (currentIndex + 1) % totalSlides;
        slides[currentIndex].classList.add('active');
    }, 3000); // Change slide every 3 seconds

    // Charger les catégories
    loadCategory();
    loadProducts();

    // Charger les produits selon la catégorie sélectionnée
    const categorySelect = document.getElementById('categorySelect');
    categorySelect.addEventListener('change', () => {
        const selectedCategory = categorySelect.value;
        loadProducts(selectedCategory);
    });
    
    // Gérer le clic sur le bouton loadAllProductsBtn
    const loadAllProductsBtn = document.getElementById('loadAllProductsBtn');
    if (loadAllProductsBtn) {
        loadAllProductsBtn.addEventListener('click', () => {
            loadProducts('');
        });
    }
     // Gestionnaire d'événements pour le bouton "Valider"
     document.getElementById('payButton').addEventListener('click', (e) => {
        e.preventDefault();
        const nomClient = document.getElementById('nomclient').value.trim();
        const telClient = document.getElementById('telclient').value.trim();

        if (!nomClient || !telClient) {
            alert("Veuillez remplir tous les champs.");
            return;
        }

        // Fermer le pop-up de paiement
        closePaymentPopup();

        // Ouvrir le modal des options de paiement
        const paymentModal = new bootstrap.Modal(document.getElementById('paymentModal'));
        paymentModal.show();
    });
});

// Fonction pour procéder au paiement
function proceedPayment() {
    const selectedApi = document.querySelector('input[name="apiOptions"]:checked').value;
    const paymentModal = bootstrap.Modal.getInstance(document.getElementById('paymentModal'));
    paymentModal.hide();

    // Afficher le toast de traitement
    const waitToast = new bootstrap.Toast(document.getElementById('waitToast'));
    waitToast.show();

    handlePayment(selectedApi);
}

// Fonction pour gérer le paiement
async function handlePayment(option) {
    const nomClient = document.getElementById('nomclient').value.trim();
    const telClient = document.getElementById('telclient').value.trim();

    try {
        // Simuler le traitement bloquant
        const response = await simulatePaymentApi(option);

        if (response === 'OK') {
            await insertOrder(nomClient, telClient);
            alert('Paiement réussi et commande passée.');
        } else {
            alert('Échec du paiement. Veuillez réessayer.');
        }
    } catch (error) {
        console.error('Erreur lors du paiement:', error);
        alert('Échec du paiement. Veuillez réessayer.');
    }

    // Masquer le toast de traitement
    const waitToast = bootstrap.Toast.getInstance(document.getElementById('waitToast'));
    waitToast.hide();
}

// Fonction pour simuler l'appel API de paiement
function simulatePaymentApi(option) {
    return new Promise((resolve) => {
        setTimeout(() => {
            // Simuler une réponse aléatoire OK ou NOK
            const responses = ['OK', 'NOK'];
            const response = responses[Math.floor(Math.random() * responses.length)];
            resolve(response);
        }, 2000); // Simuler un délai de 2 minutes (pour test utilisez 2000 ms)
    });
}

// Fonction pour insérer la commande dans la base de données
async function insertOrder(nomClient, telClient) {
    const cartTable = document.getElementById('cartTable').getElementsByTagName('tbody')[0];
    let products = [];

    for (let row of cartTable.rows) {
        const productName = row.children[0].textContent;
        const qty = parseInt(row.querySelector('.cart-qty').textContent);
        products.push({ productName, qty });
    }

    const orderData = {
        nomClient,
        telClient,
        products
    };

    // Envoyer les données à l'API pour l'insertion
    await envoyerRequeteApi('INSERT INTO orders (nomClient, telClient, products) VALUES ?', orderData);
}

// Fonction pour fermer le pop-up de paiement
function closePaymentPopup() {
    const paymentPopup = document.getElementById('paymentPopup');
    paymentPopup.style.display = 'none';
}


// Charger les catégories
function loadCategory() {
    const requete_sql = 'SELECT * FROM categorie';
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
        additionalParam = ` AND nom_categorie = '${category}'`;
    }

    try {
        const data = await envoyerRequeteApi(query, additionalParam);
        const productArray = data.datas; // Assurez-vous que 'data.to_json' est la chaîne JSON correcte

        if (productArray) {
            productArray.forEach(product => {
                const productCard = document.createElement('div');
                productCard.className = 'product-card';
                productCard.innerHTML = `
                    <div class="product-image-container">
                        <img src="${product.logo || 'assets/images/default_image.png'}" alt="${product.nom_produit}">
                    </div>
                    <h2>${product.nom_produit}</h2>
                    <p>Prix: ${product.prix_v} F/${product.unite.trim()}</p>
                    <p>Description: ${product.description}</p>
                    <button class="btn btn-success btn-rounded waves-effect waves-light" onclick="addToCart(${product.id_produit}, '${product.nom_produit}', ${product.prix_v}, '${product.unite.trim()}')">Ajouter au Panier</button>
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
function addToCart(productId, productName, productPrice, productUnite) {
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
    let hasItems = false;

    for (let row of cartTable.rows) {
        const totalCell = row.querySelector('.cart-total');
        total += parseFloat(totalCell.textContent);
        hasItems = true;
    }

    cartTotal.textContent = total;
    // Activer ou désactiver le bouton "Commander" en fonction du contenu du panier
    const orderButton = document.getElementById('orderButton');
    orderButton.disabled = !hasItems;
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
            <application>senmarche</application>
            <requete_sql>${sql_text}</requete_sql>
            <mode>SELECT</mode>
            <json_contenu>{ "code":"400"}</json_contenu>
            <table_name></table_name>
            <id_name></id_name>
            <condition>aucune</condition>
        </requete>`;
}

// Appeler l'api pour envoyer la requête et récupeérer les données
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
            body: xml
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();        
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
