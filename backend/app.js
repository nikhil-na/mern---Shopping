const express = require('express');
const mongoose = require('mongoose');
const app = express();

const errorMiddleware = require('./middleware/errors');

app.use(express.json());
const dotenv = require('dotenv');
const { dot } = require('node:test/reporters');
// setting up config file
dotenv.config({ path: 'backend/config/config.env' });


//import routes
const products = require('./routes/productRoute');



//db connection
mongoose.connect(process.env.DBURI)
    .then(res => server)
    .catch(err => console.log(`Error in db ${err}`));


app.use('/api/v1', products);
app.use(errorMiddleware);

const server = app.listen(process.env.PORT, () => {
    console.log(`Server started at ${process.env.PORT}!`);
})

//Handle Unhandled promise rejection(eg. if the db connection string is invalid)
//NOT WORKING, HOWEVER (NOV 2)
process.on('unhandledRejection', err => {
    console.log(`Error: ${err.message}`);
    console.log('Shuttiing down the server because of Unhandled promise rejection');
    server.close(() => {
        process.exit(1);
    })
})