// Initialize dataLayer if it doesn't exist
window.dataLayer = window.dataLayer || [];

// Shopping Cart Management
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Update cart count on page load
document.addEventListener('DOMContentLoaded', function() {
    updateCartCount();
    
    // Initialize page-specific functions
    if (document.querySelector('.cart-page')) {
        renderCart();
    }
    
    if (document.querySelector('.checkout-page')) {
        initCheckout();
    }
    
    // Add to cart button listeners
    document.querySelectorAll('.btn-comprar').forEach(button => {
        button.addEventListener('click', function() {
            addToCart(this);
        });
    });
    
    // CTA button
    const ctaButton = document.getElementById('btn-cta');
    if (ctaButton) {
        ctaButton.addEventListener('click', function() {
            // Push event to dataLayer
            window.dataLayer.push({
                'event': 'cta_click',
                'cta_location': 'hero_section',
                'cta_text': 'Ver Productos'
            });
            
            scrollToProducts();
        });
    }
    
    // Newsletter form
    const newsletterForm = document.getElementById('newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleNewsletterSubmit();
        });
    }
    
    // Contact form
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleContactSubmit();
        });
    }
    
    // Social link tracking
    document.querySelectorAll('.social-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const social = this.getAttribute('data-social');
            
            window.dataLayer.push({
                'event': 'social_click',
                'social_network': social,
                'link_url': this.href
            });
            
            console.log(`Click en red social: ${social}`);
        });
    });
    
    // Product filters
    const filterCheckboxes = document.querySelectorAll('.filter-category, .filter-price');
    filterCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            applyFilters();
        });
    });
    
    // Search functionality
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            applyFilters();
        });
    }
    
    // Sort functionality
    const sortSelect = document.getElementById('sort-select');
    if (sortSelect) {
        sortSelect.addEventListener('change', function() {
            sortProducts(this.value);
        });
    }
});

// Add to Cart Function
function addToCart(button) {
    const productId = button.getAttribute('data-product-id');
    const productName = button.getAttribute('data-product-name');
    const productPrice = parseFloat(button.getAttribute('data-product-price'));
    const productCategory = button.getAttribute('data-product-category');
    
    // Get quantity (for product detail page)
    const quantityInput = document.getElementById('product-quantity');
    const quantity = quantityInput ? parseInt(quantityInput.value) : 1;
    
    // Check if product already in cart
    const existingProduct = cart.find(item => item.id === productId);
    
    if (existingProduct) {
        existingProduct.quantity += quantity;
    } else {
        cart.push({
            id: productId,
            name: productName,
            price: productPrice,
            category: productCategory,
            quantity: quantity
        });
    }
    
    // Save to localStorage
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Push add_to_cart event to dataLayer
    window.dataLayer.push({
        'event': 'add_to_cart',
        'ecommerce': {
            'currencyCode': 'EUR',
            'add': {
                'products': [{
                    'id': productId,
                    'name': productName,
                    'price': productPrice,
                    'category': productCategory,
                    'quantity': quantity
                }]
            }
        }
    });
    
    // Update cart count
    updateCartCount();
    
    // Show confirmation
    button.textContent = '✓ Añadido';
    button.style.background = '#27ae60';
    
    setTimeout(() => {
        button.textContent = 'Añadir al Carrito';
        button.style.background = '';
    }, 2000);
}

// Update Cart Count
function updateCartCount() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartCountElements = document.querySelectorAll('#cart-count');
    cartCountElements.forEach(el => {
        el.textContent = totalItems;
    });
}

