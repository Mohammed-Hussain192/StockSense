const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    secure:true,
    host: "smtp.gmail.com",
    port: 465,
    auth: {
      user:"thestocksenseofficial@gmail.com",
      pass:"dharvfvkxyhmxtij",
    }
  
  })
  
module.exports = transporter;