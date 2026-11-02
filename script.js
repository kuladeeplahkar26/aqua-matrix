/**
 * ==============================================================================
 * AquaMatrix – Smart Campus Water Analytics Through Mathematics
 * First-Year B.Tech Mathematics Project
 * 
 * Core Mathematics Modules:
 * 1. Matrix Algebra: 2D consumption matrices, row vectors (R_i = Σ a_ij),
 *    column vectors (C_j = Σ a_ij), grand total scalar (T = ΣΣ a_ij), arithmetic means.
 * 2. Calculus Analysis: Average rate of change (secant line slope),
 *    finite difference derivative approximations (q_k ≈ ΔV / Δt),
 *    definite integration of flow rates (V = ∫ q(t) dt).
 * ==============================================================================
 */

// Strict mode for cleaner code and best practices
'use strict';

/* --------------------------------------------------------------------------
   Default Configuration & Constants
   -------------------------------------------------------------------------- */
const STORAGE_KEY = 'aquamatrix_campus_water_data_v1';
const SAMPLE_STATUS_KEY = 'aquamatrix_sample_status_v1';

// Standard Campus Locations (Matrix Rows: i = 0 to 4)
const CAMPUS_LOCATIONS = [
  'Washroom',
  'Canteen',
  'Garden',
  'Laboratory',
  'Drinking Water Facility'
];

// Standard Operational Time Slots (Matrix Columns: j = 0 to 3)
// Midpoint times used for Calculus rate calculations (hours from 00:00)
const TIME_SLOTS = [
  { name: '9 AM – 11 AM', start: 9, end: 11, midpoint: 10, durationHours: 2 },
  { name: '11 AM – 1 PM', start: 11, end: 13, midpoint: 12, durationHours: 2 },
  { name: '1 PM – 3 PM',  start: 13, end: 15, midpoint: 14, durationHours: 2 },
  { name: '3 PM – 5 PM',  start: 15, end: 17, midpoint: 16, durationHours: 2 }
];

/**
 * Benchmark Illustrative Sample Dataset
 * Reflects the project prompt's illustrative values:
 * Washroom: 120, 150, 130, 100
 * Canteen:   80, 110, 140,  90
 * Garden:   200, 100,  50,  20
 * Lab:       60,  85,  95,  45
 * Drinking:  40,  65,  70,  35
 */
const DEFAULT_SAMPLE_DATA = [
  // Washroom
  { id: 'rec-1', date: '2026-11-02', location: 'Washroom', timeSlot: '9 AM – 11 AM', volume: 120, method: 'Direct Measurement' },
  { id: 'rec-2', date: '2026-11-02', location: 'Washroom', timeSlot: '11 AM – 1 PM', volume: 150, method: 'Direct Measurement' },
  { id: 'rec-3', date: '2026-11-02', location: 'Washroom', timeSlot: '1 PM – 3 PM', volume: 130, method: 'Direct Measurement' },
  { id: 'rec-4', date: '2026-11-02', location: 'Washroom', timeSlot: '3 PM – 5 PM', volume: 100, method: 'Direct Measurement' },
  
  // Canteen
  { id: 'rec-5', date: '2026-11-02', location: 'Canteen', timeSlot: '9 AM – 11 AM', volume: 80, method: 'Direct Measurement' },
  { id: 'rec-6', date: '2026-11-02', location: 'Canteen', timeSlot: '11 AM – 1 PM', volume: 110, method: 'Direct Measurement' },
  { id: 'rec-7', date: '2026-11-02', location: 'Canteen', timeSlot: '1 PM – 3 PM', volume: 140, method: 'Direct Measurement' },
  { id: 'rec-8', date: '2026-11-02', location: 'Canteen', timeSlot: '3 PM – 5 PM', volume: 90, method: 'Direct Measurement' },

  // Garden
  { id: 'rec-9', date: '2026-11-02', location: 'Garden', timeSlot: '9 AM – 11 AM', volume: 200, method: 'Flow Rate Estimate' },
  { id: 'rec-10', date: '2026-11-02', location: 'Garden', timeSlot: '11 AM – 1 PM', volume: 100, method: 'Flow Rate Estimate' },
  { id: 'rec-11', date: '2026-11-02', location: 'Garden', timeSlot: '1 PM – 3 PM', volume: 50, method: 'Flow Rate Estimate' },
  { id: 'rec-12', date: '2026-11-02', location: 'Garden', timeSlot: '3 PM – 5 PM', volume: 20, method: 'Flow Rate Estimate' },

  // Laboratory
  { id: 'rec-13', date: '2026-11-02', location: 'Laboratory', timeSlot: '9 AM – 11 AM', volume: 60, method: 'Direct Measurement' },
  { id: 'rec-14', date: '2026-11-02', location: 'Laboratory', timeSlot: '11 AM – 1 PM', volume: 85, method: 'Direct Measurement' },
  { id: 'rec-15', date: '2026-11-02', location: 'Laboratory', timeSlot: '1 PM – 3 PM', volume: 95, method: 'Direct Measurement' },
  { id: 'rec-16', date: '2026-11-02', location: 'Laboratory', timeSlot: '3 PM – 5 PM', volume: 45, method: 'Direct Measurement' },

  // Drinking Water Facility
  { id: 'rec-17', date: '2026-11-02', location: 'Drinking Water Facility', timeSlot: '9 AM – 11 AM', volume: 40, method: 'Direct Measurement' },
  { id: 'rec-18', date: '2026-11-02', location: 'Drinking Water Facility', timeSlot: '11 AM – 1 PM', volume: 65, method: 'Direct Measurement' },
  { id: 'rec-19', date: '2026-11-02', location: 'Drinking Water Facility', timeSlot: '1 PM – 3 PM', volume: 70, method: 'Direct Measurement' },
  { id: 'rec-20', date: '2026-11-02', location: 'Drinking Water Facility', timeSlot: '3 PM – 5 PM', volume: 35, method: 'Direct Measurement' }
];

/* --------------------------------------------------------------------------
   Application State
   -------------------------------------------------------------------------- */
let state = {
  records: [],
  isSampleActive: true,
  currentSection: 'home',
  selectedMatrixDate: 'all',
  charts: {
    dashboardLocation: null,
    dashboardTime: null,
    vizLocationBar: null,
    vizTimeLine: null,
    vizShareDoughnut: null,
    vizRateLine: null
  }
};

/* --------------------------------------------------------------------------
   Initialization & Lifecycle
   -------------------------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', () => {
  loadDataFromStorage();
  initNavigation();
  initFormHandlers();
  initCalculusHandlers();
  initVisualizationFilters();
  initDatasetToolButtons();

  // Set default entry date to today
  const todayStr = new Date().toISOString().split('T')[0];
  const dateInput = document.getElementById('entryDate');
  if (dateInput) dateInput.value = todayStr;
  const activeDateDisplay = document.getElementById('activeDateDisplay');
  if (activeDateDisplay) activeDateDisplay.textContent = todayStr;

  // Render all modules
  refreshAllModules();
});

/**
 * Loads data from LocalStorage or defaults to Illustrative Sample Data
 */
function loadDataFromStorage() {
  const storedData = localStorage.getItem(STORAGE_KEY);
  const storedSampleStatus = localStorage.getItem(SAMPLE_STATUS_KEY);

  if (storedData) {
    try {
      state.records = JSON.parse(storedData);
      state.isSampleActive = storedSampleStatus === 'true';
    } catch (e) {
      console.error('Failed to parse localStorage data. Reverting to sample dataset.', e);
      state.records = JSON.parse(JSON.stringify(DEFAULT_SAMPLE_DATA));
      state.isSampleActive = true;
      saveDataToStorage();
    }
  } else {
    // Fresh launch: load illustrative sample dataset
    state.records = JSON.parse(JSON.stringify(DEFAULT_SAMPLE_DATA));
    state.isSampleActive = true;
    saveDataToStorage();
  }

  updateSampleBanner();
}

