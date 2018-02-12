var User=require('../models/User');
var Location=require('../models/Location');
var jwt = require('jsonwebtoken');
var crypto = require('crypto');
var bcrypt=require('bcrypt');
var Socket = require('./SocketController').io();
var Client = require('node-rest-client').Client;
var client = new Client();
var requestify = require('requestify');
var headers= { 'QuickBlox-REST-API-Version': "0.1.1",
    'QB-Account-Key': "1AKQRu-EPTtPxzxxDrBo",
    'QB-Token': "e2c3a5020e40f3d595e15462e77becb7b5010664",
    'Content-Type':'application/json'
};

exports.addNewUser=function (req,res,next) {
    // var data='application_id=67172&auth_key=GjEmrff-2XJDFO2&nonce=1517820480 &timestamp=1517820480';
    // var sig=crypto.createHmac('sha1', 'q9kvsKOsUhtUq8j').update(data).digest('hex')
    // console.log(sig);
    if(req.body.email&&req.body.password){
        var user=new User(req.body);
        user.password = bcrypt.hashSync(req.body.password, 10);
        user.save(function (err,user) {
            if(err){
                return res.send({response:{status :400,message: err.errmsg}

                });
            }else{
                var location=new Location();
                location.user_id=user._id;
                location.save(function (err,location) {
                    if(err){
                        return res.send({response:{status :400,message: err.errmsg}});
                    }
                    var data = {"user":{"login":user.email
                        ,"password":req.body.password,"full_name":user.name}};
                    requestify.request('https://api.quickblox.com/users.json', {
                        method: 'POST',
                        body: data,
                        headers: headers,
                        dataType: 'json'
                    })
                        .then(function(resp) {
                            // get the response body
                            var qbUser=resp.getBody().user;
                            User.update({_id:user._id},{
                                locations:location._id,qb_id:qbUser.id
                            },function (err,affect) {
                                if(err){
                                    return res.send({response:{status :400,message: err.errmsg}});
                                }
                                // var data= { 'user[login]':user.email
                                //     ,'user[password]':req.body.password
                                //     ,'user[full_name]':user.name };

                                user.password = 'null';
                                return res.json({
                                    response:{status :200,message:
                                        "User inserted Succesfully"},result:{
                                    user_id:user._id,
                                    name:user.name,
                                    email:user.email,

                                }});
                            });
                        })
                        .fail(function(fail) {
                            console.log("fail",fail.getBody());// Some error code such as, for example, 404
                            res.send({response:{status:fail.getCode(),message:'qb error'}})
                        });



                });

            }

        })
    }
    else{
        return res.send({response:{status :400,message: "Data is not valid"}});
    }

  // User.create(user).then(function (user) {
  //     res.send(user);
  // }).catch(next)

};
exports.signin=function (req,res) {
    if(req.body.email&&req.body.password){
        User.findOne({email:req.body.email},function (err,user) {
            if (err){
                res.json({response:{status :301,message: err}});
            }
            if (!user || !user.comparePassword(req.body.password)) {
                return res.json({response:{ status :301 ,message: 'Authentication failed. Invalid user or password.'} });
            }
            Location.findOne({user_id:user._id},function (err,location) {
                if (err){
                    return res.json({response:{status :301,message: err}});
                }
                return res.json({response:{ status :200}
                ,result:{token: jwt.sign({ name:user.name,email: user.email, _id: user._id,user_type
                    :user.user_type,image_url:user.image_url}, 'super'),
                    location:{
                     home_location:location.home_location,office_location:location.office_location
                    },qb_id:user.qb_id}});
            })

        });
    }
    else{
        res.send({response:{status :301,message:"Email or password can not be null"}});
    }
}
exports.getallUsers=function (req,res) {
    //res.send(req.user);
    var usersProjection = {
        __v: false,
        password: false
    };
    if(req.user) {
        User.find({},usersProjection,function (err,user) {
            if(err){
                res.send({response: {status: 400, message: err}});
            }
            else{
                res.send({response: {status: 200, message: "Success"},result:{users:user}});
            }
        }).where('user_type').equals('employee').sort({name:'asc'});
    }
    else{
        res.send({response: {status:400,message: 'Please Login First'}});
    }
};
exports.uploadimage=function (req,res) {
    if(req.user) {
        var rcvd_c_Image = req.files.pic;
//var file_c_Name = Math.random().toString(36).slice(2);
        var filename = req.files.pic.name;

        //res.send({message:'123',user:req.user});
        var c_destPath = "uploads/images/" + filename;
        rcvd_c_Image.mv("public/" + c_destPath, function (err) {
            if (err) {
                res.send({response: {status: 400, message: err}});
            }
            else {

                User.update({_id: req.user._id}, {
                    image_url: filename
                }, function (err, affected) {
                    if (err) {
                        res.send({response: {status:400,message: err}});
                    }
                    else {
                        res.send({response: {status: 200, message: 'success'}});
                    }
                });
            }

        })
    }
    else{
        res.send({response: {status:400,message: 'Please Login First'}});
    }
};
exports.updatecurrentstatus=function (req,res) {
    if(req.user&&req.user.user_type==='employee') {
        if(req.body.status) {
            User.findOne({_id: req.user._id}, function (err, user) {
                if (err) {
                    return res.send({response: {status: 501, message: err.message + 'haghd'}});
                }
                else {

                    User.update({_id: req.user._id}, {
                        current_status: req.body.status
                    }, function (err, affected) {
                        if (err) {
                            res.send({response: {status: 400, message: err}});
                        }
                        else {
                            Socket.emit('updates',{user_id:req.user._id,status:req.body.status});
                            res.send({response: {status: 200, message: 'success'}});
                        }
                    });

                }
            });
        }
        else{
            return res.send({response:{status:501,message:'status is null'}});
        }
    }
    else{
        return res.send({response:{status:401,message:'you are not authorized to perform this task'}});
    }
}
exports.sample=function (req,res) {
    Socket.emit('updates',{message:req.user});
    res.send(req.user);
}
exports.updateofficelocation=function (req,res) {
    if(req.body.lat&&req.body.lng){
        Location.update({}, {
            office_location: {
                office_lat:req.body.lat,
                office_lng:req.body.lng
            }
        },{multi: true}, function (err, affected) {
            if (err) {
                res.send({response: {status:400,message: err}});
            }
            else {
                res.send({response: {status: 200, message: affected}});
            }
        });
    }
}
exports.updaterehanlocation=function (req,res) {
    if(req.user&&req.user.user_type==='rehan'){
        if(!req.body.lat||!req.body.lng){
            return res.send({response:{status:400,message:'Lat and lng required'}});
        }

        Location.update({user_id:req.user._id},{current_location:{
            current_lat:req.body.lat,
            current_lng:req.body.lng
        }},function (err,affect) {
            if (err) {
              return  res.send({response: {status:400,message: err}});
            }
            return  res.send({response: {status:200,message: 'Location Update Successfully'}});

        });
    }
    else{
        return res.send({response:{status:401,message:'you are not authorized to perform this task'}});
    }
}
exports.updateemployeehomelocation=function (req,res) {
    if(req.user&&req.user.user_type==='employee'){
        if(!req.body.lat||!req.body.lng){
            return res.send({response:{status:400,message:'Lat and lng required'}});
        }

        Location.update({user_id:req.user._id},{home_location:{
            home_lat:req.body.lat,
            home_lng:req.body.lng
        }},function (err,affect) {
            if (err) {
                return  res.send({response: {status:400,message: err}});
            }
            return  res.send({response: {status:200,message: 'Location Update Successfully'}});

        });
    }
    else{
        return res.send({response:{status:401,message:'you are not authorized to perform this task'}});
    }
}
exports.updatepassword=function (req,res) {
    if(!req.user){
        return res.send({response:{status:401,message:'you are not authorized to perform this task'}});
    }
    if(!req.body.old_password||!req.body.new_password){
        return res.send({response:{status:400,message:'old or new password is missing'}});
    }
    User.findOne({_id:req.user._id},function (err,user) {
        if (err) {
            return  res.send({response: {status:400,message: err}});
        }
        if (!user || !user.comparePassword(req.body.old_password)) {
            return res.json({response:{ status :301 ,message: 'Authentication failed. Invalid user or password.'}});
        }
        user.password = bcrypt.hashSync(req.body.new_password, 10);
        User.update({_id:req.user._id},{
            password:user.password
        },function (err,affect) {
            if(err){
                return  res.send({response: {status:400,message: err}});
            }
            return  res.send({response: {status:200,message: 'Password update Successfull'}});
        })

    });

}
exports.getrehanlocation=function (req,res) {
    var locationProjection = {
        __v: false,
        home_location: false,
        office_location: false,
        _id: false,
        user_id:false
    };
    if(!req.user||!req.user.user_type=='employee'){
        return res.send({response:{status:401,message:'you are not authorized to perform this task'}});
    }
    User.findOne({user_type:'rehan'},function (err,user) {
        if(err){
            return  res.send({response: {status:400,message: err}});
        }
        Location.findOne({user_id:user._id},locationProjection,function (err,location) {
            if(err){
                return  res.send({response: {status:400,message: err}});
            }

                return  res.send({response: {status:200,message: "Success"},result:{location:location,rehan_image
                :user.image_url}});

        });
    })
}
exports.getrehanDetails=function (req,res) {
    // if(!req.user||!req.user.user_type=='employee'){
    //     return res.send({response:{status:401,message:'you are not authorized to perform this task'}});
    // }
    var usersProjection = {
        __v: false,
        password: false,
        tasks:false,
        user_type:false
    };
    User.findOne({user_type:'rehan'},usersProjection,function (err,user) {
        if(err){
            return  res.send({response: {status:400,message: err}});
        }
        return  res.send({response: {status:200,message: "Success"},result:user});
    })
}


