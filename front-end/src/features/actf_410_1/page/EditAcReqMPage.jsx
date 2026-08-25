import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
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
import Dropdown from "../../../component/dropdown/Dropdown";
import {
  fetchAllAcNo,
  fetchAllInvoiceNo,
} from "../../../service/ac_req_m/AcReqMService";
import { fetchFieldByPoVenderMDropDown } from "../../../service/ac_cont_m/AcContMService";

const EditAcReqMPage = ({
  open,
  acReqM,
  onClose,
  handleEdit,
  getControlLabel,
  getColumnLabel,
  user,
  auth,
  language,
}) => {
  const { control, handleSubmit, reset, setValue } = useForm({
    defaultValues: {
      factory_code: user?.factory || "",
      req_date: "",
      invoice_no: "",
      ac_no: "",
      req_no: "",
      vend_no: "",
      status: "",
    },
  });

  const [dropdownValues, setDropdownValues] = useState({});

  const getStatusText = (status) => {
    return status || "";
  };

  // CreateDropdownCallback cho invoice_no
  const createInvoiceDropdownCallback = () => {
    return async (page, pageSize, searchText) => {
      try {
        const allow = Array.isArray(auth)
          ? auth.find((item) => item.field === "query_level")?.title
          : "1";

        const result = await fetchAllInvoiceNo(
          user?.factory,
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
        console.error("Error fetching invoice dropdown:", error);
        return {
          data: [],
          total: 0,
          pageSize: pageSize,
        };
      }
    };
  };

  // CreateDropdownCallback cho ac_no
  const createAcNoDropdownCallback = () => {
    return async (page, pageSize, searchText) => {
      try {
        const allow = Array.isArray(auth)
          ? auth.find((item) => item.field === "query_level")?.title
          : "1";

        // Chỉ fetch khi có invoice_no
        if (!dropdownValues.invoice_no) {
          return {
            data: [],
            total: 0,
            pageSize: pageSize,
          };
        }

        const result = await fetchAllAcNo(
          user?.factory,
          dropdownValues.invoice_no,
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
        console.error("Error fetching ac_no dropdown:", error);
        return {
          data: [],
          total: 0,
          pageSize: pageSize,
        };
      }
    };
  };
  const createVendNoCallback = () => {
    return async (page, pageSize, searchText) => {
      try {
        const allow = Array.isArray(auth)
          ? auth.find((item) => item.field === "query_level")?.title
          : "1";
        const result = await fetchFieldByPoVenderMDropDown(
          user?.access_token,
          user?.factory,
          "",
          "",
          true,
          user?.department,
          user?.user_code,
          allow,
          "vend_no",
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
        console.error("Error fetching vend_no:", error);
        return { data: [], total: 0, pageSize: pageSize };
      }
    };
  };
  useEffect(() => {
    if (acReqM && open) {
      const statusText = getStatusText(acReqM.status);
      reset({
        ...acReqM,
        factory_code: user?.factory || acReqM.factory_code,
        statusText: statusText,
        req_no: acReqM.req_no || "",
        vend_no: acReqM.vend_no || "",
      });

      setDropdownValues({
        invoice_no: acReqM.invoice_no || "",
        ac_no: acReqM.ac_no || "",
        req_no: acReqM.req_no || "",
        vend_no: acReqM.vend_no || "",
      });
    }
  }, [acReqM, open, reset, user?.factory]);

  useEffect(() => {
    if (!open) {
      setDropdownValues({});
      reset();
    }
  }, [open]);

  const renderField = (fieldName, label, gridSize = 2.4, extraProps = {}) => {
    if (fieldName === "invoice_no") {
      return (
        <Grid item xs={gridSize}>
          <Controller
            name="invoice_no"
            control={control}
            render={({ field }) => (
              <Dropdown
                onFetchData={createInvoiceDropdownCallback()}
                onSelect={(selectedItem) => {
                  const newValue = selectedItem?.invoice_no || "";
                  const newSort = selectedItem?.sort || "";
                  field.onChange(newValue);
                  setValue("invoice_no", newValue);
                  setValue("ac_no", "");
                  setDropdownValues((prev) => ({
                    ...prev,
                    invoice_no: newValue,
                    sort: newSort,
                    ac_no: "",
                  }));
                }}
                select={
                  dropdownValues.invoice_no
                    ? {
                        invoice_no: dropdownValues.invoice_no,
                        sort: dropdownValues.sort || "",
                      }
                    : field.value || ""
                }
                table="AC_REQ_M_3"
                option={"ac_req_m"}
                getControlLabel={getControlLabel}
                language={user?.language || "en"}
                field={getColumnLabel(fieldName, label)}
                totalItems={0}
                pageSize={10}
                headerField="invoice_no"
              />
            )}
          />
        </Grid>
      );
    }

    if (fieldName === "ac_no") {
      return (
        <Grid item xs={gridSize}>
          <Controller
            name="ac_no"
            control={control}
            render={({ field }) => (
              <Dropdown
                onFetchData={createAcNoDropdownCallback()}
                onSelect={(selectedItem) => {
                  const newValue = selectedItem?.ac_no || "";
                  field.onChange(newValue);
                  setValue("ac_no", newValue);
                  setDropdownValues((prev) => ({
                    ...prev,
                    ac_no: newValue,
                  }));
                }}
                select={dropdownValues.ac_no || field.value || ""}
                table="AC_REQ_M_2"
                option={"ac_req_m"}
                getControlLabel={getControlLabel}
                language={user?.language || "en"}
                field={getColumnLabel(fieldName, label)}
                totalItems={0}
                pageSize={10}
                key={dropdownValues.invoice_no} // Re-render khi invoice thay đổi
              />
            )}
          />
        </Grid>
      );
    }
    if (fieldName === "vend_no") {
      return (
        <Grid item xs={gridSize} key={fieldName}>
          <Controller
            name={fieldName}
            control={control}
            render={({ field }) => (
              <Dropdown
                onFetchData={createVendNoCallback()}
                onSelect={(selectedItem) => {
                  // Display value: ac_item-item_acno-itemnm
                  const displayValue = selectedItem
                    ? `${selectedItem.vend_no || ""}-${selectedItem.vend_name || ""}`
                    : "";

                  // Save value: only ac_item
                  const saveValue = selectedItem?.vend_no || "";

                  // Update form value (what gets saved)
                  field.onChange(saveValue);

                  // Update display value
                  setDropdownValues((prev) => ({
                    ...prev,
                    vend_no: displayValue,
                    vend_no_save: saveValue,
                  }));
                }}
                select={dropdownValues.vend_no || ""}
                table="PO_VENDER_M"
                option="po_vender_m"
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
      <Grid item xs={gridSize}>
        <Controller
          name={fieldName}
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              fullWidth
              label={getColumnLabel(fieldName, label)}
              {...extraProps}
            />
          )}
        />
      </Grid>
    );
  };

  // Xử lý submit
  const onSubmit = (data) => {
    handleEdit(data);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xl">
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
              {getControlLabel("ttl_m_2_edit", "Edit Ac Req M Information")}
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
            <Grid container spacing={2} mb={3}>
              <Grid item xs={2.4}>
                <Controller
                  name="factory_code"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label={getColumnLabel("factory_code", "Factory Code")}
                      disabled
                    />
                  )}
                />
              </Grid>
              <Grid item xs={2.4}>
                <Controller
                  name="req_no"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label={getColumnLabel("req_no", "Req No")}
                      disabled
                    />
                  )}
                />
              </Grid>
            </Grid>
            <Grid container spacing={2} mb={3}>
              {renderField("req_date", "Req Date", 2.4, {
                type: "date",
                InputLabelProps: { shrink: true },
                required: true,
              })}
              {renderField("invoice_no", "Invoice No")}
              {renderField("ac_no", "Ac No")}
              {renderField("vend_no", "Vend no")}
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

export default EditAcReqMPage;
