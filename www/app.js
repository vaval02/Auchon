// ==================== STATE MANAGEMENT ====================

class ShoppingListApp {
    constructor() {
        this.currentCategory = -1;
        this.shoppingList = {};
        this.currentRecipeForDetails = null;
        this.recipeIngredientsToAdd = [];
        this.currentEditingProduct = null;
        this.currentEditingCategory = null;
        this.currentEditingRecipe = null;
        this.currentEditingCategoryIndex = null;

        // Load or initialize data
        this.loadOrInitializeData();
        this.init();
    }

    loadOrInitializeData() {
        const savedData = localStorage.getItem('shoppingListData');
        const defaultCategories = this.getDefaultCategories();
        if (savedData) {
            const data = JSON.parse(savedData);
            if (!Array.isArray(data.categories) || data.categories.length < defaultCategories.length) {
                this.categories = defaultCategories;
            } else {
                this.categories = this.mergeSavedCategories(data.categories);
            }
            this.recipes = Array.isArray(data.recipes) ? data.recipes : this.getDefaultRecipes();
            this.shoppingList = data.shoppingList || {};
        } else {
            this.categories = defaultCategories;
            this.recipes = this.getDefaultRecipes();
            this.shoppingList = {};
        }
    }

    getDefaultCategories() {
        return [
            {
                id: 'santé',
                name: 'Santé et hygiène',
                autoSort: true,
                products: [
                    { id: 1, name: 'Papier toilette' },
                    { id: 2, name: 'Sopalin' },
                    { id: 3, name: 'Dentifrice' },
                    { id: 4, name: 'Savon' },
                    { id: 5, name: 'Shampoing' }
                ]
            },
            {
                id: 'fruits-legumes',
                name: 'Fruits et légumes',
                autoSort: true,
                products: [
                    { id: 6, name: 'Carottes' },
                    { id: 7, name: 'Courgettes' },
                    { id: 8, name: 'Pommes' },
                    { id: 9, name: 'Tomates' },
                    { id: 10, name: 'Oignons' },
                    { id: 11, name: 'Ail' },
                    { id: 12, name: 'Brocoli' }
                ]
            },
            {
                id: 'viandes-poissons',
                name: 'Viandes et poissons',
                autoSort: true,
                products: [
                    { id: 13, name: 'Viande hachée' },
                    { id: 14, name: 'Poulet' },
                    { id: 15, name: 'Saumon' },
                    { id: 16, name: 'Morue' },
                    { id: 17, name: 'Steak' }
                ]
            },
            {
                id: 'produits-laitiers',
                name: 'Produits laitiers',
                autoSort: true,
                products: [
                    { id: 18, name: 'Lait' },
                    { id: 19, name: 'Yaourt' },
                    { id: 20, name: 'Fromage' },
                    { id: 21, name: 'Beurre' },
                    { id: 22, name: 'Crème fraîche' }
                ]
            },
            {
                id: 'epicerie',
                name: 'Épicerie',
                autoSort: true,
                products: [
                    { id: 23, name: 'Pâtes' },
                    { id: 24, name: 'Riz' },
                    { id: 25, name: 'Sauce tomate' },
                    { id: 26, name: 'Farine' },
                    { id: 27, name: 'Sucre' },
                    { id: 28, name: 'Sel' },
                    { id: 29, name: 'Huile d\'olive' }
                ]
            },
            {
                id: 'boissons',
                name: 'Boissons',
                autoSort: true,
                products: [
                    { id: 30, name: 'Eau minérale' },
                    { id: 31, name: 'Jus d\'orange' },
                    { id: 32, name: 'Café' },
                    { id: 33, name: 'Thé' },
                    { id: 34, name: 'Vin' }
                ]
            },
            {
                id: 'surgeles',
                name: 'Surgelés',
                autoSort: true,
                products: [
                    { id: 35, name: 'Glaçons' },
                    { id: 36, name: 'Frites' },
                    { id: 37, name: 'Petits pois' },
                    { id: 38, name: 'Pizza' }
                ]
            },
            {
                id: 'autres',
                name: 'Autres',
                autoSort: true,
                products: [
                    { id: 39, name: 'Pain' },
                    { id: 40, name: 'Biscuits' }
                ]
            }
        ];
    }

    mergeSavedCategories(savedCategories) {
        const defaultCategories = this.getDefaultCategories();
        const defaultIds = new Set(defaultCategories.map(category => category.id));
        const savedMap = new Map(savedCategories.map(category => [category.id, category]));

        const merged = defaultCategories.map(defaultCategory => {
            return savedMap.has(defaultCategory.id) ? savedMap.get(defaultCategory.id) : defaultCategory;
        });

        savedCategories.forEach(category => {
            if (!defaultIds.has(category.id)) {
                merged.push(category);
            }
        });

        if (merged.length < defaultCategories.length) {
            return defaultCategories;
        }

        return merged;
    }

    getDefaultRecipes() {
        return [
            {
                id: 1,
                name: 'Pâtes Bolognaise',
                ingredients: [
                    { name: 'Pâtes', quantity: '1' },
                    { name: 'Viande hachée', quantity: '1' },
                    { name: 'Sauce tomate', quantity: '1 boîte' },
                    { name: 'Oignons', quantity: '1' },
                    { name: 'Ail', quantity: '1' }
                ]
            },
            {
                id: 2,
                name: 'Chili Con Carne',
                ingredients: [
                    { name: 'Viande hachée', quantity: '1' },
                    { name: 'Haricots rouges', quantity: '1 boîte' },
                    { name: 'Tomates', quantity: '1' },
                    { name: 'Oignons', quantity: '1' },
                    { name: 'Ail', quantity: '1' }
                ]
            },
            {
                id: 3,
                name: 'Curry Japonais',
                ingredients: [
                    { name: 'Curry', quantity: '1 boîte' },
                    { name: 'Carottes', quantity: '1' },
                    { name: 'Pommes de terre', quantity: '1' },
                    { name: 'Haut de cuisse de poulet', quantity: '1' }
                ]
            }
        ];
    }

    saveData() {
        const data = {
            categories: this.categories,
            recipes: this.recipes,
            shoppingList: this.shoppingList
        };
        const lastUpdated = Date.now();
        localStorage.setItem('shoppingListData', JSON.stringify(data));
        localStorage.setItem('shoppingListLastUpdated', lastUpdated.toString());
        // Dispatch event so sync bridge can push to cloud if authenticated
        try {
            window.dispatchEvent(new CustomEvent('app:save', {
                detail: {
                    payload: data,
                    lastUpdated
                }
            }));
        } catch (e) {
            console.warn('Could not dispatch app:save event', e);
        }
    }

