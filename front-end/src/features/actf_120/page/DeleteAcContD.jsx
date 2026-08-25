import { useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  Stack,
  useMediaQuery,
  useTheme,
  Typography,
  InputBase,
  Paper,
  TextField,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
const DeleteAcContD = ({
  openLink = false,
  onClose,
  getControlLabel,
  getColumnLabel,
  onDelete,
  selectRows
}) => {
  return (
    <>
      <Dialog open={openLink} onClose={onClose} maxWidth="sm">
        <DialogContent>
          <Box>
            <Box
              display={"flex"}
              alignItems={"center"}
              justifyContent={"center"}
              mb={2}
            >
              <Typography
                variant="h4"
                textTransform={"uppercase"}
                fontWeight={"bold"}
                color="red"
                gutterBottom
                textAlign={"center"}
                flex={1}
                mb={"0"}
              >
                {getControlLabel("ttl_delete", "Delete Master")}
              </Typography>
              <Button onClick={onClose} variant="contained" color="error">
                <CloseIcon />
              </Button>
            </Box>

            <Box  sx={{ width: "100%" }}>
              <Stack
                direction="row"
                flexWrap="wrap"
                sx={{ rowGap: 2, width: "100%" }}
              >
                <div style={{ minWidth: 0, width: "100%", maxWidth: "100%" }}>
                  <Box display={"flex"} alignItems={"center"} gap={1}>
                    <Typography
                      variant="h7"
                      fontWeight="bold"
                    >
                      {getControlLabel("ttl_delete_content", `Do you want to delete the record with id: ${selectRows[0]?.seq}`)}
                      <span style={{ color: "red" }}>*</span>
                    </Typography>
                  </Box>
                </div>

                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    width: "100%",
                  }}
                >
                  <Box>
                    <Button onClick={onDelete} variant="contained" color="primary">
                      {getControlLabel("btn_confirm", "Confirm")}
                    </Button>
                  </Box>

                  <Box>
                    <Button
                      type="button"
                      variant="contained"
                      color="error"
                      onClick={onClose}
                    >
                      {getControlLabel("btn_cancel", "Cancel")}
                    </Button>
                  </Box>
                </Box>
              </Stack>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
};
export default DeleteAcContD;
