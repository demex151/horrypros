// ==================== SUPABASE CONFIG (OPTIONAL) ====================
const supabaseClient = initSupabase();
const supabaseEnabledFlag = !!supabaseClient;

// ==================== DATA MANAGEMENT ====================
class AccountingApp {
  constructor() {
    this.supabase = supabaseClient;
    this.supabaseEnabled = supabaseEnabledFlag;

    this.transactions = [];
    this.categories = this.initializeDefaultCategories();
    this.clients = [];
    this.quotes = [];
    this.employees = [];
    this.workHours = [];
    this.settings = {
      businessName: 'Gevers Painting Account',
      currency: 'USD',
      fiscalYear: new Date().getFullYear()
    };
    this.currentPage = 'dashboard';
    this.init();
  }

  initializeDefaultCategories() {
    return [
      { id: 1, name: 'Sales', type: 'income' },
      { id: 2, name: 'Services', type: 'income' },
      { id: 3, name: 'Salaries', type: 'expense' },
      { id: 4, name: 'Rent', type: 'expense' },
      { id: 5, name: 'Utilities', type: 'expense' },
      { id: 6, name: 'Purchases', type: 'expense' },
      { id: 7, name: 'Advertising', type: 'expense' },
      { id: 8, name: 'Other', type: 'expense' }
    ];
  }

  init() {
    this.setupEventListeners();
    this.loadData().then(() => {
      this.renderPage('dashboard');
      this.updateAllData();
    });
  }

  async loadData() {
    if (this.supabaseEnabled) {
      try {
        const { data, error } = await this.supabase
          .from('accounting_data')
          .select('*')
          .eq('id', 1)
          .single();

        if (data && !error) {
          this.transactions = data.transactions || [];
          this.categories = data.categories || this.initializeDefaultCategories();
          this.clients = data.clients || [];
          this.quotes = data.quotes || [];
          this.employees = data.employees || [];
          this.workHours = data.workHours || [];
          this.settings = data.settings || this.settings;
          return;
        }
      } catch (e) {
        // Fall back to localStorage
      }
    }

    this.transactions = JSON.parse(localStorage.getItem('transactions')) || [];
    this.categories = JSON.parse(localStorage.getItem('categories')) || this.initializeDefaultCategories();
    this.clients = JSON.parse(localStorage.getItem('clients')) || [];
    this.quotes = JSON.parse(localStorage.getItem('quotes')) || [];
    this.employees = JSON.parse(localStorage.getItem('employees')) || [];
    this.workHours = JSON.parse(localStorage.getItem('workHours')) || [];
    this.settings = JSON.parse(localStorage.getItem('settings')) || this.settings;
  }

  setupEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const page = e.currentTarget.getAttribute('data-page');
        this.renderPage(page);
      });
    });

    // Transaction form
    const transactionForm = document.getElementById('transaction-form');
    if (transactionForm) {
      transactionForm.addEventListener('submit', (e) => this.handleAddTransaction(e));
    }

    // Client form
    const clientForm = document.getElementById('client-form');
    if (clientForm) {
      clientForm.addEventListener('submit', (e) => this.handleAddClient(e));
    }

    // Quote form
    const quoteForm = document.getElementById('quote-form');
    if (quoteForm) {
      quoteForm.addEventListener('submit', (e) => this.handleAddQuote(e));
    }

    // Category form
    const categoryForm = document.getElementById('category-form');
    if (categoryForm) {
      categoryForm.addEventListener('submit', (e) => this.handleAddCategory(e));
    }

    // Employee form
    const employeeForm = document.getElementById('employee-form');
    if (employeeForm) {
      employeeForm.addEventListener('submit', (e) => this.handleAddEmployee(e));
    }

    // Settings form
    const settingsForm = document.getElementById('settings-form');
    if (settingsForm) {
      settingsForm.addEventListener('submit', (e) => this.handleSaveSettings(e));
    }

    // Filter controls
    document.getElementById('filter-type')?.addEventListener('change', () => this.renderTransactionsTable());
    document.getElementById('filter-category')?.addEventListener('change', () => this.renderTransactionsTable());
    document.getElementById('search-transaction')?.addEventListener('input', () => this.renderTransactionsTable());
    document.getElementById('search-client')?.addEventListener('input', () => this.renderClientsTable());
    document.getElementById('filter-client-type')?.addEventListener('change', () => this.renderClientsTable());
    document.getElementById('filter-quote-status')?.addEventListener('change', () => this.renderQuotesTable());
    document.getElementById('filter-quote-client')?.addEventListener('change', () => this.renderQuotesTable());
    document.getElementById('search-quote')?.addEventListener('input', () => this.renderQuotesTable());
    document.getElementById('search-employee')?.addEventListener('input', () => this.renderEmployeesTable());
    document.getElementById('filter-employee-status')?.addEventListener('change', () => this.renderEmployeesTable());
    document.getElementById('report-month')?.addEventListener('change', () => this.renderMonthlyReport());

    // Export and clear buttons
    document.getElementById('export-btn')?.addEventListener('click', () => this.exportData());
    document.getElementById('clear-btn')?.addEventListener('click', () => this.clearAllData());

    // Modal buttons
    document.getElementById('confirm-delete')?.addEventListener('click', () => this.confirmDelete());
    document.getElementById('cancel-delete')?.addEventListener('click', () => this.closeDeleteModal());
  }

  renderPage(pageId) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
    
    // Show selected page
    const page = document.getElementById(pageId);
    if (page) page.classList.add('active');

    // Update active button
    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.classList.remove('active');
      if (btn.getAttribute('data-page') === pageId) btn.classList.add('active');
    });

    this.currentPage = pageId;

    // Render page-specific content
    if (pageId === 'dashboard') {
      this.renderDashboard();
    } else if (pageId === 'clients') {
      this.renderClientsPage();
    } else if (pageId === 'employees') {
      this.renderEmployeesPage();
    } else if (pageId === 'transactions') {
      this.renderTransactionsPage();
    } else if (pageId === 'quotes') {
      this.renderQuotesPage();
    } else if (pageId === 'categories') {
      this.renderCategoriesPage();
    } else if (pageId === 'reports') {
      this.renderReportsPage();
    } else if (pageId === 'settings') {
      this.renderSettingsPage();
    }
  }

  handleAddTransaction(e) {
    e.preventDefault();
    const transaction = {
      id: Date.now(),
      description: document.getElementById('description').value,
      amount: parseFloat(document.getElementById('amount').value),
      type: document.getElementById('type').value,
      category: document.getElementById('category').value,
      client: document.getElementById('transaction-client').value || null,
      date: document.getElementById('date').value,
      note: document.getElementById('note').value
    };

    this.transactions.push(transaction);
    this.saveData();
    this.updateAllData();
    e.target.reset();
    document.getElementById('date').valueAsDate = new Date();
    alert('Transaction registered successfully!');
  }

  handleAddCategory(e) {
    e.preventDefault();
    const category = {
      id: Date.now(),
      name: document.getElementById('category-name').value,
      type: document.getElementById('category-type').value
    };

    this.categories.push(category);
    this.saveData();
    this.updateAllData();
    e.target.reset();
    alert('Category added successfully!');
  }

  handleAddClient(e) {
    e.preventDefault();
    const client = {
      id: Date.now(),
      name: document.getElementById('client-name').value,
      email: document.getElementById('client-email').value,
      phone: document.getElementById('client-phone').value,
      company: document.getElementById('client-company').value,
      address: document.getElementById('client-address').value,
      city: document.getElementById('client-city').value,
      zip: document.getElementById('client-zip').value,
      country: document.getElementById('client-country').value,
      type: document.getElementById('client-type').value,
      note: document.getElementById('client-note').value,
      createdAt: new Date().toISOString()
    };

    this.clients.push(client);
    this.saveData();
    this.updateAllData();
    e.target.reset();
    alert('Client added successfully!');
  }

  handleAddQuote(e) {
    e.preventDefault();
    const quote = {
      id: Date.now(),
      number: document.getElementById('quote-number').value,
      client: document.getElementById('quote-client').value,
      description: document.getElementById('quote-description').value,
      amount: parseFloat(document.getElementById('quote-amount').value),
      date: document.getElementById('quote-date').value,
      expiry: document.getElementById('quote-expiry').value,
      status: document.getElementById('quote-status').value,
      note: document.getElementById('quote-note').value,
      createdAt: new Date().toISOString()
    };

    this.quotes.push(quote);
    this.saveData();
    this.updateAllData();
    e.target.reset();
    alert('Quote created successfully!');
  }

  handleSaveSettings(e) {
    e.preventDefault();
    this.settings = {
      businessName: document.getElementById('business-name').value,
      currency: document.getElementById('currency').value,
      fiscalYear: parseInt(document.getElementById('fiscal-year').value)
    };
    this.saveData();
    alert('Settings saved!');
  }

  saveData() {
    localStorage.setItem('transactions', JSON.stringify(this.transactions));
    localStorage.setItem('categories', JSON.stringify(this.categories));
    localStorage.setItem('clients', JSON.stringify(this.clients));
    localStorage.setItem('quotes', JSON.stringify(this.quotes));
    localStorage.setItem('employees', JSON.stringify(this.employees));
    localStorage.setItem('workHours', JSON.stringify(this.workHours));
    localStorage.setItem('settings', JSON.stringify(this.settings));

    if (this.supabaseEnabled) {
      const payload = {
        id: 1,
        transactions: this.transactions,
        categories: this.categories,
        clients: this.clients,
        quotes: this.quotes,
        employees: this.employees,
        workHours: this.workHours,
        settings: this.settings,
        updatedAt: new Date().toISOString()
      };
      this.supabase
        .from('accounting_data')
        .upsert(payload)
        .catch(() => {
          // Silent fail to avoid disrupting the app
        });
    }
  }

  // ==================== DASHBOARD ====================
  renderDashboard() {
    const totalIncome = this.calculateTotal('income');
    const totalExpense = this.calculateTotal('expense');
    const netBalance = totalIncome - totalExpense;

    document.getElementById('total-income').textContent = this.formatCurrency(totalIncome);
    document.getElementById('total-expense').textContent = this.formatCurrency(totalExpense);
    document.getElementById('net-balance').textContent = this.formatCurrency(netBalance);

    this.renderRecentTransactions();
  }

  renderRecentTransactions() {
    const container = document.getElementById('recent-transactions');
    const recent = this.transactions.slice(-10).reverse();

    if (recent.length === 0) {
      container.innerHTML = '<p class="empty-state">No transactions recorded</p>';
      return;
    }

    const html = recent.map(t => {
      const category = this.categories.find(c => c.id == t.category);
      const categoryName = category ? category.name : 'No category';
      const className = t.type === 'income' ? 'income' : 'expense';
      const sign = t.type === 'income' ? '+' : '-';
      return `
        <div class="transaction-item ${className}">
          <div class="transaction-info">
            <div class="transaction-desc">${t.description}</div>
            <div class="transaction-meta">${categoryName} • ${new Date(t.date).toLocaleDateString()}</div>
          </div>
          <div class="transaction-amount">${sign}${this.formatCurrency(t.amount)}</div>
        </div>
      `;
    }).join('');

    container.innerHTML = html;
  }

  // ==================== TRANSACTIONS ====================
  renderTransactionsPage() {
    this.updateCategorySelect('category');
    this.updateClientSelect('transaction-client');
    this.updateCategorySelect('filter-category', true);
    document.getElementById('date').valueAsDate = new Date();
    this.renderTransactionsTable();
  }

  updateCategorySelect(selectId, includeAll = false) {
    const select = document.getElementById(selectId);
    const currentValue = select.value;
    
    let options = includeAll ? '<option value="">Todas las categorías</option>' : '<option value="">Seleccionar categoría</option>';
    
    this.categories.forEach(cat => {
      options += `<option value="${cat.id}">${cat.name} (${cat.type === 'income' ? 'Ingreso' : 'Gasto'})</option>`;
    });

    select.innerHTML = options;
    if (currentValue) select.value = currentValue;
  }

  updateClientSelect(selectId) {
    const select = document.getElementById(selectId);
    const currentValue = select.value;
    
    let options = '<option value="">Sin cliente</option>';
    
    this.clients.forEach(client => {
      options += `<option value="${client.id}">${client.name}</option>`;
    });

    select.innerHTML = options;
    if (currentValue) select.value = currentValue;
  }

  renderTransactionsTable() {
    const container = document.getElementById('transactions-table');
    let transactions = this.transactions;

    // Apply filters
    const filterType = document.getElementById('filter-type')?.value;
    const filterCategory = document.getElementById('filter-category')?.value;
    const searchTerm = document.getElementById('search-transaction')?.value.toLowerCase();

    if (filterType) transactions = transactions.filter(t => t.type === filterType);
    if (filterCategory) transactions = transactions.filter(t => t.category == filterCategory);
    if (searchTerm) transactions = transactions.filter(t => t.description.toLowerCase().includes(searchTerm));

    transactions = transactions.sort((a, b) => new Date(b.date) - new Date(a.date));

    if (transactions.length === 0) {
      container.innerHTML = '<p class="empty-state">No transactions match the filters</p>';
      return;
    }

    const html = transactions.map(t => {
      const category = this.categories.find(c => c.id == t.category);
      const categoryName = category ? category.name : 'No category';
      const className = t.type === 'income' ? 'income' : 'expense';
      const sign = t.type === 'income' ? '+' : '-';
      return `
        <div class="transaction-row ${className}">
          <div class="transaction-cell date">${new Date(t.date).toLocaleDateString()}</div>
          <div class="transaction-cell desc">${t.description}</div>
          <div class="transaction-cell category">${categoryName}</div>
          <div class="transaction-cell amount">${sign}${this.formatCurrency(t.amount)}</div>
          <div class="transaction-cell actions">
            <button class="btn-edit" onclick="app.editTransaction(${t.id})">✏️</button>
            <button class="btn-delete" onclick="app.deleteTransaction(${t.id})">🗑️</button>
          </div>
        </div>
      `;
    }).join('');

    container.innerHTML = html;
  }

  deleteTransaction(id) {
    this.deleteId = id;
    document.getElementById('delete-modal').classList.add('active');
  }

  confirmDelete() {
    this.transactions = this.transactions.filter(t => t.id !== this.deleteId);
    this.saveData();
    this.updateAllData();
    this.closeDeleteModal();
    alert('Transacción eliminada');
  }

  closeDeleteModal() {
    document.getElementById('delete-modal').classList.remove('active');
  }

  editTransaction(id) {
    const transaction = this.transactions.find(t => t.id === id);
    if (!transaction) return;

    document.getElementById('description').value = transaction.description;
    document.getElementById('amount').value = transaction.amount;
    document.getElementById('type').value = transaction.type;
    document.getElementById('category').value = transaction.category;
    document.getElementById('date').value = transaction.date;
    document.getElementById('note').value = transaction.note;

    this.transactions = this.transactions.filter(t => t.id !== id);
    this.saveData();
    this.renderPage('transactions');
    alert('Transaction opened for editing. Save the changes as a new transaction.');
  }

  // ==================== CLIENTS ====================
  renderClientsPage() {
    this.renderClientsTable();
  }

  renderClientsTable() {
    const container = document.getElementById('clients-table');
    let clients = this.clients;

    // Apply filters
    const searchTerm = document.getElementById('search-client')?.value.toLowerCase();
    const filterType = document.getElementById('filter-client-type')?.value;

    if (searchTerm) clients = clients.filter(c => c.name.toLowerCase().includes(searchTerm) || c.email.toLowerCase().includes(searchTerm));
    if (filterType) clients = clients.filter(c => c.type === filterType);

    clients = clients.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    if (clients.length === 0) {
      container.innerHTML = '<p class="empty-state">No clients match the filters</p>';
      return;
    }

    const html = clients.map(c => {
      const typeLabel = c.type === 'personal' ? 'Personal' : c.type === 'business' ? 'Business' : 'Wholesale';
      return `
        <div class="client-card">
          <div class="client-header">
            <h4>${c.name}</h4>
            <span class="client-type">${typeLabel}</span>
          </div>
          <div class="client-details">
            <p><strong>Email:</strong> ${c.email || 'N/A'}</p>
            <p><strong>Phone:</strong> ${c.phone || 'N/A'}</p>
            <p><strong>Company:</strong> ${c.company || 'N/A'}</p>
            <p><strong>Address:</strong> ${c.address || 'N/A'}</p>
            <p><strong>City:</strong> ${c.city || 'N/A'} ${c.zip ? `(${c.zip})` : ''}</p>
            <p><strong>Country:</strong> ${c.country || 'N/A'}</p>
            ${c.note ? `<p><strong>Note:</strong> ${c.note}</p>` : ''}
          </div>
          <div class="client-actions">
            <button class="btn-edit" onclick="app.editClient(${c.id})">✏️ Edit</button>
            <button class="btn-delete" onclick="app.deleteClient(${c.id})">🗑️ Delete</button>
          </div>
        </div>
      `;
    }).join('');

    container.innerHTML = html;
  }

  deleteClient(id) {
    if (confirm('Delete this client? Associated quotes will also be deleted.')) {
      this.clients = this.clients.filter(c => c.id !== id);
      this.quotes = this.quotes.filter(q => q.client != id);
      this.saveData();
      this.updateAllData();
      alert('Client deleted');
    }
  }

  editClient(id) {
    const client = this.clients.find(c => c.id === id);
    if (!client) return;

    document.getElementById('client-name').value = client.name;
    document.getElementById('client-email').value = client.email;
    document.getElementById('client-phone').value = client.phone;
    document.getElementById('client-company').value = client.company;
    document.getElementById('client-address').value = client.address;
    document.getElementById('client-city').value = client.city;
    document.getElementById('client-zip').value = client.zip;
    document.getElementById('client-country').value = client.country;
    document.getElementById('client-type').value = client.type;
    document.getElementById('client-note').value = client.note;

    this.clients = this.clients.filter(c => c.id !== id);
    this.saveData();
    this.renderPage('clients');
    alert('Client opened for editing. Save the changes as a new client.');
  }

  // ==================== QUOTES ====================
  renderQuotesPage() {
    this.updateClientSelect('quote-client');
    this.updateClientSelect('filter-quote-client');
    document.getElementById('quote-date').valueAsDate = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 30);
    document.getElementById('quote-expiry').valueAsDate = tomorrow;
    this.renderQuotesTable();
  }

  renderQuotesTable() {
    const container = document.getElementById('quotes-table');
    let quotes = this.quotes;

    // Apply filters
    const filterStatus = document.getElementById('filter-quote-status')?.value;
    const filterClient = document.getElementById('filter-quote-client')?.value;
    const searchTerm = document.getElementById('search-quote')?.value.toLowerCase();

    if (filterStatus) quotes = quotes.filter(q => q.status === filterStatus);
    if (filterClient) quotes = quotes.filter(q => q.client == filterClient);
    if (searchTerm) quotes = quotes.filter(q => q.number.toLowerCase().includes(searchTerm) || q.description.toLowerCase().includes(searchTerm));

    quotes = quotes.sort((a, b) => new Date(b.date) - new Date(a.date));

    if (quotes.length === 0) {
      container.innerHTML = '<p class="empty-state">No quotes match the filters</p>';
      return;
    }

    const html = quotes.map(q => {
      const client = this.clients.find(c => c.id == q.client);
      const clientName = client ? client.name : 'Client not found';
      const statusLabel = q.status === 'pending' ? 'Pending' : q.status === 'accepted' ? 'Accepted' : q.status === 'rejected' ? 'Rejected' : 'Expired';
      const statusClass = q.status;
      const daysLeft = Math.ceil((new Date(q.expiry) - new Date()) / (1000 * 60 * 60 * 24));
      return `
        <div class="quote-card ${statusClass}">
          <div class="quote-header">
            <div>
              <h4>${q.number}</h4>
              <p class="quote-client">${clientName}</p>
            </div>
            <span class="quote-status ${statusClass}">${statusLabel}</span>
          </div>
          <div class="quote-body">
            <p class="quote-description">${q.description}</p>
            <div class="quote-dates">
              <span>📅 ${new Date(q.date).toLocaleDateString()}</span>
              <span>📌 Expires: ${new Date(q.expiry).toLocaleDateString()} ${daysLeft > 0 ? `(${daysLeft} days)` : '(Expired)'}</span>
            </div>
          </div>
          <div class="quote-footer">
            <div class="quote-amount">${this.formatCurrency(q.amount)}</div>
            <div class="quote-actions">
              <button class="btn-edit" onclick="app.editQuote(${q.id})">✏️</button>
              <button class="btn-delete" onclick="app.deleteQuote(${q.id})">🗑️</button>
            </div>
          </div>
        </div>
      `;
    }).join('');

    container.innerHTML = html;
  }

  deleteQuote(id) {
    this.deleteId = id;
    document.getElementById('delete-modal').classList.add('active');
  }

  editQuote(id) {
    const quote = this.quotes.find(q => q.id === id);
    if (!quote) return;

    document.getElementById('quote-number').value = quote.number;
    document.getElementById('quote-client').value = quote.client;
    document.getElementById('quote-description').value = quote.description;
    document.getElementById('quote-amount').value = quote.amount;
    document.getElementById('quote-date').value = quote.date;
    document.getElementById('quote-expiry').value = quote.expiry;
    document.getElementById('quote-status').value = quote.status;
    document.getElementById('quote-note').value = quote.note;

    this.quotes = this.quotes.filter(q => q.id !== id);
    this.saveData();
    this.renderPage('quotes');
    alert('Quote opened for editing. Save the changes as a new quote.');
  }

  // ==================== EMPLOYEES ====================
  renderEmployeesPage() {
    this.renderEmployeesTable();
  }

  renderEmployeesTable() {
    const container = document.getElementById('employees-table');
    let employees = this.employees;

    // Apply filters
    const searchTerm = document.getElementById('search-employee')?.value.toLowerCase();
    const filterStatus = document.getElementById('filter-employee-status')?.value;

    if (searchTerm) employees = employees.filter(e => e.name.toLowerCase().includes(searchTerm) || e.email.toLowerCase().includes(searchTerm));
    if (filterStatus) employees = employees.filter(e => e.status === filterStatus);

    employees = employees.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    if (employees.length === 0) {
      container.innerHTML = '<p class="empty-state">No employees match the filters</p>';
      return;
    }

    const html = employees.map(e => {
      const totalHours = this.workHours.filter(h => h.employeeId == e.id).reduce((sum, h) => sum + parseFloat(h.hours), 0);
      const totalEarnings = totalHours * e.hourlyRate;
      const statusBadge = e.status === 'active' ? '<span class="status-badge active">Active</span>' : '<span class="status-badge inactive">Inactive</span>';
      
      return `
        <div class="employee-card">
          <div class="employee-header">
            <h4>${e.name}</h4>
            ${statusBadge}
          </div>
          <div class="employee-details">
            <p><strong>Position:</strong> ${e.position || 'N/A'}</p>
            <p><strong>Phone:</strong> ${e.phone || 'N/A'}</p>
            <p><strong>Email:</strong> ${e.email || 'N/A'}</p>
            <p><strong>Hourly Rate:</strong> ${this.formatCurrency(e.hourlyRate)}</p>
            <p><strong>Start Date:</strong> ${new Date(e.startDate).toLocaleDateString()}</p>
            <div class="employee-stats">
              <div class="stat"><span class="stat-label">Total Hours</span><span class="stat-value">${totalHours.toFixed(2)}</span></div>
              <div class="stat"><span class="stat-label">Total Earnings</span><span class="stat-value">${this.formatCurrency(totalEarnings)}</span></div>
            </div>
          </div>
          <div class="employee-actions">
            <button class="btn-primary-sm" onclick="app.showHoursForm(${e.id})">⏱️ Log Hours</button>
            <button class="btn-edit" onclick="app.editEmployee(${e.id})">✏️</button>
            <button class="btn-delete" onclick="app.deleteEmployee(${e.id})">🗑️</button>
          </div>
        </div>
      `;
    }).join('');

    container.innerHTML = html;
  }

  handleAddEmployee(e) {
    e.preventDefault();
    const employee = {
      id: Date.now(),
      name: document.getElementById('employee-name').value,
      phone: document.getElementById('employee-phone').value,
      email: document.getElementById('employee-email').value,
      hourlyRate: parseFloat(document.getElementById('employee-rate').value),
      position: document.getElementById('employee-position').value,
      startDate: document.getElementById('employee-start-date').value,
      status: document.getElementById('employee-status').value,
      notes: document.getElementById('employee-notes').value,
      createdAt: new Date().toISOString()
    };

    this.employees.push(employee);
    this.saveData();
    this.updateAllData();
    e.target.reset();
    document.getElementById('employee-start-date').valueAsDate = new Date();
    alert('Employee added successfully!');
  }

  deleteEmployee(id) {
    if (confirm('Delete this employee? Associated work hours will also be deleted.')) {
      this.employees = this.employees.filter(e => e.id !== id);
      this.workHours = this.workHours.filter(h => h.employeeId != id);
      this.saveData();
      this.updateAllData();
      alert('Employee deleted');
    }
  }

  editEmployee(id) {
    const employee = this.employees.find(e => e.id === id);
    if (!employee) return;

    document.getElementById('employee-name').value = employee.name;
    document.getElementById('employee-phone').value = employee.phone;
    document.getElementById('employee-email').value = employee.email;
    document.getElementById('employee-rate').value = employee.hourlyRate;
    document.getElementById('employee-position').value = employee.position;
    document.getElementById('employee-start-date').value = employee.startDate;
    document.getElementById('employee-status').value = employee.status;
    document.getElementById('employee-notes').value = employee.notes;

    this.employees = this.employees.filter(e => e.id !== id);
    this.saveData();
    this.renderPage('employees');
    alert('Employee opened for editing. Save the changes as a new employee.');
  }

  showHoursForm(employeeId) {
    const employee = this.employees.find(e => e.id === employeeId);
    if (!employee) return;

    const today = new Date().toISOString().split('T')[0];
    const html = `
      <div class="form-card">
        <h3>Log Hours for ${employee.name}</h3>
        <form id="hours-form-${employeeId}">
          <div class="form-row">
            <div class="form-group">
              <label>Date</label>
              <input type="date" id="hours-date-${employeeId}" value="${today}" required>
            </div>
            <div class="form-group">
              <label>Hours Worked</label>
              <input type="number" id="hours-worked-${employeeId}" placeholder="8.5" step="0.25" min="0" required>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Notes</label>
              <input type="text" id="hours-notes-${employeeId}" placeholder="Project or task details">
            </div>
          </div>
          <button type="submit" class="btn-primary">Record Hours</button>
          <button type="button" class="btn-secondary" onclick="app.renderPage('employees')">Cancel</button>
        </form>
      </div>
      <div class="list-card">
        <h3>Work Hours History</h3>
        <div id="hours-history-${employeeId}" class="hours-history"></div>
      </div>
    `;
    
    document.getElementById('employee-hours-form-container').innerHTML = html;

    // Form submission
    document.getElementById(`hours-form-${employeeId}`).addEventListener('submit', (e) => {
      e.preventDefault();
      const workHour = {
        id: Date.now(),
        employeeId: employeeId,
        date: document.getElementById(`hours-date-${employeeId}`).value,
        hours: parseFloat(document.getElementById(`hours-worked-${employeeId}`).value),
        notes: document.getElementById(`hours-notes-${employeeId}`).value,
        createdAt: new Date().toISOString()
      };

      this.workHours.push(workHour);
      this.saveData();
      this.renderHoursHistory(employeeId);
      document.getElementById(`hours-form-${employeeId}`).reset();
      document.getElementById(`hours-date-${employeeId}`).valueAsDate = new Date();
      alert('Hours recorded successfully!');
    });

    this.renderHoursHistory(employeeId);
  }

  renderHoursHistory(employeeId) {
    const container = document.getElementById(`hours-history-${employeeId}`);
    const hours = this.workHours.filter(h => h.employeeId == employeeId).sort((a, b) => new Date(b.date) - new Date(a.date));

    if (hours.length === 0) {
      container.innerHTML = '<p class="empty-state">No work hours recorded</p>';
      return;
    }

    const employee = this.employees.find(e => e.id === employeeId);
    const html = hours.map(h => {
      const earnings = h.hours * employee.hourlyRate;
      return `
        <div class="hours-record">
          <div class="hours-info">
            <div class="hours-date">${new Date(h.date).toLocaleDateString()}</div>
            <div class="hours-details">
              <span class="hours-value">${h.hours} hours</span>
              ${h.notes ? `<span class="hours-notes">${h.notes}</span>` : ''}
            </div>
          </div>
          <div class="hours-earnings">${this.formatCurrency(earnings)}</div>
          <button class="btn-delete-sm" onclick="app.deleteWorkHours(${h.id})">✕</button>
        </div>
      `;
    }).join('');

    container.innerHTML = html;
  }

  deleteWorkHours(id) {
    if (confirm('Delete this work hours record?')) {
      this.workHours = this.workHours.filter(h => h.id !== id);
      this.saveData();
      this.updateAllData();
    }
  }
  renderCategoriesPage() {
    this.renderCategoriesList();
  }

  renderCategoriesList() {
    const container = document.getElementById('categories-list');
    const grouped = {};

    this.categories.forEach(cat => {
      if (!grouped[cat.type]) grouped[cat.type] = [];
      grouped[cat.type].push(cat);
    });

    if (Object.keys(grouped).length === 0) {
      container.innerHTML = '<p class="empty-state">No categories</p>';
      return;
    }

    let html = '';
    Object.entries(grouped).forEach(([type, cats]) => {
      const typeLabel = type === 'income' ? 'Income' : 'Expenses';
      html += `<div class="category-group"><h4>${typeLabel}</h4>`;
      cats.forEach(cat => {
        html += `
          <div class="category-item">
            <span>${cat.name}</span>
            <button class="btn-delete-sm" onclick="app.deleteCategory(${cat.id})">✕</button>
          </div>
        `;
      });
      html += '</div>';
    });

    container.innerHTML = html;
  }

  deleteCategory(id) {
    if (confirm('Delete this category?')) {
      this.categories = this.categories.filter(c => c.id !== id);
      this.transactions = this.transactions.filter(t => t.category != id);
      this.saveData();
      this.updateAllData();
    }
  }

  // ==================== REPORTS ====================
  renderReportsPage() {
    this.renderCategorySummary();
    document.getElementById('report-month').valueAsDate = new Date();
    this.renderMonthlyReport();
    this.renderCharts();
  }

  renderCategorySummary() {
    const container = document.getElementById('category-summary');
    const summary = {};

    this.transactions.forEach(t => {
      const catId = t.category;
      if (!summary[catId]) {
        const category = this.categories.find(c => c.id == catId);
        summary[catId] = {
          name: category ? category.name : 'Sin categoría',
          type: category ? category.type : 'unknown',
          total: 0,
          count: 0
        };
      }
      summary[catId].total += t.amount;
      summary[catId].count += 1;
    });

    if (Object.keys(summary).length === 0) {
      container.innerHTML = '<p class="empty-state">No data</p>';
      return;
    }

    const html = Object.values(summary).map(item => {
      const typeLabel = item.type === 'income' ? '📈 Income' : '📉 Expense';
      const className = item.type === 'income' ? 'income' : 'expense';
      return `
        <div class="summary-item ${className}">
          <div class="summary-info">
            <div class="summary-name">${item.name}</div>
            <div class="summary-meta">${typeLabel} • ${item.count} transactions</div>
          </div>
          <div class="summary-amount">${this.formatCurrency(item.total)}</div>
        </div>
      `;
    }).join('');

    container.innerHTML = html;
  }

  renderMonthlyReport() {
    const container = document.getElementById('monthly-summary');
    const monthInput = document.getElementById('report-month').value;
    
    if (!monthInput) {
      container.innerHTML = '<p class="empty-state">Select a month</p>';
      return;
    }

    const [year, month] = monthInput.split('-');
    const filtered = this.transactions.filter(t => {
      const tDate = new Date(t.date);
      return tDate.getFullYear() == year && (tDate.getMonth() + 1) == month;
    });

    const income = filtered.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const expense = filtered.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const balance = income - expense;

    const html = `
      <div class="summary-item income">
        <div class="summary-name">Income</div>
        <div class="summary-amount">${this.formatCurrency(income)}</div>
      </div>
      <div class="summary-item expense">
        <div class="summary-name">Expenses</div>
        <div class="summary-amount">${this.formatCurrency(expense)}</div>
      </div>
      <div class="summary-item balance">
        <div class="summary-name">Net Balance</div>
        <div class="summary-amount">${this.formatCurrency(balance)}</div>
      </div>
    `;

    container.innerHTML = html;
  }

  renderCharts() {
    // Expense chart by category
    this.renderExpenseChart();
    // Trend chart
    this.renderTrendChart();
  }

  renderExpenseChart() {
    const expenses = this.transactions.filter(t => t.type === 'expense');
    const categoryTotals = {};

    expenses.forEach(t => {
      const cat = this.categories.find(c => c.id == t.category);
      const name = cat ? cat.name : 'Sin categoría';
      categoryTotals[name] = (categoryTotals[name] || 0) + t.amount;
    });

    const ctx = document.getElementById('expense-chart');
    if (ctx.chart) ctx.chart.destroy();

    ctx.chart = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: Object.keys(categoryTotals),
        datasets: [{
          data: Object.values(categoryTotals),
          backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#C9CBCF', '#4D5360'],
          borderColor: '#fff',
          borderWidth: 2
        }]
      },
      options: { responsive: true, maintainAspectRatio: true }
    });
  }

  renderTrendChart() {
    const monthlyData = {};
    
    this.transactions.forEach(t => {
      const date = new Date(t.date);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (!monthlyData[key]) monthlyData[key] = { income: 0, expense: 0 };
      if (t.type === 'income') monthlyData[key].income += t.amount;
      else monthlyData[key].expense += t.amount;
    });

    const labels = Object.keys(monthlyData).sort();
    const incomeData = labels.map(m => monthlyData[m].income);
    const expenseData = labels.map(m => monthlyData[m].expense);

    const ctx = document.getElementById('trend-chart');
    if (ctx.chart) ctx.chart.destroy();

    ctx.chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels.map(m => {
          const [y, mo] = m.split('-');
          const date = new Date(y, mo - 1);
          return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
        }),
        datasets: [
          {
            label: 'Income',
            data: incomeData,
            borderColor: '#4CAF50',
            backgroundColor: 'rgba(76, 175, 80, 0.1)',
            tension: 0.3
          },
          {
            label: 'Expenses',
            data: expenseData,
            borderColor: '#FF6384',
            backgroundColor: 'rgba(255, 99, 132, 0.1)',
            tension: 0.3
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: { legend: { display: true } }
      }
    });
  }

  // ==================== SETTINGS ====================
  renderSettingsPage() {
    document.getElementById('business-name').value = this.settings.businessName;
    document.getElementById('currency').value = this.settings.currency;
    document.getElementById('fiscal-year').value = this.settings.fiscalYear;
  }

  // ==================== UTILITIES ====================
  calculateTotal(type) {
    return this.transactions
      .filter(t => t.type === type)
      .reduce((sum, t) => sum + t.amount, 0);
  }

  formatCurrency(amount) {
    const symbol = this.settings.currency === 'USD' ? '$' : 
                   this.settings.currency === 'EUR' ? '€' :
                   this.settings.currency === 'MXN' ? '$' : '$';
    return `${symbol}${amount.toFixed(2)}`;
  }

  updateAllData() {
    if (this.currentPage === 'dashboard') this.renderDashboard();
    else if (this.currentPage === 'clients') this.renderClientsTable();
    else if (this.currentPage === 'transactions') this.renderTransactionsTable();
    else if (this.currentPage === 'quotes') this.renderQuotesTable();
    else if (this.currentPage === 'categories') this.renderCategoriesList();
    else if (this.currentPage === 'reports') this.renderReportsPage();
  }

  exportData() {
    const data = {
      transactions: this.transactions,
      categories: this.categories,
      clients: this.clients,
      quotes: this.quotes,
      employees: this.employees,
      workHours: this.workHours,
      settings: this.settings,
      exportDate: new Date().toISOString()
    };
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `contabilidad-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  }

  clearAllData() {
    if (confirm('⚠️ Are you sure you want to delete ALL data? This action cannot be undone.')) {
      this.transactions = [];
      this.categories = this.initializeDefaultCategories();
      this.clients = [];
      this.quotes = [];
      this.employees = [];
      this.workHours = [];
      this.settings = { businessName: 'My Business', currency: 'USD', fiscalYear: new Date().getFullYear() };
      this.saveData();
      this.updateAllData();
      alert('All data has been deleted');
    }
  }
}

// ==================== INITIALIZATION ====================
let app;
document.addEventListener('DOMContentLoaded', function() {
  app = new AccountingApp();
});

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then((reg) => {
      reg.update();
    }).catch(() => {
      // Silent fail to avoid disrupting the app
    });
  });
}
