import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Typography,
} from "@mui/material";

const UserList = ({ data = [], selectRow, onSelectRow,getControlLabel,name }) => {
  return (
    <Box>
      <Typography variant="h6" fontWeight={"bold"} ml={1}>
        *{getControlLabel("mtxt_user","User")}
      </Typography>
      <List sx={{ padding: 0}}>
        {data[0]?.data.map((user) => (
          <ListItem key={`${user.user_code}-${user.department_code}-${user.factory_code}`} disablePadding>
            <ListItemButton
              selected={`${selectRow.user_code}-${selectRow.department_code}-${selectRow.factory_code}` === `${user.user_code}-${user.department_code}-${user.factory_code}`}
              onClick={() => onSelectRow(user)}
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
                primary={user.user_code}
                secondary={user[name]}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );
};
export default UserList;
