
// ===============================
// LIVANDER STORE MANAGEMENT SYSTEM
// ===============================


// ===============================
// INVENTORY MANAGEMENT
// ===============================

// Get saved products from the browser
let products = JSON.parse(localStorage.getItem("products")) || [];

// Save products
function saveProducts() {
    localStorage.setItem("products", JSON.stringify(products));
}

// Show products in the table
function displayProducts(productList = products) {
    const tableBody = document.getElementById("product-table-body");

    if (!tableBody) return;

    tableBody.innerHTML = "";

    productList.forEach((product, index) => {
        let status = "";
        let statusClass = "";

        if (Number(product.quantity) === 0) {
            status = "Out of Stock";
            statusClass = "status-out-stock";
        } else if (Number(product.quantity) <= 5) {
            status = "Low Stock";
            statusClass = "status-low-stock";
        } else {
            status = "In Stock";
            statusClass = "status-in-stock";
        }

        tableBody.innerHTML += `
            <tr>
                <td>${product.name}</td>
                <td>${product.category}</td>
                <td>${product.quantity}</td>
                <td>KES ${Number(product.buyingPrice).toLocaleString()}</td>
                <td>KES ${Number(product.sellingPrice).toLocaleString()}</td>
                <td>
                    <span class="${statusClass}">${status}</span>
                </td>
                <td>
                    <button class="delete-btn"
                        onclick="deleteProduct(${index})">
                        Delete
                    </button>
                </td>
            </tr>
        `;
    });
}

// Add product
const productForm = document.getElementById("product-form");

if (productForm) {
    productForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const product = {
            name: document.getElementById("product-name").value.trim(),
            category: document.getElementById("product-category").value.trim(),
            quantity: Number(document.getElementById("product-quantity").value),
            buyingPrice: Number(document.getElementById("product-buying-price").value),
            sellingPrice: Number(document.getElementById("product-selling-price").value)
        };

        if (
            !product.name ||
            !product.category ||
            product.quantity <= 0 ||
            product.buyingPrice < 0 ||
            product.sellingPrice < 0
        ) {
            alert("Please fill in all product details correctly.");
            return;
        }

        products.push(product);

        saveProducts();
        displayProducts();
        updateInventorySummary();

        productForm.reset();

        alert("Product added successfully!");
    });
}

// Delete product
function deleteProduct(index) {
    const confirmDelete = confirm("Are you sure you want to delete this product?");

    if (!confirmDelete) return;

    products.splice(index, 1);

    saveProducts();
    displayProducts();
    updateInventorySummary();
}

// Search products
const searchInput = document.getElementById("product-search");

if (searchInput) {
    searchInput.addEventListener("input", function () {
        const searchText = searchInput.value.toLowerCase();

        const filteredProducts = products.filter(function (product) {
            return (
                product.name.toLowerCase().includes(searchText) ||
                product.category.toLowerCase().includes(searchText)
            );
        });

        displayProducts(filteredProducts);
    });
}

// Inventory summary
function updateInventorySummary() {
    const totalProducts = document.getElementById("inventory-total-products");
    const totalStock = document.getElementById("inventory-total-stock");
    const stockValue = document.getElementById("inventory-stock-value");

    if (!totalProducts || !totalStock || !stockValue) return;

    let stockQuantity = 0;
    let totalValue = 0;

    products.forEach(function (product) {
        const quantity = Number(product.quantity) || 0;
        const buyingPrice = Number(product.buyingPrice) || 0;

        stockQuantity += quantity;
        totalValue += quantity * buyingPrice;
    });

    totalProducts.textContent = products.length;
    totalStock.textContent = stockQuantity;
    stockValue.textContent = `KES ${totalValue.toLocaleString()}`;
}

displayProducts();
updateInventorySummary();


// ===============================
// SALES MANAGEMENT
// ===============================

let currentSale = [];
let sales = JSON.parse(localStorage.getItem("sales")) || [];

// Load products into Sales dropdown
function loadProductsIntoSale() {
    const saleProduct = document.getElementById("sale-product");

    if (!saleProduct) return;

    saleProduct.innerHTML = `
        <option value="">Select a product</option>
    `;

    products.forEach(function (product, index) {
        if (Number(product.quantity) > 0) {
            saleProduct.innerHTML += `
                <option value="${index}">
                    ${product.name} - KES ${Number(product.sellingPrice).toLocaleString()}
                    (Stock: ${product.quantity})
                </option>
            `;
        }
    });
}

