let notes = JSON.parse(localStorage.getItem("notes")) || [];

displayNotes();

function addNote() {
    let input = document.getElementById("noteInput");
    let noteText = input.value.trim();

    if(noteText === ""){
        alert("Please enter a note");
        return;
    }

    notes.push(noteText);

    localStorage.setItem(
        "notes",
        JSON.stringify(notes)
    );

    input.value = "";

    displayNotes();
}

function displayNotes(){

    let container = document.getElementById("notesContainer");

    container.innerHTML = "";

    notes.forEach((note,index)=>{

        container.innerHTML += `
            <div class="note">
                ${note}
                <button class="delete-btn"
                onclick="deleteNote(${index})">
                X
                </button>
            </div>
        `;
    });
}

function deleteNote(index){

    notes.splice(index,1);

    localStorage.setItem(
        "notes",
        JSON.stringify(notes)
    );

    displayNotes();
}