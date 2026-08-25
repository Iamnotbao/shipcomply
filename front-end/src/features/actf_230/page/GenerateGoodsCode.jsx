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
import { fetchShoeDropdown } from "../../../service/ac_shoe_m/AcShoeMService";
import { Controller, useForm } from "react-hook-form";
import Dropdown from "../../../component/dropdown/Dropdown";
import { useEffect, useState } from "react";
const GenegrateGoodsCode = ({
  openLink = false,
  onClose,
  user,
  onSave,
  getControlLabel,
  getColumnLabel,
  language,
}) => {
  const [dropdownValues, setDropdownValues] = useState({
    customs_shoe_id: "",
  });
  const { register, handleSubmit, reset, setValue, control, watch } = useForm({
    defaultValues: {
      customs_shoe_id: "",
      shoe_name: "",
    },
  });
  const createShoeCallback = (categoryCode) => {
    return async (page, pageSize, searchText) => {
      try {
        const result = await fetchShoeDropdown(
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
  const customs_shoe_id = watch("customs_shoe_id");
  useEffect(() => {
    if (customs_shoe_id) {
      setValue("shoe_name", dropdownValues.shoe_name);
    }
  }, [customs_shoe_id]);
   useEffect(() => {
    if (!openLink) {
      reset();
      setDropdownValues({
        customs_shoe_id: "",
        shoe_name: "",
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
    if (fieldName === "customs_shoe_id") {
      return (
        <Grid item xs={gridSize} key={fieldName}>
          <Controller
            name={fieldName}
            control={control}
            render={({ field }) => (
              <Dropdown
                onFetchData={createShoeCallback()}
                onSelect={(selectedItem) => {
                  const value = selectedItem?.customs_shoe_id || "";
                  field.onChange(value);
                  setDropdownValues((prev) => ({
                    ...prev,
                    customs_shoe_id: value,
                    shoe_name: selectedItem?.shoe_name || "",
                  }));
                }}
                select={field.value || dropdownValues.customs_shoe_id || ""}
                table="AC_SHOE_M_1"
                option="ac_shoe_m_1"
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
    onSave(data);
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
                {getControlLabel("ttl_shoe_list", "Shoe List")}
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
                    {renderField("customs_shoe_id", "Shoe Id", 2.4)}
                    {renderField("shoe_name", "Shoe Name", 2.4)}
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
                    <Button variant="contained" color="primary" type="submit">
                      {getControlLabel("btn_save", "Ok")}
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
export default GenegrateGoodsCode;
