import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import ClearIcon from '@mui/icons-material/Clear';
import { useTranslation } from "react-i18next";
const AcShoeMDetailPage = ({ shoe, open, onClose, title }) => {
   const { t } = useTranslation();
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg">
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
              flex={1}
              mb={0}
              textAlign={"center"}
            >
              {t("Shoe Information")}
            </Typography>
            <Button
            onClick={onClose}
              variant="contained"
              color="warning"
              sx={{width:"20px"}}
            >
              <ClearIcon/>
            </Button>
          </Box>
          <Box component="form">
            <fieldset
              style={{
                border: "1px solid #ccc",
                borderRadius: "8px",
                padding: "16px",
                marginBottom: "24px",
              }}
            >
              <legend style={{ padding: "0 8px", fontWeight: "bold" }}>
                {t("Main Information")}
              </legend>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Factory Code"
                    name="factory_code"
                    InputLabelProps={{ shrink: true }}
                    value={shoe.factory_code}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Cutoms Shoe ID"
                    name="customs_shoe_id"
                    InputLabelProps={{ shrink: true }}
                    value={shoe.customs_shoe_id}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Cutoms Shoe Name L"
                    name="customs_shoe_name_l"
                    InputLabelProps={{ shrink: true }}
                    defaultValue={shoe.customs_shoe_name_l}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Cutoms Shoe Name T"
                    name="customs_shoe_name_t"
                    InputLabelProps={{ shrink: true }}
                    value={shoe.customs_shoe_name_t}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Cutoms Shoe Name E"
                    name="customs_shoe_name_e"
                    InputLabelProps={{ shrink: true }}
                    value={shoe.customs_shoe_name_e}
                  />
                </Grid>
              </Grid>
            </fieldset>
            <Box mt={4}>
              <fieldset
                style={{
                  border: "1px solid #ccc",
                  borderRadius: "8px",
                  padding: "16px",
                  marginBottom: "24px",
                }}
              >
                {" "}
                <legend style={{ padding: "0 8px", fontWeight: "bold" }}>
                  {t("Tax Information")}
                </legend>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="Cutom tariff"
                      name="customs_tariff"
                      InputLabelProps={{ shrink: true }}
                      value={shoe.customs_tariff}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="Size Type"
                      name="size_type"
                      value={shoe.customs_tariff}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="Unit"
                      name="unit"
                      value={shoe.unit}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="Tax Per"
                      name="tax_per"
                      value={shoe.tax_per}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="Status"
                      name="status"
                      value={shoe.status}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                </Grid>
              </fieldset>
            </Box>
            <Box mt={4}>
              <fieldset
                style={{
                  border: "1px solid #ccc",
                  borderRadius: "8px",
                  padding: "16px",
                  marginBottom: "24px",
                }}
              >
                {" "}
                <legend style={{ padding: "0 8px", fontWeight: "bold" }}>
                  {t("Audit Information")}
                </legend>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="GRT Dept"
                      name="grt_dept"
                      value={shoe.grt_dept}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="GRT User"
                      name="grt_user"
                      value={shoe.grt_user}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="GRT Date"
                      name="grt_date"
                      value={shoe.grt_date}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="Last User"
                      name="last_user"
                      value={shoe.last_user}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="Last Date"
                      name="last_date"
                      value={shoe.last_date}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                </Grid>
              </fieldset>
            </Box>
          </Box>
        </Paper>
      </DialogContent>
    </Dialog>
  );
};
export default AcShoeMDetailPage;
