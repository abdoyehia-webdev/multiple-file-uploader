const fileInput = document.querySelector(".file-browse-input");
const fileInputBtn = document.querySelector(".file-browse-button");
const filesContainer = document.querySelector(".file-list");
const fileBox = document.querySelector(".file-upload-box");

let completedFiles = 0;
let totalFiles = 0;

const createFilesHTML = (file, fileId) => {
  const { name, size } = file;

  const extention = name.split(".")[1];

  const isMB = size >= 1024 * 1024;
  const formattedFileSize = size >= 1024 * 1024 ? `${(size / (1024 * 1024)).toFixed(2)} MB` : `${(size / 1024).toFixed(2)} KB`;

  return `
  
  <li class="file-item" id="item-${fileId}">
          <div class="file-extension">${extention}</div>
          <div class="file-content-wrapper">
            <div class="file-content">
              <div class="file-details">
                <h5 class="file-name">${name}</h5>
                <div class="file-info">
                  <small class="file-size">0 ${isMB ? "MB" : "KB"} / ${formattedFileSize}</small>
                  <small class="file-divider">•</small>
                  <small class="file-status">Uploading...</small>
                </div>
              </div>
              <button class="cancel-button">
                <i class="bx bx-x"></i>
              </button>
            </div>
            <div class="file-progress-bar">
              <div class="file-progress"></div>
            </div>
          </div>
        </li>
  `;
};

const handleFileUpload = (file) => {
  const xhr = new XMLHttpRequest();

  const formData = new FormData();

  formData.append("file", file);

  xhr.upload.addEventListener("progress", (e) => {
    const percentage = `${(e.loaded / e.total) * 100}`;

    const progressHTML = document.querySelector(".file-progress");
    const fileSize = document.querySelector(".file-size");

    const formattedFileSize =
      file.size >= 1024 * 1024
        ? `${(e.loaded / (1024 * 1024)).toFixed(2)}MB / ${(e.total / (1024 * 1024)).toFixed(2)} MB`
        : `${(e.loaded / 1024).toFixed(2)}KB / ${(e.loaded / 1024).toFixed(2)}KB`;

    fileSize.innerHTML = formattedFileSize;
    progressHTML.style.width = `${percentage}%`;
  });

  xhr.open("POST", "api.php", true);
  xhr.send(formData);

  return xhr;
};

const handleFileStatus = (currentFile, message, color) => {
  currentFile.querySelector(".file-status").innerHTML = message;
  currentFile.querySelector(".file-status").style.color = color;
};

const handleFileSelect = ([...files]) => {
  totalFiles += files.length;

  files.forEach((file) => {
    const fileId = crypto.randomUUID();

    const fileliHTMl = createFilesHTML(file, fileId);
    filesContainer.insertAdjacentHTML("afterbegin", fileliHTMl);
    const currentFile = document.querySelector(`#item-${fileId}`);

    const xhr = handleFileUpload(file);

    xhr.addEventListener("readystatechange", () => {
      if (xhr.status === 200 && xhr.readyState === XMLHttpRequest.DONE) {
        completedFiles++;
        handleFileStatus(currentFile, "Completed", "green");
        currentFile.querySelector(".cancel-button").remove();

        document.querySelector(".file-completed-status").innerHTML = `total completed files ${completedFiles} / ${totalFiles}`;
      }
    });

    currentFile.querySelector(".cancel-button").addEventListener("click", () => {
      xhr.abort();
      handleFileStatus(currentFile, "Cancelld", "red");
      currentFile.querySelector(".cancel-button").remove();
    });

    xhr.addEventListener("error", () => {
      handleFileStatus(currentFile, "Error", "red");
      currentFile.querySelector(".cancel-button").remove();
    });
  });
};

fileInput.addEventListener("change", (e) => handleFileSelect(e.target.files));
fileInputBtn.addEventListener("click", () => fileInput.click());

fileBox.addEventListener("drop", (e) => {
  e.preventDefault();
  handleFileSelect(e.dataTransfer.files);
  fileBox.classList.remove("active");
});

fileBox.addEventListener("dragover", (e) => {
  e.preventDefault();

  fileBox.classList.add("active");
  document.querySelector(".file-instruction").innerHTML = `Release files or `;
});

fileBox.addEventListener("dragleave", (e) => {
  e.preventDefault();
  fileBox.classList.remove("active");
  console.log("file outside");
  document.querySelector(".file-instruction").innerHTML = `Drag files or `;
});
