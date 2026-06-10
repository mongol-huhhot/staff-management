export class drafts {//draft_status
    eGui;
    alldata;
    draft;
    pending;
    returned;
    approved;
    rejected;
    filterActive;
    filterChangedCallback;

    init(params) {
        this.eGui = document.createElement('div');
        this.eGui.innerHTML = `<div class="apply-filter">
                <div>  
                    <input type="checkbox" name="applyFilter" checked="true" id="pending" filter-checkbox="true"/> 登録済み
                </div>
                <div>  
                    <input type="checkbox" name="applyFilter" checked="true" id="approved" filter-checkbox="true"/> 承認済み
                </div>
            </div>
            <br>
            <div style="width:40%;margin-left:4px;">
                <button id="alldata" style="width:100%;text-align:center;">全て表示</button>
            </div>`;
        this.alldata = this.eGui.querySelector('#alldata');
        // this.draft = this.eGui.querySelector('#draft');
        this.pending = this.eGui.querySelector('#pending');
        // this.returned = this.eGui.querySelector('#returned');
        this.approved = this.eGui.querySelector('#approved');
        // this.rejected = this.eGui.querySelector('#rejected');
        this.alldata.addEventListener('click', this.showAll.bind(this));
        // this.draft.addEventListener('change', this.filterChanged.bind(this));
        this.pending.addEventListener('change', this.filterChanged.bind(this));
        // this.returned.addEventListener('change', this.filterChanged.bind(this));
        this.approved.addEventListener('change', this.filterChanged.bind(this));
        // this.rejected.addEventListener('change', this.filterChanged.bind(this));
        this.filterActive = true;
        this.filterChangedCallback = params.filterChangedCallback;
        

        // console.log(this.approved)
    }

    showAll(){
        // this.draft.checked = true;
        this.pending.checked = true;
        // this.returned.checked = true;
        this.approved.checked = true;
        // this.rejected.checked = true;

        this.filterChangedCallback();
    }

    filterChanged() {
        this.filterChangedCallback();
    }

    getGui() {
        return this.eGui;
    }

    doesFilterPass(params) {
        let text = []
        // if(this.draft.checked==true)text.push('draft')
        if(this.pending.checked==true)text.push('pending')
        // if(this.rejected.checked==true)text.push('returned')
        if(this.approved.checked==true)text.push('approved')
        // if(this.rejected.checked==true)text.push('rejected')
        return !!text.find(el=>el==params.data.draft_status);
    }

    isFilterActive() {
        return this.filterActive;
    }
}