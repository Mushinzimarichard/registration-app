const express = require('express');
const bodyParser = require('body-parser');
const { body, validationResult } = require('express-validator');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 1000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Serve a simple form (optional)
app.get('/', (req, res) => {
    res.send(`
        <form action="/register" method="post">
            Full Name: <input type="text" name="name" /><br>
            Email: <input type="text" name="email" /><br>
            Course: <input type="text" name="course" /><br>
            <button type="submit">Register</button>
        </form>
    `);
});

app.post('/register', [
    body('name').isLength({ min: 3 }).withMessage('Name must be at least 3 characters long'),
    body('email').isEmail().withMessage('Enter a valid email'),
    body('course').notEmpty().withMessage('Course is required')
], (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, course } = req.body;

    // Create a PDF document
    const doc = new PDFDocument();
    const filename = `${name.replace(/\s+/g, '_')}_registration.pdf`;
    const filePath = path.join(__dirname, 'pdfs', filename);

    doc.pipe(fs.createWriteStream(filePath));
    doc.fontSize(18).text('Proof of Registration', { align: 'center' });
    doc.moveDown();
    doc.fontSize(14).text(`Name: ${name}`);
    doc.text(`Email: ${email}`);
    doc.text(`Course: ${course}`);
    doc.end();

    res.send(`Registration successful. <a href="/download/${filename}">Download PDF</a>`);
});

// Serve the PDF
app.get('/download/:filename', (req, res) => {
    const file = path.join(__dirname, 'pdfs', req.params.filename);
    res.download(file);
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
