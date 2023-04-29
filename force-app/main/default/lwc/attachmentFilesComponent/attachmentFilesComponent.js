import { LightningElement, api, wire } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
//Apex method calling
import getAttachments from '@salesforce/apex/WrapperDemo.getAttachmentList';
import { refreshApex } from '@salesforce/apex';

const actions = [
    { label: 'Show details', name: 'show_details' },
    { label: 'Delete', name: 'delete' },
];
// Creating column for data table.
const COLS = [
    {
        label: 'Title', fieldName: 'titleURL', type: 'url', wrapText: true,
        typeAttributes: {
            label: { fieldName: 'name' },
            tooltip: { fieldName: 'name' },
            //target : '_blank'
        },
    },
    {
        label: 'Created By', fieldName: 'createdbyURL', type: 'url', wrapText: true,
        typeAttributes: {
            label: { fieldName: 'createdbyName' },
            tooltip: { fieldName: 'createdbyName' }
        },
    },
    {
        label: 'Last Modified', fieldName: 'lastModifiedDate', type: 'date', wrapText: true,
        typeAttributes: {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        }
    }


];
export default class AttachmentFilesComponent extends NavigationMixin(LightningElement) {
    @api recordId
    @api objectApiName;
    isLoading = true
    attachRecordCount = 0
    showAttachment = false
    showLimitExceededInfo = false
    provisionedValue
    attachmentList = []
    columns = COLS

    constructor() {
        super();
        this.columns = this.columns.concat([
            { type: 'action', typeAttributes: { rowActions: this.getRowActions } }
        ]);
    }


    @wire(getAttachments, { recordId: '$recordId' })
    loadAttachmentsFiles(provisionedValue) {
        this.provisionedValue = provisionedValue; // track the provisioned value
        const { data, error } = provisionedValue; // destructure it for convenience
        if (data) {

            this.isLoading = false;
            //console.log('Attachment Data--' + JSON.stringify(data));
            this.attachmentList = data['showAttachmentList'];
            this.attachRecordCount = data['attachmentCount'];
            this.showLimitExceededInfo = data['showLimitExceededInfo'];
            if (this.attachRecordCount !== 0) this.showAttachment = true

        } else if (error) {
            this.isLoading = false;
            console.error(error)
        }
    }
    handleUploadFinished() {
        console.log('upload finished')
        return refreshApex(this.provisionedValue)
    }
    navigateToNotesAttach() {
        this[NavigationMixin.Navigate]({
            type: 'standard__webPage',
            attributes: {
                url: '/lightning/r/' +this.objectApiName+'/'+this.recordId+'/related/CombinedAttachments/view'
            }
        });
    }

    handleError() {

    }
    handleRowAction(event) {
        const actionName = event.detail.action.name;
        const row = event.detail.row;
        console.log("****" + JSON.stringify(row));
        switch (actionName) {
            case 'download':
                this[NavigationMixin.Navigate]({
                    type: 'standard__recordPage',
                    attributes: {
                        recordId: row.Id,
                        actionName: 'view'
                    }
                });
                break;
            case 'delete':
                this[NavigationMixin.Navigate]({
                    type: 'standard__namedPage',
                    attributes: {
                        pageName: 'filePreview'
                    },
                    state: {
                        selectedRecordId: row.previewId
                    }
                });
                break;
            case 'viewFileDetails':
                this[NavigationMixin.Navigate]({
                    type: 'standard__recordPage',
                    attributes: {
                        recordId: row.Id,
                        objectApiName: 'ContentDocument',
                        actionName: 'edit'
                    }
                });
                break;
            case 'uploadNewVersion':
                this[NavigationMixin.Navigate]({
                    type: 'standard__recordPage',
                    attributes: {
                        recordId: row.Id,
                        objectApiName: 'ContentDocument',
                        actionName: 'edit'
                    }
                });
                break;
            case 'editFileDetails':
                this[NavigationMixin.Navigate]({
                    type: 'standard__recordPage',
                    attributes: {
                        recordId: row.Id,
                        objectApiName: 'ContentDocument',
                        actionName: 'edit'
                    }
                });
                break;
            case 'removeFromRecord':
                this[NavigationMixin.Navigate]({
                    type: 'standard__recordPage',
                    attributes: {
                        recordId: row.Id,
                        objectApiName: 'ContentDocument',
                        actionName: 'edit'
                    }
                });
                break;
            case 'preview':
                this[NavigationMixin.Navigate]({
                    type: 'standard__namedPage',
                    attributes: {
                        pageName: 'filePreview'
                    },
                    state: {
                        selectedRecordId: row.previewId
                    }
                });
                break;

            default:
        }
    }

    deleteRow(row) {
        const { id } = row;
        const index = this.findRowIndexById(id);
        if (index !== -1) {
            this.data = this.data
                .slice(0, index)
                .concat(this.data.slice(index + 1));
        }
    }

    findRowIndexById(id) {
        let ret = -1;
        this.data.some((row, index) => {
            if (row.id === id) {
                ret = index;
                return true;
            }
            return false;
        });
        return ret;
    }

    showRowDetails(row) {
        this.record = row;
    }

    getRowActions(row, doneCallback) {
        const actions = [];
        if (row['type'] == 'attachment') {
            actions.push(
                {
                    'label': 'Download',
                    'name': 'download'
                },
                {
                    'label': 'Delete',
                    'name': 'delete'
                }
            );
        } else {
            actions.push(
                {
                    'label': 'Preview',
                    'name': 'preview'
                },
                {
                    'label': 'Dowload',
                    'name': 'download'
                },
                {
                    'label': 'View File Details',
                    'name': 'viewFileDetails'
                },
                {
                    'label': 'Upload New Version',
                    'name': 'uploadNewVersion'
                },
                {
                    'label': 'Edit File Details',
                    'name': 'editFileDetails'
                },
                {
                    'label': 'Delete',
                    'name': 'delete'
                },
                {
                    'label': 'Remove From Record',
                    'name': 'removeFromRecord'
                }

            );
        }
        setTimeout(() => {
            doneCallback(actions);
        }, 200);

    }

}