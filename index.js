var express=require('express');
var app=new express();
var path   =require('path');
var BodyParser=require('body-parser');
var mongoose=require('mongoose');
var jsonwebtoken = require("jsonwebtoken");
var  fileUpload = require('express-fileupload');
var server = require('http').createServer(app);
var io = require('./controllers/SocketController').initialize(server);

mongoose.connect('mongodb://localhost/SuperTechOfficeApp');
mongoose.Promise=global.Promise;
app.use(fileUpload({ safeFileNames: true, preserveExtension: true }));
app.use(express.static(__dirname + '/public/uploads/images'));;
app.use(BodyParser.json());
app.use(BodyParser.urlencoded({ extended: true }));
var routes=require('./routes/routes');
app.use(function(req, res, next) {

    if (req.headers && req.headers.authorization && req.headers.authorization.split(' ')[0] === 'JWT') {
        jsonwebtoken.verify(req.headers.authorization.split(' ')[1], 'super', function(err, decode) {
            if (err) req.user = undefined;
            req.user = decode;
            next();
        });
    } else {
        req.user = undefined;
        next();
    }
});
app.use('',routes);
// app.use(function (error,request,response,next) {
//     response.status(422).send({error:error.message+'jhjhj'});
//     //console.log(error);
// });
app.use(function(req, res) {
    res.status(404).send({ url: req.originalUrl + ' not found' })
});
process.on('uncaughtException',(err)=>{
    console.log("i am error"+err.message)

})
process.stdin.resume();
server.listen(4000,function () {
    console.log('i am here');
});

