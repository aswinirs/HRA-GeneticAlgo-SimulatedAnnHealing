//Pass respective arrays with gen numbers as x axis to plot the graph

function refCandFitnessGraph() {

var durLastCandInThisGen = {
  x: genArray,
  y: projDurArr,
  name: "Project Duration Savings",
  mode: 'lines+markers',
  type: 'scatter'
};

var costLastCandInThisGen = {
  x: genArray,
  y: projCostArr,
  name: "Project Cost Savings",
  mode: 'lines+markers',
  type: 'scatter'
};

var devAllocLastCandInThisGen = {
  x: genArray,
  y: projDevAllocArr,
  name: "Developer Allocation(ideal case, should be 11)",
  mode: 'lines+markers',
  type: 'scatter'
};

var totFitnessLastCandInThisGen = {
  x: genArray,
  y: projFitnessArr,
  name: "Total Fitness",
  mode: 'lines+markers',
  type: 'scatter'
};

var data = [durLastCandInThisGen, costLastCandInThisGen, devAllocLastCandInThisGen, totFitnessLastCandInThisGen];

Plotly.newPlot('chartcontainer1', data);

}

