const express = require('express');
const path = require('path');
const app = express();
const port = 5173;

app.use(express.static('dist'));
app.use(express.static('.'));

app.get('*', (req, res) => res.sendFile(path.resolve(__dirname, 'index.html')));

app.listen(port, '0.0.0.0', () => console.log(`Server running at http://localhost:${port}`));
