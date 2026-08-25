const  FACTORY  = require("../enums/factory.enum");
const  ROLES  = require("../enums/role.enum");
function getRole(userId) {
    return FACTORY.includes(userId) ? ROLES.FACTORY : ROLES.USER;
}
module.exports = { getRole }