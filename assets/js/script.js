//var APIkey ="25e074236b9d6f2a1d420c3fa8cf9b2c"
//var APIkey = "405faaddf50a6471bc5cf7ca1fe706c9"
var APIkey = "28192cc5dd81f85bcfd688d592d9a8ab";
var cityInputEl = $('#city');
var searchBtn = $('#search-button');
var clearBtn = $('#clear-button');
var pastSearchedCitiesEl = $('#past-searches');
var currentCity;

//Fetch the current weather 
function getWeather(data) {

    //parameter taken from the weather api doc call current weather https://openweathermap.org/current
    var requestUrl = `https://api.openweathermap.org/data/2.5/onecall?lat=${data.lat}&lon=${data.lon}&exclude=minutely,hourly,alerts&units=metric&appid=${APIkey}`
    fetch(requestUrl)
        .then(function(response) {
            return response.json();
        })
        .then(function(data) //data fetched from  the url
        {
            console.log(data);//data collection from the api
            var currentWeatherEl = $('#currentWeather');//div element
            currentWeatherEl.addClass('border border-primary');//border for the search city and its contents  
            var cityNameEl = $('<h2>');
            cityNameEl.text(currentCity);
            currentWeatherEl.append(cityNameEl);
            
           //Display Current date
            var currentCityDate = data.current.dt;//unix timestamp,a way of representing dates and times as a single number,
            currentCityDate = moment.unix(currentCityDate).format("MM/DD/YYYY");//moment.unix() function is used to create a Moment object from the Unix timestamp
            var currentDateEl = $('<span>');
            currentDateEl.text(` (${currentCityDate}) `);//jQuery function that creates a jQuery object 
            cityNameEl.append(currentDateEl);

           //Display Weather icon           
            var currentCityWeatherIcon = data.current.weather[0].icon; // current is the object of the data
            var currentWeatherIconEl = $('<img>');//jquery 
            currentWeatherIconEl.attr("src", "http://openweathermap.org/img/wn/" + currentCityWeatherIcon + ".png");
            cityNameEl.append(currentWeatherIconEl);

            //Display Current temperature
            var currentCityTemp = data.current.temp;
            var currentTempEl = $('<p>')
            currentTempEl.text(`Temp: ${currentCityTemp}°C`)
            currentWeatherEl.append(currentTempEl);
            
            // Wind Speed 
            var currentCityWind = data.current.wind_speed;
            var currentWindEl = $('<p>')
            currentWindEl.text(`Wind: ${currentCityWind} KPH`)
            currentWeatherEl.append(currentWindEl);

            // get current humidity and display
            var currentCityHumidity = data.current.humidity;
            var currentHumidityEl = $('<p>')
            currentHumidityEl.text(`Humidity: ${currentCityHumidity}%`)
            currentWeatherEl.append(currentHumidityEl);

            // get current UV index, set background color based on level and display
            var currentCityUV = data.current.uvi;
            var currentUvEl = $('<p>');
            var currentUvSpanEl = $('<span>');
            currentUvEl.append(currentUvSpanEl);

            currentUvSpanEl.text(`UV: ${currentCityUV}`)
            
            if ( currentCityUV < 3 ) {
                currentUvSpanEl.css({'background-color':'green', 'color':'white'});
            } else if ( currentCityUV < 6 ) {
                currentUvSpanEl.css({'background-color':'yellow', 'color':'black'});
            } else if ( currentCityUV < 8 ) {
                currentUvSpanEl.css({'background-color':'orange', 'color':'white'});
            } else if ( currentCityUV < 11 ) {
                currentUvSpanEl.css({'background-color':'red', 'color':'white'});
            } else {
                currentUvSpanEl.css({'background-color':'violet', 'color':'white'});
            }

            currentWeatherEl.append(currentUvEl);
           
            //Five Day Forecast
            var fiveDayForecastHeaderEl = $('#fiveDayForecastHeader');
            var fiveDayHeaderEl = $('<h2>');
            fiveDayHeaderEl.text('5-Day Forecast:');
            fiveDayForecastHeaderEl.append(fiveDayHeaderEl);
            var fiveDayForecastEl = $('#fiveDayForecast');

            for (var i = 1; i <=5; i++) {
                var date;
                var temp;
                var icon;
                var wind;
                var humidity;

                date = data.daily[i].dt;//check the data object in the console
                date = moment.unix(date).format("MM/DD/YYYY");
                temp = data.daily[i].temp.day;
                icon = data.daily[i].weather[0].icon;
                wind = data.daily[i].wind_speed;
                humidity = data.daily[i].humidity;

                // card Element
                var card = document.createElement('div');
                card.classList.add('card', 'col-2', 'm-1', 'bg-primary', 'text-white');
                
                // add div to the card element
                var cardBody = document.createElement('div');
                cardBody.classList.add('card-body');
                cardBody.innerHTML = `<h6>${date}</h6>
                                      <img src= "http://openweathermap.org/img/wn/${icon}.png"> </><br>
                                       ${temp}°C<br>
                                       ${wind} KPH <br>
                                       ${humidity}%`
                
                card.appendChild(cardBody);
                fiveDayForecastEl.append(card);
            }
        })
    return;//return the value
}

