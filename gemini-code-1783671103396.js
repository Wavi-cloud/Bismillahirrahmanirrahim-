// ==========================================
// 1. DATA & STATE MANAGEMENT
// ==========================================

// Dataset Produk Default
const defaultProducts = [
    { id: 1, name: 'Binder/Notebook', category: 'Stationery', price: 35000, stock: 50, image: 'images/binder_notebook.jpg' },
    { id: 2, name: 'Tote Bag', category: 'Desk Essentials', price: 45000, stock: 30, image: 'images/tote_bag.jpg' },
    { id: 3, name: 'Tumbler', category: 'Desk Essentials', price: 65000, stock: 25, image: 'images/tumbler.jpg' },
    { id: 4, name: 'Sticky Note', category: 'Stationery', price: 15000, stock: 100, image: 'images/sticky_note.jpg' },
    { id: 5, name: 'Highlighter', category: 'Stationery', price: 12000, stock: 80, image: 'images/highlighter.jpg' },
    { id: 6, name: 'Gunting', category: 'Stationery', price: 10000, stock: 40, image: 'images/gunting.jpg' },
    { id: 7, name: 'Laptop Stand', category: 'Laptop Accessories', price: 120000, stock: 15, image: 'images/laptop_stand.jpg' },
    { id: 8, name: 'Laptop Case', category: 'Laptop Accessories', price: 85000, stock: 20, image: 'images/laptop_case.jpg' },
    { id: 9, name: 'Mouse Laptop', category: 'Laptop Accessories', price: 150000, stock: 10, image: 'images/mouse_laptop.jpg' },
    { id: 10, name: 'Pulpen Gel', category: 'Stationery', price: 5000, stock: 200, image: 'images/pulpen_gel.jpg' },
    { id: 11, name: 'Rak Buku Kecil', category: 'Desk Essentials', price: 75000, stock: 12, image: 'images/rak_buku_kecil.jpg' },
    { id: 12, name: 'Tempat Pulpen', category: 'Stationery', price: 25000, stock: 35, image: 'images/tempat_pulpen.jpg' },
    { id: 13, name: 'Meja Lipat', category: 'Desk Essentials', price: 110000, stock: 8, image: 'images/meja_lipat.jpg' },
    { id: 14, name: 'Lampu Baca LED', category: 'Desk Essentials', price: 95000, stock: 18, image: 'images/lampu_baca_led.jpg' },
    { id: 15, name: 'Kalkulator', category: 'Desk Essentials', price: 55000, stock: 22, image: 'images/kalkulator.jpg' }
];

// Inisialisasi Data dari LocalStorage atau Data Default
let products = JSON.parse(localStorage.getItem('novationery_products'));
if (!products || products.length === 0) {
    products = defaultProducts;
    localStorage.setItem('novationery_products', JSON.stringify(products));
}

let cart = JSON.parse(localStorage.getItem('novationery_cart')) || [];

// ==========================================
// 2. SPA NAVIGATION LOGIC
// ==========================================

const pages = document.querySelectorAll('.page');
const navButtons = document.querySelectorAll('.nav-btn');
const mobileMenu = document.querySelector('.nav-links');
const hamburger = document.querySelector('.hamburger');

function navigate(pageId) {
    // Sembunyikan semua halaman
    pages.forEach(page => page.classList.remove('active'));
    // Tampilkan halaman yang dituju
    document.getElementById(pageId).classList.add('active');
    
    // Update state tombol navigasi
    navButtons.forEach(btn => {
        btn.classList.remove('active');
        if(btn.dataset.target === pageId) btn.classList.add('active');
    });

    // Tutup menu mobile jika terbuka
    mobileMenu.classList.remove('show');

    // Render ulang berdasarkan halaman
    if(pageId === 'catalog') renderCatalog(products);
    if(pageId === 'cart') renderCart();
    if(pageId === 'admin') renderAdminTable();
}

// Event Listeners Navigasi
navButtons.forEach(btn => {
    btn.addEventListener('click', () => navigate(btn.dataset.target));
});

// Mobile Hamburger Toggle
hamburger.addEventListener('click', () => {
    mobileMenu.classList.toggle('show');
});


