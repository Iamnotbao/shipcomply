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
import { useEffect, useState } from "react";
import { fnQuery } from "../../../utils/fnQuery";
import { fetchDeptByID } from "../../../service/factory_departments/FacDepartmentService";
const DetailDepartmentPage = ({ shoe, open, onClose, title }) => {
  const { t } = useTranslation();
  const [department, setDepartment] = useState({});
  const fetchDepartmentByID = async () => {
    const response = await fnQuery([
      () => fetchDeptByID(shoe.factory_code, shoe.department_code),
    ]);
    if (response) {
      setDepartment(response[0].data);
    }
  };
  useEffect(() => {
    fetchDepartmentByID();
  }, [shoe.factory_code, shoe.department_code]);
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
              {t(title)}
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
                {t("Factory Department Information")}
              </legend>
              <Grid container spacing={2} mb={2}>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Factory Name T"
                    name="factory_name_t"
                    InputLabelProps={{ shrink: true }}
                    value={department?.FACTORY?.factory_name_t}
                    disabled
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Factory Name E"
                    name="factory_name_e"
                    InputLabelProps={{ shrink: true }}
                    value={department?.FACTORY?.factory_name_e}
                    disabled
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Factory Name L"
                    name="factory_name_l"
                    InputLabelProps={{ shrink: true }}
                    value={department?.FACTORY?.factory_name_l}
                    disabled
                  />
                </Grid>
              </Grid>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Factory Address"
                    name="factory_address"
                    InputLabelProps={{ shrink: true }}
                    value={department?.FACTORY?.factory_address}
                    disabled
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Factory Abbreviation"
                    name="factory_abbreviation"
                    InputLabelProps={{ shrink: true }}
                    value={department?.FACTORY?.factory_abbreviation}
                    disabled
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Factory Tax No"
                    name="factory_tax_no"
                    InputLabelProps={{ shrink: true }}
                    value={department?.FACTORY?.factory_tax_no}
                    disabled
                  />
                </Grid>
              </Grid>
            </fieldset>
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
                    value={department.factory_code}
                    disabled
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Department Code"
                    name="department_code"
                    InputLabelProps={{ shrink: true }}
                    value={department.department_code}
                    disabled
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Status"
                    name="status"
                    InputLabelProps={{ shrink: true }}
                    value={department.status}
                    disabled
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
                      label="Department Name T"
                      name="department_name_t"
                      InputLabelProps={{ shrink: true }}
                      value={department.department_name_t}
                      disabled
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="Department Name E"
                      name="department_name_e"
                      InputLabelProps={{ shrink: true }}
                      value={department.department_name_e}
                      disabled
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="Department Name L"
                      name="department_name_l"
                      InputLabelProps={{ shrink: true }}
                      value={department.department_name_l}
                      disabled
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
export default DetailDepartmentPage;
