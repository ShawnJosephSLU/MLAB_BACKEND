//Cors Error Handler
const corsHandler = (req, res, next)=>{

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
}

module.exports = corsHandler;