import {
  Box,
  Button,
  Dialog,
  DialogContent,
  Grid,
  Paper,
  TextField,
  Typography,
  Checkbox,
  FormControlLabel,
  Radio,
  RadioGroup,
  MenuItem,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useEffect, useState } from "react";
import Dropdown from "../../../component/dropdown/Dropdown";
import { Controller, useForm } from "react-hook-form";
import { fetchBasicDataDropDownByCate } from "../../../service/basic_data/basicDataService";
import { fetchFieldDropdown } from "../../../service/sd_ord_m_c/sdOrdMC";
import { getCBM, getShipSeq } from "../../../service/se_plan_ord/sePlanOrd";

const AddSePlanOrd = ({
  open,
  handleClose,
  handleAdd,
  getControlLabel,
  getColumnLabel,
  language,
  user,
  auth,
}) => {
  const { register, handleSubmit, reset, setValue, control, watch } = useForm({
    defaultValues: {
      factory_code: user?.factory || "",
      se_id: "",
      se_ver: "",
      se_seq: "",
      pack_gu: "",
      send_addr: "",
      send_type: "",
      ship_comp: "",
      column1: "",
      column2: "",
      cbm: "",
      p_shipdate: "",
      p_shipqty: "",
      p_exdate: "",
      col5: "",
      col6: "",
      column3: "N",
      column4: "",
      book_no: "",
      col7: "7",
      remark: "",
    },
  });

  const se_id = watch("se_id");
  const se_ver = watch("se_ver");
  const se_seq = watch("se_seq");
  const pack_gu = watch("pack_gu");
  const ship_seq = watch("ship_seq");
  const p_shipdate = watch("p_shipdate")

  const mapFieldDropdown = {
    se_id: "se_id",
    se_ver: "se_ver",
    se_seq: "se_seq",
    pack_gu: "pack_gu",
    send_addr: "send_addr",
    column2: "se_id",
  };

  const mapBasicDataDropdown = {
    send_type: "2105",
    ship_comp: "2110",
    column1: "2116",
    col5: "2117",
    col6: "2111",
  };

  const [dropdownValues, setDropdownValues] = useState({});

  const onSubmit = (data) => {
    handleAdd(data);
  };

  const fetchShipSeq = async () => {
    try {
      const result = await getShipSeq(
        user?.access_token,
        user?.factory,
        se_id,
        pack_gu,
        se_seq,
        se_ver,
        user?.department,
        user?.user_code,
        auth?.find((item) => item.field === "query_level")?.title || "1",
      );

      const ship_seq = result?.data?.ship_seq || "";
      setValue("ship_seq", ship_seq);
      setDropdownValues((prev) => ({ ...prev, ship_seq }));
    } catch (error) {
      console.error(" Error fetching ship_seq:", error);
    }
  };

  const fetchCBM = async () => {
    try {
      const result = await getCBM(
        user?.access_token,
        user?.factory,
        se_id,
        pack_gu,
        se_seq,
        se_ver,
        ship_seq,
      );
      console.log("result", result?.data.cbm);

      const cbm = result?.data?.cbm;
      setValue("cbm", cbm);
      setDropdownValues((prev) => ({ ...prev, cbm }));
    } catch (error) {
      console.error(" Error fetching cbm:", error);
    }
  };

  useEffect(() => {
    if (open && se_id && se_ver && se_seq && pack_gu) {
      fetchShipSeq();
    }
  }, [se_id, se_ver, se_seq, pack_gu, open]);

  useEffect(() => {
    if (open && se_id && se_ver && se_seq && pack_gu && ship_seq) {
      fetchCBM();
    }
  }, [open, se_id, se_ver, se_seq, pack_gu, ship_seq]);
  useEffect(() => {
    if (open) {
      setValue("factory_code", user?.factory);
      setValue("column3", "N");
      setValue("col7", "7");
    } else {
      reset();
      setDropdownValues({});
    }
  }, [open, reset, user?.factory, setValue]);

  const createFieldDropdownCallback = (field) => {
    return async (page, pageSize, searchText) => {
      try {
        const result = await fetchFieldDropdown(
          user?.factory,
          field,
          language,
          page,
          pageSize,
          searchText,
          "",
          true,
          p_shipdate
        );
        return {
          data: result?.data || [],
          total: result?.total || 0,
          pageSize: pageSize,
        };
      } catch (error) {
        console.error(`Error fetching ${field} dropdown:`, error);
        return { data: [], total: 0, pageSize };
      }
    };
  };

  // Callback riêng cho se_ver, se_seq, pack_gu - filter theo se_id đã chọn
  const createFieldDropdownWithSeIdCallback = (field) => {
    return async (page, pageSize, searchText) => {
      try {
        if (!se_id) {
          return { data: [], total: 0, pageSize };
        }
        const result = await fetchFieldDropdown(
          user?.factory,
          field,
          language,
          page,
          pageSize,
          searchText,
          se_id,
        );
        return {
          data: result?.data || [],
          total: result?.total || 0,
          pageSize: pageSize,
        };
      } catch (error) {
        console.error(`Error fetching ${field} dropdown:`, error);
        return { data: [], total: 0, pageSize };
      }
    };
  };

  const createBasicDropdownCallback = (categoryCode) => {
    return async (page, pageSize, searchText) => {
      try {
        const allow =
          auth?.find((item) => item.field === "query_level")?.title || "1";

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
        console.error(`Error fetching category ${categoryCode}:`, error);
        return { data: [], total: 0, pageSize };
      }
    };
  };

  const renderField = (
    fieldName,
    label,
    gridSize = 3,
    extraProps = {},
    type = "text",
  ) => {
    if (mapFieldDropdown.hasOwnProperty(fieldName)) {
      const needsSeId = ["se_ver", "se_seq", "pack_gu"].includes(fieldName);

      return (
        <Grid item xs={gridSize} key={fieldName}>
          <Controller
            name={fieldName}
            control={control}
            render={({ field }) => (
              <Dropdown
                onFetchData={
                  needsSeId
                    ? createFieldDropdownWithSeIdCallback(fieldName)
                    : createFieldDropdownCallback(mapFieldDropdown[fieldName])
                }
                onSelect={(selectedItem) => {
                  const newValue = selectedItem?.value || "";
                  field.onChange(newValue);

                  if (fieldName === "se_id") {
                    setValue("column2", newValue);

                    if (selectedItem?.se_ver) {
                      setValue("se_ver", selectedItem.se_ver);
                      setDropdownValues((prev) => ({
                        ...prev,
                        se_ver: selectedItem.se_ver,
                      }));
                    }

                    if (selectedItem?.se_seq) {
                      setValue("se_seq", selectedItem.se_seq);
                      setDropdownValues((prev) => ({
                        ...prev,
                        se_seq: selectedItem.se_seq,
                      }));
                    }

                    if (selectedItem?.pack_gu) {
                      setValue("pack_gu", selectedItem.pack_gu);
                      setDropdownValues((prev) => ({
                        ...prev,
                        pack_gu: selectedItem.pack_gu,
                      }));
                    }
                  }

                  setDropdownValues((prev) => ({
                    ...prev,
                    [fieldName]: newValue,
                  }));
                }}
                select={field.value || dropdownValues[fieldName] || ""}
                table="SD_ORD_M_C"
                option={fieldName}
                getControlLabel={getControlLabel}
                language={user?.language || "en"}
                field={getColumnLabel(fieldName, label)}
                headerField={fieldName}
                totalItems={0}
                pageSize={10}
                disabled={needsSeId && !se_id}
                {...extraProps}
              />
            )}
          />
        </Grid>
      );
    }
   

    if (mapBasicDataDropdown.hasOwnProperty(fieldName)) {
      return (
        <Grid item xs={gridSize} key={fieldName}>
          <Controller
            name={fieldName}
            control={control}
            render={({ field }) => (
              <Dropdown
                onFetchData={createBasicDropdownCallback(
                  mapBasicDataDropdown[fieldName],
                )}
                onSelect={(selectedItem) => {
                  const newValue = selectedItem?.code_no || "";
                  field.onChange(newValue);
                  setDropdownValues((prev) => ({
                    ...prev,
                    [fieldName]: newValue,
                  }));
                }}
                select={field.value || dropdownValues[fieldName] || ""}
                table="BASIC_DATA"
                option="basic_data"
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

    if (fieldName === "ship_seq") {
      return (
        <Grid item xs={gridSize} key={fieldName}>
          <TextField
            fullWidth
            label={getColumnLabel("ship_seq", "Ship Seq")}
            value={dropdownValues.ship_seq ?? ""}
            InputLabelProps={{ shrink: true }}
            inputProps={{
              readOnly: true,
            }}
            type="number"
          />
        </Grid>
      );
    }

    if (fieldName === "cbm") {
      return (
        <Grid item xs={gridSize} key={fieldName}>
          <TextField
            fullWidth
            label={getColumnLabel("cbm", "CBM")}
            value={dropdownValues.cbm ?? ""}
            InputLabelProps={{ shrink: true }}
            inputProps={{
              readOnly: true,
            }}
          />
        </Grid>
      );
    }

    // Regular fields
    return (
      <Grid item xs={gridSize} key={fieldName}>
        <TextField
          fullWidth
          label={getColumnLabel(fieldName, label)}
          type={type}
          InputLabelProps={{ shrink: true }}
          inputProps={
            type === "number"
              ? { step: "0.01", min: 0, ...extraProps.inputProps }
              : extraProps.inputProps
          }
          {...register(fieldName, {
            valueAsNumber: type === "number",
          })}
          {...extraProps}
        />
      </Grid>
    );
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xl" fullWidth>
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
              gutterBottom
              textAlign="center"
              flex={1}
              mb={0}
            >
              {getControlLabel("ttl_m_add", "Add Se Plan Ord Information")}
            </Typography>
            <Button onClick={handleClose} variant="contained" color="error">
              <CloseIcon />
            </Button>
          </Box>

          <Box component="form" onSubmit={handleSubmit(onSubmit)}>
            {/* Main Fields */}
            <Grid container spacing={2} mb={3}>
              <Grid item xs={3}>
                <TextField
                  fullWidth
                  label={getColumnLabel("factory_code", "Factory Code")}
                  name="factory_code"
                  value={user?.factory}
                  InputLabelProps={{ shrink: true }}
                  disabled
                />
              </Grid>
              {renderField("p_shipdate", "P Shipdate", 3, {}, "date")}
              {renderField("se_id", "SE ID", 3)}
              {renderField("se_ver", "SE Ver", 3)}
              {renderField("se_seq", "SE Seq", 3)}
            </Grid>

            <Grid container spacing={2} mb={3}>
              {renderField("pack_gu", "Pack GU", 3)}
              {renderField("ship_seq", "Ship_Seq", 3)}
              {renderField("send_addr", "Send Addr", 6)}
              {renderField("send_type", "Send Type", 3)}
              {renderField("ship_comp", "Ship Comp", 3)}
            </Grid>

            <Grid container spacing={2} mb={3}>
              {renderField("column1", "Column1 (貨櫃場/倉庫)", 3)}
              {renderField("column2", "Invoice No", 3, { disabled: true })}
              {renderField("cbm", "CBM", 3)}
              {renderField(
                "p_shipqty",
                "P Shipqty",
                3,
                { disabled: true },
                "number",
              )}
              {renderField("p_exdate", "P Exdate", 3, {}, "date")}
            </Grid>

            <Grid container spacing={1} mb={3}>
              {renderField("col5", "Col5 (航務代理)", 3)}
              {renderField("col6", "Col6 (目的地)", 3)}
            {/* {renderField("column3", "Column3 (生效?)", 6, {
                inputProps: { readOnly: true },
              })}*/}
              {renderField("column4", "ETD", 3, {}, "date")}
              {renderField("book_no", "Booking No", 3)}
              {renderField("col7", "Col7 (轉海關)", 12, {
                inputProps: { readOnly: true },
              })}
              {renderField("remark", "Remark", 3, {
                multiline: true,
                rows: 3,
              })}
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

export default AddSePlanOrd;
