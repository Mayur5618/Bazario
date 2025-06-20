export const formatPrice = (price) => {
    // Convert to number if string
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    
    // Handle invalid input
    if (isNaN(numPrice)) return '0';
    
    // Convert to Indian format
    const formatter = new Intl.NumberFormat('en-IN', {
        maximumFractionDigits: 2,
        minimumFractionDigits: 0
    });
    
    return formatter.format(numPrice);
}; 