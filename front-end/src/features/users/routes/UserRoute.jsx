import FactoryUsers from "../../../Dashboard/factory_user/FactoryUser";
import User from "../../../Dashboard/factory_user/User";
import AddUserPage from "../page/AddUserPage";
import EditUserPage from "../page/EditUserPage";

const UserRoute =
[
    {index:true, element:<User/>},
    {path:"add/", element:<AddUserPage/>},
    {path:"edit/:factory_code/:department_code/:user_code", element:<EditUserPage/>}
]
export default UserRoute;