/**
 * Persists current state records to browser LocalStorage
 */
function saveDataToStorage() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.records));
  localStorage.setItem(SAMPLE_STATUS_KEY, state.isSampleActive.toString());
}

/**
 * Updates visibility of the illustrative sample data notice banner
 */
function updateSampleBanner() {
  const banner = document.getElementById('sampleDataBanner');
  if (!banner) return;
  if (state.isSampleActive) {
    banner.classList.remove('d-none');
  } else {
    banner.classList.add('d-none');
  }
}

/* --------------------------------------------------------------------------
   Navigation Controller
   -------------------------------------------------------------------------- */
function initNavigation() {
  const navLinks = document.querySelectorAll('.nav-link, .nav-link-inline');
  const sections = document.querySelectorAll('.content-section');
  const pageTitle = document.getElementById('currentSectionTitle');
  const pageSubtitle = document.getElementById('currentSectionSubtitle');
  const sidebar = document.getElementById('sidebar');
  const toggleBtn = document.getElementById('sidebarToggleBtn');

  // Subtitle dictionary
  const sectionSubtitles = {
    'home': 'Digital mathematical twin & smart campus water management',
    'dashboard': 'Real-time mathematical telemetry & matrix consumption modeling',
    'data-entry': 'Record, edit, filter, and validate campus water usage measurements',
    'matrix-analysis': 'Matrix representation, row/column vectors, and Frobenius entrywise sum',
    'calculus-analysis': 'Finite difference quotients, secant slopes, and continuous flow integration',
    'visualizations': 'Dynamic multi-variable graphs powered by Chart.js',
    'recommendations': 'Automated heuristics & empirical conservation protocol',
    'about': 'Academic engineering mathematics documentation & formulation guide'
  };

  const sectionTitles = {
    'home': 'AquaMatrix Overview',
    'dashboard': 'Campus Water Overview',
    'data-entry': 'Water Data Entry & Logs',
    'matrix-analysis': 'Matrix Algebra Modeling',
    'calculus-analysis': 'Calculus & Rate Analysis',
    'visualizations': 'Interactive Visualizations',
    'recommendations': 'Results & Recommendations',
    'about': 'About AquaMatrix'
  };

  function switchSection(targetSectionId) {
    state.currentSection = targetSectionId;

    // Toggle active link
    document.querySelectorAll('.sidebar-nav .nav-link').forEach(link => {
      if (link.getAttribute('data-section') === targetSectionId) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    // Toggle active section
    sections.forEach(sec => {
      if (sec.id === targetSectionId) {
        sec.classList.add('active');
      } else {
        sec.classList.remove('active');
      }
    });

    // Update titles
    if (pageTitle && sectionTitles[targetSectionId]) {
      pageTitle.textContent = sectionTitles[targetSectionId];
    }
    if (pageSubtitle && sectionSubtitles[targetSectionId]) {
      pageSubtitle.textContent = sectionSubtitles[targetSectionId];
    }

    // Close mobile sidebar if open
    if (sidebar && sidebar.classList.contains('open')) {
      sidebar.classList.remove('open');
    }

    // Refresh charts on switch (Chart.js needs resize when container becomes visible)
    setTimeout(() => {
      renderDashboardCharts();
      renderVisualizationsCharts();
    }, 50);

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const target = link.getAttribute('data-section');
      if (target) switchSection(target);
    });
  });

  // Mobile sidebar toggle button
  if (toggleBtn && sidebar) {
    toggleBtn.addEventListener('click', () => {
      sidebar.classList.toggle('open');
    });
  }

  // Quick Add Button in header navigates to data-entry form
  const quickAddBtn = document.getElementById('quickAddBtn');
  if (quickAddBtn) {
    quickAddBtn.addEventListener('click', () => {
      switchSection('data-entry');
      document.getElementById('entryVolume')?.focus();
    });
  }

  // Set initial section to home
  switchSection('home');
}

/* --------------------------------------------------------------------------
   Master Refresh Dispatcher
   -------------------------------------------------------------------------- */
function refreshAllModules() {
  updateSampleBanner();
  updateDashboardMetrics();
  renderDashboardCharts();
  renderRecentRecordsMiniTable();
  renderDashboardInsights();
  renderRecordsTable();
  renderMatrixDateFilterOptions();
  renderMatrixAnalysis();
  renderCalculusAverageRate();
  renderFiniteDifferenceTable();
  renderIntegrationCalculator();
  renderVisualizationDateOptions();
  renderVisualizationsCharts();
  renderFullRecommendations();
}

/* --------------------------------------------------------------------------
   SECTION 1: DASHBOARD LOGIC
   -------------------------------------------------------------------------- */

/**
 * Calculates high-level metrics for dashboard cards
 */
function updateDashboardMetrics() {
  const records = state.records;
  const totalVolume = records.reduce((sum, r) => sum + Number(r.volume), 0);
  const recordCount = records.length;

  // Breakdown by location (Row Sums)
  const locTotals = {};
  CAMPUS_LOCATIONS.forEach(loc => locTotals[loc] = 0);
  records.forEach(r => {
    if (locTotals[r.location] !== undefined) {
      locTotals[r.location] += Number(r.volume);
    }
  });

  let highestLoc = '--';
  let highestLocVal = 0;
  for (const [loc, val] of Object.entries(locTotals)) {
    if (val > highestLocVal) {
      highestLocVal = val;
      highestLoc = loc;
    }
  }

  // Breakdown by time slot (Column Sums)
  const slotTotals = {};
  TIME_SLOTS.forEach(s => slotTotals[s.name] = 0);
  records.forEach(r => {
    if (slotTotals[r.timeSlot] !== undefined) {
      slotTotals[r.timeSlot] += Number(r.volume);
    }
  });

  let peakSlot = '--';
  let peakSlotVal = 0;
  for (const [slot, val] of Object.entries(slotTotals)) {
    if (val > peakSlotVal) {
      peakSlotVal = val;
      peakSlot = slot;
    }
  }

  // Average per location
  const avgPerLoc = CAMPUS_LOCATIONS.length > 0 
    ? (totalVolume / CAMPUS_LOCATIONS.length).toFixed(1) 
    : '0';

  // Direct vs Estimated breakdown
  const directCount = records.filter(r => r.method === 'Direct Measurement').length;
  const estCount = records.filter(r => r.method === 'Flow Rate Estimate').length;

  // Update DOM elements
  document.getElementById('metricTotalConsumption').textContent = totalVolume.toLocaleString();
  document.getElementById('metricHighestLocation').textContent = highestLoc;
  document.getElementById('metricHighestLocationVal').textContent = `${highestLocVal.toLocaleString()} L recorded`;
  document.getElementById('metricPeakSlot').textContent = peakSlot;
  document.getElementById('metricPeakSlotVal').textContent = `${peakSlotVal.toLocaleString()} L recorded`;
  document.getElementById('metricAvgConsumption').textContent = avgPerLoc;
  document.getElementById('metricRecordCount').textContent = recordCount;
  document.getElementById('metricMethodBreakdown').textContent = `${directCount} direct / ${estCount} estimated`;
}

/**
 * Renders the two primary dashboard charts using Chart.js
 */
