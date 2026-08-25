import { lazy, useEffect, useState } from "react";
const DataTable = withSuspense(
  lazy(() => import("../../component/table/DataTable"))
);
import {
  Box,
  Container,
  Skeleton,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { fnQuery } from "../../utils/fnQuery";
import withSuspense from "../../component/suspense/Suspense";
import useAuth from "../../hooks/useAuth";
const AcProdRef = () => {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");
  const theme = useTheme();
  const isSmUp = useMediaQuery(theme.breakpoints.up("sm"));
  const isMdUp = useMediaQuery(theme.breakpoints.up("md"));
  const isLgUp = useMediaQuery(theme.breakpoints.up("lg"));
  const {user} = useAuth();
  useEffect(() => {
    const fetch = async () => {
      const combinedData = await fnQuery([()=>fetchProdRef(user.access_token)]);
      setData(combinedData);
    };
    fetch();
  }, []);
  // const handleSearch=async()=>{
  //     const response = await fnQuery([()=>SearchScheduleByModelNo(search)]);
  //     if(response){
  //         setData(response)
  //     }
  // }
  // useEffect(()=>{
  //     if(search!==null){
  //         handleSearch();
  //     }
  // },[search])
  let columns = 1;
  if (isLgUp) columns = 3;
  else if (isMdUp) columns = 2;
  else if (isSmUp) columns = 1;
  else columns = 1;
  const itemWidth =
    data.length > 0 ? `${100 / data.length}%` : `${100 / columns}%`;
  return (
    <>
      <Box sx={{ p: 2 }}>
        <Container maxWidth="xl">
          <Typography
            variant="h5"
            gutterBottom
            component="div"
            textAlign={"center"}
            sx={{ mb: 2 }}
          >
            {data.length > 0 ? data[0].tableName : "Loading...."}
          </Typography>
          <Stack
            direction="row"
            flexWrap="wrap"
            sx={{ rowGap: 1,  width: "100%" }}
          >
            {data.length > 0 &&
              data.map((item, index) => (
                <div key={index} style={{ minWidth: 0,  width: "100%",maxWidth: "100%" }}>
                  <DataTable data={item.data} tableName={item.tableName} />
                </div>
              ))}
          </Stack>
        </Container>
      </Box>

      {data.length === 0 && (
        <Stack direction="row" flexWrap="wrap" sx={{ rowGap: 1 }}>
          <div style={{ width: itemWidth, minWidth: 0 }}>
            <Skeleton animation="wave" variant="rectangular" height={600} />
          </div>
        </Stack>
      )}
    </>
  );
};
export default AcProdRef;
