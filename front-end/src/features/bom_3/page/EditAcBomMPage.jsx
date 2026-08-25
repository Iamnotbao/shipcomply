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
import { toast, ToastContainer } from "react-toastify";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import CloseIcon from "@mui/icons-material/Close";
import { fetchBasicDataByCate } from "../../../service/basic_data/basicDataService";
import Dropdown from "../../../component/dropdown/Dropdown";
import { fetchFieldDropdown } from "../../../service/ac_item_m/AcItemMService";

const EditAcBomMPage = ({
  open,
  onClose,
  acImp,
  handleEdit,
  getControlLabel,
  getColumnLabel,
  user,
  auth,
  language, // cần được truyền từ component cha
}) => {
  const { register, handleSubmit, reset, watch, setValue, control } = useForm({
    defaultValues: { ...acImp },
  });
  const [dropdownData, setDropdownData] = useState({});
  const [dropdownValues, setDropdownValues] = useState({});
  const [loading, setLoading] = useState(true);

  const mapDropdown = {
    ac_type: "CDC",
  };

  useEffect(() => {
    if (open) {
      fetchAllDropdowns();
    } else {
      setDropdownValues({});
      setDropdownData({});
    }
  }, [open]);

  useEffect(() => {
    if (acImp) {
      const statusText = getStatusText(acImp.status);
      reset({
        ...acImp,
        statusText: statusText,
      });

      // Set dropdown values (bao gồm chuỗi hiển thị cho item_acno + ac_type)
      setDropdownValues({
        ac_item: acImp.ac_item
          ? `${acImp.ac_item || ""}-${acImp.item_acno || ""}-${acImp.itemnm || ""}`
          : "",
        item_acno: acImp.item_acno || "",
        ac_type: acImp.ac_type || "",
      });
    }
  }, [acImp, reset]);

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
              allow
            );
            return { fieldName, data: response?.data || [] };
          } catch (error) {
            console.error(`Error fetching ${fieldName}:`, error);
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
    } finally {
      setLoading(false);
    }
  };

  const createItemAcnoCallback = () => {
    return async (page, pageSize, searchText) => {
      try {
        const allow =
          auth?.find((item) => item.field === "query_level")?.title || "1";
        const result = await fetchFieldDropdown(
          user?.factory,
          user?.department,
          user?.user_code,
          allow,
          language,
          null,
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
        console.error("Error fetching ac_item:", error);
        return { data: [], total: 0, pageSize };
      }
    };
  };
useEffect(() => {
  if (acImp) {
    const statusText = getStatusText(acImp.status);
    reset({
      ...acImp,
      statusText: statusText,
    });

    if (acImp.item_acno) {
      fetchItemAcnoDetail(acImp.item_acno);
    } else {
      setDropdownValues((prev) => ({ ...prev, ac_item: "", item_acno: "" }));
    }
  }
}, [acImp, reset]);

const fetchItemAcnoDetail = async (item_acno) => {
  try {
    const allow =
      auth?.find((item) => item.field === "query_level")?.title || "1";
    const result = await fetchFieldDropdown(
      user?.factory,
      user?.department,
      user?.user_code,
      allow,
      language,
      "item_acno", // search đúng cột item_acno bên BE
      1,
      10,
      item_acno,
    );
    // BE search theo ILIKE (partial match) nên phải lọc lại đúng giá trị exact
    const matched = (result?.data || []).find(
      (item) => item.item_acno === item_acno
    );

    if (matched) {
      const displayValue = `${matched.ac_item || ""}-${matched.item_acno || ""}-${matched.itemnm || ""}`;
      setDropdownValues((prev) => ({
        ...prev,
        ac_item: displayValue,
        item_acno: matched.item_acno,
        ac_type: matched.ac_type || "",
      }));
      setValue("ac_type", matched.ac_type || "");
    } else {
      // Không tìm thấy master data khớp — vẫn hiển thị tạm item_acno để không trống
      setDropdownValues((prev) => ({ ...prev, ac_item: item_acno, item_acno }));
    }
  } catch (error) {
    console.error("Error fetching item_acno detail:", error);
  }
};
  const onSubmit = (data) => {
    // ac_item chỉ là chuỗi hiển thị cho Dropdown, không gửi lên BE
    const { ac_item, ...restDropdownValues } = dropdownValues;
    const finalData = {
      ...data,
      ...restDropdownValues,
    };
    handleEdit(finalData);
  };

  const handleDecimalInput =
    (decimals = 8) =>
    (e) => {
      e.target.value = e.target.value.replace(
        new RegExp(`(\\.\\d{${decimals}})\\d+`),
        "$1",
      );
    };

  const renderField = (fieldName, label, gridSize = 2.4, extraProps = {}, type = "text") => {
    const hasDropdown = mapDropdown.hasOwnProperty(fieldName);
    const dropdownOptions = dropdownData[fieldName] || [];

    if (hasDropdown) {
      return (
        <Grid item xs={gridSize}>
          <Dropdown
            data={dropdownOptions}
            onSelect={(selectedItem) => {
              const value = selectedItem?.code_no || "";
              setDropdownValues((prev) => ({
                ...prev,
                [fieldName]: value,
              }));
              setValue(fieldName, value);
            }}
            select={dropdownValues[fieldName] || ""}
            table="BASIC_DATA"
            option="basic_data"
            getControlLabel={getControlLabel}
            language={user?.language || "en"}
            field={getColumnLabel(fieldName, label)}
          />
        </Grid>
      );
    }

    if (fieldName === "item_acno") {
      return (
        <Grid item xs={gridSize}>
          <Controller
            name={fieldName}
            control={control}
            render={({ field }) => (
              <Dropdown
                onFetchData={createItemAcnoCallback()}
                onSelect={(selectedItem) => {
                  const displayValue = selectedItem
                    ? `${selectedItem.ac_item || ""}-${selectedItem.item_acno || ""}-${selectedItem.itemnm || ""}`
                    : "";
                  const saveValue = selectedItem?.item_acno || "";

                  field.onChange(saveValue);

                  setDropdownValues((prev) => ({
                    ...prev,
                    ac_item: displayValue,
                    item_acno: saveValue,
                    ac_type: selectedItem?.ac_type || "",
                  }));
                  // Đồng bộ ac_type vào react-hook-form vì ac_type render qua nhánh mapDropdown ở trên
                  setValue("ac_type", selectedItem?.ac_type || "");
                }}
                select={dropdownValues.ac_item || ""}
                table="AC_ITEM_M"
                option="ac_item"
                getControlLabel={getControlLabel}
                language={user?.language || "en"}
                field={getColumnLabel(fieldName, label)}
                totalItems={0}
                pageSize={10}
                {...extraProps}
              />
            )}
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
          {...register(fieldName, {
            setValueAs: (v) =>
              type === "number"
                ? v === "" || v === undefined
                  ? null
                  : Number(v)
                : v,
            validate:
              type === "number"
                ? (value) =>
                    value === null || value === undefined || !isNaN(value)
                      ? true
                      : "Vui lòng nhập số hợp lệ"
                : undefined,
          })}
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
          <Box display="flex" alignItems="center" justifyContent="center" mb={2}>
            <Typography
              variant="h4"
              textTransform="uppercase"
              fontWeight={600}
              textAlign="center"
              flex={1}
              mb={0}
            >
              {getControlLabel("ttl_m_3_edit", "Edit Ac Bom M Information")}
            </Typography>
            <Button onClick={() => onClose(null)} variant="contained" color="error">
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
                  label={getColumnLabel("prod_acno", "Prod Acno")}
                  {...register("prod_acno")}
                  InputLabelProps={{ shrink: true }}
                  disabled
                />
              </Grid>
              <Grid item xs={2.4}>
                {renderField("item_acno", "Item Acno")}
              </Grid>
            </Grid>

            {/* Row 2 */}
            <Grid container spacing={2} mb={3}>
              <Grid item xs={2.4}>
                {renderField("unit_qty", "Unit Quantity", 2.4, {}, "number")}
              </Grid>
              <Grid item xs={2.4}>
                {renderField(
                  "loss_per",
                  "Loss percent",
                  2.4,
                  {
                    inputProps: {
                      step: "0.0001",
                      min: 0,
                      onInput: handleDecimalInput(4),
                    },
                  },
                  "number",
                )}
              </Grid>
              <Grid item xs={2.4}>
                {renderField("fact_qty", "Factory Quantity", 2.4, {}, "number")}
              </Grid>
              <Grid item xs={2.4}>
                <TextField
                  fullWidth
                  label={getColumnLabel("note", "Note")}
                  {...register("note")}
                  name="note"
                />
              </Grid>
            </Grid>

            {/* Row 3 */}
            <Grid container spacing={2} mb={3}>
              {renderField("ac_type", "Ac Type")}
            </Grid>

            {/* Submit Button */}
            <Box mt={4} display="flex" justifyContent="center">
              <Button type="submit" variant="contained" color="primary" size="large" disabled={loading}>
                {getControlLabel("btn_save", "Save")}
              </Button>
            </Box>
          </Box>
        </Paper>
      </DialogContent>
    </Dialog>
  );
};

export default EditAcBomMPage;