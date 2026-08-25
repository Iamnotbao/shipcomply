import {
  Box,
  Dialog,
  DialogContent,
} from "@mui/material";

const ModalQr = ({ data = {}, open = false, onClose }) => {
  console.log(data);
  
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogContent>
        <Box component="img" src={data} alt="Qr code" />
      </DialogContent>
    </Dialog>
  );
};
export default ModalQr;
