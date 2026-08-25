export const dataGridSx = {
  width: "100%",
  border: 0,
  backgroundColor: "background.paper",
  "& .MuiDataGrid-columnHeaders": {
    borderBottom: "1px solid",
    borderColor: "divider",
  },
  "& .MuiDataGrid-columnHeader": {
    backgroundColor: "#f8fafc",
  },
  "& .MuiDataGrid-columnHeaderTitle": {
    fontWeight: 750,
    color: "text.primary",
    fontSize: "0.78rem",
  },
  "& .MuiDataGrid-cell": {
    borderRight: "1px solid",
    borderBottom: "1px solid",
    borderColor: "divider",
  },
  "& .MuiDataGrid-row:hover": {
    backgroundColor: "#f8fafc",
  },
  "& .Mui-selected-row, & .MuiDataGrid-row.Mui-selected": {
    backgroundColor: "#ecfdf5 !important",
    boxShadow: "inset 3px 0 0 #0f766e",
  },
  "& .Mui-selected-row:hover, & .MuiDataGrid-row.Mui-selected:hover": {
    backgroundColor: "#d1fae5 !important",
    boxShadow: "inset 3px 0 0 #115e59",
  },
  "& .MuiDataGrid-cell:focus, & .MuiDataGrid-cell:focus-within, & .MuiDataGrid-columnHeader:focus, & .MuiDataGrid-columnHeader:focus-within, & .MuiDataGrid-row:focus, & .MuiDataGrid-row:focus-within": {
    outline: "none !important",
  },
  "& .MuiDataGrid-footerContainer": {
    minHeight: 48,
    borderTop: "1px solid",
    borderColor: "divider",
    backgroundColor: "#fbfdff",
  },
  "& .MuiDataGrid-scrollbar::-webkit-scrollbar": {
    width: 10,
    height: 10,
  },
  "& .MuiDataGrid-scrollbar::-webkit-scrollbar-thumb": {
    backgroundColor: "#cbd5e1",
    borderRadius: 10,
    border: "2px solid transparent",
    backgroundClip: "padding-box",
  },
  "& .MuiDataGrid-scrollbar::-webkit-scrollbar-track": {
    backgroundColor: "#f8fafc",
  },
};
