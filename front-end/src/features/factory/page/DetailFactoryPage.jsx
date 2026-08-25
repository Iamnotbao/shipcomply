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
import ClearIcon from "@mui/icons-material/Clear";
import { useTranslation } from "react-i18next";
const DetailFactoryPage = ({ shoe, open, onClose, title }) => {
  const { t } = useTranslation();
  console.log(shoe);

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
              {t("User Information") || title}
            </Typography>
            <Button
              onClick={onClose}
              variant="contained"
              color="warning"
              sx={{ width: "20px" }}
            >
              <ClearIcon />
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
                    value={shoe?.factory_code}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Factory Name T"
                    name="factory_name_t"
                    InputLabelProps={{ shrink: true }}
                    value={shoe?.factory_name_t}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Factory Name E"
                    name="factory_name_e"
                    InputLabelProps={{ shrink: true }}
                    value={shoe?.factory_name_e}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Factory Name L"
                    name="factory_name_l"
                    InputLabelProps={{ shrink: true }}
                    value={shoe?.factory_name_l}
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
                      label="Factory Address"
                      name="factory_address"
                      InputLabelProps={{ shrink: true }}
                      value={shoe?.factory_address}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="Factory Abbreviation"
                      name="factory_abbreviation"
                      InputLabelProps={{ shrink: true }}
                      value={shoe?.factory_abbreviation}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="Factory Tax No"
                      name="factory_tax_no"
                      InputLabelProps={{ shrink: true }}
                      value={shoe?.factory_tax_no}
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
export default DetailFactoryPage;
