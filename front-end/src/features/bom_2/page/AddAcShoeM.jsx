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
import {
  fetchBasicDataByCate,
  fetchBasicDataDropDownByCate,
} from "../../../service/basic_data/basicDataService";
import Dropdown from "../../../component/dropdown/Dropdown";
import { fetchFieldDropdown } from "../../../service/rd_size_m/RdSizeM";

const AddAcShoeM = ({
  open,
  onClose,
  handleAdd,
  getControlLabel,
  getColumnLabel,
  user,
  auth,
  language,
}) => {
  const [dropdownData, setDropdownData] = useState({});
  const [dropdownValues, setDropdownValues] = useState({});
  const [loading, setLoading] = useState(true);

  const mapDropdown = {
    unit: 1108,
  };

  useEffect(() => {
    if (open) {
      fetchAllDropdowns();
    }
  }, [open]);

  useEffect(() => {
    if (!open) {
      setDropdownValues({});
    }
  }, [open]);

  const fetchAllDropdowns = async () => {
    try {
      const allow = Array.isArray(auth)
        ? auth.find((item) => item.field === "query_level")?.title
        : null;
      console.log("check allow", allow);
      setLoading(true);
      const promises = Object.entries(mapDropdown).map(
        async ([fieldName, categoryCode]) => {
          try {
            const response = await fetchBasicDataByCate(
              user?.factory,
              categoryCode,
              user?.department,
              user?.user_code,
              allow,
            );
            return { fieldName, data: response?.data || [] };
          } catch (error) {
            console.error(
              `Error fetching ${fieldName} (${categoryCode}):`,
              error,
            );
            return { fieldName, data: [] };
          }
        },
      );
      const results = await Promise.all(promises);
      const dataMap = {};
      results.forEach(({ fieldName, data }) => {
        dataMap[fieldName] = data;
      });
      setDropdownData(dataMap);
    } catch (error) {
      console.error("Error fetching dropdowns:", error);
    } finally {
      setLoading(false);
    }
  };
  const createDropdownCallback = (categoryCode) => {
    return async (page, pageSize, searchText) => {
      try {
        const allow = Array.isArray(auth)
          ? auth.find((item) => item.field === "query_level")?.title
          : "1";
        const result = await fetchBasicDataDropDownByCate(
          user?.factory,
          categoryCode,
          user?.department,
          user?.user_code,
          allow,
          page,
          pageSize,
          searchText,
          true,
          language
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
  const createSizeCallback = (categoryCode) => {
    return async (page, pageSize, searchText) => {
      try {
        const allow = Array.isArray(auth)
          ? auth.find((item) => item.field === "query_level")?.title
          : "1";
        const result = await fetchFieldDropdown(
          user?.factory,
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
  const renderField = (fieldName, label, gridSize = 3, extraProps = {}) => {
    const hasDropdown = mapDropdown.hasOwnProperty(fieldName);
    if (hasDropdown) {
      const categoryCode = mapDropdown[fieldName];
      return (
        <Grid item xs={gridSize} key={fieldName}>
          <Dropdown
            onFetchData={createDropdownCallback(categoryCode)}
            onSelect={(selectedItem) => {
              console.log(`Dropdown ${fieldName} selected:`, selectedItem);
              setDropdownValues((prev) => {
                const newValues = {
                  ...prev,
                  [fieldName]: selectedItem?.code_no || "",
                };
                console.log("Updated dropdown values:", newValues);
                return newValues;
              });
            }}
            select={dropdownValues[fieldName] || extraProps.defaultValue || ""}
            table="BASIC_DATA"
            option={"basic_data"}
            getControlLabel={getControlLabel}
            language={user?.language || "en"}
            field={getColumnLabel(fieldName, label)}
            totalItems={0}
            pageSize={10}
          />
          {/* Hidden input để form submit */}
          <input
            type="hidden"
            name={fieldName}
            value={dropdownValues[fieldName] || extraProps.defaultValue || ""}
          />
        </Grid>
      );
    }
    if (fieldName === "size_type") {
      const categoryCode = mapDropdown[fieldName];
      return (
        <Grid item xs={gridSize} key={fieldName}>
          <Dropdown
            onFetchData={createSizeCallback()}
            onSelect={(selectedItem) => {
              console.log(`Dropdown ${fieldName} selected:`, selectedItem);
              setDropdownValues((prev) => {
                const newValues = {
                  ...prev,
                  [fieldName]: selectedItem?.size_type || "",
                };
                console.log("Updated dropdown values:", newValues);
                return newValues;
              });
            }}
            select={dropdownValues[fieldName] || extraProps.defaultValue || ""}
            table="RD_SIZE_M"
            option={"size_type"}
            getControlLabel={getControlLabel}
            language={user?.language || "en"}
            field={getColumnLabel(fieldName, label)}
            totalItems={0}
            pageSize={10}
          />
          {/* Hidden input để form submit */}
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
              {getControlLabel("ttl_m_2_add", "Add Ac Shoe M")}
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
                  required
                />
              </Grid>
              <Grid item xs={3}>
                <TextField
                  fullWidth
                  label={getColumnLabel(
                    "customs_shoe_name_l",
                    "Custom shoe name L",
                  )}
                  name="customs_shoe_name_l"
                />
              </Grid>
              <Grid item xs={3}>
                <TextField
                  fullWidth
                  label={getColumnLabel(
                    "customs_shoe_name_e",
                    "Custom shoe name E",
                  )}
                  name="customs_shoe_name_e"
                />
              </Grid>
            </Grid>

            {/* Row 2 */}
            <Grid container spacing={2} mb={3}>
              <Grid item xs={3}>
                <TextField
                  fullWidth
                  label={getColumnLabel(
                    "customs_shoe_name_t",
                    "Custom shoe name T",
                  )}
                  name="customs_shoe_name_t"
                />
              </Grid>
              <Grid item xs={3}>
                <TextField
                  fullWidth
                  label={getColumnLabel("customs_tariff", "Custom Tariff")}
                  name="customs_tariff"
                />
              </Grid>
              {renderField("size_type", "Size Type", 2.4)}
              {renderField("unit", "Unit", 2.4)}
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

export default AddAcShoeM;
