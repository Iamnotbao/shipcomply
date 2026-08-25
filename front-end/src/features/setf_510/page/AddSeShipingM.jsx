import {
  Box,
  Button,
  Dialog,
  DialogContent,
  Grid,
  Input,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import CloseIcon from "@mui/icons-material/Close";
import { fetchFactory } from "../../../service/factory/factoryService";
import {
  fetchDepartmentByFac,
  fetchDepartments,
} from "../../../service/factory_departments/FacDepartmentService";
import { useEffect, useState } from "react";
import { fnQuery } from "../../../utils/fnQuery";
import { fetchAllCustDropdown } from "../../../service/se_cust/seCust";
import Dropdown from "../../../component/dropdown/Dropdown";
import { Controller, useForm } from "react-hook-form";
import { getSiSeq } from "../../../service/se_shipping_m/seShippingM";

const AddSeShipingM = ({
  open,
  handleClose,
  handleAdd,
  getControlLabel,
  getColumnLabel,
  language,
  user,
  selectRows,
  table = "",
  mapLanguageToColumn,
  auth,
}) => {
  const today = new Date().toISOString().slice(0, 19).replace("T", " ");
  new Date().toISOString().split("T")[0];
  const { t } = useTranslation();
  const [selectFactory, setSelectFactory] = useState({});
  const [selectDepartment, setSelectDepartment] = useState({});
  const [factories, setFactories] = useState([]);
  const [departments, setDepartments] = useState([]);
  const fetchAll = async () => {
    const [fact, dept] = await fnQuery([
      () => fetchFactory(),
      () => fetchDepartments(),
    ]);

    if (fact) {
      console.log("check all fac", factories);
      setFactories([{ tableName: fact.tableName, data: fact.data }]);
    }
    if (dept) {
      console.log("check all dept", departments);
      setDepartments([{ tableName: dept.tableName, data: dept.data }]);
    }
  };
  const visibleColumn = mapLanguageToColumn(language);
  // const nameFields = generateNameFields(table).filter(
  //   (field) => field.key === visibleColumn,
  // );
  const { register, handleSubmit, reset, setValue, control, watch } = useForm({
    defaultValues: {
      factory_code: user?.factory || "",
      cust_id: "",
      si_seq: "",
      start_date: "",
      end_date: "",
    },
  });
  const [dropdownValues, setDropdownValues] = useState({
    factory_code: user?.factory || "",
    cust_id: "",
    si_seq: "",
    start_date: "",
    end_date: "",
  });

  // Watch for fields that trigger calculations
  const cust_id = watch("cust_id");
  const si_seq = watch("si_seq");
  const onSubmit = (data) => {
    handleAdd(data);
  };
  const handleDeptByFactory = async () => {
    const response = await fetchDepartmentByFac(selectFactory.factory_code);
    if (response) {
      setDepartments([{ tableName: response.tableName, data: response.data }]);
    }
  };
  useEffect(() => {
    fetchAll();
  }, []);
  useEffect(() => {
    if (selectFactory && selectFactory.factory_code) {
      handleDeptByFactory();
    }
  }, [selectFactory]);
  useEffect(() => {
    if (open) {
      setValue("factory_code", user?.factory);
      setValue("cust_id", "");
    } else {
      reset();
      setDropdownValues({
        factory_code: user?.factory || "",
        cust_id: "",
        si_seq: "",
        start_date: "",
        end_date: "",
      });
    }
  }, [open, reset]);
  useEffect(() => {
    if (cust_id) {
      loadDataFromCust(cust_id);
    }
  }, [cust_id]);
  const createCustCallback = () => {
    return async (page, pageSize, searchText) => {
      try {
        const allow =
          auth?.find((item) => item.field === "query_level")?.title || "1";
        const result = await fetchAllCustDropdown(
          user?.factory,
          user?.department,
          user?.user_code,
          allow,
          "cust_id",
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
        console.error("Error fetching ac_itemno:", error);
        return { data: [], total: 0, pageSize };
      }
    };
  };
  const loadDataFromCust = async (cust) => {
    try {
      const [siSeq] = await Promise.all([
        getSiSeq(
          user?.factory,
          cust,
          user?.department,
          user?.user_code,
          auth?.find((item) => item.field === "query_level")?.title,
          language,
        ),
      ]);
      setValue("si_seq", siSeq?.data?.si_seq || "");
    } catch (error) {
      console.error("Error loading data from cont_no:", error);
    }
  };
  const renderField = (
    fieldName,
    label,
    gridSize = 3,
    extraProps = {},
    type = "text",
  ) => {
    // AC_ITEM dropdown
    if (fieldName === "cust_id") {
      return (
        <Grid item xs={gridSize} key={fieldName}>
          <Controller
            name={fieldName}
            control={control}
            render={({ field }) => (
              <Dropdown
                onFetchData={createCustCallback()}
                onSelect={(selectedItem) => {
                  // Display value: ac_item-item_acno-itemnm
                  const displayValue = selectedItem
                    ? `${selectedItem.cust_id || ""}-${selectedItem.cust_no || ""}-${selectedItem.cust_name || ""}`
                    : "";

                  // Save value: only ac_item
                  const saveValue = selectedItem?.cust_id || "";

                  // Update form value (what gets saved)
                  field.onChange(saveValue);

                  // Update display value
                  setDropdownValues((prev) => ({
                    ...prev,
                    cust_id: displayValue,
                    cust_id_save: saveValue,
                  }));
                }}
                select={dropdownValues.cust_id || ""}
                table="SE_SHIPING_M"
                option="cust_id"
                getControlLabel={getControlLabel}
                language={user?.language || "en"}
                field={getColumnLabel(fieldName, label)}
                totalItems={0}
                pageSize={10}
                disabled={!cust_id}
                helperText={!cust_id ? "Please select Cust ID No first" : ""}
                {...extraProps}
              />
            )}
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
              {getControlLabel("ttl_m_add", "Add Se Shiping M Information")}
            </Typography>
            <Button onClick={handleClose} variant="contained" color="error">
              <CloseIcon />
            </Button>
          </Box>
          <Box component="form" onSubmit={handleSubmit(onSubmit)}>
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
                  "ftxt_m_fac_dept",
                  "Factory and Department Information",
                )}
              </legend>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    type="text"
                    fullWidth
                    label={getControlLabel(
                      "txt_m_factory_code",
                      "factory_code",
                    )}
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
                      "txt_m_department_code",
                      "department_code",
                    )}
                    name="department_code"
                    value={user?.department}
                    InputLabelProps={{ shrink: true }}
                    disabled
                  />
                </Grid>
              </Grid>
            </fieldset>
            <Box mt={4}>
              <Grid container spacing={2}>
                {renderField("cust_id", "cust_id", 6)}
                {renderField(
                  "si_seq",
                  "si_seq",
                  6,
                  {
                    inputProps: { readOnly: true },
                  },
                  "number",
                )}
                {renderField("start_date", "start_date", 6, {}, "date")}
                {renderField("end_date", "end_date", 6, {}, "date")}
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
export default AddSeShipingM;
