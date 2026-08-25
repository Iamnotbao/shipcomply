import BusinessRoundedIcon from "@mui/icons-material/BusinessRounded";
import SideSelectionList from "../../../../component/table/SideSelectionList";

const FactoryList = ({ data = [], selectRow, onSelectRow, getControlLabel, name }) => {
  const items = data[0]?.data || [];

  return (
    <SideSelectionList
      title={getControlLabel("mtxt_factory", "Factory")}
      items={items}
      getKey={(item) => item.factory_code}
      isSelected={(item) => selectRow?.factory_code === item.factory_code}
      onSelect={onSelectRow}
      getPrimary={(item) => item.factory_code}
      getSecondary={(item) => item[name]}
      Icon={BusinessRoundedIcon}
    />
  );
};

export default FactoryList;
