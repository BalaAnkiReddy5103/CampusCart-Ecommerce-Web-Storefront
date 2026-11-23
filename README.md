# 🎓 CampusCart – E-Commerce Web Storefront (Indian Campus Edition)

> **A high-performance, responsive e-commerce web platform engineered for Indian university & college students.**  
> Built with pure **HTML5**, **CSS3**, and **Vanilla JavaScript (ES6+)** — zero frontend frameworks, zero build steps, expansive widescreen layout, Indian Rupee (`₹`) pricing, and production-grade software craftsmanship.

---

## 1. Executive Summary

| Attribute | Details |
| :--- | :--- |
| **Project Name** | **CampusCart – E-Commerce Web Storefront (Indian Campus Edition)** |
| **Category** | Modern Single-Page E-Commerce Web Application |
| **Target Audience** | Indian College & University Students (IITs, NITs, State Universities, Engineering & Degree Campuses) |
| **Currency & Region** | Indian Rupee (`₹` INR) &bull; Formatted in Indian numbering system (`₹1,299`) |
| **Problem Statement** | Indian college students lack a unified, localized marketplace to purchase syllabus-aligned engineering textbooks, exam-approved calculators, semester stationery, and hostel essentials with real-time inventory checks and same-day hostel delivery. |
| **Solution** | A mobile-first, wide-screen responsive storefront featuring REST API product synchronization with INR conversion, 90-minute hostel gate delivery, debounced live search, a client-side shopping cart with `localStorage` persistence, stock boundary enforcement, and an interactive checkout simulation supporting UPI and COD with strict 10-digit mobile and 6-digit PIN code validation. |
| **Free Delivery Threshold** | **Free Hostel Delivery on orders above ₹499** (Standard delivery ₹49) |

---

## 2. Key Enhancements in Indian Edition

### 🇮🇳 1. Authentic Indian Campus Product Catalog
Curated across 5 essential student departments:
- **Books & Textbooks**:
  - *Higher Engineering Mathematics by Dr. B.S. Grewal (44th Ed)* – ₹699
  - *Data Structures & Algorithms in C/C++ by Reema Thareja (Oxford)* – ₹485
  - *Concepts of Physics (Vol 1 & 2) by Dr. H.C. Verma* – ₹749
  - *Quantitative Aptitude for Campus Placements by Dr. R.S. Aggarwal* – ₹580
  - *GATE 2026: Computer Science & IT Solved Papers by Made Easy* – ₹720
  - *Indian Economy by Ramesh Singh (McGraw Hill)* – ₹590
- **Electronics**:
  - *Casio FX-991CW ClassWiz Non-Programmable Scientific Calculator (AICTE & Exam Approved)* – ₹1,495
  - *boAt Rockerz 550 Over-Ear Study Headphones (50mm Drivers, 20H Battery)* – ₹1,799
  - *Portronics Mport 6-in-1 Type-C Multi-Port Hub (4K HDMI, 100W PD)* – ₹1,299
  - *Logitech Pebble M350 Silent Wireless Mouse (Quiet for Libraries)* – ₹1,249
  - *Mi 20000mAh Power Bank 3i with 18W Fast Charging* – ₹1,999
  - *Wipro Garnet 6W Rechargeable LED Desk Lamp with Pen Stand* – ₹799
- **Stationery**:
  - *Classmate Pulse Spiral Notebooks (A4 Size, 300 Pages, Pack of 4)* – ₹340
  - *Hauser XO Extra Dark Ball Pens (Pack of 20 Pens)* – ₹180
  - *Luxor Pastel Highlighters with Chisel Tip (Set of 6 Mild Shades)* – ₹149
  - *Camlin Scholar Mathematical Drawing Instruments Geometry Box* – ₹165
  - *Omega Engineering Mini Drafter with Steel Clamps (ED Lab)* – ₹499
- **Accessories**:
  - *Wildcraft 35L Water-Resistant College Backpack with Rain Cover* – ₹1,699
  - *Milton Thermosteel Flip Lid Insulated Water Bottle (1000ml)* – ₹849
  - *Tukzer Foldable Ergonomic Aluminum Laptop Stand* – ₹799
  - *Scart Anti-Skid Extended Desk Mat & Mouse Pad (80x40 cm)* – ₹399
  - *Lenskart Air Blue Light Blocking Computer Glasses* – ₹899
