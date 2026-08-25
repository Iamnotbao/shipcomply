/**
 * Default cell renderer for simple text values
 */
const DefaultCell = ({ value }) => {
  if (value === null || value === undefined) {
    return null;
  }
  
  return <span>{String(value)}</span>;
};

export default DefaultCell;
