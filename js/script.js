var data = [];
var coordsCenters;
var golbalX = [];
var golbalY = [];
var golbalK = 0;
var labels;
var col = [];
var std;
var mean;

var layout = {
  title: "Donnees Non Classifiees",
  showlegend: false,
  height: 500,
  width: 700,
  yaxis: { fixedrange: true },
  xaxis: { fixedrange: true },
};

Plotly.newPlot("drawPanel", data, layout);

function getRandomNumberBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function getEcludienDist(x1, y1, x2, y2) {
  var a = x1 - x2;
  var b = y1 - y2;
  return Math.sqrt(a * a + b * b);
}

function generateRandomData() {
  var a1 = document.querySelector("#centers").value;

  a1 = a1.split(",");

  var nbClasses = document.querySelector("#n_features").value;
  var minx = parseInt(a1[0]);
  var maxx = parseInt(a1[1]);
  var miny = parseInt(a1[0]);
  var maxy = parseInt(a1[1]);
  var minDist = document.querySelector("#dist").value;
  var minRaduis = parseFloat(document.querySelector("#raduis").value);
  var nbSamples = document.querySelector("#nb_samples").value;

  coordsCenters = [];

  while (coordsCenters.length < nbClasses) {
    var x_ = getRandomNumberBetween(minx, maxx);
    var y_ = getRandomNumberBetween(miny, maxy);

    var add = 1;
    for (let j = 0; j < coordsCenters.length; j++) {
      var dAB = getEcludienDist(
        coordsCenters[j][0],
        coordsCenters[j][1],
        x_,
        y_
      );
      if (dAB < minDist) {
        add = 0;
      }
    }
    if (add == 1) {
      coordsCenters.push([x_, y_]);
    }
  }

  var pointsX = [];
  var pointsY = [];
  var Allcol = makeColor(50000);

  col = [];
  for (let i = 0; i < coordsCenters.length; i++) {
    var ind = getRandomNumberBetween(0, Allcol.length);
    for (let j = 0; j < nbSamples; j++) {
      var angle = Math.random() * Math.PI * 2;

      var newX =
        Math.cos(angle) * (Math.random() * (minRaduis - 0.0) + 0.0).toFixed(4);
      var newY =
        Math.sin(angle) * (Math.random() * (minRaduis - 0.0) + 0.0).toFixed(4);

      pointsX.push(coordsCenters[i][0] + newX);
      pointsY.push(coordsCenters[i][1] + newY);
      col.push(Allcol[ind]);
    }
  }

  var trace1 = {
    x: Standardize(pointsX),
    y: Standardize(pointsY),
    mode: "markers",
    type: "scatter",
    marker: { size: 12 },
    marker: { color: col },
  };

  var data = [trace1];

  var layout = {
    title: "Donnees Non Classifiees",
    showlegend: false,
    height: 500,
    width: 700,
    yaxis: { fixedrange: false },
    xaxis: { fixedrange: false },
  };

  Plotly.newPlot("drawPanel", data, layout);
  golbalX = pointsX;
  golbalY = pointsY;
  golbalK = nbClasses;
}

function makeColor(nb) {
  var s = Math.floor((1 / nb ** (1 / 3)) * 255);

  var color = [];
  for (var r = 0; r < 10000; r += s) {
    var str =
      "rgb(" +
      getRandomNumberBetween(0, 255) +
      ", " +
      getRandomNumberBetween(0, 255) +
      " , " +
      getRandomNumberBetween(0, 255) +
      ")";
    color.push(str);
  }

  return color;
}

var count = 0;

function tr() {
  if (count == 0) {
    document.getElementById("firstFrame").style.display = "block";
    document.getElementById("SecondFrame").style.display = "none";
    document.getElementById("ThirdFrame").style.display = "none";
  }
  if (count == 1) {
    document.getElementById("firstFrame").style.display = "none";
    document.getElementById("SecondFrame").style.display = "block";
    document.getElementById("ThirdFrame").style.display = "none";
  }
  if (count == 2) {
    document.getElementById("firstFrame").style.display = "none";
    document.getElementById("SecondFrame").style.display = "none";
    document.getElementById("ThirdFrame").style.display = "block";
  }
}

