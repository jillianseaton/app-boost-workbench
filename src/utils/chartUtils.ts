
// Utility functions for chart components to prevent gradient errors

export const getValidGradientValue = (value: any, fallback: string = "0"): string => {
  if (value === undefined || value === null || isNaN(Number(value))) {
    return fallback;
  }
  return String(value);
};

export const createSafeGradient = (id: string, color1: string, color2: string) => ({
  id,
  x1: "0",
  y1: "0", 
  x2: "0",
  y2: "1",
  stopColor1: color1,
  stopColor2: color2,
});

export const formatChartData = (data: any[]) => {
  return data.map(item => ({
    ...item,
    // Ensure all numeric values are properly defined
    value: item.value !== undefined ? Number(item.value) : 0,
    amount: item.amount !== undefined ? Number(item.amount) : 0,
  }));
};
