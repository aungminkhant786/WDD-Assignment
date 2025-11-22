function getCart() {
    try {
        var stored = localStorage.getItem("ahs_cart");
        if (!stored) return [];
        return JSON.parse(stored);
    } catch (e) {
        return [];
    }
}

function saveCart(cart) {
    localStorage.setItem("ahs_cart", JSON.stringify(cart));
}

function clearCart() {
    saveCart([]);
}

function formatCurrency(value) {
    return "$" + value;
}

function addToCart(item) {
    var cart = getCart();
    var existing = cart.find(function (p) { return p.id === item.id; });
    if (existing) {
        existing.qty += item.qty;
    } else {
        cart.push(item);
    }
    saveCart(cart);
}

function getStoredUser() {
    try {
        var stored = localStorage.getItem("ahs_user");
        if (!stored) return null;
        return JSON.parse(stored);
    } catch (e) {
        return null;
    }
}

function isLoggedIn() {
    return localStorage.getItem("ahs_logged_in") === "true";
}

function logoutUser() {
    localStorage.removeItem("ahs_logged_in");
    window.location.href = "index.html";
}

function setupAuthUI() {
    var loggedIn = isLoggedIn();
    var user = getStoredUser();
    var accountToggle = document.getElementById("accountDropdown");
    var mobileLoginLink = document.querySelector('.nav-item.d-lg-none a[href="login.html"]');
    var mobileRegisterLink = document.querySelector('.nav-item.d-lg-none a[href="login.html#register"]');
    if (!accountToggle) return;
    var menu = accountToggle.parentElement.querySelector(".dropdown-menu");
    if (!menu) return;
    if (!loggedIn || !user) {
        accountToggle.innerHTML = '<i class="fa-solid fa-user me-1"></i>Account<i class="fa-solid fa-angle-down ms-1"></i>';
        menu.innerHTML = "";
        var liLogin = document.createElement("li");
        var aLogin = document.createElement("a");
        aLogin.className = "dropdown-item";
        aLogin.href = "login.html";
        aLogin.textContent = "Login";
        liLogin.appendChild(aLogin);
        var liRegister = document.createElement("li");
        var aRegister = document.createElement("a");
        aRegister.className = "dropdown-item";
        aRegister.href = "login.html#register";
        aRegister.textContent = "Register";
        liRegister.appendChild(aRegister);
        menu.appendChild(liLogin);
        menu.appendChild(liRegister);
        if (mobileLoginLink && mobileLoginLink.parentElement) mobileLoginLink.parentElement.style.display = "";
        if (mobileRegisterLink && mobileRegisterLink.parentElement) mobileRegisterLink.parentElement.style.display = "";
    } else {
        accountToggle.innerHTML = '<i class="fa-solid fa-user me-1"></i>' + user.name + '<i class="fa-solid fa-angle-down ms-1"></i>';
        menu.innerHTML = "";
        var liAccount = document.createElement("li");
        var aAccount = document.createElement("a");
        aAccount.className = "dropdown-item";
        aAccount.href = "#";
        aAccount.textContent = "My Account";
        liAccount.appendChild(aAccount);
        var liLogout = document.createElement("li");
        var aLogout = document.createElement("a");
        aLogout.className = "dropdown-item";
        aLogout.href = "#";
        aLogout.textContent = "Logout";
        aLogout.addEventListener("click", function (e) {
            e.preventDefault();
            logoutUser();
        });
        liLogout.appendChild(aLogout);
        menu.appendChild(liAccount);
        menu.appendChild(liLogout);
        if (mobileLoginLink && mobileLoginLink.parentElement) mobileLoginLink.parentElement.style.display = "none";
        if (mobileRegisterLink && mobileRegisterLink.parentElement) mobileRegisterLink.parentElement.style.display = "none";
    }
}

