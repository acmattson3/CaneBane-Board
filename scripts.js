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
    
    // Get the column the task is being dropped into
    const column = target.closest('.kanban-column');

    const data = event.dataTransfer.getData('text');
    const task = document.getElementById(data);

    // Find the original column from which the task is being moved
    const originalColumn = task.closest('.kanban-column');

    // Check if WIP limit is reached in the new column
    if (isWipLimitReached(column)) {
        // Show override popup if WIP limit is reached
        showOverridePopup(column, task, target);
    } else {
        // Only allow drop in valid kanban-subcolumn or kanban-column, not on the divider
        if (target.classList.contains('kanban-subcolumn') || target.classList.contains('kanban-column')) {
            target.appendChild(task);
        }
    }

    // Update the color of both the new column and the original column
    updateColumnColor(column);
    if (originalColumn && originalColumn !== column) {
        updateColumnColor(originalColumn);
    }
}

// Function to count the tasks in a column including subcolumns, excluding subcolumn elements themselves
function countTasksInColumn(column) {
    let totalTasks = 0;

    // Get tasks in the main column (excluding subcolumns themselves)
    const mainTasks = column.querySelectorAll('.kanban-task:not(.kanban-subcolumn .kanban-task)');
    totalTasks += mainTasks.length;

    // Get tasks in each subcolumn
    const subcolumns = column.querySelectorAll('.kanban-subcolumn');
    subcolumns.forEach(subcolumn => {
        const subcolumnTasks = subcolumn.querySelectorAll('.kanban-task');
        totalTasks += subcolumnTasks.length;
    });

    return totalTasks;
}


function isWipLimitReached(column) {
    const taskLimit = parseInt(column.querySelector('.task-limit').textContent, 10);
    const currentTaskCount = countTasksInColumn(column);
    return currentTaskCount > taskLimit;
}

// Function to update the column's background color based on WIP status
function updateColumnColor(column) {
    if (isWipLimitReached(column)) {
        column.style.backgroundColor = 'rgba(255, 165, 0, 0.3)'; // Pale orange
    } else {
        column.style.backgroundColor = ''; // Reset to default
    }
}

// Function to show the override prompt
function showOverridePopup(column, task, target) {
    // Create a confirmation dialog
    const confirmation = confirm('WIP limit reached! Do you want to override and add this task anyway?');
    
    if (confirmation) {
        // Turn the column background to pale orange
        column.style.backgroundColor = 'rgba(255, 165, 0, 0.3)'; // Pale orange color
        
        // Allow the task to be dropped
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
