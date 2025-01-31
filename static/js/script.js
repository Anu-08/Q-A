async function uploadFile() {
    const fileInput = document.getElementById('fileInput').files[0];

    if (!fileInput) {
        alert("Please select a file.");
        return;
    }

    const formData = new FormData();
    formData.append('document', fileInput);

    const response = await fetch('/upload', {
        method: 'POST',
        body: formData
    });

    if (response.ok) {
        alert("File uploaded successfully.");
        loadFiles(); // Reload the file list and dropdown
    } else {
        alert("File upload failed.");
    }
}

async function loadFiles() {
    const response = await fetch('/files');
    const files = await response.json();

    const fileList = document.getElementById('fileList');
    const fileDropdown = document.getElementById('fileDropdown');

    fileList.innerHTML = '';
    fileDropdown.innerHTML = '<option value="">-- Select a file --</option>'; // Reset dropdown

    files.forEach(file => {
        // Populate list
        const listItem = document.createElement('li');
        const link = document.createElement('a');
        link.href = `/uploads/${file}`;
        link.textContent = file;
        link.target = "_blank";
        listItem.appendChild(link);
        fileList.appendChild(listItem);

        // Populate dropdown
        const option = document.createElement('option');
        option.value = file;
        option.textContent = file;
        fileDropdown.appendChild(option);
    });
}

async function askQuestion() {
    const selectedFile = document.getElementById('fileDropdown').value;
    const questionInput = document.getElementById('questionInput').value;

    if (!selectedFile || !questionInput) {
        document.getElementById('answer').innerText = 'Please select a file and enter a question.';
        return;
    }

    const response = await fetch(`/uploads/${selectedFile}`);
    const blob = await response.blob();
    const file = new File([blob], selectedFile);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('question', questionInput);

    const askResponse = await fetch('/ask', {
        method: 'POST',
        body: formData
    });

    if (askResponse.ok) {
        const data = await askResponse.json();
        document.getElementById('answer').innerText = data.answer;
    } else {
        document.getElementById('answer').innerText = 'An error occurred. Please try again.';
    }
}

// Load files on page load
document.addEventListener("DOMContentLoaded", loadFiles);
