import { Box, InputBase, Paper, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";

const SearchBar = ({ title, name, value = 0, onChange, type = "text" }) => {
  const { t } = useTranslation();

  const handleChange = (e) => {
    const val = e.target.value;
    onChange({
      ...value,
      [name]: val,
    });
  };

  return (
    <Box display={"flex"} alignItems={"center"} gap={1}>
      <Typography variant="body2" fontWeight="bold" fontSize="14px">
        {title}
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
          placeholder={t("...")}
          inputProps={{ "aria-label": "name" }}
          name={name}
          type={type}
          value={name !== "total"? value[name] ||"" :value||""}
          onChange={handleChange}
        />
      </Paper>
    </Box>
  );
};
export default SearchBar;