    // ==================== INITIALIZATION ====================

    init() {
        this.setupEventListeners();
        document.body.classList.add('products-active');
        this.renderCategories();
        this.renderProductsCategorySelect();
        this.populateProductCategorySelect();
        this.loadMenu();
        this.renderMenu();
        this.updateProductsToolbarVisibility();
        this.renderProducts();
        this.renderRecipes();
        this.renderShoppingList();
        // listen for remote updates applied by sync bridge
        window.addEventListener('app:remoteUpdate', () => {
            this.loadOrInitializeData();
            this.renderCategories();
            this.renderProducts();
            this.renderRecipes();
            this.renderShoppingList();
        });
    }

    setupEventListeners() {
        // Tab navigation
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleTabClick(e));
        });

        const categorySelect = document.getElementById('productsCategorySelect');
        if (categorySelect) {
            categorySelect.addEventListener('change', () => this.handleProductsCategorySelect(categorySelect));
        }

        // Category buttons
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('category-btn')) {
                this.handleCategoryClick(e.target);
            }
        });

        // Modals
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', (e) => {
                if (e.target.classList.contains('modal-close')) {
                    this.closeModal(e.target.closest('.modal'));
                }
            });
        });

        // Modal background click
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal(modal);
                }
            });
        });

        // Add category
        document.getElementById('addCategoryBtn').addEventListener('click', () => {
            this.openModal('addCategoryModal');
        });

        document.getElementById('confirmCategoryBtn').addEventListener('click', () => {
            this.addCategory();
        });

        document.getElementById('categoryInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addCategory();
        });

        // Add product
        const addProductBtn = document.getElementById('addProductBtn');
        if (addProductBtn) {
            addProductBtn.addEventListener('click', () => {
                this.openModal('addProductModal');
            });
        }

        document.getElementById('confirmProductBtn').addEventListener('click', () => {
            this.addProduct();
        });

        document.getElementById('productInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addProduct();
        });

        // Add recipe
        document.getElementById('addRecipeBtn').addEventListener('click', () => {
            this.openModal('addRecipeModal');
            this.addIngredientInputRow();
        });

        document.getElementById('addIngredientBtn').addEventListener('click', () => {
            this.addIngredientInputRow();
        });

        const selectAllIngredientsBtn = document.getElementById('selectAllIngredientsBtn');
        if (selectAllIngredientsBtn) {
            selectAllIngredientsBtn.addEventListener('click', () => {
                this.toggleSelectAllIngredients();
            });
        }

        document.getElementById('confirmRecipeBtn').addEventListener('click', () => {
            this.addRecipe();
        });

        document.getElementById('recipeNameInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addRecipe();
        });

        // Edit product
        document.getElementById('confirmEditProductBtn').addEventListener('click', () => {
            this.saveProductEdit();
        });

        document.getElementById('editProductInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.saveProductEdit();
        });

        // Shopping list actions
        document.getElementById('clearListBtn').addEventListener('click', () => {
            if (confirm('Vider la liste de courses ?')) {
                this.shoppingList = {};
                this.saveData();
                this.renderShoppingList();
                this.updateProductChecks();
            }
        });

        // clear button in shopping tab (mobile)
        const clearTabBtn = document.getElementById('clearListBtnTab');
        if (clearTabBtn) {
            clearTabBtn.addEventListener('click', () => {
                if (confirm('Vider la liste de courses ?')) {
                    this.shoppingList = {};
                    this.saveData();
                    this.renderShoppingList();
                    this.updateProductChecks();
                }
            });
        }

        const searchInput = document.getElementById('productSearchInput');
        const searchBtn = document.getElementById('productSearchBtn');
        const clearSearchBtn = document.getElementById('productSearchClearBtn');

        if (searchInput) {
            searchInput.addEventListener('input', () => this.renderProducts());
            searchInput.addEventListener('search', () => this.renderProducts());
        }

        if (searchBtn) {
            searchBtn.addEventListener('click', () => this.renderProducts());
        }

        if (clearSearchBtn) {
            clearSearchBtn.addEventListener('click', (event) => {
                event.stopPropagation();
                if (searchInput) {
                    searchInput.value = '';
                    searchInput.focus();
                }
                this.renderProducts();
            });
        }




        // Edit category & recipe modal actions
        document.getElementById('confirmEditCategoryBtn').addEventListener('click', () => {
            this.saveCategoryEdit();
        });
        document.getElementById('deleteCategoryBtn').addEventListener('click', () => {
            this.deleteCategoryConfirmed();
        });

        document.getElementById('addIngredientToRecipeBtn').addEventListener('click', () => {
            this.addIngredientToRecipeRow();
        });

        document.getElementById('confirmEditRecipeBtn').addEventListener('click', () => {
            this.saveEditedRecipe();
        });

        // Unknown ingredient modal confirmation
        const confirmUnknownBtn = document.getElementById('confirmUnknownIngredientBtn');
        if (confirmUnknownBtn) {
            confirmUnknownBtn.addEventListener('click', () => {
                const modal = document.getElementById('unknownIngredientModal');
                const ingredientName = modal.dataset.ingredientName || '';
                const sel = document.getElementById('unknownIngredientCategorySelect');
                const catId = sel?.value;
                const category = this.categories.find(c => c.id === catId) || this.categories[0];
                const newProduct = { id: this.getNextProductId(), name: ingredientName };
                if (!category.products) category.products = [];
                category.products.push(newProduct);
                this.saveData();
                // If we have a target row id, try to update the input
                const targetRowId = modal.dataset.targetRowId;
                if (targetRowId) {
                    const row = document.querySelector(`[data-row-id="${targetRowId}"]`);
                    if (row) {
                        const input = row.querySelector('input:first-child');
                        if (input) input.value = newProduct.name;
                    }
                }
                this.closeModal(modal);
                this.renderProducts();
            });
        }

        // Weekly menu save button
        const saveMenuBtn = document.getElementById('saveMenuBtn');
        if (saveMenuBtn) {
            saveMenuBtn.addEventListener('click', () => {
                this.saveMenu();
            });
        }

        // Recipe details modal confirmation
        document.getElementById('addRecipeIngredientsBtn').addEventListener('click', () => {
            this.confirmRecipeIngredients();
        });

    }

    // ==================== MODAL MANAGEMENT ====================

    openModal(modalId) {
        const modal = document.getElementById(modalId);
        modal.classList.add('active');
        
        // Clear inputs when opening
        if (modalId === 'addCategoryModal') {
            document.getElementById('categoryInput').value = '';
            document.getElementById('categoryInput').focus();
        } else if (modalId === 'addProductModal') {
            document.getElementById('productInput').value = '';
            this.populateProductCategorySelect();
            document.getElementById('productInput').focus();
        } else if (modalId === 'addRecipeModal') {
            document.getElementById('recipeNameInput').value = '';
            document.getElementById('ingredientsList').innerHTML = '';
        }
    }

    closeModal(modal) {
        modal.classList.remove('active');
    }

    // ==================== CATEGORY MANAGEMENT ====================

    renderCategories() {
        const list = document.getElementById('categoriesList');
        list.innerHTML = '';

        this.categories.forEach((category, index) => {
            const row = document.createElement('div');
            row.className = 'category-row';

            const btn = document.createElement('button');
            btn.className = `category-btn ${index === this.currentCategory ? 'active' : ''}`;
            btn.dataset.index = index;

            const nameSpan = document.createElement('span');
            nameSpan.textContent = category.name;
            nameSpan.style.pointerEvents = 'none';

            const actions = document.createElement('div');
            actions.className = 'category-actions';

            const editBtn = document.createElement('button');
            editBtn.className = 'category-edit';
            editBtn.innerHTML = '<i class="fas fa-pen"></i>';
            editBtn.title = 'Renommer la catégorie';
            editBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.editCategory(index);
            });

            const addProductBtn = document.createElement('button');
            addProductBtn.className = 'category-add-product';
            addProductBtn.innerHTML = '<i class="fas fa-plus"></i>';
            addProductBtn.title = 'Ajouter un produit dans cette catégorie';
            addProductBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.handleAddProductToCategory(index);
            });

            actions.appendChild(editBtn);
            actions.appendChild(addProductBtn);

            btn.appendChild(nameSpan);
            btn.addEventListener('click', () => this.handleCategoryClick(btn));

            row.appendChild(btn);
            row.appendChild(actions);
            list.appendChild(row);
        });
    }

    handleCategoryClick(btn) {
        this.currentCategory = parseInt(btn.dataset.index);
        document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.renderProductsCategorySelect();
        this.renderProducts();
        this.scrollToCurrentCategory();
    }

    updateProductsToolbarVisibility(tabName = 'products') {
        const toolbar = document.getElementById('productsToolbar');
        if (toolbar) {
            toolbar.classList.toggle('active', tabName === 'products');
        }
    }

    renderProductsCategorySelect() {
        const select = document.getElementById('productsCategorySelect');
        if (!select) return;

        select.innerHTML = '<option value="all" selected>Toutes</option>';

        this.categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.id;
            option.textContent = category.name;
            select.appendChild(option);
        });
    }

    handleProductsCategorySelect(select) {
        const value = select.value;
        const categoryIndex = value === 'all' ? -1 : this.categories.findIndex(category => category.id === value);
        if (categoryIndex >= 0) {
            this.scrollToCategoryIndex(categoryIndex);
        }
        select.value = 'all';
    }

    scrollToCurrentCategory() {
        const category = this.categories[this.currentCategory];
        if (!category) return;

        const section = document.getElementById(`category-${category.id}`);
        if (section) {
            section.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    scrollToCategoryIndex(index) {
        const category = this.categories[index];
        if (!category) return;

        const section = document.getElementById(`category-${category.id}`);
        if (section) {
            section.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    addCategory() {
        const input = document.getElementById('categoryInput');
        const name = input.value.trim();

        if (!name) {
            alert('Veuillez entrer un nom de catégorie');
            return;
        }

        const newCategory = {
            id: 'custom-' + Date.now(),
            name: name,
            products: []
        };

        this.categories.push(newCategory);
        this.currentCategory = this.categories.length - 1;
        this.saveData();
        this.renderCategories();
        this.renderProductsCategorySelect();
        this.renderProducts();
        this.closeModal(document.getElementById('addCategoryModal'));
    }

    // ==================== PRODUCT MANAGEMENT ====================

    renderProducts() {
        const list = document.getElementById('productsList');
        const toc = document.getElementById('productsToc');
        list.innerHTML = '';
        if (toc) toc.innerHTML = '';

        const searchQuery = document.getElementById('productSearchInput')?.value.trim().toLowerCase();
        const titleEl = document.getElementById('categoryTitle');

        if (searchQuery) {
            if (titleEl) titleEl.textContent = `Résultats pour « ${searchQuery} »`;

            const matches = [];
            this.categories.forEach(category => {
                const productsToShow = category.autoSort ? [...category.products].sort((a, b) => a.name.localeCompare(b.name)) : category.products;

                productsToShow.forEach(product => {
                    if (product.name.toLowerCase().includes(searchQuery)) {
                        matches.push({ product, categoryName: category.name });
                    }
                });
            });

            if (matches.length === 0) {
                const noResult = document.createElement('div');
                noResult.className = 'empty-state';
                noResult.textContent = `Aucun produit trouvé pour « ${searchQuery} »`;
                const addBtn = document.createElement('button');
                addBtn.className = 'btn-primary';
                addBtn.textContent = `Ajouter "${searchQuery}"`;
                addBtn.addEventListener('click', () => {
                    // Open add product modal prefilled and ask for category
                    this.openModal('addProductModal');
                    document.getElementById('productInput').value = searchQuery;
                    this.populateProductCategorySelect();
                    const sel = document.getElementById('productCategorySelect');
                    if (sel) sel.focus();
                });
                list.appendChild(noResult);
                list.appendChild(addBtn);
                return;
            }

            matches.forEach(({ product, categoryName }) => {
                const item = document.createElement('div');
                item.className = 'product-item';

                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.id = `product-${product.id}`;
                checkbox.dataset.productName = product.name;
                checkbox.checked = this.shoppingList[product.name] !== undefined;
                checkbox.addEventListener('change', () => {
                    this.toggleProduct(product.name, checkbox.checked, categoryName);
                });

                const label = document.createElement('label');
                label.htmlFor = `product-${product.id}`;
                label.textContent = product.name;
                label.style.cursor = 'text';
                label.title = 'Double-cliquez pour éditer';
                label.addEventListener('dblclick', () => {
                    this.editProduct(this.categories.find(cat => cat.name === categoryName), product);
                });

                const editBtn = document.createElement('button');
                editBtn.type = 'button';
                editBtn.className = 'product-edit';
                editBtn.innerHTML = '<i class="fas fa-pen"></i>';
                editBtn.title = 'Renommer ce produit';
                editBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const category = this.categories.find(cat => cat.name === categoryName);
                    if (category) this.editProduct(category, product);
                });

                const categoryChip = document.createElement('span');
                categoryChip.className = 'product-category-chip';
                categoryChip.textContent = categoryName;

                const deleteBtn = document.createElement('button');
                deleteBtn.className = 'product-delete';
                deleteBtn.innerHTML = '<i class="fas fa-times"></i>';
                deleteBtn.title = 'Supprimer ce produit';
                deleteBtn.addEventListener('click', () => {
                    const category = this.categories.find(cat => cat.name === categoryName);
                    if (category) this.deleteProduct(category, product);
                });

                item.appendChild(checkbox);
                item.appendChild(label);
                item.appendChild(editBtn);
                item.appendChild(categoryChip);
                item.appendChild(deleteBtn);
                list.appendChild(item);
            });

            return;
        }

        if (titleEl) titleEl.textContent = 'Tous les produits';

        if (this.categories.length === 0) {
            const emptySection = document.createElement('div');
            emptySection.className = 'empty-state';
            emptySection.textContent = 'Aucun produit disponible';
            list.appendChild(emptySection);
            return;
        }

        this.categories.forEach((category, index) => {
            const section = document.createElement('section');
            section.className = 'category-section';
            section.id = `category-${category.id}`;

            const headingRow = document.createElement('div');
            headingRow.className = 'category-section-header';

            const heading = document.createElement('h3');
            heading.textContent = category.name;

            const headingActions = document.createElement('div');
            headingActions.className = 'category-section-actions';

            const sortToggle = document.createElement('button');
            sortToggle.type = 'button';
            sortToggle.className = 'category-section-action-btn sort-toggle';
            sortToggle.title = 'Activer/désactiver le tri alphabétique';
            sortToggle.innerHTML = '<i class="fas fa-sort-alpha-down"></i>';
            if (category.autoSort) sortToggle.classList.add('active');
            sortToggle.addEventListener('click', (e) => {
                e.stopPropagation();
                category.autoSort = !category.autoSort;
                this.saveData();
                this.renderProducts();
            });

            const editBtn = document.createElement('button');
            editBtn.type = 'button';
            editBtn.className = 'category-section-action-btn';
            editBtn.innerHTML = '<i class="fas fa-pen"></i>';
            editBtn.title = 'Renommer la catégorie';
            editBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.editCategory(index);
            });

            const addProductSectionBtn = document.createElement('button');
            addProductSectionBtn.type = 'button';
            addProductSectionBtn.className = 'category-section-action-btn';
            addProductSectionBtn.innerHTML = '<i class="fas fa-plus"></i>';
            addProductSectionBtn.title = 'Ajouter un produit dans cette catégorie';
            addProductSectionBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.handleAddProductToCategory(index);
            });

            headingActions.appendChild(sortToggle);
            headingActions.appendChild(editBtn);
            headingActions.appendChild(addProductSectionBtn);

            headingRow.appendChild(heading);
            headingRow.appendChild(headingActions);
            section.appendChild(headingRow);

            if (category.products.length === 0) {
                const emptySection = document.createElement('div');
                emptySection.className = 'category-empty-state';
                emptySection.textContent = 'Aucun produit dans cette catégorie';
                section.appendChild(emptySection);
            } else {
                const grid = document.createElement('div');
                grid.className = 'category-product-grid';

                category.products.forEach(product => {
                    const item = document.createElement('div');
                    item.className = 'product-item';

                    const checkbox = document.createElement('input');
                    checkbox.type = 'checkbox';
                    checkbox.id = `product-${product.id}`;
                    checkbox.dataset.productName = product.name;
                    checkbox.checked = this.shoppingList[product.name] !== undefined;
                    checkbox.addEventListener('change', () => {
                        this.toggleProduct(product.name, checkbox.checked, category.name);
                    });

                    const label = document.createElement('label');
                    label.htmlFor = `product-${product.id}`;
                    label.textContent = product.name;
                    label.style.cursor = 'text';
                    label.title = 'Double-cliquez pour éditer';
                    label.addEventListener('dblclick', () => {
                        this.editProduct(category, product);
                    });

                    const editBtn = document.createElement('button');
                    editBtn.type = 'button';
                    editBtn.className = 'product-edit';
                    editBtn.innerHTML = '<i class="fas fa-pen"></i>';
                    editBtn.title = 'Renommer ce produit';
                    editBtn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        this.editProduct(category, product);
                    });

                    const deleteBtn = document.createElement('button');
                    deleteBtn.className = 'product-delete';
                    deleteBtn.innerHTML = '<i class="fas fa-times"></i>';
                    deleteBtn.title = 'Supprimer ce produit';
                    deleteBtn.addEventListener('click', () => {
                        this.deleteProduct(category, product);
                    });

                    item.appendChild(checkbox);
                    item.appendChild(label);
                    item.appendChild(editBtn);
                    item.appendChild(deleteBtn);
                    grid.appendChild(item);
                });

                section.appendChild(grid);
            }

            list.appendChild(section);
        });

        const footer = document.createElement('div');
        footer.className = 'products-add-category-footer';
        const addCategoryButton = document.createElement('button');
        addCategoryButton.type = 'button';
        addCategoryButton.className = 'btn-secondary add-category-footer-btn';
        addCategoryButton.textContent = 'Ajouter une catégorie';
        addCategoryButton.addEventListener('click', () => {
            this.openModal('addCategoryModal');
        });
        footer.appendChild(addCategoryButton);
        list.appendChild(footer);
    }

    observeProductSections(listContainer) {
        if (this.productsTocObserver) {
            this.productsTocObserver.disconnect();
        }

        const navLinks = Array.from(document.querySelectorAll('.products-toc a'));
        const sections = navLinks
            .map(link => document.getElementById(link.dataset.target))
            .filter(Boolean);

        if (!sections.length) return;

        this.productsTocObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const link = navLinks.find(item => item.dataset.target === entry.target.id);
                if (!link) return;

                if (entry.isIntersecting && entry.intersectionRatio > 0.3) {
                    navLinks.forEach(item => item.classList.remove('active'));
                    link.classList.add('active');
                }
            });
        }, {
            root: listContainer,
            threshold: 0.35,
            rootMargin: '0px 0px -60% 0px'
        });

        sections.forEach(section => this.productsTocObserver.observe(section));
    }

    addProduct() {
        const input = document.getElementById('productInput');
        const name = input.value.trim();

        if (!name) {
            alert('Veuillez entrer un nom de produit');
            return;
        }

        // Determine category from select if present
        let category = null;
        const sel = document.getElementById('productCategorySelect');
        if (sel && sel.value) {
            category = this.categories.find(c => c.id === sel.value) || null;
        }
        // fallback to currentCategory
        if (!category && this.currentCategory >= 0) category = this.categories[this.currentCategory];
        // fallback to first category
        if (!category && this.categories.length) category = this.categories[0];

        const newProduct = { id: this.getNextProductId(), name: name };
        if (!category.products) category.products = [];
        category.products.push(newProduct);
        this.saveData();
        this.renderProducts();
        this.closeModal(document.getElementById('addProductModal'));
    }

    populateProductCategorySelect() {
        const sel = document.getElementById('productCategorySelect');
        if (!sel) return;
        sel.innerHTML = '';
        this.categories.forEach(cat => {
            const opt = document.createElement('option');
            opt.value = cat.id;
            opt.textContent = cat.name;
            sel.appendChild(opt);
        });
    }

    populateUnknownIngredientCategorySelect() {
        const sel = document.getElementById('unknownIngredientCategorySelect');
        if (!sel) return;
        sel.innerHTML = '';
        this.categories.forEach(cat => {
            const opt = document.createElement('option');
            opt.value = cat.id;
            opt.textContent = cat.name;
            sel.appendChild(opt);
        });
    }

    showUnknownIngredientModal(ingredientName, targetRow) {
        const modal = document.getElementById('unknownIngredientModal');
        const label = document.getElementById('unknownIngredientLabel');
        if (!modal || !label) return;
        label.innerHTML = `L'ingrédient <strong>${ingredientName}</strong> n'existe pas. Sélectionnez une catégorie :`;
        this.populateUnknownIngredientCategorySelect();
        modal.classList.add('active');
        // store references
        modal.dataset.ingredientName = ingredientName;
        modal.dataset.targetRowId = targetRow ? targetRow.dataset.rowId : '';
    }

    deleteProduct(category, product) {
        if (confirm(`Supprimer "${product.name}" ?`)) {
            category.products = category.products.filter(p => p.id !== product.id);
            this.saveData();
            this.renderProducts();
        }
    }

    handleAddProductToCategory(index) {
        if (index < 0 || index >= this.categories.length) return;
        this.currentCategory = index;
        this.renderCategories();
        this.renderProductsCategorySelect();
        this.openModal('addProductModal');
        const input = document.getElementById('productInput');
        if (input) {
            input.value = '';
            input.focus();
        }
    }

    editProduct(category, product) {
        this.currentEditingProduct = product;
        this.currentEditingCategory = category;
        document.getElementById('editProductInput').value = product.name;
        this.openModal('editProductModal');
        document.getElementById('editProductInput').focus();
        document.getElementById('editProductInput').select();
    }

    saveProductEdit() {
        const newName = document.getElementById('editProductInput').value.trim();

        if (!newName) {
            alert('Veuillez entrer un nom de produit');
            return;
        }

        if (!this.currentEditingProduct || !this.currentEditingCategory) {
            return;
        }

        const oldName = this.currentEditingProduct.name;
        this.currentEditingProduct.name = newName;

        // Update shopping list if the product was there
        if (this.shoppingList[oldName]) {
            const data = this.shoppingList[oldName];
            delete this.shoppingList[oldName];
            this.shoppingList[newName] = data;
        }

        this.saveData();
        this.renderProducts();
        this.renderShoppingList();
        this.closeModal(document.getElementById('editProductModal'));
        this.currentEditingProduct = null;
        this.currentEditingCategory = null;
    }

    // ==================== SHOPPING LIST MANAGEMENT ====================

    toggleProduct(productName, checked, categoryName) {
        if (checked) {
            if (this.shoppingList[productName] === undefined) {
                this.shoppingList[productName] = {
                    quantity: 1,
                    source: 'manual',
                    category: categoryName || this.findCategoryName(productName) || 'Autres'
                };
            } else {
                this.shoppingList[productName].quantity += 1;
            }
        } else {
            delete this.shoppingList[productName];
        }
        this.saveData();
        this.renderShoppingList();
        this.updateProductChecks();
    }

    addToShoppingList(productName, quantity = 1, source = 'recipe') {
        const categoryName = this.findCategoryName(productName) || 'Autres';
        if (this.shoppingList[productName]) {
            this.shoppingList[productName].quantity += quantity;
        } else {
            this.shoppingList[productName] = {
                quantity: quantity,
                source: source,
                category: categoryName
            };
        }
        this.saveData();
        this.renderShoppingList();
        this.updateProductChecks();
    }

    findCategoryName(productName) {
        const category = this.categories.find(cat => cat.products.some(product => product.name === productName));
        return category ? category.name : null;
    }

    getNextProductId() {
        const allIds = this.categories.flatMap(category => category.products.map(product => product.id));
        return Math.max(...allIds, 0) + 1;
    }

    parseIngredientQuantity(quantity) {
        if (typeof quantity === 'number') return quantity;
        const match = String(quantity).trim().match(/^(\d+)\b/);
        return match ? parseInt(match[1], 10) : 1;
    }

    // Simple Levenshtein distance and fuzzy matching utilities
    levenshtein(a, b) {
        a = a.toLowerCase();
        b = b.toLowerCase();
        const m = a.length;
        const n = b.length;
        const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
        for (let i = 0; i <= m; i++) dp[i][0] = i;
        for (let j = 0; j <= n; j++) dp[0][j] = j;
        for (let i = 1; i <= m; i++) {
            for (let j = 1; j <= n; j++) {
                const cost = a[i - 1] === b[j - 1] ? 0 : 1;
                dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
            }
        }
        return dp[m][n];
    }

    similarity(a, b) {
        if (!a || !b) return 0;
        const dist = this.levenshtein(a, b);
        const maxLen = Math.max(a.length, b.length);
        if (maxLen === 0) return 1;
        return 1 - dist / maxLen;
    }

    findBestMatch(input, candidates, threshold = 0.8) {
        if (!input) return null;
        let best = null;
        let bestScore = 0;
        candidates.forEach(c => {
            const score = this.similarity(input, c);
            if (score > bestScore) {
                bestScore = score;
                best = c;
            }
        });
        return bestScore >= threshold ? best : null;
    }

    // Weekly menu: load, render and save
    loadMenu() {
        const raw = localStorage.getItem('weeklyMenu');
        if (raw) {
            try {
                this.weeklyMenu = JSON.parse(raw);
            } catch (e) {
                this.weeklyMenu = this.getDefaultWeeklyMenu();
            }
        } else {
            this.weeklyMenu = this.getDefaultWeeklyMenu();
        }
    }

    getDefaultWeeklyMenu() {
        return {
            Lundi: '', Mardi: '', Mercredi: '', Jeudi: '', Vendredi: '', Samedi: '', Dimanche: ''
        };
    }

    renderMenu() {
        const container = document.getElementById('weeklyMenuContainer');
        if (!container) return;
        container.innerHTML = '';
        Object.keys(this.weeklyMenu).forEach(day => {
            const dayBox = document.createElement('div');
            dayBox.className = 'weekly-day';
            const title = document.createElement('strong');
            title.textContent = day;
            const input = document.createElement('input');
            input.type = 'text';
            input.placeholder = 'Nom de la recette';
            input.value = this.weeklyMenu[day] || '';
            input.addEventListener('input', () => {
                this.weeklyMenu[day] = input.value;
            });
            dayBox.appendChild(title);
            dayBox.appendChild(input);
            container.appendChild(dayBox);
        });
    }

    saveMenu() {
        localStorage.setItem('weeklyMenu', JSON.stringify(this.weeklyMenu || this.getDefaultWeeklyMenu()));
        alert('Menu enregistré');
    }

    getShoppingListGroups() {
        const grouped = {};
        Object.entries(this.shoppingList).forEach(([productName, data]) => {
            const categoryName = data.category || this.findCategoryName(productName) || 'Autres';
            if (!grouped[categoryName]) grouped[categoryName] = [];
            grouped[categoryName].push({ productName, data });
        });

        const groups = [];
        this.categories.forEach(category => {
            if (grouped[category.name]) {
                groups.push({ category: category.name, items: grouped[category.name] });
                delete grouped[category.name];
            }
        });
        if (grouped['Autres']) {
            groups.push({ category: 'Autres', items: grouped['Autres'] });
            delete grouped['Autres'];
        }
        Object.keys(grouped).sort().forEach(name => {
            groups.push({ category: name, items: grouped[name] });
        });
        return groups;
    }

    renderShoppingList() {
        const targets = [
            { list: document.getElementById('shoppingList'), empty: document.getElementById('emptyState') },
            { list: document.getElementById('shoppingListTab'), empty: document.getElementById('emptyStateTab') }
        ];

        targets.forEach(target => {
            if (!target.list) return;
            const listEl = target.list;
            const emptyEl = target.empty;

            listEl.innerHTML = '';

            if (Object.keys(this.shoppingList).length === 0) {
                if (emptyEl) emptyEl.style.display = 'block';
                return;
            } else {
                if (emptyEl) emptyEl.style.display = 'none';
            }

            const groups = this.getShoppingListGroups();
            groups.forEach(group => {
                const groupHeader = document.createElement('li');
                groupHeader.className = 'shopping-category-header';
                groupHeader.textContent = group.category;
                listEl.appendChild(groupHeader);

                group.items.forEach(({ productName, data }) => {
                    const item = document.createElement('li');
                    item.className = 'shopping-item';

                    const nameSpan = document.createElement('span');
                    nameSpan.className = 'shopping-item-name';
                    nameSpan.textContent = productName;

                    const qtyContainer = document.createElement('div');
                    qtyContainer.className = 'quantity-control';

                    const decreaseBtn = document.createElement('button');
                    decreaseBtn.className = 'qty-control-btn';
                    decreaseBtn.type = 'button';
                    decreaseBtn.textContent = '−';
                    decreaseBtn.title = 'Réduire';
                    decreaseBtn.addEventListener('click', () => {
                        const currentQty = Number(this.shoppingList[productName].quantity) || 1;
                        if (currentQty > 1) {
                            this.shoppingList[productName].quantity = currentQty - 1;
                        } else {
                            delete this.shoppingList[productName];
                        }
                        this.saveData();
                        this.renderShoppingList();
                        this.updateProductChecks();
                    });

                    const qtyValue = document.createElement('span');
                    qtyValue.className = 'qty-value';
                    qtyValue.textContent = String(data.quantity);

                    const increaseBtn = document.createElement('button');
                    increaseBtn.className = 'qty-control-btn';
                    increaseBtn.type = 'button';
                    increaseBtn.textContent = '+';
                    increaseBtn.title = 'Ajouter';
                    increaseBtn.addEventListener('click', () => {
                        const currentQty = Number(this.shoppingList[productName].quantity) || 1;
                        this.shoppingList[productName].quantity = currentQty + 1;
                        this.saveData();
                        this.renderShoppingList();
                        this.updateProductChecks();
                    });

                    qtyContainer.appendChild(decreaseBtn);
                    qtyContainer.appendChild(qtyValue);
                    qtyContainer.appendChild(increaseBtn);

                    const removeBtn = document.createElement('button');
                    removeBtn.className = 'item-remove';
                    removeBtn.innerHTML = '<i class="fas fa-times"></i>';
                    removeBtn.title = 'Supprimer';
                    removeBtn.addEventListener('click', () => {
                        this.removeFromShoppingList(productName);
                    });

                    item.appendChild(nameSpan);
                    item.appendChild(qtyContainer);
                    item.appendChild(removeBtn);
                    listEl.appendChild(item);
                });
            });
        });
    }

    removeFromShoppingList(productName) {
        if (this.shoppingList[productName] !== undefined) {
            delete this.shoppingList[productName];
            this.saveData();
            this.renderShoppingList();
            this.updateProductChecks();
        }
    }

    updateProductChecks() {
        document.querySelectorAll('.product-item input[type="checkbox"]').forEach(checkbox => {
            const productName = checkbox.dataset.productName || checkbox.nextElementSibling?.textContent;
            checkbox.checked = this.shoppingList[productName] !== undefined;
        });
    }

    // ==================== RECIPE MANAGEMENT ====================

    renderRecipes() {
        const list = document.getElementById('recipesList');
        list.innerHTML = '';

        this.recipes.forEach(recipe => {
            const item = document.createElement('div');
            item.className = 'recipe-item';

            const title = document.createElement('h3');
            title.textContent = recipe.name;

            const ingredientsText = document.createElement('p');
            ingredientsText.textContent = `${recipe.ingredients.length} ingrédients`;

            const actions = document.createElement('div');
            actions.className = 'recipe-actions';

            const viewBtn = document.createElement('button');
            viewBtn.className = 'btn-primary btn-small';
            viewBtn.textContent = 'Voir';
            viewBtn.style.flex = '1';
            viewBtn.addEventListener('click', () => {
                this.showRecipeDetails(recipe);
            });

            const editBtn = document.createElement('button');
            editBtn.className = 'recipe-edit btn-small';
            editBtn.innerHTML = '<i class="fas fa-pen"></i> Modifier';
            editBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.editRecipe(recipe);
            });

            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'recipe-delete';
            deleteBtn.innerHTML = '<i class="fas fa-times"></i>';
            deleteBtn.title = 'Supprimer cette recette';
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.deleteRecipe(recipe);
            });

            actions.appendChild(viewBtn);
            actions.appendChild(editBtn);
            actions.appendChild(deleteBtn);

            item.appendChild(title);
            item.appendChild(ingredientsText);
            item.appendChild(actions);
            list.appendChild(item);
        });
    }

    addRecipe() {
        const nameInput = document.getElementById('recipeNameInput');
        const name = nameInput.value.trim();

        if (!name) {
            alert('Veuillez entrer un nom de recette');
            return;
        }

        const ingredients = [];
        document.querySelectorAll('.ingredient-input-row').forEach(row => {
            const nameInput = row.querySelector('input:first-child');
            const qtyInput = row.querySelector('.input-qty');
            if (nameInput.value.trim()) {
                ingredients.push({
                    name: nameInput.value.trim(),
                    quantity: qtyInput.value.trim() || '1'
                });
            }
        });

        if (ingredients.length === 0) {
            alert('Veuillez ajouter au moins un ingrédient');
            return;
        }

        const newRecipe = {
            id: Math.max(...this.recipes.map(r => r.id), 0) + 1,
            name: name,
            ingredients: ingredients
        };

        this.recipes.push(newRecipe);
        this.saveData();
        this.renderRecipes();
        this.closeModal(document.getElementById('addRecipeModal'));
    }

    deleteRecipe(recipe) {
        if (confirm(`Supprimer la recette "${recipe.name}" ?`)) {
            this.recipes = this.recipes.filter(r => r.id !== recipe.id);
            this.saveData();
            this.renderRecipes();
        }
    }

    showRecipeDetails(recipe) {
        this.currentRecipeForDetails = recipe;
        this.recipeIngredientsToAdd = [];

        document.getElementById('recipeDetailsTitle').textContent = recipe.name;
        
        const container = document.getElementById('recipeIngredientsList');
        container.innerHTML = '';

        recipe.ingredients.forEach((ingredient, i) => {
            const item = document.createElement('div');
            item.className = 'ingredient-check-item';

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = `ingredient-${recipe.id}-${i}`;
            checkbox.dataset.ingredientIndex = i;
            checkbox.addEventListener('change', (e) => {
                if (e.target.checked) {
                    if (!this.recipeIngredientsToAdd.some(i => i.name === ingredient.name)) {
                        this.recipeIngredientsToAdd.push(ingredient);
                    }
                } else {
                    this.recipeIngredientsToAdd = this.recipeIngredientsToAdd.filter(i => i.name !== ingredient.name);
                }
            });

            const label = document.createElement('label');
            label.htmlFor = `ingredient-${recipe.id}-${i}`;
            label.textContent = ingredient.name;

            const qtyBadge = document.createElement('span');
            qtyBadge.className = 'ingredient-qty-badge';
            qtyBadge.textContent = ingredient.quantity;

            item.appendChild(checkbox);
            item.appendChild(label);
            item.appendChild(qtyBadge);
            container.appendChild(item);
        });

        const selectAllButton = document.getElementById('selectAllIngredientsBtn');
        if (selectAllButton) {
            selectAllButton.textContent = 'Tout sélectionner';
        }

        this.openModal('recipeDetailsModal');
    }

    confirmRecipeIngredients() {
        this.recipeIngredientsToAdd.forEach(ingredient => {
            const quantity = this.parseIngredientQuantity(ingredient.quantity);
            this.addToShoppingList(ingredient.name, quantity, 'recipe');
        });
        this.closeModal(document.getElementById('recipeDetailsModal'));
    }

    toggleSelectAllIngredients() {
        const container = document.getElementById('recipeIngredientsList');
        if (!container) return;

        const checkboxes = Array.from(container.querySelectorAll('input[type="checkbox"]'));
        const allSelected = checkboxes.length > 0 && checkboxes.every(cb => cb.checked);

        checkboxes.forEach(cb => {
            const index = Number(cb.dataset.ingredientIndex);
            const ingredient = this.currentRecipeForDetails?.ingredients[index];
            if (!ingredient) return;

            cb.checked = !allSelected;
            if (cb.checked) {
                if (!this.recipeIngredientsToAdd.some(i => i.name === ingredient.name)) {
                    this.recipeIngredientsToAdd.push(ingredient);
                }
            } else {
                this.recipeIngredientsToAdd = this.recipeIngredientsToAdd.filter(i => i.name !== ingredient.name);
            }
        });

        const selectAllButton = document.getElementById('selectAllIngredientsBtn');
        if (selectAllButton) {
            selectAllButton.textContent = allSelected ? 'Tout sélectionner' : 'Tout désélectionner';
        }
    }

    // ================ CATEGORY EDIT / DELETE ================
    editCategory(index) {
        this.currentEditingCategoryIndex = index;
        const category = this.categories[index];
        document.getElementById('editCategoryInput').value = category.name;
        this.openModal('editCategoryModal');
        document.getElementById('editCategoryInput').focus();
        document.getElementById('editCategoryInput').select();
    }

    saveCategoryEdit() {
        const newName = document.getElementById('editCategoryInput').value.trim();
        if (!newName) { alert('Veuillez entrer un nom de catégorie'); return; }
        if (this.currentEditingCategoryIndex === null) return;
        this.categories[this.currentEditingCategoryIndex].name = newName;
        this.saveData();
        this.renderCategories();
        this.renderProducts();
        this.closeModal(document.getElementById('editCategoryModal'));
        this.currentEditingCategoryIndex = null;
    }

    deleteCategoryConfirmed() {
        if (this.currentEditingCategoryIndex === null) return;
        const idx = this.currentEditingCategoryIndex;
        if (confirm(`Supprimer la catégorie "${this.categories[idx].name}" ?`)) {
            this.categories.splice(idx, 1);
            if (this.currentCategory >= this.categories.length) this.currentCategory = Math.max(0, this.categories.length - 1);
            this.saveData();
            this.renderCategories();
            this.renderProducts();
        }
        this.closeModal(document.getElementById('editCategoryModal'));
        this.currentEditingCategoryIndex = null;
    }

    // ================ RECIPE EDITING (add ingredients) ================
    editRecipe(recipe) {
        this.currentEditingRecipe = recipe;
        const container = document.getElementById('recipeIngredientsEditList');
        container.innerHTML = '';
        recipe.ingredients.forEach(ing => {
            const row = document.createElement('div');
            row.className = 'ingredient-input-row';

            const nameInput = document.createElement('input');
            nameInput.type = 'text';
            nameInput.className = 'input-field';
            nameInput.value = ing.name;

            const qtyInput = document.createElement('input');
            qtyInput.type = 'text';
            qtyInput.className = 'input-field input-qty';
            qtyInput.value = ing.quantity;

            const removeBtn = document.createElement('button');
            removeBtn.type = 'button';
            removeBtn.innerHTML = '<i class="fas fa-times"></i>';
            removeBtn.addEventListener('click', () => row.remove());

            row.appendChild(nameInput);
            row.appendChild(qtyInput);
            row.appendChild(removeBtn);
            container.appendChild(row);
        });

        this.openModal('editRecipeModal');
    }

    addIngredientToRecipeRow() {
        const container = document.getElementById('recipeIngredientsEditList');
        const row = document.createElement('div');
        row.className = 'ingredient-input-row';

        const nameInput = document.createElement('input');
        nameInput.type = 'text';
        nameInput.placeholder = 'Nom de l\'ingrédient';
        nameInput.className = 'input-field';

        const qtyInput = document.createElement('input');
        qtyInput.type = 'text';
        qtyInput.placeholder = 'Quantité';
        qtyInput.className = 'input-field input-qty';

        const removeBtn = document.createElement('button');
        removeBtn.type = 'button';
        removeBtn.innerHTML = '<i class="fas fa-times"></i>';
        removeBtn.addEventListener('click', () => row.remove());

        row.appendChild(nameInput);
        row.appendChild(qtyInput);
        row.appendChild(removeBtn);
        container.appendChild(row);

        nameInput.focus();

        // add unknown button + fuzzy matching similar to addIngredientInputRow
        row.dataset.rowId = 'r-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
        const addUnknownBtn = document.createElement('button');
        addUnknownBtn.className = 'btn-secondary';
        addUnknownBtn.type = 'button';
        addUnknownBtn.style.display = 'none';
        addUnknownBtn.textContent = 'Ajouter';
        addUnknownBtn.addEventListener('click', () => {
            const val = nameInput.value.trim();
            if (!val) return;
            this.showUnknownIngredientModal(val, row);
        });

        // insert addUnknownBtn before remove button
        row.insertBefore(addUnknownBtn, removeBtn);

        nameInput.addEventListener('input', () => {
            const val = nameInput.value.trim();
            if (!val) { addUnknownBtn.style.display = 'none'; return; }
            const products = this.categories.flatMap(c => c.products.map(p => p.name));
            const match = this.findBestMatch(val, products, 0.8);
            if (match) {
                nameInput.value = match;
                addUnknownBtn.style.display = 'none';
            } else {
                addUnknownBtn.style.display = 'inline-flex';
            }
        });
    }

    saveEditedRecipe() {
        if (!this.currentEditingRecipe) return;
        const container = document.getElementById('recipeIngredientsEditList');
        const ingredients = [];
        container.querySelectorAll('.ingredient-input-row').forEach(row => {
            const name = row.querySelector('input:first-child').value.trim();
            const qty = row.querySelector('.input-qty').value.trim() || '1';
            if (name) ingredients.push({ name, quantity: qty });
        });
        this.currentEditingRecipe.ingredients = ingredients;
        this.saveData();
        this.renderRecipes();
        this.closeModal(document.getElementById('editRecipeModal'));
        this.currentEditingRecipe = null;
    }

    addIngredientInputRow() {
        const container = document.getElementById('ingredientsList');
        
        const row = document.createElement('div');
        row.className = 'ingredient-input-row';
        row.dataset.rowId = 'r-' + Date.now() + '-' + Math.floor(Math.random() * 1000);

        const nameInput = document.createElement('input');
        nameInput.type = 'text';
        nameInput.placeholder = 'Nom de l\'ingrédient';
        nameInput.className = 'input-field';

        const qtyInput = document.createElement('input');
        qtyInput.type = 'text';
        qtyInput.placeholder = 'Quantité';
        qtyInput.className = 'input-field input-qty';

        const removeBtn = document.createElement('button');
        removeBtn.innerHTML = '<i class="fas fa-times"></i>';
        removeBtn.type = 'button';
        removeBtn.addEventListener('click', () => {
            row.remove();
        });

        // Inline add button for unknown ingredient
        const addUnknownBtn = document.createElement('button');
        addUnknownBtn.className = 'btn-secondary';
        addUnknownBtn.type = 'button';
        addUnknownBtn.style.display = 'none';
        addUnknownBtn.textContent = 'Ajouter';
        addUnknownBtn.addEventListener('click', () => {
            const val = nameInput.value.trim();
            if (!val) return;
            this.showUnknownIngredientModal(val, row);
        });

        row.appendChild(nameInput);
        row.appendChild(qtyInput);
        row.appendChild(addUnknownBtn);
        row.appendChild(removeBtn);
        container.appendChild(row);

        nameInput.focus();

        // Attach input listener for fuzzy matching
        nameInput.addEventListener('input', () => {
            const val = nameInput.value.trim();
            if (!val) {
                addUnknownBtn.style.display = 'none';
                return;
            }
            const products = this.categories.flatMap(c => c.products.map(p => p.name));
            const match = this.findBestMatch(val, products, 0.8);
            if (match) {
                nameInput.value = match;
                addUnknownBtn.style.display = 'none';
            } else {
                // show add button when no match
                addUnknownBtn.style.display = 'inline-flex';
            }
        });
    }

    // ==================== UTILITY FUNCTIONS ====================

    handleTabClick(e) {
        const tabBtn = e.target.closest('.tab-btn');
        if (!tabBtn) return;

        const tabName = tabBtn.dataset.tab;

        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

        tabBtn.classList.add('active');

        const content = document.getElementById(`${tabName}-tab`);
        if (content) content.classList.add('active');

        this.updateProductsToolbarVisibility(tabName);
        document.body.classList.toggle('products-active', tabName === 'products');

        if (tabName === 'shopping') this.renderShoppingList();
    }

    exportShoppingList() {
        const items = Object.entries(this.shoppingList)
            .map(([name, data]) => `${name} (${data.quantity})`)
            .join('\n');

        const text = `Liste de courses:\n\n${items || 'Aucun produit'}`;
        
        navigator.clipboard.writeText(text).then(() => {
            const btn = document.getElementById('exportBtn');
            const originalText = btn.textContent;
            btn.textContent = '✓ Copié !';
            setTimeout(() => {
                btn.textContent = originalText;
            }, 2000);
        });
    }

    shareShoppingList() {
        const items = Object.entries(this.shoppingList)
            .map(([name, data]) => `${name} (${data.quantity})`)
            .join('\n');

        const text = `Liste de courses:\n\n${items || 'Aucun produit'}`;

        if (navigator.share) {
            navigator.share({
                title: 'Liste de courses',
                text: text
            });
        } else {
            this.exportShoppingList();
        }
    }
}

// ==================== INITIALIZATION ====================

document.addEventListener('DOMContentLoaded', () => {
    new ShoppingListApp();
});
