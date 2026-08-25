import { Box, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import moment from 'moment';

/**
 * Display selected row information in footer
 * Shows: grt_dept, grt_user, grt_date, last_user, last_date
 */
const FooterInfo = ({ selectedRow }) => {
  const { t } = useTranslation();

  if (!selectedRow) {
    return null;
  }

  const formatDate = (date) => {
    if (!date) return '';
    try {
      return moment(date).format('YYYY-MM-DD HH:mm:ss');
    } catch {
      return date;
    }
  };

  const infoItems = [
    {
      label: 'Grt Dept',
      value: selectedRow.grt_dept,
    },
    {
      label: 'Grt User',
      value: selectedRow.grt_user,
    },
    {
      label: 'Grt Date',
      value: formatDate(selectedRow.grt_date),
    },
    {
      label: 'Last User',
      value: selectedRow.last_user,
    },
    {
      label: 'Last Date',
      value: formatDate(selectedRow.last_date),
    },
  ];

  return (
    <Box
      sx={{
        display: 'flex',
        gap: 3,
        padding: 1,
        borderTop: '1px solid #e0e0e0',
        backgroundColor: '#f5f5f5',
        flexWrap: 'wrap',
      }}
    >
      {infoItems.map(
        (item, index) =>
          item.value && (
            <Box key={index} sx={{ display: 'flex', gap: 0.5 }}>
              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                {t(item.label)}:
              </Typography>
              <Typography variant="body2">{item.value}</Typography>
            </Box>
          )
      )}
    </Box>
  );
};

export default FooterInfo;
