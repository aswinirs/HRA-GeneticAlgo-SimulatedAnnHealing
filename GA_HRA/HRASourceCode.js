/*preload() is a key method that gets invoked once before actual
beginning of program, so we load our data file beforehand in this method*/
function preload() {
  loadTrainingSample();
}

var started, d = new Date(), ga_strtTime, ga_endTime, firstSoln = true;
var minutes = 1000 * 60;

function start_fn() {
  started = true;
  var t= d.getTime();
  ga_strtTime = Math.round(t / minutes);
  setup();
}

function stop_fn() {
  started = false;
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

function generatePopulation() {
  var chromosome = [];
  for (var i=0;i<m_taskID.length;i++) {
  //Generate random number of developers for each task, but sure atleast 1 developer is assigned.
  var howManyDevs = floor(random(1, m_devID.length)), taskDevelopers = [];
    while(howManyDevs != 0) {
      var randomDeveloper = floor(random(m_devID.length));
      if(!taskDevelopers.includes(randomDeveloper)) {
      taskDevelopers.push(randomDeveloper);
      }
      howManyDevs--;
    }
    chromosome.push(i, taskDevelopers);
  }
  return chromosome;
}

function modestProjectBudget() {
  var m_projectduration = 0;
  for(var i=0;i<m_taskID.length;i++) {
    m_projectduration = parseInt(m_taskEffort[i]) + m_projectduration;
  }
  return m_projectduration*35;
}

var bE_Chromosome, bE_fitness = 0, chromoFitnessArr =[], chromoFitness = [];
var bestDurArr=[], bestDurValidArr=[], bestCostArr=[], bestCostValidArr=[],
    bestDevAllocArr=[], bestDevAllocValidArr=[], bestFitnessArr = [];
function calcPopFitnessEval() {
  chromoFitnessArr = [], chromoFitness = [];
  for(var i=0;i<popSize;i++) {
    /* chromoFitness is array of array containing cost, isCostValid, duration,isDurationValid
    developer allocation, isAllocValid and total fitness values for each member of population*/
   chromoFitness = fitnessCalc(i,population[i]);
   var temp;
   if(chromoFitness[6] == 0) {
    temp = i+1;
   } else {
      temp = chromoFitness[6];
   }
   chromoFitnessArr.push(chromoFitness[6]);
   if((chromoFitness[1] && chromoFitness[3] && chromoFitness[5] == true) && chromoFitness[6]>bE_fitness) {
       if(firstSoln) {
          var t= d.getTime();
          ga_endTime = Math.round(t / minutes);
          document.getElementById("timeTaken").innerHTML = ga_strtTime-ga_endTime;
        }
        firstSoln = false;
   console.log("Best Fit Chromosome at Gen" + generation);
   console.log(population[i]);
   console.log("*******************");
   bE_fitness = chromoFitness[6];
   document.getElementById("bEGeneration").innerHTML = generation;
   document.getElementById("bECandidate").innerHTML = i+1;
   document.getElementById("bEProjectDuration").innerHTML = chromoFitness[0];
   document.getElementById("bEEffortvalid").innerHTML = chromoFitness[1];
   document.getElementById("bEprojectCost").innerHTML = chromoFitness[2];
   document.getElementById("bECostvalid").innerHTML = chromoFitness[3];
   document.getElementById("bEDevAllocation").innerHTML = chromoFitness[4];
   document.getElementById("bEDevAllocValid").innerHTML = chromoFitness[5];
   document.getElementById("bEfitness").innerHTML = chromoFitness[6];
   }
  }
   bestFitnessArr.push(max(chromoFitnessArr));
}

var projDurArr=[], projDurValidArr=[], projCostArr=[], projCostValidArr=[],
        projDevAllocArr=[], projDevAllocValidArr=[], projFitnessArr = [];
function fitnessCalc(i, chromosome) {
  var candidateId = i;
  document.getElementById("Candidate").innerHTML = candidateId+1;
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

   document.getElementById("Generation").innerHTML = generation;
   document.getElementById("fitnessProjectDuration").innerHTML = fitnessProjectDuration;
   document.getElementById("taskEffortvalid").innerHTML = taskEffortvalid;
   document.getElementById("fitnessprojectCost").innerHTML = fitnessprojectCost;
   document.getElementById("taskCostvalid").innerHTML = taskCostValid;
   document.getElementById("fitnessDevAllocation").innerHTML = fitnessDevAllocation;
   document.getElementById("taskDevAllocValid").innerHTML = taskDevAllocValid;


   if(candidateId == popSize-1) {
    genArray.push(generation);projDurArr.push(fitnessProjectDuration);projDurValidArr.push(taskEffortvalid);
    projCostArr.push(fitnessprojectCost);projCostValidArr.push(taskCostValid);projDevAllocArr.push(fitnessDevAllocation);
    projDevAllocValidArr.push(taskDevAllocValid);
  }

    // last step in fitness evaluation

  if(taskEffortvalid && taskCostValid && taskDevAllocValid) { //best candidate constraint
    var fitness = fitnessProjectDuration + fitnessprojectCost + fitnessDevAllocation;
    document.getElementById("fitness").innerHTML = fitness;
    if(candidateId == popSize-1) {
    projFitnessArr.push(fitness);
    }
    var fitness_arr = [];fitness_arr.push(fitnessProjectDuration);fitness_arr.push(taskEffortvalid);fitness_arr.push(fitnessprojectCost);
    fitness_arr.push(taskCostValid);fitness_arr.push(fitnessDevAllocation);fitness_arr.push(taskDevAllocValid);fitness_arr.push(fitness);
    // return fitness only for valid chromosomes, others 0.
    return fitness_arr;
  } else {
      var fitness =0;
      document.getElementById("fitness").innerHTML = fitness;
      if(candidateId == popSize-1) {
        projFitnessArr.push(fitness);
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
  }
  else {
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
  }else if(tasktype == "Implementation") {
    taskID_temp = 2;
  }else if(tasktype == "Test") {
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

var actualProjectBudget, population = [], generation =0, popSize, mutationRate, crossOverRate, maxGen;

/*setup() is a key method that gets invoked only once at the
beginning of program, so we initialise our population in this method*/
function setup () {
  if(started) {
  maxGen = document.getElementById("maxGenIn").value;
  popSize = document.getElementById("popSizeIn").value;
  mutationRate = document.getElementById("pMutateIn").value;
  crossOverRate = document.getElementById("pCrossOverIn").value;

    for (var i = 0; i < popSize; i++) {
      var solutionset = generatePopulation();
      population.push(solutionset);
    }
    actualProjectBudget = modestProjectBudget();
  }
}
var genArray = [];
/*Runs at rate of 60 frames per second.*/
function draw() {
  if(started) {
     if (generation < maxGen) {
      generation = generation + 1;
      calcPopFitnessEval();
      nextGeneration();
      //print graph for every generation
      if(generation%5 ==0) {
      refCandFitnessGraph();
      bestFitnessGraph();
    }
    }
  }
}

//Steady state next generation logic, least fit(2) memembers of previous gen tournament will be replaced
function nextGeneration() {
  var nextGen = [];
  for(var i=0;i<popSize;i++) {
    var child = [];
    if(random(1) <= crossOverRate) {
      var parent1 = floor(random(popSize));
      var parent2 = floor(random(popSize));
      child = crossOver(population[parent1], population[parent2]);
    } else /*if(random(1) < mutationRate)*/ {
      var one_parent = floor(random(popSize));
      child = mutation(population[one_parent]);
    }

    if (child.length == 0) {
      child = population[i];
    }
  /*(mu, lambda Elitism based fitness selection),
    if previous gen chromosome fitness is 0, then replace with new child)
    else retain the parent in the pool (elitism) */
    if(chromoFitnessArr[i] == 0) {
      nextGen[i] = child;
      } else {
        nextGen[i] = population[i];
    }
}
  population = nextGen;
}


function crossOver(chrom1, chrom2) {
  var child = [];
  //Applying uniform crossOver
  for(var i=0;i<chrom1.length;i=i+2) {
    if(random(1) > 0.5) {
      child.push(chrom1[i]);child.push(chrom1[i+1]);
    } else {
      child.push(chrom2[i]);child.push(chrom2[i+1]);
    }
  }

  return child;
}

function mutation(chrom) {
  var mut_child = [];
  var mutPoint = floor(random(chrom.length));
  // if(mutPoint%2 !=0) {
  //   mutPoint = mutPoint+1;
  // }

  //Applying Random Mutation
    for(var i=0;i<chrom.length;i=i+2) {
    //atleast one developer must be assigned to the task
      var howmanyDevs = floor(random(1, m_devID.length));  var devloperSet = [];
      while (howmanyDevs != 0) {
        var randomDeveloper = floor(random(m_devID.length));
        if(!devloperSet.includes(randomDeveloper)) {
          //From a set of random developers
        devloperSet.push(randomDeveloper);
        }
        howmanyDevs--;
      }

    // if(mutPoint == i && devloperSet.length != 0) {
       mut_child.push(chrom[i]);mut_child.push(devloperSet);

    // } else {
    //   mut_child.push(chrom[i]);mut_child.push(chrom[i+1]);

    // }
    }
  return mut_child;
}