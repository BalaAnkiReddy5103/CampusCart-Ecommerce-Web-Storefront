/**
 * CampusCart - Filters & Sorting Module
 * Manages active search queries, category selections, sorting algorithms,
 * in-stock toggles, active filter tags, and seamless multi-filter integration.
 */

window.CampusCart = window.CampusCart || {};

CampusCart.Filters = (function () {
  'use strict';

  // State object
  const state = {
    searchQuery: '',
    selectedCategory: 'all',
    sortBy: 'featured',
    inStockOnly: false
  };

  let debounceTimer = null;

  /**
   * Initialize filter and search listeners
   */
  const initFilters = () => {
    const searchInput = document.getElementById('catalog-search-input');
    const searchClearBtn = document.getElementById('search-clear-btn');
    const sortDropdown = document.getElementById('catalog-sort');
    const inStockToggle = document.getElementById('filter-in-stock');
    const clearFiltersBtn = document.getElementById('clear-all-filters-btn');
    const emptyResetBtn = document.getElementById('empty-reset-btn');
    const categoryTabs = document.querySelectorAll('.filter-tab');

    // Live search input with debouncing (250ms)
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        const query = e.target.value.trim();
        if (searchClearBtn) {
          searchClearBtn.hidden = query.length === 0;
        }
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          state.searchQuery = query;
          applyFilters();
        }, 250);
      });
    }

    // Clear search button
    if (searchClearBtn) {
      searchClearBtn.addEventListener('click', () => {
        if (searchInput) {
          searchInput.value = '';
          searchInput.focus();
        }
        searchClearBtn.hidden = true;
        state.searchQuery = '';
        applyFilters();
      });
    }

    // Category filter tabs
    categoryTabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        const category = tab.getAttribute('data-category') || 'all';
        setCategory(category);
      });
    });

    // Sort dropdown change
    if (sortDropdown) {
      sortDropdown.addEventListener('change', (e) => {
        state.sortBy = e.target.value;
        applyFilters();
      });
    }

    // In-stock checkbox toggle
    if (inStockToggle) {
      inStockToggle.addEventListener('change', (e) => {
        state.inStockOnly = e.target.checked;
        applyFilters();
      });
    }

    // Reset filters buttons
    if (clearFiltersBtn) {
      clearFiltersBtn.addEventListener('click', clearAllFilters);
    }
    if (emptyResetBtn) {
      emptyResetBtn.addEventListener('click', clearAllFilters);
    }

    // Initial render
    applyFilters();
  };

  /**
   * Set category and sync UI tabs
   */
  const setCategory = (categoryName) => {
    state.selectedCategory = categoryName;

    // Update active class on filter tabs
    const categoryTabs = document.querySelectorAll('.filter-tab');
    categoryTabs.forEach((tab) => {
      const tabCat = tab.getAttribute('data-category');
      const isMatch = (categoryName === 'all' && tabCat === 'all') || (tabCat === categoryName);
      tab.classList.toggle('active', isMatch);
      tab.setAttribute('aria-selected', isMatch ? 'true' : 'false');
    });

    applyFilters();
  };

  /**
   * Reset all filters to initial state
   */
  const clearAllFilters = () => {
    state.searchQuery = '';
    state.selectedCategory = 'all';
    state.sortBy = 'featured';
    state.inStockOnly = false;

    // Reset form elements
    const searchInput = document.getElementById('catalog-search-input');
    const searchClearBtn = document.getElementById('search-clear-btn');
    const sortDropdown = document.getElementById('catalog-sort');
    const inStockToggle = document.getElementById('filter-in-stock');

    if (searchInput) searchInput.value = '';
    if (searchClearBtn) searchClearBtn.hidden = true;
    if (sortDropdown) sortDropdown.value = 'featured';
    if (inStockToggle) inStockToggle.checked = false;

    // Reset tab pills
    const categoryTabs = document.querySelectorAll('.filter-tab');
    categoryTabs.forEach((tab) => {
      const isAll = tab.getAttribute('data-category') === 'all';
      tab.classList.toggle('active', isAll);
      tab.setAttribute('aria-selected', isAll ? 'true' : 'false');
    });

    applyFilters();
    CampusCart.UI.showToast('All filters have been reset.', 'info');
  };

  /**
   * Main filtering and sorting pipeline
   */
  const applyFilters = () => {
    const allProducts = CampusCart.Products.getAllProducts();
    const gridContainer = document.getElementById('products-grid');
    const emptyStateEl = document.getElementById('empty-products-state');
    const countEl = document.getElementById('products-visible-count');

    if (!allProducts || allProducts.length === 0) {
      if (gridContainer) gridContainer.innerHTML = '';
      if (emptyStateEl) emptyStateEl.hidden = false;
      return;
    }

    // 1. Filter by Category
    let filtered = allProducts.filter((product) => {
      if (state.selectedCategory !== 'all' && product.category !== state.selectedCategory) {
        return false;
      }
      return true;
    });

    // 2. Filter by Search Query (title, description, category, badge)
    if (state.searchQuery) {
      const q = state.searchQuery.toLowerCase();
      filtered = filtered.filter((product) => {
        return (
          product.title.toLowerCase().includes(q) ||
          product.description.toLowerCase().includes(q) ||
          product.category.toLowerCase().includes(q) ||
          (product.badge && product.badge.toLowerCase().includes(q))
        );
      });
    }

    // 3. Filter by In-Stock Only
    if (state.inStockOnly) {
      filtered = filtered.filter(product => product.stock > 0);
    }

    // 4. Sort results
    switch (state.sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'name':
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'featured':
      default:
        // Keep original order
        break;
    }

    // Update visible counter
    if (countEl) {
      countEl.textContent = filtered.length;
    }

    // Update active filter chips
    renderActiveFilterTags();

    // Render cards or show empty state
    if (filtered.length === 0) {
      if (gridContainer) gridContainer.innerHTML = '';
      if (emptyStateEl) emptyStateEl.hidden = false;
    } else {
      if (emptyStateEl) emptyStateEl.hidden = true;
      if (gridContainer) {
        gridContainer.innerHTML = filtered.map(product => CampusCart.Products.renderProductCard(product)).join('');
        // Re-bind Add to Cart buttons
        bindAddToCartButtons();
      }
    }
  };

  /**
   * Bind event listeners to Add to Cart buttons on rendered cards
   */
  const bindAddToCartButtons = () => {
    const buttons = document.querySelectorAll('.btn-add-to-cart');
    buttons.forEach((btn) => {
      // Remove any existing click listeners to avoid duplicates
      btn.replaceWith(btn.cloneNode(true));
    });

    const refreshedButtons = document.querySelectorAll('.btn-add-to-cart');
    refreshedButtons.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const productId = btn.getAttribute('data-product-id');
        if (productId) {
          CampusCart.Cart.addItem(productId, 1);
        }
      });
    });
  };

  /**
   * Render active filter tags in the status bar
   */
  const renderActiveFilterTags = () => {
    const tagsContainer = document.getElementById('active-tags-list');
    if (!tagsContainer) return;

    const tags = [];

    if (state.selectedCategory !== 'all') {
      tags.push({
        label: `Category: ${state.selectedCategory}`,
        clearFn: () => setCategory('all')
      });
    }

    if (state.searchQuery) {
      tags.push({
        label: `Search: "${state.searchQuery}"`,
        clearFn: () => {
          const searchInput = document.getElementById('catalog-search-input');
          const searchClearBtn = document.getElementById('search-clear-btn');
          if (searchInput) searchInput.value = '';
          if (searchClearBtn) searchClearBtn.hidden = true;
          state.searchQuery = '';
          applyFilters();
        }
      });
    }

    if (state.inStockOnly) {
      tags.push({
        label: 'In Stock Only',
        clearFn: () => {
          const inStockToggle = document.getElementById('filter-in-stock');
          if (inStockToggle) inStockToggle.checked = false;
          state.inStockOnly = false;
          applyFilters();
        }
      });
    }

    if (state.sortBy !== 'featured') {
      const sortDropdown = document.getElementById('catalog-sort');
      const sortLabel = sortDropdown ? sortDropdown.options[sortDropdown.selectedIndex].text : state.sortBy;
      tags.push({
        label: sortLabel,
        clearFn: () => {
          if (sortDropdown) sortDropdown.value = 'featured';
          state.sortBy = 'featured';
          applyFilters();
        }
      });
    }

    if (tags.length === 0) {
      tagsContainer.innerHTML = '';
      return;
    }

    tagsContainer.innerHTML = tags.map((t, idx) => `
      <span class="filter-tag-pill" data-tag-index="${idx}">
        <span>${CampusCart.Products.escapeHTML(t.label)}</span>
        <button type="button" class="tag-remove-btn" aria-label="Remove filter">&times;</button>
      </span>
    `).join('');

    // Attach click listeners to tags
    const tagElements = tagsContainer.querySelectorAll('.filter-tag-pill');
    tagElements.forEach((el, idx) => {
      const btn = el.querySelector('.tag-remove-btn');
      if (btn && tags[idx]) {
        btn.addEventListener('click', tags[idx].clearFn);
      }
    });
  };

  return {
    initFilters,
    setCategory,
    clearAllFilters,
    applyFilters
  };
})();
