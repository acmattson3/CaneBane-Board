// Allow dragging
function drag(event) {
    event.dataTransfer.setData("text", event.target.id);
}

// Allow dropping in the column
function allowDrop(event) {
    event.preventDefault();
}

// Drop the task into the new column
function drop(event) {
    event.preventDefault();
    const data = event.dataTransfer.getData("text");
    const task = document.getElementById(data);
    event.target.appendChild(task);
}

// Toggle SubMenu for right-click options
function toggleSubMenu() {
    var submenu = document.getElementById('submenu');
    submenu.style.display = submenu.style.display === 'block' ? 'none' : 'block';
}

// Create a new kanban task
function createTask(color) {
    const backlogColumn = document.querySelector(".kanban-column");
    const newTask = document.createElement("div");
    newTask.classList.add("kanban-task", color);
    newTask.setAttribute("draggable", "true");
    newTask.setAttribute("ondragstart", "drag(event)");
    newTask.innerHTML = "<p>Wow I work!</p>";
    newTask.id = "task" + (document.querySelectorAll(".kanban-task").length + 1);
    backlogColumn.appendChild(newTask);
}

// Event listener for New Note button
document.querySelector(".plus-button").addEventListener("click", function(event) {
    event.preventDefault();

    // Left click makes blue
    if (event.button === 0) {
        createTask('blue');
    }
});

// Right click lets user select color
document.querySelector(".plus-button").addEventListener("contextmenu", function(event) {
    event.preventDefault();

    // opens menu on click
    toggleSubMenu();
});

// Add event listeners for submenu color options
document.querySelectorAll('.submenu li a').forEach(function(option) {
    option.addEventListener('click', function(event) {
        const selectedColor = event.target.getAttribute('data-color');
        createTask(selectedColor);
        toggleSubMenu(); // Close the submenu after selection
    });
});