// Add product to sale
const addToSaleBtn = document.getElementById("add-to-sale-btn");

if (addToSaleBtn) {
    addToSaleBtn.addEventListener("click", function () {
        const productIndex = document.getElementById("sale-product").value;
        const quantity = Number(document.getElementById("sale-quantity").value);

        if (productIndex === "" || quantity <= 0) {
            alert("Please select a product and enter a valid quantity.");
            return;
        }

        const product = products[Number(productIndex)];

        if (quantity > Number(product.quantity)) {
            alert("Not enough stock available.");
            return;
        }

        const existingItem = currentSale.find(function (item) {
            return item.productIndex === Number(productIndex);
        });

        if (existingItem) {
            if (existingItem.quantity + quantity > Number(product.quantity)) {
                alert("Not enough stock available.");
                return;
            }

            existingItem.quantity += quantity;
        } else {
            currentSale.push({
                productIndex: Number(productIndex),
                name: product.name,
                price: Number(product.sellingPrice),
                quantity: quantity
            });
        }

        displayCurrentSale();

        document.getElementById("sale-product").value = "";
        document.getElementById("sale-quantity").value = "";
    });
}

// Display current sale
function displayCurrentSale() {
    const saleTableBody = document.getElementById("sale-table-body");
    const saleTotal = document.getElementById("sale-total");

    if (!saleTableBody || !saleTotal) return;

    saleTableBody.innerHTML = "";

    let total = 0;

    currentSale.forEach(function (item, index) {
        const itemTotal = Number(item.price) * Number(item.quantity);

        total += itemTotal;

        saleTableBody.innerHTML += `
            <tr>
                <td>${item.name}</td>
                <td>KES ${Number(item.price).toLocaleString()}</td>
                <td>${item.quantity}</td>
                <td>KES ${itemTotal.toLocaleString()}</td>
                <td>
                    <button class="remove-sale-btn"
                        onclick="removeSaleItem(${index})">
                        Remove
                    </button>
                </td>
            </tr>
        `;
    });

    saleTotal.textContent = `KES ${total.toLocaleString()}`;
}

// Remove sale item
function removeSaleItem(index) {
    currentSale.splice(index, 1);
    displayCurrentSale();
}

// Complete sale
const completeSaleBtn = document.getElementById("complete-sale-btn");

if (completeSaleBtn) {
    completeSaleBtn.addEventListener("click", function () {

        if (currentSale.length === 0) {
            alert("Please add products to the sale first.");
            return;
        }

        let total = 0;

        // Reduce product stock
        currentSale.forEach(function (item) {
            products[item.productIndex].quantity -= item.quantity;
            total += item.price * item.quantity;
        });

        // Save updated products
        saveProducts();

        // Create completed sale
        const completedSale = {
            date: new Date().toLocaleString(),
            items: currentSale.map(function (item) {
                return {
                    productIndex: item.productIndex,
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity
                };
            }),
            total: total
        };

        // Save sale
        sales.push(completedSale);
        localStorage.setItem("sales", JSON.stringify(sales));

        // Show receipt BEFORE clearing current sale
        displayReceipt(completedSale);

        // Clear current sale
        currentSale = [];

        // Refresh everything
        displayCurrentSale();
        displaySalesHistory();
        loadProductsIntoSale();

        alert("Sale completed successfully!");
    });
}

// Display sales history
function displaySalesHistory() {
    const historyBody = document.getElementById("sales-history-body");

    if (!historyBody) return;

    historyBody.innerHTML = "";

    sales.forEach(function (sale) {
        const itemsText = sale.items
            .map(function (item) {
                return `${item.name} (${item.quantity})`;
            })
            .join(", ");

        historyBody.innerHTML += `
            <tr>
                <td>${sale.date}</td>
                <td>${itemsText}</td>
                <td>KES ${Number(sale.total).toLocaleString()}</td>
            </tr>
        `;
    });
}

loadProductsIntoSale();
displayCurrentSale();
displaySalesHistory();


// ===============================
// EMPLOYEE MANAGEMENT
// ===============================

let employees = JSON.parse(localStorage.getItem("employees")) || [];

function saveEmployees() {
    localStorage.setItem("employees", JSON.stringify(employees));
}

