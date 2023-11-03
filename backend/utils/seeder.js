const Product = require('../models/productModel');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

const products = require('../dataJson/products');


//setting up dotenv file
dotenv.config({ path: 'backend/config/config.env' });

//db connection
mongoose.connect(process.env.DBURI)
    .then(res => {
        console.log(`Server started! at ${process.env.PORT}`);
    })
    .catch(err => console.log(err));

const seedProducts = async () => {
     try {
        //delete the existing data from the db
        await Product.deleteMany();
        console.log('Products deleted!');

        //insert all the data into the db
        await Product.insertMany(products);
        console.log('Products added!');
        process.exit();

     } catch (err) {
        console.log(err);
        process.exit();
     }
}
seedProducts();