// AWS Configs
AWS.config.region = '---------';
AWS.config.credentials = new AWS.Credentials('--------------------', '----------------------------------------');

// Function to read GET vars
function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

var duration = getParameterByName('duration'); // in ms
if (!duration) duration = "172800000"; // 48 hours default

document.getElementById('durationSelect').value = Number(duration);

var showing = "";

switch (Number(duration)) {
    case 86400000:
        showing = "Showing last 24 hours.";
        break;
    case 172800000:
        showing = "Showing last 48 hours.";
        break;
    case 604800000:
        showing = "Showing last week.";
        break;
    case 1209600000:
        showing = "Showing last 2 weeks.";
        break;
    case 2419200000:
        showing = "Showing last monthh.";
        break;
    case 4838400000:
        showing = "Showing last 2 months.";
        break;
    case 14515200000:
        showing = "Showing last 6 months.";
        break;
    case 290304000012:
        showing = "Showing last year.";
        break;
    default:
        showing = "Showing last 48 hours.";
}

var elements = document.getElementsByClassName("showing");
for (var i = 0; i < elements.length; i++) {
    elements[i].textContent = showing;
}

var dynamodb = new AWS.DynamoDB();
var datumVal = new Date() - Number(duration);

// DynamoDB Query - Garage Temp
var paramsg = {
    TableName: 'sentrypi-data-capture',
    KeyConditionExpression: '#id = :iottopic and #ts >= :datum',
    ExpressionAttributeNames: {
        "#id": "id",
        "#ts": "timestamp"
    },
    ExpressionAttributeValues: {
        ":iottopic": {
            "S": "sentryPi/sensor"
        },
        ":datum": {
            "N": datumVal.toString()
        }
    }
};

// DynamoDB Query - Freezer Temp
var paramsf = {
    TableName: 'sentrypi-data-capture',
    KeyConditionExpression: '#id = :iottopic and #ts >= :datum',
    ExpressionAttributeNames: {
        "#id": "id",
        "#ts": "timestamp"
    },
    ExpressionAttributeValues: {
        ":iottopic": {
            "S": "sentryPi/freezer"
        },
        ":datum": {
            "N": datumVal.toString()
        }
    }
};

// DynamoDB Query - Door State
var paramsd = {
    TableName: 'sentrypi-data-capture',
    KeyConditionExpression: '#id = :iottopic and #ts >= :datum',
    ExpressionAttributeNames: {
        "#id": "id",
        "#ts": "timestamp"
    },
    ExpressionAttributeValues: {
        ":iottopic": {
            "S": "sentryPi/door"
        },
        ":datum": {
            "N": datumVal.toString()
        }
    }
};

// DynamoDB Query - Outside Temp
var paramsot = {
    TableName: 'sentrypi-data-capture',
    KeyConditionExpression: '#id = :iottopic and #ts >= :datum',
    ExpressionAttributeNames: {
        "#id": "id",
        "#ts": "timestamp"
    },
    ExpressionAttributeValues: {
        ":iottopic": {
            "S": "sentryPi/outside"
        },
        ":datum": {
            "N": datumVal.toString()
        }
    }
};

// DynamoDB Query - Inside Temp
var paramsit = {
    TableName: 'sentrypi-data-capture',
    KeyConditionExpression: '#id = :iottopic and #ts >= :datum',
    ExpressionAttributeNames: {
        "#id": "id",
        "#ts": "timestamp"
    },
    ExpressionAttributeValues: {
        ":iottopic": {
            "S": "sentryPi/inside"
        },
        ":datum": {
            "N": datumVal.toString()
        }
    }
};

// DynamoDB Query - Barometric Pressure
var paramsbmp = {
    TableName: 'sentrypi-data-capture',
    KeyConditionExpression: '#id = :iottopic and #ts >= :datum',
    ExpressionAttributeNames: {
        "#id": "id",
        "#ts": "timestamp"
    },
    ExpressionAttributeValues: {
        ":iottopic": {
            "S": "sentryPi/bmp180"
        },
        ":datum": {
            "N": datumVal.toString()
        }
    }
};