function switchFunSuiv() {
  if (count < 2) {
    count = count + 1;
  }
  tr();
}

function switchFunPrec() {
  if (count > 0) {
    count = count - 1;
  }
  tr();
}

function algo() {
  var nbIter = document.querySelector("#iter").value;
  var K = document.querySelector("#k_arg").value;

  var x = golbalX;
  var y = golbalY;
  var k = golbalK;

  x = Standardize(x);
  y = Standardize(y);

  /*
	for (let i = 0 ; i < K ; i++)
	{
		centroids.push([(coordsCenters[i][0]-mean)/std,(coordsCenters[i][1]-mean)/std]);
	}
	*/

  var nbTime = parseInt(document.querySelector("#exec").value);

  if (nbTime == 1) {
    // initialiser le centroids //
    ind = [];
    for (let i = 0; i < x.length; i++) {
      ind.push(i);
    }
    ind = ind.sort(() => 0.5 - Math.random());

    centroids = [];

    for (let i = 0; i < K; i++) {
      centroids.push([x[ind[i]], y[ind[i]]]);
    }
    // deroulement //
    for (let i = 0; i < nbIter; i++) {
      var old_centroids = centroids;
      var distances = compute_distance(x, y, old_centroids);
      labels = argMin_axis_1(distances);
      centroids = compute_centroids(x, y, labels, centroids);

      // check cond //
      if (egale(centroids, old_centroids)) {
        break;
      }
    }

    col = genColorForClustringPoints(labels);
    // draw  //
    var trace1 = {
      x: Standardize(golbalX),
      y: Standardize(golbalY),
      mode: "markers",
      type: "scatter",
      marker: { size: 12 },
      marker: { color: col },
    };
    var trace2 = {
      x: drawCent(centroids, 0),
      y: drawCent(centroids, 1),
      mode: "markers",
      type: "scatter",
      marker: { size: 15 },
    };

    var data = [trace1, trace2];

    var layout = {
      title: "Donnees Non Classifiees",
      showlegend: false,
      height: 500,
      width: 700,
      yaxis: { fixedrange: false },
      xaxis: { fixedrange: false },
    };

    Plotly.newPlot("drawPanel", data, layout);
    clust = tauxDeVarianceDeClustering(labels);
    varclust =
      clust.reduce(
        (s, n) => s + (n - clust.reduce((s, n) => s + n) / clust.length) ** 2,
        0
      ) / clust.length;

    document.querySelector("#SecondFrame > p").innerHTML = "var : " + varclust;
  } else {
    var allVars = [];
    for (let i = 0; i < nbTime; i++) {
      // initialiser le centroids //
      ind = [];
      for (let i = 0; i < x.length; i++) {
        ind.push(i);
      }
      ind = ind.sort(() => 0.5 - Math.random());

      centroids = [];

      for (let i = 0; i < K; i++) {
        centroids.push([x[ind[i]], y[ind[i]]]);
      }
      // deroulement //
      for (let i = 0; i < nbIter; i++) {
        var old_centroids = centroids;
        var distances = compute_distance(x, y, old_centroids);
        labels = argMin_axis_1(distances);
        centroids = compute_centroids(x, y, labels, centroids);

        // check cond //
        if (egale(centroids, old_centroids)) {
          break;
        }
      }
      clust = tauxDeVarianceDeClustering(labels);
      varclust =
        clust.reduce(
          (s, n) => s + (n - clust.reduce((s, n) => s + n) / clust.length) ** 2,
          0
        ) / clust.length;

      allVars.push([varclust, centroids, labels]);
    }
    // get the min var //
    var min = allVars[0][0];
    var minIndexClust = 0;

    for (let i = 0; i < allVars.length; i++) {
      if (allVars[i][0] < min) {
        min = allVars[i][0];
        minIndexClust = i;
      }
    }
    // affecter la valeur avec la moindre taux de variation //
    centroids = allVars[minIndexClust][1];
    labels = allVars[minIndexClust][2];
    col = genColorForClustringPoints(labels);
    // draw  //
    var trace1 = {
      x: Standardize(golbalX),
      y: Standardize(golbalY),
      mode: "markers",
      type: "scatter",
      marker: { size: 12 },
      marker: { color: col },
    };
    var trace2 = {
      x: drawCent(centroids, 0),
      y: drawCent(centroids, 1),
      mode: "markers",
      type: "scatter",
      marker: { size: 15 },
    };

    var data = [trace1, trace2];

    var layout = {
      title: "Donnees Non Classifiees",
      showlegend: false,
      height: 500,
      width: 700,
      yaxis: { fixedrange: false },
      xaxis: { fixedrange: false },
    };

    Plotly.newPlot("drawPanel", data, layout);
    clust = tauxDeVarianceDeClustering(labels);
    varclust =
      clust.reduce(
        (s, n) => s + (n - clust.reduce((s, n) => s + n) / clust.length) ** 2,
        0
      ) / clust.length;

    document.querySelector("#SecondFrame > p").innerHTML = "var : " + varclust;
  }
}
function sleepFor(sleepDuration) {
  var now = new Date().getTime();
  while (new Date().getTime() < now + sleepDuration) {
    /* Do nothing */
  }
}

