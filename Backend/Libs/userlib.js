var model=require("../Models/usermodel");

module.exports={
    createUser: function(userObj){
        var user=new model(userObj);
        user.save();
    },
    getAllUsers: function(cb){
        model.find({},function(err,result){
            cb(err,result);
        })
    },
    getSingleItemByQuery: function(query, model, cb){
        //console.log('Getting Single item with Query '+JSON.stringify(query));
        model.findOne(query, function (err, singleItem) {
            if(err)
                console.log("ERROR: "+err);
            cb(err, singleItem);
        })
    }
}

// module.exports.getSingleItemByQuery = function(query, model, cb){
//     console.log('Getting Single item with Query '+JSON.stringify(query));
//     model.findOne(query, function (err, singleItem) {
//         if(err)
//             console.log("ERROR: "+err);
//         cb(err, singleItem);
//     });
// }