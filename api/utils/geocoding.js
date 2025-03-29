import axios from 'axios';

export const getCoordinatesFromAddress = async (address, city, state, pincode, country) => {
    try {
        // Special handling for Surat
        if (city.toLowerCase() === 'surat' && state.toLowerCase() === 'gujarat') {
            return {
                latitude: 21.1702,
                longitude: 72.8311
            };
        }

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

        // If geocoding fails, return default coordinates for Surat
        console.warn('Geocoding failed, using default coordinates for Surat');
        return {
            latitude: 21.1702,
            longitude: 72.8311
        };
    } catch (error) {
        console.error('Geocoding error:', error);
        // Return default coordinates for Surat in case of error
        return {
            latitude: 21.1702,
            longitude: 72.8311
        };
    }
}; 