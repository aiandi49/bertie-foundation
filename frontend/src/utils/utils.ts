export const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export const categoryColors: Record<string, string> = {
  Education: 'bg-blue-500',
  Environment: 'bg-green-500',
  Health: 'bg-red-500',
  Community: 'bg-purple-500',
  Arts: 'bg-yellow-500',
  default: 'bg-gray-500'
};

export const getCategoryColor = (category: string): string => {
  return categoryColors[category] || categoryColors.default;
};
