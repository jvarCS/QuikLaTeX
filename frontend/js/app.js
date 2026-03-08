const button = document.getElementById("compile");
const editor = document.getElementById("editor");
const container = document.getElementById("pdf-container");
const userfile = document.getElementById("fileUpload");
console.log(":TESTTT");

userfile.addEventListener('change', (event) => {
    const file = userfile.files[0];
    if (!file) return;

    const reader = new FileReader();
    console.log("ABBT");

    reader.onload = (e) => {
        // console.log('File contents:', e.target.result);
        editor.value = e.target.result;
    };

    reader.readAsText(file);

});

button.onclick = async () => {
    const latex = editor.value;

    try {
        const response = await fetch("http://localhost:3000/compile", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ latex })
        });

        if (!response.ok) {
            const error = await response.json();
            alert("LaTeX compilation error:\n" + error.error);
            return;
        }

        const blob = await response.blob();
        const url = URL.createObjectURL(blob);

        // Clear previous PDF
        container.innerHTML = "";

        // Load PDF using PDF.js
        const loadingTask = pdfjsLib.getDocument(url);
        loadingTask.promise.then(pdf => {
            for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
                pdf.getPage(pageNum).then(page => {
                    const viewport = page.getViewport({ scale: 1.5 });
                    const canvas = document.createElement("canvas");
                    canvas.width = viewport.width;
                    canvas.height = viewport.height;
                    container.appendChild(canvas);

                    page.render({ canvasContext: canvas.getContext("2d"), viewport });
                });
            }
        });

    } catch (err) {
        console.error(err);
    }
};