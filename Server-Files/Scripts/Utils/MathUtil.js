// Source for the haversine calculation
const haversine = require("haversine");

// Calculate the straight line distance between two coordinates
function calculateStraightLineDistance(twoCoordinates) {
  const start = {
    latitude: twoCoordinates.base_latitude,
    longitude: twoCoordinates.base_longitude
  }
  
  const end = {
    latitude: twoCoordinates.cur_latitude,
    longitude: twoCoordinates.cur_longitude
  }

  return haversine(start, end, {unit: 'meter'});
}

module.exports.calculateStraightLineDistance = calculateStraightLineDistance;