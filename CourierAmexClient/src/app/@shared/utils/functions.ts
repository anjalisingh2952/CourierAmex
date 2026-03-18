export const sortType = (sort: string): string => {
  return `${sort.includes('ASC') ? 'DESC' : 'ASC'}`;
}

export const getDateString = (): string => {
  const date = new Date();
  return `${date.getMonth()}${date.getDate()}${date.getFullYear()}${date.getHours()}${date.getMinutes()}${date.getSeconds()}`;
}

export const getCourierByTracking = (tracking: string): string => {
  if (tracking.toLowerCase().startsWith("1z"))
    return "UPS";
  else if (tracking.toLowerCase().startsWith("t") && tracking.toLowerCase().length == 11)
    return "UPS";
  else if (tracking.toLowerCase().startsWith("tba") || tracking.toLowerCase().startsWith("tbm") || tracking.toLowerCase().startsWith("tbc"))
    return "Amazon";
  else if (tracking.toLowerCase().startsWith("l") || tracking.toLowerCase().startsWith("lw") || tracking.toLowerCase().startsWith("lx") || tracking.toLowerCase().startsWith("1ls"))
    return "Lasership";
  else if (tracking.toLowerCase().endsWith("us"))
    return "USPS";
  else if (tracking.toLowerCase().startsWith("82") && tracking.toLowerCase().length == 10)
    return "USPS";
  else if ((tracking.toLowerCase().startsWith("9400") || tracking.toLowerCase().startsWith("9205") || tracking.toLowerCase().startsWith("9407") || tracking.toLowerCase().startsWith("9303") || tracking.toLowerCase().startsWith("9270") || tracking.toLowerCase().startsWith("9208") || tracking.toLowerCase().startsWith("9202")) && tracking.toLowerCase().length == 22)
    return "USPS";
  else if (tracking.toLowerCase().startsWith("42033166"))
    return "USPS";
  else if ((tracking.toLowerCase().indexOf("9400") > -1 || tracking.toLowerCase().indexOf("9205") > -1 || tracking.toLowerCase().indexOf("9407") > -1 || tracking.toLowerCase().indexOf("9303") > -1 || tracking.toLowerCase().indexOf("9270") > -1 || tracking.toLowerCase().indexOf("9208") > -1 || tracking.toLowerCase().indexOf("9202") > -1) && tracking.toLowerCase().length == 28)
    return "USPS";

  return "";
}