// DynamoDB Query - RPi CPU Data
var paramscpu = {
    TableName: 'sentrypi-data-capture',
    KeyConditionExpression: '#id = :iottopic and #ts >= :datum',
    ExpressionAttributeNames: {
        "#id": "id",
        "#ts": "timestamp"
    },
    ExpressionAttributeValues: {
        ":iottopic": {
            "S": "sentryPi/cpu"
        },
        ":datum": {
            "N": datumVal.toString()
        }
    }
};

// Chart Options
var options = {
    responsive: true,
    showLines: true,
    scales: {
        xAxes: [{
            display: false
        }],
        yAxes: [{
            ticks: {
                beginAtZero: true
            }
        }]
    }
};


var options2 = {
    responsive: true,
    showLines: true,
    scales: {
        xAxes: [{
            display: false
        }],
        yAxes: [{
            position: "left",
            "id": "y-axis-0"
        }, {
            position: "right",
            "id": "y-axis-1"
        }]
    }
};

// build chart garage
var ctxg = document.getElementById('myChartg').getContext('2d');
var myChartg = new Chart(ctxg, {
    type: 'line',
    data: {
        // set placeholders
        labels: [],
        datasets: [{
            label: 'Temperature',
            data: [],
            backgroundColor: "rgba(153,255,51,0.4)"
        }, {
            label: 'Humidity',
            data: [],
            backgroundColor: "rgba(255,153,0,0.4)"
        }] // datasets
    }, // data
    options: options
});

// build chart freezer
var ctxf = document.getElementById('myChartf').getContext('2d');
var myChartf = new Chart(ctxf, {
    type: 'line',
    data: {
        // set placeholders
        labels: [],
        datasets: [{
            label: 'Temperature',
            data: [],
            backgroundColor: "rgba(153,255,51,0.4)"
        }] // datasets
    }, // data
    options: options
});

// build chart door
var ctxd = document.getElementById('myChartd').getContext('2d');
var myChartd = new Chart(ctxd, {
    type: 'line',
    data: {
        // set placeholders
        labels: [],
        datasets: [{
            label: 'Garage Door Open',
            data: [],
            backgroundColor: "rgba(153,255,51,0.4)"
        }] // datasets
    }, // data
    options: options
});

// build chart outsideTemp
var ctxot = document.getElementById('myChartot').getContext('2d');
var myChartot = new Chart(ctxot, {
    type: 'line',
    data: {
        // set placeholders
        labels: [],
        datasets: [{
            label: 'Temperature',
            data: [],
            backgroundColor: "rgba(153,255,51,0.4)"
        }] // datasets
    }, // data
    options: options
});

// build chart insideTemp
var ctxit = document.getElementById('myChartit').getContext('2d');
var myChartit = new Chart(ctxit, {
    type: 'line',
    data: {
        // set placeholders
        labels: [],
        datasets: [{
            label: 'Temperature',
            data: [],
            backgroundColor: "rgba(153,255,51,0.4)"
        }] // datasets
    }, // data
    options: options
});

// build chart bmp180
var ctxbmp = document.getElementById('myChartbmp').getContext('2d');
var myChartbmp = new Chart(ctxbmp, {
    type: 'line',
    data: {
        // set placeholders
        labels: [],
        datasets: [{
            label: 'Pressure',
            yAxisID: 'y-axis-0',
            data: [],
            backgroundColor: "rgba(153,255,51,0.4)"
        }, {
            label: 'Temperature',
            yAxisID: 'y-axis-1',
            data: [],
            backgroundColor: "rgba(255,153,0,0.4)"
        }] // datasets
    }, // data
    options: options2
});

// build chart cpu
var ctxcpu = document.getElementById('myChartcpu').getContext('2d');
var myChartcpu = new Chart(ctxcpu, {
    type: 'line',
    data: {
        // set placeholders
        labels: [],
        datasets: [{
            label: 'CPU Load (5m)',
            yAxisID: 'y-axis-0',
            data: [],
            backgroundColor: "rgba(153,255,51,0.4)"
        }, {
            label: 'Temperature',
            yAxisID: 'y-axis-1',
            data: [],
            backgroundColor: "rgba(255,153,0,0.4)"
        }] // datasets
    }, // data
    options: options2
});

// DIAL SECTION - Get current / most recent value
//
// DynamoDB Query - Garage Temp
var dialparamsg = {
    TableName: 'sentrypi-data-capture',
    KeyConditionExpression: '#id = :iottopic and #ts >= :datum',
    ExpressionAttributeNames: {
        "#id": "id",
        "#ts": "timestamp"
    },
    ExpressionAttributeValues: {
        ":iottopic": {
            "S": "sentryPi/sensor"
        },
        ":datum": {
            "N": datumVal.toString()
        }
    },
    Limit: "1",
    ScanIndexForward: false
};

