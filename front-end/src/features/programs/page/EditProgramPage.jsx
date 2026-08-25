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
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import CloseIcon from "@mui/icons-material/Close";
import { useEffect } from "react";

const EditProgramPage = ({ open, onClose, program, handleEdit,getControlLabel,getColumnLabel }) => {
  const { register, handleSubmit, control, reset } = useForm({
    defaultValues: {
      ...program,
    },
  });
  useEffect(() => {
    if (program?.program_code) {
      reset({
        ...program,
      });
    }
  }, [program?.program_code, reset]);

  const onSubmit = (data) => {
    handleEdit(data);
  };
  const { t } = useTranslation();

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
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
              {getControlLabel("ttl_edit","Edit Program Information")}
            </Typography>
            <Button
              onClick={onClose}
              variant="contained"
              color="error"
            >
              <CloseIcon />
            </Button>
          </Box>
          <Box
            component="form"
            onSubmit={handleSubmit(onSubmit)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleSubmit(handleEdit)();
              }
            }}
          >
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label={getColumnLabel("program_code","program_code")}
                  name="program_code"
                  {...register("program_code")}
                  disabled
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label={getColumnLabel("program_name_t","program_name_t")}
                  name="program_name_t"
                  {...register("program_name_t")}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label={getColumnLabel("program_name_e","program_name_e")}
                  name="program_name_e"
                  {...register("program_name_e")}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label={getColumnLabel("program_name_l","program_name_l")}
                  name="program_name_l"
                  {...register("program_name_l")}
                />
              </Grid>
            </Grid>
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
export default EditProgramPage;