function renderDashboardCharts() {
  const records = state.records;

  // Data aggregations
  const locData = CAMPUS_LOCATIONS.map(loc => {
    return records
      .filter(r => r.location === loc)
      .reduce((sum, r) => sum + Number(r.volume), 0);
  });

  const slotData = TIME_SLOTS.map(s => {
    return records
      .filter(r => r.timeSlot === s.name)
      .reduce((sum, r) => sum + Number(r.volume), 0);
  });

  // Chart 1: Location Bar Chart
  const ctxLoc = document.getElementById('dashboardLocationChart');
  if (ctxLoc) {
    if (state.charts.dashboardLocation) {
      state.charts.dashboardLocation.destroy();
    }
    state.charts.dashboardLocation = new Chart(ctxLoc, {
      type: 'bar',
      data: {
        labels: CAMPUS_LOCATIONS,
        datasets: [{
          label: 'Consumption (Litres)',
          data: locData,
          backgroundColor: [
            'rgba(2, 132, 199, 0.85)',
            'rgba(14, 165, 233, 0.85)',
            'rgba(6, 182, 212, 0.85)',
            'rgba(99, 102, 241, 0.85)',
            'rgba(20, 184, 166, 0.85)'
          ],
          borderColor: [
            '#0284c7',
            '#0ea5e9',
            '#06b6d4',
            '#6366f1',
            '#14b8a6'
          ],
          borderWidth: 1.5,
          borderRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: ctx => `Volume: ${ctx.raw.toLocaleString()} Litres`
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: { display: true, text: 'Volume (Litres)' },
            grid: { color: 'rgba(226, 232, 240, 0.7)' }
          },
          x: {
            grid: { display: false }
          }
        }
      }
    });
  }

  // Chart 2: Time-Slot Line Chart
  const ctxTime = document.getElementById('dashboardTimeChart');
  if (ctxTime) {
    if (state.charts.dashboardTime) {
      state.charts.dashboardTime.destroy();
    }
    state.charts.dashboardTime = new Chart(ctxTime, {
      type: 'line',
      data: {
        labels: TIME_SLOTS.map(s => s.name),
        datasets: [{
          label: 'Total Campus Flow',
          data: slotData,
          borderColor: '#0284c7',
          backgroundColor: 'rgba(2, 132, 199, 0.12)',
          fill: true,
          tension: 0.35,
          pointBackgroundColor: '#0284c7',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointRadius: 6,
          pointHoverRadius: 8
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: ctx => `Campus Total: ${ctx.raw.toLocaleString()} Litres`
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: { display: true, text: 'Litres per Slot' },
            grid: { color: 'rgba(226, 232, 240, 0.7)' }
          },
          x: {
            grid: { display: false }
          }
        }
      }
    });
  }
}

/**
 * Displays recent 5 records in the mini dashboard table
 */
function renderRecentRecordsMiniTable() {
  const tbody = document.getElementById('dashboardRecentRecords');
  if (!tbody) return;

  const recent = state.records.slice(-5).reverse();
  if (recent.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" class="empty-state">No records logged yet.</td></tr>`;
    return;
  }

  tbody.innerHTML = recent.map(r => `
    <tr>
      <td>${r.date}</td>
      <td><strong>${r.location}</strong></td>
      <td>${r.timeSlot}</td>
      <td><span class="metric-trend">${Number(r.volume).toLocaleString()} L</span></td>
      <td>
        <span class="status-badge ${r.method === 'Direct Measurement' ? 'direct' : 'estimated'}">
          <i class="fa-solid ${r.method === 'Direct Measurement' ? 'fa-check' : 'fa-calculator'}"></i>
          ${r.method === 'Direct Measurement' ? 'Direct' : 'Estimate'}
        </span>
      </td>
    </tr>
  `).join('');
}

/**
 * Computes dynamic insights for the dashboard right panel
 */
function renderDashboardInsights() {
  const container = document.getElementById('dashboardInsightsList');
  if (!container) return;

  const records = state.records;
  if (records.length === 0) {
    container.innerHTML = `<p class="empty-state">Add water consumption records to view mathematical conservation heuristics.</p>`;
    return;
  }

  // Calculate highest location
  const locTotals = {};
  CAMPUS_LOCATIONS.forEach(l => locTotals[l] = 0);
  records.forEach(r => { if (locTotals[r.location] !== undefined) locTotals[r.location] += Number(r.volume); });
  
  let topLoc = '';
  let topVal = -1;
  for (const [l, v] of Object.entries(locTotals)) {
    if (v > topVal) { topVal = v; topLoc = l; }
  }

  // Calculate peak slot
  const slotTotals = {};
  TIME_SLOTS.forEach(s => slotTotals[s.name] = 0);
  records.forEach(r => { if (slotTotals[r.timeSlot] !== undefined) slotTotals[r.timeSlot] += Number(r.volume); });
  let peakSlot = '';
  let peakVal = -1;
  for (const [s, v] of Object.entries(slotTotals)) {
    if (v > peakVal) { peakVal = v; peakSlot = s; }
  }

  container.innerHTML = `
    <div class="insight-item">
      <div class="insight-item-icon icon-alert">
        <i class="fa-solid fa-triangle-exclamation"></i>
      </div>
      <div class="insight-item-content">
        <strong>High Consumption in ${topLoc}</strong>
        <p>Accounting for ${topVal.toLocaleString()} L total volume. Review fixture flow rates and flush sensors.</p>
      </div>
    </div>

    <div class="insight-item">
      <div class="insight-item-icon icon-info">
        <i class="fa-solid fa-clock"></i>
      </div>
      <div class="insight-item-content">
        <strong>Peak Operational Surge: ${peakSlot}</strong>
        <p>${peakVal.toLocaleString()} L consumed. High probability of concurrent occupancy and cafeteria wash cycles.</p>
      </div>
    </div>

    <div class="insight-item">
      <div class="insight-item-icon icon-success">
        <i class="fa-solid fa-droplet"></i>
      </div>
      <div class="insight-item-content">
        <strong>Rigorous Empirical Protocol Active</strong>
        <p>Discrete time matrices and finite difference rates configured to support baseline before-and-after studies.</p>
      </div>
    </div>
  `;
}

/* --------------------------------------------------------------------------
   SECTION 2: DATA ENTRY MODULE LOGIC
   -------------------------------------------------------------------------- */
function initFormHandlers() {
  const form = document.getElementById('waterDataForm');
  const cancelBtn = document.getElementById('cancelEditBtn');
  const searchInput = document.getElementById('recordSearchInput');
  const filterLoc = document.getElementById('filterLocationSelect');
  const filterMethod = document.getElementById('filterMethodSelect');

  // Submit Handler (Add or Update)
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const editId = document.getElementById('editRecordId').value;
    const date = document.getElementById('entryDate').value;
    const location = document.getElementById('entryLocation').value;
    const timeSlot = document.getElementById('entryTimeSlot').value;
    const volume = parseFloat(document.getElementById('entryVolume').value);
    const methodElem = document.querySelector('input[name="entryMethod"]:checked');
    const method = methodElem ? methodElem.value : 'Direct Measurement';

    // Validation
    if (!date || !location || !timeSlot || isNaN(volume) || volume <= 0) {
      showToast('Please provide valid values for all required fields.', 'error');
      return;
    }

    if (editId) {
      // Edit existing record
      const index = state.records.findIndex(r => r.id === editId);
      if (index !== -1) {
        state.records[index] = {
          id: editId,
          date,
          location,
          timeSlot,
          volume,
          method
        };
        showToast(`Record updated for ${location} (${volume} L).`, 'success');
      }
      resetFormToCreateMode();
    } else {
      // Add new record
      const newRecord = {
        id: 'rec-' + Date.now(),
        date,
        location,
        timeSlot,
        volume,
        method
      };
      state.records.push(newRecord);
      showToast(`Added ${volume} L reading for ${location}.`, 'success');
    }

    // Entering custom data means we are no longer exclusively using illustrative sample data
    state.isSampleActive = false;
    saveDataToStorage();
    refreshAllModules();

    // Reset volume field only to facilitate rapid consecutive entries
    document.getElementById('entryVolume').value = '';
    document.getElementById('entryVolume').focus();
  });

  // Cancel edit button handler
  if (cancelBtn) {
    cancelBtn.addEventListener('click', () => {
      resetFormToCreateMode();
    });
  }

  // Filter & Search events
  if (searchInput) searchInput.addEventListener('input', renderRecordsTable);
  if (filterLoc) filterLoc.addEventListener('change', renderRecordsTable);
  if (filterMethod) filterMethod.addEventListener('change', renderRecordsTable);
}

