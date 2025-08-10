const mongoose = require('mongoose')
const usermodel = require('../models/usermodel')
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt')

async function login ( email , password , req, res ){
    let user = await usermodel.findOne({email:email})
    if(!user){
      req.flash("error", "No account found. Please create an account.");
      return res.redirect("/register/user/login/user#");
     
    }
    else{
          const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
             req.flash("error", "Invaid Credentials");
            return res.redirect("/register/user/login/user");
        }

    res.cookie('email', user.email, {
      maxAge: 1000 * 60 * 60 * 24, // 24 hours validity
     
    });
    res.redirect("/home")
    }
    
}

module.exports=login;