// save searched city 
function searchHistory() {
    var storedCities = JSON.parse(localStorage.getItem("cities")) || [];//JSON string retrieved from localStorage into an array of city names.
    var pastSearchesEl = document.getElementById('past-searches');

    pastSearchesEl.innerHTML ='';

    for (i = 0; i < storedCities.length; i++) {
        
        var pastCityBtn = document.createElement("button");
        pastCityBtn.classList.add("btn", "btn-primary", "my-2", "past-city");
        pastCityBtn.setAttribute("style", "width: 100%");
        pastCityBtn.textContent = `${storedCities[i].city}`;
        pastSearchesEl.appendChild(pastCityBtn);
    }
    return;
}

// Current weather data Api Doc to get currentcity weather
function getCityInfo () {
    var requestUrl = `https://api.openweathermap.org/data/2.5/weather?q=${currentCity}&appid=${APIkey}`;
    var storedCities = JSON.parse(localStorage.getItem("cities")) || [];

    fetch(requestUrl)
      .then(function (response) {
        if (response.status >= 200 && response.status <= 299) {
            return response.json();
          } else {
            throw Error(response.statusText);
          }
      })
      .then(function(data) {
 
        var cityInfo = {
            city: currentCity,
            lon: data.coord.lon,
            lat: data.coord.lat
        }

        storedCities.push(cityInfo);
        localStorage.setItem("cities", JSON.stringify(storedCities));

        searchHistory();

        return cityInfo;
      })
      .then(function (data) {
        getWeather(data);
      })
      return;
}

// clear the search history
function handleClearHistory (event) {
    event.preventDefault();
    var pastSearchesEl = document.getElementById('past-searches');

    localStorage.removeItem("cities");
    pastSearchesEl.innerHTML ='';

    return;
}

function clearCurrentCityWeather () {
    var currentWeatherEl= document.getElementById("currentWeather");
    currentWeatherEl.innerHTML = '';

    var fiveDayForecastHeaderEl = document.getElementById("fiveDayForecastHeader");
    fiveDayForecastHeaderEl.innerHTML = '';

    var fiveDayForecastEl = document.getElementById("fiveDayForecast");
    fiveDayForecastEl.innerHTML = '';

    return;
}

// clear  past weather data, cards, titles
function handleCityFormSubmit (event) {
    event.preventDefault();
    currentCity = cityInputEl.val().trim();

    clearCurrentCityWeather();
    getCityInfo();//

    return;
}

// When user clicks on city previously searched, an updated forecast will be retrieved and displayed
function getPastCity (event) {
    var element = event.target;

    if (element.matches(".past-city")) {
        currentCity = element.textContent;
        
        clearCurrentCityWeather();

        var requestUrl = `https://api.openweathermap.org/data/2.5/weather?q=${currentCity}&appid=${APIkey}`;
        
        fetch(requestUrl)
          .then(function (response) {
            if (response.status >= 200 && response.status <= 299) {
                return response.json();
              } else {
                throw Error(response.statusText);
              }
           })
           .then(function(data) {
                var cityInfo = {
                    city: currentCity,
                    lon: data.coord.lon,
                    lat: data.coord.lat
                }
                return cityInfo;
            })
           .then(function (data) {
                getWeather(data);
        })
    }
    return;
}

searchHistory();

searchBtn.on("click", handleCityFormSubmit);

clearBtn.on("click", handleClearHistory);

pastSearchedCitiesEl.on("click", getPastCity);