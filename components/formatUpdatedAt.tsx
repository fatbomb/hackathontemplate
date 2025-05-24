// Format date utility function

const formatUpdatedAt = (dateInput: string | Date): string => {
  try {
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    
    if (isNaN(date.getTime())) {
      console.warn("Invalid date received:", dateInput);
      return "N/A";
    }
    
    const dateStr = date.toISOString().split('T')[0];
    const timeStr = date.toISOString().split('T')[1].split('.')[0] + " UTC";
    
    return `${dateStr}\n${timeStr}`;
  } catch (error) {
    console.error("Error formatting date:", error, dateInput);
    return "N/A";
  }
};
export default formatUpdatedAt;

// ChatMessageComponent
