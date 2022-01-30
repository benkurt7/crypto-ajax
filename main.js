///<reference path = "jquery-3.5.1.js"/>


let symbolIndexArray = [];
let result;
let addChoise;
// click on Coins tab
$("#coinsButton").on("click", function surf() {

    $("#searchInput").val("");
    $("#containerDiv").html("").show();
    $("#containerResult").hide();
    $("#containerAbout").hide();
    $.ajax({
        method: "GET",
        url: "https://api.coingecko.com/api/v3/coins/list",
        error: err => alert(err),
        success: coins => {
            let counter = 0;
            let startCreatingBoxes = false;

            for (i = 0; i < coins.length; i++) {
                const id = coins[i].id;
                if (id === 'bitcoin') {
                    startCreatingBoxes = true;
                }

                if (startCreatingBoxes && counter < 100) {
                    const coinId = coins[i].id;
                    const symbol = coins[i].symbol;
                    const name = coins[i].name;
                    const infoButton = `
                      <button value="${name}" class="moreInfo btn btn-primary" data-toggle="modal" data-target="#exampleModalLong">
                      More Info</button>`;

                    const isChecked = localStorage.getItem(coinId);
                    const toggleButton = isChecked == null ?
                        `<div class="toggButt"><label class="switch" name=${symbol}>
                     <input type="checkbox" value=${coinId}>
                     <span class="slider"></span>
                     </label></div>` : `<div class="toggButt"><label class="switch" name=${symbol}>
                     <input type="checkbox" value=${coinId} checked>
                     <span class="slider"></span>
                     </label></div>`

                    let box = `<div id=${symbol} class="wraper" name="${coinId}"><div class="coinBox">
                            <div style="font-size: 25px;   text-transform: uppercase" class="toggDiv"><strong>${symbol}</strong>
                            <span>${toggleButton}</span></div>
                            <div id="nameDiv">${name}</div>
                            <div id="${coinId}">${infoButton}</div></div></div>`
                        ;
                    $("#containerDiv").append(box);
                    i += 50;
                    counter++;
                    symbolIndexArray.push(symbol);

                };
            };


            // "toggle" button
            $('input[type=checkbox]').on('change', function () {

                if ($('input[type=checkbox]:checked').length > 5) {
                    $(this).prop('checked', false);
                    const newChoise = $(this).parent().attr('name');
                    let selected = [];
                    selected.push(newChoise);
                    $('input[type=checkbox]:checked').each(function () {
                        selected.push($(this).parent().attr('name'));
                    });
                    $("#togModBody").html(" ");
                    for (i = 0; i < 6; i++) {
                        const html = `<input type="radio" name="coins" value=${selected[i]}><lable for="${selected[i]}">${selected[i]}</label>`;
                        $("#togModBody").append(html)
                    }
                    addChoise = newChoise;
                    $("#togMod").modal("show");
                }
                if ($(this).prop("checked") == true) { localStorage.setItem(this.value, true) }
                else { localStorage.removeItem(this.value) }
            });


            // "More Info" button      
            $(".moreInfo").on("click", function () {
                const getId = $(this).parent().attr("id");
                console.log(getId);
                const coinName = this.value;
                const pricesObj = sessionStorage.getItem(coinName);
                try {
                    let obj = JSON.parse(pricesObj);
                    $("#modalBody").text("");
                    $("#modalHeader > p").text("")
                    document.getElementById("modalImg").src = obj.image;
                    $("#modalHeader > p").append(`<h4>${coinName}</h4>`)
                    const modalBox = `<div class="currPrice"><h3>Current Prices </h3> <span>Last Time Updated: ${obj.time}</span></div><br>
                                                  <div class="modalBody">
                                                     <div class="prices">
                                                       <li><strong>$ ${obj.usd}</strong></li>&nbsp;&nbsp;<label> - US Dollar</label>
                                                     </div>
                                                     <div class="prices">
                                                       <li><strong>&#8364; ${obj.eur}</strong></li>&nbsp;&nbsp;<label> - Euro</label>
                                                     </div>
                                                     <div class="prices">
                                                       <li><strong>&#8362; ${obj.ils}</strong></li>&nbsp;&nbsp;<label> - New Israeli Shekel</label>
                                                  </div></div>`;
                    $("#modalBody").append(modalBox);
                }
                catch {
                    $.ajax({
                        method: "GET",
                        url: `https://api.coingecko.com/api/v3/coins/${getId}`,
                        error: err => console.log(err),

                        beforeSend: () => $("#loader1").show(),

                        success: info => {  //img, prices- dollar, euro, nis

                            $("#modalBody").text("");
                            $("#modalHeader > p").text("")
                            //creates comma in price
                            function thousandsSeparators(num) {
                                var numParts = num.toString().split(".");
                                numParts[0] = numParts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                                return numParts.join(".");
                            };

                            let imageURL = info.image.small;
                            let priceUSD = thousandsSeparators(info.market_data.current_price.usd);
                            let priceEur = thousandsSeparators(info.market_data.current_price.eur);
                            let priceILS = thousandsSeparators(info.market_data.current_price.ils);

                            let d = new Date();
                            let pricesObj = {
                                image: imageURL,
                                usd: priceUSD,
                                eur: priceEur,
                                ils: priceILS,
                                time: d.toLocaleTimeString()
                            }

                            sessionStorage.setItem(coinName, JSON.stringify(pricesObj))


                            document.getElementById("modalImg").src = imageURL;
                            $("#modalHeader > p").append(`<h4>${coinName}</h4>`)
                            const modalBox = `<h3>Current Prices</h3>
                                                  <div class="modalBody">
                                                     <div class="prices">
                                                       <li><strong>$ ${priceUSD}</strong></li>&nbsp;&nbsp;<label> - US Dollar</label>
                                                     </div>
                                                     <div class="prices">
                                                       <li><strong>&#8364; ${priceEur}</strong></li>&nbsp;&nbsp;<label> - Euro</label>
                                                     </div>
                                                     <div class="prices">
                                                       <li><strong>&#8362; ${priceILS}</strong></li>&nbsp;&nbsp;<label> - New Israeli Shekel</label>
                                                  </div></div>`;
                            $("#modalBody").append(modalBox);
                            $("#loader1").hide();
                        }
                    })
                    setTimeout(function () {
                        sessionStorage.removeItem(coinName)
                    }, 120000)
                }


            })
        }


    });



});


