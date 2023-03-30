class FinanceOrganiser {
    constructor() {
        this.state = { settings: {}, expenses: {} }
        this.allPages = document.querySelectorAll('page');
        this.menuAllEl = document.querySelectorAll('li');
        this.expensesSubmitBtn = document.getElementById("category-submit");
        this.categorySelect = document.getElementById("category");
        this.btnCategorySubmit = document.getElementById("category-new-submit");
        this.incomeInput = document.getElementById("income-amount");
        this.incomeSubmit = document.getElementById("income-submit");
        this.userSubmit = document.getElementById("user-submit");
        this.userInput = document.getElementById('user-input');
        this.incomeCategory = document.getElementById('income-category');
        this.addIncomeCategoryInput = document.getElementById('add-income-category');
        this.addIncomeCategorySubmit = document.getElementById('add-income-category-submit');
        this.amountInput = document.getElementById("amount");
        this.colorInput = document.getElementById('color');
        this.userBoxDashboard = document.getElementsByClassName('current');
        this.userSettingsSelect = document.getElementById('user-settings-select');
        this.userIcon = document.getElementById('user-icon');
        this.saveSettingsSubmit = document.getElementById('save-current-user-submit');
        this.newCategoryInput = document.getElementById('new-category');
        this.iconWrapper = document.querySelectorAll('.icon-wrapper span');
        this.currentDate = dayjs();
        this.activeIcon = document.getElementById('default-icon');
        this.activeIcon.classList.add('active');
        this.newCategoryIcon = this.activeIcon.innerText;
        this.newCategoryName;
        this.newCategoryColor = this.colorInput.value;
        this.nextArrow = document.getElementById('next');
        this.prevArrow = document.getElementById('prev');
        this.menuToggle = document.getElementById('menu-toggle');
        this.defaultCategories = ['Food', 'Car Expenses', 'Activities', 'Utilities', 'Subscriptions', 'Gifts'];
        this.defaultUser = {
            id: '0',
            name: 'User',
        };
        this.allCurrenciesArray = [];
        this.currentWindowSize = window.innerWidth;
    }

    addEventListeners() {
        this.menuAllEl.forEach(element => {
            element.addEventListener("click", this.gotoPage.bind(this))
        });

        this.expensesSubmitBtn.addEventListener("click", this.addNewExpense.bind(this));
        this.btnCategorySubmit.addEventListener("click", this.addNewCategory.bind(this));
        this.colorInput.addEventListener('input', (this.setNewCategoryColor.bind(this)))
        this.newCategoryInput.addEventListener('input', (this.setNewCategoryName.bind(this)))

        this.iconWrapper.forEach(element => {
            element.addEventListener("click", this.setNewCategoryIcon.bind(this))
        });

        this.nextArrow.addEventListener("click", this.changeMonthView.bind(this));
        this.prevArrow.addEventListener("click", this.changeMonthView.bind(this));
        this.incomeSubmit.addEventListener("click", this.addNewIncome.bind(this));
        this.userSubmit.addEventListener("click", this.addNewUser.bind(this));
        this.saveSettingsSubmit.addEventListener("click", this.saveSettings.bind(this));

        this.addIncomeCategoryInput.addEventListener('input', (this.setNewCategoryName.bind(this)))
        this.addIncomeCategorySubmit.addEventListener("click", this.addIncomeCategory.bind(this));
        this.menuToggle.addEventListener("click", this.toggleNav.bind(this));
        window.addEventListener("resize", this.resizeWindow.bind(this));
        // this.saveSettingsSubmit.addEventListener("click", (e) => this.saveSettings(e, 5));
    }

    resizeWindow(e) {
        const diff = window.innerWidth - this.currentWindowSize;
        const icon = this.menuToggle.querySelector('span')
        if (diff > 0) {
            const sidebar = document.querySelector("aside");
            sidebar.classList.remove("open");
        }
        else {
            icon.style.color = "#4333a1"
            icon.innerText = "menu";
        }

    }

    toggleNav() {
        const sidebar = document.querySelector("aside");
        sidebar.classList.toggle("open");
        const icon = this.menuToggle.querySelector('span')

        if (sidebar.classList.contains("open")) {
            icon.style.color = "#fff"
            icon.innerText = "close";
        }
        else {
            icon.style.color = "#4333a1"
            icon.innerText = "menu";
        }

    }

    addIncomeCategory(e) {
        e.preventDefault();
        if (this.addIncomeCategoryInput.checkValidity()) {
            const newCategoryObj = {
                name: this.newCategoryName,
                color: this.newCategoryColor,
                icon: this.newCategoryIcon,
                id: this.generateId(),
                type: "income"
            }
            this.state.settings.categories.push(newCategoryObj);

            localStorage.setItem('Settings', JSON.stringify(this.state.settings))
            this.updateCategoriesInDropdown("income", this.incomeCategory);
            // this.printAllContent(4, this.printAllCategories.bind(this));
        } else {
            this.addIncomeCategoryInput.value = "";
            this.showErrorMessage("income-form", "Please enter new category income")
        }
    }

    getCurrentUser() {
        const id = this.userSettingsSelect.value;
        return this.state.users.filter((user) => user.id === id).at(-1);
    }

    setCurrentUserIcon() {

        this.userIcon.innerText = this.state.settings.currentUser.name.slice(0, 2).toUpperCase();

    }

    saveSettings(e) {
        e.preventDefault();
        // dodawac do local storage i do stanu aktualnego usera
        this.state.settings.currentUser = this.getCurrentUser();

        localStorage.setItem('Settings', JSON.stringify(this.state.settings))

        this.setCurrentUserIcon();
        this.createCategoryBox();
        this.printRecentHistory();

    }

    updateUsersList() {
        while (this.userSettingsSelect.lastElementChild) {
            this.userSettingsSelect.removeChild(this.userSettingsSelect.lastElementChild);
        }
        const fragment = document.createDocumentFragment()

        this.state.users.forEach((user) => {
            const option = document.createElement("option");
            option.value = user.id;
            option.text = user.name;
            fragment.append(option);
        });
        this.userSettingsSelect.appendChild(fragment)
    }


    addNewUser(e) {
        e.preventDefault();
        let newUser = {
            id: this.generateId(),
            name: this.userInput.value,
        }
        if (this.userInput.value.length === 0) {
            this.userInput.value = "";
            this.showErrorMessage("user-form", "Please enter user name", true);
            return;
        }
        this.state.users.unshift(newUser);
        localStorage.setItem('Users', JSON.stringify(this.state.users))
        this.userInput.value = "";
        this.printAllContent(5, this.printAllUsers.bind(this));
        this.updateUsersList();
    }

    addNewIncome(e) {
        e.preventDefault();
        let newIncome = {
            category: this.incomeCategory.value,
            amount: this.incomeInput.value,
            date: new Date(),
            id: this.generateId(),
            addedBy: this.state.settings.currentUser.id
        }
        if (this.incomeInput.value.length === 0) {
            this.incomeInput.value = "";
            this.showErrorMessage("income-form", "Please add your income", true);
            return;
        }

        this.state.income.unshift(newIncome);
        localStorage.setItem('Income', JSON.stringify(this.state.income))

        this.createCategoryBox();
        // this.updateExpenses();
        this.printRecentHistory();
        this.printTotals();

        this.incomeInput.value = "";
        // this.showErrorMessage("income-form", "Please add your income", true);
        // this.resetForm(this.incomeInput);
        const addIncome = new Event('income', { bubbles: true });
        e.currentTarget.dispatchEvent(addIncome);
    }


    changeMonthView(e) {
        const direction = e.currentTarget.id;
        const isSameDate = this.currentDate.isSame(dayjs(), 'month');
        const XYZDate = this.currentDate;

        const nextBtn = document.getElementById('next');

        if (direction === "next" && !isSameDate) {
            this.currentDate = this.currentDate.add(1, 'month');

            if (this.currentDate.isSame(dayjs(), 'month')) {
                nextBtn.classList.add('inactive');
            }
        }
        if (direction === "prev") {
            this.currentDate = this.currentDate.subtract(1, 'month');
            if (nextBtn.classList.contains('inactive')) {
                nextBtn.classList.remove('inactive');
            }
        }
        this.printTotals(this.currentDate.month());
        this.createCategoryBox(this.currentDate.month());
        this.showMonth();
        this.printRecentHistory(this.currentDate.month());
    }

    addNewCategory(e) {
        e.preventDefault();
        if (this.newCategoryInput.checkValidity()) {
            const newCategoryObj = {
                name: this.newCategoryName,
                color: this.newCategoryColor,
                icon: this.newCategoryIcon,
                id: this.generateId(),
                type: "expense"
            }
            this.state.settings.categories.push(newCategoryObj);

            localStorage.setItem('Settings', JSON.stringify(this.state.settings))
            this.updateCategoriesInDropdown("expense", this.categorySelect);
            this.printAllContent(4, this.printAllCategories.bind(this));
        } else {
            this.newCategoryInput.value = "";
            this.showErrorMessage("category-form", "Please enter new category")
        }
    }

    showErrorMessage(element, textError, isTemporary = true) {
        const error = document.createElement('p');
        const parent = document.getElementById(element);
        error.innerText = textError;
        parent.insertAdjacentElement('beforeend', error);
        if (isTemporary) {
            setTimeout(() => { error.remove(); }, 1000);
        }
    }

    generateId() {
        return (Math.random() * performance.now()).toString(16)
    }

    setNewCategoryName(e) {
        this.newCategoryName = e.target.value;
    }

    setNewCategoryColor(e) {
        const root = document.documentElement;
        root.style.setProperty('--icon-background-color', e.currentTarget.value);
        this.newCategoryColor = e.currentTarget.value;
    }

    setNewCategoryIcon(e) {
        this.activeIcon.classList.remove('active');
        this.activeIcon = e.target;
        this.activeIcon.classList.add('active');

        this.newCategoryIcon = e.target.innerText;
    }

    updateCategoriesInDropdown(type, dropdown) {

        while (dropdown.lastElementChild) {
            dropdown.removeChild(dropdown.lastElementChild);
        }
        const fragment = document.createDocumentFragment()
        this.state.settings.categories.filter(category => category.type === type && category.id !== '0').forEach((category) => {
            const option = document.createElement("option");

            option.value = category.id;
            option.text = category.name;
            fragment.append(option);
        });
        dropdown.appendChild(fragment)
    }

    removeCategory(e) {
        const updatedArray = this.state.settings.categories.filter((item) => {
            return item.id != e.currentTarget.dataset.category;
        });
        this.state.settings.categories = updatedArray;
        localStorage.setItem('Settings', JSON.stringify(this.state.settings));
        this.moveExpensesToDefaultCategory(e.currentTarget.dataset.category);
        this.updateCategoriesInDropdown();
        this.createCategoryBox();
        this.printRecentHistory();
    }

    moveExpensesToDefaultCategory(removedCategory) {
        this.state.expenses.forEach((item) => {
            if (item.category === removedCategory) {
                item.category = "0";
            }
        });
        localStorage.setItem('Expenses', JSON.stringify(this.state.expenses));
    }

    moveExpensesToDefaultUser(removedUserId) {

        const newArray = this.state.expenses.map((expense) => {
            if (expense.addedBy === removedUserId) {
                return { ...expense, addedBy: "0" };
            }
            return expense;
        })
        this.state.expenses = newArray;
        localStorage.setItem('Expenses', JSON.stringify(newArray));
    }

    removeDashboardUserBox(userId) {
        const userBox = document.getElementById(userId);
        userBox.remove();
    }

    removeUser(e) {
        const updatedArray = this.state.users.filter((item) => {
            return item.id != e.currentTarget.dataset.user;
        });

        this.state.users = updatedArray;
        localStorage.setItem('Users', JSON.stringify(this.state.users));
        this.updateUsersList();

        if (e.currentTarget.dataset.user === this.state.settings.currentUser.id) {
            this.state.settings.currentUser = this.defaultUser;
            localStorage.setItem('Settings', JSON.stringify(this.state.settings));
        }
        this.removeDashboardUserBox(e.currentTarget.dataset.user)
        this.moveExpensesToDefaultUser(e.currentTarget.dataset.user);
        this.printTotals();
        this.setCurrentUserIcon();
        this.printRecentHistory();
    }


    printAllContent(pageNumber, callback) { //TODO: Nazwa do zmiany.        
        const currentPage = document.querySelector(`[data-content-page="${pageNumber}"]`);
        const bottomContentBox = currentPage.querySelector('.bottom-content');
        const mainWrapper = currentPage.querySelector('.main-wrapper') || document.createElement('div');
        const isWrapperOnPage = currentPage.querySelector('.main-wrapper');
        mainWrapper.classList.add('main-wrapper');
        if (isWrapperOnPage == null) {
            bottomContentBox.append(mainWrapper);
        }
        while (mainWrapper.lastElementChild) {
            mainWrapper.removeChild(mainWrapper.lastElementChild);
        }
        const result = callback();

        mainWrapper.append(result);
    }

    printAllUsers() {
        const result = document.createElement('div')
        result.classList.add('wrapper2');

        this.state.users.forEach((user) => {
            if (user.id !== '0') {
                const wrapper = document.createElement('div');
                const title = document.createElement('span');
                const remove = document.createElement('span');

                remove.classList.add('material-symbols-outlined');
                remove.classList.add('remove');
                wrapper.classList.add('wrapper');

                remove.dataset.user = user.id;
                remove.innerText = 'delete';
                remove.addEventListener("click", (e) => {
                    wrapper.remove();
                    return this.removeUser(e)
                });

                title.innerText = user.name;
                wrapper.appendChild(title);
                wrapper.appendChild(remove);
                result.append(wrapper);
            }
        });
        return result;
    }

    printAllCategories() {
        const result = document.createElement('div')
        result.classList.add('wrapper2');

        this.state.settings.categories.forEach((category) => {
            if (category.id === "0") {
                return;
            }
            const wrapper = document.createElement('div');
            const title = document.createElement('span');
            const remove = document.createElement('span');

            remove.classList.add('material-symbols-outlined');
            remove.classList.add('remove');
            wrapper.classList.add('wrapper');

            remove.dataset.category = category.id;
            remove.innerText = 'delete';
            remove.addEventListener("click", (e) => {
                wrapper.remove();
                return this.removeCategory(e)
            });

            title.innerText = category.name;
            wrapper.appendChild(title);
            wrapper.appendChild(remove);
            result.append(wrapper);
        });
        return result;
    }

    printAllCategoriesDom() {
        const currentPage = document.querySelector('[data-content-page="4"]');
        const expensesBox = currentPage.querySelector('.bottom-content');
        const fragment = document.createDocumentFragment();
        const mainwrapper = document.querySelector('.mainwrapper') || document.createElement('div');
        const checkwrapper = document.querySelector('.mainwrapper');
        mainwrapper.classList.add('mainwrapper');
        if (checkwrapper == null) {
            expensesBox.append(mainwrapper);
        }
        while (mainwrapper.lastElementChild) {
            mainwrapper.removeChild(mainwrapper.lastElementChild);
        }

        this.state.settings.categories.forEach((category) => {
            if (category.id === "0") {
                return;
            }
            const wrapper = document.createElement('div');
            const title = document.createElement('span');
            const remove = document.createElement('span');

            remove.classList.add('material-symbols-outlined');
            remove.classList.add('remove');
            wrapper.classList.add('wrapper');

            remove.dataset.category = category.id;
            remove.innerText = 'delete';
            remove.addEventListener("click", (e) => {
                wrapper.remove();
                return this.removeCategory(e)
            });

            title.innerText = category.name;
            wrapper.appendChild(title);
            wrapper.appendChild(remove);
            fragment.append(wrapper);
            mainwrapper.append(wrapper);

        });
        // expensesBox.append(fragment);
    }

    //Print List of Expenses on the dashboard
    printRecentHistory() {
        const expensesBox = document.querySelector('.bottom-content');

        this.isDashboardListEmpty();
        const oneMonthNewArray = this.filterDataByMonth(this.state.expenses).concat(this.filterDataByMonth(this.state.income));
        // console.log(this.filterDataByMonth(this.state.income))
        // const joinedArray = [...oneMonthNewArray, ...oneMonthNewArrayIncome]
        const ulList = document.createElement('ul');
        const expensesBoxes = expensesBox.querySelectorAll('li');

        if (expensesBoxes.length > 0) {
            expensesBoxes.forEach((item) => {
                item.remove();
            })
        }
        // console.log(oneMonthNewArray)
        oneMonthNewArray.forEach((item) => {
            // oneMonthNewArrayIncome

            const element = document.createElement('li');
            const circle = document.createElement('span');
            const icon = document.createElement('span');
            const remove = document.createElement('span');
            const data = document.createElement('span');
            const user = document.createElement('span');

            icon.classList.add('material-symbols-outlined');
            circle.classList.add('circle');
            let categoryIdName = "";

            this.state.settings.categories.forEach((category) => {
                if (category.id === item.category) {
                    categoryIdName = category
                }
            });
            element.innerText = categoryIdName.name ?? `INCOME : ${item.category}`;
            circle.innerText = `${item.amount}`
            icon.style.background = categoryIdName.color;



            const foundUser = this.state.users.find((user) => {
                return user.id === item.addedBy
            })

            // user.innerText = foundUser[0]?.id;
            user.innerText = foundUser.name

            icon.innerText = categoryIdName.icon ?? 'payments';

            element.dataset.id = item.id;

            remove.classList.add('material-symbols-outlined');
            remove.classList.add('remove');
            remove.innerText = 'delete';

            remove.addEventListener("click", (e) => {
                this.removeExpense(e, item.id);
            });

            data.classList.add('date');
            const parseDate = dayjs(item.date);
            data.innerText = parseDate.format(`DD - MMMM - YYYY`)

            element.prepend(icon);
            ulList.append(element);
            element.append(circle);
            element.append(user)
            element.append(data);
            element.append(remove);
        })
        expensesBox.append(ulList);
        this.showSum();
    }

    removeExpense(e, id) {
        const updatedExpenses = this.state.expenses.filter((item) => {
            return id !== item.id;
        })
        this.state.expenses = updatedExpenses;
        localStorage.setItem('Expenses', JSON.stringify(this.state.expenses));

        const el = document.querySelector(`[data-id='${id}']`);
        el.remove();
        this.createCategoryBox();
        this.printTotals();

    }

    filterExpensesByMonth(objKey, month) {
        if (this.state.expenses.length === 0) {
            return;
        }
        return objKey.filter((item) => {
            const expenseMonth = dayjs(item.date).month();
            return expenseMonth === month;
        })
    }


    filterDataByMonth(storage) {
        if (storage.length === 0) {
            return [];
        }
        return storage.filter((item) => {
            return dayjs(this.currentDate).isSame(dayjs(item.date), 'month') && this.state.settings.currentUser.id === item.addedBy;
        })

    }

    filterExpensesByDate(storage) {
        if (storage.length === 0) {
            return [];
        }
        return storage.filter((item) => {

            return dayjs(this.currentDate).isSame(dayjs(item.date), 'month');
        })

    }

    printTotals() {
        const oneMonthNewExpenseArray = this.filterExpensesByDate(this.state.expenses);
        const oneMonthNewIncomeArray = this.filterExpensesByDate(this.state.income);

        const countTotal = (sum, item) => {
            return sum + Number(item.amount);
        }
        // console.log(oneMonthNewIncomeArray)
        function groupByUsers(acc, item) {
            const { category, amount, data, id } = item;
            if (acc[item.addedBy] == null) acc[item.addedBy] = [];
            acc[item.addedBy].push({ category, amount, data, id })
            return acc;
        };

        let expenseUser = oneMonthNewExpenseArray.reduce(groupByUsers, {});
        let incomeUser = oneMonthNewIncomeArray.reduce(groupByUsers, {});

        const userSumExpenses = oneMonthNewExpenseArray.reduce((acc, item) => acc += Number(item.amount), 0);
        const userSumIncome = oneMonthNewIncomeArray.reduce((acc, item) => acc += Number(item.amount), 0);

        // console.log(userSumExpenses, userSumIncome)
        // const userTotalBox = document.createElement('div');
        // userTotalBox.classList.add('side-users-total');

        const parentBox = document.querySelector('.side-content');
        this.state.users.forEach((user) => {
            if (user.id === '0') { return }
            if (expenseUser[user.id] == null && incomeUser[user.id] == null) { return }

            const userBox = document.getElementById(user.id) ?? document.createElement('div');

            while (userBox.lastElementChild) {
                userBox.lastElementChild.remove();
            }

            if (userBox.classList.contains('side-users') !== true) userBox.classList.add('side-users');
            userBox.id = user.id;

            const userName = document.createElement('span');
            userName.classList.add('user-name')
            userName.innerText = user.name;
            userBox.append(userName)

            if (expenseUser[user.id] != null) {
                const totalExpense = expenseUser[user.id].reduce(countTotal, 0);
                const expenseSpan = document.createElement('span');
                const expenseSpanText = document.createElement('p');
                expenseSpanText.innerText = `Expense: `;
                expenseSpan.innerText = `${totalExpense}`;
                userBox.append(expenseSpanText, expenseSpan);
            }

            if (incomeUser[user.id] != null) {
                const totalIncome = incomeUser[user.id].reduce(countTotal, 0);
                const incomeSpan = document.createElement('span');
                const incomeSpanText = document.createElement('p');
                incomeSpanText.innerText = `Income: `;
                incomeSpan.innerText = `${totalIncome}`;
                userBox.append(incomeSpanText, incomeSpan)
            }

            if (expenseUser[user.id] != null && incomeUser[user.id] != null) {
                const totalExpense = expenseUser[user.id].reduce(countTotal, 0);
                const totalIncome = incomeUser[user.id].reduce(countTotal, 0);

                const incomeSpan = document.createElement('span');
                const incomeSpanText = document.createElement('p');
                incomeSpanText.innerText = `Savings: `;
                incomeSpan.innerText = `${totalIncome - totalExpense}`;
                userBox.append(incomeSpanText, incomeSpan)

            }
            parentBox.append(userBox)
            // expenseSpan.innerText = `${expenseSum}`;

        })

        // const totalBox = document.querySelector('side-users-total') ?? document.createElement('div');
        // parentBox.append(totalBox);

        const totalBox = document.querySelector(".side-users-total") ?? document.createElement("div");
        while (totalBox.lastElementChild) {
            totalBox.lastElementChild.remove();
        }
        if (totalBox.classList.contains("side-users-total") !== true) {
            totalBox.classList.add("side-users-total");
        }
        parentBox.append(totalBox);

        const totalDiv = document.createElement("span");
        const totalDiv2 = document.createElement("span");
        const totalDiv3 = document.createElement("span");
        const incomeSpanText = document.createElement("p");
        const expenseSpanText = document.createElement("p");
        const savingsSpanText = document.createElement("p");

        expenseSpanText.innerText = `Expense: `;
        totalDiv.innerText = `${userSumExpenses}`;

        incomeSpanText.innerText = `Income: `;
        totalDiv2.innerText = `${userSumIncome}`;

        savingsSpanText.innerText = `Savings: `;
        totalDiv3.innerText = `${userSumIncome - userSumExpenses}`;

        totalBox.append(expenseSpanText, totalDiv, incomeSpanText, totalDiv2, savingsSpanText, totalDiv3);


    }

    isDashboardListEmpty() {
        const parentBox = document.querySelector('.top-content');
        const element = document.getElementById('h2-box') || document.createElement('h2');
        if (this.state.expenses.length === 0) {

            element.innerText = `List is empty`;
            element.id = 'h2-box'
            parentBox.append(element)
        } else {
            element.remove();
        }
    }

    createCategoryBox(month = this.currentDate.month()) {
        const parentBox = document.querySelector('.top-content');
        let allCategories = [];
        const expensesBoxes = document.querySelectorAll('.box');
        this.isDashboardListEmpty();
        if (expensesBoxes.length > 0) {
            expensesBoxes.forEach((item) => {
                item.remove();
            })
        }
        const oneMonthNewArray = this.filterDataByMonth(this.state.expenses);
        console.log(oneMonthNewArray)
        oneMonthNewArray.forEach((item) => {
            //zwraca bool z tablicy
            const result = allCategories.some((category) => {
                return category === item.category;
            });
            if (result !== true) {
                allCategories.push(item.category);
                const categoryBox = document.createElement('div');

                const categoryIdName = this.state.settings.categories.find((item2) =>
                    item2.id === item.category
                );
                categoryBox.style.background = categoryIdName.color;
                categoryBox.id = item.category;
                categoryBox.classList.add('box');

                categoryBox.innerHTML = `<span class="material-symbols-outlined">${categoryIdName.icon}</span><h2>${categoryIdName.name}</h2>Total:${this.getCategorySum(item.category)}`;
                parentBox.append(categoryBox);
            }
        })
    }


    showSum(month = this.currentDate.month()) {
        const oneMonthNewArray = this.filterExpensesByMonth(this.state.expenses, month);
        if (this.state.expenses.length > 0) {
            const wynik = oneMonthNewArray.reduce((sum, item) => {
                return sum + parseInt(item.amount);
            }, 0)
        }
    }

    getCategorySum(category, month = this.currentDate.month()) {
        const oneMonthNewArray = this.filterDataByMonth(this.state.expenses, month);
        const result = oneMonthNewArray.reduce((sum, item) => {
            if (item.category === category) {
                return sum + parseInt(item.amount);
            } else {
                return sum;
            }
        }, 0)
        return result;
    }


    addNewExpense(e) {
        e.preventDefault();
        let newExpense = {
            category: this.categorySelect.value,
            amount: this.amountInput.value,
            date: new Date(),
            id: this.generateId(),
            addedBy: this.state.settings.currentUser.id
        }

        if (this.amountInput.value.length === 0) {
            const form = document.querySelector('form');
            const info = document.createElement('h3');
            form.append(info);
            setTimeout(() => { info.remove(); }, 1000);
            info.innerText = "Please add your expense";
            return;
        }
        this.state.expenses.unshift(newExpense);
        localStorage.setItem('Expenses', JSON.stringify(this.state.expenses))

        this.amountInput.value = "";
        // this.resetForm(this.amountInput);
        this.createCategoryBox();
        // this.updateExpenses();
        this.printRecentHistory();
        this.printTotals();
        const addExpense = new Event('expense', { bubbles: true });
        e.currentTarget.dispatchEvent(addExpense);
    }


    //TODO do zrobienia: aktualizowanie wykryse przy dodawaniu wydatków - chart.update()

    gotoPage(e) {
        this.menuAllEl.forEach(element => {
            element.classList.remove("menu__item--bold")
        });
        e.target.classList.add("menu__item--bold");
        const currentPage = document.querySelector(`[data-content-page="${e.target.dataset.page}"]`)
        const previousPage = document.querySelector('.visible')

        // jesli przycisk prowadzi do strony prowadzi do strony z visible,nie checemy ze strona usuwala klase
        if (currentPage === previousPage) return;

        currentPage.classList.add("visible");
        previousPage.classList.remove("visible");
    }

    showMonth() {
        const monthFinanceText = document.getElementById('month-finance');
        monthFinanceText.innerText = this.currentDate.format('MMMM, YYYY');
    }

    async getCurrencies() {
        const data = await fetch('https://restcountries.com/v3.1/all')
        const parsedData = await data.json();
        this.allCurrenciesArray = parsedData;
    }

    loadState() {
        let expenses;
        let settings;
        let income;
        let users;

        const expensesDefaultState = [];
        // const settingsDefaultState = {
        //     categories: [{
        //         name: "No Category",
        //         color: "#dddddd",
        //         icon: "payments",
        //         id: "0"
        //     }],
        //     currency: 'PLN',
        //     currentUser: this.defaultUser
        // };
        const settingsDefaultState = {
            categories: [{
                name: "No Expense Category",
                color: "#dddddd",
                icon: "payments",
                id: "0",
                type: "expense"
            },
            {
                name: "No Income Category",
                color: "#000000",
                icon: "payments",
                id: "0",
                type: "income"
            }],
            currency: 'PLN',
            currentUser: this.defaultUser
        };

        const usersDefaultState = [this.defaultUser];

        const incomeDefaultState = [];
        const expensesRaw = localStorage.getItem('Expenses');
        const settingsRaw = localStorage.getItem('Settings');
        const incomeRaw = localStorage.getItem('Income');
        const usersRaw = localStorage.getItem('Users');

        if (expensesRaw != null) {
            expenses = JSON.parse(expensesRaw);
        } else {
            localStorage.setItem('Expenses', JSON.stringify(expensesDefaultState));
        }
        if (settingsRaw != null) {
            settings = JSON.parse(settingsRaw);
        } else {
            localStorage.setItem('Settings', JSON.stringify(settingsDefaultState));
        }
        if (incomeRaw != null) {
            income = JSON.parse(incomeRaw);
        } else {
            localStorage.setItem('Income', JSON.stringify(incomeDefaultState));
        }
        if (usersRaw != null) {
            users = JSON.parse(usersRaw);
        } else {
            localStorage.setItem('Users', JSON.stringify(usersDefaultState));
        }


        this.state = {
            expenses: expenses || expensesDefaultState,
            settings: settings || settingsDefaultState,
            income: income || incomeDefaultState,
            users: users || usersDefaultState
        }

    }

    init() {
        this.loadState();
        this.getCurrencies();
        this.addEventListeners();
        this.printRecentHistory();
        this.createCategoryBox();
        this.printTotals();
        this.updateCategoriesInDropdown('expense', this.categorySelect);
        this.updateCategoriesInDropdown('income', this.incomeCategory);
        this.printAllContent(4, this.printAllCategories.bind(this));
        this.printAllContent(5, this.printAllUsers.bind(this));
        this.updateUsersList();
        this.setCurrentUserIcon();
        this.showMonth();
    }
}

const APP = new FinanceOrganiser();

APP.init();




//TODO: Dodać możliwość wyboru waluty (Możemy pobierać waluty z tego API https://restcountries.com/#api-endpoints-v3-currency)
//TODO: Możliwość dodania opisu do wydatku, przychodu.

// TODO: zmienic na prawdziwa baze dancyh/ react? angular?


//TODO: Dodac filtrowanie wydatkow ze wzgledu na wybranego uzytkownika (rowniez do statystyk) na dashboard