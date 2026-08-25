import { Box, Button } from "@mui/material";
import { useTranslation } from "react-i18next";

const ButtonLanguage = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  return (
    <Box>
      <Button variant="contained" color="warning" onClick={() => changeLanguage("vi")}>Tiếng Việt</Button>
      <Button variant= "contained" color="error" onClick={() => changeLanguage("en")}>English</Button>
      <Button variant= "contained" color="success" onClick={() => changeLanguage("zh")}>中文</Button>
    </Box>
  );
};
export default ButtonLanguage;