// DynamoDB Query - Freezer Temp
var dialparamsf = {
    TableName: 'sentrypi-data-capture',
    KeyConditionExpression: '#id = :iottopic and #ts >= :datum',
    ExpressionAttributeNames: {
        "#id": "id",
        "#ts": "timestamp"
    },
    ExpressionAttributeValues: {
        ":iottopic": {
            "S": "sentryPi/freezer"
        },
        ":datum": {
            "N": datumVal.toString()
        }
    },
    Limit: "1",
    ScanIndexForward: false
};

// DynamoDB Query - Door State
var dialparamsd = {
    TableName: 'sentrypi-data-capture',
    KeyConditionExpression: '#id = :iottopic and #ts >= :datum',
    ExpressionAttributeNames: {
        "#id": "id",
        "#ts": "timestamp"
    },
    ExpressionAttributeValues: {
        ":iottopic": {
            "S": "sentryPi/door"
        },
        ":datum": {
            "N": datumVal.toString()
        }
    },
    Limit: "1",
    ScanIndexForward: false
};

// DynamoDB Query - Outside Temp
var dialparamsot = {
    TableName: 'sentrypi-data-capture',
    KeyConditionExpression: '#id = :iottopic and #ts >= :datum',
    ExpressionAttributeNames: {
        "#id": "id",
        "#ts": "timestamp"
    },
    ExpressionAttributeValues: {
        ":iottopic": {
            "S": "sentryPi/outside"
        },
        ":datum": {
            "N": datumVal.toString()
        }
    },
    Limit: "1",
    ScanIndexForward: false
};

// DynamoDB Query - Inside Temp
var dialparamsit = {
    TableName: 'sentrypi-data-capture',
    KeyConditionExpression: '#id = :iottopic and #ts >= :datum',
    ExpressionAttributeNames: {
        "#id": "id",
        "#ts": "timestamp"
    },
    ExpressionAttributeValues: {
        ":iottopic": {
            "S": "sentryPi/inside"
        },
        ":datum": {
            "N": datumVal.toString()
        }
    },
    Limit: "1",
    ScanIndexForward: false
};

// DynamoDB Query - BMP180 Barometric Pressure
var dialparamsbmp = {
    TableName: 'sentrypi-data-capture',
    KeyConditionExpression: '#id = :iottopic and #ts >= :datum',
    ExpressionAttributeNames: {
        "#id": "id",
        "#ts": "timestamp"
    },
    ExpressionAttributeValues: {
        ":iottopic": {
            "S": "sentryPi/bmp180"
        },
        ":datum": {
            "N": datumVal.toString()
        }
    },
    Limit: "1",
    ScanIndexForward: false
};

// DynamoDB Query - RPi CPU data
var dialparamscpu = {
    TableName: 'sentrypi-data-capture',
    KeyConditionExpression: '#id = :iottopic and #ts >= :datum',
    ExpressionAttributeNames: {
        "#id": "id",
        "#ts": "timestamp"
    },
    ExpressionAttributeValues: {
        ":iottopic": {
            "S": "sentryPi/cpu"
        },
        ":datum": {
            "N": datumVal.toString()
        }
    },
    Limit: "1",
    ScanIndexForward: false
};
// 

