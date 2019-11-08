import DynamicForm from './DynamicForm';
import * as API from './API';

export default class Workflow {
  constructor(workflowId) {
    this.workflowId = workflowId;
    this.workflow_id = workflowId;
    this.agreement_name = "";
    this.file_infos = [];
    this.recipients_list = [];
    this.recipient_group = [];
    this.carbon_copy_group = [];
    this.merge_field_group = [];
    this.pass_option = "";
    this.deadline = "";
    this.reminders = "";
    this.message = "";

    this.workflowConfig;
    this.dynamicForm;

    this.recipientGroups = [];
    this.carbonCopyGroups = [];
    this.files = [];
  }

  static async loadWorkflow(workflowId) {
    let workflowConfig = API.getWorflowConfig(workflowId);
    let wf = new Workflow(workflowId);

    wf.workflowConfig = await workflowConfig;

    return wf;
  }

  getWorkflowConfig() {
    return this.workflowConfig;
  }

  render(parentNode) {
    var dynamicForm = new DynamicForm(this.workflowConfig, this);
    dynamicForm.buildRecipientsForm(parentNode);

    this.dynamicForm = dynamicForm;
  }

  verify() {

  }

  buildAgreement() {

    let agreementData = {
      recipients: this.getReducedValues(this.recipientGroups),
      carbonCopy: this.getReducedValues(this.carbonCopyGroups),
      //agreementName
      //message
      files: this.getReducedValues(this.files),
      //mergeFields
      //password
      //expiration
      //reminder
    }

    console.log(agreementData)
  }

  getReducedValues(arr) {
    return arr.reduce((results, elm) => {
      let val = elm.getValues();
      if(val !== null) {
        results.push(val);
      }
      return results;
    }, []);
  }



  setAgreementName(agreement_name) {
    /***
     * This function set the agreement name
     * @param {String} agreement_name name of the agreement
     */

    this.agreement_name = agreement_name;
  }

    updateAgreementName() {
        /***
         * This function will update the agreement name
         */

        var agreement_name = document.getElementById('agreement_name');
        this.setAgreementName(agreement_name.value);
    }

    updateRecipientGroup(recipient_group_data, recipient_groups) {
        /***
         * This function updates the recipeint groups
         * @param {Object} recipient_group_data The object of the whole recipient group
         * @param {Object} recipient_group The current group of the recipients being added
         */

        for (let i = 0; i < recipient_group_data.length; i++) {
            if (recipient_group_data[i]['defaultValue'] === "") {
                if (recipient_group_data[i]['maxListCount'] !== 1) {
                    let addition_recipient = recipient_groups[i]['target_div'].querySelectorAll('input');

                    for (let recipient_counter = 0; recipient_counter < addition_recipient.length; recipient_counter++) {
                        this.addToRecipientGroup(addition_recipient[recipient_counter].email);
                    }
                } else {
                    let recipient_id = document.getElementById("recipient_" + i);
                    this.addToRecipientGroup(recipient_id.email);
                }
            }
            else {
                if(recipient_group_data[i]['editable']){
                    this.addToRecipientGroup(recipient_groups[i].email)
                }
                else{
                    this.addToRecipientGroup(recipient_group_data[i]['defaultValue'])
                }
            }
            this.addToRecipientsList(recipient_group_data[i]['name']);
            this.clearRecipientGroup();
        }
    }

    addToRecipientGroup(email) {
        /***
         * This function add a new user to a recipient group
         * @param {String} email Email of recipients
         */

        var data = {
            "email": email
        };

        this.recipient_group.push(data)
    }

    clearRecipientGroup() {
        /***
         * This function clear recipients group
         */
        this.recipient_group = [];
    }

    addToRecipientsList(name) {
        /***
         * This function add recipient groups to the overall list of recipeints
         * @param {String} name Name of the recipient group
         */

        var data = {
            "name": name,
            "recipients": this.recipient_group
        };

        this.recipients_list.push(data);
    }

    updateCcGroup(cc_group_data, cc_group) {
        /***
         * This function will update the carbon_copy_group list
         * @param {String} cc_group_data Cc recipients from API default value
         * @param {Object} cc_group Object of cc divs from web form
         */

        const editable = cc_group_data['editable'];
        const cc_list = cc_group_data['defaultValue'].split(",");
        var add_to_cc_list = [];

        for (let counter = 0; counter < cc_group.length; counter++) {
            if(!(editable)){
                if(counter < cc_list.length){
                    add_to_cc_list.push(cc_list[counter]);
                }
            }
            else{
                add_to_cc_list.push(cc_group[counter].email);
            }
        }

        this.addToCcGroup(cc_group_data['name'], add_to_cc_list)

    }

