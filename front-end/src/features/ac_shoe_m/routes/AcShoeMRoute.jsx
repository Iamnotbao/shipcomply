import AcShoeM from "../../../Dashboard/ac_shoe_m/AcShoeM";
import AcShoeMAddPage from "../page/AcShoeMAddPage";
import AcShoeMDeletePage from "../page/AcShoeMDeletePage";
import AcShoeMEditPage from "../page/AcShoeMEditPage";


const AcShoeMRoute =[
    {index: true, element:<AcShoeM/>},
    {path:"add/", element:<AcShoeMAddPage/>},
    {path:"edit/:factory_code/:customs_shoe_id", element:<AcShoeMEditPage/>},
    {path:"delete/:factory_code/:customs_shoe_id", element:<AcShoeMDeletePage/>},

]
export default AcShoeMRoute;