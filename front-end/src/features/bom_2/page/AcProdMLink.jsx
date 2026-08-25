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
} from "@mui/material";
import useAuth from "../../../hooks/useAuth";
import CloseIcon from "@mui/icons-material/Close";
import AcItemProdMSizeLink from "./AcProdMSizeLink";
const AcItemProdMLink = ({
  openLink = false,
  onClose,
  selectRows,
  subAuthentication = [],
  rdSizeDData,
  setRdSizeDData,
  selectRdSizeD,
  setSelectRdSizeD,
  hanldeSearchForRDSizeD,
  onSave,
  openSizeLink,
  onOpenSizeLink,
  onCloseSizeLink,
  onDataRSDBySize,
  selectAcProdM,
  setSelectAcProdM,
  getColumnLabel,
  getControlLabel,
  language,
  totalRSDData,
  onRSDPageChange,
  currentRSDOffset,
  currentRSDPage,
  currentRSDPageSize,
  setCurrentRSDPage,
  setCurrentRSDOffset,
  setCurrentRSDPageSize,
  setTotalRSDData,
  setRSDSearchData,
  searchRSDFilter,
  hasRSDMore,
  setHasRSDMore,
  isRSDSearch
}) => {
  const [data, setData] = useState([]);
  const theme = useTheme();
  const isSmUp = useMediaQuery(theme.breakpoints.up("sm"));
  const isMdUp = useMediaQuery(theme.breakpoints.up("md"));
  const isLgUp = useMediaQuery(theme.breakpoints.up("lg"));
  const [selectedItemSizeRefs, setSelectedItemSizeRefs] = useState([]);
  const { user } = useAuth();

  let columns = 1;
  if (isLgUp) columns = 3;
  else if (isMdUp) columns = 2;
  else if (isSmUp) columns = 1;
  else columns = 1;
  const itemWidth =
    data.length > 0 ? `${100 / data.length}%` : `${100 / columns}%`;
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
                {getControlLabel("ttl_detail", "Size Options")}
              </Typography>
              <Button onClick={onClose} variant="contained" color="error">
                <CloseIcon />
              </Button>
            </Box>
            <Stack
              direction="row"
              flexWrap="wrap"
              sx={{ rowGap: 10, width: "100%" }}
            >
              <div style={{ minWidth: 0, width: "100%", maxWidth: "100%" }}>
                <Box display={"flex"} alignItems={"center"} gap={1}>
                  <Typography variant="body2" fontWeight="bold" fontSize="14px">
                    {getControlLabel("ttl_bang_ke_size", "Bang Ke Size")}
                  </Typography>
                  <Paper
                    sx={{
                      p: "2px 4px",
                      display: "flex",
                      alignItems: "center",
                      width: 100,
                    }}
                  >
                    <InputBase
                      sx={{ ml: 1, flex: 1 }}
                      placeholder={"..."}
                      inputProps={{ "aria-label": "name" }}
                      name={"size"}
                      type={"text"}
                      value={selectAcProdM[0]?.bang_ke_size || ""}
                      disabled
                    />
                  </Paper>
                  <Box>
                    <Button
                      variant="contained"
                      color="warning"
                      onClick={onOpenSizeLink}
                    >
                      ...
                    </Button>
                  </Box>
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
                  <Button variant="contained" color="primary" onClick={onClose}>
                    {getControlLabel("btn_save", "Save")}
                  </Button>
                </Box>
                <Box>
                  <Button variant="contained" color="error" onClick={onClose}>
                    {getControlLabel("btn_return", "Return")}
                  </Button>
                </Box>
              </Box>
            </Stack>
          </Box>
        </DialogContent>
      </Dialog>
      <AcItemProdMSizeLink
        openSizeLink={openSizeLink}
        onClose={onCloseSizeLink}
        basicDataCategory={selectRows}
        handleSizeLink={onOpenSizeLink}
        getControlLabel={getControlLabel}
        getColumnLabel={getColumnLabel}
        checkboxSelection={true}
        subAuthentication={subAuthentication}
        user={user}
        selectRows={selectRows.length > 0 ? selectRows : []}
        selectedItemSizeRefs={selectedItemSizeRefs}
        onSelectionChange={setSelectedItemSizeRefs}
        data={rdSizeDData}
        setData={setRdSizeDData}
        selectRdSizeD={selectRdSizeD}
        setSelectRdSizeD={setSelectRdSizeD}
        hanldeSearchForRDSizeD={hanldeSearchForRDSizeD}
        onSave={onSave}
        onDataRSDBySize={onDataRSDBySize}
        setSelectAcProdM={setSelectAcProdM}
        language={language}
        totalData={totalRSDData}
        onPageChange={onRSDPageChange}
        currentOffset={currentRSDOffset}
        currentPage={currentRSDPage}
        currentPageSize={currentRSDPageSize}
        setCurrentPage={setCurrentRSDPage}
        setCurrentOffset={setCurrentRSDOffset}
        setCurrentPageSize={setCurrentRSDPageSize}
        setTotalData={setTotalRSDData}
        setSearchData={setRSDSearchData}
        searchFilter={searchRSDFilter}
        hasMore={hasRSDMore}
        setHasMore={setHasRSDMore}
        isSearch={isRSDSearch}
      />
    </>
  );
};
export default AcItemProdMLink;
