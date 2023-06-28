const express = require('express');

const app = express();

//body parser

app.use(express.json());

app.post('/', (req, res) => {
    console.log(req.body);
    res.send('Hello World');
})

app.listen(3000, () => console.log('Server running on port 3000'));