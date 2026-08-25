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
import { useEffect, useState } from "react";
import { fnQuery } from "../../../utils/fnQuery";
import CloseIcon from "@mui/icons-material/Close";
import { Controller, useForm } from "react-hook-form";
import Dropdown from "../../../component/dropdown/Dropdown";
import { fetchAllCustDropdown } from "../../../service/se_cust/seCust";
import { fetchSeShippingMByID } from "../../../service/se_shipping_m/seShippingM";

const EditSeShippingM = ({
  open,
  onClose,
  seShippingM, // Data của record cần edit
  handleEdit,
  getControlLabel,
  getColumnLabel,
  user,
  auth,
  language,
}) => {
  const { register, handleSubmit, control, reset, setValue, watch } = useForm({
    defaultValues: {
      factory_code: "",
      department_code: "",
      cust_id: "",
      si_seq: "",
      start_date: "",
      end_date: "",
    },
  });

  const { t } = useTranslation();
  const [factory, setFactory] = useState({});
  const [dropdownValues, setDropdownValues] = useState({
    cust_id: "",
  });
  console.log("dajkdad", user);

  // Watch for fields
  const cust_id = watch("cust_id");

  // Reset form khi mở dialog hoặc data thay đổi
  useEffect(() => {
    if (open && seShippingM && Object.keys(seShippingM).length > 0) {
      reset({
        ...seShippingM,
        factory_code: user?.factory || "",
      });

      // Set dropdown display values
      const displayValue = seShippingM.cust_id
        ? `${seShippingM.cust_id || ""}-${seShippingM.cust_no || ""}-${seShippingM.cust_name || ""}`
        : "";

      setDropdownValues({
        cust_id: displayValue,
      });
    }
  }, [seShippingM, open, reset, user]);

  // Dropdown callback cho CUST_ID
  const createCustCallback = () => {
    return async (page, pageSize, searchText) => {
      try {
        const allow =
          auth?.find((item) => item.field === "query_level")?.title || "1";
        const result = await fetchAllCustDropdown(
          user?.factory,
          user?.department,
          user?.user_code,
          allow,
          "cust_id",
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
        console.error("Error fetching cust_id:", error);
        return { data: [], total: 0, pageSize };
      }
    };
  };

  const renderField = (
    fieldName,
    label,
    gridSize = 3,
    extraProps = {},
    type = "text",
  ) => {
    // Regular fields
    return (
      <Grid item xs={gridSize} key={fieldName}>
        <TextField
          fullWidth
          label={getColumnLabel(fieldName, label)}
          type={type}
          InputLabelProps={{ shrink: true }}
          inputProps={
            type === "number"
              ? { step: "0.01", min: 0, ...extraProps.inputProps }
              : extraProps.inputProps
          }
          {...register(fieldName, {
            valueAsNumber: type === "number",
          })}
          {...extraProps}
        />
      </Grid>
    );
  };

  const onSubmit = (data) => {
    handleEdit(data);
  };

  return (
    <Dialog open={open} onClose={() => onClose(null)} maxWidth="lg" fullWidth>
      <DialogContent>
        <Paper sx={{ maxWidth: "1200px", mx: "auto", p: 3 }}>
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
              {getControlLabel("ttl_m_edit", "Edit Se Shipping M Information")}
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
            {/* Factory and Department Information Section */}
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
                  "Factory and Department Information",
                )}
              </legend>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label={getControlLabel(
                      "txt_m_factory_code",
                      "Factory Code",
                    )}
                    value={user?.factory || ""}
                    InputLabelProps={{ shrink: true }}
                    disabled
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label={getControlLabel(
                      "txt_m_department_code",
                      "Department Code",
                    )}
                    value={user?.department || ""}
                    InputLabelProps={{ shrink: true }}
                    disabled
                  />
                </Grid>
              </Grid>
            </fieldset>

            {/* Main Form Fields */}
            <Box mt={4}>
              <Grid container spacing={2}>
                {renderField("cust_id", "Customer ID", 6, {
                    disabled: true,
                  })}
                {renderField(
                  "si_seq",
                  "SI Seq",
                  6,
                  {
                    disabled: true,
                  },
                  "number",
                )}
                {renderField("start_date", "Start Date", 6, {}, "date")}
                {renderField("end_date", "End Date", 6, {}, "date")}
              </Grid>
            </Box>

            {/* Submit Button */}
            <Box mt={4} display="flex" gap="6px">
              <Button variant="outlined" onClick={onClose}>
                {getControlLabel("btn_cancel", "Cancel")}
              </Button>
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

export default EditSeShippingM;
