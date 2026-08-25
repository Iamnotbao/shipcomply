import { Box, IconButton, Typography } from '@mui/material';
import {
  NavigateBefore as NavigateBeforeIcon,
  NavigateNext as NavigateNextIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

/**
 * Custom pagination controls for table footer
 * Shows: Previous | Page X / Y | Next
 */
const FooterPagination = ({ page, totalPages, onPageChange, disabled = false }) => {
  const { t } = useTranslation();

  const handlePrevious = () => {
    if (page > 0) {
      onPageChange(page - 1);
    }
  };

  const handleNext = () => {
    if (page < totalPages - 1) {
      onPageChange(page + 1);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        padding: 1,
      }}
    >
      <IconButton
        onClick={handlePrevious}
        disabled={disabled || page === 0}
        size="small"
        title={t('Previous Page')}
      >
        <NavigateBeforeIcon />
      </IconButton>

      <Typography variant="body2">
        {page + 1} / {totalPages || 1}
      </Typography>

      <IconButton
        onClick={handleNext}
        disabled={disabled || page >= totalPages - 1}
        size="small"
        title={t('Next Page')}
      >
        <NavigateNextIcon />
      </IconButton>
    </Box>
  );
};

export default FooterPagination;
