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
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { fnQuery } from "../../../utils/fnQuery";
import CloseIcon from "@mui/icons-material/Close";
import { Controller, useForm } from "react-hook-form";
import { fetchAllAcProdMByID } from "../../../service/ac_prod_m/AcProdMService";
import Dropdown from "../../../component/dropdown/Dropdown";
import {
  fetchRSDByID,
  fetchRSDBySize,
  fetchRSDBySizeDropdown,
} from "../../../service/rd_size_d/RdSizeDService";

const EditAcProdM = ({
  open,
  onClose,
  acProdM,
  handleEdit,
  getControlLabel,
  getColumnLabel,
  user,
  selectRows,
  auth,
}) => {
  const { register, handleSubmit, control, reset, setValue, watch } = useForm({
    defaultValues: {
      ...acProdM,
    },
  });

  const { t } = useTranslation();
  const [factory, setFactory] = useState({});
  const [acShoeM, setAcShoeM] = useState({});
  const [dropdownData, setDropdownData] = useState({});
  const [dropdownValues, setDropdownValues] = useState({});
  const [displayValues, setDisplayValues] = useState({});
  const [loading, setLoading] = useState(false);

  const mapDropdown = {
    start_size: "size_type",
    s_seq: "size_type",
    end_size: "size_type",
    e_seq: "size_type",
  };

  useEffect(() => {
    if (open) {
      fetchAllDropdowns();
    } else {
      setDropdownValues({});
      setDisplayValues({});
      setFactory({});
      setAcShoeM({});
      reset({});
    }
  }, [open, reset]);

  const getStatusText = (status) => {
    console.log("check the status", status);
    if (status === 1) return "New-1";
    if (status === 0) return "Cancel-0";
    if (status === 7) return "Confirm-7";
    if (status === 9) return "Close-9";
    return "New-1";
  };

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
        allow,
      );

      const dataMap = {};
      Object.keys(mapDropdown).forEach((fieldName) => {
        dataMap[fieldName] = response?.data || [];
      });
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
      sizeSeq,
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
      sizeNo,
    );
    setDropdownValues((prev) => ({
      ...prev,
      [fieldSize]: sizeNo,
      [fileSubSize]: response?.data?.size_seq || "",
    }));
    setValue(fieldSize, sizeNo, { shouldDirty: true, shouldValidate: true });
    setValue(fileSubSize, response?.data?.size_seq || "", {
      shouldDirty: true,
      shouldValidate: true,
    });
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
          searchText,
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


  const renderField = (fieldName, label, gridSize = 6, extraProps = {}, type = "text") => {
    const hasDropdown = mapDropdown.hasOwnProperty(fieldName);
    const subFieldName = fieldName === "start_size" ? "s_seq" : "e_seq";

  
    if (hasDropdown && (fieldName === "start_size" || fieldName === "end_size")) {
      return (
        <Grid item xs={gridSize} key={fieldName}>
          <Controller
            name={fieldName}
            control={control}
            defaultValue={extraProps.defaultValue || ""}
            render={({ field }) => (
              <Dropdown
                onFetchData={createDropdownCallback()}
                onSelect={(selectedItem) => {
                  handleSizeSelect(selectedItem, fieldName, subFieldName);
                }}
                select={
                  dropdownValues[fieldName] || field.value || extraProps.defaultValue || ""
                }
                table="AC_SHOE_M"
                option={"ac_shoe_m"}
                getControlLabel={getControlLabel}
                language={user?.language || "en"}
                field={getColumnLabel(fieldName, label)}
                totalItems={0}
                pageSize={10}
              />
            )}
          />
        </Grid>
      );
    }

    if (fieldName === "e_seq" || fieldName === "s_seq") {
      const currentValue = dropdownValues[fieldName] || "";

      return (
        <Grid item xs={gridSize} key={fieldName}>
          <TextField
            fullWidth
            label={getColumnLabel(fieldName, label)}
            name={fieldName}
            value={currentValue}
            InputLabelProps={{ shrink: true }}
            inputProps={{
              readOnly: true,
            }}
            placeholder="Auto-filled when selecting size"
          />
          <input type="hidden" {...register(fieldName)} value={currentValue} />
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
                  step: "0.0001",
                  min: 0,
                  onInput: handleDecimalInput(4),
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

  const fetchByID = async () => {
    const response = await fnQuery([
      () =>
        fetchAllAcProdMByID(
          acProdM.factory_code,
          acProdM.customs_shoe_id,
          acProdM.prod_acno,
        ),
    ]);
    if (response[0].success) {
      const { FACTORY, SHOE } = response[0].data;
      if (FACTORY) {
        setFactory(FACTORY);
      }
      if (SHOE) {
        setAcShoeM(SHOE);
      }
    }
  };

  useEffect(() => {
    if (open && acProdM && Object.keys(acProdM).length > 0) {
      const statusText = getStatusText(acProdM.status);
      reset({
        ...acProdM,
        statusText: statusText,
        start_size: acProdM.start_size || "",
        s_seq: acProdM.s_seq || "",
        end_size: acProdM.end_size || "",
        e_seq: acProdM.e_seq || "",
      });
      const initialDropdownValues = {
        start_size: acProdM.start_size || "",
        s_seq: acProdM.s_seq || "",
        end_size: acProdM.end_size || "",
        e_seq: acProdM.e_seq || "",
      };
      setDropdownValues(initialDropdownValues);
    }
  }, [open, acProdM, reset]);

  useEffect(() => {
    if (
      open &&
      acProdM?.factory_code &&
      acProdM?.customs_shoe_id &&
      acProdM?.prod_acno
    ) {
      fetchByID();
    }
  }, [open, acProdM]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
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
              sx={{ flex: 1 }}
              mb={"0"}
            >
              {getControlLabel("ttl_d_2_edit_1", "Edit Ac Prod M Information")}
            </Typography>
            <Button
              onClick={() => onClose(null)}
              variant="contained"
              color="error"
            >
              <CloseIcon />
            </Button>
          </Box>

          <Box mt={4}>
            <fieldset
              style={{
                border: "1px solid #ccc",
                borderRadius: "8px",
                padding: "16px",
                marginBottom: "24px",
              }}
            >
              <legend style={{ padding: "0 8px", fontWeight: "bold" }}>
                {getControlLabel("ftxt_m_fac_dept", "Factory Information")}
              </legend>
              <Grid container spacing={2} mb={2}>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label={getControlLabel("txt_m_factory_name_t", "factory_name_t")}
                    value={factory?.factory_name_t || ""}
                    InputLabelProps={{ shrink: true }}
                    aria-readonly
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label={getControlLabel("txt_m_factory_name_e", "factory_name_e")}
                    value={factory?.factory_name_e || ""}
                    InputLabelProps={{ shrink: true }}
                    aria-readonly
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label={getControlLabel("txt_m_factory_name_l", "factory_name_l")}
                    value={factory?.factory_name_l || ""}
                    InputLabelProps={{ shrink: true }}
                    aria-readonly
                  />
                </Grid>
              </Grid>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label={getControlLabel("txt_m_factory_address", "factory_address")}
                    value={factory?.factory_address || ""}
                    InputLabelProps={{ shrink: true }}
                    aria-readonly
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label={getControlLabel("txt_m_factory_abbreviation", "factory_abbreviation")}
                    value={factory?.factory_abbreviation || ""}
                    InputLabelProps={{ shrink: true }}
                    aria-readonly
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label={getControlLabel("txt_m_factory_tax_no", "factory_tax_no")}
                    value={factory?.factory_tax_no || ""}
                    InputLabelProps={{ shrink: true }}
                    aria-readonly
                  />
                </Grid>
              </Grid>
            </fieldset>
          </Box>

          <Box mt={4}>
            <fieldset
              style={{
                border: "1px solid #ccc",
                borderRadius: "8px",
                padding: "16px",
                marginBottom: "24px",
              }}
            >
              <legend style={{ padding: "0 8px", fontWeight: "bold" }}>
                {getControlLabel("ftxt_ac_shoe_m", "Ac Shoe M Information")}
              </legend>
              <Grid container spacing={2} mb={2}>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label={getControlLabel("txt_customs_shoe_name_l", "customs_shoe_name_l")}
                    value={acShoeM?.customs_shoe_name_l || ""}
                    InputLabelProps={{ shrink: true }}
                    aria-readonly
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label={getControlLabel("txt_customs_shoe_name_t", "customs_shoe_name_t")}
                    value={acShoeM?.customs_shoe_name_t || ""}
                    InputLabelProps={{ shrink: true }}
                    aria-readonly
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label={getControlLabel("txt_customs_shoe_name_e", "customs_shoe_name_e")}
                    value={acShoeM?.customs_shoe_name_e || ""}
                    InputLabelProps={{ shrink: true }}
                    aria-readonly
                  />
                </Grid>
              </Grid>
            </fieldset>
          </Box>

          <Box
            component="form"
            onSubmit={handleSubmit(handleEdit)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleSubmit(handleEdit)();
              }
            }}
          >
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label={getColumnLabel("prod_acno", "prod_acno")}
                  name="prod_acno"
                  InputLabelProps={{ shrink: true }}
                  {...register("prod_acno")}
                  disabled
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label={getColumnLabel("status", "status")}
                  name="status"
                  {...register("statusText")}
                  InputLabelProps={{ shrink: true }}
                  disabled
                />
              </Grid>
            </Grid>

            <Box mt={4}>
              <Grid container spacing={2}>
               
                {renderField("start_size", "Start Size", 6, { defaultValue: acProdM?.start_size || "" })}
                {renderField("s_seq", "S Seq", 6, { defaultValue: acProdM?.s_seq || "" })}
                {renderField("end_size", "End Size", 6, { defaultValue: acProdM?.end_size || "" })}
                {renderField("e_seq", "E Seq", 6, { defaultValue: acProdM?.e_seq || "" })}
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

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label={getColumnLabel("bang_ke_size", "bang_ke_size")}
                    name="bang_ke_size"
                    InputLabelProps={{ shrink: true }}
                    {...register("bang_ke_size")}
                    inputProps={{ readOnly: true }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label={getColumnLabel("note", "note")}
                    name="note"
                    InputLabelProps={{ shrink: true }}
                    multiline
                    rows={2}
                    {...register("note")}
                  />
                </Grid>
              </Grid>
            </Box>

            <Box mt={4} display={"flex"} gap={"6px"}>
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

export default EditAcProdM;