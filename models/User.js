var mongoose=require('mongoose');
var Schema=mongoose.Schema;
var bcrypt=require('bcrypt');
var UserSchema=new Schema({
    name:{
        type:String,
        required:(true,'Name is Must')
    },
    email:{
        type:String,
        required:(true,'Email is Must'),
        unique:true
    },
    password:{
        type:String,
        required:(true,'Password is must')
    },
    user_type:{
        type:String,
        default:'employee'
    },
    image_url:{
        type:String,
        default:'book6.jpg'
    }
    ,tasks:[{type:Schema.Types.ObjectId,ref:'task'}],
    locations:{
        type:Schema.Types.ObjectId,ref:'location'
    },
    current_status:{
        type:String,
        default:'outside'
    },
    qb_id:{
        type:String,
    }
});
UserSchema.methods.comparePassword=function (password) {
    return bcrypt.compareSync(password, this.password);
};
var User=mongoose.model('user',UserSchema);
module.exports=User;