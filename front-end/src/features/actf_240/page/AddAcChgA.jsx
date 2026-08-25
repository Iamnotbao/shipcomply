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
import { Controller, useForm } from "react-hook-form";
import Dropdown from "../../../component/dropdown/Dropdown";
import { fetchInAcnoDropdown } from "../../../service/vw_ac_chgsum/vwAcChgSum";

const AddAcChkT = ({
  open,
  onClose,
  handleAdd,
  getControlLabel,
  getColumnLabel,
  user,
  auth,
  selectRows, // AC_ISSUE_MATD_T data,
  selectParentRows, // AC_ISSUE_T data for parent-level info if needed
}) => {
  const ac_issue_matd = selectRows?.[0] || {};
  console.log("parent 1: ", selectRows);
  console.log("parent 2: ", selectParentRows);

  const { register, handleSubmit, reset, setValue, control, watch } = useForm({
    defaultValues: {
      factory_code: user?.factory || "",
      conf_seq: ac_issue_matd?.conf_seq || "",
      matd_seq: ac_issue_matd?.matd_seq || "",
      issue_seq: "",
      src: "",
      in_acno: "",
      ac_date: "",
      d_type: "",
      qty: "",
    },
  });

  const [dropdownValues, setDropdownValues] = useState({
    src: "",
    in_acno: "",
  });

  useEffect(() => {
    if (open) {
      setValue("factory_code", user?.factory);
      setValue("conf_seq", ac_issue_matd?.conf_seq || "");
      setValue("matd_seq", ac_issue_matd?.matd_seq || "");
    } else {
      reset();
      setDropdownValues({ src: "", in_acno: "" });
    }
  }, [open, reset]);

  // SRC dropdown callback — values: 1, 2, 9, 0
  const createSrcCallback = () => {
    return async (page, pageSize, searchText) => {
      const staticData = [
        { code_no: "1", code_name: "1-OverSea IMP" },
        { code_no: "2", code_name: "2-Invoice" },
        { code_no: "9", code_name: "9-Process IMP" },
        { code_no: "0", code_name: "0-Other" },
      ];
      const filtered = searchText
        ? staticData.filter(
            (d) =>
              d.code_no.includes(searchText) ||
              d.code_name.toLowerCase().includes(searchText.toLowerCase()),
          )
        : staticData;
      return { data: filtered, total: filtered.length, pageSize };
    };
  };

  // IN_ACNO dropdown callback — fetched from VW_AC_CHGSUM
  const createInAcnoCallback = (srcValue) => {
    return async (page, pageSize, searchText) => {
      try {
        const result = await fetchInAcnoDropdown(
          user?.factory,
          srcValue,
          selectParentRows?.[0]?.out_dtype || "",
          selectRows?.[0]?.matd_no || "",
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
        console.error("Error fetching in_acno:", error);
        return { data: [], total: 0, pageSize };
      }
    };
  };

  const srcValue = watch("src");

  // Read-only display fields (from calculation, user cannot modify)
  const readOnlyFields = [
    { name: "out_acno", label: "Out AC No" },
    { name: "prod_no", label: "Prod No" },
    { name: "matd_no", label: "Matd No" },
    { name: "unit", label: "Unit" },
    { name: "price", label: "Price" },
    { name: "pairs", label: "Pairs" },
    { name: "unit_qty", label: "Unit Qty" },
    { name: "loss_per", label: "Loss %" },
    { name: "over_qty", label: "Over Qty" },
    { name: "money", label: "Money" },
    { name: "col1", label: "Col1" },
  ];

  const renderReadOnlyField = (name, label, gridSize = 4) => (
    <Grid item xs={gridSize} key={name}>
      <TextField
        fullWidth
        label={getColumnLabel(name, label)}
        InputLabelProps={{ shrink: true }}
        inputProps={{
          readOnly: true
        }}
        {...register(name)}
      />
    </Grid>
  );

  const onSubmit = (data) => {
    handleAdd(data);
  };
    const handleDecimalInput =
    (decimals = 8) =>
    (e) => {
      e.target.value = e.target.value.replace(
        new RegExp(`(\\.\\d{${decimals}})\\d+`),
        "$1",
      );
    };
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogContent>
        <Paper sx={{ maxWidth: "800px", mx: "auto", p: 3 }}>
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
              {getControlLabel("ttl_d_2_add", "Add AC_CHK_T")}
            </Typography>
            <Button onClick={onClose} variant="contained" color="error">
              <CloseIcon />
            </Button>
          </Box>

          <Box component="form" onSubmit={handleSubmit(onSubmit)}>
            {/* Row 1 — PK/FK fields (read-only) */}
            <Grid container spacing={2} mb={2}>
              <Grid item xs={4}>
                <TextField
                  fullWidth
                  label={getColumnLabel("factory_code", "Factory Code")}
                  value={user?.factory || ""}
                  InputLabelProps={{ shrink: true }}
                  disabled
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  fullWidth
                  label={getColumnLabel("conf_seq", "Conf Seq")}
                  value={ac_issue_matd?.conf_seq || ""}
                  InputLabelProps={{ shrink: true }}
                  disabled
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  fullWidth
                  label={getColumnLabel("matd_seq", "Matd Seq")}
                  value={ac_issue_matd?.matd_seq || ""}
                  InputLabelProps={{ shrink: true }}
                  disabled
                />
              </Grid>
            </Grid>

            {/* Row 2 — issue_seq (user input) + src dropdown */}
            <Grid container spacing={2} mb={2}>
              <Grid item xs={4}>
                <TextField
                  fullWidth
                  label={getColumnLabel("issue_seq", "Issue Seq")}
                  type="number"
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ step: "0.01", min: 0 }}
                  {...register("issue_seq", { valueAsNumber: true })}
                  onChange={handleDecimalInput(2)}
                />
              </Grid>

              {/* SRC — static dropdown */}
              <Grid item xs={4}>
                <Controller
                  name="src"
                  control={control}
                  render={({ field }) => (
                    <Dropdown
                      onFetchData={createSrcCallback()}
                      onSelect={(selectedItem) => {
                        const value = selectedItem?.code_no || "";
                        field.onChange(value);
                        setDropdownValues((prev) => ({ ...prev, src: value }));
                        // Reset in_acno when src changes
                        setValue("in_acno", "");
                        setValue("ac_date", "");
                        setValue("d_type", "");
                        setDropdownValues((prev) => ({
                          ...prev,
                          src: value,
                          in_acno: "",
                        }));
                      }}
                      select={field.value || dropdownValues.src || ""}
                      table="BASIC_DATA"
                      option="basic_data"
                      getControlLabel={getControlLabel}
                      language={user?.language || "en"}
                      field={getColumnLabel("src", "Source")}
                      totalItems={4}
                      pageSize={10}
                    />
                  )}
                />
              </Grid>

              {/* IN_ACNO — dropdown from VW_AC_CHGSUM, writes ac_date & d_type on select */}
              <Grid item xs={4}>
                <Controller
                  name="in_acno"
                  control={control}
                  render={({ field }) => (
                    <Dropdown
                      onFetchData={createInAcnoCallback(srcValue)}
                      onSelect={(selectedItem) => {
                        const value = selectedItem?.ac_no || "";
                        field.onChange(value);
                        setDropdownValues((prev) => ({
                          ...prev,
                          in_acno: value,
                        }));
                        // Auto-fill ac_date and d_type from selected row
                        setValue("ac_date", selectedItem?.ac_date || "");
                        setValue("d_type", selectedItem?.d_type || "");
                      }}
                      select={field.value || dropdownValues.in_acno || ""}
                      table="VW_AC_CHGSUM"
                      option="in_acno"
                      getControlLabel={getControlLabel}
                      language={user?.language || "en"}
                      field={getColumnLabel("in_acno", "In AC No")}
                      totalItems={0}
                      pageSize={10}
                    />
                  )}
                />
              </Grid>
            </Grid>

            {/* Row 3 — ac_date, d_type (auto-filled, user editable), qty (user input) */}
            <Grid container spacing={2} mb={2}>
              <Grid item xs={4}>
                <TextField
                  fullWidth
                  label={getColumnLabel("ac_date", "AC Date")}
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  {...register("ac_date")}
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  fullWidth
                  label={getColumnLabel("d_type", "D Type")}
                  InputLabelProps={{ shrink: true }}
                  {...register("d_type")}
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  fullWidth
                  label={getColumnLabel("qty", "Qty")}
                  type="number"
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ step: "0.00000001", min: 0 }}
                  {...register("qty", { valueAsNumber: true })}
                  onChange={handleDecimalInput(8)}
                />
              </Grid>
            </Grid>

            {/* Row 4 — Read-only fields from calculation */}
            <Grid container spacing={2} mb={2}>
              {renderReadOnlyField("out_acno", "Out AC No", 4)}
              {renderReadOnlyField("prod_no", "Prod No", 4)}
              {renderReadOnlyField("matd_no", "Matd No", 4)}
            </Grid>
            <Grid container spacing={2} mb={2}>
              {renderReadOnlyField("unit", "Unit", 4)}
              {renderReadOnlyField("price", "Price", 4)}
              {renderReadOnlyField("pairs", "Pairs", 4)}
            </Grid>
            <Grid container spacing={2} mb={2}>
              {renderReadOnlyField("unit_qty", "Unit Qty", 4)}
              {renderReadOnlyField("loss_per", "Loss %", 4)}
              {renderReadOnlyField("over_qty", "Over Qty", 4)}
            </Grid>
            <Grid container spacing={2} mb={2}>
              {renderReadOnlyField("money", "Money", 4)}
              {renderReadOnlyField("col1", "Col1", 4)}
            </Grid>

            {/* Submit Buttons */}
            <Grid container spacing={2} justifyContent="flex-end" mt={3}>
              <Grid item>
                <Button variant="outlined" onClick={onClose}>
                  {getControlLabel("btn_cancel", "Cancel")}
                </Button>
              </Grid>
              <Grid item>
                <Button type="submit" variant="contained" color="primary">
                  {getControlLabel("btn_save", "Save")}
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Paper>
      </DialogContent>
    </Dialog>
  );
};

export default AddAcChkT;
