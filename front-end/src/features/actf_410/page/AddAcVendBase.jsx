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
  fetchAllVendNoByStatus,
} from "../../../service/ac_vend_base/AcVendBaseService";

const AddAcVendBase = ({
  open,
  onClose,
  handleAdd,
  getControlLabel,
  getColumnLabel,
  user,
  auth,
  language,
}) => {
  const [dropdownData, setDropdownData] = useState({
    vend_no: [],
    ac_send: [],
  });
  const [dropdownValues, setDropdownValues] = useState({});
  const [loadingAcSend, setLoadingAcSend] = useState(false);

  const mapDropdown = {
    ac_send: 2190,
    vend_no: 2,
  };

  const createVendNoDropdownCallback = () => {
    return async (page, pageSize, searchText) => {
      try {
        const allow = Array.isArray(auth)
          ? auth.find((item) => item.field === "query_level")?.title
          : "1";
        const result = await fetchAllVendNoByStatus(
          user?.factory,
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
        console.error(`Error fetching dropdown:`, error);
        return {
          data: [],
          total: 0,
          pageSize: pageSize,
        };
      }
    };
  };
  const createAcSendDropdownCallback = () => {
    return async (page, pageSize, searchText) => {
      try {
        const allow = Array.isArray(auth)
          ? auth.find((item) => item.field === "query_level")?.title
          : "1";
        const result = await fetchAllAcSendByCate(
          user?.factory,
          mapDropdown.ac_send,
          dropdownValues?.vend_no,
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
        console.error(`Error fetching dropdown:`, error);
        return {
          data: [],
          total: 0,
          pageSize: pageSize,
        };
      }
    };
  };
  const renderField = (fieldName, label, gridSize = 2.4, extraProps = {}) => {

    if (fieldName === "vend_no") {
      return (
        <Grid item xs={gridSize}>
          <Dropdown
            onFetchData={createVendNoDropdownCallback()}
            onSelect={(selectedItem) => {
              setDropdownValues((prev) => ({
                ...prev,
                vend_no: selectedItem?.vend_no || "",
                ac_send: "",
              }));
            }}
            select={dropdownValues.vend_no || extraProps.defaultValue || ""}
            table="AC_VEND_BASE"
            option={"ac_vend_base"}
            getControlLabel={getControlLabel}
            language={user?.language || "en"}
            field={getColumnLabel(fieldName, label)}
          />
          <input
            type="hidden"
            name={fieldName}
            value={dropdownValues.vend_no || extraProps.defaultValue || ""}
          />
        </Grid>
      );
    }
  if (fieldName === "ac_send") {
  return (
    <Grid item xs={gridSize}>
      <Dropdown
        onFetchData={createAcSendDropdownCallback()}
        onSelect={(selectedItem) => {
          setDropdownValues((prev) => ({
            ...prev,
            ac_send: selectedItem?.code_no || "", //  Set ac_send, không phải vend_no
          }));
        }}
        select={dropdownValues.ac_send || extraProps.defaultValue || ""} //  Dùng ac_send
        table="BASIC_DATA"
        option={"basic_data"}
        getControlLabel={getControlLabel}
        language={user?.language || "en"}
        field={getColumnLabel(fieldName, label)}
        disabled={!dropdownValues.vend_no} //  Disable nếu chưa chọn vend_no
        helperText={!dropdownValues.vend_no ? "Please select Vend No first" : ""}
      />
      <input
        type="hidden"
        name={fieldName}
        value={dropdownValues.ac_send || extraProps.defaultValue || ""} //  Dùng ac_send
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
              {getControlLabel("ttl_m_1_add", "Add Ac Vend Base")}
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
              {renderField("vend_no", "Vend No", 2.4)}
              {renderField("ac_send", "Ac Send")}
            </Grid>

            {/* Row 2 */}
            <Grid container spacing={2} mb={3}>
              <Grid item xs={2.4}>
                <TextField
                  select
                  sx={{ width: "150px" }}
                  label={getColumnLabel("is_default", "is_default")}
                  name="is_default"
                  defaultValue={"N"}
                >
                  <MenuItem value={"Y"}>Y</MenuItem>
                  <MenuItem value={"N"}>N</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={2.4}>
                <TextField
                  select
                  sx={{ width: "150px" }}
                  label={getColumnLabel("req_qc", "req_qc")}
                  name="req_qc"
                  defaultValue={"Y"}
                >
                  <MenuItem value={"Y"}>Y</MenuItem>
                  <MenuItem value={"N"}>N</MenuItem>
                </TextField>
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

export default AddAcVendBase;
