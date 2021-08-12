const input = document.querySelector('#search');
const searchIcon = document.querySelector('#searchIcon');
const city_name = document.querySelector('#city-name');
const temperature = document.querySelector('#temp');
const additionalInfo = document.querySelector('.right p');
const status = document.querySelector('#status');
const figures = document.querySelectorAll('figure');
const imageLink = document.querySelectorAll('.image-link');
const imgaeCredit = document.querySelectorAll('#credit');
const container = document.querySelector('#image-container');
const frames = document.querySelectorAll('.frame');

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
  if (frames[imageNo].querySelector('.link')) { // check if there a <a> link for mobile
    frames[imageNo].querySelector('.link').href = link;
  }
}

function imageArrangeData(data) {
  for (let i = 0; i < 7; i += 1) {
    changeFigure(data.results[i].urls.regular, data.results[i].links.html, i);
    changeCredit(data.results[i].user.username, data.results[i].user.links.html, i);
  }
}

async function getImage(cityName) {
  const response = await fetch(`https://api.unsplash.com/search/photos?query=${cityName}&client_id=${imageApi}&page=${Math.random() * 16 + 1}&per_page=7`);
  const data = await response.json();
  imageArrangeData(data);
}

searchIcon.addEventListener('click', () => {
  getWeather(input.value);
  getImage(input.value);
  slider.resetIndex();
});

const slider = (() => { /* slider moudle for swiping in mobile version */
  let isDragging = false;
  let startPos = 0;
  let currentTranslate = 0;
  let prevTranslate = 0;
  let animationID = 0;
  let currentIndex = 0;

  function getXPos(e) {
    return e.type.includes('mouse') ? e.pageX : e.touches[0].clientX;
  }

  function updateDragPos() {
    container.style.transform = `translateX(${currentTranslate}px)`;
  }

  function animation() {
    updateDragPos();
    if (isDragging) requestAnimationFrame(animation);
  }

  function updateDragPosByIndex() {
    currentTranslate = -(currentIndex * frames[0].offsetWidth);
    updateDragPos();
    prevTranslate = currentTranslate;
  }

  function startDrag(e) {
    isDragging = true;
    startPos = getXPos(e);
    animationID = requestAnimationFrame(animation);
    container.classList.add('grabbing');
  }
  function dragging(e) { /* move the slider along with cursor */
    if (isDragging) {
      const currentPos = getXPos(e);
      currentTranslate = (currentPos - startPos) /* get the distance travelled */ + prevTranslate;
      // eslint-disable-next-line max-len
      // dont need to update drag position because animation update everytime the browser repaint itself
    }
  }

  function endDrag() { /* put the slider to the miiddle a certain picture */
    if (isDragging) {
      isDragging = false;
      cancelAnimationFrame(animationID);
      container.classList.remove('grabbing');
      const distanceSlide = currentTranslate - prevTranslate; /* final measurement of distance */
      // if the distance exceed a thresh hold, switch to the next or previous item
      if (-distanceSlide >= (frames[0].offsetWidth / 4) && currentIndex < frames.length - 1) {
        currentIndex += 1;
      } /* slide to right */
      if (distanceSlide >= (frames[0].offsetWidth / 4) && currentIndex > 0) {
        currentIndex -= 1;
      } /* slide to left */
      updateDragPosByIndex();
    }
  }

  function initSlider() {
    frames.forEach((element) => {
      // touch event
      element.addEventListener('touchstart', startDrag);
      element.addEventListener('touchmove', dragging);
      element.addEventListener('touchend', endDrag);
      // mouse event
      element.addEventListener('mousedown', startDrag);
      element.addEventListener('mousemove', dragging);
      element.addEventListener('mouseleave', endDrag);
      element.addEventListener('mouseup', endDrag);
      // create link for image
      const link = document.createElement('a');
      link.classList.add('link');
      link.textContent = 'Picture';
      link.href = element.querySelector('.image-link').href;
      link.target = '_blank';
      element.insertBefore(link, element.querySelector('#credit'));
    });
  }
  function removeSlider() {
    frames.forEach((element) => {
      // touch event
      container.style.transform = 'translateX(0px)';
      element.removeEventListener('touchstart', startDrag);
      element.removeEventListener('touchmove', dragging);
      element.removeEventListener('touchend', endDrag);
      // mouse event
      element.removeEventListener('mousedown', startDrag);
      element.removeEventListener('mousemove', dragging);
      element.removeEventListener('mouseleave', endDrag);
      element.removeEventListener('mouseup', endDrag);
      if (element.querySelector('.link')) element.removeChild(element.querySelector('.link'));
    });
  }
  function resetIndex() {
    currentIndex = 0;
    updateDragPosByIndex();
  }
  return {
    initSlider, removeSlider, resetIndex,
  };
})();
let sliderOn = false;

if (window.innerWidth < 450 && sliderOn === false) {
  slider.initSlider();
  sliderOn = true;
}
window.addEventListener('resize', () => {
  if (window.innerWidth < 450 && sliderOn === false) {
    slider.initSlider();
    sliderOn = true;
  }
  if (window.innerWidth > 450 && sliderOn === true) {
    slider.removeSlider();
    sliderOn = false;
  }
});
for (let i = 0; i < figures.length; i += 1) {
  imageLink[i].addEventListener('dragstart', (e) => e.preventDefault()); // prevent ghosting effect of images and links
  imgaeCredit[i].addEventListener('dragstart', (e) => e.preventDefault());
}
