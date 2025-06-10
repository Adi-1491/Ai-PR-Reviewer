require('dotenv').config(); // reads your dotenv file and make sure content of it is available throught the code
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();
const reviewRoute = require('./routes/reviewRoute')

app.use(cors()); //allow fe and be to talk
app.use(express.json()); // helps in reading json

app.use('/api',reviewRoute)

app.listen(process.env.PORT, (error) => {
    if(!error)
    {
        console.log(`Server running on port ${process.env.PORT}`);
    }
    else{
        console.log('Error runnig the server',error);
    }
});