import {
  Box,
  Button,
  Dialog,
  DialogContent,
  Stack,
  Typography,
  InputBase,
  Paper,
  Grid,
  TextField,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { Controller, useForm } from "react-hook-form";
import Dropdown from "../../../component/dropdown/Dropdown";
import { useEffect, useState } from "react";
import { fetchProdMDropdown } from "../../../service/ac_prod_m/AcProdMService";
const GenegrateProdMPopup = ({
  openLink = false,
  onClose,
  user,
  onSaveAll,
  onSaveOnly,
  getColumnLabel,
  getControlLabel,
  language,
  selectRows,
}) => {
  const [dropdownValues, setDropdownValues] = useState({
    prod_acno: "",
  });
  const { register, handleSubmit, reset, setValue, control, watch } = useForm({
    defaultValues: {
      prod_acno: "",
      note: "",
    },
  });
  const createShoeCallback = (categoryCode) => {
    return async (page, pageSize, searchText) => {
      try {
        const result = await fetchProdMDropdown(
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
        console.error(`Error fetching basic data ${categoryCode}:`, error);
        return { data: [], total: 0, pageSize };
      }
    };
  };
  const prod_acno = watch("prod_acno");
  useEffect(() => {
    if (!openLink) {
      reset();
      setDropdownValues({
        prod_acno: "",
        note: "",
      });
    }
  }, [openLink, reset]);
  const renderField = (
    fieldName,
    label,
    gridSize = 3,
    extraProps = {},
    type = "text",
  ) => {
    if (fieldName === "prod_acno") {
      return (
        <Grid item xs={gridSize} key={fieldName}>
          <Controller
            name={fieldName}
            control={control}
            render={({ field }) => (
              <Dropdown
                onFetchData={createShoeCallback()}
                onSelect={(selectedItem) => {
                  const value = selectedItem?.prod_acno || "";
                  const note = selectedItem?.note || "";

                  field.onChange(value);

                  setValue("note", note);

                  setDropdownValues((prev) => ({
                    ...prev,
                    prod_acno: value,
                    note: note,
                  }));
                }}
                select={field.value || dropdownValues.prod_acno || ""}
                table="AC_PROD_M_1"
                option="ac_prod_m_1"
                getControlLabel={getControlLabel}
                language={language || "en"}
                field={getColumnLabel(fieldName, label)}
                totalItems={0}
                pageSize={10}
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
          label={getColumnLabel(fieldName, label)}
          type={type}
          InputLabelProps={{ shrink: true }}
          {...register(fieldName, {
            valueAsNumber: type === "number",
          })}
          {...extraProps}
        />
      </Grid>
    );
  };
  const onSubmit = (data) => {
    const mergedData = selectRows.map((row) => ({
      ...row,
      prod_acno: data.prod_acno,
      note: data.note,
    }));
    console.log("before submit", mergedData[0]);

    onSaveOnly(mergedData[0]);
  };
  const onSubmitAll = (data) => {
    const mergedData = selectRows.map((row) => ({
      ...row,
      prod_acno: data.prod_acno,
      note: data.note,
    }));
    onSaveAll(mergedData);
  };
  return (
    <>
      <Dialog open={openLink} onClose={onClose} maxWidth="sm">
        <DialogContent>
          <Box>
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
                {getControlLabel(
                  "ttl_prod_list",
                  "Synchronously write the value of this field to other rows ?",
                )}
              </Typography>
              <Button onClick={onClose} variant="contained" color="error">
                <CloseIcon />
              </Button>
            </Box>
            <Box component="form" onSubmit={handleSubmit(onSubmit)}>
              <Stack
                direction="row"
                flexWrap="wrap"
                sx={{ rowGap: 6, width: "100%" }}
              >
                <div style={{ minWidth: 0, width: "100%", maxWidth: "100%" }}>
                  <Box
                    display={"flex"}
                    alignItems={"center"}
                    justifyContent={"center"}
                    gap={1}
                  >
                    {renderField("prod_acno", "Prod Acno", 2.4)}
                    {renderField("note", "Note", 2.4)}
                  </Box>
                </div>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    width: "100%",
                  }}
                >
                  <Box>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleSubmit(onSubmitAll)}
                    >
                      {getControlLabel("btn_save_all", "Update All")}
                    </Button>
                  </Box>
                  <Box>
                    <Button variant="contained" color="primary" type="submit">
                      {getControlLabel("btn_save_only", "Update Only This")}
                    </Button>
                  </Box>
                  <Box>
                    <Button variant="contained" color="error" onClick={onClose}>
                      {getControlLabel("btn_cancel", "Cancel")}
                    </Button>
                  </Box>
                </Box>
              </Stack>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
};
export default GenegrateProdMPopup;
