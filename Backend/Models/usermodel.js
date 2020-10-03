var mongoose=require('mongoose');

var registerUser=new mongoose.Schema({
        "email": {type:String,required:true},
        "password": {type:String,required:true},
    },{
        collection: 'MicroUsers'
    }
)
module.exports=mongoose.model("MicroUsers",registerUser);