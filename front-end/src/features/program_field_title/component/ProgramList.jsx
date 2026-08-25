import AppsRoundedIcon from "@mui/icons-material/AppsRounded";
import SideSelectionList from "../../../component/table/SideSelectionList";

const ProgramList = ({ data = [], selectRow, onSelectRow, getControlLabel, name }) => {
  const items = data[0]?.data || [];

  return (
    <SideSelectionList
      title={getControlLabel("mtxt_program", "Program")}
      items={items}
      getKey={(item) => item.program_code}
      isSelected={(item) => selectRow?.program_code === item.program_code}
      onSelect={onSelectRow}
      getPrimary={(item) => item.program_code}
      getSecondary={(item) => item[name]}
      Icon={AppsRoundedIcon}
    />
  );
};

export default ProgramList;
