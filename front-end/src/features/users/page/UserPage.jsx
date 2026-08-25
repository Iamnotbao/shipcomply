import { lazy, useEffect, useState } from "react";
const DataTable = withSuspense(
  lazy(() => import("../../../component/table/DataTable"))
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
import { fnQuery } from "../../../utils/fnQuery";
import withSuspense from "../../../component/suspense/Suspense";
import {
  deleteAllUsers,
  deleteUser,
  exportExcelUser,
  fetchUsers,
  importExcelUser,
  searchUserByFilter,
} from "../../../service/user/userService";

import useAuth from "../../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import AcShoeMDeletePage from "../../../features/ac_shoe_m/page/AcShoeMDeletePage";
import DetailUserPage from "../../../features/users/page/DetailUserPage";
import { fetchUserByDepartment } from "../../../service/user/userService";
const UserPage = ({ factory_code, department_code }) => {
  const [data, setData] = useState([]);
  const [open, setOpen] = useState(false);
  const [openDetail, setOpenDetail] = useState(false);
  const [selectRow, setSelectRow] = useState({});
  const [selectRows, setSelectRows] = useState([]);
  const [filter, setFilter] = useState("");
  const [file, setFile] = useState(null);
  const theme = useTheme();
  const isSmUp = useMediaQuery(theme.breakpoints.up("sm"));
  const isMdUp = useMediaQuery(theme.breakpoints.up("md"));
  const isLgUp = useMediaQuery(theme.breakpoints.up("lg"));
  const { user } = useAuth();

  console.log("check user", data);

  const navigation = useNavigate();
  const fetchU = async () => {
    const combinedData = await fnQuery([
      () =>
        fetchUserByDepartment(user.access_token, factory_code, department_code),
    ]);
    setData(combinedData);
  };
  useEffect(() => {
    fetchU();
  }, [factory_code, department_code]);
  const handleSelectChoose = (rows) => {
    setSelectRows(rows);
  };
  const handleClose = () => setOpen(false);
  const handleModal = (row) => {
    setSelectRow(row);
    setOpen(true);
  };
  const handleDetailModal = (row) => {
    setSelectRow(row);
    setOpenDetail(true);
  };
  const handleDetailClose = () => setOpenDetail(false);
  const onSetFilter = (filter) => {
    setFilter(filter);
  };
  const handleSingleDelete = async () => {
    const result = await deleteUser(user.access_token, selectRow);
    console.log("check result ", result);
    if (result.success) {
      await fetchU();
      toast.success("Delete user successfully!");
      handleClose();
    } else {
      toast.error("Cannot delete");
      handleClose();
    }
  };
  const handleDeleteAll = async () => {
    try {
      const deleteAll = await deleteAllUsers(selectRows, user.access_token);
      if (deleteAll.success) {
        await fetchU();
        toast.success("Delete all item successfully");
        handleClose();
      }
    } catch (error) {
      console.log("Can't delete all because :", error);
      toast.error("Cannot delete all something wrong !");
    }
  };
  const handleDelete = async () => {
    console.log("size", selectRows.length);

    if (selectRows.length > 1) {
      handleDeleteAll();
    } else {
      handleSingleDelete();
    }
  };
  const handleSearchByFilter = async (filteredShoe) => {
    try {
      const response = await searchUserByFilter(
        filteredShoe,
        user.access_token
      );
      if (response && response.data) {
        setData([{ tableName: response.tableName, data: response.data }]);
      }
    } catch (error) {
      console.log("cannot search because", error);
    }
  };
  const handleImport = async () => {
    const form = new FormData();
    form.append("file", file);
    try {
      const result = await importExcelUser(user.access_token, form);
      console.log("tt: ", result);
      if (result.importRows.success) {
        await fetchU(user.access_token);
      }
    } catch (error) {
      if (error.message.includes("ERR_UPLOAD_FILE_CHANGED")) {
        toast.error("Please choose again !");
        setFile("");
      }
    }
  };
  const handleExport = async () => {
    const excel = await exportExcelUser(user.access_token);
    console.log("done: ", excel);
  };
  const handleFile = (e) => {
    const selectedFiled = e.target.files[0];
    if (selectedFiled) {
      console.log("check select file : ", selectedFiled);
      setFile(selectedFiled);
    }
  };
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
            sx={{ rowGap: 1}}
          >
            {data.length > 0 &&
              data.map((item, index) => (
                <div
                  key={index}
                  style={{ minWidth: 0, width: "100%", maxWidth: "100%", height:"500px" }}
                >
                  <DataTable
                    data={item.data}
                    tableName={item.tableName}
                    onEdit={(row) =>
                      navigation(
                        `/user/edit/${row.factory_code}/${row.department_code}/${row.user_code}`,
                        { state: row }
                      )
                    }
                    onSetFilter={onSetFilter}
                    filter={filter}
                    onSearch={handleSearchByFilter}
                    onSelectChange={handleSelectChoose}
                    onDelete={(row) => {
                      handleModal(row);
                    }}
                    onDeleteAll={(row) => {
                      handleModal(row);
                    }}
                    onDetail={(row) => {
                      handleDetailModal(row);
                    }}
                    onExport={handleExport}
                    onImport={handleImport}
                    onFile={handleFile}
                    file={file}
                  />
                </div>
              ))}
          </Stack>
      </Box>

      {data.length === 0 && (
        <Stack direction="row" flexWrap="wrap" sx={{ rowGap: 1 }}>
          <div style={{ width: itemWidth, minWidth: 0 }}>
            <Skeleton animation="wave" variant="rectangular" height={600} />
          </div>
        </Stack>
      )}
      <DetailUserPage
        shoe={selectRow}
        open={openDetail}
        onClose={handleDetailClose}
        title={"Detail Shoe"}
      />
      <AcShoeMDeletePage
        shoe={selectRow}
        open={open}
        onClose={handleClose}
        onConfirm={handleDelete}
        title={"Delete Shoe"}
        message={"Do you want to delete this ?"}
      />
    </>
  );
};
export default UserPage;
