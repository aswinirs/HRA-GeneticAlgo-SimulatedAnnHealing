    //primary configuration of solution
    var current=[];
    //the next configuration of solution
    var next=[];
    var iteration =-1;
    //the probability
    var proba;
    var alpha;
    var temperature=0;
    var epsilon =0;
    var delta=0;
    var current_totFitness, next_totFitness;
    var started;
    var bestEverFitness =0, firstSoln = true;
    var d = new Date();
    var sa_strtTime, sa_endTime, minutes = 1000 * 60;;

function start_fn() {
  started = true;
  var t= d.getTime();
  sa_strtTime = Math.round(t / minutes);
  setup();
}

function stop_fn() {
  started = false;
}
/*preload() is a key method that gets invoked once before actual
beginning of program, so we load our data file beforehand in this method*/
function preload() {
  loadTrainingSample();
}

function loadTrainingSample() {
  loadStrings("DeveloperDetail.txt", devDetail);
  fileUploadMsg = "Developer Detail Uploaded !!";
  loadStrings("TaskDetail.txt", taskDetail);
}

var m_devID = [], m_devSkillRange = [], m_devSkillSetAll=[];

function devDetail(data) {

  for(var i=0;i<data.length;i++) {
    var line = data[i];
    var stringSplit = splitTokens(line);
    m_devID[i] = i;
    m_devSkillRange[i] = stringSplit[0];
    var m_devSkillSet =[];
    m_devSkillSet.push(stringSplit[1]);m_devSkillSet.push(stringSplit[2]);
    m_devSkillSet.push(stringSplit[3]);m_devSkillSet.push(stringSplit[4]);
    m_devSkillSetAll[i]=m_devSkillSet;
  }
}

var m_taskID = [], m_taskType = [], m_taskEffort = [], m_taskDependency = [];
var m_taskStartTime =[], m_taskEndTime=[];

function taskDetail(data) {
  for(var i=0;i<data.length;i++) {
    var line = data[i];
    var stringSplit = splitTokens(line, ", ");
    m_taskID[i] = i;
    m_taskType[i] = stringSplit[0];
    m_taskEffort[i]= stringSplit[1];
    m_taskStartTime[i] = stringSplit[2];
    m_taskEndTime[i] = stringSplit[3];
    var tempTaskDep =[];
    for (var j=4;j<stringSplit.length;j++) {
    tempTaskDep.push(stringSplit[j]);
    }
    m_taskDependency[i] = tempTaskDep;
  }
}

function generateSolution() {
  var solution = [];
  for (var i=0;i<m_taskID.length;i++) {
  /*Generate random number of developers for each task,
  but sure atleast 1 developer is assigned. */
  var howManyDevs = floor(random(1, m_devID.length)), taskDevelopers = [];
    while(howManyDevs != 0) {
      var randomDeveloper = floor(random(m_devID.length));
      if(!taskDevelopers.includes(randomDeveloper)) {
      taskDevelopers.push(randomDeveloper);
      }
      howManyDevs--;
    }
    solution.push(i, taskDevelopers);
  }
  return solution;
}

function modestProjectBudget() {
  var m_projectduration = 0;
  for(var i=0;i<m_taskID.length;i++) {
    m_projectduration = parseInt(m_taskEffort[i]) + m_projectduration;
  }
  return m_projectduration*35;
}

function setup() {
    temperature = document.getElementById("maxGenIn").value;
    alpha = document.getElementById("popSizeIn").value;
    epsilon = document.getElementById("pCrossOverIn").value;
 if(started) {
    current=generateSolution();
    current_totFitness = computeChromFitness(0, current);
    temperature = parseFloat(temperature)*parseFloat(alpha);
 }
}

var genArray = [];
/*Runs at rate of 60 frames per second.*/
function draw() {
 if(started) {
//if the temperature did not reach epsilon
   if(parseFloat(temperature) > parseFloat(epsilon)) {
      simulatedAnnhealing();
      if(iteration%10 ==0) {
        refCandFitnessGraph();
      }
    }
  }
}

function simulatedAnnhealing() {
        iteration++;
        //get the next random set of solution
        next = generateSolution();
        //compute the fitness of the new solution generated
        next_totFitness = computeChromFitness(iteration, next);

        delta = next_totFitness[6]-current_totFitness[6];
        if(delta == 0) {
            delta = 1;
        }
        //if the new solution is better accept it and assign it
        if(parseInt(delta)>1) {
            current = next;
            current_totFitness = next_totFitness;
            bestEverFitness = next_totFitness[6];
        } else {
            proba = random(0,1);
            //if the new fitness is worse accept
            //it but with a probability level
            //if the probability is less than
            //E to the power -delta/temperature.
            //otherwise the old value is kept
            if(proba< Math.exp(-delta/temperature)) {
                current = next;
                current_totFitness = next_totFitness;
            }
        }
        //cooling process on every iteration
         temperature = parseFloat(temperature) * parseFloat(alpha);
        //print every 400 iterations
        if (iteration%400==0) {
            console.log("*****");
            console.log("Solution and fitness at " + iteration);
            console.log(next, next_totFitness);
        }
 }

