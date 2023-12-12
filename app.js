const express = require('express');
const app = express();
require('dotenv').config();


// Request Logging
const morgan = require('morgan');
app.use(morgan('dev'));


// enable body parsing
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

const mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_CONN_URL, {});

//CORS Error Handling 
app.use((req, res, next)=>{

    res.header('Access-Control-Allow-Origin',  '*');
    res.header(
         'Access-Control-Allow-Headers', 
         'Origin, X-Requested-With, Content-Type, Accept, Authorization'
    );

    if(req.methods === 'OPTIONS') {
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE ');
    return res.status(200).json({}) // empty json object
    }
    next();
});


//Routes

// Root route
app.get('/', (req, res) => {
    res.status(200).send('Welcome to MLAB SERVICES');
});

const userRoutes = require('./routes/users');
app.use('/user', userRoutes);

const adminRoutes = require('./routes/admin');
app.use('/admin', adminRoutes);


const productRoutes = require('./routes/products');
app.use('/products', productRoutes);


// error handling
app.use((req, res, next) =>{
    const error = new Error('Not Found');
    error.status = 404;
    next(error);
});

app.use((error, req, res, next) =>{
    res.status(error.status || 500);
    res.json({
        error: {
            message: error.message
        }
    });

});

module.exports = app;