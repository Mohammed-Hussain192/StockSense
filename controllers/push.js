const mongoose = require('mongoose')
const usermodel = require('../models/usermodel')
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt')
const transporter = require('../utils/transport')

async function push(name, email, password, phone, req, res) {
  console.log(name, email, password, phone)
  let existing = await usermodel.findOne({ email: email })
  if (existing) {
    req.flash("error", "Already Registered Please Login.");
    res.redirect("/register/user/login/user")
  }
  else {
    const hashedPassword = bcrypt.hashSync(password, 10);
    console.log(hashedPassword)
    res.cookie("email", email, { maxAge: 1000 * 60 * 60, })
    let user = await usermodel.create({
      name: name,
      email: email,
      password: hashedPassword,
      phone: phone
    })
    if (user) {

      async function main() {
        // send mail with defined transport object
        const info = await transporter.sendMail({
          from: '"StockSense Official" <thestocksenseofficial@gmail.com>', // sender address
          to: user.email, // list of receivers
          subject: "Welcome to StockSense", // Subject line
         html: `
<p>Dear ${user.name},</p>

<p>Welcome to <strong>StockSense</strong>!</p>

<p>We’re absolutely delighted to have you on board. By joining StockSense, you’re stepping into a vibrant community of investors, learners, and market enthusiasts just like you.</p>

<p>As part of our community, you’ll enjoy:</p>
<ul>
  <li>🔹 Real-time stock market updates</li>
  <li>🔹 Personalized insights and recommendations</li>
  <li>🔹 Powerful tools to make informed investment decisions</li>
</ul>

<p>At StockSense, we’re committed to helping you stay ahead, make smarter moves, and grow with confidence.</p>

<p>If you ever need help or have questions, our support team is always here for you.</p>

<p>Thank you once again for joining us. We’re excited to be part of your financial journey.</p>

<p>Warm regards,<br>
<strong>Team StockSense</strong></p>`
        });

        console.log("Message sent: %s", info.messageId);
        // Message sent: <d786aa62-4e0a-070a-47ed-0b0666549519@ethereal.email>
      }

      main().catch(console.error);


      res.redirect("/home")
    }
  }



}
module.exports = push;