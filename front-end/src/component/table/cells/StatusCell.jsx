import { useTranslation } from 'react-i18next';
import { getStatusText } from '../../../utils/table';

/**
 * Render status cell with translated status text
 * Status codes: 0=Cancel, 1=New, 2=Checked, 7=Confirm, 9=Close
 */
const StatusCell = ({ value }) => {
  const { t } = useTranslation();
  
  const statusText = getStatusText(value);
  
  return <span>{t(statusText)}</span>;
};

export default StatusCell;
