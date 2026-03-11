const compilebtn = document.getElementById("compile");
const editor = document.getElementById("editor");
const container = document.getElementById("pdf-container");
const userfile = document.getElementById("fileUpload");
const ltxbtn = document.getElementById("latex");
const pdfbtn = document.getElementById("pdf");
currentBlob = null;

console.log(":TESTTT");

ltxbtn.onclick = () => {
    const latex = editor.value;

    const blob = new Blob([latex], { type: "text/plain" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "document.tex";
    a.click();

    URL.revokeObjectURL(url);
};

pdfbtn.onclick = () => {
    if (!currentBlob) {
        alert("Compile the document first");
        return;
    }

    const url = URL.createObjectURL(currentBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "latexPdf.pdf";
    a.click();
}

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

compilebtn.onclick = async () => {
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
        currentBlob = blob;

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