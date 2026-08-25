import { TextField } from "@mui/material";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import FormGrid from "../../../component/form/FormGrid";
import FormPageShell from "../../../component/form/FormPageShell";
import FormSection from "../../../component/form/FormSection";
import useAuth from "../../../hooks/useAuth";
import { editShoe } from "../../../service/ac_shoe_m/ShoesService";

const AcShoeMEditPage = () => {
  const { factory_code, customs_shoe_id } = useParams();
  const location = useLocation();
  const shoe = location.state;
  const { register, handleSubmit } = useForm({ defaultValues: shoe });
  const { user } = useAuth();
  const navigation = useNavigate();
  const { t } = useTranslation();

  const handleEditShoe = async (data) => {
    try {
      const response = await editShoe(
        factory_code,
        customs_shoe_id,
        data,
        user.access_token,
      );

      if (response.success) {
        toast.success(
          `Edit shoe with factory code(${factory_code}) successfully !!!`,
        );
      }
    } catch (error) {
      console.log("data has been problem", error);
    }
  };

  return (
    <FormPageShell
      title={t("Edit Shoe Information")}
      onBack={() => navigation("/ac_shoe_m")}
      onSubmit={handleSubmit(handleEditShoe)}
      submitLabel={t("Save")}
    >
      <FormSection title={t("Main Information")}>
        <FormGrid columns={3}>
          <TextField
            fullWidth
            label="Factory Code"
            value={factory_code || ""}
            InputLabelProps={{ shrink: true }}
            disabled
          />
          <TextField
            fullWidth
            label="Customs Shoe ID"
            value={customs_shoe_id || ""}
            InputLabelProps={{ shrink: true }}
            disabled
          />
          <TextField
            fullWidth
            label="Customs Shoe Name L"
            {...register("customs_shoe_name_l")}
          />
          <TextField
            fullWidth
            label="Customs Shoe Name T"
            {...register("customs_shoe_name_t")}
          />
          <TextField
            fullWidth
            label="Customs Shoe Name E"
            {...register("customs_shoe_name_e")}
          />
        </FormGrid>
      </FormSection>

      <FormSection title={t("Tax Information")}>
        <FormGrid columns={3}>
          <TextField
            fullWidth
            label="Customs Tariff"
            {...register("customs_tariff")}
          />
          <TextField fullWidth label="Size Type" {...register("size_type")} />
          <TextField fullWidth label="Unit" {...register("unit")} />
          <TextField fullWidth label="Tax Per" {...register("tax_per")} />
          <TextField fullWidth label="Status" {...register("status")} />
        </FormGrid>
      </FormSection>

      <FormSection title={t("Audit Information")}>
        <FormGrid columns={3}>
          <TextField fullWidth label="GRT Dept" {...register("grt_dept")} />
          <TextField
            fullWidth
            label="GRT User"
            {...register("grt_user")}
            InputLabelProps={{ shrink: true }}
            disabled
          />
          <TextField
            fullWidth
            label="GRT Date"
            {...register("grt_date")}
            InputLabelProps={{ shrink: true }}
            disabled
          />
          <TextField
            fullWidth
            label="Last User"
            {...register("last_user")}
            InputLabelProps={{ shrink: true }}
            disabled
          />
          <TextField
            fullWidth
            label="Last Date"
            {...register("last_date")}
            InputLabelProps={{ shrink: true }}
            disabled
          />
        </FormGrid>
      </FormSection>
    </FormPageShell>
  );
};

export default AcShoeMEditPage;
