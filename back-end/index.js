const express = require("express");
const app= express();
const connection = require("./config/db");
const bodyParser = require("body-parser");
const cors = require("cors");



//modal
const User = require("./app/model/user/User");

//controllers
const userControll = require("./app/controll/userControll");
const porjecControll = require("./app/controll/projecCrontoll");

//conexao com o banco
connection.authenticate()
.then(()=>{
    console.log("conectado");
}).catch((erro)=>{
    console.log(erro);
});

app.use("/",userControll);
app.use("/",porjecControll);


app.use((req, res, next) => {
	//Qual site tem permissão de realizar a conexão, no exemplo abaixo está o "*" indicando que qualquer site pode fazer a conexão
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader("Access-Control-Allow-Origin", "*");
	//Quais são os métodos que a conexão pode realizar na API
    res.setHeader("Access-Control-Allow-Methods", 'GET,PUT,POST,DELETE');
    app.use(cors());
    next(); 
});


//bodyParser
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());



app.listen(8080, ()=>{
    console.log("server on");
})