function setupAuthForms() {
    var loginForm = document.getElementById("loginForm");
    var registerForm = document.getElementById("registerForm");
    if (!loginForm && !registerForm) return;
    if (isLoggedIn() && getStoredUser()) {
        window.location.href = "index.html";
        return;
    }
    if (loginForm) {
        var loginEmail = document.getElementById("loginEmail");
        var loginPassword = document.getElementById("loginPassword");
        loginForm.addEventListener("submit", function (e) {
            e.preventDefault();
            var stored = getStoredUser();
            if (!stored) {
                alert("No account found. Please register first.");
                return;
            }
            var email = loginEmail.value.trim();
            var password = loginPassword.value.trim();
            if (email === stored.email && password === stored.password) {
                localStorage.setItem("ahs_logged_in", "true");
                alert("Login successful.");
                window.location.href = "index.html";
            } else {
                alert("Invalid email or password.");
            }
        });
    }
    if (registerForm) {
        var registerName = document.getElementById("registerName");
        var registerEmail = document.getElementById("registerEmail");
        var registerPassword = document.getElementById("registerPassword");
        var registerConfirm = document.getElementById("registerConfirm");
        registerForm.addEventListener("submit", function (e) {
            e.preventDefault();
            var name = registerName.value.trim();
            var email = registerEmail.value.trim();
            var password = registerPassword.value.trim();
            var confirm = registerConfirm.value.trim();
            if (!name || !email || !password || !confirm) {
                alert("Please fill in all fields.");
                return;
            }
            if (password.length < 4) {
                alert("Password should be at least 4 characters.");
                return;
            }
            if (password !== confirm) {
                alert("Passwords do not match.");
                return;
            }
            var user = { name: name, email: email, password: password };
            localStorage.setItem("ahs_user", JSON.stringify(user));
            localStorage.removeItem("ahs_logged_in");
            alert("Account created. Please log in.");
            window.location.href = "login.html";
        });
    }
}

function setupShopPage() {
    var grid = document.getElementById("productGrid");
    if (!grid) return;
    var sortSelect = document.getElementById("shopSortSelect");
    if (sortSelect) {
        sortSelect.addEventListener("change", function () {
            var value = sortSelect.value;
            var items = Array.prototype.slice.call(grid.querySelectorAll(".product-item"));
            if (value === "price-asc") {
                items.sort(function (a, b) {
                    return parseFloat(a.dataset.price) - parseFloat(b.dataset.price);
                });
            } else if (value === "price-desc") {
                items.sort(function (a, b) {
                    return parseFloat(b.dataset.price) - parseFloat(a.dataset.price);
                });
            } else {
                return;
            }
            items.forEach(function (item) {
                grid.appendChild(item);
            });
        });
    }
    var filterButtons = document.querySelectorAll(".btn-filter");
    if (filterButtons.length) {
        filterButtons.forEach(function (btn) {
            btn.addEventListener("click", function () {
                var filter = btn.dataset.filter;
                filterButtons.forEach(function (b) {
                    b.classList.remove("active");
                });
                btn.classList.add("active");
                var items = grid.querySelectorAll(".product-item");
                items.forEach(function (item) {
                    var cat = (item.dataset.category || "").toLowerCase();
                    if (filter === "all" || filter === cat) {
                        item.style.display = "";
                    } else {
                        item.style.display = "none";
                    }
                });
            });
        });
    }
    var buttons = grid.querySelectorAll(".add-to-cart-btn");
    buttons.forEach(function (btn) {
        btn.addEventListener("click", function (e) {
            e.preventDefault();
            var itemContainer = btn.closest(".product-item");
            if (!itemContainer) return;
            var id = itemContainer.dataset.id;
            var name = itemContainer.dataset.name;
            var price = parseFloat(itemContainer.dataset.price);
            var qtyInput = itemContainer.querySelector(".product-qty-input");
            var qty = parseInt(qtyInput && qtyInput.value ? qtyInput.value : "1", 10);
            if (isNaN(qty) || qty < 1) qty = 1;
            addToCart({ id: id, name: name, price: price, qty: qty });
            window.location.href = "cart.html";
        });
    });
}

