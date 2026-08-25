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
import CloseIcon from "@mui/icons-material/Close";
import { useEffect, useState } from "react";
import Dropdown from "../../../component/dropdown/Dropdown";
import { fetchAllTypeByCate } from "../../../service/ac_send_base/AcSendBaseService";

const EditAcSendBase = ({
  open,
  onClose,
  acImp,
  handleEdit,
  getControlLabel,
  getColumnLabel,
  user,
  auth,
  language,
}) => {
  const { register, handleSubmit, reset, setValue } = useForm({
    defaultValues: { ...acImp },
  });
  const [dropdownValues, setDropdownValues] = useState({});

  const mapDropdown = {
    ac_type: "CDC",
    stoc_type: "STOC_TYPE",
    sales_type: "SALES_TYPE",
  };

  useEffect(() => {
    if (acImp) {
      const statusText = getStatusText(acImp.status);
      reset({
        ...acImp,
        statusText: statusText,
        ac_type: acImp?.ac_type?.split("T")[0] || "",
        stoc_type: acImp?.stoc_type?.split("T")[0] || "",
        sales_type: acImp?.sales_type?.split("T")[0] || "",
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

  useEffect(() => {
    if (!open) {
      setDropdownValues({});
    }
  }, [open]);

  // Create callback function cho dropdown
  const createDropdownCallback = (categoryCode) => {
    return async (page, pageSize, searchText) => {
      try {
        const allow = Array.isArray(auth)
          ? auth.find((item) => item.field === "query_level")?.title
          : "1";

        const result = await fetchAllTypeByCate(
          user?.factory,
          categoryCode,
          user?.department,
          user?.user_code,
          allow,
          language,
          page,
          pageSize,
          searchText,
        );

        return {
          data: result?.data || [],
          total: result?.total || 0,
          pageSize: result?.pageSize || pageSize,
        };
      } catch (error) {
        console.error(`Error fetching dropdown ${categoryCode}:`, error);
        return {
          data: [],
          total: 0,
          pageSize: pageSize,
        };
      }
    };
  };

  const onSubmit = (data) => {
    const finalData = {
      ...data,
      ...dropdownValues,
      locked_information: acImp?.locked_information,
    };
    handleEdit(finalData);
  };

  const renderField = (fieldName, label, gridSize = 2.4, extraProps = {}) => {
    const hasDropdown = mapDropdown.hasOwnProperty(fieldName);

    if (hasDropdown) {
      const categoryCode = mapDropdown[fieldName];
      return (
        <Grid item xs={gridSize}>
          <Dropdown
            onFetchData={createDropdownCallback(categoryCode)}
            onSelect={(selectedItem) => {
              const value = selectedItem?.code_no || "";
              setDropdownValues((prev) => ({
                ...prev,
                [fieldName]: value,
              }));
              setValue(fieldName, value);
            }}
            select={dropdownValues[fieldName] || ""}
            table="AC_VEND_BASE_1"
            option="ac_vend_base"
            getControlLabel={getControlLabel}
            language={user?.language || "en"}
            field={getColumnLabel(fieldName, label)}
            totalItems={0}
            pageSize={10}
          />
        </Grid>
      );
    }

    return (
      <Grid item xs={gridSize}>
        <TextField
          fullWidth
          label={getColumnLabel(fieldName, label)}
          {...register(fieldName)}
          {...extraProps}
        />
      </Grid>
    );
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
              {getControlLabel("ttl_m_1_edit", "Edit Ac Send Base")}
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
                  label={getColumnLabel("ac_send", "ac_send")}
                  {...register("ac_send")}
                  disabled
                />
              </Grid>
            </Grid>

            {/* Row 2 */}
            <Grid container spacing={2} mb={3}>
              {renderField("ac_type", "Loading Way")}
              {renderField("stoc_type", "Stoc type")}
              {renderField("sales_type", "Sales Type")}
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

export default EditAcSendBase;
