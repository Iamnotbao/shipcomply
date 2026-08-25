const bcrypt  = require("bcrypt");

// node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

const hashPassword = async(password)=>{
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password,salt);
}
const comparePassword = async(password,hashed)=>{
    return await bcrypt.compare(password,hashed);
}
module.exports={hashPassword,comparePassword}
;