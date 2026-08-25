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
import { toast, ToastContainer } from "react-toastify";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import CloseIcon from "@mui/icons-material/Close";
import { useEffect, useState } from "react";
import { fetchBasicDataByCate } from "../../../service/basic_data/basicDataService";
import Dropdown from "../../../component/dropdown/Dropdown";
import {
  fetchAllAcSendByCate,
  fetchAllVendNoByStatus,
} from "../../../service/ac_vend_base/AcVendBaseService";

const EditAcVendBase = ({
  open,
  onClose,
  acImp,
  handleEdit,
  getControlLabel,
  getColumnLabel,
  user,
  auth,
}) => {
  const { register, handleSubmit, reset, watch, setValue,control } = useForm({
    defaultValues: { ...acImp },
  });
  const [dropdownData, setDropdownData] = useState({});
  const [dropdownValues, setDropdownValues] = useState({});
  const [loadingAcSend, setLoadingAcSend] = useState(false);

  const mapDropdown = {
    ac_send: 2190,
    vend_no: 2,
  };

  useEffect(() => {
    if (!open) {
      setDropdownValues({});
      setDropdownData({
        vend_no: [],
        ac_send: [],
      });
    }
  }, [open]);

  useEffect(() => {
    if (open) {
      fetchVendNoDropdown();
    }
  }, [open]);
  useEffect(() => {
    if (open && dropdownValues.vend_no) {
      fetchAcSendDropdown(dropdownValues.vend_no);
    } else {
      setDropdownData((prev) => ({
        ...prev,
        ac_send: [],
      }));
      setDropdownValues((prev) => ({
        ...prev,
        ac_send: "",
      }));
    }
  }, [dropdownValues.vend_no, open]);
  const fetchVendNoDropdown = async () => {
    try {
      const allow = Array.isArray(auth)
        ? auth.find((item) => item.field === "query_level")?.title
        : null;

      const response = await fetchAllVendNoByStatus(
        user?.factory,
        user?.department,
        user?.user_code,
        allow
      );

      setDropdownData((prev) => ({
        ...prev,
        vend_no: response?.data || [],
      }));
    } catch (error) {
      console.error("Error fetching vend_no:", error);
      setDropdownData((prev) => ({
        ...prev,
        vend_no: [],
      }));
    }
  };

  const fetchAcSendDropdown = async (selectedVendNo) => {
    try {
      setLoadingAcSend(true);

      const allow = Array.isArray(auth)
        ? auth.find((item) => item.field === "query_level")?.title
        : null;

      const response = await fetchAllAcSendByCate(
        user?.factory,
        mapDropdown.ac_send,
        selectedVendNo,
        user?.department,
        user?.user_code,
        allow
      );

      setDropdownData((prev) => ({
        ...prev,
        ac_send: response?.data || [],
      }));
    } catch (error) {
      console.error("Error fetching ac_send:", error);
      setDropdownData((prev) => ({
        ...prev,
        ac_send: [],
      }));
    } finally {
      setLoadingAcSend(false);
    }
  };
  useEffect(() => {
    if (acImp) {
      const statusText = getStatusText(acImp.status);
      reset({
        ...acImp,
        statusText: statusText,
        is_default: acImp?.is_default || "N",
        req_qc: acImp?.req_qc || "N",
      });

      // Set dropdown values
      const initialDropdownValues = {};
      Object.keys(mapDropdown).forEach((fieldName) => {
        if (acImp[fieldName]) {
          initialDropdownValues[fieldName] = acImp[fieldName];
        }
      });
      setDropdownValues(initialDropdownValues);
    }
  }, [acImp, reset]);

  const onSubmit = (data) => {
    const finalData = {
      ...data,
      ...dropdownValues,
      locked_information: acImp?.locked_information,
    };
    handleEdit(finalData);
  };
  const getStatusText = (status) => {
    if (status === 1) return "New-1";
    if (status === 2) return "Checked-2";
    if (status === 0) return "Cancel-0";
    if (status === 7) return "Confirm-7";
    if (status === 9) return "Close-9";
    return "New-1";
  };
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xl">
      <DialogContent>
        <Paper sx={{ maxWidth: "1400px", mx: "auto", p: 3 }}>
          <Box
            display="flex"
            alignItems="center"
            justifyContent="center"
            mb={2}
          >
            <Typography
              variant="h4"
              textTransform="uppercase"
              fontWeight={600}
              textAlign="center"
              flex={1}
              mb={0}
            >
              {getControlLabel("ttl_m_1_edit", "Edit Ac Vend Base Tracking")}
            </Typography>
            <Button
              onClick={() => onClose(null)}
              variant="contained"
              color="error"
            >
              <CloseIcon />
            </Button>
          </Box>

          <Box component="form" onSubmit={handleSubmit(onSubmit)}>
            {/* Row 1 */}
            <Grid container spacing={2} mb={3}>
              <Grid item xs={2.4}>
                <TextField
                  fullWidth
                  label={getColumnLabel("factory_code", "Factory Code")}
                  {...register("factory_code")}
                  disabled
                />
              </Grid>
              <Grid item xs={2.4}>
                <TextField
                  fullWidth
                  label={getColumnLabel("vend_no", "Vend No")}
                  {...register("vend_no")}
                  disabled
                />
              </Grid>
              <Grid item xs={2.4}>
                <TextField
                  fullWidth
                  label={getColumnLabel("ac_send", "Ac Send")}
                  {...register("ac_send")}
                  disabled
                />
              </Grid>
            </Grid>

            {/* Row 2 */}
            <Grid container spacing={2} mb={3}>
              <Grid item xs={2.4}>
                <Controller
                    name="is_default"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        select
                        sx={{ width: "150px" }}
                        label={getColumnLabel("is_default","is_default")}
                        {...field}
                      >
                        <MenuItem value={"Y"}>Y</MenuItem>
                        <MenuItem value={"N"}>N</MenuItem>
                      </TextField>
                    )}
                  />
              </Grid>
              <Grid item xs={2.4}>
                <Controller
                    name="req_qc"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        select
                        sx={{ width: "150px" }}
                        label={getColumnLabel("req_qc","req_qc")}
                        {...field}
                      >
                        <MenuItem value={"Y"}>Y</MenuItem>
                        <MenuItem value={"N"}>N</MenuItem>
                      </TextField>
                    )}
                  />
              </Grid>
            </Grid>

            {/* Submit Button */}
            <Box mt={4} display="flex" justifyContent="center">
              <Button
                type="submit"
                variant="contained"
                color="primary"
                size="large"
              >
                {getControlLabel("btn_save", "Save")}
              </Button>
            </Box>
          </Box>
        </Paper>
      </DialogContent>
    </Dialog>
  );
};

export default EditAcVendBase;
