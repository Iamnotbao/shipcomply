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
import {
  fetchBasicDataByCate,
  fetchBasicDataDropDownByCate,
} from "../../../service/basic_data/basicDataService";
import Dropdown from "../../../component/dropdown/Dropdown";
import { fetchFieldDropdown } from "../../../service/rd_size_m/RdSizeM";

const EditAcShoeM = ({
  open,
  onClose,
  acShoeM,
  handleEdit,
  getControlLabel,
  getColumnLabel,
  user,
  auth,
  language,
}) => {
  const { register, handleSubmit, reset, watch, setValue } = useForm({
    defaultValues: { ...acShoeM },
  });
  const [dropdownData, setDropdownData] = useState({});
  const [dropdownValues, setDropdownValues] = useState({});
  const [loading, setLoading] = useState(true);

  const mapDropdown = {
    unit: 1108,
  };


useEffect(() => {
  if (open && acShoeM) {
    const statusText = getStatusText(acShoeM.status);
    reset({ ...acShoeM, statusText });

    const initialDropdownValues = {};
    Object.keys(mapDropdown).forEach((fieldName) => {
      if (acShoeM[fieldName]) {
        initialDropdownValues[fieldName] = acShoeM[fieldName];
      }
    });
    if (acShoeM.size_type) {
      initialDropdownValues.size_type = acShoeM.size_type;
    }
    setDropdownValues(initialDropdownValues);
  }
}, [open, acShoeM, reset]);

  const fetchAllDropdowns = async () => {
    try {
      const allow = Array.isArray(auth)
        ? auth.find((item) => item.field === "query_level")?.title
        : null;

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
            console.error(`Error fetching ${fieldName}:`, error);
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
  const createSizeCallback = () => {
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
        console.error(`Error fetching dropdown:`, error);
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
    };
    handleEdit(finalData);
  };
  const renderField = (fieldName, label, gridSize = 2.4, extraProps = {}) => {
    const hasDropdown = mapDropdown.hasOwnProperty(fieldName);
    const dropdownOptions = dropdownData[fieldName] || [];
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
              {getControlLabel("ttl_m_2_edit", "Edit Ac Shoe M Information")}
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
                  label={getColumnLabel("customs_shoe_id", "Custom Shoe ID")}
                  {...register("customs_shoe_id")}
                  disabled
                />
              </Grid>
            </Grid>
            <Grid container spacing={2} mb={3}>
              <Grid item xs={2.4}>
                <TextField
                  fullWidth
                  label={getColumnLabel(
                    "customs_shoe_name_l",
                    "Custom Shoe Name L",
                  )}
                  {...register("customs_shoe_name_l")}
                />
              </Grid>
              <Grid item xs={2.4}>
                <TextField
                  fullWidth
                  label={getColumnLabel(
                    "customs_shoe_name_e",
                    "Custom Shoe Name E",
                  )}
                  {...register("customs_shoe_name_e")}
                />
              </Grid>
              <Grid item xs={2.4}>
                <TextField
                  fullWidth
                  label={getColumnLabel(
                    "customs_shoe_name_t",
                    "Custom Shoe Name T",
                  )}
                  {...register("customs_shoe_name_t")}
                />
              </Grid>
              <Grid item xs={2.4}>
                <TextField
                  fullWidth
                  label={getColumnLabel("customs_tariff", "Custom Tariff")}
                  {...register("customs_tariff")}
                />
              </Grid>
            </Grid>

            {/* Row 2 */}
            <Grid container spacing={2} mb={3}>
              {renderField("size_type", "Size Type")}
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

export default EditAcShoeM;
