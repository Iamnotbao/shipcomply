import { Box } from '@mui/material';
import FooterInfo from './FooterInfo';
import FooterPagination from './FooterPagination';

/**
 * Main table footer component
 * Combines row info and pagination controls
 */
const TableFooter = ({ 
  selectedRow, 
  page, 
  totalPages, 
  onPageChange,
  showInfo = true,
  showPagination = true,
}) => {
  return (
    <Box>
      {showInfo && <FooterInfo selectedRow={selectedRow} />}
      {showPagination && (
        <FooterPagination
          page={page}
          totalPages={totalPages}
          onPageChange={onPageChange}
        />
      )}
    </Box>
  );
};

export default TableFooter;
