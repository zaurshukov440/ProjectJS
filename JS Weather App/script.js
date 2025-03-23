const API_KEY = '217a823e370cd66876f6ddec61f94d35';
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

const elements = {
    cityInput: document.getElementById('cityInput'),
    searchButton: document.getElementById('searchButton'),
    weatherContainer: document.getElementById('weatherContainer'),
    autocompleteList: document.getElementById('autocompleteList')
};

let autocompleteTimeout;

elements.cityInput.addEventListener('input', async (event) => {
    clearTimeout(autocompleteTimeout);
    const query = event.target.value.trim();
    
    if (query.length < 2) {
        elements.autocompleteList.style.display = 'none';
        return;
    }

    autocompleteTimeout = setTimeout(async () => {
        try {
            const response = await fetch(
                `${BASE_URL}/find?q=${query}&type=like&sort=population&cnt=5&appid=${API_KEY}`
            );
            const data = await response.json();
            
            if (data.list?.length > 0) {
                elements.autocompleteList.innerHTML = data.list.map(city => `
                    <div class="autocomplete-item" 
                         data-lat="${city.coord.lat}" 
                         data-lon="${city.coord.lon}">
                        <span>${city.name}, ${city.sys.country}</span>
                        <span>${Math.round(city.main.temp - 273.15)}°C</span>
                    </div>
                `).join('');
                elements.autocompleteList.style.display = 'block';
            }
        } catch (error) {
            console.error('Ошибка автодополнения:', error);
        }
    }, 300);
});

elements.autocompleteList.addEventListener('click', (event) => {
    const item = event.target.closest('.autocomplete-item');
    if (item) {
        elements.cityInput.value = item.querySelector('span:first-child').textContent;
        elements.autocompleteList.style.display = 'none';
        fetchWeather(elements.cityInput.value.trim());
    }
});

document.addEventListener('click', (event) => {
    if (!event.target.closest('.search-wrapper')) {
        elements.autocompleteList.style.display = 'none';
    }
});

async function fetchWeather(city) {
    try {
        showLoading();
        
        const currentResponse = await fetch(
            `${BASE_URL}/weather?q=${city}&units=metric&lang=ru&appid=${API_KEY}`
        );
        const currentData = await currentResponse.json();
        
        if (!currentResponse.ok) {
            throw new Error(currentData.message);
        }

        const forecastResponse = await fetch(
            `${BASE_URL}/forecast?q=${city}&units=metric&lang=ru&appid=${API_KEY}`
        );
        const forecastData = await forecastResponse.json();
        
        if (!forecastResponse.ok) {
            throw new Error(forecastData.message);
        }

        displayWeather(currentData, forecastData);
    } catch (error) {
        showError(error.message);
    }
}

function displayWeather(currentData, forecastData) {
    const forecastByDay = groupForecastByDay(forecastData.list);
    
    elements.weatherContainer.innerHTML = `
        <div class="current-weather">
            ${createCurrentWeatherHTML(currentData)}
            ${createWeatherDetailsHTML(currentData)}
        </div>
        ${createForecastHTML(forecastByDay)}
    `;
}

function createCurrentWeatherHTML(data) {
    return `
        <div class="weather-icon">
            ${getWeatherIcon(data.weather[0].icon)}
        </div>
        <div class="temperature">${Math.round(data.main.temp)}°C</div>
        <div class="weather-description">
            ${data.weather[0].description}
        </div>
    `;
}


function createWeatherDetailsHTML(data) {
    return `
        <div class="details-grid">
            <div class="detail-item">
                <div class="detail-label">Ощущается</div>
                <div class="detail-value">${Math.round(data.main.feels_like)}°C</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">Влажность</div>
                <div class="detail-value">${data.main.humidity}%</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">Ветер</div>
                <div class="detail-value">${Math.round(data.wind.speed)} м/с</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">Давление</div>
                <div class="detail-value">${data.main.pressure} гПа</div>
            </div>
        </div>
    `;
}

function createForecastHTML(forecast) {
    return `
        <h2 class="forecast-title">Прогноз на 5 дней</h2>
        <div class="weather-cards">
            ${forecast.map(day => `
                <div class="weather-card">
                    <div class="forecast-day">
                        <span>${formatDate(day.dt_txt)}</span>
                        <span>${Math.round(day.main.temp)}°C</span>
                    </div>
                    <div class="weather-condition">
                        ${getWeatherIcon(day.weather[0].icon)}
                        <span>${day.weather[0].description}</span>
                    </div>
                    <div class="details-grid" style="margin-top: 15px;">
                        <div class="detail-item">
                            <div class="detail-label">Ветер</div>
                            <div class="detail-value">${Math.round(day.wind.speed)} м/с</div>
                        </div>
                        <div class="detail-item">
                            <div class="detail-label">Влажность</div>
                            <div class="detail-value">${day.main.humidity}%</div>
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}


function groupForecastByDay(forecastList) {
    const days = {};
    
    forecastList.forEach(item => {
        const date = new Date(item.dt * 1000);
        const dayKey = date.toLocaleDateString('ru-RU');
        
        if (!days[dayKey] || date.getHours() === 12) {
            days[dayKey] = item;
        }
    });
    
    return Object.values(days).slice(0, 5);
}


function getWeatherIcon(iconCode) {
    const iconMap = {
        '01d': 'wi-day-sunny', '01n': 'wi-night-clear',
        '02d': 'wi-day-cloudy', '02n': 'wi-night-alt-cloudy',
        '03d': 'wi-cloud', '03n': 'wi-cloud',
        '04d': 'wi-cloudy', '04n': 'wi-cloudy',
        '09d': 'wi-rain', '09n': 'wi-rain',
        '10d': 'wi-day-rain', '10n': 'wi-night-alt-rain',
        '11d': 'wi-thunderstorm', '11n': 'wi-thunderstorm',
        '13d': 'wi-snow', '13n': 'wi-snow',
        '50d': 'wi-fog', '50n': 'wi-fog'
    };
    
    return `<i class="wi ${iconMap[iconCode] || 'wi-na'}"></i>`;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
        weekday: 'long',
        day: 'numeric',
        month: 'long'
    });
}


function showLoading() {
    elements.weatherContainer.innerHTML = `
        <div class="loading">
            <div class="loading-spinner"></div>
            Загрузка данных...
        </div>
    `;
}


function showError(message) {
    elements.weatherContainer.innerHTML = `
        <div class="error">
            <div style="font-size: 2em;">⚠️</div>
            <div style="margin-top: 15px;">${translateError(message)}</div>
        </div>
    `;
}


function translateError(message) {
    const errorMessages = {
        'city not found': 'Город не найден, попробуйте уточнить запрос',
        'invalid API key': 'Ошибка доступа к сервису',
        'Nothing to geocode': 'Введите название города',
        '404': 'Сервис временно недоступен',
        'Failed to fetch': 'Проверьте интернет-соединение'
    };
    
    return errorMessages[message.toLowerCase()] || `Ошибка: ${message}`;
}

elements.searchButton.addEventListener('click', () => {
    const city = elements.cityInput.value.trim();
    if (city) fetchWeather(city);
});

elements.cityInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        const city = elements.cityInput.value.trim();
        if (city) fetchWeather(city);
    }
});

fetchWeather('Москва');