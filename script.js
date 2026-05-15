let activityForm = document.getElementById("activityForm");
let activityNameInput = document.getElementById("activityName");
let activityCategoryInput = document.getElementById("activityCategory");
let activityDateInput = document.getElementById("activityDate");
let hoursInput = document.getElementById("hours");
let minutesInput = document.getElementById("minutes");
let activityNotesInput = document.getElementById("activityNotes");
let formMessage = document.getElementById("formMessage");
let totalActivities = document.getElementById("totalActivities");
let totalHours = document.getElementById("totalHours");
let activityList = document.getElementById("activityList");
let emptyState = document.getElementById("emptyState");
let themeToggle = document.getElementById("themeToggle");

let activityStorageKey = "simpleActivityTrackerActivities";
let themeStorageKey = "simpleActivityTrackerTheme";

let activities = [];

document.addEventListener("DOMContentLoaded", initializeApp);

function initializeApp() {
    activities = loadActivities();
    setTodayAsDefaultDate();
    applySavedTheme();
    renderActivities();
    updateSummary();

    activityForm.addEventListener("submit", addActivity);
    themeToggle.addEventListener("click", toggleTheme);
}

function loadActivities() {
    let savedActivities = localStorage.getItem(activityStorageKey);

    if (!savedActivities) {
        return [];
    }

    try {
        let parsedActivities = JSON.parse(savedActivities);

        if (Array.isArray(parsedActivities)) {
            return parsedActivities;
        } else {
            return [];
        }
    } catch (error) {
        return [];
    }
}

function saveActivities() {
    localStorage.setItem(activityStorageKey, JSON.stringify(activities));
}

function setTodayAsDefaultDate() {
    let today = new Date();
    let todayText = today.toISOString().split("T")[0];

    activityDateInput.value = todayText;
}

function addActivity(event) {
    event.preventDefault();

    let name = activityNameInput.value.trim();
    let category = activityCategoryInput.value;
    let date = activityDateInput.value;
    let hours = parseInt(hoursInput.value, 10);
    let minutes = parseInt(minutesInput.value, 10);
    let notes = activityNotesInput.value.trim();

    if (name.length < 2) {
        showMessage("Please enter a valid activity name.", true);
        return;
    }

    if (!date) {
        showMessage("Please select a date.", true);
        return;
    }

    if (isNaN(hours) || isNaN(minutes) || hours < 0 || minutes < 0 || minutes > 59) {
        showMessage("Please enter valid hours and minutes.", true);
        return;
    }

    if (hours === 0 && minutes === 0) {
        showMessage("Time cannot be 0 hours and 0 minutes.", true);
        return;
    }

    let activity = {
        id: Date.now(),
        name: name,
        category: category,
        date: date,
        hours: hours,
        minutes: minutes,
        notes: notes
    };

    activities.unshift(activity);
    saveActivities();
    renderActivities();
    updateSummary();
    activityForm.reset();
    setTodayAsDefaultDate();
    showMessage("Activity added successfully.", false);
}

function renderActivities() {
    activityList.innerHTML = "";

    if (activities.length === 0) {
        emptyState.style.display = "block";
        return;
    }

    emptyState.style.display = "none";

    let sortedActivities = activities.slice();

    sortedActivities.sort(function (firstActivity, secondActivity) {
        return new Date(secondActivity.date) - new Date(firstActivity.date);
    });

    for (let i = 0; i < sortedActivities.length; i++) {
        let activity = sortedActivities[i];
        let listItem = document.createElement("li");
        let details = document.createElement("div");
        let title = document.createElement("h3");
        let meta = document.createElement("p");
        let deleteButton = document.createElement("button");

        listItem.className = "activity-item";
        meta.className = "activity-meta";
        deleteButton.type = "button";
        deleteButton.className = "delete-btn";

        title.textContent = activity.name;
        let timeText = activity.hours + "h " + activity.minutes + "m";
        meta.textContent = activity.category + " | " + activity.date + " | " + timeText;
        deleteButton.textContent = "Delete";

        details.appendChild(title);
        details.appendChild(meta);

        if (activity.notes) {
            let notes = document.createElement("p");

            notes.className = "activity-notes";
            notes.textContent = activity.notes;
            details.appendChild(notes);
        }

        deleteButton.addEventListener("click", function () {
            deleteActivity(activity.id);
        });

        listItem.appendChild(details);
        listItem.appendChild(deleteButton);
        activityList.appendChild(listItem);
    }
}

function deleteActivity(activityId) {
    let remainingActivities = [];

    for (let i = 0; i < activities.length; i++) {
        if (activities[i].id !== activityId) {
            remainingActivities.push(activities[i]);
        }
    }

    activities = remainingActivities;
    saveActivities();
    renderActivities();
    updateSummary();
    showMessage("Activity deleted.", false);
}

function updateSummary() {
    let totalMinutes = 0;

    totalActivities.textContent = activities.length;

    for (let i = 0; i < activities.length; i++) {
        let activity = activities[i];
        totalMinutes = totalMinutes + (activity.hours * 60) + activity.minutes;
    }

    totalHours.textContent = formatMinutes(totalMinutes);
}

function formatMinutes(totalMinutes) {
    let hours = Math.floor(totalMinutes / 60);
    let minutes = totalMinutes % 60;

    return hours + "h " + minutes + "m";
}

function showMessage(message, isError) {
    formMessage.textContent = message;

    if (isError) {
        formMessage.className = "form-message error-message";
    } else {
        formMessage.className = "form-message success-message";
    }
}

function applySavedTheme() {
    let savedTheme = localStorage.getItem(themeStorageKey);

    if (!savedTheme) {
        savedTheme = "light";
    }

    applyTheme(savedTheme);
}

function toggleTheme() {
    let nextTheme = "dark";

    if (document.body.classList.contains("dark-mode")) {
        nextTheme = "light";
    }

    applyTheme(nextTheme);
    localStorage.setItem(themeStorageKey, nextTheme);
}

function applyTheme(theme) {
    let isDarkMode = false;

    if (theme === "dark") {
        isDarkMode = true;
    }

    if (isDarkMode) {
        document.body.classList.add("dark-mode");
        themeToggle.textContent = "Light Mode";
    } else {
        document.body.classList.remove("dark-mode");
        themeToggle.textContent = "Dark Mode";
    }
}
