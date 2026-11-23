/**
 * CampusCart - Products Module (Indian Campus Edition)
 * Handles Indian student catalog data (IITs, NITs, State Universities),
 * precise product-matched imagery, REST API fetching (DummyJSON with INR conversion),
 * 5 campus categories, offline SVG fallback, and card rendering.
 */

window.CampusCart = window.CampusCart || {};

CampusCart.Products = (function () {
  'use strict';

  // Available Indian Campus Categories
  const CATEGORIES = [
    'Books & Textbooks',
    'Electronics',
    'Stationery',
    'Accessories',
    'College Essentials'
  ];

  /**
   * Currency Formatter for Indian Rupees (₹)
   */
  const formatCurrency = (amt) => {
    const val = Number(amt) || 0;
    return '₹' + Math.round(val).toLocaleString('en-IN');
  };

  /**
   * Safe HTML Escaper to prevent injection
   */
  const escapeHTML = (str) => {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  };

  /**
   * Generates a high-resolution branded SVG data-URI as an offline/broken image fallback
   */
  const getFallbackSvg = (title, category) => {
    const icon = category.includes('Books') ? '📚' :
                 category.includes('Electronics') ? '💻' :
                 category.includes('Stationery') ? '✏️' :
                 category.includes('Accessories') ? '🎒' : '🛏️';
    const cleanTitle = (title || 'Campus Item').slice(0, 32);
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="600" y2="600" gradientUnits="userSpaceOnUse">
          <stop stop-color="#0F172A"/>
          <stop offset="1" stop-color="#1E293B"/>
        </linearGradient>
      </defs>
      <rect width="600" height="600" fill="url(#bg)"/>
      <circle cx="300" cy="240" r="110" fill="#334155" opacity="0.6"/>
      <text x="300" y="275" font-size="96" text-anchor="middle">${icon}</text>
      <text x="300" y="405" font-family="-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif" font-size="24" font-weight="bold" fill="#FFFFFF" text-anchor="middle">${escapeHTML(cleanTitle)}</text>
      <text x="300" y="445" font-family="-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif" font-size="16" fill="#F97316" font-weight="700" letter-spacing="2" text-anchor="middle">${escapeHTML(category).toUpperCase()}</text>
      <rect x="220" y="490" width="160" height="30" rx="15" fill="#0D9488" opacity="0.3"/>
      <text x="300" y="510" font-family="-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif" font-size="13" font-weight="600" fill="#CCFBF1" text-anchor="middle">CAMPUS STOCK DEPOT</text>
    </svg>`;
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  };

  // Comprehensive, realistic Indian campus catalog with 100% DISTINCT, MATCHED imagery
  const FALLBACK_PRODUCTS = [
    // ----------------------------------------------------------------------
    // 1. Books & Textbooks
    // ----------------------------------------------------------------------
    {
      id: 'book-01',
      title: 'Higher Engineering Mathematics by Dr. B.S. Grewal (44th Edition)',
      category: 'Books & Textbooks',
      price: 699,
      originalPrice: 950,
      stock: 18,
      rating: 4.9,
      reviewsCount: 384,
      description: 'The standard mathematics reference for all B.Tech / BE engineering branches across Indian universities (VTU, JNTU, Anna Univ, AKTU, Mumbai Univ, IITs, NITs).',
      // High-resolution photo: Math equations, calculus notations, and textbook
      image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=600&q=80',
      badge: 'B.Tech Essential'
    },
    {
      id: 'book-02',
      title: 'Data Structures and Algorithms in C / C++ by Reema Thareja (Oxford Univ Press)',
      category: 'Books & Textbooks',
      price: 485,
      originalPrice: 650,
      stock: 14,
      rating: 4.8,
      reviewsCount: 215,
      description: 'Syllabus textbook for CSE and IT undergraduates covering stacks, queues, linked lists, trees, graphs, sorting, and algorithmic complexities.',
      // High-resolution photo: Laptop screen with programming code, algorithms, and study desk
      image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=600&q=80',
      badge: 'CSE Core'
    },
    {
      id: 'book-03',
      title: 'Concepts of Physics (Vol 1 & 2 Combined) by Dr. H.C. Verma (Bharti Bhavan)',
      category: 'Books & Textbooks',
      price: 749,
      originalPrice: 990,
      stock: 22,
      rating: 5.0,
      reviewsCount: 650,
      description: 'Legendary Indian physics text with profound conceptual problem sets, numerical questions, and foundational theory for engineering students.',
      // High-resolution photo: Physics optics, refraction, and science equations
      image: 'https://images.unsplash.com/photo-1507668077129-56e32842fceb?auto=format&fit=crop&w=600&q=80',
      badge: 'Top Rated'
    },
    {
      id: 'book-04',
      title: 'Quantitative Aptitude for Competitive Exams & Placements by Dr. R.S. Aggarwal',
      category: 'Books & Textbooks',
      price: 580,
      originalPrice: 775,
      stock: 25,
      rating: 4.8,
      reviewsCount: 520,
      description: 'The undisputed campus recruitment training handbook for TCS, Infosys, Wipro, Cognizant, and product company technical placement rounds.',
      // High-resolution photo: Student practicing aptitude worksheets with notebook
      image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=600&q=80',
      badge: 'Placement Prep'
    },
    {
      id: 'book-05',
      title: 'GATE 2026: Computer Science & IT Chapter-Wise Solved Papers by Made Easy',
      category: 'Books & Textbooks',
      price: 720,
      originalPrice: 990,
      stock: 12,
      rating: 4.7,
      reviewsCount: 180,
      description: 'Previous 32 years GATE solved question papers with comprehensive step-by-step explanations for M.Tech admissions and PSU recruitments.',
      // High-resolution photo: Open engineering revision notes and academic text
      image: 'https://images.unsplash.com/photo-1532012164546-f432f2e3777f?auto=format&fit=crop&w=600&q=80',
      badge: 'GATE 2026'
    },
    {
      id: 'book-06',
      title: 'Indian Economy by Ramesh Singh (15th Revised Edition - McGraw Hill)',
      category: 'Books & Textbooks',
      price: 590,
      originalPrice: 825,
      stock: 8,
      rating: 4.7,
      reviewsCount: 145,
      description: 'Definitive reference book for Indian macroeconomic policies, banking reforms, Union budgets, and university social sciences curricula.',
      // High-resolution photo: Economic charts, financial analysis and textbook
      image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=600&q=80',
      badge: 'Low Stock'
    },

    // ----------------------------------------------------------------------
    // 2. Electronics
    // ----------------------------------------------------------------------
    {
      id: 'elec-01',
      title: 'Casio FX-991CW ClassWiz Non-Programmable Scientific Calculator',
      category: 'Electronics',
      price: 1495,
      originalPrice: 1895,
      stock: 16,
      rating: 4.9,
      reviewsCount: 620,
      description: 'Approved by AICTE and semester university exam boards (VTU, JNTU, Anna Univ, AKTU). 540+ functions, natural textbook display, and QR code feature.',
      // High-resolution photo: Scientific calculator with engineering math keypad
      image: 'https://images.unsplash.com/photo-1587145820266-a5951ee6f620?auto=format&fit=crop&w=600&q=80',
      badge: 'Exam Approved'
    },
    {
      id: 'elec-02',
      title: 'boAt Rockerz 550 Wireless Bluetooth Over-Ear Study Headphones',
      category: 'Electronics',
      price: 1799,
      originalPrice: 3999,
      stock: 15,
      rating: 4.6,
      reviewsCount: 410,
      description: '50mm dynamic drivers, physical noise-isolating ear cushions for quiet hostel & library study sessions, and 20 hours continuous battery.',
      // High-resolution photo: Over-ear dark studio wireless headphones
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80',
      badge: 'Library Pick'
    },
    {
      id: 'elec-03',
      title: 'Portronics Mport 6-in-1 Type-C Multi-Port Hub (4K HDMI, 100W PD)',
      category: 'Electronics',
      price: 1299,
      originalPrice: 2499,
      stock: 20,
      rating: 4.7,
      reviewsCount: 185,
      description: 'Essential multiport adapter for college laptops and MacBooks. Includes 4K HDMI, 3x USB 3.0, and 100W Type-C fast power pass-through.',
      // High-resolution photo: USB-C multiport dongle hub attached to laptop
      image: 'https://images.unsplash.com/photo-1625842268584-8f3296236761?auto=format&fit=crop&w=600&q=80',
      badge: 'Popular'
    },
    {
      id: 'elec-04',
      title: 'Logitech Pebble M350 Silent Wireless Mouse (Quiet Clicks for Library)',
      category: 'Electronics',
      price: 1249,
      originalPrice: 1995,
      stock: 28,
      rating: 4.8,
      reviewsCount: 230,
      description: 'Silent mechanical clicks reduce 90% noise during lectures and quiet hostel rooms. Connects via Bluetooth or 2.4GHz USB nano receiver.',
      // High-resolution photo: Sleek modern silent wireless mouse on desk
      image: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=600&q=80',
      badge: 'Silent Click'
    },
    {
      id: 'elec-05',
      title: 'Mi 20000mAh Power Bank 3i with 18W Fast Charging & Triple Output',
      category: 'Electronics',
      price: 1999,
      originalPrice: 2799,
      stock: 19,
      rating: 4.8,
      reviewsCount: 480,
      description: 'High-density lithium polymer battery with 12 layers of circuit protection. Charges phones, tablets, and smart bands during full college days.',
      // High-resolution photo: Portable dark power bank battery pack
      image: 'https://images.unsplash.com/photo-1609592426867-a2f07d2c3e10?auto=format&fit=crop&w=600&q=80',
      badge: 'All-Day Power'
    },
    {
      id: 'elec-06',
      title: 'Wipro Garnet 6W Rechargeable LED Desk Lamp with 3-Grade Dimming',
      category: 'Electronics',
      price: 799,
      originalPrice: 1290,
      stock: 6,
      rating: 4.7,
      reviewsCount: 190,
      description: 'Hostel night study lamp with touch control, eye-care warm/cool modes, flexible gooseneck, and built-in mobile/pen stand.',
      // High-resolution photo: Warm LED adjustable desk lamp illuminating study space
      image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=600&q=80',
      badge: 'Hostel Night Light'
    },

    // ----------------------------------------------------------------------
    // 3. Stationery
    // ----------------------------------------------------------------------
    {
      id: 'stat-01',
      title: 'Classmate Pulse Spiral Notebooks (A4 Size, 300 Pages, Pack of 4)',
      category: 'Stationery',
      price: 340,
      originalPrice: 440,
      stock: 45,
      rating: 4.8,
      reviewsCount: 310,
      description: 'Premium elemental chlorine-free paper with durable poly cover. Ruled pages with tear-off micro-perforations for college assignments.',
      // High-resolution photo: Stack of spiral notebooks with ruled paper
      image: 'https://images.unsplash.com/photo-1531346878377-a5be20888e57?auto=format&fit=crop&w=600&q=80',
      badge: 'Semester Pack'
    },
    {
      id: 'stat-02',
      title: 'Hauser XO Extra Dark Ball Pens (Blue Ink, Pack of 20 Pens)',
      category: 'Stationery',
      price: 180,
      originalPrice: 240,
      stock: 60,
      rating: 4.9,
      reviewsCount: 520,
      description: 'German technology liquid fluid ink system with ultra-comfortable non-slip grip. The favorite pen across Indian university semester exams.',
      // High-resolution photo: Writing pens lined up for exams
      image: 'https://images.unsplash.com/photo-1585336261026-7f415309d435?auto=format&fit=crop&w=600&q=80',
      badge: 'Exam Special'
    },
    {
      id: 'stat-03',
      title: 'Luxor Pastel Highlighters with Chisel Tip (Set of 6 Mild Shades)',
      category: 'Stationery',
      price: 149,
      originalPrice: 199,
      stock: 40,
      rating: 4.7,
      reviewsCount: 280,
      description: 'Water-based fluorescent mild pastel ink that does not bleed through textbook paper. Soft aesthetic colors for neat revision notes.',
      // High-resolution photo: Pastel highlighters with chisel tips
      image: 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?auto=format&fit=crop&w=600&q=80',
      badge: 'Pastel Set'
    },
    {
      id: 'stat-04',
      title: 'Camlin Scholar Mathematical Drawing Instruments Geometry Box',
      category: 'Stationery',
      price: 165,
      originalPrice: 220,
      stock: 35,
      rating: 4.6,
      reviewsCount: 175,
      description: 'Precision self-centering compass, divider, 180-degree protractor, set squares, and 15cm scale inside a sturdy tin container.',
      // High-resolution photo: Geometry compass, protractor and precision drawing rulers
      image: 'https://images.unsplash.com/photo-1596495577886-d920f1fb7238?auto=format&fit=crop&w=600&q=80',
      badge: 'Lab Geometry'
    },
    {
      id: 'stat-05',
      title: 'Post-it Super Sticky Notes Cube & Neon Page Marker Flag Strips',
      category: 'Stationery',
      price: 199,
      originalPrice: 280,
      stock: 30,
      rating: 4.7,
      reviewsCount: 140,
      description: 'Repositionable vibrant colored sticky notes for marking syllabus topics, semester deadlines, and hostel reminders.',
      // High-resolution photo: Colorful sticky notes stack and memo pads
      image: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&w=600&q=80',
      badge: 'Study Notes'
    },
    {
      id: 'stat-06',
      title: 'Omega Engineering Mini Drafter with Steel Clamps (For ED Lab)',
      category: 'Stationery',
      price: 499,
      originalPrice: 699,
      stock: 15,
      rating: 4.8,
      reviewsCount: 95,
      description: 'Unbreakable scale with powder-coated steel arms and non-slip clamps for 1st-year engineering graphics and drawing sheets.',
      // High-resolution photo: Engineering technical drawing drafting table with rulers and clamps
      image: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&w=600&q=80',
      badge: 'ED Lab Tool'
    },

    // ----------------------------------------------------------------------
    // 4. Accessories
    // ----------------------------------------------------------------------
    {
      id: 'acc-01',
      title: 'Wildcraft 35L Water-Resistant College Backpack with Laptop Sleeve & Rain Cover',
      category: 'Accessories',
      price: 1699,
      originalPrice: 2899,
      stock: 18,
      rating: 4.8,
      reviewsCount: 340,
      description: 'Triple-compartment ergonomic campus backpack with padded 15.6" laptop section, organizer, water bottle pockets, and concealed monsoon rain cover.',
      // High-resolution photo: Sturdy campus laptop travel backpack
      image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80',
      badge: 'Campus Carry'
    },
    {
      id: 'acc-02',
      title: 'Milton Thermosteel Flip Lid Insulated Water Bottle (1000ml, Keeps 24H Cold/Hot)',
      category: 'Accessories',
      price: 849,
      originalPrice: 1199,
      stock: 26,
      rating: 4.9,
      reviewsCount: 490,
      description: '100% rust-proof 304 food-grade stainless steel vacuum insulation. Keeps water chilled through long college lectures and lab sessions.',
      // High-resolution photo: Stainless steel insulated metal water bottle
      image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=600&q=80',
      badge: 'Hydration'
    },
    {
      id: 'acc-03',
      title: 'Tukzer Foldable Ergonomic Aluminum Laptop Stand (Anti-Skid, Heat Dissipation)',
      category: 'Accessories',
      price: 799,
      originalPrice: 1499,
      stock: 22,
      rating: 4.7,
      reviewsCount: 165,
      description: '7-level height adjustment prevents cervical neck strain during hours of coding, assignment typing, and online lectures.',
      // High-resolution photo: Aluminum ergonomic laptop riser stand
      image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=600&q=80',
      badge: 'Ergonomic'
    },
    {
      id: 'acc-04',
      title: 'Scart Anti-Skid Extended Desk Mat & Mouse Pad for Study Table (80x40 cm)',
      category: 'Accessories',
      price: 399,
      originalPrice: 799,
      stock: 35,
      rating: 4.6,
      reviewsCount: 120,
      description: 'Spill-resistant PU leather surface protects hostel study tables while giving ample smooth gliding room for mouse and keyboard.',
      // High-resolution photo: Wide clean desk pad / workspace mat
      image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=600&q=80',
      badge: 'Desk Setup'
    },
    {
      id: 'acc-05',
      title: 'Lenskart Air Blue Light Blocking Computer Glasses (Zero Power, Anti-Glare)',
      category: 'Accessories',
      price: 899,
      originalPrice: 1800,
      stock: 20,
      rating: 4.6,
      reviewsCount: 110,
      description: 'UV400 lenses filter harmful blue rays emitted by laptop screens and smartphones to prevent headache and eye fatigue during late-night study.',
      // High-resolution photo: Modern blue light optical spectacles
      image: 'https://images.unsplash.com/photo-1574258495973-f010dfbb5371?auto=format&fit=crop&w=600&q=80',
      badge: 'Eye Care'
    },

    // ----------------------------------------------------------------------
    // 5. College Essentials (Hostel Life)
    // ----------------------------------------------------------------------
    {
      id: 'dorm-01',
      title: 'Pigeon by Stovekraft 1.5L Stainless Steel Electric Kettle (Instant Maggi & Tea)',
      category: 'College Essentials',
      price: 649,
      originalPrice: 1195,
      stock: 24,
      rating: 4.8,
      reviewsCount: 580,
      description: 'The ultimate Indian hostel lifeline! Rapid boil in under 3 minutes for late-night Maggi, coffee, tea, soup, and warm drinking water. Auto cut-off safety.',
      // High-resolution photo: Stainless steel electric cordless kettle
      image: 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?auto=format&fit=crop&w=600&q=80',
      badge: 'Hostel Favorite'
    },
    {
      id: 'dorm-02',
      title: 'GM 4-Outlet Power Strip Extension Board with Master Switch & Surge Protector (2m)',
      category: 'College Essentials',
      price: 449,
      originalPrice: 685,
      stock: 30,
      rating: 4.7,
      reviewsCount: 290,
      description: '4 universal sockets with safety shutters for laptops, mobile chargers, study lamps, and power banks from a single hostel wall socket.',
      // High-resolution photo: Multi-outlet electrical power strip with plugs and cables
      image: 'https://images.unsplash.com/photo-1544716278-e513176f20b5?auto=format&fit=crop&w=600&q=80',
      badge: 'Hostel Essential'
    },
    {
      id: 'dorm-03',
      title: 'Hostel Bedside Hanging Organizer Caddy with 6 Storage Pockets (For Single Cot)',
      category: 'College Essentials',
      price: 349,
      originalPrice: 599,
      stock: 25,
      rating: 4.6,
      reviewsCount: 115,
      description: 'Hooks easily onto hostel single bed railings. Holds water bottles, notebooks, smartphone, earphones, and spectacles within arm’s reach.',
      // High-resolution photo: Bedside hanging organizer pocket caddy
      image: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=600&q=80',
      badge: 'Space Saver'
    },
    {
      id: 'dorm-04',
      title: 'Kuber Industries Foldable Mesh Laundry Hamper Basket for Hostel Clothes',
      category: 'College Essentials',
      price: 199,
      originalPrice: 399,
      stock: 40,
      rating: 4.5,
      reviewsCount: 88,
      description: 'Pop-up breathable mesh laundry bag with sturdy side handles. Collapses completely flat for compact storage when not in use.',
      // High-resolution photo: Laundry hamper basket for student clothes
      image: 'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?auto=format&fit=crop&w=600&q=80',
      badge: 'Hostel Laundry'
    },
    {
      id: 'dorm-05',
      title: 'Bombay Dyeing 100% Pure Cotton Single Bed Sheet Set with Pillow Cover',
      category: 'College Essentials',
      price: 499,
      originalPrice: 899,
      stock: 18,
      rating: 4.7,
      reviewsCount: 160,
      description: 'Crafted specifically to fit standard Indian college hostel single cots (60x90 inches). Breathable 140 TC cotton, fade-resistant and washable.',
      // High-resolution photo: Clean folded cotton single bedsheet set and pillow cover
      image: 'https://images.unsplash.com/photo-1631679706909-1844bbd07221?auto=format&fit=crop&w=600&q=80',
      badge: 'Hostel Bedding'
    },
    {
      id: 'dorm-06',
      title: 'Cello Swift Insulated Lunch Box with Thermal Bag (For Campus Canteen & Labs)',
      category: 'College Essentials',
      price: 429,
      originalPrice: 650,
      stock: 0, // Realistic out of stock example
      rating: 4.6,
      reviewsCount: 75,
      description: '3 stainless steel leakproof containers with soft insulated fabric bag to keep home-cooked meals or hostel packed lunches warm for hours.',
      // High-resolution photo: Stainless steel tiffin container with thermal carrier bag
      image: 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?auto=format&fit=crop&w=600&q=80',
      badge: 'Out of Stock'
    }
  ];

  // Active product catalog state
  let allProducts = [...FALLBACK_PRODUCTS];
  let isApiOnline = false;

  /**
   * Map DummyJSON product to Indian Campus categories with realistic INR prices
   */
  const mapDummyCategoryToCampus = (dummyCat) => {
    const cat = String(dummyCat || '').toLowerCase();
    if (cat.includes('laptop') || cat.includes('smartphone') || cat.includes('mobile') || cat.includes('electronics') || cat.includes('tablet')) {
      return 'Electronics';
    }
    if (cat.includes('book') || cat.includes('stationery')) {
      return 'Stationery';
    }
    if (cat.includes('watch') || cat.includes('bag') || cat.includes('sunglasses') || cat.includes('accessory')) {
      return 'Accessories';
    }
    return 'College Essentials';
  };

  /**
   * Fetch products from DummyJSON API with timeout and Indian Rupee mapping
   */
  const fetchProducts = async () => {
    const statusTextEl = document.getElementById('api-status-text');
    const loadingStateEl = document.getElementById('products-loading');

    if (loadingStateEl) loadingStateEl.hidden = false;

    try {
      // 3.5s timeout controller to ensure fast UX
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      const response = await fetch('https://dummyjson.com/products?limit=25', {
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data && Array.isArray(data.products) && data.products.length > 0) {
        // Map DummyJSON items to realistic INR values
        const transformedApiProducts = data.products.slice(0, 8).map((item) => {
          const inrPrice = Math.max(299, Math.round((item.price * 45) / 50) * 50 - 1);
          const discount = Math.round(item.discountPercentage || 20);
          const originalPrice = Math.round(inrPrice / (1 - discount / 100));

          return {
            id: `api-${item.id}`,
            title: item.title,
            category: mapDummyCategoryToCampus(item.category),
            price: inrPrice,
            originalPrice: originalPrice > inrPrice ? originalPrice : Math.round(inrPrice * 1.25),
            stock: item.stock || 12,
            rating: Number(item.rating) || 4.6,
            reviewsCount: Math.floor(Math.random() * 80) + 20,
            description: item.description,
            image: item.thumbnail || item.images?.[0] || getFallbackSvg(item.title, mapDummyCategoryToCampus(item.category)),
            badge: discount > 18 ? `${discount}% OFF` : 'Campus Verified'
          };
        });

        // Merge API products with our rich Indian campus catalog
        allProducts = [...FALLBACK_PRODUCTS, ...transformedApiProducts];
        isApiOnline = true;

        if (statusTextEl) {
          statusTextEl.textContent = `Connected to Campus Cloud Depot (${allProducts.length} Items Live)`;
        }
      } else {
        throw new Error('Empty response from API');
      }
    } catch (err) {
      console.warn('CampusCart: Running on Indian campus local depot:', err.message);
      allProducts = [...FALLBACK_PRODUCTS];
      isApiOnline = false;

      if (statusTextEl) {
        statusTextEl.textContent = 'Using Campus Store Local Depot (Offline Ready)';
      }
    } finally {
      if (loadingStateEl) loadingStateEl.hidden = true;
    }

    return allProducts;
  };

  /**
   * Get all products
   */
  const getAllProducts = () => allProducts;

  /**
   * Get single product by ID
   */
  const getProductById = (id) => {
    return allProducts.find((p) => String(p.id) === String(id)) || null;
  };

  /**
   * Get list of categories
   */
  const getCategories = () => CATEGORIES;

  /**
   * Calculate stock status metadata
   */
  const getStockStatus = (stock) => {
    if (stock <= 0) {
      return { class: 'out-of-stock', label: 'Out of Stock', canBuy: false };
    }
    if (stock <= 5) {
      return { class: 'low-stock', label: `Low Stock (${stock} left)`, canBuy: true };
    }
    return { class: 'in-stock', label: `In Stock (${stock})`, canBuy: true };
  };

  /**
   * Generate Star Rating HTML
   */
  const generateRatingHTML = (rating, count) => {
    const score = Number(rating).toFixed(1);
    return `
      <div class="product-rating" title="${score} out of 5 stars based on ${count} student reviews">
        <span class="star-icon">★</span>
        <span>${score}</span>
        <span style="color: #94a3b8; font-weight: normal;">(${count})</span>
      </div>
    `;
  };

  /**
   * Render HTML string for a single product card
   */
  const renderProductCard = (product) => {
    const stockInfo = getStockStatus(product.stock);
    const hasDiscount = product.originalPrice && product.originalPrice > product.price;
    const discountPercent = hasDiscount
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : 0;

    const safeTitle = escapeHTML(product.title);
    const safeCategory = escapeHTML(product.category);
    const safeDesc = escapeHTML(product.description);
    const safeImage = escapeHTML(product.image);
    const safeBadge = product.badge ? escapeHTML(product.badge) : '';
    const safeFallbackSvg = getFallbackSvg(product.title, product.category);

    return `
      <article class="product-card" data-product-id="${product.id}" data-category="${safeCategory}">
        <div class="product-card-img-wrap" onclick="CampusCart.UI.openQuickView('${product.id}')" title="Click to preview details">
          <img 
            src="${safeImage}" 
            alt="${safeTitle}" 
            class="product-card-img" 
            loading="lazy"
            onerror="this.onerror=null; this.src='${safeFallbackSvg}';"
          >
          <div class="product-badge-group">
            ${safeBadge ? `<span class="badge-discount">${safeBadge}</span>` : ''}
            <span class="badge-stock ${stockInfo.class}">${stockInfo.label}</span>
          </div>
          <button type="button" class="product-quick-view-btn" aria-label="Quick preview ${safeTitle}">
            👁️ Quick View
          </button>
        </div>

        <div class="product-card-body">
          <div class="product-meta-row">
            <span class="product-category-tag">${safeCategory}</span>
            ${generateRatingHTML(product.rating, product.reviewsCount)}
          </div>

          <h3 class="product-title" onclick="CampusCart.UI.openQuickView('${product.id}')" title="${safeTitle}">
            ${safeTitle}
          </h3>

          <div class="product-price-row">
            <span class="product-price">${formatCurrency(product.price)}</span>
            ${hasDiscount ? `
              <span class="product-original-price">${formatCurrency(product.originalPrice)}</span>
              <span class="product-save-pill">Save ${discountPercent}%</span>
            ` : ''}
          </div>

          <div class="product-card-actions">
            <button 
              type="button" 
              class="btn-add-to-cart" 
              data-product-id="${product.id}"
              ${!stockInfo.canBuy ? 'disabled' : ''}
              aria-label="Add ${safeTitle} to cart"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
              </svg>
              <span>${stockInfo.canBuy ? 'Add to Cart' : 'Sold Out'}</span>
            </button>
          </div>
        </div>
      </article>
    `;
  };

  return {
    fetchProducts,
    getAllProducts,
    getProductById,
    getCategories,
    getStockStatus,
    renderProductCard,
    getFallbackSvg,
    formatCurrency,
    escapeHTML
  };
})();
