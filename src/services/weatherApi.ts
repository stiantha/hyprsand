// Weather interface for TypeScript type safety
export interface WeatherData {
  temperature: number;
  condition: string;
  humidity: number;
  icon: string;
  location: string;
  loading: boolean;
  error: string | null;
  useMockData?: boolean;
  permissionDenied?: boolean;
}

// Mock weather data for when API calls fail
export const mockWeatherData: WeatherData = {
  temperature: 22,
  condition: 'Clear',
  humidity: 45,
  icon: '01d',
  location: 'Demo City',
  loading: false,
  error: null,
  useMockData: true
};

// Get the user's geolocation
export const getUserGeolocation = (): Promise<GeolocationPosition> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported by your browser'));
      return;
    }

    console.log('Requesting location permission...');
    
    // Try to get position with a timeout
    navigator.geolocation.getCurrentPosition(
      position => {
        console.log('Location permission granted!');
        console.log(`Location: ${position.coords.latitude}, ${position.coords.longitude}`);
        resolve(position);
      },
      error => {
        console.error('Geolocation error:', error);
        reject(error);
      },
      { 
        enableHighAccuracy: false, // true can cause issues on some devices
        timeout: 10000,
        maximumAge: 0 // don't use cached position
      }
    );
  });
};

// Parse geolocation error to get user-friendly message and check if permission was denied
export const parseGeolocationError = (error: GeolocationPositionError | Error): { 
  message: string; 
  permissionDenied: boolean;
} => {
  let errorMessage = 'Unable to get your location';
  let permissionDenied = false;
  
  if ('code' in error) {
    // It's a GeolocationPositionError
    switch (error.code) {
      case error.PERMISSION_DENIED:
        errorMessage = 'Location permission denied';
        permissionDenied = true;
        break;
      case error.POSITION_UNAVAILABLE:
        errorMessage = 'Location information unavailable';
        break;
      case error.TIMEOUT:
        errorMessage = 'Location request timed out';
        break;
    }
  } else {
    // It's a general Error
    errorMessage = error.message;
  }
  
  return { message: errorMessage, permissionDenied };
};

// Fetch weather data from OpenWeatherMap API
export const fetchWeatherData = async (lat: number, lon: number): Promise<WeatherData> => {
  try {
    // For a real application, you'd use a valid API key
    const API_KEY = ''; // Replace with valid API key
    
    // Using free weather API
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
    console.log('Fetching weather data from:', url);
    
    // IMPORTANT: This is commented out until you have a valid API key
    /*
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Weather API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    return {
      temperature: Math.round(data.main.temp),
      condition: data.weather[0].main,
      humidity: data.main.humidity,
      icon: data.weather[0].icon,
      location: data.name,
      loading: false,
      error: null
    };
    */
    
    // Using mock data until API key is configured
    console.log('Using mock weather data (API key needed)');
    return { ...mockWeatherData };
    
  } catch (error) {
    console.error('Error fetching weather:', error);
    return {
      ...mockWeatherData,
      loading: false,
      error: 'Weather data unavailable'
    };
  }
}; 