// Major US cities used by the map, residence picker, and city screens.
// Previously duplicated verbatim in MapScreen.js and ProfileScreen.js.

export const MAJOR_US_CITIES = [
    { name: 'New York', lat: 40.7128, lng: -74.0060 },
    { name: 'Los Angeles', lat: 34.0522, lng: -118.2437 },
    { name: 'Chicago', lat: 41.8781, lng: -87.6298 },
    { name: 'Houston', lat: 29.7604, lng: -95.3698 },
    { name: 'Phoenix', lat: 33.4484, lng: -112.0740 },
    { name: 'Philadelphia', lat: 39.9526, lng: -75.1652 },
    { name: 'San Antonio', lat: 29.4241, lng: -98.4936 },
    { name: 'San Diego', lat: 32.7157, lng: -117.1611 },
    { name: 'Dallas', lat: 32.7767, lng: -96.7970 },
    { name: 'San Jose', lat: 37.3382, lng: -121.8863 },
    { name: 'Austin', lat: 30.2672, lng: -97.7431 },
    { name: 'Jacksonville', lat: 30.3322, lng: -81.6557 },
    { name: 'Fort Worth', lat: 32.7555, lng: -97.3308 },
    { name: 'Columbus', lat: 39.9612, lng: -82.9988 },
    { name: 'Charlotte', lat: 35.2271, lng: -80.8431 },
    { name: 'San Francisco', lat: 37.7749, lng: -122.4194 },
    { name: 'Indianapolis', lat: 39.7684, lng: -86.1581 },
    { name: 'Seattle', lat: 47.6062, lng: -122.3321 },
    { name: 'Denver', lat: 39.7392, lng: -104.9903 },
    { name: 'Washington', lat: 38.9072, lng: -77.0369 },
    { name: 'Boston', lat: 42.3601, lng: -71.0589 },
    { name: 'El Paso', lat: 31.7619, lng: -106.4850 },
    { name: 'Nashville', lat: 36.1627, lng: -86.7816 },
    { name: 'Detroit', lat: 42.3314, lng: -83.0458 },
    { name: 'Oklahoma City', lat: 35.4676, lng: -97.5164 },
    { name: 'Portland', lat: 45.5152, lng: -122.6784 },
    { name: 'Las Vegas', lat: 36.1699, lng: -115.1398 },
    { name: 'Memphis', lat: 35.1495, lng: -90.0490 },
    { name: 'Louisville', lat: 38.2527, lng: -85.7585 },
    { name: 'Baltimore', lat: 39.2904, lng: -76.6122 },
    { name: 'Milwaukee', lat: 43.0389, lng: -87.9065 },
    { name: 'Albuquerque', lat: 35.0844, lng: -106.6504 },
    { name: 'Tucson', lat: 32.2226, lng: -110.9747 },
    { name: 'Fresno', lat: 36.7378, lng: -119.7871 },
    { name: 'Sacramento', lat: 38.5816, lng: -121.4944 },
    { name: 'Kansas City', lat: 39.0997, lng: -94.5786 },
    { name: 'Mesa', lat: 33.4152, lng: -111.8315 },
    { name: 'Atlanta', lat: 33.7490, lng: -84.3880 },
    { name: 'Omaha', lat: 41.2565, lng: -95.9345 },
    { name: 'Colorado Springs', lat: 38.8339, lng: -104.8214 },
    { name: 'Raleigh', lat: 35.7796, lng: -78.6382 },
    { name: 'Miami', lat: 25.7617, lng: -80.1918 },
    { name: 'Virginia Beach', lat: 36.8529, lng: -75.9780 },
    { name: 'Oakland', lat: 37.8044, lng: -122.2712 },
    { name: 'Minneapolis', lat: 44.9778, lng: -93.2650 },
    { name: 'Tulsa', lat: 36.1540, lng: -95.9928 },
    { name: 'Cleveland', lat: 41.4993, lng: -81.6944 },
    { name: 'Wichita', lat: 37.6872, lng: -97.3301 },
    { name: 'Arlington', lat: 32.7357, lng: -97.1081 },
    { name: 'Tampa', lat: 27.9506, lng: -82.4572 },
  { name: 'New Orleans', lat: 29.9511, lng: -90.0715 },
];

export const CITY_BY_NAME = new Map(MAJOR_US_CITIES.map((city) => [city.name, city]));

export function findClosestCity(latitude, longitude) {
  let closest = MAJOR_US_CITIES[0];
  let minDistance = Infinity;

  MAJOR_US_CITIES.forEach((city) => {
    const distance = haversineKm(latitude, longitude, city.lat, city.lng);
    if (distance < minDistance) {
      minDistance = distance;
      closest = city;
    }
  });

  return closest;
}

export function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
