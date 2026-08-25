import Permission from "../../../Dashboard/users_permission/Permisison";
import AddUserPermission from "../page/AddUserPermission";

const UserPermissionRoute =
[
    {index:true, element:<Permission/>},
    {path:"add/",element:<AddUserPermission/>}
]
export default UserPermissionRoute;