// ==========================================
// 3. PRODUCT RENDERING & FILTERING
// ==========================================

// Format angka ke Rupiah
const formatRp = (number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(number);

function createProductCard(product) {
    return `
        <div class="product-card">
            <div class="img-placeholder">
                <img src="${product.image}" alt="${product.name}" class="product-image" onerror="this.style.display='none'; this.parentNode.innerHTML='No Image'">
            </div>
            <div class="product-name">${product.name}</div>
            <div class="product-price">${formatRp(product.price)}</div>
            <button class="add-to-cart" onclick="addToCart(${product.id})">Tambah ke Keranjang</button>
        </div>
    `;
}

function renderFeatured() {
    const featuredGrid = document.getElementById('featured-grid');
    // Ambil 4 produk acak sebagai produk unggulan
    const featured = products.slice(0, 4); 
    featuredGrid.innerHTML = featured.map(createProductCard).join('');
}

function renderCatalog(dataToRender) {
    const catalogGrid = document.getElementById('catalog-grid');
    if (dataToRender.length === 0) {
        catalogGrid.innerHTML = '<p>Produk tidak ditemukan.</p>';
        return;
    }
    catalogGrid.innerHTML = dataToRender.map(createProductCard).join('');
}

// Fitur Pencarian & Filter Kategori
document.getElementById('search-input').addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    const filtered = products.filter(p => p.name.toLowerCase().includes(term));
    renderCatalog(filtered);
});

document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        // Update active class
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');

        const category = e.target.dataset.filter;
        if (category === 'all') {
            renderCatalog(products);
        } else {
            const filtered = products.filter(p => p.category === category);
            renderCatalog(filtered);
        }
    });
});


// ==========================================
// 4. CART LOGIC & MICRO-INTERACTIONS
// ==========================================

function updateCartBadge() {
    const badge = document.getElementById('cart-badge');
    const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
    badge.innerText = totalItems;
    localStorage.setItem('novationery_cart', JSON.stringify(cart));
}

function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    const existing = cart.find(item => item.id === productId);

    if (existing) {
        existing.qty += 1;
    } else {
        cart.push({ ...product, qty: 1 });
    }
    updateCartBadge();
    
    // Micro-interaction: Shake icon keranjang
    const cartIcon = document.querySelector('.cart-icon');
    cartIcon.classList.add('shake');
    setTimeout(() => cartIcon.classList.remove('shake'), 400);
}

function changeQty(productId, delta) {
    const item = cart.find(i => i.id === productId);
    if (item) {
        item.qty += delta;
        if (item.qty <= 0) {
            cart = cart.filter(i => i.id !== productId);
        }
        updateCartBadge();
        renderCart();
    }
}

function renderCart() {
    const cartContainer = document.getElementById('cart-items');
    const checkoutBtn = document.getElementById('checkout-btn');
    const totalPriceEl = document.getElementById('total-price');
    const totalItemsEl = document.getElementById('total-items');

    if (cart.length === 0) {
        cartContainer.innerHTML = '<p>Keranjang Anda masih kosong.</p>';
        checkoutBtn.disabled = true;
        totalPriceEl.innerText = formatRp(0);
        totalItemsEl.innerText = '0';
        return;
    }

    checkoutBtn.disabled = false;
    let totalHarga = 0;
    let totalBrg = 0;

    cartContainer.innerHTML = cart.map(item => {
        totalHarga += item.price * item.qty;
        totalBrg += item.qty;
        return `
            <div class="cart-item">
                <div class="cart-item-info">
                    <h4>${item.name}</h4>
                    <p>${formatRp(item.price)}</p>
                </div>
                <div class="cart-qty">
                    <button class="qty-btn" onclick="changeQty(${item.id}, -1)">-</button>
                    <span>${item.qty}</span>
                    <button class="qty-btn" onclick="changeQty(${item.id}, 1)">+</button>
                    <button class="remove-btn" onclick="changeQty(${item.id}, -${item.qty})">Hapus</button>
                </div>
            </div>
        `;
    }).join('');

    totalItemsEl.innerText = totalBrg;
    totalPriceEl.innerText = formatRp(totalHarga);
}


// ==========================================
// 5. CHECKOUT & PAYMENT SIMULATION
// ==========================================

