import {
  Box,
  Button,
  Dialog,
  DialogContent,
  InputBase,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import CloseIcon from "@mui/icons-material/Close";
import Dropdown from "../../../component/dropdown/Dropdown";

const CopyPopup = ({
  openLink = false,
  onClose,
  onSave,
  getControlLabel,
  selectPermissison,
  fetchUser,
  language,
}) => {
  const { handleSubmit, control } = useForm({
    defaultValues: { new_user: "" },
  });

  const onSubmit = (formData) => {
    onSave(formData.new_user);
  };

  return (
    <Dialog open={openLink} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogContent>
        <Box display="flex" alignItems="center" justifyContent="center" mb={2}>
          <Typography variant="h6" fontWeight={600} flex={1} textAlign="center">
            {getControlLabel("ttl_copy_permission", "Copy Permission")}
          </Typography>
          <Button onClick={onClose} variant="contained" color="error">
            <CloseIcon />
          </Button>
        </Box>

        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={2}>
            {/* Old user — readonly */}
            <Box display="flex" alignItems="center" gap={2}>
              <Typography fontWeight="bold" fontSize="14px" minWidth={120}>
                {getControlLabel("lbl_copy_from", "Copy From:")}
              </Typography>
              <Paper sx={{ p: "2px 8px", flex: 1 }}>
                <InputBase
                  value={selectPermissison?.user_code || ""}
                  disabled
                  fullWidth
                />
              </Paper>
            </Box>

            {/* New user — dropdown */}
            <Box display="flex" alignItems="center" gap={2}>
              <Typography fontWeight="bold" fontSize="14px" minWidth={120}>
                {getControlLabel("lbl_copy_to", "Copy To:")}
              </Typography>
              <Controller
                name="new_user"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <Dropdown
                    onFetchData={fetchUser}
                    onSelect={(item) => field.onChange(item?.user_code || "")}
                    select={field.value}
                    getControlLabel={getControlLabel}
                    language={language}
                    table="USER"
                    option="user"
                  />
                )}
              />
            </Box>

            {/* Buttons */}
            <Box display="flex" justifyContent="space-between">
              <Button variant="contained" color="primary" type="submit">
                {getControlLabel("btn_save", "Ok")}
              </Button>
              <Button variant="contained" color="error" onClick={onClose}>
                {getControlLabel("btn_cancel", "Cancel")}
              </Button>
            </Box>
          </Stack>
        </Box>
      </DialogContent>
    </Dialog>
  );
};
export default CopyPopup;
