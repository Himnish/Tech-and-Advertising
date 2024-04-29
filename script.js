const compassCircle = document.querySelector(".compass-circle");
const myPoint = document.querySelector(".my-point");
const startBtn = document.querySelector(".start-btn");
const isIOS =
  navigator.userAgent.match(/(iPod|iPhone|iPad)/) &&
  navigator.userAgent.match(/AppleWebKit/);
personalCoord = [0,0]
let locationList = [];
var nearestCoord = [];

// Helper functions 
for (let location in data) {
  locationList.push([
    data[location]["lat"],
    data[location]["lng"]
  ])
}

function distance(coord1, coord2) {
  return Math.sqrt(Math.pow(coord1[0] - coord2[0], 2) + Math.pow(coord1[1] - coord2[1], 2));
}

function nearestCoordinate(personal, coordinates) {
  let minDistance = Infinity;
  let nearestCoord = null;

  for (let coord of coordinates) {
      let dist = distance(personal, coord);
      if (dist < minDistance) {
          minDistance = dist;
          nearestCoord = coord;
      }
  }

  return nearestCoord;
}


// Starting function
function init() {
  // Awaits for permissions and adds handler 
  startBtn.addEventListener("click", startCompass);
  // Main deal 
  navigator.geolocation.getCurrentPosition(locationHandler);

  // IOS requires specific handler, android automatically does this in first line of this func
  if (!isIOS) {
    window.addEventListener("deviceorientationabsolute", handler, true);
  }
}

function startCompass() {
  if (isIOS) {
    DeviceOrientationEvent.requestPermission()
      .then((response) => {
        if (response === "granted") {
          window.addEventListener("deviceorientation", handler, true);
        } else {
          alert("has to be allowed!");
        }
      })
      .catch(() => alert("not supported"));
  }
}

function handler(e) {
  // Compass heavy lifting 
  compass = e.webkitCompassHeading || Math.abs(e.alpha - 360);
  compassCircle.style.transform = `translate(-50%, -50%) rotate(${-compass}deg)`;

  // At our goal ±15 degree
  if (
    (pointDegree < Math.abs(compass) &&
      pointDegree + 15 > Math.abs(compass)) ||
    pointDegree > Math.abs(compass + 15) ||
    pointDegree < Math.abs(compass)
  ) {
    myPoint.style.opacity = 0;
  } else if (pointDegree) {
    myPoint.style.opacity = 1;
  }
}

let pointDegree;
function locationHandler(position) {
  const { latitude, longitude } = position.coords;
  
  position_parsed = [latitude, longitude]
  nearestCoord = nearestCoordinate(position_parsed, locationList);

  const desiredpoint = {
    lat: nearestCoord[0],
    lng: nearestCoord[1] 
  };

  for (let location in data) {
    // if (location.lat =)
    if (data[location].lat == nearestCoord[0] && data[location].lng == nearestCoord[1]) {
      document.getElementById("location").innerHTML = location
      // alert(data[location]["msg"])
    }
  }


  pointDegree = calcDegreeToPoint(desiredpoint, latitude, longitude);

  if (pointDegree < 0) {
    pointDegree = pointDegree + 360;
  }
}

function calcDegreeToPoint(desiredpoint, latitude, longitude) {
  const phiK = (desiredpoint.lat * Math.PI) / 180.0;
  const lambdaK = (desiredpoint.lng * Math.PI) / 180.0;
  const phi = (latitude * Math.PI) / 180.0;
  const lambda = (longitude * Math.PI) / 180.0;
  const psi =
    (180.0 / Math.PI) *
    Math.atan2(
      Math.sin(lambdaK - lambda),
      Math.cos(phi) * Math.tan(phiK) -
        Math.sin(phi) * Math.cos(lambdaK - lambda)
    );
  return Math.round(psi);
}

init();
