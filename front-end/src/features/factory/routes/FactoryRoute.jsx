import Factory from "../../../Dashboard/factory/Factory";
import AddFactoryPage from "../page/AddFactoryPage";
import EditFactoryPage from "../page/EditFactoryPage";

const FactoryRoute =
[
    {index:true, element:<Factory/>},
    {path:"add/", element:<AddFactoryPage/>},
    {path:"edit/:factory_code", element:<EditFactoryPage/>}
]
export default FactoryRoute;