function displayEmployees(employeeList = employees) {
    const employeeTableBody = document.getElementById("employee-table-body");

    if (!employeeTableBody) return;

    employeeTableBody.innerHTML = "";

    employeeList.forEach(function (employee, index) {
        employeeTableBody.innerHTML += `
            <tr>
                <td>${employee.name}</td>
                <td>${employee.phone}</td>
                <td>${employee.role}</td>
                <td>KES ${Number(employee.salary).toLocaleString()}</td>
                <td>${employee.date}</td>
                <td>${employee.status}</td>
                <td>
                    <button class="delete-btn"
                        onclick="deleteEmployee(${index})">
                        Delete
                    </button>
                </td>
            </tr>
        `;
    });
}

const employeeForm = document.getElementById("employee-form");

if (employeeForm) {
    employeeForm.addEventListener("submit", function (event) {
        event.preventDefault();

        employees.push({
            name: document.getElementById("employee-name").value,
            phone: document.getElementById("employee-phone").value,
            role: document.getElementById("employee-role").value,
            salary: Number(document.getElementById("employee-salary").value),
            date: document.getElementById("employee-date").value,
            status: document.getElementById("employee-status").value
        });

        saveEmployees();
        displayEmployees();

        employeeForm.reset();
    });
}

function deleteEmployee(index) {
    employees.splice(index, 1);

    saveEmployees();
    displayEmployees();
}

const employeeSearch = document.getElementById("employee-search");

if (employeeSearch) {
    employeeSearch.addEventListener("input", function () {
        const searchText = employeeSearch.value.toLowerCase();

        const filteredEmployees = employees.filter(function (employee) {
            return (
                employee.name.toLowerCase().includes(searchText) ||
                employee.role.toLowerCase().includes(searchText)
            );
        });

        displayEmployees(filteredEmployees);
    });
}

displayEmployees();


// ===============================
// CUSTOMER MANAGEMENT
// ===============================

let customers = JSON.parse(localStorage.getItem("customers")) || [];

function saveCustomers() {
    localStorage.setItem("customers", JSON.stringify(customers));
}

function displayCustomers(customerList = customers) {
    const customerTableBody = document.getElementById("customer-table-body");

    if (!customerTableBody) return;

    customerTableBody.innerHTML = "";

    customerList.forEach(function (customer, index) {
        customerTableBody.innerHTML += `
            <tr>
                <td>${customer.name}</td>
                <td>${customer.phone}</td>
                <td>${customer.email || "-"}</td>
                <td>${customer.address || "-"}</td>
                <td>
                    <button class="delete-btn"
                        onclick="deleteCustomer(${index})">
                        Delete
                    </button>
                </td>
            </tr>
        `;
    });
}

const customerForm = document.getElementById("customer-form");

if (customerForm) {
    customerForm.addEventListener("submit", function (event) {
        event.preventDefault();

        customers.push({
            name: document.getElementById("customer-name").value,
            phone: document.getElementById("customer-phone").value,
            email: document.getElementById("customer-email").value,
            address: document.getElementById("customer-address").value
        });

        saveCustomers();
        displayCustomers();

        customerForm.reset();
    });
}

function deleteCustomer(index) {
    customers.splice(index, 1);

    saveCustomers();
    displayCustomers();
}

const customerSearch = document.getElementById("customer-search");

if (customerSearch) {
    customerSearch.addEventListener("input", function () {
        const searchText = customerSearch.value.toLowerCase();

        const filteredCustomers = customers.filter(function (customer) {
            return (
                customer.name.toLowerCase().includes(searchText) ||
                customer.phone.toLowerCase().includes(searchText) ||
                (customer.email &&
                    customer.email.toLowerCase().includes(searchText))
            );
        });

        displayCustomers(filteredCustomers);
    });
}

displayCustomers();


// ===============================
// FINANCE MANAGEMENT
// ===============================

let expenses = JSON.parse(localStorage.getItem("expenses")) || [];

function saveExpenses() {
    localStorage.setItem("expenses", JSON.stringify(expenses));
}

function getTotalSalesIncome() {
    return sales.reduce(function (total, sale) {
        return total + Number(sale.total);
    }, 0);
}

function getTotalExpenses() {
    return expenses.reduce(function (total, expense) {
        return total + Number(expense.amount);
    }, 0);
}

function displayFinanceSummary() {
    const incomeElement = document.getElementById("finance-income");
    const expensesElement = document.getElementById("finance-expenses");
    const profitElement = document.getElementById("finance-profit");

    if (!incomeElement || !expensesElement || !profitElement) return;

    const income = getTotalSalesIncome();
    const totalExpenses = getTotalExpenses();
    const profit = income - totalExpenses;

    incomeElement.textContent = `KES ${income.toLocaleString()}`;
    expensesElement.textContent = `KES ${totalExpenses.toLocaleString()}`;
    profitElement.textContent = `KES ${profit.toLocaleString()}`;
}

