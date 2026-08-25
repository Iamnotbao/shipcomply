import { useEffect, useState } from "react";
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
import CloseIcon from "@mui/icons-material/Close";
import Dropdown from "../../../component/dropdown/Dropdown";
import {
  fetchAllAcNo,
  fetchAllInvoiceNo,
  getReqNo,
} from "../../../service/ac_req_m/AcReqMService";
import { fetchAllVendNoByStatus } from "../../../service/ac_vend_base/AcVendBaseService";

const AddAcReqMPage = ({
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

  const formatDate = () => {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");

    const yymmdd = `${year}${month}${day}`;
    return yymmdd;
  };

  const fetchReqNo = async () => {
    const datetime = formatDate();
    const response = await getReqNo(
      user?.factory,
      datetime,
      user?.factory_abbreviation,
      user?.department,
      user?.user_code,
      user?.query_level
    );
    if (response && response.success) {
      setDropdownValues((prev) => ({
        ...prev,
        req_no: response?.data || "",
      }));
    }
  };

  useEffect(() => {
    if (open) {
      fetchReqNo();
    } else {
      setDropdownValues({});
    }
  }, [open]);

  // CreateDropdownCallback cho invoice_no
  const createInvoiceDropdownCallback = () => {
    return async (page, pageSize, searchText) => {
      try {
        const allow = Array.isArray(auth)
          ? auth.find((item) => item.field === "query_level")?.title
          : "1";
        
        const result = await fetchAllInvoiceNo(
          user?.factory,
          user?.department,
          user?.user_code,
          allow,
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
        console.error("Error fetching invoice dropdown:", error);
        return {
          data: [],
          total: 0,
          pageSize: pageSize,
        };
      }
    };
  };

  // CreateDropdownCallback cho ac_no
  const createAcNoDropdownCallback = () => {
    return async (page, pageSize, searchText) => {
      try {
        const allow = Array.isArray(auth)
          ? auth.find((item) => item.field === "query_level")?.title
          : "1";
        
        // Chỉ fetch khi có invoice_no
        if (!dropdownValues.invoice_no) {
          return {
            data: [],
            total: 0,
            pageSize: pageSize,
          };
        }
        
        const result = await fetchAllAcNo(
          user?.factory,
          dropdownValues.invoice_no,
          user?.department,
          user?.user_code,
          allow,
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
        console.error("Error fetching ac_no dropdown:", error);
        return {
          data: [],
          total: 0,
          pageSize: pageSize,
        };
      }
    };
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
  const renderField = (fieldName, label, gridSize = 2.4, extraProps = {}) => {
    if (fieldName === "invoice_no") {
      return (
        <Grid item xs={gridSize}>
          <Dropdown
            onFetchData={createInvoiceDropdownCallback()}
            onSelect={(selectedItem) => {
              setDropdownValues((prev) => ({
                ...prev,
                invoice_no: selectedItem?.invoice_no || "",
                ac_no: "", // Reset ac_no khi đổi invoice
              }));
            }}
            select={dropdownValues.invoice_no || extraProps.defaultValue || ""}
            table="AC_REQ_M_3"
            option={"ac_req_m"}
            getControlLabel={getControlLabel}
            language={user?.language || "en"}
            field={getColumnLabel(fieldName, label)}
            totalItems={0}
            pageSize={10}
            headerField="invoice_no"
          />
          <input
            type="hidden"
            name={fieldName}
            value={dropdownValues.invoice_no || extraProps.defaultValue || ""}
          />
          <input
            type="hidden"
            name="req_no"
            value={dropdownValues.req_no || ""}
          />
        </Grid>
      );
    }

    if (fieldName === "ac_no") {
      return (
        <Grid item xs={gridSize}>
          <Dropdown
            onFetchData={createAcNoDropdownCallback()}
            onSelect={(selectedItem) => {
              setDropdownValues((prev) => ({
                ...prev,
                ac_no: selectedItem?.ac_no || "",
              }));
            }}
            select={dropdownValues.ac_no || extraProps.defaultValue || ""}
            table="AC_REQ_M_2"
            option={"ac_req_m"}
            getControlLabel={getControlLabel}
            language={user?.language || "en"}
            field={getColumnLabel(fieldName, label)}
            totalItems={0}
            pageSize={10}
            key={dropdownValues.invoice_no} // Re-render khi invoice thay đổi
          />
          <input
            type="hidden"
            name={fieldName}
            value={dropdownValues.ac_no || extraProps.defaultValue || ""}
          />
        </Grid>
      );
    }
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
              {getControlLabel("ttl_m_2_add", "Add Ac Req M Information")}
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
            </Grid>
            <Grid container spacing={2} mb={3}>
              <Grid item xs={2.4}>
                <TextField
                  fullWidth
                  label={getColumnLabel("req_date", "Req Date")}
                  name="req_date"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  required
                />
              </Grid>
              {renderField("invoice_no", "Invoice No")}
              {renderField("ac_no", "Ac No")}
              {renderField("vend_no", "Vend no")}
            </Grid>
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

export default AddAcReqMPage;