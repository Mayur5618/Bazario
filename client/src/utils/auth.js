export const isTokenExpired = (token) => {
  if (!token) return true; // No token means expired
  const payload = JSON.parse(atob(token.split('.')[1])); // Decode the JWT payload
  const expirationTime = payload.exp * 1000; // Convert to milliseconds
  return Date.now() > expirationTime; // Check if the current time is greater than expiration time
}; 