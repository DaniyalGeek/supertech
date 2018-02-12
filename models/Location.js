var mongoose=require('mongoose');
var Schema=mongoose.Schema;
var User=require('./User');
var LocationSchema=new Schema({
    user_id:{
        type:Schema.Types.ObjectId,
        ref:'user'
    },
    home_location:{
        home_lat:{
            type:Number,
            default:0
        },
        home_lng:{
            type:Number,
            default:0
        }
    },
    office_location:{
        office_lat:{
            type:Number,
            default:0
        },
        office_lng:{
            type:Number,
            default:0
        }
    }
    ,current_location:{
        current_lat:{
            type:Number,
            default:0
        },
        current_lng:{
            type:Number,
            default:0
        }
    }
});
var Location=mongoose.model('location',LocationSchema);
module.exports=Location;