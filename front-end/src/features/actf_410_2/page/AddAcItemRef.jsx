import {
  Box,
  Button,
  Dialog,
  DialogContent,
  Grid,
  Paper,
  TextField,
  Typography,
  CircularProgress,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useEffect, useState, useRef } from "react";
import {
  fetchItemNoMMItems,
  fetchMMItemsByID,
} from "../../../service/mm_item/MmItemService";
import Dropdown from "../../../component/dropdown/Dropdown";
import { fetchListAcItemRefByItemNo } from "../../../service/ac_item_ref/AcItemRefService";

const AddAcItemRef = ({
  open,
  handleClose,
  handleAdd,
  getControlLabel,
  getColumnLabel,
  user,
  selectRows,
  auth,
}) => {
  const [dropdownData, setDropdownData] = useState({});
  const [dropdownValues, setDropdownValues] = useState({});
  const [itemNo, setItemNo] = useState("");
  const [itemNoError, setItemNoError] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [duplicateValue, setDuplicateValue] = useState("");
  const debounceTimer = useRef(null);
  const latestRequestId = useRef(0);
  const abortControllerRef = useRef(null);

  console.log("dropdown", dropdownValues);

const checkDuplicateItemNo = async (value) => {
  if (!value || value.trim() === "") {
    setItemNoError("");
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

    const response = await fetchListAcItemRefByItemNo(value, {
      signal: abortControllerRef.current.signal,
    });

    if (currentRequestId !== latestRequestId.current) {
      console.log("Ignoring outdated request for:", value);
      return null;
    }

    if (
      response &&
      response.data &&
      Array.isArray(response.data) &&
      response.data.length > 0
    ) {
       console.log("cmm bug cai dmm ak ",response);
      //  Lọc các records có status KHÁC 9 (không phải Closed)
      const nonClosedRecords = response.data.filter((record) => {
        if (!record.ITEM_ACNO) {
          // Nếu không có ITEM_ACNO → coi như invalid, không cho duplicate
          return true;
        }
        
        const itemAcnoStatus = record.ITEM_ACNO.status;
        console.log("cmm bug cai dmm ak ",itemAcnoStatus);
        
        // Nếu status undefined/null → không cho duplicate
        if (itemAcnoStatus === undefined || itemAcnoStatus === null) {
          return true;
        }
        
        // Chỉ lấy những records có status KHÁC 9
        return itemAcnoStatus !== 9;
      });

      //  Nếu CÓ BẤT KỲ record nào status KHÁC 9 → CẤM
      if (nonClosedRecords.length > 0) {
        const getStatusText = (status) => {
          if (status === undefined || status === null) {
            return "Unknown Status";
          }
          switch (status) {
            case 0:
              return "Cancelled";
            case 1:
              return "New";
            case 2:
              return "Checked";
            case 7:
              return "Confirmed";
            default:
              return `Status ${status}`;
          }
        };

        const activeList = nonClosedRecords
          .map((record) => {
            const itemAcnoStatus = record.ITEM_ACNO?.status;
            return `${record.item_acno} (${getStatusText(itemAcnoStatus)})`;
          })
          .join(", ");

        setItemNoError(
          getControlLabel(
            "err_duplicate_active_item",
            `Item "${value}" already exists: ${activeList}\nOnly closed items can be duplicated.`
          )
        );
        setIsChecking(false);
        setDuplicateValue(value);
        return false;
      }

      //  Nếu TẤT CẢ status = 9 (Closed) → CHO PHÉP
      setItemNoError("");
      setIsChecking(false);
      setDuplicateValue("");
      
      // Auto-fill unit từ record đầu tiên
      if (response.data[0]) {
        setDropdownValues((prev) => ({
          ...prev,
          item_unit: response.data[0].item_unit || "",
        }));
      }
      return true;
      
    } else if (
      response?.data &&
      typeof response.data === "object" &&
      !Array.isArray(response.data)
    ) {
      // Single object - check status
      const status = response.data.ITEM_ACNO?.status;
      
      if (status !== 9) {
        setItemNoError(
          getControlLabel(
            "err_duplicate_active_item",
            `Item "${value}" already exists with status ${status}\nOnly closed items can be duplicated.`
          )
        );
        setIsChecking(false);
        setDuplicateValue(value);
        return false;
      }
      
      setItemNoError("");
      setIsChecking(false);
      setDuplicateValue("");
      setDropdownValues((prev) => ({
        ...prev,
        item_unit: response.data.unit || "",
      }));
      return true;
    } else {
      // Item chưa tồn tại → CHO PHÉP
      const fetchItem = await fetchMMItemsByID(value);
      setItemNoError("");
      setIsChecking(false);
      setDuplicateValue("");
      setDropdownValues((prev) => ({
        ...prev,
        item_unit: fetchItem?.data?.unit || "",
      }));
      return true;
    }
  } catch (error) {
    if (error.name === "AbortError") {
      console.log("Request aborted for:", value);
      return null;
    }

    if (currentRequestId === latestRequestId.current) {
      console.error("Error checking duplicate:", error);
      setItemNoError("");
      setIsChecking(false);
    }
    return true;
  }
};

  const fetchAllDropdowns = async () => {
    try {
      const response = await fetchItemNoMMItems();
      console.log("ccheck all the result", response);
      setDropdownData({ ...dropdownData, item_no: response.data || [] });
    } catch (error) {
      console.error("Error fetching dropdowns:", error);
    }
  };
  const handleItemNoSelect = async (selectedItem) => {
    console.log("Selected item:", selectedItem);
    const itemNo = selectedItem?.item_no || "";

    setDropdownValues((prev) => ({
      ...prev,
      item_no: itemNo,
      item_unit: selectedItem?.unit || "",
    }));

    setItemNo(itemNo);

    // Clear error khi đang chọn
    if (itemNoError) {
      setItemNoError("");
    }

    // Debounce check duplicate
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    if (!itemNo || itemNo.trim() === "") {
      setIsChecking(false);
      setItemNoError("");
      setDuplicateValue("");
      return;
    }

    setIsChecking(true);

    debounceTimer.current = setTimeout(async () => {
      await checkDuplicateItemNo(itemNo);
    }, 500);
  };
  const handleItemNoBlur = async (e) => {
    const value = e.target.value;
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    if (value && value.trim() !== "") {
      await checkDuplicateItemNo(value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    const isValid = await checkDuplicateItemNo(itemNo);
    if (isValid === false) {
      return;
    }

    if (isChecking) {
      return;
    }

    handleAdd(e);
  };

  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);
  useEffect(() => {
    if (open) {
      fetchAllDropdowns();
    }
  }, [open]);
  useEffect(() => {
    if (!open) {
      setItemNo("");
      setItemNoError("");
      setIsChecking(false);
      setDuplicateValue("");
      setDropdownData([]);
      setDropdownValues({});
      latestRequestId.current = 0;

      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    }
  }, [open]);

  const renderField = (fieldName, label, gridSize = 2.4, extraProps = {}) => {
    const dropdownOptions = dropdownData[fieldName] || [];
    if (fieldName === "item_no") {
      return (
        <Grid item xs={gridSize}>
          <Dropdown
            onFetchData={fetchItemNoMMItems}
            onSelect={handleItemNoSelect}
            select={dropdownValues.item_no || extraProps.defaultValue || ""}
            table="MM_ITEM"
            option={"mm_item"}
            getControlLabel={getControlLabel}
            language={user?.language || "en"}
            field={getColumnLabel(fieldName, label)}
            error={!!itemNoError}
            helperText={itemNoError}
            enableApiSearch={false}
          />
          {isChecking && (
            <Box display="flex" alignItems="center" mt={1}>
              <CircularProgress size={16} sx={{ mr: 1 }} />
              <Typography variant="caption">
                {getControlLabel("txt_checking", "Checking...")}
              </Typography>
            </Box>
          )}
          {itemNoError && (
            <Typography
              variant="caption"
              color="error"
              sx={{
                mt: 0.5,
                display: "block",
                wordWrap: "break-word",
                whiteSpace: "normal",
                wordBreak: "break-word", 
              }}
            >
              {itemNoError}
            </Typography>
          )}
          <input
            type="hidden"
            name="item_no"
            value={dropdownValues.item_no || ""}
          />
        </Grid>
      );
    }
    if (fieldName === "item_unit") {
      return (
        <Grid item xs={gridSize}>
          <TextField
            fullWidth
            label={getColumnLabel(fieldName, label)}
            name={fieldName}
            value={dropdownValues.item_unit || ""}
            readOnly
            inputProps={{
              readOnly: true,
            }}
            placeholder="Auto-filled when selecting item_unit"
            disabled={shouldDisableOtherFields}
          />
          <input
            type="hidden"
            name="item_unit"
            value={dropdownValues.item_unit || ""}
          />
        </Grid>
      );
    }
  };
  const shouldDisableOtherFields =
    duplicateValue !== "" && itemNo === duplicateValue;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="lg" fullWidth>
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
              flex={1}
              mb={"0"}
            >
              {getControlLabel("ttl_d_1_add", "Add Ac Item RefInformation")}
            </Typography>
            <Button onClick={handleClose} variant="contained" color="error">
              <CloseIcon />
            </Button>
          </Box>
          <Box component="form" onSubmit={handleSubmit}>
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
                  "ftxt_d_fac_dept",
                  "Factory and Department Information"
                )}
              </legend>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    type="text"
                    fullWidth
                    label={getControlLabel("txt_factory_code", "factory_code")}
                    name="factory_code"
                    value={user?.factory}
                    InputLabelProps={{ shrink: true }}
                    disabled
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    type="text"
                    fullWidth
                    label={getControlLabel(
                      "txt_department_code",
                      "department_code"
                    )}
                    name="department_code"
                    value={user?.department}
                    InputLabelProps={{ shrink: true }}
                    disabled
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    type="text"
                    fullWidth
                    label={getControlLabel("txt_item_acno", "item_acno")}
                    name="item_acno"
                    value={selectRows?.item_acno}
                    InputLabelProps={{ shrink: true }}
                    disabled
                  />
                </Grid>
              </Grid>
            </fieldset>
            <Box mt={4}>
              <Grid container spacing={2}>
                {renderField("item_no", "Item No", 6)}
                {renderField("item_unit", "Item Unit", 6)}
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label={getColumnLabel("formula", "formula")}
                    name="formula"
                    type="number"
                    inputProps={{ min: 0 }}
                    disabled={shouldDisableOtherFields}
                  />
                </Grid>
              </Grid>
            </Box>
            <Box mt={4}>
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

export default AddAcItemRef;
