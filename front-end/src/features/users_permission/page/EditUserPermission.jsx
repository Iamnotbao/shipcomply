import { Box, CircularProgress, Stack } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import ControlledSelectField from "../../../component/form/ControlledSelectField";
import FormDialogShell from "../../../component/form/FormDialogShell";
import FormGrid from "../../../component/form/FormGrid";
import FormSection from "../../../component/form/FormSection";
import ReadOnlyField from "../../../component/form/ReadOnlyField";
import { fetchPermissionByID } from "../../../service/users_permission/UsersPermission";

const EditUserPermission = ({
  open,
  onClose,
  userPermisison,
  selectFactory,
  selectDepartment,
  handleEdit,
  getControlLabel,
  getColumnLabel,
  language,
}) => {
  const [permissionData, setPermissionData] = useState(null);
  const [loading, setLoading] = useState(false);

  const { handleSubmit, control, reset } = useForm({
    defaultValues: {
      allow_close: "Y",
      query_level: "1",
    },
  });

  const nameBasedOnLanguage = {
    DEPARTMENTS: {
      en: "department_name_e",
      vi: "department_name_l",
      zh: "department_name_t",
    },
    FACTORY: {
      en: "factory_name_e",
      vi: "factory_name_l",
      zh: "factory_name_t",
    },
    PROGRAM: {
      en: "program_name_e",
      vi: "program_name_l",
      zh: "program_name_t",
    },
  };

  useEffect(() => {
    if (!userPermisison || !open) return;

    const fetchPerById = async () => {
      setLoading(true);
      try {
        const response = await fetchPermissionByID(
          userPermisison.factory_code,
          userPermisison.department_code,
          userPermisison.user_code,
          userPermisison.program_code,
        );
        const data = response?.data || response;
        if (data) {
          setPermissionData(data);
          reset({
            ...data,
            status: data?.status ?? "0",
            allow_close: data?.allow_close ?? "Y",
            query_level: data?.query_level ?? "1",
          });
        }
      } catch (error) {
        console.error("Error fetching permission:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPerById();
  }, [open, reset, userPermisison]);

  const levelOptions = useMemo(
    () => [
      { value: "1", label: getControlLabel("ddl_factory", "Factory") },
      {
        value: "2",
        label: getControlLabel("ddl_department", "Department"),
      },
      { value: "3", label: getControlLabel("ddl_user", "User") },
    ],
    [getControlLabel],
  );

  const yesNoOptions = useMemo(
    () => [
      { value: "Y", label: "Y" },
      { value: "N", label: "N" },
    ],
    [],
  );

  const permissionFields = [
    "allow_query",
    "allow_add",
    "allow_modify",
    "allow_delete",
    "allow_cancel",
    "allow_confirm",
    "allow_close",
  ];

  const factoryNameKey = nameBasedOnLanguage.FACTORY[language] || "factory_name_e";
  const departmentNameKey =
    nameBasedOnLanguage.DEPARTMENTS[language] || "department_name_e";
  const programNameKey = nameBasedOnLanguage.PROGRAM[language] || "program_name_e";
  const submitForm = handleSubmit(handleEdit);

  return (
    <FormDialogShell
      open={open}
      onClose={onClose}
      onSubmit={submitForm}
      title={getControlLabel("ttl_edit", "Edit User Permission Information")}
      submitLabel={getControlLabel("btn_save", "Save")}
      cancelLabel={getControlLabel("btn_cancel", "Cancel")}
      submitDisabled={loading}
      maxWidth="lg"
    >
      {loading ? (
        <Box
          sx={{
            minHeight: 320,
            display: "grid",
            placeItems: "center",
          }}
        >
          <CircularProgress />
        </Box>
      ) : (
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
            title={getControlLabel(
              "ftxt_fac_dept",
              "Factory and Department Information",
            )}
          >
            <FormGrid>
              <ReadOnlyField
                label={getControlLabel("txt_factory_code", "factory_code")}
                value={
                  permissionData?.factory_code || selectFactory?.factory_code || ""
                }
              />
              <ReadOnlyField
                label={getControlLabel("txt_factory_name", "factory_name")}
                value={selectFactory?.[factoryNameKey] || ""}
              />
              <ReadOnlyField
                label={getControlLabel("txt_department_code", "department_code")}
                value={
                  permissionData?.department_code ||
                  selectDepartment?.department_code ||
                  ""
                }
              />
              <ReadOnlyField
                label={getControlLabel("txt_department_name", "department_name")}
                value={selectDepartment?.[departmentNameKey] || ""}
              />
            </FormGrid>
          </FormSection>

          <FormSection title={getControlLabel("ftxt_program", "Program Information")}>
            <FormGrid>
              <ReadOnlyField
                label={getControlLabel("txt_program_code", "program_code")}
                value={
                  permissionData?.program_code ||
                  permissionData?.PROGRAM?.program_code ||
                  ""
                }
              />
              <ReadOnlyField
                label={getControlLabel("txt_program_name", "program_name")}
                value={permissionData?.PROGRAM?.[programNameKey] || ""}
              />
            </FormGrid>
          </FormSection>

          <FormSection title="Access scope">
            <FormGrid>
              <ControlledSelectField
                name="modify_level"
                control={control}
                label={getColumnLabel("modify_level", "modify_level")}
                options={levelOptions}
              />
              <ControlledSelectField
                name="query_level"
                control={control}
                label={getColumnLabel("query_level", "query_level")}
                options={levelOptions}
              />
            </FormGrid>
          </FormSection>

          <FormSection title="Allowed actions">
            <FormGrid columns={3}>
              {permissionFields.map((fieldName) => (
                <ControlledSelectField
                  key={fieldName}
                  name={fieldName}
                  control={control}
                  label={getColumnLabel(fieldName, fieldName)}
                  options={yesNoOptions}
                />
              ))}
            </FormGrid>
          </FormSection>
        </Stack>
      )}
    </FormDialogShell>
  );
};

export default EditUserPermission;