var projDurArr=[], projDurValidArr=[], projCostArr=[], projCostValidArr=[],
        projDevAllocArr=[], projDevAllocValidArr=[], projFitnessArr = [];

function computeChromFitness(iteration,chromosome) {
  var candidateId = iteration+1;
  document.getElementById("Candidate").innerHTML = candidateId;
  var fitness = 0, fitnessProjectDuration = 0, fitnessprojectCost = 0, fitnessDevAllocation = 0;
  var taskEffortvalid =true, taskCostvalid =false, sumOfEstimatedTaskCost = 0, sumOfActualTaskCost=0;
  var taskDevAllocValid = true;
  for(var i=0;i<chromosome.length;i=i+2) {
    var taskId = chromosome[i];
    var devAssigned = chromosome[i+1];
    var getActualDurationCost = taskDurationCostCalc(taskId, devAssigned);
    var estimatedTaskEffort = parseInt(m_taskEffort[taskId]);
    var actualTaskEffort = getActualDurationCost[0];

    if(parseInt(estimatedTaskEffort - actualTaskEffort) >= 0 && taskEffortvalid) {
      fitnessProjectDuration = fitnessProjectDuration + parseInt([estimatedTaskEffort - actualTaskEffort]);
    } else {
      fitnessProjectDuration = fitnessProjectDuration + parseInt([estimatedTaskEffort - actualTaskEffort]);
      taskEffortvalid = false;
    }
    sumOfActualTaskCost = sumOfActualTaskCost + getActualDurationCost[1];
    //validate each task and developers assigned with previous tasks
    var alloc_fitness = taskDevAllocationFitness(chromosome, taskId, devAssigned);
    //fitnessDevAllocation, possible max value is total number of tasks
    fitnessDevAllocation = fitnessDevAllocation + alloc_fitness;
    }

  fitnessprojectCost = modestProjectBudget() - sumOfActualTaskCost;
  if(fitnessprojectCost >= 0) {
      taskCostValid = true;
  } else {
      taskCostValid = false;
  }
  if(fitnessDevAllocation < (m_taskID.length)) {
    taskDevAllocValid = false;
  }
   document.getElementById("Generation").innerHTML = temperature;
   document.getElementById("fitnessProjectDuration").innerHTML = fitnessProjectDuration;
   document.getElementById("taskEffortvalid").innerHTML = taskEffortvalid;
   document.getElementById("fitnessprojectCost").innerHTML = fitnessprojectCost;
   document.getElementById("taskCostvalid").innerHTML = taskCostValid;
   document.getElementById("fitnessDevAllocation").innerHTML = fitnessDevAllocation;
   document.getElementById("taskDevAllocValid").innerHTML = taskDevAllocValid;
    // last step in fitness evaluation

  if(taskEffortvalid && taskCostValid && taskDevAllocValid) { //best candidate constraint
    var fitness = fitnessProjectDuration + fitnessprojectCost + fitnessDevAllocation;

    document.getElementById("fitness").innerHTML = fitness;
    if(firstSoln) {
      var t= d.getTime();
      sa_endTime = Math.round(t / minutes);
      document.getElementById("timeTaken").innerHTML = sa_strtTime-sa_endTime;
    }
    firstSoln = false;
    document.getElementById("bEGeneration").innerHTML = temperature;
    document.getElementById("bECandidate").innerHTML = iteration;
    document.getElementById("bEProjectDuration").innerHTML = fitnessProjectDuration;
    document.getElementById("bEEffortvalid").innerHTML = taskEffortvalid;
    document.getElementById("bEprojectCost").innerHTML = fitnessprojectCost;
    document.getElementById("bECostvalid").innerHTML = taskCostValid;
    document.getElementById("bEDevAllocation").innerHTML = fitnessDevAllocation;
    document.getElementById("bEDevAllocValid").innerHTML = taskDevAllocValid;
    document.getElementById("bEfitness").innerHTML = fitness;

    genArray.push(candidateId);projDurArr.push(fitnessProjectDuration);projDurValidArr.push(taskEffortvalid);
    projCostArr.push(fitnessprojectCost);projCostValidArr.push(taskCostValid);projDevAllocArr.push(fitnessDevAllocation);
    projDevAllocValidArr.push(taskDevAllocValid);projFitnessArr.push(fitness);

    var fitness_arr = [];fitness_arr.push(fitnessProjectDuration);fitness_arr.push(taskEffortvalid);fitness_arr.push(fitnessprojectCost);
    fitness_arr.push(taskCostValid);fitness_arr.push(fitnessDevAllocation);fitness_arr.push(taskDevAllocValid);fitness_arr.push(fitness);
    // return fitness only for valid chromosomes, others 0.
    return fitness_arr;
  } else {
    //assigning zero fitness for invalid chromosome
      var fitness =0;
      document.getElementById("fitness").innerHTML = fitness;
    if (iteration%400==0) {
      genArray.push(candidateId);projDurArr.push(fitnessProjectDuration);projDurValidArr.push(taskEffortvalid);
      projCostArr.push(fitnessprojectCost);projCostValidArr.push(taskCostValid);projDevAllocArr.push(fitnessDevAllocation);
      projDevAllocValidArr.push(taskDevAllocValid);projFitnessArr.push(fitness);
    }
      var fitness_arr = [];fitness_arr.push(fitnessProjectDuration);fitness_arr.push(taskEffortvalid);fitness_arr.push(fitnessprojectCost);
      fitness_arr.push(taskCostValid);fitness_arr.push(fitnessDevAllocation);fitness_arr.push(taskDevAllocValid);fitness_arr.push(fitness);
      return fitness_arr;
    }
}

