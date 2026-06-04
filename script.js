// Конфигурация Firebase со скриншота Никиты
const firebaseConfig = {
    apiKey: "AIzaSyAbqZvv_uMLQRn1hJPqJ8StPHujTiktFug",
    authDomain: "homework-uubo-03-25.firebaseapp.com",
    projectId: "homework-uubo-03-25",
    storageBucket: "homework-uubo-03-25.firebasestorage.app",
    messagingSenderId: "614943406556",
    appId: "1:614943406556:web:aa502856127acea2fe7719",
    measurementId: "G-60XWJN9VTV"
};

// Инициализация
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Список дней по умолчанию
const defaultDays = [
    { id: "mon", name: "Понедельник", subjects: { "Предмет 1": "Задание...", "Предмет 2": "Задание..." } },
    { id: "tue", name: "Вторник", subjects: { "Предмет 1": "Задание..." } },
    { id: "wed", name: "Среда", subjects: { "Предмет 1": "Задание..." } },
    { id: "thu", name: "Четверг", subjects: { "Предмет 1": "Задание..." } },
    { id: "fri", name: "Пятница", subjects: { "Предмет 1": "Задание..." } },
    { id: "sat", name: "Суббота", subjects: { "Предмет 1": "Задание..." } }
];

let isAdmin = false;
const daysContainer = document.getElementById('daysContainer');
const adminBtn = document.getElementById('adminBtn');

// Загрузка данных из Firestore
function loadData() {
    db.collection("homework_db").doc("main_data").get().then((doc) => {
        if (doc.exists && doc.data().days) {
            renderDays(doc.data().days);
        } else {
            // Если в базе пусто или структура нарушена — создаем начальный шаблон
            db.collection("homework_db").doc("main_data").set({ days: defaultDays })
                .then(() => renderDays(defaultDays));
        }
    }).catch((error) => {
        console.error("Ошибка получения данных: ", error);
        daysContainer.innerHTML = `<div class='loading' style='color:red;'>Ошибка доступа к БД. Проверьте вкладку Rules в Firebase!</div>`;
    });
}

// Отрисовка карточек на странице
function renderDays(days) {
    daysContainer.innerHTML = "";
    days.forEach((day, dayIndex) => {
        const card = document.createElement('div');
        card.className = 'day-card';
        
        let subjectsHTML = "";
        for (let sub in day.subjects) {
            if (isAdmin) {
                subjectsHTML += `
                    <div class="homework-item">
                        <span class="subject">${sub}:</span>
                        <textarea data-day="${dayIndex}" data-sub="${sub}">${day.subjects[sub]}</textarea>
                    </div>`;
            } else {
                subjectsHTML += `
                    <div class="homework-item">
                        <span class="subject">${sub}:</span>
                        <div class="task">${day.subjects[sub] || 'Не задано'}</div>
                    </div>`;
            }
        }

        card.innerHTML = `
            <h2>${day.name}</h2>
            <div class="subjects-list">${subjectsHTML}</div>
        `;

        if (isAdmin) {
            const saveBtn = document.createElement('button');
            saveBtn.className = 'btn-save';
            saveBtn.innerText = 'Сохранить день';
            saveBtn.onclick = () => saveDay(dayIndex, days);
            card.appendChild(saveBtn);
        }

        daysContainer.appendChild(card);
    });
}

// Функция сохранения конкретного дня старостой
function saveDay(dayIndex, allDays) {
    const textareas = document.querySelectorAll(`textarea[data-day="${dayIndex}"]`);
    textareas.forEach(textarea => {
        const subName = textarea.getAttribute('data-sub');
        allDays[dayIndex].subjects[subName] = textarea.value;
    });

    db.collection("homework_db").doc("main_data").update({ days: allDays })
        .then(() => alert("Изменения для дня успешно сохранены в Firebase!"))
        .catch(err => alert("Ошибка сохранения: " + err));
}

// Режим старосты
adminBtn.addEventListener('click', () => {
    if (!isAdmin) {
        const pass = prompt("Введите пароль старосты:");
        if (pass === "1234") {
            isAdmin = true;
            adminBtn.innerText = "🔒 Выйти из режима редактирования";
            loadData();
        } else {
            alert("Неверный пароль!");
        }
    } else {
        isAdmin = false;
        adminBtn.innerText = "🔐 Войти как староста";
        loadData();
    }
});

// Первый запуск при открытии страницы
loadData();
