
class WorkflowConfig {
  constructor(wfData, settings) {
    this.wfData = wfData;
    this.settings = settings;

    this.wfSettings = {};
  }

  getClientConfig() {
    const settings = this.settings;

    const clientConfig = {
      displayName: this.wfData.displayName,
      instructions: this.wfData.description
    }

    clientConfig.mergeFields = this.getMergeFieldConfig();
    clientConfig.instructions = this.wfData.description

    clientConfig.recipients = this.getRecipientsConfig();

    const carbonCopies = this.getCarbonCopyConfig();
    if (carbonCopies.length > 0) {
      clientConfig.carbonCopies = carbonCopies;
    }

    const agreementName = this.getAgreementNameConfig();
    if (agreementName !== null) {
      clientConfig.agreementName = agreementName;
    }

    const message = this.getMessageConfig();
    if (message !== null) {
      clientConfig.message = message;
    }

    clientConfig.files = this.getFilesConfig();
    clientConfig.password = this.wfData.passwordInfo;

    const expiration = this.getExpirationConfig();
    if (expiration !== null) {
      clientConfig.expiration = expiration;
    }

    clientConfig.reminder = this.getReminderConfig();

    //clientConfig.old = this.wfData;
    return clientConfig;

    //return Object.assign({new:clientConfig}, this.wfData);
  }

  getRecipientsConfig() {
    let hide_readonly = this.settings.recipients.hide_readonly;
    let hide_predefined = this.settings.recipients.hide_predefined;
    var recipients = [];
    
    this.wfData.recipientsListInfo.forEach(wfRecipient => {
      
      if(hide_predefined && wfRecipient.defaultValue != "") {
        return;
      }

      if(hide_readonly && !wfRecipient.editable) {
        return;
      }

      //Object.entries(wfRecipient).forEach(prop => console.log(prop));
      
      recipients.push({
        name: wfRecipient.name,
        label: wfRecipient.label,
        defaultValue: wfRecipient.defaultValue,
        editable: wfRecipient.editable,
        minListCount: wfRecipient.minListCount,
        maxListCount: wfRecipient.maxListCount, 
        // authenticationMethod: 'Adobe Sign'
      });
    });

    return recipients;
  }

  getCarbonCopyConfig() {
    var carbonCopies = [];

    if('ccsListInfo' in this.wfData) {
      let hide_readonly = this.settings.cc.hide_readonly;
      let hide_predefined = this.settings.cc.hide_predefined;

      this.wfData.ccsListInfo.forEach(data => {
        if(hide_readonly && !data.editable) {
          return; 
        }

        let defaultCCs = (data.defaultValue) ? data.defaultValue.split(/,|;/) : [];
        let defaultCount = defaultCCs.length;

        let carbonCopy = {
          name: data.name,
          label: data.label,
          defaultValues: defaultCCs,
          minListCount: data.minListCount,
          maxListCount: data.maxListCount,
          editable: data.editable
        };

        if(hide_predefined) {
          let minListCount = data.minListCount - defaultCount;
          let maxListCount = data.maxListCount - defaultCount;

          if(maxListCount <= 0) {
            return false;
          }

          if(minListCount < 0) {
            minListCount = 0;
          }

          carbonCopy.minListCount = minListCount;
          carbonCopy.maxListCount = maxListCount;
          carbonCopy.defaultValues = [];
        }

        carbonCopies.push(carbonCopy);
      });
    }

    return carbonCopies;
  }

  getAgreementNameConfig() {
    let hide = this.settings.agreementName.hide;

    if(hide) {
      return null;
    }

    if("HideAgreementName" in this.wfSettings && this.wfSettings.HideAgreementName.defaultValue.toLowerCase() == 'true') {
      return null;
    }

    return {
      defaultValue: this.wfData.agreementNameInfo.defaultValue,
      editable: true,
    }
  }

  getMessageConfig() {
    let hide = this.settings.message.hide;

    if(hide) {
      return null;
    }

    return {
      defaultValue: this.wfData.messageInfo.defaultValue,
      editable: true,
    }
  }

  getFilesConfig() {
    let hide_predefined = this.settings.files.hide_predefined;
    var fileConfigs = [];

    this.wfData.fileInfos.forEach(wfFile => {
      let fileConfig = {
        name: wfFile.name,
        label: wfFile.label,
        required: wfFile.required
      }

      if('workflowLibraryDocumentSelectorList' in wfFile) {
        let docList = wfFile.workflowLibraryDocumentSelectorList;
        if(hide_predefined && wfFile.required && docList.length == 1) {
          return;
        }

        fileConfig.workflowLibraryDocumentSelectorList = docList;
      }

      fileConfigs.push(fileConfig);
    });

    return fileConfigs;
  }

  getMergeFieldConfig() {
    let mergeFields = [];

    if('mergeFieldsInfo' in this.wfData) {
      let hide_readonly = this.settings.mergeFields.hide_readonly;
      let hide_predefined = this.settings.files.hide_predefined;

      this.wfData.mergeFieldsInfo.forEach(wfField => {
        // skip config fields
        if(wfField.fieldName.startsWith("WFSetting")) {
          this.wfSettings[wfField.fieldName.replace("WFSetting_", "")] = {
            defaultValue: wfField.defaultValue,
            editable: wfField.editable,
          };
          return;
        }

        if(hide_predefined && wfField.defaultValue != "") {
          return;
        }

        if(hide_readonly && !wfField.editable) {
          return;
        }

        //required is not currently provided by the API so we are assuming it is required
        mergeFields.push({
          fieldName: wfField.fieldName,
          displayName: wfField.displayName,
          defaultValue: wfField.defaultValue,
          editable: wfField.editable,
          required: true,
        });
      });

    };

    return mergeFields;
  }

  getExpirationConfig() {
    let hide = this.settings.expiration.hide;

    if(!hide && 'expirationInfo' in this.wfData) {
      return this.wfData.expirationInfo;
    }

    return null;
  }

  getReminderConfig() {
    let hide_readonly = this.settings.reminder.hide_readonly;
    let hide_notpredefined = this.settings.reminder.hide_notpredefined;

    if(this.wfSettings.Reminder) {
      return {
        visible: !(hide_readonly && !this.wfSettings.Reminder.editable),
        defaultValue: this.wfSettings.Reminder.defaultValue,
        editable: this.wfSettings.Reminder.editable,
      };
    }
    else {
      return {
        visible: !hide_notpredefined,
        defaultValue: "",
        editable: true,
      };
    }


  }
}

module.exports = WorkflowConfig;