const checkoutModal = document.getElementById('checkout-modal');
const checkoutBtn = document.getElementById('checkout-btn');
const closeBtn = document.querySelector('.close-modal');
const payNowBtn = document.getElementById('pay-now-btn');
const loadingScreen = document.getElementById('loading-screen');
const successScreen = document.getElementById('success-screen');

checkoutBtn.addEventListener('click', () => {
    checkoutModal.style.display = 'flex';
});

closeBtn.addEventListener('click', () => {
    checkoutModal.style.display = 'none';
});

payNowBtn.addEventListener('click', () => {
    checkoutModal.style.display = 'none';
    loadingScreen.style.display = 'flex';

    // Simulasi Proses Gateway (3 detik)
    setTimeout(() => {
        loadingScreen.style.display = 'none';
        successScreen.style.display = 'flex';
        
        // Buat ID Transaksi Random
        const trxId = 'NV-' + Math.random().toString(36).substr(2, 9).toUpperCase();
        document.getElementById('trx-id').innerText = trxId;

        // Bersihkan Keranjang
        cart = [];
        updateCartBadge();
    }, 3000);
});

document.getElementById('continue-shopping-btn').addEventListener('click', () => {
    successScreen.style.display = 'none';
    navigate('home');
});


// ==========================================
// 6. ADMIN DASHBOARD LOGIC (CRUD)
// ==========================================

const adminForm = document.getElementById('admin-form');
const adminTableBody = document.getElementById('admin-table-body');
let editMode = false;

function saveProducts() {
    localStorage.setItem('novationery_products', JSON.stringify(products));
}

function renderAdminTable() {
    adminTableBody.innerHTML = products.map(p => `
        <tr>
            <td>${p.name}</td>
            <td>${formatRp(p.price)}</td>
            <td>${p.stock}</td>
            <td>
                <button class="action-btn edit-btn" onclick="editProduct(${p.id})">Edit</button>
                <button class="action-btn del-btn" onclick="deleteProduct(${p.id})">Hapus</button>
            </td>
        </tr>
    `).join('');
}

adminForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const id = document.getElementById('admin-id').value;
    const name = document.getElementById('admin-name').value;
    const category = document.getElementById('admin-category').value;
    const price = parseInt(document.getElementById('admin-price').value);
    const stock = parseInt(document.getElementById('admin-stock').value);
    const image = document.getElementById('admin-image').value;

    if (editMode) {
        const index = products.findIndex(p => p.id == id);
        products[index] = { id: parseInt(id), name, category, price, stock, image };
        editMode = false;
        document.getElementById('admin-cancel').style.display = 'none';
    } else {
        const newId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
        products.push({ id: newId, name, category, price, stock, image });
    }

    saveProducts();
    renderAdminTable();
    adminForm.reset();
    
    // Perbarui Tampilan Lain
    renderFeatured();
    renderCatalog(products);
});

function editProduct(id) {
    const product = products.find(p => p.id === id);
    if (!product) return;
    
    document.getElementById('admin-id').value = product.id;
    document.getElementById('admin-name').value = product.name;
    document.getElementById('admin-category').value = product.category;
    document.getElementById('admin-price').value = product.price;
    document.getElementById('admin-stock').value = product.stock;
    document.getElementById('admin-image').value = product.image;
    
    editMode = true;
    document.getElementById('admin-cancel').style.display = 'inline-block';
    window.scrollTo(0, 0);
}

document.getElementById('admin-cancel').addEventListener('click', () => {
    adminForm.reset();
    editMode = false;
    document.getElementById('admin-cancel').style.display = 'none';
});

function deleteProduct(id) {
    if(confirm('Yakin ingin menghapus produk ini?')) {
        products = products.filter(p => p.id !== id);
        saveProducts();
        renderAdminTable();
        renderFeatured();
        renderCatalog(products);
    }
}

// ==========================================
// 7. INISIALISASI AWAL APP
// ==========================================
updateCartBadge();
renderFeatured();

// Event Form Kontak Mencegah Refresh
document.getElementById('contact-form').addEventListener('submit', (e) => {
    e.preventDefault();
    alert('Terima kasih! Pesan Anda telah terkirim.');
    e.target.reset();
});