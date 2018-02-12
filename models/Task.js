var mongoose=require('mongoose');
var Schema=mongoose.Schema;
var User=require('./User');
var TaskSchema=new Schema({
    task_name:{
        type:String,
        required:(true,'Task Name is Must')
    },
    task_description:{
        type:String,
        required:(true,'Description is must')
    },
    task_date:{
        type:Date,
        default:new Date()
    },
    user:{
        type:Schema.Types.ObjectId,
        ref:'user'
    },
    task_status:{
        type:String,
        default:'in progress'
    },
    updates:[{
        update_date:{
            type:Date,
            default:new Date()
        },
        update_description:{
            type:String,
            required:(true,'Update Description is must')
        }
    }]

});
var Task=mongoose.model('task',TaskSchema);
module.exports=Task;