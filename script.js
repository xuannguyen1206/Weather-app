const input = document.querySelector('#search');
const searchIcon = document.querySelector('#searchIcon');
const city_name = document.querySelector('#city-name');
const temperature = document.querySelector('#temp');
const additionalInfo = document.querySelector('.right p');
const status = document.querySelector('#status');
const figures = document.querySelectorAll('figure');
const imageLink = document.querySelectorAll('.image-link');
const imgaeCredit = document.querySelectorAll('#credit');

const weatherApi = '5ebf4ef912ee652656dbf99ad9824987'; // api key for weather
const imageApi = '7QIXJt4t3S401D3Fzry9QFpNf-5FX-LJbhp69PTbv0M'; // api key for image

function changeCity(city, country) {
  city_name.textContent = `${city}, ${country}`;
}

function changeTemp(temp) {
  temperature.textContent = `${(temp - 273.15).toFixed(0)}ºC`;
}

function changeStatus(weatherMain) {
  status.textContent = '';

  if (weatherMain === 'Clear') {
    status.style.backgroundImage = "url('./picture/sunny.png')";
  } else if (weatherMain === 'Rain') {
    status.style.backgroundImage = "url('./picture/rain.png')";
  } else if (weatherMain === 'Thunderstorm') {
    status.style.backgroundImage = "url('./picture/thunder.png')";
  } else if (weatherMain === 'Snow') {
    status.style.backgroundImage = "url('./picture/snowy.png')";
  } else if (weatherMain === 'Clouds') {
    status.style.backgroundImage = "url('./picture/cloud.png')";
  } else {
    status.style.backgroundImage = '';
    status.textContent = `${weatherMain}`;
  }
}
// Get weather info
function changeAdditional(feelLike, windSpeed, humidity) {
  additionalInfo.innerHTML = `Feels like ${(feelLike - 273.15).toFixed(0)}ºC<br>Wind Speed: ${windSpeed} km/h <br> Humidity: ${humidity}%`;
}

function weatherArrangeData(data) {
  changeCity(data.name, data.sys.country);
  changeTemp(data.main.temp);
  changeStatus(data.weather[0].main);
  changeAdditional(data.main.feels_like, data.wind.speed, data.main.humidity);
}

async function getWeather(cityName) {
  const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${weatherApi}`, { mode: 'cors' });
  const data = await response.json();
  weatherArrangeData(data);
}
// enter event for input
input.addEventListener('keyup', (event) => {
  if (Number(event.keyCode) === 13) {
    event.preventDefault();
    searchIcon.click();
  }
});

// Get image
function changeCredit(author, link, imageNo) {
  imgaeCredit[imageNo].textContent = `By ${author}`;
  imgaeCredit[imageNo].href = link;
  imgaeCredit[imageNo].style.textDecoration = 'none';
}

function changeFigure(url, link, imageNo) {
  figures[imageNo].style.backgroundImage = `url(${url})`;
  // click image to go to its link on upslash
  imageLink[imageNo].href = link;
}

function imageArrangeData(data) {
  for (let i = 0; i < 7; i += 1) {
    changeFigure(data.results[i].urls.regular, data.results[i].links.html, i);
    changeCredit(data.results[i].user.username,data.results[i].user.links.html,i);
  }
}

async function getImage(cityName) {
  const response = await fetch(`https://api.unsplash.com/search/photos?query=${cityName}&client_id=${imageApi}&page=${Math.random()*16+1}&per_page=7`);
  const data = await response.json();
  imageArrangeData(data);
}

searchIcon.addEventListener('click', () => {
  getWeather(input.value);
  getImage(input.value);
});
