export const formDialogSx = {
  "& .MuiDialog-paper": {
    borderRadius: 2.25,
    overflow: "hidden",
    border: "1px solid",
    borderColor: "#d9e2e7",
    boxShadow: "0 16px 42px rgba(15, 23, 42, 0.16)",
    backgroundImage: "none",
    bgcolor: "#f4f7f8",
  },
};

export const formDialogHeaderSx = {
  px: { xs: 1.75, sm: 2 },
  py: 1.35,
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "space-between",
  gap: 1.5,
  bgcolor: "#f8fbfb",
};

export const formDialogContentSx = {
  px: { xs: 1.5, sm: 2 },
  py: { xs: 1.5, sm: 1.75 },
  bgcolor: "#f1f5f6",
  "& .MuiInputBase-root": {
    bgcolor: "#fff",
  },
};

export const formDialogActionsSx = {
  px: { xs: 1.75, sm: 2 },
  py: 1.15,
  gap: 1,
  justifyContent: "flex-end",
  bgcolor: "#f8fbfb",
};

export const formSectionSx = {
  p: { xs: 1.25, sm: 1.5 },
  border: "1px solid",
  borderColor: "#dce5e8",
  borderRadius: 1.75,
  bgcolor: "#ffffff",
  boxShadow: "0 1px 2px rgba(15, 23, 42, 0.025)",
};

export const formFieldSx = {
  "& .MuiInputBase-root": {
    minHeight: 38,
    bgcolor: "#fff",
  },
};
