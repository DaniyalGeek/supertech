var Task=require('../models/Task');
var User=require('../models/User');
exports.addnewtask=function (req,res) {
    if(req.user&&req.user.user_type==='rehan') {

        if(!req.body.user){
            return res.send({response:{status:400,message:'user id is required'}});
        }
        User.findOne({_id: req.body.user}, function (err, user) {
            if (err) {
                return res.send({response:{status:404,message:err.message}});
            }
            else {
                var task = new Task(req.body);
                req.userObj = user;
                task.user = req.userObj;
                task.save(function (err, task) {
                    if (err) {
                        return res.send({response:{status:501,message:err.message}});
                    }
                    else {


                        req.userObj.update({"$push": {"tasks": task}}, function (err, user) {
                            if (err) {
                                return res.send({response:{status:501,message:err.message}});
                            }
                            else {
                                return res.send({response:{status:200,message:'Operation completed successfully'}});
                            }
                        });
                    }
                });
            }

        })

    }
    else{
        return res.send({response:{status:401,message:'you are not authorized to perform this task'}});
    }

}
exports.getalltasks=function (req,res) {
    if(req.user) {
    if(!req.body.user_id){
        return res.send({response:{status:400,message:'user id is required'}});
    }
        var usersProjection = {
            __v: false,
            password: false,
            name: false,
            email: false,
        };
        User.findOne({},usersProjection, function (err, user) {
            if (err) {
                return res.send({response:{status:501,message:err.message}});
            }
            else {
                if(user!=null) {
                    res.send({response:{status:200,message:'sucess'},result:user});
                }
                else{
                    return res.send({response:{status:501,message:'could not find user with this id'}});
                }

            }
        }).populate('tasks').where('_id').equals(req.body.user_id);
    }
    else{
        return res.send({response:{status:401,message:'you are not authorized to perform this task'}});
    }

}
exports.addupdates=function (req,res) {
    if(req.user&&req.user.user_type==='employee') {
        if(!req.body.task_id){
            return res.send({response:{status:400,message:'task id is required'}});
        }
        Task.findOne({_id: req.body.task_id}, function (err, task) {
            if (err) {
                return res.send({response:{status:501,message:err.message+'haghd'}});
            }
            else {
                if(task.user==req.user._id) {
                    task.update({'$push': {'updates': {update_description: req.body.update_description}}}, function (err, task) {
                        if (err) {
                            return res.send({response:{status:501,message:err.message}});
                        }
                        else {
                            return res.send({response:{status:200,message:'Update Successfulyl addedd'}});
                        }
                    });
                }
                else{
                    return res.send({response:{status:401,message:'This task' +
                    ' does not belong to you so you are not authorized to perform this task'+task.user}});
                }
            }
        });
    }
    else{
        return res.send({response:{status:401,message:'you are not authorized to perform this task'}});
    }
}
exports.gettaskupdates=function (req,res) {
    if(req.user){
        if(!req.body.task_id){
            return res.send({response:{status:400,message:'task id is required'}});
        }
        var taskProjection = {
            __v: false,
            task_name: false,
            task_date: false,
            task_description: false,
            _id: false,
            user:false
        };
        Task.findOne({_id:req.body.task_id},taskProjection,function (err,task) {
            if (err) {
                return res.send({response:{status:501,message:err.message}});
            }
            if(task!=null){
                res.send({response:{status:200,message:'sucess'},result:task});
            }
            else{
                return res.send({response:{status:501,message:'could not find task with this id'}});
            }
        });

    }
    else{
        return res.send({response:{status:401,message:'you are not authorized to perform this task'}});
    }
}
exports.updatetaskstatus=function (req,res) {
    if(req.user&&req.user.user_type=='employee'){
        if(!req.body.task_id){
            return res.send({response:{status:400,message:'task id is required'}});
        }
        Task.update({_id:req.body.task_id},{task_status:'completed'},function (err,affected) {
            if (err) {
                return res.send({response:{status:501,message:err.message}});
            }
            return res.send({response:{status:200,message:'Success'}});
        })
    }
    else{
        return res.send({response:{status:401,message:'you are not authorized to perform this task'}});
    }
}