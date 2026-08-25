const { DataTypes } = require("sequelize")
const sequelize = require("../../config/db")
const AC_PROD_REF = sequelize.define("AC_PROD_REF",{
factory_code :{
    type:DataTypes.STRING,
    primaryKey:true
},
customs_shoe_id :{
    type:DataTypes.STRING,
     primaryKey:true
},
prod_no :{
    type:DataTypes.STRING,
    primaryKey:true
},
prod_unit :{
    type:DataTypes.STRING,
 
},
formula :{
    type:DataTypes.INTEGER,
    
},
is_valid :{
    type:DataTypes.STRING,
    
},
valid_date :{
    type:DataTypes.DATE,
    
},
unval_date :{
    type:DataTypes.DATE,
    
},
},{
tableName:"ac_prod_ref",
schema:"Customs",
timestamps:false
})
module.exports=AC_PROD_REF;