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
import useAuth from "../../../hooks/useAuth";
import { useTranslation } from "react-i18next";

import CloseIcon from "@mui/icons-material/Close";

const AddFactoryPage = ({ open, onClose , handleAdd,getControlLabel,getColumnLabel }) => {
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
              {getControlLabel("ttl_add","Add Factory Information")}
            </Typography>
            <Button onClick={onClose} variant="contained" color="error">
              <CloseIcon />
            </Button>
          </Box>
          <Box component="form" onSubmit={handleAdd}>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField fullWidth label={getColumnLabel("factory_code","factory_code")} name="factory_code" />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label={getColumnLabel("factory_name_t","factory_name_t")}
                  name="factory_name_t"
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label={getColumnLabel("factory_name_e","factory_name_e")}
                  name="factory_name_e"
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label={getColumnLabel("factory_name_l","factory_name_l")}
                  name="factory_name_l"
                />
              </Grid>
            </Grid>

            <Box mt={4}>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label={getColumnLabel("factory_address","factory_address")}
                    name="factory_address"
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label={getColumnLabel("factory_abbreviation","factory_abbreviation")}
                    name="factory_abbreviation"
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label={getColumnLabel("factory_tax_no","factory_tax_no")}
                    name="factory_tax_no"
                  />
                </Grid>
              </Grid>
            </Box>
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
export default AddFactoryPage;
