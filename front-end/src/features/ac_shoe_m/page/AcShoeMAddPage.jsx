import { Box, Button, Grid, Paper, TextField, Typography } from "@mui/material";
import { addShoe } from "../../../service/ac_shoe_m/ShoesService";
import { toast } from "react-toastify";
import KeyboardBackspaceIcon from "@mui/icons-material/KeyboardBackspace";
import { useNavigate } from "react-router-dom";
import useAuth from "../../../hooks/useAuth";
import { useTranslation } from "react-i18next";

const AcShoeMAddPage = () => {
  const today = new Date().toISOString().slice(0, 19).replace("T", " ");
  new Date().toISOString().split("T")[0];
  const { user } = useAuth();
  const navigation = useNavigate();
  const { t } = useTranslation();
  const handleAddShoe = async (e) => {
    e.preventDefault();
    const form = new FormData(e.target);
    const data = Object.fromEntries(form.entries());
    data.factory_code = user.factory_code;
    data.grt_user = user.user_id;
    data.last_user = user.user_id;
    data.grt_date = today;
    data.last_date = today;
    try {
      const response = await addShoe(data, user.access_token);
      if (response.success) {
        toast.success("Add successfully !!!");
      }
    } catch (error) {
      console.log("data has been problem", error);
    }
  };
  return (
    <Paper sx={{ maxWidth: "1200px", mx: "auto", p: 3 }}>
      <Box
        display={"flex"}
        alignItems={"center"}
        justifyContent={"center"}
        mb={2}
      >
        <Button
          onClick={() => navigation("/ac_shoe_m")}
          variant="contained"
          color="warning"
        >
          <KeyboardBackspaceIcon />
        </Button>
        <Typography
          variant="h4"
          textTransform={"uppercase"}
          fontWeight={600}
          gutterBottom
          textAlign={"center"}
          flex={1}
          mb={"0"}
        >
          {t("Add Shoe Information")}
        </Typography>
      </Box>
      <Box component="form" onSubmit={handleAddShoe}>
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
                label="Factory Name"
                value={user.factory_name_e}
                disabled
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Cutoms Shoe ID"
                name="customs_shoe_id"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Cutoms Shoe Name L"
                name="customs_shoe_name_l"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Cutoms Shoe Name T"
                name="customs_shoe_name_t"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Cutoms Shoe Name E"
                name="customs_shoe_name_e"
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
                />
              </Grid>
              <Grid item xs={6}>
                <TextField fullWidth label="Size Type" name="size_type" />
              </Grid>
              <Grid item xs={6}>
                <TextField fullWidth label="Unit" name="unit" />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Tax Per"
                  type="number"
                  inputProps={{ min: 0 }}
                  name="tax_per"
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Status"
                  type="number"
                  inputProps={{ min: 0 }}
                  name="status"
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
                <TextField fullWidth label="GRT Dept" name="grt_dept" />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="GRT User"
                  value={user.user_id}
                  disabled
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="GRT Date"
                  type="datetime-local"
                  value={today}
                  InputLabelProps={{ shrink: true }}
                  disabled
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Last User"
                  value={user.user_id}
                  disabled
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Last Date"
                  type="datetime-local"
                  value={today}
                  InputLabelProps={{ shrink: true }}
                  disabled
                />
              </Grid>
            </Grid>
          </fieldset>
        </Box>
        <Box mt={4}>
          <Button type="submit" variant="contained" color="primary">
            {t("Save")}
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};
export default AcShoeMAddPage;
