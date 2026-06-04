const ADMIN_PASSWORD = "1234"; // Твой пароль для редактирования ДЗ
let isAdmin = false;
let currentWeekIndex = 0;

// Твои личные ключи связи с базой данных из Firebase
const firebaseConfig = {
    apiKey: "AIzaSyAbqZvv_uMLQRn1hJPqJ8StPHujTiktFug",
    authDomain: "homework-uubo-03-25.firebaseapp.com",
    projectId: "homework-uubo-03-25",
    storageBucket: "homework-uubo-03-25.appspot.com",
    messagingSenderId: "614943406556",
    appId: "1:614943406556:web:aa502856127acea2fe7719",
    measurementId: "G-60XWJN9VTV"
};

// Инициализация Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Локальные копии данных
let weeksData = [];
let importantTasksHTML = "<li>Пока важных объявлений нет.</li>";

const container = document.getElementById('schedule-container');
const weekSelect = document.getElementById('week-select');
const importantList = document.getElementById('important-list');

// 1. ЗАГРУЗКА ДАННЫХ ИЗ ОБЛАКА ПРИ ОТКРЫТИИ СТРАНИЦЫ
async function loadDataFromCloud() {
    try {
        const doc = await db.collection("homework_db").doc("main_data").get();
        
        if (doc.exists) {
            const cloudData = doc.data();
            weeksData = cloudData.weeks || [];
            importantTasksHTML = cloudData.important || "<li>Пока важных объявлений нет.</li>";
        } else {
            // Если база полностью пустая (первый запуск), создаем шаблон
            weeksData = [{
                weekName: "Неделя 1 (Текущая)",
                days: [
                    { day: "Понедельник", subjects: [] }, { day: "Вторник", subjects: [] },
                    { day: "Среда", subjects: [] }, { day: "Четверг", subjects: [] },
                    { day: "Пятница", subjects: [] }, { day: "Суббота", subjects: [] }
                ]
            }];
            importantTasksHTML = "<li><strong>Административное право:</strong> Привет! Войди как староста, чтобы отредактировать меня.</li>";
            await db.collection("homework_db").doc("main_data").set({ weeks: weeksData, important: importantTasksHTML });
        }
        importantList.innerHTML = importantTasksHTML;
        renderTree();
    } catch (error) {
        console.error("Ошибка загрузки из Firebase:", error);
        alert("Не удалось загрузить данные из облака.");
    }
}

// 2. ОТПРАВКА ИЗМЕНЕНИЙ В ОБЛАКО (БЕЗ СКАЧИВАНИЯ ФАЙЛОВ!)
async function saveDataToCloud() {
    const saveBtn = document.getElementById('save-btn');
    saveBtn.innerText = "⏳ Сохранение...";
    saveBtn.disabled = true;

    // Считываем то, что админ мог поменять в блоке "Важное"
    importantTasksHTML = importantList.innerHTML;

    try {
        await db.collection("homework_db").doc("main_data").set({
            weeks: weeksData,
            important: importantTasksHTML
        });
        alert("🔥 Изменения успешно сохранены в облаке! Все одногруппники увидят их прямо сейчас.");
    } catch (error) {
        console.error("Ошибка сохранения:", error);
        alert("Ошибка при сохранении данных в облако.");
    } finally {
        saveBtn.innerText = "💾 Сохранить в облако";
        saveBtn.disabled = false;
    }
}

function renderWeekSelector() {
    weekSelect.innerHTML = "";
    weeksData.forEach((week, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.innerText = week.weekName;
        if (index === currentWeekIndex) option.selected = true;
        weekSelect.appendChild(option);
    });
}

function switchWeek(index) {
    currentWeekIndex = parseInt(index);
    renderTree();
}

