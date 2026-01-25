var language_exposure_instructions = {
 type: jsPsychHtmlButtonResponse,
 stimulus: `
 <p style="font-size:20px;"> <b>Welcome to the experiment!</b><br><br></p>
 <p style="font-size:18px;"> In this study, we would like to understand how you engage with language in your daily life and how that affects your cognitive functioning. <br><br>
  First, you will answer two questions about your language exposure. <br> 
  Language exposure refers to time spent reading or listening to language-based content (not just scrolling or viewing images). <br>
  For both questions, please estimate your typical use in an average week. 
  </p>
 `,
 choices: ["Continue"],
  data: {
       typeoftrial: 'language_exposure_instructions',
   }
};  

var interestssurveyinstructions = {
 type: jsPsychHtmlButtonResponse,
 stimulus: `
 <p style="font-size:20px;"> Great! You will now move on to the next phase of the study. <br><br></p>
 <p style="font-size:18px;"> In this part, we would like to get a sense of what content you typically consume on the <b>Reddit</b> platform. <br>
  On the next page, we ask that you input the names of the <b>Subreddits</b> you typically engage with in any capacity. <br>
  (i.e. writing posts, reading posts, upvoting, commenting, sharing, etc.) <br>
  Next, we ask that you input your general interests when you are consuming online content, independent of specific Subreddits. <br>
  To input a response, type it within the provided box and <strong>press ENTER</strong> after every response. <br><br>
  Note that there will be a three minute time limit for this part. However, if you feel you are done before time runs out, you can<br>
  click the <strong>I'm done</strong> button. This data is crucial to the experiment, so please be as accurate possible when typing your responses.<br><br>
  After you complete these tasks, you will be provided further instructions and continue to the actual experiment.<br>
  When you are ready to start, <strong>press Continue.</strong>
 </p>
 `,
 choices: ["Continue"],
     data: {
       typeoftrial: 'interestssurveyinstructions',
       
   }
};   

//formats opening instruction page and tells participant about experiment
var maininstructions = {
  type: jsPsychHtmlButtonResponse,
  stimulus: `
  <p style="font-size:20px;"> You will now proceed with the actual experiment.<br><br></p>
  <p style="font-size:18px;"> <strong>This experiment has two tasks:</strong><br><br>
   1) A <u>verbal fluency task</u>, where you will type in as many items as you can think of that correspond to a given category within a minute.<br><br>
   2) A <u>spatial arrangement task</u>, where you will move around the items you typed in the first task so that similar items are closer together.<br><br>
   The experiment will consist of only 5 categories, so please be as accurate/precise as possible <br>
   when typing in items and placing the objects, rather than trying to speed through.
  </p>
  `,
  choices: ["Continue"],
  on_load: function() {
    clearInterval(timerInterval);
    resetCountdown();
    jsPsych.pluginAPI.clearAllTimeouts();

  },
      data: {
        typeoftrial: 'maininstructions',
        
    }
};    

//instructs participants on VFT task with video example
var VFTInstructions = {
  type: jsPsychHtmlButtonResponse,
  stimulus: `
  <p style="font-size:20px;"><strong>You will begin with a verbal fluency task.</strong></p>
  <p style="font-size:18px;"> In this task, you will be presented the name of a category (e.g., FURNITURE) in capital letters. <br>
  Your job is to type in as many items as you can think of that correspond to that category in <b>one minute</b>.<br>
  You will be presented with 5 such categories.<br><br>
  After you type in each word, press <strong>ENTER</strong> to type in the next word. <br>
  When the timer runs out, you will automatically proceed to the next task. Press Continue for the next set of instructions.<br>
  </p>  

  `,
  choices: ["Continue"],
  on_load: function() {
    clearInterval(timerInterval);
    resetCountdown();
    jsPsych.pluginAPI.clearAllTimeouts();

  },
      data: {
        typeoftrial: 'VFTinstructions',
        
    }
};    

