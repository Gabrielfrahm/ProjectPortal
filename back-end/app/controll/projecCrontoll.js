const express = require("express"); //importando o express  
const router = express.Router(); // usando o  router 
const authMiddleware = require("../middleware/auth");// importa o middleware 

router.use(authMiddleware);//essa rota precisa da autenticação do middleware


router.get("/project",(req,res)=>{
    res.send({ok: true , user: req.userId});
});

module.exports = router;