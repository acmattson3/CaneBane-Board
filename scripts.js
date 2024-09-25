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
