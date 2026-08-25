import {
  Box,
  Button,
  Dialog,
  DialogContent,
  Grid,
  MenuItem,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { fnQuery } from "../../../utils/fnQuery";
import { fetchFactory } from "../../../service/factory/factoryService";
import Dropdown from "../../../component/dropdown/Dropdown";
import CloseIcon from "@mui/icons-material/Close";

const AddDepartmentPage = ({ open, onClose, handleAdd, selectFactory, handleSelectFactory, getControlLabel,getColumnLabel,language = "en",  }) => {
  const { t } = useTranslation();
  const [factories, setFactories] = useState([]);
  const fetchF = async () => {
    const [factories] = await fnQuery([() => fetchFactory()]);
    if (factories) {
      setFactories(factories);
    }
  };
  useEffect(() => {
    fetchF();
  }, []);
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
              {getControlLabel("ttl_add","Add Department Information")}
            </Typography>
            <Button onClick={onClose} variant="contained" color="error">
              <CloseIcon />
            </Button>
          </Box>
          <Box component="form" onSubmit={handleAdd}>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Dropdown
                  key={selectFactory}
                  select={selectFactory}
                  data={factories?.data}
                  onSelect={handleSelectFactory}
                  getControlLabel={getControlLabel}
                  language={language}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label={getColumnLabel("department_code","department_code")}
                  name="department_code"
                />
              </Grid>
              <Grid item xs={6}>
                {/* <TextField
                    select
                    sx={{ width: "150px" }}
                    label="status"
                    name="status"
                    defaultValue={"0"}
                  >
                    <MenuItem value={"0"}>0</MenuItem>
                    <MenuItem value={"1"}>1</MenuItem>
                  </TextField> */}
              </Grid>
            </Grid>
            <Box mt={4}>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label={getColumnLabel("department_name_t","department_name_t")}
                    name="department_name_t"
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label={getColumnLabel("department_name_e","department_name_e")}
                    name="department_name_e"
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label={getColumnLabel("department_name_l","department_name_l")}
                    name="department_name_l"
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
export default AddDepartmentPage;
