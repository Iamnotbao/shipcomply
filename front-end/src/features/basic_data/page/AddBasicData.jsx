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
import { fetchFactory } from "../../../service/factory/factoryService";
import {
  fetchDepartmentByFac,
  fetchDepartments,
} from "../../../service/factory_departments/FacDepartmentService";
import { useEffect, useState } from "react";
import { fnQuery } from "../../../utils/fnQuery";
import { generateNameFields } from "../../../utils/table/formFieldHelper";

const AddBasicData = ({
  open,
  handleClose,
  handleAdd,
  getControlLabel,
  getColumnLabel,
  user,
  table = "",
  mapLanguageToColumn,
  language,
}) => {
  const today = new Date().toISOString().slice(0, 19).replace("T", " ");
  new Date().toISOString().split("T")[0];
  const [selectFactory, setSelectFactory] = useState({});
  const [selectDepartment, setSelectDepartment] = useState({});
  const [factories, setFactories] = useState([]);
  const [departments, setDepartments] = useState([]);
  const fetchAll = async () => {
    const [fact, dept] = await fnQuery([
      () => fetchFactory(),
      () => fetchDepartments(),
    ]);
    if (fact) {
      setFactories([{ tableName: fact.tableName, data: fact.data }]);
    }
    if (dept) {
      setDepartments([{ tableName: dept.tableName, data: dept.data }]);
    }
  };
  const visibleColumn = mapLanguageToColumn(language);
  const nameFields = generateNameFields(table);
  // .filter(
  //   (field) => field.key === visibleColumn
  // );
  const handleSubmit = (e) => {
    e.preventDefault();
    handleAdd(e, selectFactory.factory_code, selectDepartment.department_code);
  };
  const handleDeptByFactory = async () => {
    const response = await fetchDepartmentByFac(selectFactory.factory_code);
    if (response) {
      setDepartments([{ tableName: response.tableName, data: response.data }]);
    }
  };
  useEffect(() => {
    fetchAll();
  }, []);
  useEffect(() => {
    if (selectFactory && selectFactory.factory_code) {
      handleDeptByFactory();
    }
  }, [selectFactory]);

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="lg" fullWidth>
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
              {getControlLabel("ttl_m_add", "Add Basic Data Category")}
            </Typography>
            <Button onClick={handleClose} variant="contained" color="error">
              <CloseIcon />
            </Button>
          </Box>
          <Box component="form" onSubmit={handleSubmit}>
            <fieldset
              style={{
                border: "1px solid #ccc",
                borderRadius: "8px",
                padding: "16px",
                marginBottom: "24px",
              }}
            >
              <legend style={{ padding: "0 8px", fontWeight: "bold" }}>
                {getControlLabel(
                  "ftxt_m_fac_dept",
                  "Factory and Department Information"
                )}
              </legend>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    type="text"
                    fullWidth
                    label={getControlLabel(
                      "txt_m_factory_code",
                      "factory_code"
                    )}
                    name="factory_code"
                    value={user?.factory}
                    InputLabelProps={{ shrink: true }}
                    disabled
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    type="text"
                    fullWidth
                    label={getControlLabel(
                      "txt_m_department_code",
                      "department_code"
                    )}
                    name="department_code"
                    value={user?.department}
                    InputLabelProps={{ shrink: true }}
                    disabled
                  />
                </Grid>
              </Grid>
            </fieldset>
            <Box mt={4}>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label={getColumnLabel("category_code", "category_code")}
                    name="category_code"
                  />
                </Grid>
                {nameFields.map((field) => (
                  <Grid item xs={6} key={field.key}>
                    <TextField
                      fullWidth
                      label={getColumnLabel(field.name, field.label)}
                      name={field.name}
                    />
                  </Grid>
                ))}
              </Grid>
            </Box>
            <Box mt={4}>
              <Button type="submit" variant="contained" color="primary">
                {getControlLabel("btn_save", "Save")}
              </Button>
            </Box>
          </Box>
        </Paper>
      </DialogContent>
    </Dialog>
  );
};
export default AddBasicData;