- **College Essentials (Hostel Life)**:
  - *Pigeon 1.5L Stainless Steel Electric Kettle (Instant Maggi & Tea)* – ₹649
  - *GM 4-Outlet Power Strip Extension Board with Master Switch (2m Cord)* – ₹449
  - *Hostel Bedside Hanging Organizer Caddy with 6 Storage Pockets* – ₹349
  - *Kuber Industries Foldable Mesh Laundry Basket for Hostel Clothes* – ₹199
  - *Bombay Dyeing 100% Cotton Single Cot Bed Sheet Set with Pillow Cover* – ₹499

### 📐 2. Expansive Layout (Eliminating Excessive Side Gaps)
- Container max-width increased to **`1540px`** with fluid responsive side padding (`clamp(16px, 2.5vw, 36px)`).
- On wider desktop screens (1380px+), the product catalog automatically arranges into a **5-column grid** (`repeat(5, 1fr)`), filling the horizontal screen space evenly without awkward blank side margins.
- Hero section, catalog filter toolbar, and category showcase span smoothly across modern high-resolution monitors.

### 💳 3. Indian Payment Simulation & Form Validation
- **Payment Modes**:
  1. ⚡ Instant UPI (Google Pay / PhonePe / Paytm / BHIM)
  2. 💵 Cash on Campus Delivery (COD at Hostel Gate / Security Desk)
  3. 💳 College Student ID / Canteen Smart Card
- **Validation**:
  - **Phone Number**: Strict 10-digit Indian mobile numbers (`/^[6-9]\d{9}$/` with optional `+91`).
  - **Postal Code**: Strict 6-digit Indian PIN codes (`/^[1-9][0-9]{5}$/`).
  - **Address**: Hostel name, block, room number, or college department.
- **Student Promo Codes**:
  - `CAMPUS2026` &rarr; Flat 10% Welcome Discount.
  - `FRESHER15` &rarr; 15% Fresher Semester Discount.
  - `STUDENT20` &rarr; 20% College Student Discount.

---

## 3. Directory & File Structure

```text
CampusCart/
│
├── index.html              # Semantic HTML5 layout, Indian branding, modals, SVG icons
├── css/
│   └── style.css           # Modern expansive stylesheet (1540px container, 5-col grid, animations)
├── js/
│   ├── products.js         # Indian campus catalog (29 items), DummyJSON INR mapping, ₹ formatting
│   ├── cart.js             # Cart state, ₹499 Free Delivery meter, promo codes, LocalStorage
│   ├── filters.js          # Live search debouncing, category tabs, sorting, in-stock toggle
│   ├── checkout.js         # Indian 10-digit mobile & 6-digit PIN validation, UPI simulation, receipt
│   └── main.js             # Application bootstrapper, toast notification engine, quick view modal
├── assets/
│   └── images/             # Visual image directory
└── README.md               # Complete technical documentation & testing manual
```

---

## 4. Setup & Running Instructions

### Method 1: Direct File Execution (Zero Configuration)
1. Open the project folder: `CampusCart/`.
2. Double-click `index.html` to run in any browser (Chrome, Edge, Firefox, Brave, Safari).
3. The application runs immediately with all Indian products, currency formatting, and cart state preserved.

### Method 2: Visual Studio Code with Live Server
1. Open VS Code &rarr; **File &rarr; Open Folder...** &rarr; Select `CampusCart`.
2. Right-click `index.html` &rarr; **Open with Live Server**.
3. Opens at `http://127.0.0.1:5500/index.html`.

### Method 3: Python Built-In HTTP Server
```bash
python -m http.server 8000
```
Visit `http://localhost:8000` in your web browser.

---

## 5. Verification Checklist

1. **Expansive Width**: Content fills across screens up to 1540px without excessive empty side margins. On wide screens, 5 product cards display per row.
2. **Indian Currency (`₹`)**: Displayed consistently across header, product cards, quick view, cart drawer, checkout modal, and order confirmation receipt.
3. **Free Delivery Progress**: Shows amount remaining until ₹499. Automatically unlocks **FREE Hostel Delivery** when subtotal reaches ₹499.
4. **Indian Catalog**: B.S. Grewal, H.C. Verma, Casio FX-991CW, boAt Rockerz, Classmate Pulse, Hauser XO, Wildcraft, Pigeon Maggi Kettle all appear and filter accurately.
5. **Indian Mobile & PIN Validation**: Accepts valid 10-digit Indian numbers (`9876543210`) and 6-digit PIN codes (`500081`, `560034`); rejects invalid formats with clear inline error messages.
6. **UPI Payment Simulation**: Select UPI &rarr; submit order &rarr; receipt displays unique Order ID (`CC-IN-XXXXXX`) with 90-minute hostel dispatch ETA.

---

&copy; 2026 **CampusCart Storefront – Indian Campus Edition**. Developed for College & University Communities.
