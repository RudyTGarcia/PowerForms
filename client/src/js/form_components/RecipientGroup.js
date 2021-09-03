import Utils from '../util/Utils';
import DOMUtils from '../util/DOMUtils';
import autocomplete from 'autocompleter';
import ITSDirectoryInfo from '../util/data/ITSDirectoryInfo.json'; 
const ITSdir = ITSDirectoryInfo; 
import telData from '../util/data/telData.json'; 
//const empInf = telData; 

// var empDir = []; 

// const emp = {label: "", value: ""}; 



export default class RecipientGroup {
  constructor(id, config){
    this.id = id;
    this.config = config;
    this.number_of_members = 0;
    this.divNode = "";
    this.inputNode = null;

    this.required = !(this.config.minListCount == 0);

  }

  

  addToDOM(parentNode) {
    const inputId = 'recipient_' + this.id;

    // Create the div
    var divNode = document.createElement('div');
    divNode.id = "recipient_group_" + this.id;
    divNode.className = "form-group";
    parentNode.appendChild(divNode);
    this.divNode = divNode;

    // Create the label
    var labelNode = document.createElement('label');
    labelNode.innerHTML = this.config.label;
    labelNode.htmlFor = inputId;
    divNode.appendChild(labelNode);

    // Create the input
    // var inputNode = document.createElement("input");
    // inputNode.type = "email";
    // inputNode.id = inputId;
    // inputNode.name = inputId;
    // inputNode.className = 'form-control';
    // inputNode.placeholder = "Enter Recipient's Email";
    // divNode.appendChild(inputNode);
    var inputNode = document.createElement("input");
    inputNode.id = inputId;
    inputNode.name = inputId;
    inputNode.className = 'autocomplete form-control';
    inputNode.placeholder = "Search by Name";
    autocomplete({
      onSelect: function(item) {
          inputNode.value = item.value;
      },
      input: inputNode,
      minLength: 2,
      emptyMsg: 'Search by Name',
      render: function(item, currentValue) {
          var div = document.createElement("div");
          div.textContent = item.label;
          return div;
      },
      renderGroup: function(groupName, currentValue) {
          var div = document.createElement("div");
          div.textContent = groupName;
          return div;
      },
      //className: 'autocomplete-customizations',
      fetch: function(text, callback) {
          text = text.replace(/[&\#,+()$~%.'":*?`!^<>{}]/g, '').toLowerCase();

          var filteredEmps = telData.filter(function(emp){
            if(emp.m !== "")
            {
              return emp.f.toLowerCase().concat(' ', emp.l.toLowerCase()).includes(text);
            }
            
          });

          var employee = {}; 
          var employeeCollection = []; 

          filteredEmps.forEach(function(item){
            employee.label = `${item.f} ${item.l} | ${item.t} | ${item.d}`; 
            employee.value = item.m; 
            employeeCollection.push(employee); 
            employee = {};
          });

          var suggestions = employeeCollection;
          callback(suggestions);
      },
      debounceWaitMs: 200,
      // customize: function(input, inputRect, container, maxHeight) {
      //     ...
      // },
      preventSubmit: true,
      disableAutoSelect: true,
      container: document.createElement("div")
  });
    divNode.appendChild(inputNode);

    var feedbackNode = document.createElement('div');
    feedbackNode.className = "invalid-feedback";
    feedbackNode.innerText = "Please provide a valid email address"
    divNode.appendChild(feedbackNode);

    if(this.required) {
      inputNode.required = true;
      labelNode.classList.add("required");
    }

    // If data is not blank, fill it in with predefine information
    if (this.config.defaultValue !== "") {
      inputNode.value = this.config.defaultValue;

      if(!this.config.editable) {
        inputNode.readonly = true;
      }
    }

    //Track inputNode for retrieval later
    this.inputNode = inputNode;

    // This feature is currently blocked. There's a bug in Adobe API that
    // has been reported. Once this bug is fixed, it will be enabled in
    // the next version.

    // // If group is a recipient group
    // if (this.recipient_group_data['maxListCount'] > 1) {
    //     this.createAdditionalRecipientInput(inputNode.id);
    //     this.removeParticipentButton(this.divNode);
    // }

    return;
  }

  setupValidation(validator) {
    let validationFn = this.runValidation.bind(this);

    let validationTracker = validator.createTracker(this.inputNode, validationFn);

    this.inputNode.addEventListener("change", (event) => {
      validationFn(validationTracker, event, false);
    });
  }

  runValidation(validationTracker, event, isRevalidate) {
    let error = false;
    let message = null;
    let email = this.inputNode.value;

    if(this.required && email == "") {
      error = true;
      message = `The recipient "${this.config.label}" is required.`
    }
    else if(email != "" && !Utils.isValidEmail(email)) {
      error = true;
      message = `The email "${email}" for recipient "${this.config.label}" is not a valid email address.`
    }

    if(error) {
      this.inputNode.classList.add("is-invalid");
    }
    else {
      DOMUtils.removeClass(this.inputNode, "is-invalid");
    }

    validationTracker.update(error, message);
  }

  getValues() {
    if (this.config.editable) {
      return {
        name: this.config.name,
        recipients: [
          {
            email: this.inputNode.value
          }
        ]
      }
    }
    return null;
  }

  createAdditionalRecipientInput(recipient_id) {
      /***
       * This function add additions recipeints input
       */

      var add_div = document.createElement('div');
      add_div.id = 'add_section_' + this.group_id;
      add_div.className = "add_section";
      this.divNode.appendChild(add_div);

      // Create the add new recipient button
      var add_marker_button = document.createElement("button");
      add_marker_button.type = "button";
      add_marker_button.id = "add_button";

      // Add onclick function to allow us to create new recipient inputs
      add_marker_button.onclick = function () {
          let new_recipient_id = recipient_id + '_' + this.number_of_members;
          this.number_of_members++;
          this.appendNewParticipentInput(new_recipient_id);
      }.bind(this);

      add_div.append(add_marker_button);

      // Add the plus icon to the button
      var add_recipient_marker = document.createElement("i");
      add_recipient_marker.className = "fa fa-plus";

      add_marker_button.appendChild(add_recipient_marker)
  }

  appendNewParticipentInput(participent_id) {
      /***
       * This functiuon appends a new recipient input
       */

      // Create a line break
      var linebreak = document.createElement("br");

      // Create new input field
      var participent_input = document.createElement('input');
      participent_input.type = "text";
      participent_input.className = "form-control";
      participent_input.placeholder = "Enter Recipient's Email";
      participent_input.id = participent_id;
      participent_input.name = participent_id;

      // Append to the div before buttons
      var target = document.getElementById("add_section_" + this.group_id);
      this.divNode.insertBefore(participent_input, target);
  }

  removeParticipentButton() {
      /***
       * This function removes a recipient
       */

      var remove_button = document.createElement("button");
      remove_button.type = "button";
      remove_button.id = "remove_button";
      remove_button.onclick = function () {
          if(this.number_of_members > 0){
              // remove input field
              this.divNode.removeChild(this.divNode.querySelectorAll("input")[this.number_of_members]);
              this.number_of_members--;
          }
      }.bind(this);
      document.getElementById('add_section_' + this.group_id).appendChild(remove_button);

      var remove_button_marker = document.createElement("i");
      remove_button_marker.className = "fa fa-minus";
      remove_button.appendChild(remove_button_marker);
  }
}
