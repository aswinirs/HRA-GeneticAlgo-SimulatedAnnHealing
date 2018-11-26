INSTRUCTIONS for EXECUTION:
  
  1. Please Copy the Source code zip file and extract it to the Desktop.
  2. Launch Command Prompt and execute below command, 
	 python -m SimpleHTTPServer
  3. "Serving HTTP on 0.0.0.0 port 8000 ... ", will be displayed. We need a server running to enable some features like read data file operation.
  4. To run Genetic Algorithm (GA) based HRA - Copy paste following url in browser, http://localhost:8000/Desktop/ECProject/GA_HRA/index.html
  5. To run Simulated Annealing (SA) based HRA - Copy paste following url in browser, http://localhost:8000/Desktop/ECProject/SA_HRA/index.html
  5. All set and ready for execution, please click on "start" button to start execution with default settings. 
  6. However, Configuration settings can be modified. Please refresh the page before changing the configuration and then press "start" button.. 
   
********Sometime clearing cache will help if there is any suspecion that behaviour appears same as previous configuration (which is not very often but may be because of browser 	    settings)*********** 
 
NOTES:

For both GA and SA we have set up configuration that provided better result most of the time as default. Following are default configurations.

For GA, popSize-200, mutation - 0.5, crossover - 0.5, Generations - 600
For SA, temperature- 3200, alpha 0.99999, epsilon - 0.001 to facilitate over 300,000 iterations.

*************************************************************************************************************************************************************************************