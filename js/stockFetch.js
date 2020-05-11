// Lovely Ticker by Jaunius Kapkan

(function(){
    // Sepcify your AV key below:
    window.monitor_key = ''
    var AV = undefined
    window.monitor_symbols = []
    window.monitor_details = false

    window.getUrlParams = (customParam) => {
        urlParams = window.location.search.replace("?","")
        urlParamArray = urlParams.split("&")
        if (urlParams.includes(customParam)) {
            for (let param of urlParamArray) {
                paramData = param.split("=")
                if (paramData.length > 1 && paramData[0] == customParam) {
                    return paramData [1]
                }
            }
        }
        return false
    }

    window.getViewFromUrlParams = () => {
        var rawSymbols = window.getUrlParams("Symbols")
        if (rawSymbols) {
            window.monitor_symbols = rawSymbols.split(',')
        }
        var showDetails = window.getUrlParams("Details")
        if (showDetails && (showDetails == 'true')) {
            window.monitor_details = true
        }
        var avKey = window.getUrlParams("Key")
        if (avKey) {
            window.monitor_key = avKey
            AV = window.alphavantage.default({ key: window.monitor_key })
        }
    }

    window.updateUrl = () => {
        rootUrl = window.location.href.split("?")[0]
        queryUrl = "?"
        var paramDict = {
            "Symbols" : window.monitor_symbols.join(","),
            "Details" : window.monitor_details.toString(),
            "Key" : window.monitor_key
        }
        var params = Object.entries(paramDict)
        for (let param of params) {
            console.log(paramDict[param[0]])
            queryUrl += param[0] + "=" + paramDict[param[0]].replace(new RegExp(" ", "g"), "%20") + "&"
        }
        fullUrl = rootUrl + queryUrl.slice(0, -1)
        window.history.pushState("","Lovely Ticker",fullUrl)
    }

    window.addNewBox = () => {
        var symbolBox = "<div id='add_box' class='card mb-4 bg-transparent no-borders align-self-center'>\
                            <div class='align-middle'>\
                            <button id='add_button' type='button' class='btn btn-lg btn-dark box-shadow' data-toggle='tooltip' data-placement='top' title='Add New'>+</button>\
                            </div>\
                        </div>"
        $('#stock_list').append(symbolBox)
        $('[data-toggle="tooltip"]').tooltip()
        $('#add_button').on('click', function() {
            $('#add_box').remove()
            $('.tooltip').remove()
            window.newSymbolBox()
            }
        )
    }

    window.newSymbolBox = () => {
        var symbolBox = "<div id='new_sym_box' class='card mb-4 bg-transparent no-borders align-self-center'>\
                            <div class='align-middle'>\
                            <div class='input-group input-group-lg'>\
                            <div class='input-group-prepend'>\
                                <span class='input-group-text box-shadow no-borders stock-header' id='inputGroup-sizing-lg' >Add Symbols</span>\
                            </div>\
                            <input id='new_sym' type='text' class='form-control btn-dark box-shadow' aria-label='Large' aria-describedby='inputGroup-sizing-sm' placeholder='NDAQ, TWTR,..' >\
                            </div>\
                            <div class='btn-toolbar justify-content-between' role='toolbar' aria-label='Toolbar with button groups'>\
                            <div class='btn-group mr-2' role='group' aria-label='First group'>\
                            <button id='cancel_sym_button' type='button' class='btn btn-lg btn-dark box-shadow'>Cancel</button>\
                            </div>\
                            <div class='btn-group mr-2' role='group' aria-label='Second group'>\
                            <button id='add_sym_button' type='button' class='btn btn-lg btn-dark box-shadow'>Save</button>\
                            </div>\
                            </div>\
                            </div>\
                        </div>"
        $('#stock_list').append(symbolBox)
        $('[data-toggle="tooltip"]').tooltip()
        $('#cancel_sym_button').on('click', function() {
            $('#new_sym_box').remove()
            $('.tooltip').remove()
            window.addNewBox()
            }
        )
        $('#add_sym_button').on('click', function() {
            var newSymbolList = $('#new_sym').val().split(",")
            var formattedSymbolList = []
            for (var newSymbol of newSymbolList) {
                formattedSymbol = newSymbol.trim()
                if (!window.monitor_symbols.includes(formattedSymbol)) {
                    window.monitor_symbols.push(formattedSymbol)
                    formattedSymbolList.push(formattedSymbol)
                }
                else {
                    alert("Symbol Already Added: " + formattedSymbol)
                }
            }
            $('#new_sym_box').remove()
            window.addSymbolBox(formattedSymbolList)
            window.fetchSymbols(formattedSymbolList)
            }
        )
    }

    window.addSymbolBox = (symbolList) => {
        $('#add_box').remove()
        $('.close').off("click")
        for (var symbol of symbolList) {
            var symbolDetails = "<ul  id=" + symbol + "_details class='list-unstyled list-box mt-3 mb-4'>\
                                    <li>Loading...</li>\
                                </ul>"
            if (!window.monitor_details) {
                symbolDetails = ""
            }
            var symbolBox = "<div id=" + symbol + "_card class='card mb-4 box-shadow'>\
                                <div class='card-header stock-header'>\
                                <button type='button' class='close' aria-label='Close' data-toggle='tooltip' data-placement='left' title='Remove'>\
                                    <span aria-hidden='true'>&times;</span>\
                                </button>\
                                <h4 class='my-0 stock-title font-weight-normal'>" + symbol + "</h4>\
                                </div>\
                                <div class='card-body'>\
                                    <h1 class='card-title pricing-card-title'>\
                                    <span id=" + symbol + "_px> Loading...</span> \
                                    <small id=" + symbol + "_diff class='text-muted'> </small></h1>\
                                    " + symbolDetails + "\
                                </div>\
                            </div>"
            $('#stock_list').append(symbolBox)
        }
        $('[data-toggle="tooltip"]').tooltip()
        $('.close').on('click', function() {
            var cardToRemove = $(this).closest('.card').attr('id')
            $("#" + cardToRemove).remove()
            window.monitor_symbols.splice(window.monitor_symbols.indexOf(cardToRemove.split('_')[0]), 1)
            $('.tooltip').remove()
            window.updateUrl()
            }
        )
        window.addNewBox()
        window.updateUrl()
    }

    

    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    function updateSymbol (symbolData) {
        var detailFields = ['02. open','03. high','04. low','06. volume','08. previous close','07. latest trading day']
        var marketData = symbolData['Global Quote']
        var change = parseFloat(marketData['10. change percent'].trim('%'))
        var symbolId = '#' + marketData['01. symbol']
        move = '⯆'
        diffClass = 'stock-down'
        if (change > 0) {
            move = '⯅'
            diffClass = 'stock-up'
        }
        else if (change == 0) {
            move = '•'
            diffClass = 'text-muted'
        }
        $(symbolId + '_px').text('$' + parseFloat(marketData['05. price']).toFixed(2))
        $(symbolId + '_diff').text(move + change.toFixed(2).replace('-','') + '%')
        $(symbolId + '_diff').removeClass()
        $(symbolId + '_diff').addClass(diffClass)
        if (window.monitor_details) {
            $(symbolId + '_details').empty()
            for (var symbolDetail of detailFields) {
                detailName = symbolDetail.split('.')[1].trim(' ')
                detailValue = marketData[symbolDetail]
                $('#' + marketData['01. symbol'] + '_details').append('<li>' + capitalizeFirstLetter(detailName) + ': ' + detailValue + '</li>')
            }
        }

    }

    window.fetchSymbols = (symbolList) => {
        for (var symbol of symbolList) {
            var data = AV.data.quote(symbol).then(data => {
                updateSymbol(data);
            })
        }   
    }

    function monitorStocks (){
        window.fetchSymbols(window.monitor_symbols)
        setTimeout( function() {
            monitorStocks()
        }, 180000)
      }

    window.onload = function(){
        window.getViewFromUrlParams()
        AV = window.alphavantage.default({ key: window.monitor_key });
        window.addSymbolBox(window.monitor_symbols)
        if (window.monitor_key.length < 16) {
            this.alert("AV Key not specified. Please specify in URL: &Key=XXXXXXXXXXXXXXX")
        }
        monitorStocks()
        $('[data-toggle="tooltip"]').tooltip()
    }



})();