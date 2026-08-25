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
import { fetchPrograms } from "../../../service/program/programService";

const AddProgramFieldTitlePage = ({ open, onClose, handleAdd, selectProgram, handleSelectProgram,getControlLabel,getColumnLabel,language = "en",}) => {
  const { t } = useTranslation();
  const [programs, setPrograms] = useState([]);
  const fetchP = async () => {
    const [programs] = await fnQuery([() => fetchPrograms()]);
    if (programs) {
      setPrograms(programs);
    }
  };
  useEffect(() => {
    fetchP();
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
              {getControlLabel("ttl_add","Add Program Language Information")}
            </Typography>
            <Button onClick={onClose} variant="contained" color="error">
              <CloseIcon />
            </Button>
          </Box>
          <Box component="form" onSubmit={handleAdd}>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Dropdown
                  key={selectProgram}
                    select={selectProgram}
                    data={programs?.data}
                    onSelect={handleSelectProgram}
                    table="PROGRAM"
                    option="program"
                    getControlLabel={getControlLabel}
                    language={language}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label={getColumnLabel("field_code","field_code")}
                  name="field_code"
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
                    label={getColumnLabel("title_name_t","title_name_t")}
                    name="title_name_t"
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label={getColumnLabel("title_name_e","title_name_e")}
                    name="title_name_e"
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                     label={getColumnLabel("title_name_l","title_name_l")}
                    name="title_name_l"
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
export default AddProgramFieldTitlePage;
