import AccountTreeRoundedIcon from "@mui/icons-material/AccountTreeRounded";
import SideSelectionList from "../../../../component/table/SideSelectionList";

const DepartmentList = ({ data = [], selectRow, onSelectRow, getControlLabel, name }) => {
  const items = data[0]?.data || [];

  return (
    <SideSelectionList
      title={getControlLabel("mtxt_department", "Department")}
      items={items}
      getKey={(item) => `${item.factory_code}-${item.department_code}`}
      isSelected={(item) =>
        `${selectRow?.factory_code}-${selectRow?.department_code}` ===
        `${item.factory_code}-${item.department_code}`
      }
      onSelect={onSelectRow}
      getPrimary={(item) => item.department_code}
      getSecondary={(item) => item[name]}
      Icon={AccountTreeRoundedIcon}
    />
  );
};

export default DepartmentList;
