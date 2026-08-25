import {
  Box,
  Button,
  Dialog,
  DialogContent,
  Grid,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import { useTranslation } from "react-i18next";

import CloseIcon from "@mui/icons-material/Close";

const AddProgramPage = ({ open, onClose , handleAdd,getControlLabel,getColumnLabel }) => {
  const { t } = useTranslation();
  return (
    <Dialog open={open} onClose={onClose} maxWidth>
      <DialogContent>
        <Paper sx={{ maxWidth: "1200px", mx: "auto", p: 3 }}>
          <Box
            display={"flex"}
            alignItems={"center"}
            justifyContent={"center"}
            mb={2}
          >
            <Typography
              variant="h4"
              textTransform={"uppercase"}
              fontWeight={600}
              gutterBottom
              textAlign={"center"}
              flex={1}
              mb={"0"}
            >
              {getControlLabel("ttl_add","Add Program Information")}
            </Typography>
            <Button onClick={onClose} variant="contained" color="error">
              <CloseIcon />
            </Button>
          </Box>
          <Box component="form" onSubmit={handleAdd}>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField fullWidth label={getColumnLabel("program_code","program_code")} name="program_code" />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label={getColumnLabel("program_name_t","program_name_t")}
                  name="program_name_t"
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label={getColumnLabel("program_name_e","program_name_e")}
                  name="program_name_e"
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label={getColumnLabel("program_name_l","program_name_l")}
                  name="program_name_l"
                />
              </Grid>
            </Grid>
            <Box mt={4}>
              <Button type="submit" variant="contained" color="primary">
                {getControlLabel("btn_save","Save")}
              </Button>
            </Box>
          </Box>
        </Paper>
      </DialogContent>
    </Dialog>
  );
};
export default AddProgramPage;