function displayExpenses(expenseList = expenses) {
    const expenseTableBody = document.getElementById("expense-table-body");

    if (!expenseTableBody) return;

    expenseTableBody.innerHTML = "";

    expenseList.forEach(function (expense, index) {
        expenseTableBody.innerHTML += `
            <tr>
                <td>${expense.description}</td>
                <td>${expense.category}</td>
                <td>KES ${Number(expense.amount).toLocaleString()}</td>
                <td>${expense.date}</td>
                <td>
                    <button class="delete-btn"
                        onclick="deleteExpense(${index})">
                        Delete
                    </button>
                </td>
            </tr>
        `;
    });
}

const expenseForm = document.getElementById("expense-form");

if (expenseForm) {
    expenseForm.addEventListener("submit", function (event) {
        event.preventDefault();

        expenses.push({
            description: document.getElementById("expense-description").value,
            category: document.getElementById("expense-category").value,
            amount: Number(document.getElementById("expense-amount").value),
            date: document.getElementById("expense-date").value
        });

        saveExpenses();
        displayExpenses();
        displayFinanceSummary();

        expenseForm.reset();
    });
}

function deleteExpense(index) {
    expenses.splice(index, 1);

    saveExpenses();
    displayExpenses();
    displayFinanceSummary();
}

const expenseSearch = document.getElementById("expense-search");

if (expenseSearch) {
    expenseSearch.addEventListener("input", function () {
        const searchText = expenseSearch.value.toLowerCase();

        const filteredExpenses = expenses.filter(function (expense) {
            return (
                expense.description.toLowerCase().includes(searchText) ||
                expense.category.toLowerCase().includes(searchText)
            );
        });

        displayExpenses(filteredExpenses);
    });
}

displayExpenses();
displayFinanceSummary();


// ===============================
// LOGOUT
// ===============================

const logoutButtons = document.querySelectorAll(".logout-btn");

logoutButtons.forEach(function (button) {
    button.addEventListener("click", function () {
        localStorage.removeItem("livanderLoggedIn");
        window.location.href = "login.html";
    });
});

// ===============================
// REPORTS MANAGEMENT
// ===============================

function displayReports() {
    const reportSales = document.getElementById("report-sales");
    const reportExpenses = document.getElementById("report-expenses");
    const reportProfit = document.getElementById("report-profit");
    const reportProducts = document.getElementById("report-products");
    const reportEmployees = document.getElementById("report-employees");
    const reportCustomers = document.getElementById("report-customers");
    const reportSalesBody = document.getElementById("report-sales-body");

    // Stop if we are not on the Reports page
    if (!reportSales) return;

    const totalIncome = getTotalSalesIncome();
    const totalExpenses = getTotalExpenses();
    const netProfit = totalIncome - totalExpenses;

    // Update report cards
    reportSales.textContent = `KES ${totalIncome.toLocaleString()}`;
    reportExpenses.textContent = `KES ${totalExpenses.toLocaleString()}`;
    reportProfit.textContent = `KES ${netProfit.toLocaleString()}`;

    reportProducts.textContent = products.length;
    reportEmployees.textContent = employees.length;
    reportCustomers.textContent = customers.length;

    // Display sales history
    if (reportSalesBody) {
        reportSalesBody.innerHTML = "";

        sales.forEach(function (sale) {
            const itemsText = sale.items
                .map(function (item) {
                    return `${item.name} (${item.quantity})`;
                })
                .join(", ");

            reportSalesBody.innerHTML += `
                <tr>
                    <td>${sale.date}</td>
                    <td>${itemsText}</td>
                    <td>KES ${Number(sale.total).toLocaleString()}</td>
                </tr>
            `;
        });
    }
}

// Load reports when Reports page opens
displayReports();

// ===============================
// DASHBOARD MANAGEMENT
// ===============================

function displayDashboard() {
    const totalProductsElement = document.getElementById("total-products");
    const totalSalesElement = document.getElementById("total-sales");
    const totalEmployeesElement = document.getElementById("total-employees");
    const totalProfitElement = document.getElementById("total-profit");

    // Stop if we are not on the Dashboard
    if (!totalProductsElement) return;

    const totalIncome = getTotalSalesIncome();
    const totalExpenses = getTotalExpenses();
    const profit = totalIncome - totalExpenses;

    totalProductsElement.textContent = products.length;
    totalSalesElement.textContent = `KES ${totalIncome.toLocaleString()}`;
    totalEmployeesElement.textContent = employees.length;
    totalProfitElement.textContent = `KES ${profit.toLocaleString()}`;
}

