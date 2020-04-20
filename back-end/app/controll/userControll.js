const express = require("express"); //importando o express  
const router = express.Router(); // usando o  router 
const User = require("../model/user/User"); // trazendo o modal do user
const bcrypt = require("bcryptjs"); // cryptografia usada para cria hash da senha 
const { check, validationResult } = require('express-validator');// um validador para os campos (email etc)
const jwt = require("jsonwebtoken");
const authConf = require("../../config/auth.json");
const crypto = require("crypto");
const mailer = require("../modules/mailer");
const cors = require("cors");

router.use(express.json());// para o router receber dados em json

function geraToken(params = {}){//função para gerar o token 
    return jwt.sign(params ,authConf.secret, {expiresIn: 86400,} );// parametros , a conf do token, e a validade de 1 dia 
}


//cors da aplicação....
router.use((req, res, next) => {
	//Qual site tem permissão de realizar a conexão, no exemplo abaixo está o "*" indicando que qualquer site pode fazer a conexão
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader("Access-Control-Allow-Origin", "*");
	//Quais são os métodos que a conexão pode realizar na API
    res.setHeader("Access-Control-Allow-Methods", 'GET,PUT,POST,DELETE');
    router.use(cors());
    next(); 
});

//rota listagem
router.get("/users",(req,res)=>{
    User.findAll({}).then(users => res.json({// ele lista os usuarios de der certo  
        error: false,// erro negado
        data : users // usuarios
    })).catch( error => res.json({ // caso de erro retorna aqui 
        error : true, // mensagem de erro
        data :[],//dados errados 
        error : error // mensagem de error
    }));
})

//rota cria usuario 
router.post("/user/create", async (req,res)=>{
    const {name ,email , password} = req.body;//pega todos os campos necessario
     var salt =  bcrypt.genSaltSync(10);// cria um salt
     var hash =   bcrypt.hashSync(password,salt);// e cria um hash da senha 
    try{//tenta
        if(await User.findOne({where : { email :email}})){//verifica se o email infromado ja existe no banco
            return res.status(400).send({Error: "user ja existe"});// se existe retorna mensagem 
        }
            
        const user = await User.create({name:name, email: email , password : hash});// recebe os campos e cria todos no banco de dados com a senha cryptografada pelo hash 

        user.password = undefined;// esconde a senha no retorno
        return res.send({ user, token:geraToken({id:user.id})  });//e retorna  o usuario com o token  e os parametros

    }catch(erro){//deu erro 
        return res.status(400).send({error: "registro falou"});//exibe mensagem 
    }
})

//rota de autenticação 
router.post("/user/authenticate",async (req, res)=>{
    const {email, password} = req.body;//recebe os campos
    
    const user = await User.findOne({where:{email:email}});//verifica se o email informado esta cadastrado no banco

    if(!user)//se nao tiver 
    return res.status(400).send({error : "user  not found"});//cai na mensagem 

    if(!await bcrypt.compare(password,user.password))//compara as senhas para ver se são iguais 
    return res.status(400).send({error : "user  not found password"});//se nao for cai no erro

    res.send({user, token: geraToken({id: user.id})});// se for retorna o usuario

});

//rota de esqueceu a senha 
router.post("/user/forgotPassword", async (req,res)=>{// criaçã oda rota 
    const {email} = req.body;// recebendo o emial  no corpo da requisição 
    try{//tenta
        const user = await User.findOne({where:{email:email}});// procura no banco o usuario pelo emial informado
         
        
        
        if(!user)//caso não retorne  usuario 
            return res.status(400).send({error : "user  not found"});//cai na mensagem 
        
        const token =  crypto.randomBytes(20).toString('hex');//criando um token aleatorio para ser atribuido ao usuario que solicitou a troca de senha 
        
        const nome = user.name;

        const now = new Date();//pega a data atual 
        now.setHours(now.getHours()+1);//adiciona +1 hora  para essa data ex  se agora é 11h o token recebe 12h

        await User.update({email:email,passwordResetToken:token,passwordResetExpires:now},{//update nos campos do banco, adicionando os valores de token e seu tempo de vida 
            where: {
                id:user.id//no use id 
            }
            })

        mailer.sendMail({//nodemailer enviando  um email 
            to : email ,// para quem no caso o email da requisição 
            from : "",//conta configurada no email 
            subject: "Solicitação de recuperação de senha do Projeto Portal",
            template: "/forgot",//o template que deve ser usado 
            context : {token,nome},// e o token de acesso/ poderia se um link tbm 
        },(error)=>{//caso de erro 
            if(error){
                console.log(error);//printa o erro na tela do servidor 
                return res.status(400).send({Error : "Erro ao enviar email, tente novamente "});// menssage de erro para o usuario 
            }
            return res.status(200).send("Email enviado com sucesso");// caso de sucesso
        })

    }catch(erro){// caso de erro no try
        console.log(erro);//printa o erro 
        return res.status(400).send({//mensagem para o usuario 
            error : "Erro ao tenta recuperar a senha"
        });
    }
});

//rota para reseta o password
router.post("/user/resetPassword",async (req,res)=>{//criação da rota 
    const {email, token , password}= req.body;// recebendo parametros pelo corpo da requisição 
    var salt =  bcrypt.genSaltSync(10);// cria um salt para a senha 
    var hash =   bcrypt.hashSync(password,salt);// e cria um hash da senha 
    
    try{//tenta
        const user = await User.findOne({where:{email:email}});// acha o usuario que pediu para resetar a senha 

        if(!user)//caso nao encontre 
        return res.status(400).send({error : "user  not found"});//cai na mensagem 


        if(token !== user.passwordResetToken)//verifica se o token recebido e diferente do que esta no banco 
        return res.status(400).send({error : "token invalido"});// caso senha cai nessa mensgem 

        const now  = new Date();// pega a data atual 

        if(now > user.passwordResetExpires)//confere se a data atual e maior que o tempo de vida do token 
        return res.status(400).send({error: "token expirado"});//se for maior cai nessa mensagem 

        user.password = hash;//salva a senha com o hash

        await user.save();//salva a alteração no  banco
        res.send("Senha atualizada");//retorna mensagem
    }catch(error){//erro do try 
        res.status(400).send({ erro : "tente novamente"});//cai nessa mensgem
    }
});



module.exports = router;