const express = require("express");
const cors = require("cors");
const fs = require("fs");
const { exec } = require("child_process");
const path = require("path");

const app = express();
app.use(cors({
    origin: "quiklatex-production.up.railway.app"
}));
app.use(express.json());

app.post("/compile", (req, res) => {
    const latex = req.body.latex;
    const texPath = path.join(__dirname, "temp.tex");
    fs.writeFileSync(texPath, latex);

    exec(`pdflatex -interaction=nonstopmode -halt-on-error -output-directory ${__dirname} temp.tex`, (err, stdout, stderr) => {
        if (err) {
            console.log("LaTeX error:", stderr);
            return res.status(400).json({ error: "LaTeX compilation failed", log: stderr });
        }

        const pdfPath = path.join(__dirname, "temp.pdf");
        if (fs.existsSync(pdfPath)) {
            res.contentType("application/pdf");
            res.setHeader("Content-Disposition", "inline; filename=temp.pdf");
            res.sendFile(pdfPath);
        } else {
            res.status(500).json({ error: "PDF not generated" });
        }
    });
});

app.listen(3000, () => console.log("Server running on port 3000"));