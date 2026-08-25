import { Box, Button, Grid, Paper, TextField, Typography } from "@mui/material";
import { addShoe, editShoe } from "../../../service/ac_shoe_m/ShoesService";
import { toast } from "react-toastify";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import KeyboardBackspaceIcon from "@mui/icons-material/KeyboardBackspace";
import useAuth from "../../../hooks/useAuth";
import { useTranslation } from "react-i18next";

const AcShoeMEditPage = () => {
  const { factory_code, customs_shoe_id } = useParams();
  const location = useLocation();
  const shoe = location.state;
  const { register, handleSubmit } = useForm({ defaultValues: shoe });
  const { user } = useAuth();
  const navigation = useNavigate();
  const { t } = useTranslation();
  const handleEditShoe = async (data) => {
    try {
      const response = await editShoe(
        factory_code,
        customs_shoe_id,
        data,
        user.access_token
      );

      if (response.success) {
        toast.success(
          `Edit shoe with factory code(${factory_code}) successfully !!!`
        );
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
          sx={{ flex: 1 }}
          mb={"0"}
        >
          {t("Edit Shoe Information")}
        </Typography>
      </Box>
      <Box component="form" onSubmit={handleSubmit(handleEditShoe)}>
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
                value={factory_code}
                disabled
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Cutoms Shoe ID"
                name="customs_shoe_id"
                value={customs_shoe_id}
                disabled
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Cutoms Shoe Name L"
                name="customs_shoe_name_l"
                {...register("customs_shoe_name_l")}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Cutoms Shoe Name T"
                name="customs_shoe_name_t"
                {...register("customs_shoe_name_t")}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Cutoms Shoe Name E"
                name="customs_shoe_name_e"
                {...register("customs_shoe_name_e")}
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
                  {...register("customs_tariff")}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Size Type"
                  name="size_type"
                  {...register("size_type")}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Unit"
                  name="unit"
                  {...register("unit")}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Tax Per"
                  name="tax_per"
                  {...register("tax_per")}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Status"
                  name="status"
                  {...register("status")}
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
                  {...register("grt_dept")}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="GRT User"
                  name="grt_user"
                  disabled
                  {...register("grt_user")}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="GRT Date"
                  name="grt_date"
                  disabled
                  {...register("grt_date")}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Last User"
                  name="last_user"
                  disabled
                  {...register("last_user")}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Last Date"
                  name="last_date"
                  disabled
                  {...register("last_date")}
                />
              </Grid>
            </Grid>
          </fieldset>
        </Box>
        <Box mt={4} display={"flex"} gap={"6px"}>
          <Button type="submit" variant="contained" color="primary">
            {t("Save")}
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};
export default AcShoeMEditPage;