function egale(a1, a2) {
  for (let i = 0; i < a1.length; i++) {
    for (let j = 0; j < a1.length; j++) {
      if (a1[i][j] != a2[i][j]) {
        return false;
      }
    }
  }
  return true;
}

function compute_centroids(X, Y, lables, centroids) {
  var nwCen = [];
  for (let i = 0; i < centroids.length; i++) {
    var innerSum = [0, 0];
    var cpt = 0;
    for (let j = 0; j < X.length; j++) {
      if (lables[j] == i) {
        innerSum[0] += X[j];
        innerSum[1] += Y[j];
        cpt += 1;
      }
    }
    nwCen.push([innerSum[0] / cpt, innerSum[1] / cpt]);
  }
  return nwCen;
}

function argMin_axis_1(nDarr) {
  var arg = [];
  for (let i = 0; i < nDarr.length; i++) {
    var min = nDarr[i][0];
    var argMin = 0;
    var j;
    for (j = 0; j < nDarr[i].length; j++) {
      if (nDarr[i][j] < min) {
        min = nDarr[i][j];
        argMin = j;
      }
    }
    arg.push(argMin);
  }
  return arg;
}

function compute_distance(dataX, dataY, centroids) {
  tempSave = [];
  for (let i = 0; i < centroids.length; i++) {
    var tempX = dataX,
      tempY = dataY;
    tempX = tempX.map((num) => num - centroids[i][0]);
    tempY = tempY.map((num) => num - centroids[i][1]);

    var row_norm = [];
    for (let j = 0; j < tempX.length; j++) {
      row_norm.push(
        Math.pow(Math.sqrt(tempX[j] * tempX[j] + tempY[j] * tempY[j]), 2)
      );
    }

    tempSave.push(row_norm);
  }

  distances = [];
  for (let i = 0; i < tempSave[0].length; i++) {
    dd = [];
    for (let j = 0; j < tempSave.length; j++) {
      dd.push(tempSave[j][i]);
    }
    distances.push(dd);
  }
  return distances;
}

function standardDeviation(numArray) {
  const mean = numArray.reduce((s, n) => s + n) / numArray.length;
  const variance =
    numArray.reduce((s, n) => s + (n - mean) ** 2, 0) / numArray.length;
  return Math.sqrt(variance);
}

function Standardize(arr) {
  std = standardDeviation(arr);
  mean = arr.reduce((s, n) => s + n) / arr.length;
  var d = [];

  for (let i = 0; i < arr.length; i++) {
    d.push((arr[i] - mean) / std);
  }
  return d;
}

