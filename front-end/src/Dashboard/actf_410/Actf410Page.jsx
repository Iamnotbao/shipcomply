import { Box, Container, Paper, Stack } from "@mui/material";

import AcVendBase from "../../features/actf_410/component/AcVendBase";
import AcSendBase from "../../features/actf_410/component/AcSendBase";

const Actf410Page = () => {
  return (
    <>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
        }}
      >
        <Box>
          <AcVendBase />
        </Box>
        <Box>
          <AcSendBase />
        </Box>
      </Box>
    </>
  );
};

export default Actf410Page;
