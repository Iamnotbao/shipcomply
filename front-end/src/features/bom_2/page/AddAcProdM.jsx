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
import { getAcShoeMBySize } from "../../../service/ac_shoe_m/AcShoeMService";
import {
  fetchRSDByID,
  fetchRSDBySize,
  fetchRSDBySizeDropdown,
} from "../../../service/rd_size_d/RdSizeDService";

const AddAcProdM = ({
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
  const [displayValues, setDisplayValues] = useState({});
  const [loading, setLoading] = useState(true);

  const mapDropdown = {
    start_size: "size_type",
    s_seq: "size_type",
    end_size: "size_type",
    e_seq: "size_type",
  };

  // useEffect(() => {
  //   if (open) {
  //     fetchAllDropdowns();
  //   }
  // }, [open]);

  useEffect(() => {
    if (!open) {
      setDropdownValues({});
      setDisplayValues({});
    }
  }, [open]);

  const fetchAllDropdowns = async () => {
    try {
      const allow = Array.isArray(auth)
        ? auth.find((item) => item.field === "query_level")?.title
        : null;
      console.log("check allow", allow);
      setLoading(true);
      const response = await fetchRSDBySize(
        selectRows[0]?.factory_code,
        selectRows[0]?.size_type,
        user.department,
        user.user_code,
        allow
      );

      // Set same data for all dropdown fields
      const dataMap = {};
      Object.keys(mapDropdown).forEach((fieldName) => {
        dataMap[fieldName] = response?.data || [];
      });

      console.log("📦 All dropdown data:", dataMap);
      setDropdownData(dataMap);
    } catch (error) {
      console.error("Error fetching dropdowns:", error);
    } finally {
      setLoading(false);
    }
  };
  const handleSizeSelect = async (selectedItem, fieldSize, fileSubSize) => {
    const sizeNo = selectedItem?.size_no || "";
    const sizeSeq = selectedItem?.size_seq || "";
    await handleSizeSeqSelect(
      selectedItem,
      fieldSize,
      fileSubSize,
      sizeNo,
      sizeSeq
    );
  };
  const handleSizeSeqSelect = async (
    selectedItem,
    fieldSize,
    fileSubSize,
    sizeNo,
  ) => {
    const response = await fetchRSDByID(
      selectedItem?.factory_code,
      selectedItem?.size_type,
      sizeNo
    );
    
    setDropdownValues((prev) => ({
      ...prev,
      [fieldSize]: sizeNo,
      [fileSubSize]: response?.data?.size_seq || "",
    }));
  };
   const createDropdownCallback = () => {
      return async (page, pageSize, searchText) => {
        try {
          const allow = Array.isArray(auth)
            ? auth.find((item) => item.field === "query_level")?.title
            : "1";
          const result = await fetchRSDBySizeDropdown(
            user?.factory,
            selectRows[0]?.size_type,
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
          return {
            data: [],
            total: 0,
            pageSize: pageSize,
          };
        }
      };
    };
  const handleDecimalInput =
    (decimals = 8) =>
    (e) => {
      e.target.value = e.target.value.replace(
        new RegExp(`(\\.\\d{${decimals}})\\d+`),
        "$1",
      );
    };
  const renderField = (fieldName, label, gridSize = 3, extraProps = {},type="text") => {
    const hasDropdown = mapDropdown.hasOwnProperty(fieldName);
    const dropdownOptions = dropdownData[fieldName] || [];
    const subFieldName = fieldName === "start_size" ? "s_seq" : "e_seq";
    if (
      hasDropdown &&
      (fieldName === "start_size" || fieldName === "end_size")
    ) {
      return (
        <Grid item xs={gridSize} key={fieldName}>
          <Dropdown
            onFetchData={createDropdownCallback()}
            onSelect={(selectedItem) => {
              handleSizeSelect(selectedItem, fieldName, subFieldName);
            }}
            select={dropdownValues[fieldName] || extraProps.defaultValue || ""}
            table="AC_SHOE_M"
            option={"ac_shoe_m"}
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
    if (fieldName === "e_seq" || fieldName === "s_seq") {
      return (
        <Grid item xs={gridSize}>
          <TextField
            fullWidth
            label={getColumnLabel(fieldName, label)}
            name={fieldName}
            value={dropdownValues[fieldName] || ""}
            readOnly
            inputProps={{
              readOnly: true,
            }}
            placeholder="Auto-filled when selecting size_seq"
          />
          <input
            type="hidden"
            name={fieldName}
            value={dropdownValues[fieldName] || ""}
          />
        </Grid>
      );
    }
   return (
      <Grid item xs={gridSize} key={fieldName}>
        <TextField
          fullWidth
          InputLabelProps={{ shrink: true }}
          label={getColumnLabel(fieldName, label)}
          name={fieldName}
          type={type}
          inputProps={
            type === "number"
              ? {
                  step: "0.00000001",
                  min: 0,
                  onInput: handleDecimalInput(8),
                  ...extraProps.inputProps,
                }
              : extraProps.inputProps
          }
          {...extraProps}
        />
      </Grid>
    );
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xl" fullWidth>
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
              {getControlLabel("ttl_d_2_add_1", "Add Ac Prod M Information")}
            </Typography>
            <Button onClick={onClose} variant="contained" color="error">
              <CloseIcon />
            </Button>
          </Box>

          <Box component="form" onSubmit={handleAdd}>
            {/* Row 1 */}
            <Grid container spacing={2} mb={3}>
              <Grid item xs={3}>
                <TextField
                  fullWidth
                  label={getColumnLabel("factory_code", "Factory Code")}
                  name="factory_code"
                  value={user?.factory}
                  disabled
                />
              </Grid>
              <Grid item xs={3}>
                <TextField
                  fullWidth
                  label={getColumnLabel("customs_shoe_id", "Custom shoe id")}
                  name="customs_shoe_id"
                  value={selectRows?.[0]?.customs_shoe_id}
                  disabled
                />
              </Grid>
              <Grid item xs={3}>
                <TextField
                  fullWidth
                  label={getColumnLabel("prod_acno", "Prod Acno")}
                  name="prod_acno"
                  required
                />
              </Grid>
              <Grid item xs={3}>
                {renderField(
                  "pt_per",
                  "Grading Ratio",
                  6,
                  {
                    inputProps: {
                      step: "0.01",
                      min: 0,
                      onInput: handleDecimalInput(2),
                    },
                  },
                  "number",
                )}
              </Grid>
            </Grid>

            {/* Row 2 */}
            <Grid container spacing={2} mb={3}>
              {renderField("start_size", "Start Size", 3)}
              {renderField("s_seq", "S Seq", 3)}
              {renderField("end_size", "End Size", 3)}
              {renderField("e_seq", "E Seq", 3)}
            </Grid>

            {/* Row 3 */}
            <Grid container spacing={2} mb={3}>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label={getColumnLabel("note", "Note")}
                  name="note"
                  multiline
                  rows={2}
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

export default AddAcProdM;