function drawCent(centroids, x) {
  data = [];
  for (let i = 0; i < centroids.length; i++) {
    data.push(centroids[i][x]);
  }
  return data;
}

function genColorForClustringPoints(labels) {
  var Allcol = makeColor(50000);
  Allcol = Allcol.sort(() => 0.5 - Math.random());
  var colors = [];

  for (let i = 0; i < labels.length; i++) {
    colors.push(Allcol[1 + labels[i]]);
  }
  return colors;
}

function tauxDeVarianceDeClustering(labels) {
  var pointCount = [];
  for (let i = 0; i < golbalK; i++) {
    pointCount.push(0);
  }

  for (let i = 0; i < labels.length; i++) {
    pointCount[labels[i]] += 1;
  }
  return pointCount;
}

function interia(lables, centroids, x, y) {
  var s = 0;
  for (let i = 0; i < x.length; i++) {
    var d =
      Math.pow(x[i] - centroids[labels[i]][0], 2) +
      Math.pow(y[i] - centroids[labels[i]][1], 2);
    s = s + d;
  }
  return s;
}

function optimaleKM() {
  document.querySelector("#openWin").click();
  var x = golbalX;
  var y = golbalY;
  var sse = [];

  for (let K = 1; K < 10; K++) {
    var allVars = [];
    for (let i = 0; i < 50; i++) {
      // initialiser le centroids //
      ind = [];
      for (let i = 0; i < x.length; i++) {
        ind.push(i);
      }
      ind = ind.sort(() => 0.5 - Math.random());

      centroids = [];

      for (let i = 0; i < K; i++) {
        centroids.push([x[ind[i]], y[ind[i]]]);
      }
      // deroulement //
      for (let i = 0; i < 300; i++) {
        var old_centroids = centroids;
        var distances = compute_distance(x, y, old_centroids);
        labels = argMin_axis_1(distances);
        centroids = compute_centroids(x, y, labels, centroids);

        // check cond //
        if (egale(centroids, old_centroids)) {
          break;
        }
      }
      clust = tauxDeVarianceDeClustering(labels);
      varclust =
        clust.reduce(
          (s, n) => s + (n - clust.reduce((s, n) => s + n) / clust.length) ** 2,
          0
        ) / clust.length;

      allVars.push([varclust, centroids, labels]);
    }
    // get the min var //
    var min = allVars[0][0];
    var minIndexClust = 0;

    for (let i = 0; i < allVars.length; i++) {
      if (allVars[i][0] < min) {
        min = allVars[i][0];
        minIndexClust = i;
      }
    }
    // affecter la valeur avec la moindre taux de variation //
    centroids = allVars[minIndexClust][1];
    labels = allVars[minIndexClust][2];

    sse.push(interia(labels, centroids, x, y));

    Kinc = [];
    for (let i = 1; i < 10; i++) {
      Kinc.push(i);
    }
  }

  var trace1 = {
    x: Kinc,
    y: sse,
    type: "scatter",
  };

  var data = [trace1];

  var layout = {
    grid: { rows: 1, columns: 1, pattern: "independent" },
    height: 400,
    width: 480,
  };

  Plotly.newPlot("drawPanel2", data, layout);

  var a = sse[0] - sse[8];
  var b = Kinc[8] - Kinc[0];
  var c1 = Kinc[0] * sse[8];
  var c2 = Kinc[8] * sse[0];
  var c = c1 - c2;

  var distances = [];
  for (let k = 0; k < 9; k++) {
    distances.push(point_distance(Kinc[k], sse[k], a, b, c));
  }

  const max = Math.max(...distances);
  const index = distances.indexOf(max) + 1;
  document.querySelector("#popup_flight_travlDil1 > div > h2").innerHTML =
    "Le K optimale est : " + index;
}

function point_distance(x1, y1, a, b, c) {
  d = Math.abs(a * x1 + b * y1 + c) / Math.sqrt(a * a + b * b);
  return d;
}
