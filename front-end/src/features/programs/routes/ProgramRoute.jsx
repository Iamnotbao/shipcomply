
import Program from "../../../Dashboard/programs/Programs";
import AddProgramPage from "../page/AddProgramPage";
import EditProgramPage from "../page/EditProgramPage";

const ProgramRoute =
[
    {index:true, element:<Program/>},
    {path:"add/", element:<AddProgramPage/>},
    {path:"edit/:program_code", element:<EditProgramPage/>}
]
export default ProgramRoute;