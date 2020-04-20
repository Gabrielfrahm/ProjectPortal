const jwt = require("jsonwebtoken");// token 
const authConf = require("../../config/auth.json"); // conf do token 


module.exports = (req,res,next) =>{ // precisar ter um next 
    const authHeader = req.headers.authorization; // para pegar do header da requisição 

    if(!authHeader)// se ele não  achar o header 
        return res.status(401).send({Error : "nenhum token encontrado"});// mensagem de erro 

    const parts = authHeader.split(" ");// dividir o token em duas partes para achar o bearer 

    if(!parts.length === 2)// verifica se realmente tem duas partes 
        return res.status(401).send({ error : "token errado"});// se nao tiver cai nesse erro

    const [scheme , token] = parts;// atribui as duas partes em scheme e token 

    if(!/^Bearer$/i.test(scheme))//faz um teste com o token 
        return res.status(401).send({ error : "token mal formado"});// erro de formatação do token 
// final mente verifica se o token e igual ao token do ususario 
    jwt.verify( token , authConf.secret, (error, decoded )=>{//decoded
        if(error) return res.status(401).send({ error : "token invalido"});// se noa for igual cai aqui 
        // se for igual ele retorna
        req.userId = decoded.id;
        return next();//e da um next
    });
}   