//instructs participants on SpAM task with video example
var SpAMInstructions = {
  type: jsPsychHtmlButtonResponse,
  stimulus: `
  <p style="font-size:20px;"> <strong>After each verbal fluency task, you will perform a spatial arrangement task.</strong></p>
  <p style="font-size:18px;"> In this task, you will be shown the set of words you typed in the last verbal fluency task you performed.<br>
  We want to know how similar you think these words are to one another. <br>
  Your job is to move each word around so that the similar words are proportionately closer together. <br>
  That is, you should move them into space such that the distance between each pair of items represents how similar you think the pair is.<br>
  (with closer in space meaning more similar, and farther away in space meaning more dissimilar)<br>
  As shown in the video below, the words will appear one by one in the top left corner of a box. You can move the words by simply dragging them. <br>
  If the words seem similar, place them close together. If they seem dissimilar, place them farther away from each other. <br>

 <div style="text-align: center; margin-top: 10px;">
  <video width="600" height="400" autoplay muted loop>
    <source src="SpAMTutorial.mp4" type="video/mp4">
  </video>
</div>


  After dragging each word, the next word will appear. You may rearrange previously placed items as needed.<br><br>
  Note, to complete the trial, <u>all words</u> must be moved. <br>
  When you are finished arranging the space, click on the little Continue button at the bottom of the screen.<br><br>
  You will be doing this for five separate categories, based on the words you type in the corresponding verbal fluency task.<br><br>
  Press Continue to proceed to the first verbal fluency task and begin the experiment.
</p>
  `,
  choices: ["Continue"],
      data: {
        typeoftrial: 'spaminstructions',
    }
};    

//instructs participant after they complete the practice round
var startInstructions = {
  type: jsPsychHtmlButtonResponse,
  stimulus: `
  <p style="font-size:18px;"> <br><br><br>Now, you will begin the task, consisting of five rounds with different categories.<br><br>
  Again, your first task is to first type in as many items as you can within the given category in one minute. <br> 
  Then, you will spatially arrange the words you typed in the box provided based on how related they are.<br><br>
  <b>Before each round</b>, you will also be asked about how interesting you find the category <br>
  and the number of items you believe you could produce for that category.<br><br>

  When you're ready, <strong>press Begin</strong> to start the verbal fluency task.

  </p>
  `,
  choices: ["Begin"],
      data: {
        typeoftrial: 'start_instructions',
        
    }
};    

//provides reminder of instructions between VFT task and SpAM
var betweenVFTAndSpAMInstructions = {
  type: jsPsychHtmlButtonResponse,
  stimulus: `
  <p style="font-size:20px;"> <strong>You are moving on to the spatial arrangement task.</strong></p>
  <p style="font-size:18px;"> As a reminder, in this task, you will be shown the set of words you just produced in the fluency task.<br>
  We want to know how similar you think these words are to one another.<br>
  To indicate your perception of similarity, you will move each word around so that the similar ones are proportionately closer together.<br>
  If the words seem similar, place them close together, if they seem dissimilar, place them farther away from each other.<br><br>
  Press <strong>Begin</strong> to start.
  </p>

  `,
  choices: ["Begin"],
      data: {
        typeoftrial: 'instructions',
        
    }
};    

//provides reminder of instructions for next VFT category
var afterSpAMInstructions = {
  type: jsPsychHtmlButtonResponse,
  stimulus: `
    <p style="font-size:20px;"><strong>You will now move to the next category.</strong></p>
    <p style="font-size:18px;">As a reminder, you will:</p>
    <ol style="font-size:18px; padding-left: 20px; text-align: left;">
      <li>Indicate your interest in the category.</li>
      <li>Estimate how many items you think you could produce in that category within a minute.</li>
      <li>Complete the verbal fluency task, i.e., type in as many items as you can think of that correspond to the category in one minute.</li>
      <li>Complete the spatial arrangement task, i.e., spatially arrange the words you typed in based on how related they are to one another.</li>
    </ol>
    <p style="font-size:18px;">Press <strong>Begin</strong> to start.</p>
  `,
  choices: ["Begin"],
  data: { typeoftrial: 'instructions' }
};

