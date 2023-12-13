const express = require('express');
const app = express();
require('dotenv').config();
const dbConnect = require('./config/dbConnect');

// Request Logging
const morgan = require('morgan');
app.use(morgan('dev'));


// enable body parsing
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

//connect to database
dbConnect(); 

//CORS Error Handling 
const corsHandler = require('./middleware/cors-handler');
app.use(corsHandler);

//Routes
app.get('/', (req, res) => {
    res.status(200).send('Welcome to MLAB SERVICES API'); // Root route
});

const userRoutes = require('./routes/users');
app.use('/user', userRoutes);

const adminRoutes = require('./routes/admin');
app.use('/admin', adminRoutes);


const productRoutes = require('./routes/products');

app.use('/products', productRoutes);

// error handling
const { notFound, errorHandler } = require('./middleware/error-handler');
app.use(notFound);
app.use(errorHandler); 

module.exports = app;