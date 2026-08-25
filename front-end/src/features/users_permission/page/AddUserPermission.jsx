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
import Dropdown from "../../../component/dropdown/Dropdown";
import CloseIcon from "@mui/icons-material/Close";

const AddUserPermission = ({
  open,
  handleClose,
  handleAdd,
  selectFactory,
  selectDepartment,
  selectProgram,
  onSelectProgram,
  programs,
  getControlLabel,
  language
}) => {
  const today = new Date().toISOString().slice(0, 19).replace("T", " ");
  new Date().toISOString().split("T")[0];
  const { t } = useTranslation();
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
     PROGRAM: {
      en: "program_name_e",
      vi: "program_name_l",
      zh: "program_name_t",
    },
  };
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
              {getControlLabel("ttl_add","Add Permissison Information")}
            </Typography>
            <Button onClick={handleClose} variant="contained" color="error">
              <CloseIcon />
            </Button>
          </Box>
          <Box component="form" onSubmit={handleAdd}>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label={getControlLabel("txt_factory_code","factory_code")}
                    name="factory_code"
                    value={selectFactory?.factory_code}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label={getControlLabel("txt_factory_name","factory_name")}
                    name="factory_name_e"
                    value={selectFactory?.[nameBasedOnLanguage["FACTORY"][language]]}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label={getControlLabel("txt_department_code","department_code")}
                    name="department_code"
                    value={selectDepartment?.department_code}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label={getControlLabel("txt_department_name","department_name")}
                    name="department_name_e"
                    value={selectDepartment?.[nameBasedOnLanguage["DEPARTMENTS"][language]]}
                  />
                </Grid>
              </Grid>
              <Grid container spacing={2} mt={2}>
                <Grid item xs={6}>
                  <Dropdown
                    key={selectProgram}
                    select={selectProgram}
                    data={programs[0]?.data}
                    onSelect={onSelectProgram}
                    table="PROGRAM"
                    option="program"
                    getControlLabel={getControlLabel}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label={getControlLabel("txt_program_name","program_name")}
                    name="program_name_e"
                    value={selectProgram?.[nameBasedOnLanguage["PROGRAM"][language]]}
                  />
                </Grid>
              </Grid>
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
export default AddUserPermission;
