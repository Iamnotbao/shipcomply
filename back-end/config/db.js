const {Sequelize} = require('sequelize');
const sequelize = new Sequelize(process.env.DB_NAME,process.env.DB_USER,process.env.DB_PASSWORD,{
    host: process.env.DB_HOST,
    dialect:'postgres',
     dialectOptions: {
    options: '-c search_path=Customs,public'
  },
  pool: {
    max: 100,        
    min: 10,         
    acquire: 60000,  
    idle: 10000,
    evict: 10000,
  },
    port:process.env.DB_PORT,
});
module.exports=sequelize;