function resetFormToCreateMode() {
  document.getElementById('editRecordId').value = '';
  document.getElementById('formTitle').innerHTML = '<i class="fa-solid fa-pen-to-square"></i> Record Water Consumption';
  document.getElementById('saveBtnText').textContent = 'Save Record';
  document.getElementById('cancelEditBtn').classList.add('d-none');
}

/**
 * Populates form with an existing record to edit
 */
window.editRecord = function(recordId) {
  const record = state.records.find(r => r.id === recordId);
  if (!record) return;

  document.getElementById('editRecordId').value = record.id;
  document.getElementById('entryDate').value = record.date;
  document.getElementById('entryLocation').value = record.location;
  document.getElementById('entryTimeSlot').value = record.timeSlot;
  document.getElementById('entryVolume').value = record.volume;

  const radio = document.querySelector(`input[name="entryMethod"][value="${record.method}"]`);
  if (radio) radio.checked = true;

  document.getElementById('formTitle').innerHTML = '<i class="fa-solid fa-pen-to-square"></i> Edit Water Consumption Record';
  document.getElementById('saveBtnText').textContent = 'Update Record';
  document.getElementById('cancelEditBtn').classList.remove('d-none');

  // Scroll smoothly to form
  document.getElementById('waterDataForm').scrollIntoView({ behavior: 'smooth', block: 'center' });
};

/**
 * Deletes a single record
 */
window.deleteRecord = function(recordId) {
  const index = state.records.findIndex(r => r.id === recordId);
  if (index === -1) return;

  const deleted = state.records.splice(index, 1)[0];
  state.isSampleActive = false;
  saveDataToStorage();
  refreshAllModules();
  showToast(`Record for ${deleted.location} deleted.`, 'info');
};

/**
 * Renders the full data records table with search, filter, and pagination
 */
function renderRecordsTable() {
  const tbody = document.getElementById('recordsTableBody');
  const countBadge = document.getElementById('tableRecordCountBadge');
  const emptyState = document.getElementById('noRecordsState');
  if (!tbody) return;

  const searchTerm = (document.getElementById('recordSearchInput')?.value || '').toLowerCase().trim();
  const filterLoc = document.getElementById('filterLocationSelect')?.value || 'all';
  const filterMethod = document.getElementById('filterMethodSelect')?.value || 'all';

  let filtered = state.records.filter(r => {
    const matchSearch = r.location.toLowerCase().includes(searchTerm) ||
                        r.timeSlot.toLowerCase().includes(searchTerm) ||
                        r.date.includes(searchTerm) ||
                        r.method.toLowerCase().includes(searchTerm);
    const matchLoc = (filterLoc === 'all') || (r.location === filterLoc);
    const matchMethod = (filterMethod === 'all') || (r.method === filterMethod);
    return matchSearch && matchLoc && matchMethod;
  });

  if (countBadge) {
    countBadge.textContent = `${filtered.length} of ${state.records.length} records`;
  }

  if (filtered.length === 0) {
    tbody.innerHTML = '';
    emptyState.classList.remove('d-none');
    return;
  }

  emptyState.classList.add('d-none');
  tbody.innerHTML = filtered.map((r, i) => `
    <tr>
      <td>${i + 1}</td>
      <td>${r.date}</td>
      <td><strong>${r.location}</strong></td>
      <td>${r.timeSlot}</td>
      <td><strong>${Number(r.volume).toLocaleString()} L</strong></td>
      <td>${r.method}</td>
      <td>
        <span class="status-badge ${r.method === 'Direct Measurement' ? 'direct' : 'estimated'}">
          ${r.method === 'Direct Measurement' ? 'Direct' : 'Estimate'}
        </span>
      </td>
      <td class="text-right">
        <div class="action-btns">
          <button class="btn-table-action" onclick="window.editRecord('${r.id}')" title="Edit record">
            <i class="fa-solid fa-pen"></i>
          </button>
          <button class="btn-table-action delete" onclick="window.deleteRecord('${r.id}')" title="Delete record">
            <i class="fa-solid fa-trash"></i>
          </button>
        </div>
      </td>
    </tr>
  `).join('');
}

/* --------------------------------------------------------------------------
   CSV Export & Dataset Management Tools
   -------------------------------------------------------------------------- */
function initDatasetToolButtons() {
  const exportBtn = document.getElementById('exportCsvBtn');
  const restoreBtn = document.getElementById('restoreSampleBtn');
  const quickSampleBtn = document.getElementById('quickSampleBtn');
  const clearAllBtn = document.getElementById('clearAllBtn');
  const bannerClearBtn = document.getElementById('bannerClearBtn');
  const bannerDismissBtn = document.getElementById('bannerDismissBtn');
  const modal = document.getElementById('confirmModal');
  const modalConfirmBtn = document.getElementById('modalConfirmBtn');
  const modalCancelBtn = document.getElementById('modalCancelBtn');

  // CSV Export
  if (exportBtn) {
    exportBtn.addEventListener('click', () => {
      exportRecordsToCSV();
    });
  }

  // Restore sample data
  function restoreSample() {
    state.records = JSON.parse(JSON.stringify(DEFAULT_SAMPLE_DATA));
    state.isSampleActive = true;
    saveDataToStorage();
    refreshAllModules();
    showToast('Illustrative sample benchmark restored successfully.', 'success');
  }

  if (restoreBtn) restoreBtn.addEventListener('click', restoreSample);
  if (quickSampleBtn) quickSampleBtn.addEventListener('click', restoreSample);

  // Clear modal controls
  function openClearModal() {
    if (modal) modal.classList.remove('d-none');
  }

  function closeClearModal() {
    if (modal) modal.classList.add('d-none');
  }

  if (clearAllBtn) clearAllBtn.addEventListener('click', openClearModal);
  if (bannerClearBtn) bannerClearBtn.addEventListener('click', openClearModal);
  if (modalCancelBtn) modalCancelBtn.addEventListener('click', closeClearModal);

  if (modalConfirmBtn) {
    modalConfirmBtn.addEventListener('click', () => {
      state.records = [];
      state.isSampleActive = false;
      saveDataToStorage();
      refreshAllModules();
      closeClearModal();
      showToast('All water telemetry records have been cleared.', 'info');
    });
  }

  if (bannerDismissBtn) {
    bannerDismissBtn.addEventListener('click', () => {
      document.getElementById('sampleDataBanner')?.classList.add('d-none');
    });
  }
}

/**
 * Generates and triggers download of CSV formatted water data
 */
