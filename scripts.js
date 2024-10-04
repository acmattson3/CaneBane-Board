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
    const target = event.target;

    // Only allow drop in valid kanban-subcolumn, not on the divider
    if (target.classList.contains("kanban-subcolumn")) {
        const data = event.dataTransfer.getData("text");
        const task = document.getElementById(data);
        target.appendChild(task);
    }
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
    newTask.style.backgroundColor = color; //pulled from google for random colors
    newTask.setAttribute("draggable", "true");
    newTask.setAttribute("ondragstart", "drag(event)");
    newTask.innerHTML = "<p>Wow I work!</p>";
    newTask.id = "task" + (document.querySelectorAll(".kanban-task").length + 1);
    backlogColumn.appendChild(newTask);
}

//Gets a random color because why not
function colorGenerator(){ 
    const randColor = '#' + Math.floor(Math.random()*16777215).toString(16);
    return randColor;
}



  /*/////////////////
 //EVENT LISTENERS//
/////////////////*/

// Event listener for New Note button
document.querySelector(".plus-button").addEventListener("click", function(event) {
    event.preventDefault();

    // Left click makes blue
    if (event.button === 0) {
        createTask("#003366");
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
        const selected = event.target.getAttribute('data-color');
        if (selected == 'random'){
            createTask(colorGenerator());
        } else if (selected == 'blue'){
            createTask("#003366");
        }else if (selected == 'pink'){
            createTask("#cc6699");
        }else if (selected == 'green'){
            createTask("#669900");
        }else if (selected == 'red'){
            createTask("#cc0000");
        }else if (selected == 'purple'){
            createTask("#4b0082");
        }else if (selected == 'yellow'){
            createTask("#ffcc00");
        }
        toggleSubMenu(); // Close the submenu after selection
    });
});