// Pull data set from DynamoDB using parameters set above
function getData() {
    // garage
    dynamodb.query(paramsg, function(err, data) {
        if (err) {
            console.log(err);
            return null;
        } else {
            // placeholders for the data arrays
            var temperatureValues = [];
            var humidityValues = [];
            var labelValues = [];
            // placeholders for the data read
            var temperatureRead = 0.0;
            var humidityRead = 0.0;
            var timeRead = "";
            for (var i in data['Items']) {
                // read the values from the dynamodb JSON packet
                temperatureRead = parseFloat(data['Items'][i]['eventdata']['M']['temperature']['N']);
                humidityRead = parseFloat(data['Items'][i]['eventdata']['M']['humidity']['N']);
                timeRead = new Date(data['Items'][i]['eventdata']['M']['datetime']['S']);

                // append the read data to the data arrays -- convert from celsius to fahrenheit
                temperatureValues.push(temperatureRead * 1.8 + 32);
                humidityValues.push(humidityRead);
                labelValues.push(timeRead);
            } // for
            // set the chart object data and label arrays
            myChartg.data.labels = labelValues;
            myChartg.data.datasets[0].data = temperatureValues;
            myChartg.data.datasets[1].data = humidityValues;
            // redraw the graph canvas
            myChartg.update();
        } // else
    }); //dynamodb

    //freezer
    dynamodb.query(paramsf, function(err, data) {
        if (err) {
            console.log(err);
            return null;
        } else {
            // placeholders for the data arrays
            var temperatureValues = [];
            var labelValues = [];
            // placeholders for the data read
            var temperatureRead = 0.0;
            var timeRead = "";
            for (var i in data['Items']) {
                // read the values from the dynamodb JSON packet
                temperatureRead = parseFloat(data['Items'][i]['eventdata']['M']['temperature']['N']);
                timeRead = new Date(data['Items'][i]['eventdata']['M']['datetime']['S']);
                // append the read data to the data arrays -- convert from celsius to fahrenheit
                temperatureValues.push(temperatureRead * 1.8 + 32);
                labelValues.push(timeRead);
            } // for
            // set the chart object data and label arrays
            myChartf.data.labels = labelValues;
            myChartf.data.datasets[0].data = temperatureValues;
            // redraw the graph canvas
            myChartf.update();
        } // else
    }); //dynamodb

    // door
    dynamodb.query(paramsd, function(err, data) {
        if (err) {
            console.log(err);
            return null;
        } else {
            // placeholders for the data arrays
            var temperatureValues = [];
            var labelValues = [];
            // placeholders for the data read
            var temperatureRead = 0.0;
            var timeRead = "";
            for (var i in data['Items']) {
                // read the values from the dynamodb JSON packet
                temperatureRead = parseFloat(data['Items'][i]['eventdata']['M']['door']['N']);
                timeRead = new Date(data['Items'][i]['eventdata']['M']['datetime']['S']);

                // append the read data to the data arrays -- convert from celsius to fahrenheit
                temperatureValues.push(temperatureRead);
                labelValues.push(timeRead);
            } // for
            // set the chart object data and label arrays
            myChartd.data.labels = labelValues;
            myChartd.data.datasets[0].data = temperatureValues;
            // redraw the graph canvas
            myChartd.update();
        } // else
    }); //dynamodb

    // outside temps
    dynamodb.query(paramsot, function(err, data) {
        if (err) {
            console.log(err);
            return null;
        } else {
            // placeholders for the data arrays
            var temperatureValues = [];
            var labelValues = [];
            // placeholders for the data read
            var temperatureRead = 0.0;
            var timeRead = "";
            for (var i in data['Items']) {
                // read the values from the dynamodb JSON packet
                temperatureRead = parseFloat(data['Items'][i]['eventdata']['M']['temperature']['N']);
                timeRead = new Date(data['Items'][i]['eventdata']['M']['datetime']['S']);

                // append the read data to the data arrays -- convert from celsius to fahrenheit
                temperatureValues.push(temperatureRead * 1.8 + 32);
                labelValues.push(timeRead);
            } // for
            // set the chart object data and label arrays
            myChartot.data.labels = labelValues;
            myChartot.data.datasets[0].data = temperatureValues;
            // redraw the graph canvas
            myChartot.update();
        } // else
    }); //dynamodb

    // inside temps
    dynamodb.query(paramsit, function(err, data) {
        if (err) {
            console.log(err);
            return null;
        } else {
            // placeholders for the data arrays
            var temperatureValues = [];
            var labelValues = [];
            // placeholders for the data read
            var temperatureRead = 0.0;
            var timeRead = "";
            for (var i in data['Items']) {
                // read the values from the dynamodb JSON packet
                temperatureRead = parseFloat(data['Items'][i]['eventdata']['M']['temperature']['N']);
                timeRead = new Date(data['Items'][i]['eventdata']['M']['datetime']['S']);

                // append the read data to the data arrays -- convert from celsius to fahrenheit
                temperatureValues.push(temperatureRead * 1.8 + 32);
                labelValues.push(timeRead);
            } // for
            // set the chart object data and label arrays
            myChartit.data.labels = labelValues;
            myChartit.data.datasets[0].data = temperatureValues;
            // redraw the graph canvas
            myChartit.update();
        } // else
    }); //dynamodb

    // bmp180 pressure
    dynamodb.query(paramsbmp, function(err, data) {
        if (err) {
            console.log(err);
            return null;
        } else {
            // placeholders for the data arrays
            var pressureValues = [];
            var temperatureValues = [];
            var labelValues = [];
            // placeholders for the data read
            var pressureRead = 0.0;
            var temperatureRead = 0.0;
            var timeRead = "";
            for (var i in data['Items']) {
                // read the values from the dynamodb JSON packet
                pressureRead = parseFloat(data['Items'][i]['eventdata']['M']['pressure']['N']);
                temperatureRead = parseFloat(data['Items'][i]['eventdata']['M']['temperature']['N']);
                timeRead = new Date(data['Items'][i]['eventdata']['M']['datetime']['S']);

                // append the read data to the data arrays -- convert from celsius to fahrenheit
                pressureValues.push(pressureRead / 100.0);
                temperatureValues.push(temperatureRead * 1.8 + 32);
                labelValues.push(timeRead);
            } // for
            // set the chart object data and label arrays
            myChartbmp.data.labels = labelValues;
            myChartbmp.data.datasets[0].data = pressureValues;
            myChartbmp.data.datasets[1].data = temperatureValues;
            // redraw the graph canvas
            myChartbmp.update();
        } // else
    }); //dynamodb

    // cpu temp and load
    dynamodb.query(paramscpu, function(err, data) {
        if (err) {
            console.log(err);
            return null;
        } else {
            // placeholders for the data arrays
            var loadValues = [];
            var temperatureValues = [];
            var labelValues = [];
            // placeholders for the data read
            var loadRead = 0.0;
            var temperatureRead = 0.0;
            var timeRead = "";
            for (var i in data['Items']) {
                // read the values from the dynamodb JSON packet
                loadRead = parseFloat(data['Items'][i]['eventdata']['M']['cpuload']['N']);
                temperatureRead = parseFloat(data['Items'][i]['eventdata']['M']['temperature']['N']);
                timeRead = new Date(data['Items'][i]['eventdata']['M']['datetime']['S']);

                // append the read data to the data arrays -- convert from celsius to fahrenheit
                loadValues.push(loadRead);
                temperatureValues.push(temperatureRead * 1.8 + 32);
                labelValues.push(timeRead);
            } // for
            // set the chart object data and label arrays
            myChartcpu.data.labels = labelValues;
            myChartcpu.data.datasets[0].data = loadValues;
            myChartcpu.data.datasets[1].data = temperatureValues;
            // redraw the graph canvas
            myChartcpu.update();
        } // else
    }); //dynamodb

    // DIAL Section
    // placeholders for the data read
    var garageTemp = 0.0;
    var outsideTemp = 0.0;
    var insideTemp = 0.0;
    var freezerTemp = 0.0;
    var rpiTemp = 0.0;
    var doorState = 0.0;
    var garageHumidity = 0.0;
    var bmpPressure = 0.0;
    var bmpTemp = 0.0;
    // Garage
    dynamodb.query(dialparamsg, function(err, data) {
        if (err) {
            console.log(err);
            return null;
        } else {
            for (var i in data['Items']) {
                // read the values from the dynamodb JSON packet
                garageTemp = parseFloat(data['Items'][i]['eventdata']['M']['temperature']['N']) * 1.8 + 32;
                document.getElementById("garageTemp").innerHTML = (garageTemp.toFixed(1)).toString();
                garageHumidity = parseFloat(data['Items'][i]['eventdata']['M']['humidity']['N']);
                document.getElementById("garageHumidity").innerHTML = (garageHumidity.toFixed(0)).toString();
                document.getElementById("title-garage").innerHTML = "SentryPI - Garage Temp: " + (garageTemp.toFixed(1)).toString() + "&#8457;" + " - Humidity: " + (garageHumidity.toFixed(0)).toString() + "%";
                tsRead = new Date(data['Items'][i]['eventdata']['M']['datetime']['S']);
                document.getElementById("title-ts").innerHTML = tsRead;
            } // for
        } // else
    }); //dynamodb

    // Freezer
    dynamodb.query(dialparamsf, function(err, data) {
        if (err) {
            console.log(err);
            return null;
        } else {
            for (var i in data['Items']) {
                // read the values from the dynamodb JSON packet
                freezerTemp = parseFloat(data['Items'][i]['eventdata']['M']['temperature']['N']) * 1.8 + 32;
                document.getElementById("freezerTemp").innerHTML = (freezerTemp.toFixed(1)).toString();
                document.getElementById("title-freezer").innerHTML = "SentryPI - Freezer Temp: " + (freezerTemp.toFixed(1)).toString() + "&#8457;";
            } // for
        } // else
    }); //dynamodb

    // Outside
    dynamodb.query(dialparamsot, function(err, data) {
        if (err) {
            console.log(err);
            return null;
        } else {
            for (var i in data['Items']) {
                // read the values from the dynamodb JSON packet
                outsideTemp = parseFloat(data['Items'][i]['eventdata']['M']['temperature']['N']) * 1.8 + 32;
                document.getElementById("outsideTemp").innerHTML = (outsideTemp.toFixed(1)).toString();
                document.getElementById("title-outside").innerHTML = "SentryPI - Outside Temp: " + (outsideTemp.toFixed(1)).toString() + "&#8457;";
            } // for
        } // else
    }); //dynamodb

    // Inside
    dynamodb.query(dialparamsit, function(err, data) {
        if (err) {
            console.log(err);
            return null;
        } else {
            for (var i in data['Items']) {
                // read the values from the dynamodb JSON packet
                insideTemp = parseFloat(data['Items'][i]['eventdata']['M']['temperature']['N']) * 1.8 + 32;
                document.getElementById("insideTemp").innerHTML = (insideTemp.toFixed(1)).toString();
                document.getElementById("title-inside").innerHTML = "SentryPI - Inside Temp: " + (insideTemp.toFixed(1)).toString() + "&#8457;";
            } // for
        } // else
    }); //dynamodb

    // Pressure
    dynamodb.query(dialparamsbmp, function(err, data) {
        if (err) {
            console.log(err);
            return null;
        } else {
            for (var i in data['Items']) {
                // read the values from the dynamodb JSON packet
                bmpTemp = parseFloat(data['Items'][i]['eventdata']['M']['temperature']['N']) * 1.8 + 32;
                bmpPressure = parseFloat(data['Items'][i]['eventdata']['M']['pressure']['N']) / 100.0;
                //document.getElementById("bmpTemp").innerHTML = (bmpTemp.toFixed(1)).toString();
                document.getElementById("bmpPressure").innerHTML = (bmpPressure.toFixed(0)).toString();
                document.getElementById("title-bmp").innerHTML = "SentryPI - Barometric Pressure: " + (bmpPressure.toFixed(0)).toString() + " hPa";
            } // for
        } // else
    }); //dynamodb

    // Door
    dynamodb.query(dialparamsd, function(err, data) {
        if (err) {
            console.log(err);
            return null;
        } else {
            for (var i in data['Items']) {
                // read the values from the dynamodb JSON packet
                doorState = parseFloat(data['Items'][i]['eventdata']['M']['door']['N']);
                if (doorState == 1) document.getElementById("doorState").innerHTML = "Open";
                else document.getElementById("doorState").innerHTML = "Closed";
            } // for
        } // else
    }); //dynamodb

    // CPU Temp
    dynamodb.query(dialparamscpu, function(err, data) {
        if (err) {
            console.log(err);
            return null;
        } else {
            for (var i in data['Items']) {
                // read the values from the dynamodb JSON packet
                cpuTemp = parseFloat(data['Items'][i]['eventdata']['M']['temperature']['N']) * 1.8 + 32;
                cpuLoad = parseFloat(data['Items'][i]['eventdata']['M']['cpuload']['N']);
                document.getElementById("rpiTemp").innerHTML = (cpuTemp.toFixed(1)).toString();
                document.getElementById("title-cputemp").innerHTML = "SentryPI - CPU Temp: " + (cpuTemp.toFixed(1)).toString() + "&#8457; - CPU Load: " + (cpuLoad.toString());
            } // for
        } // else
    }); //dynamodb

} // function

// auto refresh
$(function() {
    getData();
    $.ajaxSetup({
        cache: false
    });
    setInterval(getData, 300000);
});
