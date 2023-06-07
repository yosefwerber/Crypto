/// <reference path="jquery-3.6.1.js" />
"use strict";


(() => {

    const currenciesLink = document.getElementById("currenciesLink");
    const reportsLink = document.getElementById("reportsLink");
    const aboutLink = document.getElementById("aboutLink");
    const contentDiv = document.getElementById("contentDiv");
    const searchButton = document.getElementById("searchButton");
    const contentModalList = document.getElementById("contentModalList");
    const spinner = document.getElementById("spinner");

    let chosenCoins = []; // array to hold the 5 coins the user chooses
    let coins = []; // array holding ALL coins from json

    currenciesLink.addEventListener("click", handleCurrencies);
    reportsLink.addEventListener("click", handleReports);
    aboutLink.addEventListener("click", handleAbout);
    searchButton.addEventListener("click", handleSearch);

    // show currencies page at start
    handleCurrencies();

    ////////////////////////////////////////////
    async function handleCurrencies() {
        spinner.innerHTML = spinnerHtml();
        coins = await getJson("https://api.coingecko.com/api/v3/coins");
        displayCoins(coins);
        checkChosenCoins(chosenCoins);
    }

    // Get loading spinner html code:
    function spinnerHtml() {
        return `
        <button class="btn btn-primary" type="button" disabled>
        <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
            Loading...
        </button>`
    }

    // DISPLAY THE COINS:
    function displayCoins(coins) {
        spinner.innerHTML = ""; // remove loading spinner

        let html = "";

        // loop over all coins and add them to html
        for (const coin of coins) {
            html += getSingleCoinHtml(coin);
        }
        contentDiv.innerHTML = html;
    }

    // get the html content in div for 1 coin
    function getSingleCoinHtml(coin) {
        let html = "";

        html += `
                <div class="card" id="card${coin.id}">

                    <div class="form-check form-switch form-check-reverse">
                        <input class="form-check-input" type="checkbox" id="${coin.id}">
                        <label class="form-check-label" for="flexSwitchCheckReverse"></label>
                    </div>

                    ${coin.symbol.toUpperCase()}
                    <br>
                    ${coin.name}
                    <br>

                    <button class="btn btn-primary" onclick="toggleInfo('${coin.id}')">More Info</button>

                    <div class="collapse" id="collapse${coin.id}">
                        <div class="card-body">
                            <img src="${coin.image.small}">
                            ${coin.market_data.current_price.usd}$
                            <span> | </span>
                            ${coin.market_data.current_price.eur}€
                            <span> | </span>
                            ${coin.market_data.current_price.ils}₪
                        </div>
                    </div>

                </div>
            `;
        // const infoCoin2 = document.getElementById(`collapse${coin.id}`);
        // infoCoin2.style.display = "block";

        return html;
    }



    // check the checkbox of the coins already chosen:
    // if the user goes from 1 section to another
    // using the navigation bar - when he returns to the main page,
    // the coins already chosen should still be marked.
    function checkChosenCoins(chosenCoins) {
        for (const coin of chosenCoins) {
            const checkBox = document.getElementById(`${coin.id}`);
            checkBox.checked = true;
        }
    }
    ////////////////////////////////////////////
    // SEARCH 
    function handleSearch() {
        event.preventDefault()
        const userSearchInput = document.getElementById("userSearchInput");
        let searchValue = userSearchInput.value;
        searchValue = searchValue.toLowerCase();  // support upper case search

        // support search of part of the word& name - not required
        // const searchedCoinsBySymbol = coins.filter(coin => coin.symbol.includes(searchValue));
        // const searchedCoinsByName = coins.filter(coin => coin.name.includes(searchValue));
        // const searchedCoins = searchedCoinsBySymbol.concat(searchedCoinsByName);

        // search by exact symbol
        const searchedCoins = coins.filter(coin => coin.symbol === searchValue);

        displayCoins(searchedCoins);

        if (searchedCoins.length === 0) {
            contentDiv.innerHTML = `<div class="msg">
                    <br>
                    ${searchValue}: symbol not found
                </div>`;
        }
    }

    ////////////////////////////////////////////
    // MODAL HANDLING

    // CLOSE BUTTONS:
    $("#closeModal1").on("click", function () {
        closeModal();
    });

    $("#closeModal2").on("click", function () {
        closeModal();
    });

    function closeModal() {
        if (chosenCoins.length > 5) {
            const modalMsg = document.getElementById("modalMsg");
            $("#modalMsg").css("background-color", "#FFFF00");
        }
        else {
            $("#exampleModal").modal("hide");
        }
    }

    ////////////////////////////////////////////
    // CHECKBOX OF A COIN - ADD COIN TO ARRAY & SHOW MODAL IN CASE OF AN ERROR:

    // when a checkbox is checked - add the checked coin to the array
    // if there are more than 5 coins - let the user choose which ones he wants
    // to delete (using a modal)
    $("body").on("change", ".form-check-input", function () {
        if (this.checked) {
            const coinToAdd = coins.filter(coin => coin.id === this.id);
            chosenCoins.push(coinToAdd[0]);

            // check if there are already 5 chosen coins
            if (chosenCoins.length > 5) {
                displayModelText();

                // show Modal, without letting the user close it before removing coins
                $('#exampleModal').modal({
                    keyboard: false,
                    backdrop: false
                })

                $("#exampleModal").modal('show');
            }
        } else { // if a checkbox is unchecked
            // remove from chosen list
            chosenCoins = chosenCoins.filter(coin => coin.id !== this.id);
        }
    });

    // MODAL - REMOVE A COIN:
    // on click of a "remove" button:
    $("body").on("click", ".modal-rm-btn", function () {
        // uncheck checkbox
        const removeId = (chosenCoins.filter(coin => coin.symbol === this.id))[0].id;
        document.getElementById(`${removeId}`).checked = false;

        // remove from chosen list
        chosenCoins = chosenCoins.filter(coin => coin.symbol !== this.id);

        // display text again after removing a coin
        displayModelText();
    });

    // put the html with the updated coins to modal html
    function displayModelText() {
        let html = ""
        // add the chosen coins to the modal
        for (const coin of chosenCoins) {
            html += `
            <li class="list-group-item d-flex justify-content-between align-items-center">
             ${coin.symbol} 
            <button id="${coin.symbol}" class="modal-rm-btn btn btn-danger mr-2" type="button">Remove</button>
             </li>
            `;
        }
        contentModalList.innerHTML = html;
        $("#modalMsg").css("background-color", "#FFFFFF");
    }

    ////////////////////////////////////////////

    async function getJson(url) {
        const response = await fetch(url);
        const json = await response.json();
        return json;
    }


    ////////////////////////////////////////////
    // ABOUT
    function handleAbout() {
        let html = "";

        html += `
        <div id ="aboutDiv">  
        <div class="container text-center">
                <div class="about-yosef-card-body">
                    <h1 class="my-card-title">About Yosef</h5>
                    <p class="my-card-text">Yosef Werber, full-stack student at John Bryce,
                        father to Berry the cat and Luna the dog. Loves action movies and relaxing in the nature.<br>
                            Experienced in JS, HTML5, CSS and more.
                    </p>
                </div>
                <div class="about-project-card-body">
                    <h1 class="my-card-title">About the Website</h5>
                    <p class="my-card-text">
                        This project provides real time information regarding virtual currencies.<br>
                        Technologies used: Ajax (RESTful API), Bootstrap, CSS5, HTML5, DOM HTML, Parallax
                </div>
        </div>

        <img class="yosef-img" src="/assets/images/Yosef.jpg" alt="Yosef Werber">
        </div>
`
        contentDiv.innerHTML = html;
    }



    ////////////////////////////////////////////
    // LIVE REPORTS

    function handleReports() {
        if (chosenCoins.length === 0) {
            contentDiv.innerHTML = `
            <div class="msg">
            <br>
            no coins chosen
            </div>`;
        }
        else {
            getLiveReports();
        }
    }

    function getLiveReports() {
        $("#contentDiv").html(
            `
          <div id="chartContainer" style="height: 370px; width: 100%; margin: 20px;"></div>
          `
        );

        let time = new Date().getTime();
        let chart = getNewChart();

        let liveArray = [];
        for (const coin of chosenCoins) {
            liveArray.push(coin.symbol.toUpperCase());
        }

        // API of live data
        const reportedCoinsString = liveArray.join(",");
        const reportURL = `https://min-api.cryptocompare.com/data/pricemulti?fsyms=${reportedCoinsString}&tsyms=USD`;

        // get data and print to chart
        $.ajax({
            url: reportURL,
            beforeSend: function () {
                spinner.innerHTML = spinnerHtml();
            },
            success: function (result) {
                addDataToChart(result);
            }
        });

        // every 2 seconds get data and print to chart
        const myInterval = setInterval(function () {
            $.ajax({
                url: reportURL,
                success: function (result) {
                    addDataToChart(result);
                }
            });
        }, 2000);


        //Save interval to data for global access
        $("body").data("interval", myInterval);

        function addDataToChart(result) {
            spinner.innerHTML = ""; // remove loading spinner

            liveArray.forEach((coin, index) => {
                time = new Date().getTime();
                time -= time % 1000;  //1000 milliseconds = 1 second

                if (result[coin] !== undefined) {
                    chart.options.data[index].dataPoints.push({
                        x: time,
                        y: result[coin]["USD"],
                        name: coin
                    });
                    chart.options.data[index].legendText = coin;
                    chart.render();
                } else {
                    //if coin data doesn't exist in API
                    chart.options.data[index].dataPoints.push({
                        x: time,
                        y: "No Data",
                        name: coin
                    });

                    chart.options.data[index].legendText = coin;
                    chart.render();
                }
            });
        }
    }

    function getNewChart() {
        return new CanvasJS.Chart("chartContainer", {
            zoomEnabled: true,
            title: {
                text: "Live Reports"
            },
            axisX: {
                valueFormatString: "HH:mm:ss"
            },
            axisY: {
                title: "Coin Value",
                prefix: "$",
                includeZero: false
            },
            toolTip: {
                shared: true
            },

            legend: {
                cursor: "pointer",
                verticalAlign: "top",
                fontSize: 22,
                fontColor: "Black"
            },
            data: [
                {
                    type: "line",
                    xValueType: "dateTime",
                    yValueFormatString: "$####.00",
                    xValueFormatString: "HH:mm:ss",
                    showInLegend: true,
                    dataPoints: []
                },
                {
                    type: "line",
                    xValueType: "dateTime",
                    yValueFormatString: "$####.00",
                    xValueFormatString: "HH:mm:ss",
                    showInLegend: true,
                    dataPoints: []
                },
                {
                    type: "line",
                    xValueType: "dateTime",
                    yValueFormatString: "$####.00",
                    xValueFormatString: "HH:mm:ss",
                    showInLegend: true,
                    dataPoints: []
                },
                {
                    type: "line",
                    xValueType: "dateTime",
                    yValueFormatString: "$####.00",
                    xValueFormatString: "HH:mm:ss",
                    showInLegend: true,
                    dataPoints: []
                },
                {
                    type: "line",
                    xValueType: "dateTime",
                    yValueFormatString: "$####.00",
                    xValueFormatString: "HH:mm:ss",
                    showInLegend: true,
                    dataPoints: []
                }
            ]
        });
    }

})();


function toggleInfo(coinId) {
    const infoCoin = document.getElementById(`collapse${coinId}`);
    if (infoCoin.style.display === "block") {
        infoCoin.style.display = "none";
    } else {
        infoCoin.style.display = "block";
    }
}
