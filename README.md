# QueueBot
RS3 Queue Bot - used to process requests

This discord bot is used to process queue requests such as leech/trial requests and provides assistance.

Credit to Jia for writing the base for this thing, and I guess credits to me for memeing because I'm lazy af.  
More credits to be added for my bot Jia as neccessary.

## TO USE:
- Navigate to your folder and type in "npm install" on your terminal.  This installs all the required packages.
- Modify src/wrapper.js, the top 3 variables, tokens
- When done, just simply call 'node wrapper.js' (There are additional parameters that you can add at the end such as -debug)

## HOW TO DEBUG (using Visual Studio Code)
- Under the Debug tab, click on 'Add Configurations'.  You should see a .vscode folder containing a launch.json file.
- Add a configuration using 'Node.js - launch program'.
- Add another property named 'args', which should create an array.  Inside should contain the string "-debug".
- Run the debugger! 
