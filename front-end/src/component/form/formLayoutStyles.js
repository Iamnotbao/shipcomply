export const formDialogSx = {
  "& .MuiDialog-paper": {
    borderRadius: 2.5,
    overflow: "hidden",
    border: "1px solid",
    borderColor: "divider",
    boxShadow: "0 18px 55px rgba(15, 23, 42, 0.18)",
    backgroundImage: "none",
  },
};

export const formDialogHeaderSx = {
  px: { xs: 2, sm: 2.5 },
  py: 1.75,
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "space-between",
  gap: 2,
  bgcolor: "#fbfdff",
};

export const formDialogContentSx = {
  px: { xs: 2, sm: 2.5 },
  py: { xs: 2, sm: 2.5 },
  bgcolor: "background.paper",
};

export const formDialogActionsSx = {
  px: { xs: 2, sm: 2.5 },
  py: 1.5,
  gap: 1,
  justifyContent: "flex-end",
  bgcolor: "#fbfdff",
};

export const formSectionSx = {
  p: { xs: 1.75, sm: 2 },
  border: "1px solid",
  borderColor: "divider",
  borderRadius: 2,
  bgcolor: "background.paper",
  boxShadow: "0 1px 2px rgba(15, 23, 42, 0.03)",
};

export const formFieldSx = {
  "& .MuiInputBase-root": {
    minHeight: 38,
  },
};
