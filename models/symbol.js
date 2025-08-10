const mongoose = require('mongoose')


const symbolSchema =mongoose.Schema( {
  
    email:{
        type:String,
        
    },
    symbol:{
        type:String,
    }
    

   

});

module.exports=mongoose.model("symbolsdb",symbolSchema)