import { Dialog, DialogContent } from "@mui/material";
import DataTable from "../table/DataTable";

const ModalTable = ({ data = [], open = false, onClose }) => {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg">
      <DialogContent>
            <div
              style={{ minWidth: 0, width: "100%", maxWidth: "100%" }}
            >
              <DataTable data={data} tableName={"FACTORY"} subTable={true} />
            </div>
      </DialogContent>
    </Dialog>
  );
};
export default ModalTable;