function exportRecordsToCSV() {
  if (state.records.length === 0) {
    showToast('No records available to export.', 'error');
    return;
  }

  const headers = ['Record ID', 'Date', 'Campus Location', 'Time Slot', 'Volume (Litres)', 'Measurement Method'];
  const rows = state.records.map(r => [
    `"${r.id}"`,
    `"${r.date}"`,
    `"${r.location}"`,
    `"${r.timeSlot}"`,
    r.volume,
    `"${r.method}"`
  ]);

  const csvContent = 'data:text/csv;charset=utf-8,' + 
    [headers.join(','), ...rows.map(e => e.join(','))].join('\n');

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `aquamatrix_water_telemetry_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  showToast('Exported CSV dataset successfully.', 'success');
}

/* --------------------------------------------------------------------------
   SECTION 3: MATRIX ALGEBRA ANALYSIS
   -------------------------------------------------------------------------- */

/**
 * Builds the date filter options for the matrix analysis tab
 */
function renderMatrixDateFilterOptions() {
  const filter = document.getElementById('matrixDateFilter');
  if (!filter) return;

  const dates = [...new Set(state.records.map(r => r.date))].sort();
  const currentVal = filter.value;

  filter.innerHTML = `<option value="all">Aggregate (Sum across all dates)</option>` +
    dates.map(d => `<option value="${d}">${d}</option>`).join('');

  if (dates.includes(currentVal) || currentVal === 'all') {
    filter.value = currentVal;
  }

  filter.onchange = () => {
    state.selectedMatrixDate = filter.value;
    renderMatrixAnalysis();
  };
}

/**
 * Core Matrix Algebra Engine:
 * Constructs matrix A = [a_ij] where:
 * - Rows i: Campus Locations (m = 5)
 * - Columns j: Time Slots (n = 4)
 * 
 * Computes:
 * - Row Totals: R_i = Σ_j a_ij
 * - Column Totals: C_j = Σ_i a_ij
 * - Grand Total: T = Σ_i Σ_j a_ij
 * - Row Averages: R_i_avg = R_i / n
 * - Column Averages: C_j_avg = C_j / m
 * - Maximum element: max(a_ij)
 * - Minimum element: min(a_ij)
 */
function renderMatrixAnalysis() {
  const matrixTable = document.getElementById('matrixVisualTable');
  if (!matrixTable) return;

  const selectedDate = state.selectedMatrixDate || 'all';

  // Filter records by selected date
  const filteredRecords = selectedDate === 'all' 
    ? state.records 
    : state.records.filter(r => r.date === selectedDate);

  const m = CAMPUS_LOCATIONS.length;
  const n = TIME_SLOTS.length;

  // Initialize m x n zero matrix
  const A = Array.from({ length: m }, () => Array(n).fill(0));

  // Populate matrix A from actual records
  filteredRecords.forEach(r => {
    const rowIdx = CAMPUS_LOCATIONS.indexOf(r.location);
    const colIdx = TIME_SLOTS.findIndex(s => s.name === r.timeSlot);
    if (rowIdx !== -1 && colIdx !== -1) {
      A[rowIdx][colIdx] += Number(r.volume);
    }
  });

  // Calculate extremum values (excluding cells with 0 if no records exist)
  let maxVal = -Infinity;
  let minVal = Infinity;
  let maxPos = { row: -1, col: -1 };
  let minPos = { row: -1, col: -1 };

  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      const val = A[i][j];
      if (val > maxVal) {
        maxVal = val;
        maxPos = { row: i, col: j };
      }
      if (val < minVal) {
        minVal = val;
        minPos = { row: i, col: j };
      }
    }
  }

  if (maxVal === -Infinity) maxVal = 0;
  if (minVal === Infinity) minVal = 0;

  // Mathematical Vector Aggregations:
  // Row Totals: R_i = Σ_j a_ij
  const rowTotals = A.map(row => row.reduce((acc, val) => acc + val, 0));

  // Column Totals: C_j = Σ_i a_ij
  const colTotals = Array(n).fill(0);
  for (let j = 0; j < n; j++) {
    for (let i = 0; i < m; i++) {
      colTotals[j] += A[i][j];
    }
  }

  // Grand Total: T = Σ_i Σ_j a_ij
  const grandTotal = rowTotals.reduce((acc, val) => acc + val, 0);

  // Arithmetic Means
  const rowAverages = rowTotals.map(total => n > 0 ? (total / n).toFixed(1) : 0);
  const colAverages = colTotals.map(total => m > 0 ? (total / m).toFixed(1) : 0);

  // Update Matrix Stats Bar
  document.getElementById('matrixDimBadge').textContent = `${m} × ${n} (Locations × Slots)`;
  document.getElementById('matrixMaxBadge').textContent = `${maxVal.toLocaleString()} L (${maxPos.row !== -1 ? CAMPUS_LOCATIONS[maxPos.row] : '--'})`;
  document.getElementById('matrixMinBadge').textContent = `${minVal.toLocaleString()} L (${minPos.row !== -1 ? CAMPUS_LOCATIONS[minPos.row] : '--'})`;
  document.getElementById('matrixTotalBadge').textContent = `${grandTotal.toLocaleString()} L`;

  // Render Visual Matrix Table
  let html = `
    <thead>
      <tr>
        <th class="row-label">Campus Location \\ Time</th>
        ${TIME_SLOTS.map(s => `<th>${s.name}</th>`).join('')}
        <th class="pill-blue">Row Sum (Rᵢ)</th>
        <th>Mean (R̄ᵢ)</th>
      </tr>
    </thead>
    <tbody>
  `;

  for (let i = 0; i < m; i++) {
    html += `<tr>`;
    html += `<th class="row-label">${CAMPUS_LOCATIONS[i]}</th>`;

    for (let j = 0; j < n; j++) {
      const val = A[i][j];
      const isMax = (i === maxPos.row && j === maxPos.col && maxVal > 0);
      const isMin = (i === minPos.row && j === minPos.col && filteredRecords.length > 0);

      let cellClass = 'matrix-cell';
      if (isMax) cellClass += ' cell-max';
      else if (isMin) cellClass += ' cell-min';

      html += `
        <td class="${cellClass}" title="${CAMPUS_LOCATIONS[i]} at ${TIME_SLOTS[j].name}: ${val} L">
          ${val.toLocaleString()} L
        </td>
      `;
    }

    // Row total & Average cells
    html += `
      <td class="matrix-cell row-sum-cell"><strong>${rowTotals[i].toLocaleString()} L</strong></td>
      <td class="matrix-cell"><strong>${rowAverages[i]} L</strong></td>
    `;
    html += `</tr>`;
  }

  // Column Totals Bottom Row
  html += `
    <tr>
      <th class="row-label pill-cyan">Column Sum (Cⱼ)</th>
      ${colTotals.map(c => `<td class="matrix-cell col-sum-cell"><strong>${c.toLocaleString()} L</strong></td>`).join('')}
      <td class="matrix-cell grand-sum-cell" title="Grand Total T = Σ R_i = Σ C_j">
        <strong>${grandTotal.toLocaleString()} L</strong>
      </td>
      <td class="matrix-cell">--</td>
    </tr>
    <tr>
      <th class="row-label">Column Mean (C̄ⱼ)</th>
      ${colAverages.map(avg => `<td class="matrix-cell"><strong>${avg} L</strong></td>`).join('')}
      <td class="matrix-cell">--</td>
      <td class="matrix-cell">--</td>
    </tr>
  `;

  html += `</tbody>`;
  matrixTable.innerHTML = html;

  // Render Computed Mathematical Result Explanations
  renderMatrixMathDetails(rowTotals, colTotals, grandTotal, rowAverages, colAverages);
}

/**
 * Renders mathematical breakdowns below the matrix
 */
function renderMatrixMathDetails(rowTotals, colTotals, grandTotal, rowAverages, colAverages) {
  // 1. Row Totals
  const rowBox = document.getElementById('rowTotalsOutput');
  if (rowBox) {
    rowBox.innerHTML = CAMPUS_LOCATIONS.map((loc, i) => `
      <div class="result-row">
        <strong>R_${i+1} (${loc}):</strong>
        <span>${rowTotals[i].toLocaleString()} Litres</span>
      </div>
    `).join('');
  }

  // 2. Column Totals
  const colBox = document.getElementById('colTotalsOutput');
  if (colBox) {
    colBox.innerHTML = TIME_SLOTS.map((slot, j) => `
      <div class="result-row">
        <strong>C_${j+1} (${slot.name}):</strong>
        <span>${colTotals[j].toLocaleString()} Litres</span>
      </div>
    `).join('');
  }

  // 3. Grand Total
  const grandBox = document.getElementById('grandTotalOutput');
  if (grandBox) {
    grandBox.innerHTML = `
      <div class="result-row">
        <strong>Total via Row Sums (Σ Rᵢ):</strong>
        <span>${rowTotals.reduce((a, b) => a + b, 0).toLocaleString()} L</span>
      </div>
      <div class="result-row">
        <strong>Total via Column Sums (Σ Cⱼ):</strong>
        <span>${colTotals.reduce((a, b) => a + b, 0).toLocaleString()} L</span>
      </div>
      <div class="result-row">
        <strong>Consistency Verification:</strong>
        <span class="text-green">Σ Rᵢ ≡ Σ Cⱼ = ${grandTotal.toLocaleString()} L</span>
      </div>
    `;
  }

  // 4. Averages
  const avgBox = document.getElementById('averagesOutput');
  if (avgBox) {
    avgBox.innerHTML = `
      <div class="result-row">
        <strong>Mean Facility Footprint (R̄):</strong>
        <span>${(grandTotal / CAMPUS_LOCATIONS.length).toFixed(1)} L/location</span>
      </div>
      <div class="result-row">
        <strong>Mean Slot Footprint (C̄):</strong>
        <span>${(grandTotal / TIME_SLOTS.length).toFixed(1)} L/slot</span>
      </div>
    `;
  }
}

/* --------------------------------------------------------------------------
   SECTION 4: CALCULUS ANALYSIS
   -------------------------------------------------------------------------- */
function initCalculusHandlers() {
  const rateLoc = document.getElementById('rateLocationSelect');
  const rateSlot1 = document.getElementById('rateSlot1Select');
  const rateSlot2 = document.getElementById('rateSlot2Select');
  const finiteLoc = document.getElementById('finiteDiffLocation');
  const intFlow = document.getElementById('integralFlowRate');
  const intDuration = document.getElementById('integralDuration');
  const profileRadios = document.querySelectorAll('input[name="flowProfile"]');

  // Module A event listeners
  [rateLoc, rateSlot1, rateSlot2].forEach(elem => {
    if (elem) elem.addEventListener('change', renderCalculusAverageRate);
  });

  // Module B event listeners
  if (finiteLoc) finiteLoc.addEventListener('change', renderFiniteDifferenceTable);

  // Module C event listeners
  [intFlow, intDuration].forEach(elem => {
    if (elem) elem.addEventListener('input', renderIntegrationCalculator);
  });
  profileRadios.forEach(r => r.addEventListener('change', renderIntegrationCalculator));
}

/**
 * Calculus Module A: Average Rate of Change (Secant line slope)
 * Formula: Rate = (V_2 - V_1) / (t_2 - t_1)
 */
function renderCalculusAverageRate() {
  const resultBox = document.getElementById('averageRateResultBox');
  if (!resultBox) return;

  const loc = document.getElementById('rateLocationSelect')?.value || 'Washroom';
  const slot1Name = document.getElementById('rateSlot1Select')?.value || '9 AM – 11 AM';
  const slot2Name = document.getElementById('rateSlot2Select')?.value || '11 AM – 1 PM';

  const slot1 = TIME_SLOTS.find(s => s.name === slot1Name);
  const slot2 = TIME_SLOTS.find(s => s.name === slot2Name);

  // Aggregate volume for slot 1 and slot 2 at selected location
  const v1 = state.records
    .filter(r => r.location === loc && r.timeSlot === slot1Name)
    .reduce((sum, r) => sum + Number(r.volume), 0);

  const v2 = state.records
    .filter(r => r.location === loc && r.timeSlot === slot2Name)
    .reduce((sum, r) => sum + Number(r.volume), 0);

  const t1 = slot1 ? slot1.midpoint : 10;
  const t2 = slot2 ? slot2.midpoint : 12;

  const dt = t2 - t1;
  const dv = v2 - v1;

  if (dt === 0) {
    resultBox.innerHTML = `
      <div class="calc-step-item">
        <span class="label">Time Interval (Δt):</span>
        <span class="val text-amber">0 Hours (Identical Intervals Selected)</span>
      </div>
      <p class="calc-explanation">Please choose two distinct time slots to evaluate the secant rate of change.</p>
    `;
    return;
  }

  const ratePerHour = (dv / dt).toFixed(2);
  const isPositive = dv > 0;
  const isZero = dv === 0;

  resultBox.innerHTML = `
    <div class="calc-step-item">
      <span class="label">Initial Volume ($V_1$ at ${slot1Name}):</span>
      <span class="val">${v1.toLocaleString()} Litres</span>
    </div>
    <div class="calc-step-item">
      <span class="label">Final Volume ($V_2$ at ${slot2Name}):</span>
      <span class="val">${v2.toLocaleString()} Litres</span>
    </div>
    <div class="calc-step-item">
      <span class="label">Volumetric Difference ($\Delta V = V_2 - V_1$):</span>
      <span class="val ${isPositive ? 'text-amber' : isZero ? '' : 'text-cyan'}">
        ${dv > 0 ? '+' : ''}${dv.toLocaleString()} Litres
      </span>
    </div>
    <div class="calc-step-item">
      <span class="label">Time Interval ($\Delta t = t_2 - t_1$):</span>
      <span class="val">${dt} Hours</span>
    </div>

    <div class="calc-rate-badge">
      <span>Calculated Average Rate of Change ($\frac{\Delta V}{\Delta t}$)</span>
      <strong>${ratePerHour} Litres / Hour</strong>
    </div>

    <p class="calc-explanation">
      <strong>Geometric & Physical Interpretation:</strong>
      ${isPositive 
        ? `Positive secant slope (+${ratePerHour} L/hr) demonstrates demand acceleration at ${loc}. Flow rate increased between ${slot1Name} and ${slot2Name}.` 
        : isZero 
        ? `Zero rate indicates steady-state volumetric balance between the two observation intervals.` 
        : `Negative secant slope (${ratePerHour} L/hr) demonstrates water demand deceleration as activity winds down.`}
    </p>
  `;
}

/**
 * Calculus Module B: Finite Difference Analysis (Discrete derivative approximation)
 * Formula: q_k ≈ (V_{k+1} - V_k) / Δt
 */
function renderFiniteDifferenceTable() {
  const tbody = document.getElementById('finiteDiffBody');
  if (!tbody) return;

  const loc = document.getElementById('finiteDiffLocation')?.value || 'Washroom';

  // Extract volumes for this location across all 4 time slots
  const volumes = TIME_SLOTS.map(slot => {
    return state.records
      .filter(r => r.location === loc && r.timeSlot === slot.name)
      .reduce((sum, r) => sum + Number(r.volume), 0);
  });

  let html = '';
  for (let k = 0; k < TIME_SLOTS.length; k++) {
    const slot = TIME_SLOTS[k];
    const vol = volumes[k];

    let dt = '--';
    let dv = '--';
    let rateStr = '--';
    let statusBadge = '<span class="status-badge">Baseline Node</span>';

    if (k < TIME_SLOTS.length - 1) {
      const nextVol = volumes[k + 1];
      const nextSlot = TIME_SLOTS[k + 1];
      const deltaT = nextSlot.midpoint - slot.midpoint; // 2 hours
      const deltaV = nextVol - vol;
      const rate = (deltaV / deltaT).toFixed(1);

      dt = `${deltaT} hrs`;
      dv = `${deltaV > 0 ? '+' : ''}${deltaV} L`;
      rateStr = `${rate > 0 ? '+' : ''}${rate} L/hr`;

      if (deltaV > 0) {
        statusBadge = '<span class="status-badge estimated"><i class="fa-solid fa-arrow-trend-up"></i> Surge (+Rate)</span>';
      } else if (deltaV < 0) {
        statusBadge = '<span class="status-badge direct"><i class="fa-solid fa-arrow-trend-down"></i> Decline (-Rate)</span>';
      } else {
        statusBadge = '<span class="status-badge">Steady (0 Rate)</span>';
      }
    } else {
      statusBadge = '<span class="status-badge">Terminal Interval</span>';
    }

    html += `
      <tr>
        <td><strong>${slot.name}</strong></td>
        <td><strong>${vol.toLocaleString()} L</strong></td>
        <td>${dt}</td>
        <td>${dv}</td>
        <td><strong>${rateStr}</strong></td>
        <td>${statusBadge}</td>
      </tr>
    `;
  }

  tbody.innerHTML = html;
}

/**
 * Calculus Module C: Definite Integration of Continuous Flow Models
 * Formula: V = ∫_a^b q(t) dt
 * Interactive calculator supporting Constant flow (tap) or Linear flow profile
 */
function renderIntegrationCalculator() {
  const solutionBox = document.getElementById('integrationSolutionDisplay');
  if (!solutionBox) return;

  const q = parseFloat(document.getElementById('integralFlowRate')?.value) || 6;
  const T = parseFloat(document.getElementById('integralDuration')?.value) || 15;
  const profileElem = document.querySelector('input[name="flowProfile"]:checked');
  const profile = profileElem ? profileElem.value : 'constant';

  let volume = 0;
  let mathSteps = '';

  if (profile === 'constant') {
    // V = ∫_0^T q dt = q * T
    // Example: q = 6 L/min, T = 15 min => V = 6 * 15 = 90 Litres
    volume = q * T;
    mathSteps = `
      <div class="solution-header">Analytical Integration for Constant Flow</div>
      <div class="solution-math">
        V = \\int_{0}^{${T}} ${q} \\, dt = [${q}t]_{0}^{${T}} = ${q}(${T}) - 0 = ${volume.toFixed(1)} \\text{ Litres}
      </div>
    `;
  } else {
    // Linear Ramp: q(t) = q * (t / T)
    // V = ∫_0^T q*(t/T) dt = (q / T) * [t^2 / 2]_0^T = (q * T) / 2
    volume = (q * T) / 2;
    mathSteps = `
      <div class="solution-header">Analytical Integration for Linear Flow Ramp</div>
      <div class="solution-math">
        V = \\int_{0}^{${T}} \\left(${q} \\cdot \\frac{t}{${T}}\\right) \\, dt = \\frac{${q}}{${T}} \\left[\\frac{t^2}{2}\\right]_{0}^{${T}} = \\frac{${q} \\cdot ${T}}{2} = ${volume.toFixed(1)} \\text{ Litres}
      </div>
    `;
  }

  solutionBox.innerHTML = `
    ${mathSteps}
    <div class="solution-total">Cumulative Volume: ${volume.toLocaleString()} L</div>
    <small style="color: #166534; display: block; margin-top: 4px;">
      <i class="fa-solid fa-calculator"></i> Fundamental Theorem of Calculus: Area under flow rate curve evaluated over interval [0, ${T}].
    </small>
  `;
}

/* --------------------------------------------------------------------------
   SECTION 5: GRAPHS & VISUALIZATION (Chart.js)
   -------------------------------------------------------------------------- */
function initVisualizationFilters() {
  const dateFilt = document.getElementById('vizDateFilter');
  const locFilt = document.getElementById('vizLocationFilter');
  const timeFilt = document.getElementById('vizTimeSlotFilter');

  [dateFilt, locFilt, timeFilt].forEach(elem => {
    if (elem) elem.addEventListener('change', renderVisualizationsCharts);
  });
}

function renderVisualizationDateOptions() {
  const filter = document.getElementById('vizDateFilter');
  if (!filter) return;

  const dates = [...new Set(state.records.map(r => r.date))].sort();
  const currentVal = filter.value;

  filter.innerHTML = `<option value="all">All Dates Combined</option>` +
    dates.map(d => `<option value="${d}">${d}</option>`).join('');

  if (dates.includes(currentVal) || currentVal === 'all') {
    filter.value = currentVal;
  }
}

/**
 * Renders the 4 full interactive charts in the Visualizations tab
 */
function renderVisualizationsCharts() {
  const records = state.records;
  const dateFilter = document.getElementById('vizDateFilter')?.value || 'all';
  const locFilter = document.getElementById('vizLocationFilter')?.value || 'all';
  const timeFilter = document.getElementById('vizTimeSlotFilter')?.value || 'all';

  // Apply filters
  let filtered = records.filter(r => {
    const matchDate = (dateFilter === 'all') || (r.date === dateFilter);
    const matchLoc = (locFilter === 'all') || (r.location === locFilter);
    const matchTime = (timeFilter === 'all') || (r.timeSlot === timeFilter);
    return matchDate && matchLoc && matchTime;
  });

  // Chart 1: Location Bar Chart
  const locLabels = locFilter === 'all' ? CAMPUS_LOCATIONS : [locFilter];
  const locData = locLabels.map(loc => {
    return filtered
      .filter(r => r.location === loc)
      .reduce((sum, r) => sum + Number(r.volume), 0);
  });

  const ctxBar = document.getElementById('vizLocationBarChart');
  if (ctxBar) {
    if (state.charts.vizLocationBar) state.charts.vizLocationBar.destroy();
    state.charts.vizLocationBar = new Chart(ctxBar, {
      type: 'bar',
      data: {
        labels: locLabels,
        datasets: [{
          label: 'Total Volume (Litres)',
          data: locData,
          backgroundColor: 'rgba(2, 132, 199, 0.8)',
          borderColor: '#0284c7',
          borderWidth: 1.5,
          borderRadius: 8
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: { beginAtZero: true, title: { display: true, text: 'Litres' } }
        }
      }
    });
  }

  // Chart 2: Time Series Line Chart
  const timeLabels = timeFilter === 'all' ? TIME_SLOTS.map(s => s.name) : [timeFilter];
  const timeData = timeLabels.map(slotName => {
    return filtered
      .filter(r => r.timeSlot === slotName)
      .reduce((sum, r) => sum + Number(r.volume), 0);
  });

  const ctxLine = document.getElementById('vizTimeLineChart');
  if (ctxLine) {
    if (state.charts.vizTimeLine) state.charts.vizTimeLine.destroy();
    state.charts.vizTimeLine = new Chart(ctxLine, {
      type: 'line',
      data: {
        labels: timeLabels,
        datasets: [{
          label: 'Volume Consumption',
          data: timeData,
          borderColor: '#06b6d4',
          backgroundColor: 'rgba(6, 182, 212, 0.15)',
          fill: true,
          tension: 0.3,
          pointRadius: 6,
          pointBackgroundColor: '#06b6d4'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: { beginAtZero: true, title: { display: true, text: 'Litres' } }
        }
      }
    });
  }

  // Chart 3: Doughnut Chart (Percentage Share by Location)
  const ctxDoughnut = document.getElementById('vizShareDoughnutChart');
  if (ctxDoughnut) {
    if (state.charts.vizShareDoughnut) state.charts.vizShareDoughnut.destroy();
    state.charts.vizShareDoughnut = new Chart(ctxDoughnut, {
      type: 'doughnut',
      data: {
        labels: locLabels,
        datasets: [{
          data: locData,
          backgroundColor: [
            '#0284c7',
            '#0ea5e9',
            '#06b6d4',
            '#6366f1',
            '#14b8a6'
          ],
          borderWidth: 2,
          borderColor: '#ffffff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom' }
        }
      }
    });
  }

  // Chart 4: Calculus Rate Line Chart (ΔV / Δt between consecutive slots)
  const rateLabels = [];
  const rateData = [];
  for (let k = 0; k < TIME_SLOTS.length - 1; k++) {
    const s1 = TIME_SLOTS[k];
    const s2 = TIME_SLOTS[k + 1];
    const label = `${s1.name.split(' – ')[0]} → ${s2.name.split(' – ')[1]}`;
    rateLabels.push(label);

    const v1 = filtered.filter(r => r.timeSlot === s1.name).reduce((sum, r) => sum + Number(r.volume), 0);
    const v2 = filtered.filter(r => r.timeSlot === s2.name).reduce((sum, r) => sum + Number(r.volume), 0);
    const dt = s2.midpoint - s1.midpoint; // 2 hours
    const rate = dt > 0 ? (v2 - v1) / dt : 0;
    rateData.push(rate);
  }

  const ctxRate = document.getElementById('vizRateLineChart');
  if (ctxRate) {
    if (state.charts.vizRateLine) state.charts.vizRateLine.destroy();
    state.charts.vizRateLine = new Chart(ctxRate, {
      type: 'line',
      data: {
        labels: rateLabels,
        datasets: [{
          label: 'Estimated Flow Rate (ΔV / Δt)',
          data: rateData,
          borderColor: '#0d9488',
          backgroundColor: 'rgba(13, 148, 136, 0.1)',
          fill: true,
          tension: 0.25,
          pointRadius: 6,
          pointBackgroundColor: '#0d9488'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            title: { display: true, text: 'Litres / Hour' },
            grid: { color: 'rgba(226, 232, 240, 0.7)' }
          }
        }
      }
    });
  }
}

/* --------------------------------------------------------------------------
   SECTION 6: RESULTS & RECOMMENDATIONS (Intelligent Math Diagnostics)
   -------------------------------------------------------------------------- */
function renderFullRecommendations() {
  const records = state.records;
  if (records.length === 0) return;

  // 1. Calculate row totals (Locations)
  const locTotals = {};
  CAMPUS_LOCATIONS.forEach(l => locTotals[l] = 0);
  records.forEach(r => { if (locTotals[r.location] !== undefined) locTotals[r.location] += Number(r.volume); });

  let topLoc = '', minLoc = '';
  let maxLocVal = -Infinity, minLocVal = Infinity;
  for (const [l, v] of Object.entries(locTotals)) {
    if (v > maxLocVal) { maxLocVal = v; topLoc = l; }
    if (v < minLocVal) { minLocVal = v; minLoc = l; }
  }

  // 2. Calculate column totals (Time Slots)
  const slotTotals = {};
  TIME_SLOTS.forEach(s => slotTotals[s.name] = 0);
  records.forEach(r => { if (slotTotals[r.timeSlot] !== undefined) slotTotals[r.timeSlot] += Number(r.volume); });

  let peakSlot = '';
  let peakVal = -Infinity;
  for (const [s, v] of Object.entries(slotTotals)) {
    if (v > peakVal) { peakVal = v; peakSlot = s; }
  }

  // 3. Trend analysis (Morning 9-1 vs Afternoon 1-5)
  const morningVol = (slotTotals['9 AM – 11 AM'] || 0) + (slotTotals['11 AM – 1 PM'] || 0);
  const afternoonVol = (slotTotals['1 PM – 3 PM'] || 0) + (slotTotals['3 PM – 5 PM'] || 0);
  const isDeclining = morningVol > afternoonVol;

  // Update Diagnostic Metric Cards
  document.getElementById('insightTopLocation').textContent = topLoc;
  document.getElementById('insightTopLocationDesc').textContent = 
    `Consumes ${maxLocVal.toLocaleString()} L total. Represents max row vector component max_i(R_i).`;

  document.getElementById('insightPeakSlot').textContent = peakSlot;
  document.getElementById('insightPeakSlotDesc').textContent = 
    `Peak column sum C_j = ${peakVal.toLocaleString()} L during ${peakSlot}. Primary campus pressure stressor.`;

  document.getElementById('insightMinLocation').textContent = minLoc;
  document.getElementById('insightMinLocationDesc').textContent = 
    `Consumes ${minLocVal.toLocaleString()} L total. Represents baseline control node min_i(R_i).`;

  document.getElementById('insightTrendState').textContent = isDeclining ? 'Morning Peak Surge' : 'Afternoon Influx';
  document.getElementById('insightTrendDesc').textContent = 
    `Morning (${morningVol.toLocaleString()} L) vs Afternoon (${afternoonVol.toLocaleString()} L). Finite gradient dq/dt < 0 across later intervals.`;

  // Dynamic Actionable Recommendations
  const recList = document.getElementById('actionableRecommendationsList');
  if (!recList) return;

  recList.innerHTML = `
    <!-- Recommendation 1: Washroom Optimization -->
    <div class="recommendation-card">
      <div class="rec-icon washroom">
        <i class="fa-solid fa-restroom"></i>
      </div>
      <div class="rec-content">
        <h4>High Washroom Demand Investigation</h4>
        <p>
          Data confirms <strong>${topLoc === 'Washroom' ? 'Washrooms represent the highest campus consumer' : 'Significant washroom consumption spikes'}</strong> during peak hours (${peakSlot}).
          Implement pressure-compensating aerators (rated at 1.5–2.0 L/min) and dual-flush valves.
        </p>
        <div class="rec-action-steps">
          <span class="rec-tag"><i class="fa-solid fa-wrench"></i> Aerator retrofits</span>
          <span class="rec-tag"><i class="fa-solid fa-sensor"></i> Infrared tap sensors</span>
          <span class="rec-tag"><i class="fa-solid fa-clipboard-check"></i> Audit flush cistern leaks</span>
        </div>
      </div>
    </div>

    <!-- Recommendation 2: Garden Irrigation Scheduling -->
    <div class="recommendation-card">
      <div class="rec-icon garden">
        <i class="fa-solid fa-seedling"></i>
      </div>
      <div class="rec-content">
        <h4>Evapotranspiration & Irrigation Shift</h4>
        <p>
          Garden watering during the 9 AM – 1 PM windows experiences high solar evapotranspiration losses.
          Shift campus landscape watering to early mornings (before 8 AM) or evenings using timed drip irrigation to minimize thermodynamic losses.
        </p>
        <div class="rec-action-steps">
          <span class="rec-tag"><i class="fa-solid fa-clock"></i> Reschedule to 6–8 AM</span>
          <span class="rec-tag"><i class="fa-solid fa-faucet"></i> Drip micro-irrigation</span>
          <span class="rec-tag"><i class="fa-solid fa-cloud-rain"></i> Soil moisture feedback</span>
        </div>
      </div>
    </div>

    <!-- Recommendation 3: Piping and Leak Diagnostics via Calculus -->
    <div class="recommendation-card">
      <div class="rec-icon pipe">
        <i class="fa-solid fa-screwdriver-wrench"></i>
      </div>
      <div class="rec-content">
        <h4>Abnormal Baseline & Finite Difference Spikes</h4>
        <p>
          If finite difference quotients $\\frac{\\Delta V}{\\Delta t}$ fail to decline to near-zero during low-occupancy terminal slots (3 PM – 5 PM),
          inspect continuous supply lines and underground pipes for concealed acoustic leaks or stuck flush valves.
        </p>
        <div class="rec-action-steps">
          <span class="rec-tag"><i class="fa-solid fa-stethoscope"></i> Acoustic leak detection</span>
          <span class="rec-tag"><i class="fa-solid fa-gauge"></i> Nocturnal pressure logging</span>
        </div>
      </div>
    </div>

    <!-- Recommendation 4: Verification Protocol (Academic Rigor) -->
    <div class="recommendation-card">
      <div class="rec-icon benchmark">
        <i class="fa-solid fa-scale-balanced"></i>
      </div>
      <div class="rec-content">
        <h4>Before-and-After Empirical Verification Framework</h4>
        <p>
          In accordance with strict scientific engineering standards, <strong>actual water savings must never be claimed in advance</strong>.
          Conduct a formal 14-day pre-intervention matrix baseline ($A_{pre}$), apply selected hardware controls, and evaluate the post-intervention matrix ($A_{post}$) via difference matrix $\\Delta A = A_{pre} - A_{post}$.
        </p>
        <div class="rec-action-steps">
          <span class="rec-tag"><i class="fa-solid fa-chart-column"></i> Difference Matrix (ΔA)</span>
          <span class="rec-tag"><i class="fa-solid fa-circle-check"></i> Statistically verified savings only</span>
        </div>
      </div>
    </div>
  `;
}

/* --------------------------------------------------------------------------
   UI Helpers: Toast Notification
   -------------------------------------------------------------------------- */
let toastTimeout = null;
function showToast(message, type = 'success') {
  const toast = document.getElementById('toastNotification');
  const msgElem = document.getElementById('toastMessage');
  const iconElem = document.getElementById('toastIcon');
  if (!toast || !msgElem) return;

  msgElem.textContent = message;

  if (iconElem) {
    if (type === 'error') {
      iconElem.className = 'fa-solid fa-circle-xmark text-red';
    } else if (type === 'info') {
      iconElem.className = 'fa-solid fa-circle-info text-cyan';
    } else {
      iconElem.className = 'fa-solid fa-circle-check text-green';
    }
  }

  toast.classList.remove('d-none');

  if (toastTimeout) clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.classList.add('d-none');
  }, 3200);
}
