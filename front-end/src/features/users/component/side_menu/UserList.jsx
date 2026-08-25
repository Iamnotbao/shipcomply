import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import SideSelectionList from "../../../../component/table/SideSelectionList";

const UserList = ({ data = [], selectRow = {}, onSelectRow, getControlLabel, name }) => {
  const items = data[0]?.data || [];

  return (
    <SideSelectionList
      title={getControlLabel("mtxt_user", "User")}
      items={items}
      getKey={(item) => `${item.user_code}-${item.department_code}-${item.factory_code}`}
      isSelected={(item) =>
        `${selectRow?.user_code}-${selectRow?.department_code}-${selectRow?.factory_code}` ===
        `${item.user_code}-${item.department_code}-${item.factory_code}`
      }
      onSelect={onSelectRow}
      getPrimary={(item) => item.user_code}
      getSecondary={(item) => item[name]}
      Icon={PersonRoundedIcon}
    />
  );
};

export default UserList;
