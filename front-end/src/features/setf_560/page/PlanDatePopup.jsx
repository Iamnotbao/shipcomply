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
const PlanDatePopup = ({
  openLink = false,
  onClose,
  getControlLabel,
  getColumnLabel,
  handlePlanDate,
}) => {
  return (
    <>
      <Dialog open={openLink} onClose={onClose} maxWidth="xl">
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
                fontWeight={600}
                gutterBottom
                textAlign={"center"}
                flex={1}
                mb={"0"}
              >
                {getControlLabel("ttl_detail", "Plan Date Shipping")}
              </Typography>
              <Button onClick={onClose} variant="contained" color="error">
                <CloseIcon />
              </Button>
            </Box>

            <Box
              component="form"
              onSubmit={handlePlanDate}
              sx={{ width: "100%" }}
            >
              <Stack
                direction="row"
                flexWrap="wrap"
                sx={{ rowGap: 2, width: "100%" }}
              >
                <div style={{ minWidth: 0, width: "100%", maxWidth: "100%" }}>
                  <Box display={"flex"} alignItems={"center"} gap={1}>
                    <Typography
                      variant="body2"
                      fontWeight="bold"
                      fontSize="14px"
                    >
                      {getControlLabel("ttl_plan_date", "Plan Date")}
                      <span style={{ color: "red" }}>*</span>
                    </Typography>

                 
                      <TextField
                        fullWidth
                        label={getColumnLabel("plan_date", "Plan Date")}
                        InputLabelProps={{ shrink: true }}
                        inputProps={{
                          readOnly: false, 
                        }}
                        type="date"
                        name="plan_date"
                        required 
                      />
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
                    <Button type="submit" variant="contained" color="primary">
                      {getControlLabel("btn_save", "Save")}
                    </Button>
                  </Box>

                  <Box>
                    <Button
                      type="button"
                      variant="contained"
                      color="error"
                      onClick={onClose}
                    >
                      {getControlLabel("btn_return", "Return")}
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
export default PlanDatePopup;
