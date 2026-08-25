import { TextField } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import FormGrid from "../../../component/form/FormGrid";
import FormPageShell from "../../../component/form/FormPageShell";
import FormSection from "../../../component/form/FormSection";
import useAuth from "../../../hooks/useAuth";
import { addShoe } from "../../../service/ac_shoe_m/ShoesService";

const AcShoeMAddPage = () => {
  const today = new Date().toISOString().slice(0, 19).replace("T", " ");
  const { user } = useAuth();
  const navigation = useNavigate();
  const { t } = useTranslation();

  const handleAddShoe = async (event) => {
    event.preventDefault();
    const form = new FormData(event.target);
    const data = Object.fromEntries(form.entries());
    data.factory_code = user.factory_code;
    data.grt_user = user.user_id;
    data.last_user = user.user_id;
    data.grt_date = today;
    data.last_date = today;

    try {
      const response = await addShoe(data, user.access_token);
      if (response.success) {
        toast.success("Add successfully !!!");
      }
    } catch (error) {
      console.log("data has been problem", error);
    }
  };

  return (
    <FormPageShell
      title={t("Add Shoe Information")}
      onBack={() => navigation("/ac_shoe_m")}
      onSubmit={handleAddShoe}
      submitLabel={t("Save")}
    >
      <FormSection title={t("Main Information")}>
        <FormGrid columns={3}>
          <TextField
            fullWidth
            label="Factory Name"
            value={user.factory_name_e || ""}
            InputLabelProps={{ shrink: true }}
            disabled
          />
          <TextField
            fullWidth
            label="Customs Shoe ID"
            name="customs_shoe_id"
          />
          <TextField
            fullWidth
            label="Customs Shoe Name L"
            name="customs_shoe_name_l"
          />
          <TextField
            fullWidth
            label="Customs Shoe Name T"
            name="customs_shoe_name_t"
          />
          <TextField
            fullWidth
            label="Customs Shoe Name E"
            name="customs_shoe_name_e"
          />
        </FormGrid>
      </FormSection>

      <FormSection title={t("Tax Information")}>
        <FormGrid columns={3}>
          <TextField
            fullWidth
            label="Customs Tariff"
            name="customs_tariff"
          />
          <TextField fullWidth label="Size Type" name="size_type" />
          <TextField fullWidth label="Unit" name="unit" />
          <TextField
            fullWidth
            label="Tax Per"
            type="number"
            inputProps={{ min: 0 }}
            name="tax_per"
          />
          <TextField
            fullWidth
            label="Status"
            type="number"
            inputProps={{ min: 0 }}
            name="status"
          />
        </FormGrid>
      </FormSection>

      <FormSection title={t("Audit Information")}>
        <FormGrid columns={3}>
          <TextField fullWidth label="GRT Dept" name="grt_dept" />
          <TextField
            fullWidth
            label="GRT User"
            value={user.user_id || ""}
            InputLabelProps={{ shrink: true }}
            disabled
          />
          <TextField
            fullWidth
            label="GRT Date"
            value={today}
            InputLabelProps={{ shrink: true }}
            disabled
          />
          <TextField
            fullWidth
            label="Last User"
            value={user.user_id || ""}
            InputLabelProps={{ shrink: true }}
            disabled
          />
          <TextField
            fullWidth
            label="Last Date"
            value={today}
            InputLabelProps={{ shrink: true }}
            disabled
          />
        </FormGrid>
      </FormSection>
    </FormPageShell>
  );
};

export default AcShoeMAddPage;
