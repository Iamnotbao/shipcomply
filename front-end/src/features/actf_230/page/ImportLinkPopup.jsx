import {
  Box,
  Button,
  Dialog,
  DialogContent,
  Stack,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

const ImportLinkPopup = ({
  openLink = false,
  onClose,
  onImportLink,
  onImportLink1,
  onImportLink2,
  onImportLink3,
  onImportLink4,
  onImportLink5,
  getControlLabel,
  isSmall,
}) => {
  return (
    <Dialog open={openLink} onClose={onClose} maxWidth="sm">
      <DialogContent>
        <Box>
          <Box display="flex" alignItems="center" justifyContent="center" mb={2}>
            <Typography
              variant="h4"
              textTransform="uppercase"
              fontWeight={600}
              gutterBottom
              textAlign="center"
              flex={1}
              mb="0"
            >
              {getControlLabel("ttl_import_link", "Import Link")}
            </Typography>
            <Button onClick={onClose} variant="contained" color="error">
              <CloseIcon />
            </Button>
          </Box>

          <Stack direction="row" flexWrap="wrap" sx={{ rowGap: 6, width: "100%" }}>
            <Box display="flex" alignItems="center" justifyContent="center" gap={1} width="100%">
              {isSmall ? (
                <>
                  <Button variant="contained" color="warning" onClick={onImportLink}>
                    {getControlLabel("btn_import_link_1", "ACTR_230.rdf")}
                  </Button>
                  <Button variant="contained" color="warning" onClick={onImportLink1}>
                    {getControlLabel("btn_import_link_2", "ACTR_2301.rdf")}
                  </Button>
                  <Button variant="contained" color="warning" onClick={onImportLink2}>
                    {getControlLabel("btn_import_link_3", "ACTR_2311.rdf")}
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="contained" color="warning" onClick={onImportLink3}>
                    {getControlLabel("btn_import_link_4", "ACTR_231.rdf")}
                  </Button>
                  <Button variant="contained" color="warning" onClick={onImportLink4}>
                    {getControlLabel("btn_import_link_5", "ACTR_2302.rdf")}
                  </Button>
                  <Button variant="contained" color="warning" onClick={onImportLink5}>
                    {getControlLabel("btn_import_link_6", "ACTR_2312.rdf")}
                  </Button>
                </>
              )}
            </Box>

            <Box display="flex" alignItems="center" justifyContent="flex-end" width="100%">
              <Button variant="contained" color="error" onClick={onClose}>
                {getControlLabel("btn_cancel", "Cancel")}
              </Button>
            </Box>
          </Stack>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default ImportLinkPopup;