// Render Cart Page
function renderCart() {
    const emptyCart = document.getElementById('empty-cart');
    const cartWithItems = document.getElementById('cart-with-items');
    const cartItemsList = document.getElementById('cart-items-list');
    
    if (cart.length === 0) {
        emptyCart.style.display = 'block';
        cartWithItems.style.display = 'none';
        
        // Push view_cart event with empty cart
        window.dataLayer.push({
            'event': 'view_cart',
            'ecommerce': {
                'currencyCode': 'EUR',
                'cart_total': 0,
                'cart_items': 0
            }
        });
        
        return;
    }
    
    emptyCart.style.display = 'none';
    cartWithItems.style.display = 'grid';
    
    // Render cart items
    cartItemsList.innerHTML = '';
    
    cart.forEach(item => {
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <img src="https://via.placeholder.com/100/4A90E2/FFFFFF?text=${encodeURIComponent(item.name.substring(0, 10))}" alt="${item.name}">
            <div class="cart-item-details">
                <div class="cart-item-info">
                    <h4>${item.name}</h4>
                    <p class="cart-item-price">€${item.price.toFixed(2)}</p>
                </div>
                <div class="cart-item-controls">
                    <div class="quantity-control">
                        <button class="quantity-btn" onclick="updateQuantity('${item.id}', -1)">-</button>
                        <span>${item.quantity}</span>
                        <button class="quantity-btn" onclick="updateQuantity('${item.id}', 1)">+</button>
                    </div>
                    <button class="btn-remove" onclick="removeFromCart('${item.id}')">Eliminar</button>
                </div>
            </div>
            <div class="cart-item-total">
                <strong>€${(item.price * item.quantity).toFixed(2)}</strong>
            </div>
        `;
        cartItemsList.appendChild(cartItem);
    });
    
    // Update totals
    updateCartTotals();
    
    // Push view_cart event to dataLayer
    const products = cart.map(item => ({
        'id': item.id,
        'name': item.name,
        'price': item.price,
        'category': item.category,
        'quantity': item.quantity
    }));
    
    window.dataLayer.push({
        'event': 'view_cart',
        'ecommerce': {
            'currencyCode': 'EUR',
            'cart_total': calculateSubtotal(),
            'cart_items': cart.reduce((sum, item) => sum + item.quantity, 0),
            'products': products
        }
    });
}

// Update Cart Totals
function updateCartTotals() {
    const subtotal = calculateSubtotal();
    const shipping = subtotal >= 50 ? 0 : 4.99;
    const discount = parseFloat(localStorage.getItem('discount') || 0);
    const total = subtotal + shipping - discount;
    
    // Update all total elements
    document.querySelectorAll('#cart-subtotal, #sidebar-subtotal, #checkout-subtotal').forEach(el => {
        if (el) el.textContent = `€${subtotal.toFixed(2)}`;
    });
    
    document.querySelectorAll('#cart-shipping, #sidebar-shipping, #checkout-shipping').forEach(el => {
        if (el) el.textContent = shipping === 0 ? 'GRATIS' : `€${shipping.toFixed(2)}`;
    });
    
    if (discount > 0) {
        document.querySelectorAll('#discount-line').forEach(el => {
            if (el) el.style.display = 'flex';
        });
        document.querySelectorAll('#cart-discount').forEach(el => {
            if (el) el.textContent = `-€${discount.toFixed(2)}`;
        });
    }
    
    document.querySelectorAll('#cart-total, #sidebar-total, #checkout-total').forEach(el => {
        if (el) el.innerHTML = `<strong>€${total.toFixed(2)}</strong>`;
    });
}

// Calculate Subtotal
function calculateSubtotal() {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
}

// Update Quantity
function updateQuantity(productId, change) {
    const product = cart.find(item => item.id === productId);
    if (!product) return;
    
    product.quantity += change;
    
    if (product.quantity <= 0) {
        removeFromCart(productId);
        return;
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    renderCart();
}

// Remove from Cart
function removeFromCart(productId) {
    const product = cart.find(item => item.id === productId);
    
    if (product) {
        // Push remove_from_cart event to dataLayer
        window.dataLayer.push({
            'event': 'remove_from_cart',
            'ecommerce': {
                'remove': {
                    'products': [{
                        'id': product.id,
                        'name': product.name,
                        'price': product.price,
                        'category': product.category,
                        'quantity': product.quantity
                    }]
                }
            }
        });
    }
    
    cart = cart.filter(item => item.id !== productId);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    renderCart();
}

// Apply Coupon
function applyCoupon() {
    const couponInput = document.getElementById('coupon-input');
    const couponMessage = document.getElementById('coupon-message');
    const code = couponInput.value.toUpperCase();
    
    // Push coupon event to dataLayer
    window.dataLayer.push({
        'event': 'coupon_applied',
        'coupon_code': code
    });
    
    if (code === 'WELCOME10') {
        const discount = calculateSubtotal() * 0.1;
        localStorage.setItem('discount', discount.toString());
        couponMessage.textContent = '¡Cupón aplicado! 10% de descuento';
        couponMessage.className = 'coupon-message success';
        updateCartTotals();
    } else {
        couponMessage.textContent = 'Cupón inválido';
        couponMessage.className = 'coupon-message error';
    }
}

// Go to Checkout
function goToCheckout() {
    if (cart.length === 0) {
        alert('Tu carrito está vacío');
        return;
    }
    
    // Push begin_checkout event to dataLayer
    const products = cart.map(item => ({
        'id': item.id,
        'name': item.name,
        'price': item.price,
        'category': item.category,
        'quantity': item.quantity
    }));
    
    window.dataLayer.push({
        'event': 'begin_checkout',
        'ecommerce': {
            'currencyCode': 'EUR',
            'checkout': {
                'actionField': {'step': 1},
                'products': products
            }
        }
    });
    
    window.location.href = 'checkout.html';
}

// Initialize Checkout
function initCheckout() {
    if (cart.length === 0) {
        window.location.href = 'carrito.html';
        return;
    }
    
    renderCheckoutSidebar();
    updateCartTotals();
}

// Render Checkout Sidebar
function renderCheckoutSidebar() {
    const sidebarList = document.getElementById('sidebar-items-list');
    if (!sidebarList) return;
    
    sidebarList.innerHTML = '';
    
    cart.forEach(item => {
        const checkoutItem = document.createElement('div');
        checkoutItem.className = 'checkout-item';
        checkoutItem.innerHTML = `
            <img src="https://via.placeholder.com/60/4A90E2/FFFFFF?text=${encodeURIComponent(item.name.substring(0, 5))}" alt="${item.name}">
            <div class="checkout-item-info">
                <strong>${item.name}</strong>
                <p>€${item.price.toFixed(2)} x ${item.quantity}</p>
            </div>
        `;
        sidebarList.appendChild(checkoutItem);
    });
}

// Checkout Steps
function goToStep1() {
    changeStep(1);
}

function goToStep2() {
    const form = document.getElementById('shipping-form');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    
    // Push checkout_progress event
    window.dataLayer.push({
        'event': 'checkout_progress',
        'ecommerce': {
            'checkout': {
                'actionField': {'step': 2},
            }
        }
    });
    
    changeStep(2);
}

function goToStep3() {
    // Push checkout_progress event
    window.dataLayer.push({
        'event': 'checkout_progress',
        'ecommerce': {
            'checkout': {
                'actionField': {'step': 3},
            }
        }
    });
    
    // Update confirmation summary
    updateCheckoutSummary();
    changeStep(3);
}

function changeStep(step) {
    // Hide all steps
    document.querySelectorAll('.checkout-step').forEach(el => {
        el.classList.remove('active');
    });
    
    document.querySelectorAll('.step').forEach(el => {
        el.classList.remove('active');
    });
    
    // Show current step
    document.getElementById(`step-${step}`).classList.add('active');
    document.getElementById(`step-${step}-indicator`).classList.add('active');
    
    // Scroll to top
    window.scrollTo(0, 0);
}

// Update Checkout Summary
function updateCheckoutSummary() {
    // Shipping info
    const shippingSummary = document.getElementById('shipping-summary-display');
    if (shippingSummary) {
        const name = document.getElementById('first-name').value + ' ' + document.getElementById('last-name').value;
        const address = document.getElementById('address').value;
        const city = document.getElementById('city').value;
        const postalCode = document.getElementById('postal-code').value;
        
        shippingSummary.innerHTML = `
            <strong>${name}</strong><br>
            ${address}<br>
            ${postalCode}, ${city}
        `;
    }
    
    // Payment info
    const paymentSummary = document.getElementById('payment-summary-display');
    if (paymentSummary) {
        const paymentMethod = document.querySelector('input[name="payment"]:checked').value;
        let methodText = '';
        
        switch(paymentMethod) {
            case 'credit-card':
                methodText = '💳 Tarjeta de Crédito/Débito';
                break;
            case 'paypal':
                methodText = '🅿️ PayPal';
                break;
            case 'transfer':
                methodText = '🏦 Transferencia Bancaria';
                break;
        }
        
        paymentSummary.textContent = methodText;
    }
    
    // Render items in confirmation
    const checkoutItemsList = document.getElementById('checkout-items-list');
    if (checkoutItemsList) {
        checkoutItemsList.innerHTML = '';
        
        cart.forEach(item => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'summary-line';
            itemDiv.innerHTML = `
                <span>${item.name} x ${item.quantity}</span>
                <span>€${(item.price * item.quantity).toFixed(2)}</span>
            `;
            checkoutItemsList.appendChild(itemDiv);
        });
    }
}

// Complete Purchase
function completePurchase() {
    const termsAccepted = document.getElementById('terms-accepted').checked;
    
    if (!termsAccepted) {
        alert('Debes aceptar los términos y condiciones');
        return;
    }
    
    // Generate order ID
    const orderId = 'ORD-' + Date.now();
    const subtotal = calculateSubtotal();
    const shipping = subtotal >= 50 ? 0 : 4.99;
    const discount = parseFloat(localStorage.getItem('discount') || 0);
    const total = subtotal + shipping - discount;
    
    // Prepare products for dataLayer
    const products = cart.map(item => ({
        'id': item.id,
        'name': item.name,
        'price': item.price,
        'category': item.category,
        'quantity': item.quantity
    }));
    
    // Push purchase event to dataLayer
    window.dataLayer.push({
        'event': 'purchase',
        'ecommerce': {
            'purchase': {
                'actionField': {
                    'id': orderId,
                    'affiliation': 'Mi Tienda Demo',
                    'revenue': total.toFixed(2),
                    'tax': '0.00',
                    'shipping': shipping.toFixed(2),
                    'coupon': discount > 0 ? 'WELCOME10' : ''
                },
                'products': products
            }
        }
    });
    
    // Clear cart
    cart = [];
    localStorage.removeItem('cart');
    localStorage.removeItem('discount');
    
    // Show success message
    alert(`¡Pedido realizado con éxito!\n\nNúmero de pedido: ${orderId}\nTotal: €${total.toFixed(2)}\n\nRecibirás un email de confirmación en breve.`);
    
    // Redirect to home
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 2000);
}

// Newsletter Submit
function handleNewsletterSubmit() {
    const email = document.getElementById('newsletter-email').value;
    const message = document.getElementById('newsletter-message');
    
    // Push newsletter event to dataLayer
    window.dataLayer.push({
        'event': 'newsletter_signup',
        'newsletter_email': email
    });
    
    message.textContent = '¡Gracias por suscribirte! Recibirás nuestras novedades en ' + email;
    message.className = 'newsletter-message success';
    
    document.getElementById('newsletter-form').reset();
    
    setTimeout(() => {
        message.textContent = '';
    }, 5000);
}

// Contact Form Submit
function handleContactSubmit() {
    const name = document.getElementById('contact-name').value;
    const email = document.getElementById('contact-email').value;
    const subject = document.getElementById('contact-subject').value;
    const message = document.getElementById('contact-message').value;
    
    // Push contact form event to dataLayer
    window.dataLayer.push({
        'event': 'contact_form_submit',
        'form_name': 'contact',
        'contact_subject': subject
    });
    
    const formMessage = document.getElementById('contact-form-message');
    formMessage.textContent = `¡Gracias ${name}! Tu mensaje ha sido enviado. Te responderemos a ${email} en breve.`;
    formMessage.className = 'form-message success';
    
    document.getElementById('contact-form').reset();
    
    setTimeout(() => {
        formMessage.textContent = '';
    }, 5000);
}

// Scroll to Products
function scrollToProducts() {
    const productsSection = document.getElementById('productos');
    if (productsSection) {
        productsSection.scrollIntoView({ behavior: 'smooth' });
    } else {
        window.location.href = 'productos.html';
    }
}

// Product Filters
function applyFilters() {
    const productos = document.querySelectorAll('.productos-grid .producto');
    const searchTerm = document.getElementById('search-input')?.value.toLowerCase() || '';
    
    // Get selected categories
    const selectedCategories = Array.from(document.querySelectorAll('.filter-category:checked'))
        .map(cb => cb.value);
    
    // Get selected price range
    const selectedPrice = document.querySelector('.filter-price:checked')?.value || 'all';
    
    let visibleCount = 0;
    
    productos.forEach(producto => {
        const category = producto.getAttribute('data-category');
        const price = parseFloat(producto.getAttribute('data-price'));
        const productName = producto.querySelector('h4').textContent.toLowerCase();
        
        let categoryMatch = selectedCategories.length === 0 || selectedCategories.includes(category);
        let priceMatch = true;
        let searchMatch = searchTerm === '' || productName.includes(searchTerm);
        
        if (selectedPrice !== 'all') {
            const [min, max] = selectedPrice.split('-').map(Number);
            if (max) {
                priceMatch = price >= min && price < max;
            } else {
                priceMatch = price >= min;
            }
        }
        
        if (categoryMatch && priceMatch && searchMatch) {
            producto.style.display = 'block';
            visibleCount++;
        } else {
            producto.style.display = 'none';
        }
    });
    
    // Update product count
    const productCount = document.getElementById('product-count');
    if (productCount) {
        productCount.textContent = visibleCount;
    }
    
    // Show/hide no results message
    const noResults = document.getElementById('no-results');
    const productsGrid = document.getElementById('productos-grid');
    if (noResults && productsGrid) {
        if (visibleCount === 0) {
            productsGrid.style.display = 'none';
            noResults.style.display = 'block';
        } else {
            productsGrid.style.display = 'grid';
            noResults.style.display = 'none';
        }
    }
    
    // Push filter event to dataLayer
    window.dataLayer.push({
        'event': 'products_filtered',
        'filter_categories': selectedCategories,
        'filter_price': selectedPrice,
        'search_term': searchTerm,
        'results_count': visibleCount
    });
}

// Reset Filters
function resetFilters() {
    document.querySelectorAll('.filter-category').forEach(cb => cb.checked = true);
    document.querySelectorAll('.filter-price')[0].checked = true;
    const searchInput = document.getElementById('search-input');
    if (searchInput) searchInput.value = '';
    applyFilters();
}

// Sort Products
function sortProducts(sortBy) {
    const grid = document.getElementById('productos-grid');
    if (!grid) return;
    
    const productos = Array.from(grid.children);
    
    productos.sort((a, b) => {
        switch(sortBy) {
            case 'price-asc':
                return parseFloat(a.getAttribute('data-price')) - parseFloat(b.getAttribute('data-price'));
            case 'price-desc':
                return parseFloat(b.getAttribute('data-price')) - parseFloat(a.getAttribute('data-price'));
            case 'name':
                return a.querySelector('h4').textContent.localeCompare(b.querySelector('h4').textContent);
            default:
                return 0;
        }
    });
    
    productos.forEach(producto => grid.appendChild(producto));
    
    // Push sort event to dataLayer
    window.dataLayer.push({
        'event': 'products_sorted',
        'sort_type': sortBy
    });
}

// Product Detail Functions
function changeImage(thumbnail) {
    const mainImage = document.getElementById('main-product-image');
    if (mainImage) {
        mainImage.src = thumbnail.src.replace('100', '500');
    }
    
    document.querySelectorAll('.thumbnail').forEach(t => t.classList.remove('active'));
    thumbnail.classList.add('active');
}

function showTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.remove('active');
    });
    
    document.getElementById(tabName + '-tab').classList.add('active');
    event.target.classList.add('active');
}

function addToWishlist() {
    window.dataLayer.push({
        'event': 'add_to_wishlist',
        'product_id': 'prod-001'
    });
    
    alert('Producto añadido a favoritos ❤️');
}

// FAQ Toggle
function toggleFAQ(button) {
    const faqItem = button.parentElement;
    const isActive = faqItem.classList.contains('active');
    
    // Close all FAQs
    document.querySelectorAll('.faq-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Open clicked FAQ if it wasn't active
    if (!isActive) {
        faqItem.classList.add('active');
        
        // Push FAQ event to dataLayer
        const question = button.querySelector('span').textContent;
        window.dataLayer.push({
            'event': 'faq_opened',
            'faq_question': question
        });
    }
}

// Chat Function
function openChat() {
    window.dataLayer.push({
        'event': 'chat_opened',
        'chat_location': 'contact_page'
    });
    
    alert('Chat iniciado! 💬\n\nEn un entorno real, aquí se abriría el widget de chat en vivo.');
}

// Scroll Tracking
let scrollDepths = [25, 50, 75, 100];
let scrollTracked = [];

window.addEventListener('scroll', function() {
    const scrollPercentage = (window.scrollY + window.innerHeight) / document.documentElement.scrollHeight * 100;
    
    scrollDepths.forEach(depth => {
        if (scrollPercentage >= depth && !scrollTracked.includes(depth)) {
            scrollTracked.push(depth);
            
            window.dataLayer.push({
                'event': 'scroll_depth',
                'scroll_percentage': depth
            });
        }
    });
});
