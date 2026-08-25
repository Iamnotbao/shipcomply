import { Stack, TextField } from "@mui/material";
import { useEffect, useState } from "react";
import Dropdown from "../../../component/dropdown/Dropdown";
import FormDialogShell from "../../../component/form/FormDialogShell";
import FormGrid from "../../../component/form/FormGrid";
import FormSection from "../../../component/form/FormSection";
import { fetchPrograms } from "../../../service/program/programService";
import { fnQuery } from "../../../utils/fnQuery";

const AddProgramFieldTitlePage = ({
  open,
  onClose,
  handleAdd,
  selectProgram,
  handleSelectProgram,
  getControlLabel,
  getColumnLabel,
  language = "en",
}) => {
  const [programs, setPrograms] = useState([]);

  useEffect(() => {
    const fetchP = async () => {
      const [programResponse] = await fnQuery([() => fetchPrograms()]);
      if (programResponse) {
        setPrograms(programResponse);
      }
    };

    fetchP();
  }, []);

  return (
    <FormDialogShell
      open={open}
      onClose={onClose}
      onSubmit={handleAdd}
      title={getControlLabel("ttl_add", "Add Program Language Information")}
      submitLabel={getControlLabel("btn_save", "Save")}
      cancelLabel={getControlLabel("btn_cancel", "Cancel")}
      maxWidth="md"
    >
      <Stack spacing={2}>
        <FormSection title={getControlLabel("ftxt_program", "Program Information")}>
          <FormGrid>
            <Dropdown
              key={selectProgram?.program_code || "program"}
              select={selectProgram}
              data={programs?.data}
              onSelect={handleSelectProgram}
              table="PROGRAM"
              option="program"
              getControlLabel={getControlLabel}
              language={language}
            />
            <TextField
              fullWidth
              label={getColumnLabel("field_code", "field_code")}
              name="field_code"
            />
          </FormGrid>
        </FormSection>

        <FormSection title="Localized titles">
          <FormGrid columns={3}>
            <TextField
              fullWidth
              label={getColumnLabel("title_name_t", "title_name_t")}
              name="title_name_t"
            />
            <TextField
              fullWidth
              label={getColumnLabel("title_name_e", "title_name_e")}
              name="title_name_e"
            />
            <TextField
              fullWidth
              label={getColumnLabel("title_name_l", "title_name_l")}
              name="title_name_l"
            />
          </FormGrid>
        </FormSection>
      </Stack>
    </FormDialogShell>
  );
};

export default AddProgramFieldTitlePage;
