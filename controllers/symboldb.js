const mongoose = require('mongoose')
const symboldb = require('../models/symbol')
const cookieParser = require('cookie-parser');


async function symbolpush( email, symbol,  req, res) {
  console.log(email,symbol)
  const existing = await symboldb.findOne({email:email,symbol:symbol})
  if(existing){
    console.log("already exisited ")
     req.flash("error", "Already in Watch list");
           return res.redirect("/stock/"+symbol);
  }
  else{
    let symbols = await symboldb.create({
        email:email,
        symbol:symbol,
    })
    if(symbols){
      req.flash("error", "Successfully Added to Watchlist");
      return res.redirect("/stock/"+symbol);
    }
  }
  



}
module.exports = symbolpush;