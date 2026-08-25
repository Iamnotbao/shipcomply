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
import Dropdown from "../../../component/dropdown/Dropdown";
import { fetchFactory } from "../../../service/factory/factoryService";
import {
  fetchDepartmentByFac,
  fetchDepartments,
} from "../../../service/factory_departments/FacDepartmentService";
import { useEffect, useState } from "react";
import { fnQuery } from "../../../utils/fnQuery";

const AddFacDept = ({
  open,
  handleClose,
  handleAdd,
  getControlLabel,
  language,
}) => {
  const today = new Date().toISOString().slice(0, 19).replace("T", " ");
  new Date().toISOString().split("T")[0];
  const { t } = useTranslation();
  const [selectFactory, setSelectFactory] = useState({});
  const [selectDepartment, setSelectDepartment] = useState({});
  const [factories, setFactories] = useState([]);
  const [departments, setDepartments] = useState([]);
  const nameBasedOnLanguage = {
    DEPARTMENTS: {
      en: "department_name_e",
      vi: "department_name_l",
      zh: "department_name_t",
    },
    FACTORY: {
      en: "factory_name_e",
      vi: "factory_name_l",
      zh: "factory_name_t",
    },
  };
  const fetchAll = async () => {
    const [fact, dept] = await fnQuery([
      () => fetchFactory(),
      () => fetchDepartments(),
    ]);

    if (fact) {
      console.log("check all fac", factories);
      setFactories([{ tableName: fact.tableName, data: fact.data }]);
    }
    if (dept) {
      console.log("check all dept", departments);
      setDepartments([{ tableName: dept.tableName, data: dept.data }]);
    }
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    handleAdd(e, selectFactory.factory_code, selectDepartment.department_code);
  };
  const handleDeptByFactory = async () => {
    const response = await fetchDepartmentByFac(selectFactory.factory_code);
    if (response) {
      setDepartments([{ tableName: response.tableName, data: response.data }]);
      if (response.data.length > 0) {
        setSelectDepartment(response.data[0]);
      } else {
        setSelectDepartment({});
      }
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
              {getControlLabel("ttl_add", "Add Factory & Department")}
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
                  "ftxt_fac_dept",
                  "Factory and Department Information",
                )}
              </legend>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Dropdown
                    key={selectFactory}
                    select={selectFactory}
                    data={factories[0]?.data}
                    onSelect={setSelectFactory}
                    table="FACTORY"
                    option="factory"
                    getControlLabel={getControlLabel}
                    language={language}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    type="text"
                    fullWidth
                    label={getControlLabel("txt_factory_name", "factory_name")}
                    name="factory_name"
                    value={
                      selectFactory[nameBasedOnLanguage["FACTORY"][language]]
                    }
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <Dropdown
                    key={selectDepartment}
                    select={selectDepartment}
                    data={departments[0]?.data}
                    onSelect={setSelectDepartment}
                    table="DEPARTMENTS"
                    option="department"
                    getControlLabel={getControlLabel}
                    language={language}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    type="text"
                    fullWidth
                    label={getControlLabel(
                      "txt_department_name",
                      "department_name",
                    )}
                    name="department_name"
                    value={
                      Object.keys(selectDepartment).length > 0
                        ? selectDepartment[
                            nameBasedOnLanguage["DEPARTMENTS"][language]
                          ]
                        : ""
                    }
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
              </Grid>
            </fieldset>
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
export default AddFacDept;
