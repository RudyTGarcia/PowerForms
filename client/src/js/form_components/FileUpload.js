import * as API from '../API';
import Utils from '../util/Utils';
import fileUploadTemplate from 'FileUpload.hbs';

export default class FileUpload {
  constructor(config) {
    this.config = config;

    this._transientDocumentId = null;
  }

  addToDOM(parentNode) {
    let data = {
      inputId: 'file_' + this.config.name,
      label: this.config.label,
      required: this.config.required
    };

    // Create the div
    var tempDiv = document.createElement('div');
    tempDiv.innerHTML = fileUploadTemplate(data);
    var div = tempDiv.firstChild
    parentNode.appendChild(div);

    //create hooks
    this._uploadNode = div.querySelector('input');
    this._fileNameNode = div.querySelector('.custom-file-label');

    return;
  }

  setupValidation(validator) {
    let validationFn = this.runValidation.bind(this);
    let validationTracker = validator.createTracker(this.inputNode, validationFn);

    this._uploadNode.onchange = async function () {
      this._transientDocumentId = await this.handleFileUpload();
      validationFn(validationTracker);
    }.bind(this);
  }

  runValidation(validationTracker) {
    let error = false;
    let message = null;
    let docId = this._transientDocumentId;

    if(this.config.required && !docId) {
      error = true;
      message = `The file "${this.config.label}" is required.`
    }

    if(error) {
      this._uploadNode.classList.add("is-invalid");
    }
    else {
      Utils.removeClass(this._uploadNode, "is-invalid");
    }

    validationTracker.update(error, message);
  }

  getValues() {
    let docId = this._transientDocumentId;
    if (docId) {
      return {
        name: this.config.name,
        transientDocumentId: docId
      }
    }
    return null;
  }

  async handleFileUpload() {
    var file = this._uploadNode.files[0];
    this._fileNameNode.innerText = file.name;
    let transientDocument = await API.postTransientDocument(file);
    return transientDocument.transientDocumentId;
  }
}
