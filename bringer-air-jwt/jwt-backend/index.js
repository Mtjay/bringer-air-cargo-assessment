const express = require('express');
const cors = require('cors')
const jwt = require('jsonwebtoken');

const app = express();
const secret = 'mysecretkey';

app.use(cors()) 
app.use(express.static('build'))
app.get('/generate-token', (req, res) => {
    const token = jwt.sign({ data: 'mydata' }, secret, { expiresIn: '1h' });
    res.json({ token });
});

app.listen(3000, () => {
    console.log('Server started on port 3000');
});