function setupProductDetailPage() {
    var details = document.querySelectorAll(".product-detail-item");
    if (!details.length) return;
    details.forEach(function (detail) {
        var btn = detail.querySelector(".detail-add-to-cart-btn");
        var qtyInput = detail.querySelector(".detail-qty-input");
        if (!btn) return;
        btn.addEventListener("click", function () {
            var id = detail.dataset.id;
            var name = detail.dataset.name;
            var price = parseFloat(detail.dataset.price);
            var qtyValue = qtyInput && qtyInput.value ? qtyInput.value : "1";
            var qty = parseInt(qtyValue, 10);
            if (isNaN(qty) || qty < 1) qty = 1;
            addToCart({ id: id, name: name, price: price, qty: qty });
            window.location.href = "cart.html";
        });
    });
}

function renderCartPage() {
    var body = document.getElementById("cart-table-body");
    if (!body) return;
    var clearBtn = document.getElementById("clearCartBtn");
    if (clearBtn) {
        clearBtn.onclick = function () {
            clearCart();
            renderCartPage();
        };
    }
    var cart = getCart();
    body.innerHTML = "";
    if (!cart.length) {
        var row = document.createElement("tr");
        var cell = document.createElement("td");
        cell.colSpan = 4;
        cell.className = "text-center small text-muted py-4";
        cell.textContent = "Your cart is empty.";
        row.appendChild(cell);
        body.appendChild(row);
        updateSummaryTotals(0, 0, 0, 0);
        renderVoucher(cart);
        return;
    }
    var subtotal = 0;
    cart.forEach(function (item, index) {
        var itemSubtotal = item.price * item.qty;
        subtotal += itemSubtotal;
        var tr = document.createElement("tr");
        var tdProduct = document.createElement("td");
        var nameDiv = document.createElement("div");
        nameDiv.className = "small fw-semibold mb-1";
        nameDiv.textContent = item.name;
        var catDiv = document.createElement("div");
        catDiv.className = "small text-muted";
        catDiv.textContent = "Item ID: " + item.id;
        tdProduct.appendChild(nameDiv);
        tdProduct.appendChild(catDiv);
        var tdPrice = document.createElement("td");
        tdPrice.className = "text-end small";
        tdPrice.textContent = formatCurrency(item.price);
        var tdQty = document.createElement("td");
        tdQty.className = "text-center";
        var qtyInput = document.createElement("input");
        qtyInput.type = "number";
        qtyInput.min = "1";
        qtyInput.value = item.qty;
        qtyInput.dataset.index = index;
        qtyInput.className = "form-control form-control-sm mx-auto cart-qty-input";
        qtyInput.style.maxWidth = "80px";
        qtyInput.style.borderRadius = "999px";
        tdQty.appendChild(qtyInput);
        var tdSubtotal = document.createElement("td");
        tdSubtotal.className = "text-end small";
        tdSubtotal.textContent = formatCurrency(itemSubtotal);
        tdSubtotal.dataset.index = index;
        tdSubtotal.classList.add("cart-item-subtotal");
        tr.appendChild(tdProduct);
        tr.appendChild(tdPrice);
        tr.appendChild(tdQty);
        tr.appendChild(tdSubtotal);
        body.appendChild(tr);
    });
    var shipping = subtotal > 0 ? 14 : 0;
    var tax = 0;
    var total = subtotal + shipping + tax;
    updateSummaryTotals(subtotal, shipping, tax, total);
    renderVoucher(cart);
    body.onchange = function (e) {
        var target = e.target;
        if (!target.classList.contains("cart-qty-input")) return;
        var index = parseInt(target.dataset.index, 10);
        var newQty = parseInt(target.value, 10);
        if (isNaN(newQty) || newQty < 1) {
            newQty = 1;
            target.value = "1";
        }
        var cartData = getCart();
        if (!cartData[index]) return;
        cartData[index].qty = newQty;
        saveCart(cartData);
        renderCartPage();
    };
}

