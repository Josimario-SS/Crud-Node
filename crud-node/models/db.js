const Sequelize = require('sequelize');
const sequelize = new Sequelize('node_exemplo', 'root', '', {
    host: '127.0.0.1',
    dialect: 'mysql',
    define: {
        charset: 'utf8',
        collate: 'utf8_general_ci',
        timestamps: true
    },
    logging: false
});


//TESTANDO A CONEXÃO COM O BANCO
//  sequelize.authenticate().then(function() {
//      console.log('Conectado com o banco com sucesso!');
//  }).catch(function(err) {
//      console.log('Falha na conexção' + err);
//  });


module.exports = {Sequelize, sequelize}