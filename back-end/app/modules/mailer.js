const path = require("path");// importação do pacote de  pastas para usar os caminhos 
const nodemailer = require("nodemailer");// importar o nodemailer 
const hbs = require("nodemailer-express-handlebars");//e  hbs

const {host , port , user , pass } = require("../../config/mail.json");// importanto as configurações e segurança do mailer host .....

var transport = nodemailer.createTransport({// variavel de conexão com o servidor de smtp
    host,
    port ,
    auth: {
        user,
        pass
    }
});



transport.use("compile" , hbs({// falando oq o mailer tem que usar de pasta e extenção de arquivos 
    viewEngine : {
    layoutsDir: "./app/templateMail/", 
    partialsDir: "./app/templateMail/",
 },
    viewPath : path.resolve(__dirname,"../templateMail/"),
    extName : '.html',
}))

// const handlebarOptions = {
//     viewEngine: {
//       extName: '.hbs',
//       partialsDir: "./app/templateMail/",
//       layoutsDir: "./app/templateMail/"
//     },
//     viewPath : path.resolve(__dirname,"../templateMail/"),
//     extName: '.html',
//   };

// transport.use('compile', hbs(handlebarOptions));

module.exports = transport;