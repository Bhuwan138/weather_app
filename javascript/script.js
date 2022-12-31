let weatherAPIKey = "64725c4448e6bbeda391e251252e1e29";
let currentLocationEndpoint = `https://api.openweathermap.org/data/2.5/weather?appid=${weatherAPIKey}&units=metric`;
let forcastBasedEndpoint = `https://api.openweathermap.org/data/2.5/forecast?units=metric&appid=${weatherAPIKey}`;
let geocodingBasedEndpoint = `http://api.openweathermap.org/geo/1.0/direct?limit=5&appid=${weatherAPIKey}&q=`;
let openingCurrentEndpoint = `http://api.openweathermap.org/geo/1.0/reverse?&limit=5&appid=${weatherAPIKey}`;

let city = document.querySelector(".weather_city");
let day = document.querySelector(".weather_day");
let humidity = document.querySelector(".weather_indicator--humidity>.value");
let wind = document.querySelector(".weather_indicator--wind>.value");
let pressure = document.querySelector(".weather_indicator--pressure>.value");
let currentLocaitonImage = document.querySelector(".weather_image");
let currentTemperature = document.querySelector(".weather_temperature>.value");
let searchInput = document.querySelector(".weather_search");
let weatherForcast = document.querySelector(".weather_forecast");
let dataList = document.getElementById("suggestion");


let weatherImage = [
    {
        url: "images/broken-clouds.png",
        ids: [803,804],
        description: "broken clouds"
    },
    {
        url: "images/clear-sky.png",
        ids: [800],
        description: "clear sky"
    },
    {
        url: "images/few-clouds.png",
        ids: [801],
        description: "few clouds"
    },
    {
        url: "images/mist.png",
        ids: [701,711,721,731,741,751,761,762,771,781],
        description: "mist"
    },
    {
        url: "images/rain.png",
        ids: [500,501,502,503,504],
        description: "rain"
    },
    {
        url: "images/scattered-clouds.png",
        ids: [802],
        description: "scattered clouds"
    },
    {
        url: "images/shower-rain.png",
        ids: [520,521,522,531],
        description: "shower rain"
    },
    {
        url: "images/snow.png",
        ids: [600,601,602,611,612,613,615,616,620,621,622],
        description: "snow"
    },
    {
        url: "images/thunderstrom.png",
        ids: [200,201,202,210,211,212,221,230,231,232],
        description: "thunderstrom"
    }
]

window.onload = ()=>{
    // let lat;
    // let lon;
    let option = {
        enableHighFrequency: true,
        timeout: 5000,
        maxiumAge: 10000
    }
    let lon,lat;
    let success = async (position)=>{
        let coords = position.coords;
        lat = coords.latitude.toString();
        lon = coords.longitude.toString();
        console.log(lat,lon)
        let endPoint = `${openingCurrentEndpoint}&lat=${lat}&lon=${lon}`;
        console.log(endPoint)
        let response =await fetch(endPoint);
        let result = await response.json();
        let city = result[0].name;
        weatherForCity(city)
        console.log(result[0].name)
    }
    let error = (err)=>{
        console.log(err.code,err.message);
    }
    navigator.geolocation.getCurrentPosition(success,error);

    
}

let getForcastByCityID =async id =>{
    let endPoint = `${forcastBasedEndpoint}&id=${id}`;
    let result =await fetch(endPoint);
    let forcast = await result.json();
    let forcastList = forcast.list;
    let daily = [];
    forcastList.forEach(day => {
        let date_txt = day.dt_txt;
        date_txt = date_txt.replace(" ","T");
        let date = new Date(date_txt);
        let hours = date.getHours();
        if(hours === 9){
            daily.push(day);
            
        }
    });

    console.log(daily)
    return daily;
}

let getWeatherByCityName = async city =>{
    let endPoint = `${currentLocationEndpoint}&q=${city}`;
    let response = await fetch(endPoint);
    let weather = await response.json();
    return weather;
}

let updateCurrentWeather = (data) =>{
    city.innerText = data.name;
    day.innerText = dayOfWeek();
    humidity.innerText = data.main.humidity; 
    let windDirection = "";
    let deg = data.wind.deg;
    if(deg>45 && deg <=135) windDirection = "East";
    else if(deg>135 && deg <= 225) windDirection = "South";
    else if(deg>225 && deg  <= 315) windDirection = "West";
    else windDirection = "North";

    wind.innerText = `${windDirection}, ${data.wind.speed}`;
    pressure.innerText = data.main.pressure;
    currentTemperature.innerText =  data.main.temp>0? "+"+Math.round(data.main.temp):Math.round(data.main.temp);
    let imgID = data.weather[0].id;
    weatherImage.forEach((obj)=>{
        if(obj.ids.indexOf(imgID) != -1){
            currentLocaitonImage.src = obj.url;
            currentLocaitonImage.title = obj.description;
        }
    })
};

let dayOfWeek = (millisecond = new Date().getTime()) =>{
    return new Date(millisecond).toLocaleDateString("en-EN",{weekday:"long"});
};

let weatherForCity = async city =>{
    let weather = await getWeatherByCityName(city);
    if(weather.cod==="404"){
        Swal.fire({
            icon:"error",
            title: "OOPs...",
            text: "You typed wrong city name"
        })
        return;
    }
    updateCurrentWeather(weather);
    let cityID = weather.id;
    let forcast = await getForcastByCityID(cityID);
    updateForcast(forcast);
};

searchInput.addEventListener("keydown",async e=>{
    if(e.keyCode === 13){
        weatherForCity(searchInput.value);
    }
})

searchInput.addEventListener("input",async ()=>{
    if(searchInput.value.length <= 2) return;
    let endPoint = geocodingBasedEndpoint + searchInput.value;
    let response =await fetch(endPoint);
    let result =await response.json();
    dataList.innerHTML = "";
    result.forEach((city)=>{
        let option = document.createElement("option");
        option.value = `${city.name}${city.state?","+city.state:""},${city.country}`;
        dataList.appendChild(option);
    })

})

let updateForcast = forcast =>{
    weatherForcast.innerHTML = "";
    let forcastItem = "";
    forcast.forEach((data)=>{
        let iconUrl = `http://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
        let temperature = data.main.temp>0? "+"+Math.round(data.main.temp):Math.round(data.main.temp);
        let dayName = dayOfWeek(data.dt*1000);
        forcastItem += `
            <article class="weather_forecast_item">
                <img src="${iconUrl}" alt="${data.weather[0].description}" title="${data.weather[0].description}" class="weather_forecast_icon">
                <h3 class="weather_forecast_day">${dayName}</h3>
                <p class="weather_forecast_temperature"> <span class="value">${temperature}</span> &deg;C </p>
            </article>
        `;
    })

    weatherForcast.innerHTML = forcastItem;
}
