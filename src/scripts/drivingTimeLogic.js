import { findZipLocation } from './zip-checker';
import { estimateDrivingTime, findDrivingTime } from './estimate-time-driving';
import { findAllResorts } from './all-avail-resorts';

const DEFAULT_LOCATIONS = {
  "Midwest": { latitude: 41.8781, longitude: -87.6298 }, // Chicago
  "Rockies": { latitude: 39.7392, longitude: -104.9903 }, // Denver
  "Northeast": { latitude: 40.7128, longitude: -74.0060 }, // New York
  "Midatlantic": { latitude: 39.9526, longitude: -75.1652 }, // Philly
  "West": { latitude: 34.1030, longitude: -118.4105 } // 90210 like the song haha
};

export function calculateResortsDriving(region, zipCode) {
    let usersLocation = findZipLocation(zipCode) || DEFAULT_LOCATIONS[region] || DEFAULT_LOCATIONS["West"];
    const resorts = findAllResorts(region);
    return resorts.map(resort => ({
        ...resort,
        drivingTime: estimateDrivingTime(usersLocation.latitude, usersLocation.longitude, resort.latitude, resort.longitude),
        totalKm: findDrivingTime(usersLocation.latitude, usersLocation.longitude, resort.latitude, resort.longitude), 
      }));
}