import { Box, Button, Grid, Paper, TextField, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
const DetailUserPermissionPage = ({ user }) => {
  const { t } = useTranslation();
  const { FACTORY, FACTORY_DEPARTMENT, ...singleUser } = user;
  
  return (
    <Paper
      sx={{
        height: "300px",
        overflowY: "auto",
        p: 2,
      }}
    >
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
            {t("FACTORY INFORMATION")}
          </legend>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Factory Code"
                name="factory_code"
                InputLabelProps={{ shrink: true }}
                value={FACTORY?.factory_code || ""}
                inputProps={{
                  readOnly: true,
                }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Factory Name E"
                name="factory_name_e"
                InputLabelProps={{ shrink: true }}
                value={FACTORY?.factory_name_e || ""}
                inputProps={{
                  readOnly: true,
                }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Factory Name L"
                name="factory_name_l"
                InputLabelProps={{ shrink: true }}
                inputProps={{
                  readOnly: true,
                }}
                defaultValue={FACTORY?.factory_name_l || ""}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Factory Name T"
                name="factory_name_t"
                InputLabelProps={{ shrink: true }}
                inputProps={{
                  readOnly: true,
                }}
                value={FACTORY?.factory_name_t || ""}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Factory Address"
                name="factory_address"
                InputLabelProps={{ shrink: true }}
                inputProps={{
                  readOnly: true,
                }}
                value={FACTORY?.factory_address || ""}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Factory Tax No"
                name="factory_tax_no"
                InputLabelProps={{ shrink: true }}
                inputProps={{
                  readOnly: true,
                }}
                value={FACTORY?.factory_tax_no || ""}
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
              {t("DEPARTMENT INFORMATION")}
            </legend>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Department Code"
                  name="department_code"
                  InputLabelProps={{ shrink: true }}
                  inputProps={{
                    readOnly: true,
                  }}
                  value={FACTORY_DEPARTMENT?.department_code}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Deparment Name T"
                  name="department_name_t"
                  value={FACTORY_DEPARTMENT?.department_name_t}
                  inputProps={{
                    readOnly: true,
                  }}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Deparment Name E"
                  name="department_name_e"
                  value={FACTORY_DEPARTMENT?.department_name_e}
                  inputProps={{
                    readOnly: true,
                  }}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Deparment Name L"
                  name="department_name_l"
                  value={FACTORY_DEPARTMENT?.department_name_l}
                  inputProps={{
                    readOnly: true,
                  }}
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
              {t("USER INFORMATION")}
            </legend>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="User Name T"
                  name="user_name_t"
                  value={singleUser?.user_name_t}
                  inputProps={{
                    readOnly: true,
                  }}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="User Name L"
                  name="user_name_l"
                  value={singleUser?.user_name_l}
                  inputProps={{
                    readOnly: true,
                  }}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="User Password"
                  name="user_password"
                  value={singleUser?.user_password}
                  inputProps={{
                    readOnly: true,
                  }}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Supervisor"
                  name="supervisor_id"
                  value={singleUser?.supervisor_id}
                  inputProps={{
                    readOnly: true,
                  }}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Allow Authorization"
                  name="allow_authorization"
                  value={singleUser?.allow_authorization}
                  inputProps={{
                    readOnly: true,
                  }}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </Grid>
          </fieldset>
        </Box>
      </Box>
    </Paper>
  );
};
export default DetailUserPermissionPage;
