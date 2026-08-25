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
const DetailUserPage = ({ shoe, open, onClose }) => {
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
              {t("User Information")}
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
                    value={shoe.factory_code}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Department Code"
                    name="department_code"
                    InputLabelProps={{ shrink: true }}
                    value={shoe.department_code}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="User Code"
                    name="user_code"
                    InputLabelProps={{ shrink: true }}
                    defaultValue={shoe.user_code}
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
                      label="User Name T"
                      name="user_name_t"
                      InputLabelProps={{ shrink: true }}
                      value={shoe.user_name_t}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="User Name E"
                      name="user_name_e"
                      value={shoe.user_name_e}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="User Name L"
                      name="user_name_l"
                      value={shoe.user_name_l}
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
                      label="Supervisor"
                      name="supervisor_id"
                      value={shoe.supervisor_id}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="Authorization"
                      name="allow_authorization"
                      value={shoe.allow_authorization}
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
export default DetailUserPage;
