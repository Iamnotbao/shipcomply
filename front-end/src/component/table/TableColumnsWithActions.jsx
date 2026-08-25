import { useTranslation } from "react-i18next";
import ActionButtons from "./ActionButtons";
import TableColumns from "./TableColumns";
import ButtonShowDepartments from "../button/ButtonShowDepartment";

const getColumnWithActions = (
  tableName,
  handleEdit,
  handleDelete,
  handleDetail,
  handleQr,
  handleBar,
  subTable,
  handleOnDepartment
) => {
  const { t } = useTranslation();
  return [
    ...(TableColumns[tableName] ?? [])
  ];
};
export default getColumnWithActions;
