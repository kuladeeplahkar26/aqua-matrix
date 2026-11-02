# AquaMatrix – Smart Campus Water Analytics Through Mathematics

> **First-Year B.Tech Mathematics Project**  
> *Smart Campus Water Consumption Analysis and Optimization Using Matrix Algebra and Calculus*

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Status: Complete](https://img.shields.io/badge/Status-Complete-success.svg)](#)
[![Stack: Vanilla HTML/CSS/JS](https://img.shields.io/badge/Stack-HTML5%20%7C%20CSS3%20%7C%20JS%20%7C%20Chart.js-0284c7.svg)](#)

---

## 📌 Project Overview

**AquaMatrix** is a modern, responsive, and interactive web application demonstrating the real-world engineering application of **Matrix Algebra** and **Calculus** in smart campus resource management.

The platform provides a digital telemetry model that analyzes water consumption across designated campus facilities and operational time windows, calculates rates of consumption change, models continuous flow integration, and generates data-driven conservation recommendations.

---

## 🚀 Key Modules

1. **Home / Hero Presentation:**
   - Modern Xylem-inspired digital twin hero layout.
   - 3D Isometric smart campus infrastructure visualization.
   - Flow rate telemetry nodes and quick-access feature navigation.

2. **Campus Overview Dashboard:**
   - Total Consumption (Litres) via Matrix Grand Sum $T = \sum_i \sum_j a_{ij}$.
   - Highest consuming facility ($\max_i R_i$) and peak time window ($\max_j C_j$).
   - Location-wise bar chart and diurnal time-series line chart (Chart.js).
   - Recent telemetry logs and automated conservation heuristics.

3. **Data Entry & Management:**
   - Form supporting Date, Location, Time Slot, Volume, and Measurement Method (Direct vs. Flow Rate Estimate).
   - Full CRUD: Add, inline edit, delete with confirmation.
   - Search, multi-criteria filters, and one-click CSV dataset export.
   - LocalStorage persistence (100% offline, zero server required).

4. **Matrix Algebra Analysis (Core Mathematics):**
   - Arranges multi-variable campus telemetry into matrix $A \in \mathbb{R}^{m \times n}$.
   - **Row Totals:** $R_i = \sum_j a_{ij}$ (Formulated as $R = A \cdot \mathbf{1}_n$).
   - **Column Totals:** $C_j = \sum_i a_{ij}$ (Formulated as $C^T = \mathbf{1}_m^T \cdot A$).
   - **Grand Total:** $T = \mathbf{1}_m^T \cdot A \cdot \mathbf{1}_n$.
   - **Arithmetic Means:** Facility averages ($\bar{R}_i$) and temporal averages ($\bar{C}_j$).
   - Dynamic maximum ($\max a_{ij}$) and minimum ($\min a_{ij}$) element badges.

5. **Calculus Analysis:**
   - **Module A (Average Rate of Change):** Secant line slope $\frac{\Delta V}{\Delta t} = \frac{V_2 - V_1}{t_2 - t_1}$ in Litres/Hour.
   - **Module B (Finite Difference Analysis):** Discrete derivative approximations $q_k \approx \frac{V_{k+1} - V_k}{\Delta t_k}$ across consecutive intervals.
   - **Module C (Definite Integration):** Continuous hydraulic volume integration $V = \int_a^b q(t) \, dt$ with constant and linear flow models (e.g., 6 L/min tap running for 15 min = 90 L).

6. **Interactive Visualizations:**
   - Location bar chart, diurnal line curve, percentage share doughnut, and finite difference rate curves with dynamic dropdown filters.

7. **Results & Actionable Recommendations:**
   - Automated mathematical diagnostics and conservation protocols (washroom aerators, sensor taps, evapotranspiration-based garden irrigation scheduling, acoustic leak detection).
   - Rigorous empirical before-and-after baseline verification protocol ($\Delta A = A_{\text{pre}} - A_{\text{post}}$).

8. **About AquaMatrix:**
   - Project specifications, objectives, and First-Year B.Tech mathematical formulation reference table.

---

## 🛠️ Technology Stack

- **Structure:** Semantic HTML5
- **Styling:** Vanilla CSS3 (Custom design system, CSS variables, glassmorphism, responsive grid/flexbox)
- **Scripting & Engine:** Vanilla JavaScript (ES6+, Matrix operations, Finite Differences, Riemann sums)
- **Data Visualizations:** Chart.js (v4.4.2 via CDN)
- **Typography & Icons:** Google Fonts (Outfit, Inter, JetBrains Mono) & FontAwesome 6
- **Storage:** Browser `localStorage` (No external database or server required)

---

## 💻 How to Run Locally

### Option 1: Direct File Launch
Simply double-click `index.html` in file explorer to open it in any modern browser (Chrome, Edge, Firefox, Safari).

### Option 2: Local HTTP Server
Run any lightweight static server:
```bash
# Using Python
python -m http.server 8080

# Using Node.js
npx serve .
```
Then navigate to `http://localhost:8080` in your browser.

---

## 📑 Mathematical Formulation Reference

| Concept | Formulation | Campus Physical Meaning |
| :--- | :--- | :--- |
| **Matrix Element** | $a_{ij}$ | Water volume (L) consumed at location $i$ during time slot $j$. |
| **Row Vector Total** | $R_i = \sum_{j=1}^n a_{ij} = (A \cdot \mathbf{1}_n)_i$ | Total volume demanded by campus facility $i$. |
| **Column Vector Total** | $C_j = \sum_{i=1}^m a_{ij} = (\mathbf{1}_m^T \cdot A)_j$ | Total campus volume consumed during temporal window $j$. |
| **Grand Total** | $T = \sum_i \sum_j a_{ij} = \mathbf{1}_m^T A \mathbf{1}_n$ | Cumulative campus water footprint over observed period. |
| **Average Rate of Change** | $\frac{\Delta V}{\Delta t} = \frac{V_2 - V_1}{t_2 - t_1}$ | Secant line slope representing average volumetric flow (L/hr). |
| **Finite Difference** | $q_k \approx \frac{V_{k+1} - V_k}{\Delta t_k}$ | Numerical discrete approximation of the derivative $\frac{dV}{dt}$. |
| **Definite Integral** | $V = \int_a^b q(t) \, dt$ | Accumulated volume from continuous flow rate function $q(t)$. |

---

## 👨‍💻 Project Presentation Notice
> **Scientific Integrity & Academic Rigor:** Illustrative sample data is provided for academic demonstration purposes. All mathematical algorithms update dynamically as empirical measurements are logged.

Developed for First-Year B.Tech Engineering Mathematics.