// click on Search button
$("#searchBtn").on("click", function () {

    let copy;
    let input = $("#searchInput").val().toLowerCase();
    const prop = $("#containerResult > .wraper").attr("id");
    // empty search
    if (input == "") {
        document.getElementById("searchInput").focus();
        return
    }

    try {

        validateInput(input);
        copy = result;
        result = document.getElementById(input);
        function check(result) {
            return (result ? result : copy);
        }
        $("#containerDiv").hide();
        let conRes = $("#containerResult");

        $(conRes).html(check(result));
        conRes.show();
        $("#searchInput").val("");
        $("#searchInput").focus();
    }
    catch (err) {
        alert(`Your Search "${input}" Did Not Yield Results. Try Generating Coins With "Coins" Button, Then Entering Coin Code(Symbol)`)
    }
})

function validateInput(input) {
    const index = symbolIndexArray.indexOf(input);
    if (index == -1) {
        document.getElementById("searchInput").focus();
        throw new Error()
    }
    return index
}


// JQuery about
$("#aboutButton").on("click", function () {
    $("#containerDiv").hide()
    $("#containerAbout").show()
})

// JQuery reports
$("#reportsButton").on("click", function () {
    $("#containerDiv").html("");
    $("#containerAbout").hide();
})




function removeCoin() {
    const remove = $("input[type=radio]:checked").val();
    if (remove === undefined || remove.length < 3) {
        $("#togModBody").html(" ");
        $("#togMod").modal("hide");
    }
    else {
        const id = $(`#${remove}`).attr("name");
        const newId = $(`#${addChoise}`).attr("name");
        $(`#${remove}  input`).prop('checked', false);
        localStorage.removeItem(id)
        if (id != newId) { localStorage.setItem(newId, true); }
        $("#togModBody").html(" ");
        $("#togMod").modal("hide");
        $("#coinsButton").click();
    }
};