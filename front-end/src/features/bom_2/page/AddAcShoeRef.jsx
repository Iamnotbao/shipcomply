import { useEffect, useState, useRef } from "react";
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
  CircularProgress,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { fetchBasicDataByCate } from "../../../service/basic_data/basicDataService";
import Dropdown from "../../../component/dropdown/Dropdown";
import { 
  fetchAllViewProdNo,
  fetchAllNoneViewAcShoeRef
} from "../../../service/ac_shoe_ref/AcShoeRefService";

const AddAcShoeRef = ({
  open,
  onClose,
  handleAdd,
  getControlLabel,
  getColumnLabel,
  user,
  auth,
  selectRows,
}) => {
  const [dropdownData, setDropdownData] = useState({});
  const [dropdownValues, setDropdownValues] = useState({});
  
  // States cho duplicate check
  const [prodNoError, setProdNoError] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [duplicateValue, setDuplicateValue] = useState("");

  const debounceTimer = useRef(null);
  const latestRequestId = useRef(0);
  const abortControllerRef = useRef(null);

  const mapDropdown = {
    prod_no: 1001,
    prod_unit: 1108,
  };

  // Function check duplicate prod_no
  const checkDuplicateProdNo = async (value, customsShoeId) => {
    if (!value || value.trim() === "") {
      setProdNoError("");
      setIsChecking(false);
      setDuplicateValue("");
      return true;
    }

    latestRequestId.current += 1;
    const currentRequestId = latestRequestId.current;

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    try {
      setIsChecking(true);
      console.log("check value",value);
      
      const response = await fetchAllNoneViewAcShoeRef(
        value,
        {
          signal: abortControllerRef.current.signal,
        }
      );

      if (currentRequestId !== latestRequestId.current) {
        console.log("Ignoring outdated request for:", value);
        return null;
      }

      // Kiểm tra nếu có data trả về (array)
      if (response && response.data && Array.isArray(response.data) && response.data.length > 0) {
        
        const activeRecords = response.data.filter(record => {
          const shoeStatus = record.ACSHOEM?.status; 
          return shoeStatus !== 0;
        });
        
        if (activeRecords.length === 0) {
          setProdNoError("");
          setIsChecking(false);
          setDuplicateValue("");
          return true;
        }
        const activeList = activeRecords.map(record => {
          const shoeStatus = record.ACSHOEM?.status;
          const statusText = 
            shoeStatus === 1 ? "New" :
            shoeStatus === 7 ? "Confirm" :
            shoeStatus === 0 ? "Cancel" :
            `Status ${shoeStatus}`;
          return `${record.customs_shoe_id} (${statusText})`;
        }).join(", ");
        
        setProdNoError(
          getControlLabel(
            "err_duplicate_active_prod",
            `Prod No "${value}" already exists in active records: ${activeList}. Only closed records can be duplicated.`
          )
        );
        setIsChecking(false);
        setDuplicateValue(value);
        return false;
      } else {
        setProdNoError("");
        setIsChecking(false);
        setDuplicateValue("");
        return true;
      }
    } catch (error) {
      if (error.name === "AbortError") {
        console.log("Request aborted for:", value);
        return null;
      }

      if (currentRequestId === latestRequestId.current) {
        console.error("Error checking duplicate:", error);
        setProdNoError("");
        setIsChecking(false);
      }
      return true;
    }
  };

  useEffect(() => {
    if (open) {
      fetchAllDropdowns();
    }
  }, [open]);

  useEffect(() => {
    if (!open) {
      setDropdownValues({});
      setProdNoError("");
      setIsChecking(false);
      setDuplicateValue("");
      latestRequestId.current = 0;

      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    }
  }, [open]);

  const fetchAllDropdowns = async () => {
    try {
      const allow = Array.isArray(auth)
        ? auth.find((item) => item.field === "query_level")?.title
        : null;
      const apiFetchers = {
        prod_no: async () => {
          const response = await fetchAllViewProdNo(
            user?.factory,
            user?.department,
            user?.user_code,
            allow
          );
          return response?.data?.rows || [];
        },
      };

      const promises = Object.entries(mapDropdown).map(
        async ([fieldName, categoryCode]) => {
          try {
            const fetcher = apiFetchers[fieldName];
            const data = fetcher ? await fetcher(categoryCode) : [];

            console.log(`return ${fieldName}:`, data);

            return { fieldName, data };
          } catch (error) {
            console.error(
              `Error fetching ${fieldName} (${categoryCode}):`,
              error
            );
            return { fieldName, data: [] };
          }
        }
      );
      const results = await Promise.all(promises);
      const dataMap = {};
      results.forEach(({ fieldName, data }) => {
        dataMap[fieldName] = data;
      });
      setDropdownData(dataMap);
    } catch (error) {
      console.error("Error fetching dropdowns:", error);
    } 
  };

  // Handle khi select prod_no từ dropdown
  const handleProdNoSelect = async (selectedItem) => {
    console.log("Selected item:", selectedItem);
    const prodNo = selectedItem?.prod_no || "";
    
    setDropdownValues((prev) => ({
      ...prev,
      prod_no: prodNo,
      prod_unit: selectedItem?.unit || "",
    }));

    // Clear error khi đang chọn
    if (prodNoError) {
      setProdNoError("");
    }

    // Debounce check duplicate
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    if (!prodNo || prodNo.trim() === "") {
      setIsChecking(false);
      setProdNoError("");
      setDuplicateValue("");
      return;
    }

    setIsChecking(true);
    debounceTimer.current = setTimeout(() => {
      checkDuplicateProdNo(prodNo, selectRows[0]?.customs_shoe_id);
    }, 500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // Validate prod_no trước khi submit
    const isValid = await checkDuplicateProdNo(
      dropdownValues.prod_no, 
      selectRows[0]?.customs_shoe_id
    );
    
    if (isValid === false) {
      return;
    }

    if (isChecking) {
      return;
    }

    handleAdd(e);
  };

  const shouldDisableOtherFields =
    duplicateValue !== "" && dropdownValues.prod_no === duplicateValue;

  const renderField = (fieldName, label, gridSize = 2.4, extraProps = {}) => {
    const hasDropdown = mapDropdown.hasOwnProperty(fieldName);
    
    if (hasDropdown && fieldName === "prod_no") {
      return (
        <Grid item xs={gridSize}>
          <Dropdown
            onFetchData={fetchAllViewProdNo}
            onSelect={handleProdNoSelect}
            select={dropdownValues.prod_no || extraProps.defaultValue || ""}
            table="AC_SHOE_REF"
            option={"ac_shoe_ref"}
            getControlLabel={getControlLabel}
            language={user?.language || "en"}
            field={getColumnLabel(fieldName, label)}
            error={!!prodNoError}
            helperText={prodNoError}
          />
          {isChecking && (
            <Box display="flex" alignItems="center" mt={1}>
              <CircularProgress size={16} sx={{ mr: 1 }} />
              <Typography variant="caption">
                {getControlLabel("txt_checking", "Checking...")}
              </Typography>
            </Box>
          )}
          {prodNoError && (
            <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
              {prodNoError}
            </Typography>
          )}
          <input
            type="hidden"
            name="prod_no"
            value={dropdownValues.prod_no || ""}
          />
        </Grid>
      );
    }
    
    if (fieldName === "prod_unit") {
      return (
        <Grid item xs={gridSize}>
          <TextField
            fullWidth
            label={getColumnLabel(fieldName, label)}
            name={fieldName}
            value={dropdownValues.prod_unit || ""}
            readOnly
            inputProps={{
              readOnly: true,
            }}
            placeholder="Auto-filled when selecting prod_no"
            disabled={shouldDisableOtherFields}
          />
          <input
            type="hidden"
            name="prod_unit"
            value={dropdownValues.prod_unit || ""}
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
          disabled={shouldDisableOtherFields}
          {...extraProps}
        />
      </Grid>
    );
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg">
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
              {getControlLabel("ttl_d_2_add_2", "Add Ac Shoe Ref Information")}
            </Typography>
            <Button onClick={onClose} variant="contained" color="error">
              <CloseIcon />
            </Button>
          </Box>

          <Box component="form" onSubmit={handleSubmit}>
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
              <Grid item xs={2.4}>
                <TextField
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                  label={getColumnLabel("customs_shoe_id", "Custom shoe id")}
                  name="customs_shoe_id"
                  value={selectRows[0]?.customs_shoe_id}
                  disabled
                />
              </Grid>
            </Grid>
            <Grid container spacing={2} mb={3}>
              {renderField("prod_no", "Prod No", 2.4)}
              {renderField("prod_unit", "Prod Unit", 2.4)}
            </Grid>
            {/* Row 2 */}
            <Grid container spacing={2} mb={3}>
              <Grid item xs={2.4}>
                <TextField
                  select
                  sx={{ width: "150px" }}
                  label={getColumnLabel("is_valid", "is_valid")}
                  name="is_valid"
                  defaultValue={"Y"}
                  disabled={shouldDisableOtherFields}
                >
                  <MenuItem value={"Y"}>Y</MenuItem>
                  <MenuItem value={"N"}>N</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={2.4}>
                <TextField
                  fullWidth
                  label={getColumnLabel("valid_date", "Valid Date")}
                  name="valid_date"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  disabled={shouldDisableOtherFields}
                />
              </Grid>
              <Grid item xs={2.4}>
                <TextField
                  fullWidth
                  label={getColumnLabel("unval_date", "Unval Date")}
                  name="unval_date"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  disabled={shouldDisableOtherFields}
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
                disabled={!!prodNoError || isChecking || shouldDisableOtherFields}
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

export default AddAcShoeRef;