    addToCcGroup(name, add_to_cc_list) {
        /***
         * This function will add the json to the carbon copy group
         * @param {String} name The name of the cc group
         * @param {Object} add_to_cc_list An array of cc emails
         */

        var data = [
            {
                "name": name,
                "emails": add_to_cc_list
            }
        ]

        this.carbon_copy_group.push(data);

    }

    updateFileInfos(file_infos) {
        /***
         * This function updates the file infos
         * @param {Object} file_infos The file info object that holds file info
         */

        for (let i = 0; i < file_infos.length; i++) {
            if (file_infos[i]['workflow_lib_doc_id'] !== null) {
                this.file_infos.push(
                    {
                        "name": file_infos[i]['file_name'],
                        "workflowLibraryDocumentId": file_infos[i]['workflow_lib_doc_id'][0]['workflowLibDoc']
                    }
                )
            } else if(file_infos[i]['transient_id'] !== null){
                this.file_infos.push(
                    {
                        "name": file_infos[i]['file_name'],
                        "transientDocumentId": file_infos[i].transient_id
                    }
                )
            }
        }
    }

    updateMergeFieldInfos(merge_fields){
        /***
         * This function allows merging of user input
         * @param {String} merge_fields Fields for user input to be merged
         */

        for( let counter = 0; counter < merge_fields.length; counter++){
            let merge_data = {
                'defaultValue': merge_fields[counter].default_value,
                'fieldName': merge_fields[counter].field_name
            };
            this.merge_field_group.push(merge_data)
        }
    }

    updateDeadline(today){
        /***
         * This function will update the deadline.
         * @param {Date} today The date object for today
         */

        const date_input = document.getElementById('deadline_input').value;

        const today_date = new Date(today);
        const selected_date = new Date(date_input);

        const diffTime = Math.abs(selected_date - today_date);
        this.deadline = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    }

    createOpenPass(pass, protection) {
        /***
         * This function builds out the security option.
         * @param {String} pass The pass for the agreement
         * @param {Boolean} protection The trigger for protection option
         */

        var data = {
            "openPassword": pass,
            "protectOpen": protection
        }

        this.pass_option = data;
    }

    updateReminder(reminder){
        /***
         * Thie function update the reminder API key.
         * @param {Object} reminder Reminder object created in dynamic form
         */

        if(reminder.checked){
            this.reminders = reminder_dropdown.value;
        }
    }

    updateMessage(msg){
        /***
         * This section will update the message for the API dynamic form.
         * @param {String} msg Message set in the dynamic form
         */

        this.message = msg;
    }

    clearData(){
        /***
         * This function clears data from the workflow.
         */

        this.file_infos = [];
        this.recipients_list = [];
        this.recipient_group = [];
        this.merge_field_group = [];
    }

    jsonData() {
        /***
         * This function returns the json data formate of the workflow
         */

         //to add
         //documentCreationInfo.message = workflow_data.messageInfo.defaultValue
         //documentCreationInfo.formFields
         //documentCreationInfo.postSignOptions.redirectUrl
         //documentCreationInfo.postSignOptionsredirectDelay


        if( this.deadline === ""){
            return {
                "documentCreationInfo": {
                    "fileInfos": this.file_infos,
                    "name": this.agreement_name,
                    "recipientsListInfo": this.recipients_list,
                    "ccs": this.carbon_copy_group,
                    "securityOptions": this.pass_option,
                    "mergeFieldInfo": this.merge_field_group,
                    "reminderFrequency": this.reminders,
                    "message": this.msg
                }
            };
        }
        else{
            return {
                "documentCreationInfo": {
                    "fileInfos": this.file_infos,
                    "name": this.agreement_name,
                    "recipientsListInfo": this.recipients_list,
                    "ccs": this.carbon_copy_group,
                    "securityOptions": this.pass_option,
                    "mergeFieldInfo": this.merge_field_group,
                    "daysUntilSigningDeadline": this.deadline,
                    "reminderFrequency": this.reminders,
                    "message": this.msg
                }
            };
        }
    }
}
