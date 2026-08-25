import {
  Box,
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Typography,
} from "@mui/material";

const FactoryList = ({ data = [], selectRow, onSelectRow,getControlLabel,name }) => {
  
  return (
    <Box>
      <Typography variant="h6" fontWeight={"bold"} ml={1}>
        *{getControlLabel("mtxt_factory","Factory")}
      </Typography>
      <List sx={{ padding: 0}}>
        {data[0]?.data.map((fac) => (
          <ListItem key={fac.factory_code} disablePadding>
            <ListItemButton
              selected={selectRow?.factory_code === fac.factory_code}
              onClick={() => onSelectRow(fac)}
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
                primary={fac.factory_code}
                secondary={fac[name]}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );
};
export default FactoryList;
