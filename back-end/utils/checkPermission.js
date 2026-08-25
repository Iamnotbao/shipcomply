function CheckPermission(action) {
  return (req, res, next) => {
    const {permission} = req.body.user;
    const userPermission = permission;
    console.log("check permission", action);
    
    if (!userPermission) {
        return res.status(403).json({
            message:"No permission data"
        })
    }
    const permissionMap = {
        query:"allow_query",
        add:"allow_add",
        modify:"allow_modify",
        delete:"allow_delete",
        cancel:"allow_cancel",
        confirm:"allow_confirm",
        close:"allow_close"
    }
    console.log("check action", permissionMap[action]);
    
    const field = permissionMap[action]
    if(!field){
        return res.status(400).json({
            message:"Invalid action"
        })
    }
    const allowed = userPermission[field] === "Y"
    console.log("allow: ",allowed);
    
    if(!allowed){
        return res.status(400).json({
            message:"You are not allowed to perform this action"
        })
    }
    next();
  };
}
module.exports={CheckPermission}