function updateSummaryTotals(subtotal, shipping, tax, total) {
    if (typeof subtotal !== "number") subtotal = 0;
    if (typeof shipping !== "number") shipping = subtotal > 0 ? 14 : 0;
    if (typeof tax !== "number") tax = 0;
    if (typeof total !== "number") total = subtotal + shipping + tax;
    var sSubtotal = document.getElementById("summary-subtotal");
    var sShipping = document.getElementById("summary-shipping");
    var sTax = document.getElementById("summary-tax");
    var sTotal = document.getElementById("summary-total");
    if (sSubtotal) sSubtotal.textContent = formatCurrency(subtotal);
    if (sShipping) sShipping.textContent = formatCurrency(shipping);
    if (sTax) sTax.textContent = formatCurrency(tax);
    if (sTotal) sTotal.textContent = formatCurrency(total);
    var vSubtotal = document.getElementById("voucher-subtotal");
    var vShipping = document.getElementById("voucher-shipping");
    var vTax = document.getElementById("voucher-tax");
    var vTotal = document.getElementById("voucher-total");
    if (vSubtotal) vSubtotal.textContent = formatCurrency(subtotal);
    if (vShipping) vShipping.textContent = formatCurrency(shipping);
    if (vTax) vTax.textContent = formatCurrency(tax);
    if (vTotal) vTotal.textContent = formatCurrency(total);
}

function renderVoucher(cart) {
    var body = document.getElementById("voucher-table-body");
    if (!body) return;
    body.innerHTML = "";
    var subtotal = 0;
    cart.forEach(function (item) {
        var itemSubtotal = item.price * item.qty;
        subtotal += itemSubtotal;
        var tr = document.createElement("tr");
        var tdName = document.createElement("td");
        tdName.textContent = item.name;
        var tdQty = document.createElement("td");
        tdQty.className = "text-center";
        tdQty.textContent = item.qty;
        var tdPrice = document.createElement("td");
        tdPrice.className = "text-end";
        tdPrice.textContent = formatCurrency(item.price);
        var tdSubtotal = document.createElement("td");
        tdSubtotal.className = "text-end";
        tdSubtotal.textContent = formatCurrency(itemSubtotal);
        tr.appendChild(tdName);
        tr.appendChild(tdQty);
        tr.appendChild(tdPrice);
        tr.appendChild(tdSubtotal);
        body.appendChild(tr);
    });
    var shipping = subtotal > 0 ? 14 : 0;
    var tax = 0;
    var total = subtotal + shipping + tax;
    updateSummaryTotals(subtotal, shipping, tax, total);
}

function setupCheckoutAccess() {
    var checkoutBtn = document.getElementById("checkoutButton");
    var modalElement = document.getElementById("voucherModal");
    if (!checkoutBtn || !modalElement) return;
    checkoutBtn.addEventListener("click", function (e) {
        e.preventDefault();
        var cart = getCart();
        if (!cart.length) {
            alert("Add at least one item to your cart before checking out.");
            return;
        }
        if (!isLoggedIn() || !getStoredUser()) {
            alert("Please log in or register before proceeding to checkout.");
            window.location.href = "login.html";
            return;
        }
        if (typeof bootstrap !== "undefined" && bootstrap.Modal) {
            var modal = bootstrap.Modal.getOrCreateInstance(modalElement);
            modal.show();
        } else {
            modalElement.classList.add("show");
        }
    });
}

document.addEventListener("DOMContentLoaded", function () {
    setupAuthUI();
    setupShopPage();
    setupProductDetailPage();
    renderCartPage();
    setupAuthForms();
    setupCheckoutAccess();
});
