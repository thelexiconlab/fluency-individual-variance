
//tracks responses and reaction time, adding each to a seperate array
function createResponseHandler(state, container) {
  return function (event) {
    if (event.key !== "Enter") return;
    event.preventDefault();

    const input = container.querySelector("input.vft-input.active");
    if (!input) return;

    const value = input.value.trim();
    if (!value) return;

    const t = +(performance.now() - state.start).toFixed(2);
    state.responses.push(value);
    state.times.push(t);

    input.disabled = true;
    input.classList.remove("active");

    const newInput = document.createElement("input");
    newInput.type = "text";
    newInput.className = "vft-input active";
    container.appendChild(newInput);
    newInput.focus();
  };
}



function buildVFTTask(domain, prompt, time = 10000, allowEarlyEnd = false) {

  return {
    type: jsPsychHtmlKeyboardResponse,
    data: { task: "VFT", domain },

    stimulus: `
      <div id="timer-box"></div>
      <div id="response-input-box">
        <p style="font-size:30px;">${prompt}</p>
        <div id="responses">
          <input type="text" class="vft-input active" autofocus />
        </div>
        <p style="font-size:14px; color:gray;">Press <strong>enter</strong> after each word!</p>
        ${allowEarlyEnd ? `<button id="continue-btn">I'm done</button>` : ""}
      </div>
      <style>
        #responses{position:relative;width:300px;height:40px}
        .vft-input{position:absolute;width:100%;font-size:20px;padding:5px;opacity:.5}
        .vft-input.active{opacity:1;z-index:999}
      </style>
    `,

    choices: [],
    trial_duration: time,
    response_ends_trial: false,

    on_load: function () {

      const state = { responses: [], times: [], start: performance.now() };
      const container = document.getElementById("responses");
      const display = jsPsych.getDisplayElement();
      const handler = createResponseHandler(state, container);

      resetCountdown();
      countDown(time);

      display.addEventListener("keydown", handler);

      // Focus the initial input automatically
      const firstInput = container.querySelector("input.vft-input.active");
      if (firstInput) firstInput.focus();

      const finalize = (endedEarly, data={}) => {
        const tagged = state.responses.map((r,i)=>({response:r,tag:i+1}));
        const intervals = state.times.length
          ? [state.times[0], ...state.times.slice(1).map((t,i)=>t-state.times[i])]
          : [];

        data.tagged_responses = JSON.stringify(tagged);
        data.response_times = JSON.stringify(intervals.map(x=>+x.toFixed(2)));
        data.ended_early = endedEarly;
        return data;
      };

      if (allowEarlyEnd) {
        document.getElementById("continue-btn")?.addEventListener("click", () => {
          clearInterval(timerInterval);
          jsPsych.finishTrial(finalize(true));
        });
      }

      this._vftCleanup = () => {
        display.removeEventListener("keydown", handler);
        clearInterval(timerInterval);
        resetCountdown();
      };

      this._vftFinalize = finalize;
    },



    on_finish: function (data) {
      this._vftCleanup();
      if (!data.tagged_responses) this._vftFinalize(false, data);
      jsPsych.pluginAPI.clearAllTimeouts();
    }
  };
}

//creates SpAM task by gathering VFT responses and tracking item movement/coordinates
function SpamTask(domain) {
  return {
    type: jsPsychHtmlButtonResponse,
    stimulus: function() {
      let html = `
        <p style="font-size:20px;">Arrange each word to the drop box below based on how related they are to one another.</p> 
        <p style="font-size:18px;">A new word will appear after <strong>each word</strong> you move.</p>
        <p style="font-size:18px;"> When you are finished arranging the space, click the Continue button at the bottom of the screen.</p>
       <div id="word-drop-area" style="
            margin: 40px auto;
            width: 80vw;
            max-width: 1400px;
            height: 55vh;
            min-height: 500px;
            max-height: 750px;
            border: 2px solid #aaa;
            padding: 20px;
            position: relative;
          "></div>


          <p style="font-size:14px; color: gray;">Remember, previously placed words can be rearranged if needed!</p>
          <style>       
            .draggable {
              display: inline-block;
              background: #eef;
              padding: 4px 8px;
              border: 1px solid #aaa;
              border-radius: 4px;
              cursor: grab;
              font-size: 14px;
              line-height: 1.2;
              margin-bottom: 4px;
            }

        </style>    
      `;
        return html;
  },
  
  choices: ["Continue"], 
  button_html: `
  <button 
    class="jspsych-btn" 
    id="continue-button" 
    style="
      display: none;
      margin-top: 20px;
      background-color: #2e9f5e;
      color: white;
      font-size: 18px;
      font-weight: 600;
      padding: 12px 28px;
      border: none;
      border-radius: 6px;
      box-shadow: 0 4px 10px rgba(0,0,0,0.2);
      cursor: pointer;
    ">
    %choice%
  </button>
`,
  data: {
    task: "SpAM",
    domain: domain,
    
  },
  
  on_load: function() {
    const VFTResponses = jsPsych.data.get().filter({ task: "VFT", domain: domain }).last(1).values()[0];
    const domainWords = JSON.parse(VFTResponses.tagged_responses || "[]");
    const WordDropArea = document.getElementById("word-drop-area");
    let currentIndex = 0;
    window.WordsDropped = [];

    //allows dragging and tracks mouse press onto a word (or rectangle the word is in)
    function Draggable(element, onFirstMove) {
      let offsetX, offsetY;
      let currentlyDragging = false;
      let hasMoved = false;
      element.dataset.moveCount = "0";

    
      element.addEventListener("mousedown", (event) => {
        currentlyDragging = true;
        const rectangle = element.getBoundingClientRect();
        offsetX = event.clientX - rectangle.left;
        offsetY = event.clientY - rectangle.top;
        element.style.cursor = "grabbing";

        document.addEventListener("mousemove", OnMouseMove);
        document.addEventListener("mouseup", OnMouseUp);

        event.preventDefault();
      });

      //tracks mouse movement of the rectangle the word is in and calculates where it moves
      function OnMouseMove (event) {
        if (!currentlyDragging) return;

        const dropRectangle = WordDropArea.getBoundingClientRect();
        let left = event.clientX - dropRectangle.left - offsetX;
        let top = event.clientY - dropRectangle.top - offsetY;

        left = Math.max(0, Math.min(left, dropRectangle.width - element.offsetWidth));
        top = Math.max(0, Math.min(top, dropRectangle.height - element.offsetHeight));

        element.style.left = left + "px"
        element.style.top = top + "px"
    
        if (!hasMoved) {
          hasMoved = true;

          const appearanceTime = parseFloat(element.dataset.appearanceTime);
          element.dataset.firstMoveLatency = performance.now() - appearanceTime;

          if (typeof onFirstMove === "function") {
            onFirstMove();
          }
        }
      }
      
      //tracks when mouse is no longer pressing on word box and records words positions
      function OnMouseUp () {
        if (currentlyDragging) {
          currentlyDragging = false;
          const newCount = parseInt(element.dataset.moveCount) + 1;
          element.dataset.moveCount = newCount.toString();
          element.style.cursor = "grab";
          document.removeEventListener("mousemove", OnMouseMove)
          document.removeEventListener("mouseup", OnMouseUp)

          const dropRect = WordDropArea.getBoundingClientRect();
          const elemRect = element.getBoundingClientRect();

          // position of element *within drop area*
          const x_px = elemRect.left - dropRect.left;
          const y_px = elemRect.top - dropRect.top;

          // normalized coordinates (0–1)
          const x_norm = x_px / (dropRect.width - elemRect.width);
          const y_norm = 1- (y_px / (dropRect.height - elemRect.height)); // invert y-axis so 0 is bottom, 1 is top

          window.WordsDropped.push({
            word: element.textContent,
            id: element.id,

            // raw pixel values (optional, for debugging)
            x_px: x_px,
            y_px: y_px,

            // normalized coordinates (USE THESE FOR ANALYSIS)
            x_norm: x_norm,
            y_norm: y_norm,

            // canvas size at time of drop (important metadata)
            canvas_width: dropRect.width,
            canvas_height: dropRect.height,

            // timing + dynamics
            first_move_latency_ms: parseFloat(element.dataset.firstMoveLatency),
            move_count: parseInt(element.dataset.moveCount),

          });

          
          // Show the Continue button only if this is the last word
            if (currentIndex >= domainWords.length) {
              const button = document.getElementById("continue-button");
              if (button) button.style.display = "inline-block";
            }
        }
      }
    }
      //handles the display of the next word by establishing placement and calling next index of animal VFT responses
      function NextWord() {
      if (currentIndex >= domainWords.length) return;

      const words = domainWords[currentIndex];
      const wordDiv = document.createElement("div");
      wordDiv.textContent = words.response;
      wordDiv.className = "draggable";
      wordDiv.id = `word-${words.tag}`;
      wordDiv.style.position = "absolute";
      wordDiv.style.left = "20px";
      wordDiv.style.top = "20px"

      wordDiv.dataset.appearanceTime = performance.now();
      
      WordDropArea.appendChild(wordDiv);
      Draggable(wordDiv, () => {
        currentIndex ++; 
        setTimeout(() => {
          NextWord(); 
        }, 2000); //2 second delay before next box appears
      });
    }

    NextWord();
  },  

  on_finish: function (data) {
      data.droppedwords = window.WordsDropped || [];
      data.viewport_width = window.innerWidth;
      data.viewport_height = window.innerHeight;
      data.device_pixel_ratio = window.devicePixelRatio;

    }
  };
}

// demographics
var demographics_intro = {
        type: jsPsychInstructions,
        pages: [
            '<br><br><br>The experiment is now complete! We will now ask you a short series of demographics questions. <br><br> While some questions are required (*), you may skip any others you do not wish to answer. <br><br>Aftering filling out your responses, you may press CONTINUE to advance to the next page.'
        ],
        show_clickable_nav: true
    }

var demographics_survey1 = {
        type: jsPsychSurveyHtmlForm,
        preamble: "<h2><br><br><br>Demographics Questionnaire</h2>", name: 'heading', rows: 1, columns: 50,
        html: `
        <label for="gender">What is your gender(*)?</label>
        <input type="text" id="gender" name="gender" required><br><br>
        
        <label for="age">What is your age?(*)</label>
        <input type="number" id="age" name="age" min="0" max="120" required><br><br>

        <label for="education">How many years of formal education have you had? (*consider graduating high school to be 12 years)</label>
        <input type="number" id="education" name="education" min="0" max="120" required><br><br>
    `,
        data: {
            typeoftrial: 'demographics',
        },
        on_finish: function(data){

            data.age = data.response.age
            data.gender = data.response.gender
            data.education = data.response.education
            
        }
    };
        
    var demographics_survey2 = {  
      type: jsPsychSurveyMultiSelect,
      preamble: "<h2><br><br><br>Demographics Questionnaire</h2>",
      name: 'heading',
      rows: 1,
      columns: 50,
      questions: [  
        {
          prompt: "Please select all the racial and ethnic categories that apply to you (*):",
          name: 'race',
          options: [
            'American Indian/Alaskan Native',
            'Asian',
            'Black/African American',
            'Native Hawaiian or Other Pacific Islander',
            'White/Caucasian',
            'Other',
            'Hispanic/Latinx' 
          ],
          required: true,
          is_multiple: true 
        },
      ],
      data: {
        typeoftrial: 'demographics',
      },

      on_finish: function(data){

        // Raw selections
        let selections = data.response.race || [];
        if (selections.includes('Hispanic/Latinx')) {data.hispanic = 1;} else {data.hispanic = 0;}

        let race_only = selections.filter(r => r !== 'Hispanic/Latinx');
        if (race_only.length === 0) {data.race = "none_selected";}
        else if (race_only.length > 1) {data.race = "multiracial";}
        else {data.race = race_only[0];}

        data.race_raw = selections;
      }
    };

    var demographics_survey3 = {  
    type: jsPsychHtmlButtonResponse,
    preamble: "<h2><br><br><br>Demographics Questionnaire</h2>", name: 'heading', rows: 1, columns: 50,
    stimulus: "<br><br><br>Is English your first language? (*)<br><br>",
    choices: ['Yes','No'],

    data: {
        typeoftrial: 'demographics',
    },
    on_finish: function(data){
        if(data.response == 0){data.english = "yes"}
        else{data.english = "no"}
    }
    };


  var follow_up_questions = {
    type: jsPsychSurveyHtmlForm,
    preamble: "<br><br><br>You indicated that English is not your first language. Please answer the following questions:<br><br>",
    html: `
      <label for="first_language_detail">What is your first language?</label>
      <input type="text" id="first_language" name="first_language" required><br><br>
      
      <label for="age_learned_english">At what age did you learn English?</label>
      <input type="number" id="age_learned_english" name="age_learned_english" min="0" max="120" required><br><br>
    `,
    data: {
          typeoftrial: 'follow_up_demographics'
      },
      on_finish: function(data){
          data.first_language = data.response.first_language
          data.age_learned_english = data.response.age_learned_english
      }
  };

  var follow_up_procedure = {
          timeline: [follow_up_questions],
      conditional_function: function() {
          var lastTrialData = jsPsych.data.get().last(1).values()[0];
          //console.log("lastTrialData=",lastTrialData)
          return lastTrialData.response === 1;
      }
  };
    var demographics_language_followup = {
      type: jsPsychSurveyText,
    questions: [
        {prompt: "<br><br><br>Do you speak any languages other than English? If yes, please list them below, separated by commas.", name: 'additional_languages', 
          rows: 2,
          columns: 40
        }
    ],
    data: {
        typeoftrial: 'demographics'
    },
    on_finish: function(data){
        data.additional_languages = data.response.additional_languages
    }
    };

var additional_info_question = {
    type: jsPsychSurveyText,
    questions: [
        {prompt: "<br><br><br>Is there anything else we should know about, which might have affected your performance during the experiment? (e.g., lack of sleep, feeling ill etc.)", name: 'additional_info'}
    ],
    data: {
        typeoftrial: 'demographics'
    },
    on_finish: function(data){
        data.other_info = data.response.additional_info
    }
};