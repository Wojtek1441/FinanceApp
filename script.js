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
        this.userInput = document.getElementById('user-input'); // TODO: ZOBACZYC czy musi byc w konstruktorze
        this.incomeCategory = document.getElementById('income-category');
        this.amountInput = document.getElementById("amount");
        this.colorInput = document.getElementById('color');
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
        this.defaultCategories = ['Food', 'Car Expenses', 'Activities', 'Utilities', 'Subscriptions', 'Gifts'];
        this.defaultUser = {
            id: '0',
            name: 'Default User',
        };
        this.allCurrenciesArray = [];
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

        // this.saveSettingsSubmit.addEventListener("click", (e) => this.saveSettings(e, 5));
    }



    getCurrentUser() {
        const id = this.userSettingsSelect.value;
        return this.state.users.filter((user) => user.id === id).at(-1);
    }

    setCurrentUserIcon() {
        if (this.state.settings.currentUser.id !== '0') {
            this.userIcon.innerText = this.state.settings.currentUser.name.slice(0, 2).toUpperCase();
        }
    }

    saveSettings(e) {
        e.preventDefault();
        // dodawac do local storage i do stanu aktualnego usera
        this.state.settings.currentUser = this.getCurrentUser();

        localStorage.setItem('Settings', JSON.stringify(this.state.settings))

        this.setCurrentUserIcon();
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

        this.printTotals();

        this.incomeInput.value = "";
        // this.showErrorMessage("income-form", "Please add your income", true);
        // this.resetForm(this.incomeInput);
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
        this.printRecentExpenses(this.currentDate.month());
    }

    addNewCategory(e) {
        e.preventDefault();
        if (this.newCategoryInput.checkValidity()) {
            const newCategoryObj = {
                name: this.newCategoryName,
                color: this.newCategoryColor,
                icon: this.newCategoryIcon,
                id: this.generateId(),
            }
            this.state.settings.categories.push(newCategoryObj);

            localStorage.setItem('Settings', JSON.stringify(this.state.settings))
            this.updateCategoriesInDropdown();
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

    updateCategoriesInDropdown() {
        while (this.categorySelect.lastElementChild) {
            this.categorySelect.removeChild(this.categorySelect.lastElementChild);
        }
        const fragment = document.createDocumentFragment()

        this.state.settings.categories.forEach((category) => {
            const option = document.createElement("option");
            option.value = category.id;
            option.text = category.name;
            fragment.append(option);
        });
        this.categorySelect.appendChild(fragment)
    }

    removeCategory(e) {
        const updatedArray = this.state.settings.categories.filter((item) => {
            return item.id != e.currentTarget.dataset.category;
        });
        this.state.settings.categories = updatedArray;
        localStorage.setItem('Settings', JSON.stringify(this.state.settings));
        this.moveExpensesToDefaultCategory(e.currentTarget.dataset.category);
        this.updateCategoriesInDropdown();
    }

    moveExpensesToDefaultCategory(removedCategory) {
        this.state.expenses.forEach((item) => {
            if (item.category === removedCategory) {
                item.category = "0";
            }
        });
        localStorage.setItem('Expenses', JSON.stringify(this.state.expenses));
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

    //Wypisuje wydatki na glownej stronie
    printRecentExpenses() {
        const expensesBox = document.querySelector('.bottom-content');

        if (this.state.expenses.length === 0) {
            this.showErrorMessage("category-summary", "List is empty2", false);
            return;
        } else {
            //TODO: Zmienić sposób usuwania elementu
            const h2 = document.getElementById('h2XYZ');
            if (h2) {

                h2.remove();
            }
        }

        const oneMonthNewArray = this.filterDataByMonth(this.state.expenses);
        const ulList = document.createElement('ul');
        const expensesBoxes = expensesBox.querySelectorAll('li');

        if (expensesBoxes.length > 0) {
            expensesBoxes.forEach((item) => {
                item.remove();
            })
        }

        oneMonthNewArray.forEach((item) => {
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
            element.innerText = categoryIdName.name;
            circle.innerText = `${item.amount}`
            icon.style.background = categoryIdName.color;


            const foundUser = this.state.users.find((user) => {
                    return user.id === item.addedBy
                })
                // user.innerText = foundUser[0]?.id;
            user.innerText = foundUser.name

            icon.innerText = categoryIdName.icon;

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
        if (this.state.expenses.length === 0) {
            return;
        }
        return storage.filter((item) => {

            return dayjs(this.currentDate).isSame(dayjs(item.date), 'month')
        })
    }

    printTotals(month = this.currentDate.month()) {
        // const expensesObj = localStorage.getItem('Expenses');
        // const incomeObj = localStorage.getItem('Income');
        // const parsedExpenseObj = JSON.parse(expensesObj);
        // const parsedIncomeObj = JSON.parse(incomeObj);

        const expensesBox = document.querySelector('.bottom-content');
        const oneMonthNewExpenseArray = this.filterDataByMonth(this.state.expenses);
        const oneMonthNewIncomeArray = this.filterDataByMonth(this.state.income);


        let totalBox = document.querySelector('.total');
        if (totalBox == null) {
            totalBox = document.createElement('h2');
        }
        totalBox.classList.add('total');


        if (this.state.expenses.length === 0 && this.state.income.length === 0) {
            totalBox.innerText = `No Finances Yet`;
            return;
        }

        const countTotal = (sum, item) => {
            return sum + parseInt(item.amount);
        }

        function groupByUsers(acc, item) {
            const { category, amount, data, id } = item;
            if (acc[item.addedBy] == null) acc[item.addedBy] = [];
            acc[item.addedBy].push({ category, amount, data, id })
            return acc;
        };
        const [test, test2] = [1, 2];
        console.log(test, test2);
        // const newUserFilter = oneMonthNewExpenseArray.filter((expenseItem) => {
        //     return expenseItem.addedBy === this.state.settings.currentUser.id
        // })

        let incomeResult = oneMonthNewIncomeArray.reduce(countTotal, 0);
        // let incomeResult = newUserFilter.reduce(countTotal, 0);

        let expenseUser = oneMonthNewExpenseArray.reduce(groupByUsers, {});
        let incomeUser = oneMonthNewIncomeArray.reduce(groupByUsers, {});
        console.log(incomeUser)
            // console.log({ expenseUser });
            // let expenseResult = expenseUser.reduce(countTotal, 0);

        // console.log(expenseResult);
        let expenseSum;
        let incomeSum;
        for (let key in expenseUser) {
            expenseSum = expenseUser[key].reduce(countTotal, 0);
        }

        for (let key in incomeUser) {
            incomeSum = incomeUser[key].reduce(countTotal, 0);
        }
        const expenseBox = document.createElement('div');
        totalBox.append(expenseBox)
        expenseBox.innerText = `Income: ${incomeSum}, Expense : ${expenseSum}, Savings: ${incomeSum - expenseSum}`;
        // totalBox.innerText = `Income: ${incomeResult}, Expense : ${expenseResult}, Savings: ${incomeResult - expenseResult}`;

        // iteracja po obiekcie js 
        // console.log(Object.entries(expenseUser));
        // for (let [key, value] of Object.entries(expenseUser)) {
        //     console.log(key, value);
        // }


        // totalBox.innerText = `Income: ${incomeResult}, Expense : ${expenseResult}, Savings: ${incomeResult - expenseResult}`;


        expensesBox.prepend(totalBox)

    }

    createCategoryBox(month = this.currentDate.month()) {
        const parentBox = document.querySelector('.top-content');
        let allCategories = [];
        const expensesBoxes = document.querySelectorAll('.box');
        if (this.state.expenses.length === 0) {
            const element = document.createElement('h2');
            parentBox.append(element)
            element.innerText = `List is empty`;
            element.id = 'h2-box'
            return;
        } else {
            const h2 = document.getElementById('h2-box');
            if (h2) {

                h2.remove();
            }
        }
        if (expensesBoxes.length > 0) {
            expensesBoxes.forEach((item) => {
                item.remove();
            })
        }
        const oneMonthNewArray = this.filterDataByMonth(this.state.expenses);
        oneMonthNewArray.forEach((item) => {

            //zwraca bool z tablicy
            const result = allCategories.some((category) => {
                return category === item.category;
            });
            if (result !== true) {
                allCategories.push(item.category);
                const categoryBox = document.createElement('div');
                let categoryIdName;

                this.state.settings.categories.forEach((item2) => {

                    if (item2.id === item.category) {

                        categoryIdName = item2

                    };
                })

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
        const oneMonthNewArray = this.filterExpensesByMonth(this.state.expenses, month);
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
        this.printRecentExpenses();
        this.printTotals();
    }




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
        const settingsDefaultState = {
            categories: [{
                name: "No Category",
                color: "#dddddd",
                icon: "payments",
                id: "0"
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
        this.printRecentExpenses();
        this.createCategoryBox();
        this.printTotals();
        this.updateCategoriesInDropdown();
        this.printAllContent(4, this.printAllCategories.bind(this));
        this.printAllContent(5, this.printAllUsers.bind(this));
        this.updateUsersList();
        this.setCurrentUserIcon();
        this.showMonth();
    }
}

const APP = new FinanceOrganiser();

APP.init();



//TODO: Dodać bibliotekę od wykresów/statystyk
//TODO: Dodać możliwość wyboru waluty (Możemy pobierać waluty z tego API https://restcountries.com/#api-endpoints-v3-currency)
//TODO: (13.12.2022) Osobna lista wydatków dla każdego z użytkowników (dashboard)
//TODO: Możliwość dodania opisu do wydatku, przychodu.