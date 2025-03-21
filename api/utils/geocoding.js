import axios from 'axios';

export const getCoordinatesFromAddress = async (address, city, state, pincode, country) => {
    try {
        const formattedAddress = `${address}, ${city}, ${state} ${pincode}, ${country}`;
        const encodedAddress = encodeURIComponent(formattedAddress);
        const response = await axios.get(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}`
        );

        if (response.data && response.data.length > 0) {
            return {
                latitude: parseFloat(response.data[0].lat),
                longitude: parseFloat(response.data[0].lon)
            };
        }

        // If geocoding fails, return default coordinates
        console.warn('Geocoding failed, using default coordinates');
        return {
            latitude: 0,
            longitude: 0
        };
    } catch (error) {
        console.error('Geocoding error:', error);
        // Return default coordinates in case of error
        return {
            latitude: 0,
            longitude: 0
        };
    }
}; 