public with sharing class WrapperDemo {
    @AuraEnabled(cacheable=true)
    public static map<string,object> getAttachmentList(String recordId){
        List<showAttachmentDetails> showAttachmentList = new List<showAttachmentDetails>();
        Boolean showLimitExceededInfo = false;
        try {
            List<Attachment> attachList = [SELECT Id, LastModifiedDate, OwnerId,Owner.Name,Name,CreatedDate FROM Attachment where ParentId=:recordId Order by CreatedDate Desc Limit 5];
            List<ContentVersion> fileList = [Select Id,Title,LastModifiedDate,CreatedDate,ContentDocumentId,Owner.Name,OwnerId from ContentVersion where FirstPublishLocationId=:recordId Order by CreatedDate Desc Limit 5];
            for(Attachment att: attachList) {
                showAttachmentList.add(new showAttachmentDetails(att));
            }
            for(ContentVersion file: fileList) {
                showAttachmentList.add(new showAttachmentDetails(file));
            }
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
        showAttachmentList.sort();   //sort by CreatedDate
        //Limit Enforcement Logic
        if((showAttachmentList.size())>=6) {
            showLimitExceededInfo = true;
            while(showAttachmentList.size()>5) {
                showAttachmentList.remove(showAttachmentList.size()-1);
            }
        }
        Integer attachmentCount = showAttachmentList.size();        
        map<string,object> mapAttachment = new map<string,object>();
        mapAttachment.put('attachmentCount',attachmentCount);
        mapAttachment.put('showLimitExceededInfo',showLimitExceededInfo);
        mapAttachment.put('showAttachmentList',showAttachmentList);

        return mapAttachment;
    }

    public class showAttachmentDetails implements Comparable {
        @AuraEnabled
        public String name{set;get;}
        @AuraEnabled
        public String titleURL{set;get;}
        @AuraEnabled
        public String createdbyName{set;get;}
        @AuraEnabled
        public String createdbyURL{set;get;}
        @AuraEnabled
        public Date lastModifiedDate{set;get;}
        @AuraEnabled
        public DateTime createdDate{set;get;}

        public Integer CompareTo(Object compareTo) {
            showAttachmentDetails attachmentToCompare = (showAttachmentDetails)compareTo;            
            
            if (createdDate == null) 
                return 1;
            if (attachmentToCompare == null || attachmentToCompare.createdDate == null)   
                return -1;
            if (createdDate < attachmentToCompare.createdDate)
                return 1;
            if (createdDate == attachmentToCompare.createdDate)
                return 0;
            return -1;

        }

        public showAttachmentDetails() {}
        public showAttachmentDetails(Attachment attach) {
            this.name = attach.name;
            this.titleURL = '/servlet/servlet.FileDownload?file='+attach.Id;
            this.createdbyName = attach.Owner.Name;
            this.createdbyURL = '/'+attach.OwnerId;
            this.lastModifiedDate = Date.ValueOf(attach.LastModifiedDate);
            this.createdDate = attach.CreatedDate;
        }
        public showAttachmentDetails(ContentVersion file) {
            this.name = file.title;
            this.titleURL = '/lightning/r/ContentDocument/'+file.ContentDocumentId+'/view';
            this.createdbyName = file.Owner.Name;
            this.createdbyURL = '/'+file.OwnerId;
            this.lastModifiedDate = Date.ValueOf(file.LastModifiedDate);
            this.createdDate = file.CreatedDate;
        }

    }
}
