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

import {useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { fnQuery } from "../../../utils/fnQuery";
import CloseIcon from "@mui/icons-material/Close";
import { fetchProgramFieldTitleByID } from "../../../service/program_field_title/programFieldTitleService";

const EditProgramFieldTitlePage = ({ open, onClose, programFieldTitle, handleEdit,getControlLabel,getColumnLabel }) => {
  const { register, handleSubmit, control, reset } = useForm({
    defaultValues: {
      ...programFieldTitle,
    },
  });

  
  const { t } = useTranslation();
  const [program, setProgram] = useState({});
   const getStatusText = (status) => {
    if (status === 1) return "New-1";
    if (status === 0) return "Cancel-0";
    return "New-1"; 
  };
  useEffect(() => {
    if (programFieldTitle && Object.keys(programFieldTitle).length > 0) {
      const statusText = getStatusText(programFieldTitle.status);
      reset({
        ...programFieldTitle,
        statusText: statusText,
      });
    }
  }, [programFieldTitle, reset]);
  const fetchPFTByID = async () => {
    const response = await fnQuery([
      () => fetchProgramFieldTitleByID(programFieldTitle.program_code, programFieldTitle.field_code),
    ]);
    if (response[0].success) {
      const { PROGRAM } = response[0].data;
      setProgram(PROGRAM);
    }
  };
  useEffect(() => {
    if (open && programFieldTitle?.program_code && programFieldTitle?.field_code) {
      fetchPFTByID();
    }
  }, [open, programFieldTitle]);

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
              sx={{ flex: 1 }}
              mb={"0"}
            >
              {getControlLabel("ttl_edit","Edit Program Language Information")}
            </Typography>
            <Button onClick={onClose} variant="contained" color="error">
              <CloseIcon />
            </Button>
          </Box>{" "}
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
                {getControlLabel("ftxt_program","Program Information")}
              </legend>
              <Grid container spacing={2} mb={2}>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label={getControlLabel("txt_program_name_t","program_name_t")}
                    value={program?.program_name_t || ""}
                    InputLabelProps={{ shrink: true }}
                    aria-readonly
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label={getControlLabel("txt_program_name_e","program_name_e")}
                    value={program?.program_name_e || ""}
                    InputLabelProps={{ shrink: true }}
                    aria-readonly
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label={getControlLabel("txt_program_name_l","program_name_l")}
                    value={program?.program_name_l || ""}
                    InputLabelProps={{ shrink: true }}
                    aria-readonly
                  />
                </Grid>
              </Grid>
            </fieldset>
          </Box>
          <Box component="form" 
          onSubmit={handleSubmit(handleEdit)}
           onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleSubmit(handleEdit)();
              }}}
          >
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label={getColumnLabel("field_code","field_code")}
                  name="field_code"
                  InputLabelProps={{ shrink: true }}
                  {...register("field_code")}
                  disabled
                />
              </Grid>
              <Grid item xs={6}>
                 <TextField
                    fullWidth
                    label={getColumnLabel("status","status")}
                    name="status"
                    {...register("statusText")}
                    InputLabelProps={{ shrink: true }}
                    disabled
                  />
              </Grid>
            </Grid>
            <Box mt={4}>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label={getColumnLabel("title_name_t","title_name_t")}
                    name="title_name_t"
                    InputLabelProps={{ shrink: true }}
                    {...register("title_name_t")}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label={getColumnLabel("title_name_e","title_name_e")}
                    name="title_name_e"
                    InputLabelProps={{ shrink: true }}
                    {...register("title_name_e")}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label={getColumnLabel("title_name_l","title_name_l")}
                    name="title_name_l"
                    InputLabelProps={{ shrink: true }}
                    {...register("title_name_l")}
                  />
                </Grid>
              </Grid>
            </Box>

            <Box mt={4} display={"flex"} gap={"6px"}>
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
export default EditProgramFieldTitlePage;
