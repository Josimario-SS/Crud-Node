const express = require('express');
const app = express();
const hbs = require('express-handlebars');
const bodyParser = require('body-parser');
const session = require('express-session');
const PORT = process.env.PORT || 3000;




//CONFIGURAÇÃO DO HANDLEBARS
app.engine('hbs', hbs.engine({
    extname: 'hbs',
    defaultLayout: 'main'
}));
app.set('view engine', 'hbs');

//INDICA CAMINHO ESTÁTICO
app.use(express.static('public'));
app.use(express.static('css'));

//CONFIG PARA FUNCIONAR O 'BODY-PARSER'.
app.use(bodyParser.urlencoded({extended:false})); 


//IMPORTAR MODEL USUÁRIOS
const Usuario = require('./models/Usuario');
const { where } = require('sequelize');


//CONFIGURAÇÃO DAS SESSIONS
app.use(session({
    secret: 'CriarUmaChaveQualquer',
    resave: false,
    saveUninitialized: true
}));



//ROTAS DA PÁGINA
app.get('/', (req, res) => {
    if (req.session.errors) {
        let arrayErros = req.session.errors;
        req.session.errors = "";
        return res.render('index', {NavActiveCad:true, error: arrayErros});
    }
    if (req.session.success) {
        req.session.success = false;
        return res.render('index', {NavActiveCad:true, MsgSuccess: true});
    }

    res.render('index', {NavActiveCad:true});
    
});
app.get('/users', (req, res) =>  {
    Usuario.findAll().then((valores) => {
        //console.log(valores.map(valores => valores.toJSON()));

        if(valores.length > 0) {
            return  res.render('users', {
                NavActiveUsers: true, 
                table: true, 
                usuarios: valores.map(valores => valores.toJSON())
            });
        }
        else {
            res.render('users', {
                NavActiveUsers: true, 
                table: false
            });
        }
    }).catch((err) => {
        console.log(`Houve um erro: ${err}`);
    })  //PROCURA TODOS OS DADOS DA TABELA DO BANCO DE DADOS
    //res.render('users', {NavActiveUsers:true});
});

app.post('/editar', (req, res) => {
    let id = req.body.id;
    Usuario.findByPk(id).then((dados) => {
        return res.render('editar', {
            error: false,
            id: dados.id,
            nome: dados.nome,
            email: dados.email
        });
    }).catch((err) => {
        console.log(err);
        return res.render('editar', {
            error: true,
            problema: 'Não é possivel editar este registro'
        });
    })
    //res.render('editar');
});

//REQUISIÇÕES

app.post('/cad', (req, res) => {
    //VALORES VINDOS DO FORMULARIO
    let nome = req.body.nome;
    let email =  req.body.email;

    //ARRAY QUE VAI CONTER OS ERROS
    const erros = [];

    //METÓDO PARA REMOVER OS ESPAÇOS EM BRANCO
    nome = nome.trim();
    email = email.trim();

    //LIMPAR O NOME DE CARACTERES ESPECIAIS (SOMENTE LETRAS)
    nome = nome.replace(/[^A-zÀ-ú\s]/gi,'');
    nome = nome.trim();
    // console.log(nome);
    

    //VERIFICAR SE O CAMPO ESTÁ VAZIO OU NÃO
    if (nome == '' || typeof nome == undefined || nome == null) {
        erros.push({mensagem: "O campo nome não pode ser vazio!"});
    }

    //VERIFICAR SE O CAMPO NOME É VÁLIDO (APENAS LETRAS)
    if (!/^[A-Za-záàâãéèêíïóòôõöúçñÁÀÂÃÉÈÊÍÏÓÔÕÖÚÇÑ\s]+$/.test(nome)) {
        erros.push({mensagem: "Nome inválido!"});
    }


    //VERIFICAR SE O CAMPO ESTÁ VAZIO OU NÃO
    if (email == '' || typeof email == undefined || email == null) {
        erros.push({mensagem: "O campo email não pode ser vazio!"});
    }

    //VERIFICAR SE O EMAIL É VÁLIDO
    if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
        erros.push({mensagem: "Campo email inválido!"});
    }

    if (erros.length > 0) {
        console.log(erros);
        req.session.errors = erros;
        req.session.success = false;
        return res.redirect('/');
    }

    //SUCESSO NENHUM ERRO
    //SALVAR NO BANCO DE DADOS
    Usuario.create({
        nome: nome,
        email: email.toLowerCase()
    }).then(function(){ //SE O CADASTRO DER CERTO
        console.log('Cadastrado com sucesso!');
        req.session.success = true;
        return res.redirect('/');
    }).catch(function(erro) { //SE O CADASTRO DER ERRADO 
        console.log(`Ops, houve um erro: ${erro}`);
    })


});



app.post('/update', (req, res) => {

    //VALORES VINDOS DO FORMULARIO
    let nome = req.body.nome;
    let email =  req.body.email;

    //ARRAY QUE VAI CONTER OS ERROS
    const erros = [];

    //METÓDO PARA REMOVER OS ESPAÇOS EM BRANCO
    nome = nome.trim();
    email = email.trim();

    //LIMPAR O NOME DE CARACTERES ESPECIAIS (SOMENTE LETRAS)
    nome = nome.replace(/[^A-zÀ-ú\s]/gi,'');
    nome = nome.trim();
    // console.log(nome);
    

    //VERIFICAR SE O CAMPO ESTÁ VAZIO OU NÃO
    if (nome == '' || typeof nome == undefined || nome == null) {
        erros.push({mensagem: "O campo nome não pode ser vazio!"});
    }

    //VERIFICAR SE O CAMPO NOME É VÁLIDO (APENAS LETRAS)
    if (!/^[A-Za-záàâãéèêíïóòôõöúçñÁÀÂÃÉÈÊÍÏÓÔÕÖÚÇÑ\s]+$/.test(nome)) {
        erros.push({mensagem: "Nome inválido!"});
    }


    //VERIFICAR SE O CAMPO ESTÁ VAZIO OU NÃO
    if (email == '' || typeof email == undefined || email == null) {
        erros.push({mensagem: "O campo email não pode ser vazio!"});
    }

    //VERIFICAR SE O EMAIL É VÁLIDO
    if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
        erros.push({mensagem: "Campo email inválido!"});
    }

    if (erros.length > 0) {
        console.log(erros);
        return res.status(400).send({status: 400, erro: erros})
    }

    //SUCESSO NENHUM ERRO
    //ATUALIZAR O REGISTRO NO BANCO DE DADOS
    Usuario.update(
        {
            nome: nome,
            email: email.toLowerCase()
        },
        {
            where: {
                id: req.body.id
            }
        }).then((resultado) => {
            console.log(resultado);
            return res.redirect('/users');
        }).catch((err) => {
            console.log(err);
        })
});




app.post('/del', (req, res) => {
    Usuario.destroy({ //VAI EXCLUIR UM REGISTRO DO BANCO DE DADOS
        where : {
            id: req.body.id
        }
    }).then((retorno) => { //O QUE ACONTECE SE DER CERTO
        return res.redirect('/users');
    }).catch((err) => {  //O QUE ACONTECE SE DER ERRADO
        console.log(err);
    })

})



app.listen(PORT , () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`)
});
