
import Departments from "../../../Dashboard/factory_departments/Departments";
import AddDepartmentPage from "../page/AddDepartmentPage";
import EditDepartmentPage from "../page/EditDepartmentPage";


const FactoryDepartmentRoute =
[
    {index:true, element:<Departments/>},
    {path:"add/", element:<AddDepartmentPage/>},
    {path:"edit/:factory_code/:department_code", element:<EditDepartmentPage/>}
]
export default FactoryDepartmentRoute;