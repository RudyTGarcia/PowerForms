
import "core-js";
import "regenerator-runtime/runtime";
import queryString from 'query-string';
import Axios from 'axios';

import Workflow from './Workflow';
import DynamicForm from './DynamicForm';
import ParsePath from './util/ParsePath';

import '../scss/style.scss';

const parsePath = new ParsePath({
  sensitive: false,
  strict: false,
  end: true,
});

$("#workflow_selector").hide();
//$("#workflow_name").hide();

var params = parsePath.test('/workflow/:id', window.location.pathname);
if(params !== false) {
  var workflowId = params.id;
  runWorkflow(workflowId, false);
}
else {
  showWorkflowSelector()
}

async function showWorkflowSelector() {
  $("#workflow_selector").show();

  try {
    const api_response = await Axios.get(apiBaseURL + 'api/getWorkflows');
    const workflow_list = api_response.data;

    // Iterate through workflow data and assign text/value to array for drop-down options
    for (let i = 0; i < workflow_list.length; i++) {
        workflow_list[i].text = workflow_list[i].displayName;
        workflow_list[i].value = workflow_list[i].workflowId;
        delete workflow_list[i].displayName;
        delete workflow_list[i].workflowId;
    }

    // Add elements from options array into the drop down menu
    const selectBox = document.getElementById('workflow_dropdown');
    for (let j = 0, l = workflow_list.length; j < l; j++) {
        const option = workflow_list[j];
        selectBox.options.add(new Option(option.text, option.value, option.selected));
    }

    $('#workflow_selector #option_submit_button').click(() => {
      var workflowId = $("#workflow_dropdown").val();
      runWorkflow(workflowId, true);
    });
  }
  catch (err) {
    console.error(err);
  }
}

async function runWorkflow(workflowId, showSelector) {
  let workflow = await Workflow.loadWorkflow(workflowId);

  // Create the dynamic form
  workflow.render(document.getElementById("app"));
}
