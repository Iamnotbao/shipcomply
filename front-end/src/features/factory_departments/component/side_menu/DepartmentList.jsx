import { List, ListItem, ListItemButton, ListItemText, Typography } from "@mui/material";

const DepartmentList = ({ data = [], selectRow, onSelectRow,getControlLabel,name }) => {
  return (
    <>
      <Typography variant="h6" fontWeight={"bold"} ml={1}>
        *{getControlLabel("mtxt_department","Department")}
      </Typography>
      <List sx={{ padding: 0 }}>
        {data[0] &&
          data[0]?.data.length > 0 &&
          data[0]?.data.map((item, index) => (
            <ListItem key={`${item?.factory_code}-${item.department_code}`}>
              <ListItemButton
                selected={`${selectRow?.factory_code}-${selectRow?.department_code}` === `${item?.factory_code}-${item?.department_code}` }
                onClick={() => onSelectRow(item)}
                sx={{
                  "&.Mui-selected": {
                    backgroundColor: "yellow",
                    color: "black",
                  },
                  "&.Mui-selected:hover": {
                    backgroundColor: "#686868",
                  },
                }}
              >
                <ListItemText
                  primary={item.department_code}
                  secondary={item[name]}
                />
              </ListItemButton>
            </ListItem>
          ))}
      </List>
    </>
  );
};
export default DepartmentList;
