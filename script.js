const ADMIN_PASSWORD = "1234"; 
let isAdmin = false;
let currentWeekIndex = 0;

// Глобальная база данных недель (календарь)
let weeksData = [
    {
        weekName: "Неделя 1 (Текущая)",
        days: [
            { day: "Понедельник", subjects: [{ name: "Конституционное право", homework: "Читать главу 3.", fileTitle: "Вопросы.pdf", fileUrl: "https://example.com/1.pdf" }] },
            { day: "Вторник", subjects: [{ name: "Административное право", homework: "Задачи 1-5.", fileTitle: "", fileUrl: "" }] },
            { day: "Среда", subjects: [] },
            { day: "Четверг", subjects: [] },
            { day: "Пятница", subjects: [] },
            { day: "Суббота", subjects: [] }
        ]
    }
];

const container = document.getElementById('schedule-container');
const weekSelect = document.getElementById('week-select');

// Функция отрисовки выпадающего списка недель (календаря)
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

// Переключение недели пользователем
function switchWeek(index) {
    currentWeekIndex = parseInt(index);
    renderTree();
}

// Отрисовка 6 дней выбранной недели
function renderTree() {
    container.innerHTML = "";
    renderWeekSelector();
    
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

// Функции обновления данных админом
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

// Создание новой недели в календаре
function createNewWeek() {
    const name = prompt("Введите название новой недели (например: Неделя 15.09 - 21.09):");
    if (name) {
        weeksData.push({
            weekName: name,
            days: [
                { day: "Понедельник", subjects: [] }, { day: "Вторник", subjects: [] },
                { day: "Среда", subjects: [] }, { day: "Четверг", subjects: [] },
                { day: "Пятница", subjects: [] }, { day: "Суббота", subjects: [] }
            ]
        });
        currentWeekIndex = weeksData.length - 1; // Переключаемся на созданную неделю
        renderTree();
    }
}

// Авторизация
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

// Кнопка сохранения
document.getElementById('save-btn').addEventListener('click', () => {
    const updatedCode = `const ADMIN_PASSWORD = "${ADMIN_PASSWORD}";
let isAdmin = false;
let currentWeekIndex = ${currentWeekIndex};
let weeksData = ${JSON.stringify(weeksData, null, 4)};
${renderWeekSelector.toString()}
${switchWeek.toString()}
${renderTree.toString()}
${updateSubjectName.toString()}
${updateHomework.toString()}
${updateFileTitle.toString()}
${updateFileUrl.toString()}
${addSubject.toString()}
${deleteSubject.toString()}
${createNewWeek.toString()}
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
document.getElementById('save-btn').addEventListener('click', ${document.getElementById('save-btn').onclick.toString()});
renderTree();`;

    const blob = new Blob([updatedCode], { type: "text/javascript" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "script.js";
    link.click();
    alert("Файл 'script.js' успешно обновлен! Замените им старый файл на GitHub.");
});

// Запуск
renderTree();