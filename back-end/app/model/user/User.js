const Sequelie = require("sequelize");
const bcrypt = require("bcryptjs");

const connection = require("../../../config/db");

const User = connection.define("users",{
    name : {
        type : Sequelie.STRING,
        allowNull : false
    },
    email :{
        type : Sequelie.STRING,
        allowNull : false
    },
    password : {
        type : Sequelie.STRING,
        allowNull : false
    },
    passwordResetToken: {
        type: Sequelie.STRING,
    },
    passwordResetExpires: {
        type : Sequelie.DATE
    }
});



// User.return("save", async function (next){
//     const hash = await bcrypt.hash(this.password,10);
//     this.password = hash;
//     next();
// });

// User.sync({force:true});

module.exports = User;