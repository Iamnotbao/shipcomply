import { Box, Stack, TextField } from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import Dropdown from "../../../component/dropdown/Dropdown";
import FormDialogShell from "../../../component/form/FormDialogShell";
import FormGrid from "../../../component/form/FormGrid";
import FormSection from "../../../component/form/FormSection";
import ReadOnlyField from "../../../component/form/ReadOnlyField";
import { fetchAllAcProdMByID } from "../../../service/ac_prod_m/AcProdMService";
import {
  fetchRSDByID,
  fetchRSDBySize,
  fetchRSDBySizeDropdown,
} from "../../../service/rd_size_d/RdSizeDService";
import { fnQuery } from "../../../utils/fnQuery";

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
  const { register, handleSubmit, control, reset, setValue } = useForm({
    defaultValues: { ...acProdM },
  });
  const [factory, setFactory] = useState({});
  const [acShoeM, setAcShoeM] = useState({});
  const [dropdownValues, setDropdownValues] = useState({});
  const [loading, setLoading] = useState(false);

  const getStatusText = (status) => {
    if (status === 1) return "New-1";
    if (status === 0) return "Cancel-0";
    if (status === 7) return "Confirm-7";
    if (status === 9) return "Close-9";
    return "New-1";
  };

  useEffect(() => {
    if (!open) {
      setDropdownValues({});
      setFactory({});
      setAcShoeM({});
      reset({});
      return;
    }

    const fetchAllDropdowns = async () => {
      try {
        const allow = Array.isArray(auth)
          ? auth.find((item) => item.field === "query_level")?.title
          : null;
        setLoading(true);
        await fetchRSDBySize(
          selectRows?.[0]?.factory_code,
          selectRows?.[0]?.size_type,
          user?.department,
          user?.user_code,
          allow,
        );
      } catch (error) {
        console.error("Error fetching dropdowns:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllDropdowns();
  }, [auth, open, reset, selectRows, user?.department, user?.user_code]);

  useEffect(() => {
    if (!open || !acProdM || Object.keys(acProdM).length === 0) return;

    reset({
      ...acProdM,
      statusText: getStatusText(acProdM.status),
      start_size: acProdM.start_size || "",
      s_seq: acProdM.s_seq || "",
      end_size: acProdM.end_size || "",
      e_seq: acProdM.e_seq || "",
    });
    setDropdownValues({
      start_size: acProdM.start_size || "",
      s_seq: acProdM.s_seq || "",
      end_size: acProdM.end_size || "",
      e_seq: acProdM.e_seq || "",
    });
  }, [acProdM, open, reset]);

  useEffect(() => {
    if (
      !open ||
      !acProdM?.factory_code ||
      !acProdM?.customs_shoe_id ||
      !acProdM?.prod_acno
    ) {
      return;
    }

    const fetchByID = async () => {
      const response = await fnQuery([
        () =>
          fetchAllAcProdMByID(
            acProdM.factory_code,
            acProdM.customs_shoe_id,
            acProdM.prod_acno,
          ),
      ]);
      if (response?.[0]?.success) {
        setFactory(response[0].data?.FACTORY || {});
        setAcShoeM(response[0].data?.SHOE || {});
      }
    };

    fetchByID();
  }, [acProdM, open]);

  const createDropdownCallback = () =>
    async (page, pageSize, searchText) => {
      try {
        const allow = Array.isArray(auth)
          ? auth.find((item) => item.field === "query_level")?.title
          : "1";
        const result = await fetchRSDBySizeDropdown(
          user?.factory,
          selectRows?.[0]?.size_type,
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
      } catch {
        return { data: [], total: 0, pageSize };
      }
    };

  const handleSizeSelect = async (selectedItem, fieldSize, fieldSubSize) => {
    const sizeNo = selectedItem?.size_no || "";
    const response = await fetchRSDByID(
      selectedItem?.factory_code,
      selectedItem?.size_type,
      sizeNo,
    );
    const sizeSeq = response?.data?.size_seq || "";

    setDropdownValues((prev) => ({
      ...prev,
      [fieldSize]: sizeNo,
      [fieldSubSize]: sizeSeq,
    }));
    setValue(fieldSize, sizeNo, { shouldDirty: true, shouldValidate: true });
    setValue(fieldSubSize, sizeSeq, { shouldDirty: true, shouldValidate: true });
  };

  const handleDecimalInput =
    (decimals = 4) =>
    (event) => {
      event.target.value = event.target.value.replace(
        new RegExp(`(\\.\\d{${decimals}})\\d+`),
        "$1",
      );
    };

  const renderSizeDropdown = (fieldName, label) => {
    const subFieldName = fieldName === "start_size" ? "s_seq" : "e_seq";
    return (
      <Controller
        key={fieldName}
        name={fieldName}
        control={control}
        defaultValue={acProdM?.[fieldName] || ""}
        render={({ field }) => (
          <Dropdown
            onFetchData={createDropdownCallback()}
            onSelect={(selectedItem) =>
              handleSizeSelect(selectedItem, fieldName, subFieldName)
            }
            select={dropdownValues[fieldName] || field.value || ""}
            table="AC_SHOE_M"
            option="ac_shoe_m"
            getControlLabel={getControlLabel}
            language={user?.language || "en"}
            field={getColumnLabel(fieldName, label)}
            totalItems={0}
            pageSize={10}
          />
        )}
      />
    );
  };

  const renderSequence = (fieldName, label) => {
    const value = dropdownValues[fieldName] || "";
    return (
      <Box key={fieldName} sx={{ minWidth: 0 }}>
        <ReadOnlyField
          label={getColumnLabel(fieldName, label)}
          value={value}
          placeholder="Auto-filled when selecting size"
        />
        <input type="hidden" {...register(fieldName)} value={value} />
      </Box>
    );
  };

  const submitForm = handleSubmit(handleEdit);

  return (
    <FormDialogShell
      open={open}
      onClose={() => onClose(null)}
      onSubmit={submitForm}
      title={getControlLabel("ttl_d_2_edit_1", "Edit Ac Prod M Information")}
      submitLabel={getControlLabel("btn_save", "Save")}
      cancelLabel={getControlLabel("btn_cancel", "Cancel")}
      submitDisabled={loading}
      maxWidth="xl"
    >
      <Stack
        spacing={2}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            submitForm();
          }
        }}
      >
        <FormSection
          title={getControlLabel("ftxt_m_fac_dept", "Factory Information")}
        >
          <FormGrid columns={3}>
            <ReadOnlyField
              label={getControlLabel("txt_m_factory_name_t", "factory_name_t")}
              value={factory?.factory_name_t}
            />
            <ReadOnlyField
              label={getControlLabel("txt_m_factory_name_e", "factory_name_e")}
              value={factory?.factory_name_e}
            />
            <ReadOnlyField
              label={getControlLabel("txt_m_factory_name_l", "factory_name_l")}
              value={factory?.factory_name_l}
            />
            <ReadOnlyField
              label={getControlLabel("txt_m_factory_address", "factory_address")}
              value={factory?.factory_address}
            />
            <ReadOnlyField
              label={getControlLabel(
                "txt_m_factory_abbreviation",
                "factory_abbreviation",
              )}
              value={factory?.factory_abbreviation}
            />
            <ReadOnlyField
              label={getControlLabel("txt_m_factory_tax_no", "factory_tax_no")}
              value={factory?.factory_tax_no}
            />
          </FormGrid>
        </FormSection>

        <FormSection
          title={getControlLabel("ftxt_ac_shoe_m", "Ac Shoe M Information")}
        >
          <FormGrid columns={3}>
            <ReadOnlyField
              label={getControlLabel(
                "txt_customs_shoe_name_l",
                "customs_shoe_name_l",
              )}
              value={acShoeM?.customs_shoe_name_l}
            />
            <ReadOnlyField
              label={getControlLabel(
                "txt_customs_shoe_name_t",
                "customs_shoe_name_t",
              )}
              value={acShoeM?.customs_shoe_name_t}
            />
            <ReadOnlyField
              label={getControlLabel(
                "txt_customs_shoe_name_e",
                "customs_shoe_name_e",
              )}
              value={acShoeM?.customs_shoe_name_e}
            />
          </FormGrid>
        </FormSection>

        <FormSection title="Product identity">
          <FormGrid>
            <TextField
              fullWidth
              label={getColumnLabel("prod_acno", "prod_acno")}
              {...register("prod_acno")}
              InputLabelProps={{ shrink: true }}
              disabled
            />
            <TextField
              fullWidth
              label={getColumnLabel("status", "status")}
              {...register("statusText")}
              InputLabelProps={{ shrink: true }}
              disabled
            />
          </FormGrid>
        </FormSection>

        <FormSection title="Size range and grading">
          <FormGrid columns={2}>
            {renderSizeDropdown("start_size", "Start Size")}
            {renderSequence("s_seq", "S Seq")}
            {renderSizeDropdown("end_size", "End Size")}
            {renderSequence("e_seq", "E Seq")}
            <TextField
              fullWidth
              label={getColumnLabel("pt_per", "Grading Ratio")}
              type="number"
              InputLabelProps={{ shrink: true }}
              inputProps={{
                step: "0.01",
                min: 0,
                onInput: handleDecimalInput(2),
              }}
              {...register("pt_per", {
                setValueAs: (value) =>
                  value === "" || value === undefined ? null : Number(value),
              })}
            />
          </FormGrid>
        </FormSection>

        <FormSection title="Notes">
          <Stack spacing={1.5}>
            <ReadOnlyField
              label={getColumnLabel("bang_ke_size", "bang_ke_size")}
              value={acProdM?.bang_ke_size}
            />
            <TextField
              fullWidth
              label={getColumnLabel("note", "note")}
              multiline
              minRows={2}
              {...register("note")}
            />
          </Stack>
        </FormSection>
      </Stack>
    </FormDialogShell>
  );
};

export default EditAcProdM;
