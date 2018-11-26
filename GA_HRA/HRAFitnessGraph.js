//Pass respective arrays with gen numbers as x axis to plot the graph

function refCandFitnessGraph() {

var durLastCandInThisGen = {
  x: genArray,
  y: projDurArr,
  name: "Last Candidate Project Duration",
  mode: 'lines+markers',
  type: 'scatter'
};

var costLastCandInThisGen = {
  x: genArray,
  y: projCostArr,
  name: "Last Candidate Project Cost",
  mode: 'lines+markers',
  type: 'scatter'
};

var devAllocLastCandInThisGen = {
  x: genArray,
  y: projDevAllocArr,
  name: "Last Candidate Developer Allocation",
  mode: 'lines+markers',
  type: 'scatter'
};

var totFitnessLastCandInThisGen = {
  x: genArray,
  y: projFitnessArr,
  name: "Last Candidate Total Fitness",
  mode: 'lines+markers',
  type: 'scatter'
};

var data = [durLastCandInThisGen, costLastCandInThisGen, devAllocLastCandInThisGen, totFitnessLastCandInThisGen];


Plotly.newPlot('chartcontainer1', data);

}

function bestFitnessGraph() {
  var bestEverInThisGen = {
  x: genArray,
  y: bestFitnessArr,
  name: "Over all Max Fitness",
  mode: 'lines+markers',
  type: 'scatter'
};


var totFitnessLastCandInThisGen = {
  x: genArray,
  y: projFitnessArr,
  name: "Last Candidate Total Fitness",
  mode: 'lines+markers',
  type: 'scatter'
};

var data = [bestEverInThisGen, totFitnessLastCandInThisGen];


Plotly.newPlot('chartcontainer2', data);

}