function renderTree() {
    container.innerHTML = "";
    renderWeekSelector();
    
    if (weeksData.length === 0) return;
    const activeWeek = weeksData[currentWeekIndex];
    
    activeWeek.days.forEach((dayData, dayIndex) => {
        const dayCard = document.createElement('div');
        dayCard.className = 'day-card';
        
        let subjectsHTML = '';
        dayData.subjects.forEach((sub, subIndex) => {
            let fileHTML = '';
            if (sub.fileUrl && sub.fileTitle) {
                fileHTML = `<div class="subject-files"><a href="${sub.fileUrl}" class="file-link" target="_blank">🔗 ${sub.fileTitle}</a></div>`;
            }
            
            let adminFields = '';
            if (isAdmin) {
                adminFields = `
                    <div class="admin-input-group">
                        <input type="text" value="${sub.fileTitle}" placeholder="Название файла" onchange="updateFileTitle(${dayIndex}, ${subIndex}, this.value)">
                        <input type="text" value="${sub.fileUrl}" placeholder="Ссылка на файл/фото" onchange="updateFileUrl(${dayIndex}, ${subIndex}, this.value)">
                    </div>
                    <button class="btn btn-danger btn-action" onclick="deleteSubject(${dayIndex}, ${subIndex})">❌ Удалить предмет</button>
                `;
            }

            subjectsHTML += `
                <div class="subject">
                    <span class="subject-name ${isAdmin ? 'admin-editable' : ''}" contenteditable="${isAdmin}" onblur="updateSubjectName(${dayIndex}, ${subIndex}, this.innerText)">${sub.name}</span>
                    <p class="homework ${isAdmin ? 'admin-editable' : ''}" contenteditable="${isAdmin}" onblur="updateHomework(${dayIndex}, ${subIndex}, this.innerText)">${sub.homework}</p>
                    ${fileHTML}
                    ${adminFields}
                </div>
            `;
        });

        let addSubjectBtn = isAdmin ? `<button class="btn btn-action" onclick="addSubject(${dayIndex})">➕ Добавить предмет</button>` : '';

        dayCard.innerHTML = `
            <h3>${dayData.day}</h3>
            ${subjectsHTML}
            ${addSubjectBtn}
        `;
        container.appendChild(dayCard);
    });
}

function updateSubjectName(dIdx, sIdx, val) { weeksData[currentWeekIndex].days[dIdx].subjects[sIdx].name = val; }
function updateHomework(dIdx, sIdx, val) { weeksData[currentWeekIndex].days[dIdx].subjects[sIdx].homework = val; }
function updateFileTitle(dIdx, sIdx, val) { weeksData[currentWeekIndex].days[dIdx].subjects[sIdx].fileTitle = val; }
function updateFileUrl(dIdx, sIdx, val) { weeksData[currentWeekIndex].days[dIdx].subjects[sIdx].fileUrl = val; }

function addSubject(dIdx) {
    weeksData[currentWeekIndex].days[dIdx].subjects.push({ name: "Новый предмет", homework: "Задание...", fileTitle: "", fileUrl: "" });
    renderTree();
}

function deleteSubject(dIdx, sIdx) {
    weeksData[currentWeekIndex].days[dIdx].subjects.splice(sIdx, 1);
    renderTree();
}

function createNewWeek() {
    const name = prompt("Введите название новой недели (например: Неделя 08.09 - 14.09):");
    if (name) {
        weeksData.push({
            weekName: name,
            days: [
                { day: "Понедельник", subjects: [] }, { day: "Вторник", subjects: [] },
                { day: "Среда", subjects: [] }, { day: "Четверг", subjects: [] },
                { day: "Пятница", subjects: [] }, { day: "Суббота", subjects: [] }
            ]
        });
        currentWeekIndex = weeksData.length - 1;
        renderTree();
    }
}

// Авторизация старосты
document.getElementById('login-btn').addEventListener('click', () => {
    const pass = prompt("Введи пароль старосты:");
    if (pass === ADMIN_PASSWORD) {
        isAdmin = true;
        document.getElementById('login-btn').style.display = 'none';
        document.getElementById('save-btn').style.display = 'inline-block';
        document.getElementById('logout-btn').style.display = 'inline-block';
        document.getElementById('add-week-btn').style.display = 'inline-block';
        document.getElementById('important-tasks').contentEditable = "true";
        document.getElementById('important-tasks').classList.add('admin-editable');
        renderTree();
    } else { alert("Неверный пароль!"); }
});

document.getElementById('logout-btn').addEventListener('click', () => {
    isAdmin = false;
    document.getElementById('login-btn').style.display = 'inline-block';
    document.getElementById('save-btn').style.display = 'none';
    document.getElementById('logout-btn').style.display = 'none';
    document.getElementById('add-week-btn').style.display = 'none';
    document.getElementById('important-tasks').contentEditable = "false";
    document.getElementById('important-tasks').classList.remove('admin-editable');
    renderTree();
});

document.getElementById('save-btn').addEventListener('click', saveDataToCloud);

// Первый запуск и стягивание базы данных
loadDataFromCloud();