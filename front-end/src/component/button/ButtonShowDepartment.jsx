import { Button } from "@mui/material";

const ButtonShowDepartments = ({row,onDepartmentDetail}) => {
  return (
    <>
      <Button variant="contained" color="purple" onClick={()=>onDepartmentDetail(row)}>
        Show Departments
      </Button>
    </>
  );
};
export default ButtonShowDepartments;
