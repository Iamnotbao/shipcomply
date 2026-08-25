import { useEffect, useState } from "react";
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
import CloseIcon from "@mui/icons-material/Close";
import { fetchBasicDataByCate } from "../../../service/basic_data/basicDataService";
import Dropdown from "../../../component/dropdown/Dropdown";
import { 
  fetchAllAcSendByCate,
  fetchAllTypeByCate,
} from "../../../service/ac_send_base/AcSendBaseService";

const AddAcSendBase = ({
  open,
  onClose,
  handleAdd,
  getControlLabel,
  getColumnLabel,
  user,
  auth,
  language
}) => {
  const [dropdownValues, setDropdownValues] = useState({});

  const CATEGORY_CODES = {
    AC_SEND: 2190,
    AC_TYPE: "CDC",
    STOC_TYPE: "STOC_TYPE",
    SALES_TYPE: "SALES_TYPE",
  };

  const mapDropdown = {
    ac_type: CATEGORY_CODES.AC_TYPE,
    stoc_type: CATEGORY_CODES.STOC_TYPE,
    sales_type: CATEGORY_CODES.SALES_TYPE,
  };

  useEffect(() => {
    if (!open) {
      setDropdownValues({});
    }
  }, [open]);

  // Callback cho ac_send dropdown
  const createAcSendCallback = () => {
    return async (page, pageSize, searchText) => {
      try {
        const allow = Array.isArray(auth)
          ? auth.find((item) => item.field === "query_level")?.title
          : "1";
        
        const result = await fetchAllAcSendByCate(
          user?.factory,
          CATEGORY_CODES.AC_SEND,
          user?.department,
          user?.user_code,
          allow,
          language,
          page,
          pageSize,
          searchText
        );
        
        return {
          data: result?.data || [],
          total: result?.total || 0,
          pageSize: result?.pageSize || pageSize,
        };
      } catch (error) {
        console.error("Error fetching ac_send:", error);
        return {
          data: [],
          total: 0,
          pageSize: pageSize,
        };
      }
    };
  };

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
          searchText
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

  const renderField = (fieldName, label, gridSize = 2.4, extraProps = {}) => {
    const hasDropdown = mapDropdown.hasOwnProperty(fieldName);

    if (fieldName === "ac_send") {
      return (
        <Grid item xs={gridSize}>
          <Dropdown
            onFetchData={createAcSendCallback()}
            onSelect={(selectedItem) => {
              setDropdownValues((prev) => ({
                ...prev,
                ac_send: selectedItem?.code_no || "",
              }));
            }}
            select={dropdownValues.ac_send || extraProps.defaultValue || ""}
            table="AC_VEND_BASE_1"
            option={"ac_vend_base"}
            getControlLabel={getControlLabel}
            language={user?.language || "en"}
            field={getColumnLabel(fieldName, label)}
            totalItems={0}
            pageSize={10}
          />
          <input
            type="hidden"
            name={fieldName}
            value={dropdownValues.ac_send || extraProps.defaultValue || ""}
          />
        </Grid>
      );
    }

    if (hasDropdown) {
      const categoryCode = mapDropdown[fieldName];
      return (
        <Grid item xs={gridSize}>
          <Dropdown
            onFetchData={createDropdownCallback(categoryCode)}
            onSelect={(selectedItem) => {
              setDropdownValues((prev) => ({
                ...prev,
                [fieldName]: selectedItem?.code_no || "",
              }));
            }}
            select={dropdownValues[fieldName] || extraProps.defaultValue || ""}
            table="AC_VEND_BASE_1"
            option={"ac_vend_base"}
            getControlLabel={getControlLabel}
            language={user?.language || "en"}
            field={getColumnLabel(fieldName, label)}
            totalItems={0}
            pageSize={10}
          />
          <input
            type="hidden"
            name={fieldName}
            value={dropdownValues[fieldName] || extraProps.defaultValue || ""}
          />
        </Grid>
      );
    }

    return (
      <Grid item xs={gridSize}>
        <TextField
          fullWidth
          label={getColumnLabel(fieldName, label)}
          name={fieldName}
          {...extraProps}
        />
      </Grid>
    );
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
              {getControlLabel("ttl_m_1_add", "Add Ac Send Base")}
            </Typography>
            <Button onClick={onClose} variant="contained" color="error">
              <CloseIcon />
            </Button>
          </Box>

          <Box component="form" onSubmit={handleAdd}>
            {/* Row 1 */}
            <Grid container spacing={2} mb={3}>
              <Grid item xs={2.4}>
                <TextField
                  fullWidth
                  label={getColumnLabel("factory_code", "Factory Code")}
                  name="factory_code"
                  value={user?.factory}
                  disabled
                />
              </Grid>
              {renderField("ac_send", "Ac Send")}
            </Grid>

            {/* Row 2 */}
            <Grid container spacing={2} mb={3}>
              {renderField("ac_type", "Ac Type")}
              {renderField("stoc_type", "Stoc Type")}
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

export default AddAcSendBase;