// Load Dashboard data
displayDashboard();

// ===============================
// SALES RECEIPT
// ===============================

function displayReceipt(sale) {
    const receipt = document.getElementById("sale-receipt");

    if (!receipt) return;

    let itemsHTML = "";

    sale.items.forEach(function (item) {
        const itemTotal = item.price * item.quantity;

        itemsHTML += `
            <tr>
                <td>${item.name}</td>
                <td>${item.quantity}</td>
                <td>KES ${item.price.toLocaleString()}</td>
                <td>KES ${itemTotal.toLocaleString()}</td>
            </tr>
        `;
    });

    receipt.innerHTML = `
        <div class="receipt">
            <div class="receipt-header">
                <h2>LIVANDER STORE</h2>
                <p>Business Management</p>
                <p>Sales Receipt</p>
            </div>

            <div class="receipt-info">
                <p><strong>Date:</strong> ${sale.date}</p>
            </div>

            <table>
                <thead>
                    <tr>
                        <th>Product</th>
                        <th>Qty</th>
                        <th>Price</th>
                        <th>Total</th>
                    </tr>
                </thead>

                <tbody>
                    ${itemsHTML}
                </tbody>
            </table>

            <div class="receipt-total">
                <strong>TOTAL: KES ${sale.total.toLocaleString()}</strong>
            </div>

            <p class="receipt-thank-you">
                Thank you for shopping with Livander Store!
            </p>

            <button class="primary-btn" onclick="printReceipt()">
                🖨️ Print Receipt
            </button>
        </div>
    `;

    receipt.style.display = "block";

    receipt.scrollIntoView({
        behavior: "smooth"
    });
}

// Print receipt
function printReceipt() {
    const receipt = document.getElementById("sale-receipt");

    if (!receipt) return;

    const printWindow = window.open("", "_blank");

    printWindow.document.write(`
        <html>
        <head>
            <title>Livander Store Receipt</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    padding: 30px;
                }

                .receipt {
                    max-width: 600px;
                    margin: auto;
                }

                .receipt-header {
                    text-align: center;
                }

                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-top: 20px;
                }

                th, td {
                    padding: 10px;
                    border-bottom: 1px solid #ddd;
                    text-align: left;
                }

                .receipt-total {
                    text-align: right;
                    margin-top: 20px;
                    font-size: 20px;
                }

                .receipt-thank-you {
                    text-align: center;
                    margin-top: 30px;
                }

                button {
                    display: none;
                }
            </style>
        </head>

        <body>
            ${receipt.innerHTML}
        </body>
        </html>
    `);

    printWindow.document.close();
    printWindow.print();
}

// ===============================
// CASH RECEIVED & CHANGE
// ===============================

const cashReceivedInput = document.getElementById("cash-received");
const saleChangeElement = document.getElementById("sale-change");

function updateSaleChange() {
    if (!cashReceivedInput || !saleChangeElement) return;

    const cashReceived = Number(cashReceivedInput.value) || 0;
    const totalText = document.getElementById("sale-total")?.textContent || "0";

    const total = Number(
        totalText.replace("KES", "").replace(/,/g, "").trim()
    ) || 0;

    const change = cashReceived - total;

    if (cashReceived === 0) {
        saleChangeElement.textContent = "KES 0";
    } else if (change < 0) {
        saleChangeElement.textContent =
            `KES ${Math.abs(change).toLocaleString()} still needed`;
    } else {
        saleChangeElement.textContent =
            `KES ${change.toLocaleString()}`;
    }
}

if (cashReceivedInput) {
    cashReceivedInput.addEventListener("input", updateSaleChange);
}

// ===============================
// LOGIN MANAGEMENT
// ===============================

const loginForm = document.getElementById("login-form");

if (loginForm) {
    loginForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const username = document.getElementById("login-username").value.trim();
        const password = document.getElementById("login-password").value;

        const loginMessage = document.getElementById("login-message");

        // Livander default login
        if (username === "admin" && password === "1234") {
            localStorage.setItem("livanderLoggedIn", "true");

            window.location.href = "index.html";
        } else {
            loginMessage.textContent = "Invalid username or password.";
            loginMessage.style.color = "#dc2626";
        }
    });
}

