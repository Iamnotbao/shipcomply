import {
  Box,
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Typography,
} from "@mui/material";

const ProgramList = ({ data = [], selectRow, onSelectRow,getControlLabel,name }) => {
  return (
    <Box>
      <Typography variant="h6" fontWeight={"bold"} ml={1}>
        *{getControlLabel("mtxt_program","Program")}
      </Typography>
      <List sx={{ padding: 0}}>
        {data[0]?.data.map((pro) => (
          <ListItem key={pro.program_code} disablePadding>
            <ListItemButton
              selected={selectRow?.program_code === pro.program_code}
              onClick={() => onSelectRow(pro)}
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
                primary={pro.program_code}
                secondary={pro[name]}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );
};
export default ProgramList;
