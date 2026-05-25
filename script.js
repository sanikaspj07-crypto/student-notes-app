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

// Export local storage notes array as a downloadable JSON file
function exportNotes() {
    if (notes.length === 0) {
        alert("You do not have any saved notes to export!");
        return;
    }

    // Convert notes data structure to a string
    const jsonString = JSON.stringify(notes, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    
    // Create a temporary hidden link element to force browser download triggers
    const downloadAnchor = document.createElement('a');
    const timestamp = new Date().toISOString().split('T')[0];
    
    downloadAnchor.href = URL.createObjectURL(blob);
    downloadAnchor.download = `student_notes_backup_${timestamp}.json`;
    
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    
    // Cleanup temporary DOM elements
    document.body.removeChild(downloadAnchor);
    URL.revokeObjectURL(downloadAnchor.href);
}

// Import and append unique notes from a structural JSON file
function importNotes(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importedData = JSON.parse(e.target.result);

            // Validation Guardrail: Ensure parsed file content is a valid Array
            if (Array.isArray(importedData)) {
                
                // Advanced Tip: Filter out notes that already exist in the app to prevent duplicates
                const uniqueImportedData = importedData.filter(importedNote => {
                    // If the imported note is an object (in case the schema changes later)
                    if (typeof importedNote === 'object' && importedNote !== null) {
                        return !notes.some(existingNote => 
                            typeof existingNote === 'object' && existingNote !== null 
                            ? existingNote.text === importedNote.text 
                            : existingNote === importedNote.text
                        );
                    }
                    // Standard string matching for the current codebase setup
                    return !notes.includes(importedNote);
                });

                if (uniqueImportedData.length === 0) {
                    alert("All notes in this backup are already present in your app!");
                    event.target.value = '';
                    return;
                }

                const userConfirmation = confirm(`Found ${uniqueImportedData.length} new unique notes. Do you want to add them to your existing notes?`);
                
                if (userConfirmation) {
                    // Combine existing notes with the unique imported ones
                    notes = [...notes, ...uniqueImportedData];
                    
                    localStorage.setItem("notes", JSON.stringify(notes));
                    displayNotes();
                    alert("New notes imported and added successfully!");
                }
            } else {
                alert("Import failed: JSON structure must be a valid array list.");
            }
        } catch (error) {
            alert("Error parsing backup file. Please ensure it is a valid, uncorrupted .json file.");
        }
        
        // Reset the input value so the same file can be re-uploaded if modified
        event.target.value = '';
    };
    reader.readAsText(file);
}