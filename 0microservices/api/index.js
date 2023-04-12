require('dotenv').config();
const express = require('express');
const bodyparser = require('body-parser');
const cors = require('cors');

const allowAuthenticated = require('./middleware/allowAuthenticated');

const app = express();
app.use(bodyparser.json());
app.use(cors());


app.get('/', (req, res) => {
    res.json({
        routes:{
            account: '/account'
        }
    })
})

app.get("/me",allowAuthenticated, (req, res) => {
    res.json({
        message: "You are authenticated",
        id: req.userId
    })
});


const AccountAPI = require('./modules/account/account');

app.use('/account', AccountAPI);

const RecordAPI = require('./modules/record/record');

app.use('/record', RecordAPI);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
})