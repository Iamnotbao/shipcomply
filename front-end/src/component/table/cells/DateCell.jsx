import moment from 'moment';

/**
 * Render date cell with formatted date
 * Format: YYYY-MM-DD HH:mm:ss
 */
const DateCell = ({ value }) => {
  if (!value) return null;
  
  try {
    const formatted = moment(value).format('YYYY-MM-DD HH:mm:ss');
    return <span>{formatted}</span>;
  } catch (error) {
    return <span>{value}</span>;
  }
};

export default DateCell;
