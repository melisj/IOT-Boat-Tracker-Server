// This module will return 3 values which can all have a value of 0, 1 or 2.
// Each value represents a different weather state.
// 0 = no warning, 1 means there is a chance of this weather type, 2 there is high probability of this type of weather

// See "https://darksky.net/dev/docs" for more information
const WEATHER_API_KEY = "e94b13f285d0fd959ed2af9453213e3f";
const DEFAULT_WEATHER_API_URL = "https://api.darksky.net/forecast/" + WEATHER_API_KEY + "/";
const DEFAULT_EXCLUDE_WEATHER_DATA = "?exclude=minutly,daily,flags,alert";
const DEFAULT_METRICS = "&si";

const https = require("https");
const database = require("../Route-Database");