function taskDevAllocationFitness (chromosome, taskId, devAssigned) {
  var taskalloccationfitness = 1, t=-1;
  if(taskId == 0) {
    /*No check for very first task as all developers are available, by default
    first task will always get allocationFitness as 1*/
    //No checks
  } else {
      for(var i=0;i<taskId;i=i+1) {
        t=t+2;
        if (parseInt(m_taskStartTime[i])==parseInt(m_taskStartTime[taskId])) {
         //if both previous and current task are starting at same time
          for(var j=0;j<devAssigned.length;j++) {
            if(chromosome[t].includes(devAssigned[j])) {
              taskalloccationfitness = 0;
              return taskalloccationfitness;
            }
          }
      } else if((parseInt(m_taskStartTime[i])<parseInt(m_taskStartTime[taskId]))
                 && (parseInt(m_taskStartTime[taskId])<parseInt(m_taskEndTime[i]))) {
         //if current task begins in between previous task beginning and ending
          for(var j=0;j<devAssigned.length;j++) {
            if(chromosome[t].includes(devAssigned[j])) {
              taskalloccationfitness = 0;
              return taskalloccationfitness;
            }
          }
      }
      else if(parseInt(m_taskStartTime[taskId])<parseInt(m_taskStartTime[i])
               && parseInt(m_taskStartTime[i])<parseInt(m_taskEndTime[taskId])) {
         //if previous task begins in between current task beginning and ending
          for(var j=0;j<devAssigned.length;j++) {
            if(chromosome[t].includes(devAssigned[j])) {
              taskalloccationfitness = 0;
              return taskalloccationfitness;
            }
          }
      }
    }

  }
  return taskalloccationfitness;
}

function taskDurationCostCalc (taskId, devAssigned) {
  var tasktype = m_taskType[taskId], taskID_temp, workInOneUnitTime = 0, costInOneUnitTime=0;
  //console.log(tasktype, taskId, devAssigned);
  if(tasktype == "Analysis") {
    taskID_temp = 0;
  } else if(tasktype == "Design") {
    taskID_temp = 1;
  } else if(tasktype == "Implementation") {
    taskID_temp = 2;
  } else if(tasktype == "Test") {
    taskID_temp = 3;
  }

  for(var i =0;i<devAssigned.length;i++) {
    var eachDeveloperWorkPerUnitTime = parseFloat(m_devSkillSetAll[devAssigned[i]][taskID_temp]);
    workInOneUnitTime = workInOneUnitTime + eachDeveloperWorkPerUnitTime;
    var eachDeveloperCostPerUnitTime = parseFloat(m_devSkillRange[devAssigned[i]])*15;
    costInOneUnitTime = costInOneUnitTime + eachDeveloperCostPerUnitTime;
  }
  var actualTaskEffort = m_taskEffort[taskId] / workInOneUnitTime;
  var actualTaskCost = actualTaskEffort * costInOneUnitTime;
  var taskDurationCost = [];
  taskDurationCost.push(actualTaskEffort);taskDurationCost.push(actualTaskCost);
  return taskDurationCost;
}
