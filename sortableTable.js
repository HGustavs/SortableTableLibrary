// Keep track of Currently active Table and all sortable tables
var sortableTable = {
    currentTable:null,
    sortableTables:[],
    edit_rowno:-1,
    edit_rowid:null,
    edit_row:null,
    edit_columnno:-1,
    edit_columnname:null,
    edit_tableid:null,
}

var DELIMITER="___";

function byString(inpobj,paramstr){
		params=paramstr.split(".");
		return inpobj[params[1]];
}

function searchKeyUp(e)
{
	// look for window.event in case event isn't passed in
    e = e || window.event;
    if (e.keyCode == 13) {
        document.getElementById('searchbutton').click();
        return false;
    }
    return true;
}

function keypressHandler(event)
{
    if (event.keyCode == 13) updateCellInternal();
    if (event.keyCode == 27) clearUpdateCellInternal();
}

function defaultRowFilter()
{
	return true;
}

// Global sorting function global
function sortableInternalSort(a,b)
{
	var ret = 0;
    //var colname = sortableTable.currentTable.getKeyByValue();
    var colname = sortableTable.currentTable.getSortcolumn();
    
	if ((sortableTable.currentTable.sortkind % 2)==0) {
		ret = compare(a[colname],b[colname]);
	} else {
		ret = compare(b[colname],a[colname]);
	}
	return ret;
}

changePage=function(tblid,p)
{
    for (var i = 0; i < sortableTable.sortableTables.length; i++) {
        let t=sortableTable.sortableTables[i];
        if (t.tableid == tblid) {
            if(typeof(p)==="undefined")p=1;
            t.selectedPage=p;
            t.renderTable();
        }
    }
}

function clearUpdateCellInternal()
{
    sortableTable.edit_rowno =- 1;
    sortableTable.edit_rowid =null;
    sortableTable.edit_columnno =- 1;
    sortableTable.edit_columnname = null;
    sortableTable.edit_tableid = null;
    sortableTable.edit_celldata = null;
    document.getElementById('editpopover').style.display = "none";
}

function updateCellInternal()
{
    for (var i = 0; i < sortableTable.sortableTables.length; i++) {
        if (sortableTable.sortableTables[i].tableid == sortableTable.edit_tableid) {
            sortableTable.sortableTables[i].updateCell();
        }
    }
    clearUpdateCellInternal();
}

// clickedInternal
function clickedInternal(event,clickdobj)
{
  let clickedTbl=event.target.closest("table").id.substring(0,event.target.closest("table").id.indexOf(DELIMITER+"tbl"));
  let active=null;
  for (let i=0;i<sortableTable.sortableTables.length;i++){
      if(sortableTable.sortableTables[i].tableid==clickedTbl){
          active=sortableTable.sortableTables[i];
          break;
      }
  }
  sortableTable.currentTable=active;
  
	if (sortableTable.currentTable.showEditCell != null) {
		var cellelement = event.target.closest("td");
    var rowelement = event.target.closest("tr");
		var match=cellelement.id.split(DELIMITER);
    var rowno = match[0].substr(1);
    var columnno = null; // Not used anymore
    var tableid = match[1];
    var columnname=match[2]
    var str = ""; 
    var rowdata = sortableTable.currentTable.getRow(rowno); 
    var coldata = rowdata[columnname]; 
    
    sortableTable.edit_rowno = rowno;
    sortableTable.edit_row = rowdata;
    sortableTable.edit_columnno = columnno;
    sortableTable.edit_columnname = columnname;
    sortableTable.edit_tableid = tableid;
    sortableTable.edit_celldata = coldata;
    var estr=sortableTable.currentTable.showEditCell(coldata,rowno,rowelement,cellelement,columnname,columnno,rowdata,coldata,tableid);
    if(estr!==false){
      str+= "<div id='input-container' style='flex-grow:1'>";
      str+= estr;
      str+="</div>";
			str+="<span id='popovertick' class='icon' onclick='updateCellInternal();' >";
			str+="<svg version='1.1' id='Layer_1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' x='0px' y='0px' viewBox='0 0 79.5 79.2' enable-background='new 0 0 79.5 79.2' xml:space='preserve'><path id='Tick' fill='#006838' d='M27.9,57C39.2,40.2,50,24.3,60.7,8.3c1-1.5,1.9-3.1,3.1-4.5c3.2-4,7.5-4.9,11.4-2.3c3.7,2.4,4.9,7.2,2.2,11.4c-5.1,8-10.5,15.8-15.8,23.6c-8.2,12.1-16.3,24.3-24.5,36.3c-4.6,6.7-9.3,7.1-15,1.3C15.8,67.9,9.6,61.7,3.4,55.4c-4.1-4.2-4.4-8.7-1-12.3c3.3-3.4,8.5-3.3,12.4,0.6C19.1,47.8,23.2,52.2,27.9,57z'/></svg>";
			str+="</span>";
      str+="<span id='popovercross' class='icon' onclick='clearUpdateCellInternal();' >";
			str+="<svg version='1.1' id='Layer_1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' x='0px' y='0px' viewBox='0 0 79.5 79.2' enable-background='new 0 0 79.5 79.2' xml:space='preserve'><path id='Cross' fill='#BE1E2D' d='M67.4,57.6c-6-6.2-12.1-12.3-18.2-18.6c6.1-6.2,12.1-12.4,18.2-18.6c1.3-1.3,2.6-2.5,3.8-3.9	c3.3-3.9,3.2-8.4,0-11.7c-3.2-3.2-8-3.3-11.6,0.2c-6.8,6.6-13.3,13.5-19.9,20.2c-0.6,0.6-1.2,1.2-1.7,1.8c-0.6-0.6-1.2-1.2-1.7-1.8	c-6.6-6.8-13.1-13.6-19.9-20.2C12.7,1.6,7.8,1.8,4.7,4.9c-3.3,3.3-3.3,7.7,0,11.7c1.2,1.4,2.5,2.6,3.8,3.9	c6,6.2,12.1,12.3,18.2,18.6c-6.1,6.2-12.1,12.4-18.2,18.6c-1.3,1.3-2.6,2.5-3.8,3.9c-3.3,3.9-3.2,8.4,0,11.7c3.2,3.2,8,3.3,11.6-0.2	c6.8-6.6,13.3-13.5,19.9-20.2c0.6-0.6,1.2-1.2,1.7-1.8c0.6,0.6,1.2,1.2,1.7,1.8c6.6,6.8,13.1,13.6,19.9,20.2	c3.6,3.5,8.5,3.3,11.6,0.2c3.3-3.3,3.3-7.7,0-11.7C70.1,60.2,68.7,59,67.4,57.6z'/></svg>";
			str+="</span>";
			
      var lmnt = cellelement.getBoundingClientRect();
      var popoverelement = document.getElementById("editpopover");
  
      popoverelement.innerHTML = str;
      var popoveredit = document.getElementById("popoveredit");
      var xscroll = window.pageXOffset;
      var yscroll = window.pageYOffset;
  
      popoverelement.style.left = Math.round(lmnt.left+xscroll)+"px";
      popoverelement.style.top = Math.round(lmnt.top+yscroll)+"px";
      popoverelement.style.minHeight = (Math.round(lmnt.height)-5)+"px";
      popoverelement.style.maxWidth = "fit-content";
      popoverelement.style.display = "flex";  
    }
	}
}

// We call all highlights in order to allow hover of non-active tables
function rowHighlightInternal(event,row)
{
    var arr = row.id.split(DELIMITER);
    var rowno = parseInt(arr[1]);
    var centerel = event.target.closest("td");
    for (var i = 0; i < sortableTable.sortableTables.length; i++) {
        if (sortableTable.sortableTables[i].highlightRow != null) {
            sortableTable.sortableTables[i].highlightRow(row.id,rowno,centerel.className,centerel);
        }
    }
}

// We call all deHighlights in order to allow hover of non-active tables
function rowDeHighlightInternal(event,row)
{
    var arr = row.id.split(DELIMITER);
  	var rowno = parseInt(arr[1]);
  	var centerel = event.target.closest("td");
  	for (var i = 0; i < sortableTable.sortableTables.length; i++) {
    		if (sortableTable.sortableTables[i].deHighlightRow != null) {
            sortableTable.sortableTables[i].deHighlightRow(row.id,rowno,centerel.className,centerel);
    		}
    }
}

// https://stackoverflow.com/questions/13708590/css-gradient-colour-stops-from-end-in-pixels

function defaultRowHighlightOn(rowid,rowno,colclass,centerel)
{    
    rowid=rowid.replace(DELIMITER+"mhv","");
		document.getElementById(rowid).classList.add("highrowSortable");
    if(this.hasMagicHeadings){
        document.getElementById(rowid+DELIMITER+"mhv").classList.add("highrowSortable");
    }
		
		colElements=document.getElementsByClassName(colclass);
		for (var i=0; i<colElements.length; i++) {
    		colElements[i].classList.add("highcolSortable");
		}

		colElements=document.getElementsByClassName(colclass+"th");
		for (var i=0; i<colElements.length; i++) {
				colElements[i].classList.add("highcolSortableHead");
		}
	
		centerel.classList.add("highcellSortable");
}

function defaultRowHighlightOff(rowid,rowno,colclass,centerel)
{
    rowid=rowid.replace(DELIMITER+"mhv","");
		document.getElementById(rowid).classList.remove("highrowSortable");
    if(this.hasMagicHeadings){
        document.getElementById(rowid+DELIMITER+"mhv").classList.remove("highrowSortable");
    }

		colElements=document.getElementsByClassName(colclass);
		for (var i=0; i<colElements.length; i++) {
    		colElements[i].classList.remove("highcolSortable");
		} 
	
		colElements=document.getElementsByClassName(colclass+"th");
		for (var i=0; i<colElements.length; i++) {
				colElements[i].classList.remove("highcolSortableHead");
		}	

		centerel.classList.remove("highcellSortable");
}

// Checks if parameter has been defined and returns default if not
function getparam(param,def)
{
    if(typeof param === "undefined"){
				return def;
		}
		return param;
}

function SortableTable(param)
{
		//------------==========########### Fenced paramters ###########==========------------    
		
    var tbl = getparam(param.data,{tblhead:{},tblbody:[],tblfoot:{}});
    this.tableid = getparam(param.tableElementId,"UNK");
    var filterid = getparam(param.filterElementId,"UNK");	
    var caption = getparam(param.tableCaption,"UNK");
    var renderCell = getparam(param.renderCellCallback,null);
    var exportCell = getparam(param.exportCellCallback,null);
    var exportColumnHeading = getparam(param.exportColumnHeadingCallback,null);
    var renderSortOptions = getparam(param.renderSortOptionsCallback,null);
    var renderColumnFilter = getparam(param.renderColumnFilterCallback,null);
    var rowFilter = getparam(param.rowFilterCallback,defaultRowFilter);
    var columnOrder = getparam(param.columnOrder,[]);
    var colsumList = getparam(param.columnSum,[]);
    var rowsumList = getparam(param.rowSum,[]);
  	var sumFunc = getparam(param.columnSumCallback,null);
    var freezePaneIndex = getparam(param.freezePaneIndex,-1);
		var emailColumn = getparam(param.emailColumn, null);	
		this.hasRowHighlight = getparam(param.hasRowHighlight,false);
    this.highlightRow = getparam(param.rowHighlightOnCallback,defaultRowHighlightOn);
    this.deHighlightRow = getparam(param.rowHighlightOffCallback,defaultRowHighlightOff);
		this.showEditCell = getparam(param.displayCellEditCallback,null);
    this.updateCell = getparam(param.updateCellCallback,null);
		this.hasMagicHeadings = getparam(param.hasMagicHeadings,false);
    this.hasCounter = getparam(param.hasCounterColumn,false);
    this.rowsPerPage = getparam(param.rowsPerPage,0);
    this.selectedPage=1;
    this.postFilterCallback=getparam(param.postFilterCallback,null);

		// Prepare head and order with columns from rowsum list
		for(let i=0;i<rowsumList.length;i++){
        tbl.tblhead[rowsumList[i][0]['id']]=rowsumList[i][0]['name'];
        columnOrder.push(rowsumList[i][0]['id']);
    }
        
    //------------==========########### Private member variables ###########==========------------        
    var result = 0;
    var columnfilter = [];
    var sortcolumn = "UNK";
    var sortkind = -1;
    var windowWidth=window.innerWidth;

		//all visible rows will be stored to this array
		var filteredRows = []; 	
    
    // Keeps track of the last picked sorting order
    var tableSort;
    var colSort;
    var reverseSort;    
    //var freezePane = freezePane;
    //var freezePaneArr = [];
        
    // Local variables that contain html code for main table and local variable that contains magic headings table
    var str = "", mhstr = "", mhvstr = "",  mhfstr = "";

    // Check if we already have this tableid if so ... splice (replace) else push (add)
    let isNewTable=true;
    for(let i=0;i<sortableTable.sortableTables.length;i++){
        let tmptbl=sortableTable.sortableTables[i];
        if(tmptbl.tableid === this.tableid){
            isNewTable=false;
            sortableTable.sortableTables.splice(i,1,this);
            break;
        }
    }
    if(isNewTable){
        sortableTable.sortableTables.push(this);
    }

    this.getRow = function(rowno) {
        return tbl.tblbody[rowno];
    }

    this.renderTable = function() {

    	this.rowIndex = 1;
    	// Local variable that contains html code for main table and local variable that contains magic headings table
    	str = "<table style='border-collapse: collapse;' id='"+this.tableid+DELIMITER+"tbl' class='list list--nomargin'>";
    	mhstr = "<table style='table-layout:fixed;border-collapse: collapse;position:fixed;top:0px;left:0px;z-index:2000;margin-top:0px;border-bottom:none;background-color:ffffff' class='list' id='"+this.tableid+DELIMITER+"tbl"+DELIMITER+"mh'>";
    	mhvstr = "<table style='table-layout:fixed;border-collapse: collapse;position:fixed;left:0px;z-index:1000;background-color:ffffff' id='"+this.tableid+DELIMITER+"tbl"+DELIMITER+"mhv'>";
    	mhfstr = "<table style='table-layout:fixed;border-collapse: collapse;position:fixed;left:0px;top:0px;z-index:3000;background-color:ffffff' id='"+this.tableid+DELIMITER+"tbl"+DELIMITER+"mhf'>";

      // Local variable that contains summing array
    	var sumContent = [];

    	// Assign currently active table
    	sortableTable.currentTable = this;
      if(localStorage.getItem(this.tableid+DELIMITER+"filtercolnames")===null){
          columnfilter=[];
      }else{
          columnfilter = JSON.parse(localStorage.getItem(this.tableid+DELIMITER+"filtercolnames"));
      }    	
      var filterstr="";
      var columnOrderIdx;
      for (columnOrderIdx=0;columnOrderIdx<columnOrder.length;columnOrderIdx++){
          if(!(columnfilter[columnOrderIdx]===null||columnfilter[columnOrderIdx]===columnOrder[columnOrderIdx])){
              break;
          }
          if (renderColumnFilter != null) filterstr += renderColumnFilter(columnOrder[columnOrderIdx],columnfilter[columnOrderIdx],tbl.tblhead[columnOrder[columnOrderIdx]]);
      }          
          
      for (;columnOrderIdx<columnOrder.length;columnOrderIdx++){
          columnfilter[columnOrderIdx]=columnOrder[columnOrderIdx];
          if (renderColumnFilter != null) filterstr += renderColumnFilter(columnOrder[columnOrderIdx],columnfilter[columnOrderIdx],tbl.tblhead[columnOrder[columnOrderIdx]]);
      }
      localStorage.setItem(this.tableid+DELIMITER+"filtercolnames",JSON.stringify(columnfilter));
			
			// Retrieve sort column from local storage if we have one
      if(localStorage.getItem(this.tableid+DELIMITER+"sortcol")!==null){
					var tmpsortcolumn = localStorage.getItem(this.tableid+DELIMITER+"sortcol");

					// Check that the sorting column is visible, if not, clear it.
				
					if(columnfilter.indexOf(tmpsortcolumn)>-1){
							sortcolumn=tmpsortcolumn;
							sortkind=parseInt(localStorage.getItem(this.tableid+DELIMITER+"sortkind"));
					}else{
							sortcolumn="UNK";
							sortkind=-1;
					}
      }   
			
    	// Sort the body of the table again
    	tbl.tblbody.sort(sortableInternalSort);
			
      if (renderColumnFilter != null) {
    		  document.getElementById(filterid).innerHTML = filterstr;
    	}

      if(caption!=="UNK"){
          str += "<caption>"+caption+"</caption>";  
      }    	

    	// Make headings Clean Contains headings using only A-Z a-z 0-9 ... move to function removes lines of code and removes redundant code/data!?
      str += "<thead class='listHeading' id='"+this.tableid+DELIMITER+"tblhead'><tr>";
      mhstr += "<thead class='listHeading' id='"+this.tableid+DELIMITER+"tblhead_mh'><tr>";
      mhvstr += "<thead class='listHeading' id='"+this.tableid+DELIMITER+"tblhead_mhv'><tr>";
      mhfstr += "<thead class='listHeading' id='"+this.tableid+DELIMITER+"tblhead_mhf'><tr>";

    	var deli=DELIMITER+this.tableid+DELIMITER;
			var delitbl=deli+"tbl"+DELIMITER;

    	// Add Column for counter if the sortabletable should have a counter column.
    	if(this.hasCounter) {
          str += "<th style='white-space:nowrap;' id='counter"+deli+"tbl' class='"+this.tableid+"'></th>";
          mhstr += "<th style='white-space:nowrap;' id='counter"+delitbl+"mh' class='"+this.tableid+"'></th>";
          mhvstr += "<th style='white-space:nowrap;' id='counter"+delitbl+"mhv' class='"+this.tableid+"'></th>";
          mhfstr += "<th style='white-space:nowrap;' id='counter"+delitbl+"mhf' class='"+this.tableid+"'></th>";
      }
      for(var columnOrderIdx=0;columnOrderIdx<columnOrder.length;columnOrderIdx++){
      		var colname=columnOrder[columnOrderIdx];
          var col=tbl.tblhead[colname];
          
      		if (columnfilter[columnOrderIdx] !== null) {
        			if (renderSortOptions !== null) {
									if (columnOrderIdx < freezePaneIndex) {
												if (colname == sortcolumn){
														mhfstr += "<th title='Click to change sort order' style='white-space:nowrap;' id='"+colname+delitbl+"mhf' class='"+this.tableid+"-"+colname+"thhighli'>"+renderSortOptions(colname,sortkind,col)+"</th>";
														mhvstr += "<th title='Click to change sort order' style='white-space:nowrap;' id='"+colname+delitbl+"mhv' class='"+this.tableid+"-"+colname+"th'>"+renderSortOptions(colname,sortkind,col)+"</th>";
												} else {
														mhfstr += "<th title='Click to change sort order' style='white-space:nowrap;' id='"+colname+delitbl+"mhf' class='"+this.tableid+"-"+colname+"th'>"+renderSortOptions(colname,-1,col)+"</th>";
														mhvstr += "<th title='Click to change sort order' style='white-space:nowrap;' id='"+colname+delitbl+"mhv' class='"+this.tableid+"-"+colname+"th'>"+renderSortOptions(colname,-1,col)+"</th>";
												}
									}
									if (colname == sortcolumn) {
												str += "<th title='Click to change sort order' style='white-space:nowrap;' id='"+colname+deli+"tbl' class='"+this.tableid+"-"+colname+"th'>"+renderSortOptions(colname,sortkind,col)+"</th>";
												mhstr += "<th title='Click to change sort order' style='white-space:nowrap;' id='"+colname+delitbl+"mh' class='"+this.tableid+"-"+colname+"th'>"+renderSortOptions(colname,sortkind,col)+"</th>";
									} else {
												str += "<th title='Click to change sort order' style='white-space:nowrap;' id='"+colname+deli+"tbl' class='"+this.tableid+"-"+colname+"th'>"+renderSortOptions(colname,-1,col)+"</th>";
												mhstr += "<th title='Click to change sort order' style='white-space:nowrap;' id='"+colname+delitbl+"mh' class='"+this.tableid+"-"+colname+"th'>"+renderSortOptions(colname,-1,col)+"</th>";
									}
        			} else {
          				if (columnOrderIdx < freezePaneIndex) {                    
          				 	if (colname == sortcolumn){
          				 		mhfstr += "<th title='Click to change sort order' style='white-space:nowrap;' id='"+colname+delitbl+"mhf' class='"+this.tableid+"-"+colname+"th'>"+col+"</th>";
          				 		mhvstr += "<th title='Click to change sort order' style='white-space:nowrap;' id='"+colname+delitbl+"mhv' class='"+this.tableid+"-"+colname+"th'>"+col+"</th>";
          				 	} else {
          				 		mhfstr += "<th title='Click to change sort order' style='white-space:nowrap;' id='"+colname+delitbl+"mhf' class='"+this.tableid+"-"+colname+"th'>"+col+"</th>";
          				 		mhvstr += "<th title='Click to change sort order' style='white-space:nowrap;' id='"+colname+delitbl+"mhv' class='"+this.tablid+"-"+colname+"th'>"+col+"</th>";
          				 	}
          				}
          				if (col != "move") {
          					str += "<th title='Click to change sort order' style='white-space:nowrap;' id='"+colname+deli+"tbl' class='"+this.tableid+"-"+colname+"th'>"+col+"</th>";
          					mhstr += "<th title='Click to change sort order' style='white-space:nowrap;' id='"+colname+delitbl+"mh' class='"+this.tableid+"-"+colname+"th'>"+col+"</th>";
          				}
        			}
          }
    	}
      
    	str += "</tr></thead>";
    	mhstr += "</tr></thead></table>";
    	mhfstr += "</tr></thead></table>";

    	// Render table body
    	str += "<tbody id='"+this.tableid+DELIMITER+"body'>";
      mhvstr += "<tbody id='"+this.tableid+DELIMITER+"mhvbody'>";
      filteredRows=[];
    	for (var i = 0; i < tbl.tblbody.length; i++) {
      		var row = tbl.tblbody[i];
      		if (rowFilter(row)) {
							filteredRows.push(row);
              
							if(this.rowsPerPage===0 || (filteredRows.length<=(this.selectedPage*this.rowsPerPage)&&filteredRows.length>((this.selectedPage-1)*this.rowsPerPage))){
                str += "<tr id='"+this.tableid+DELIMITER+i+"'"
                if (this.hasRowHighlight) str+=" onmouseover='rowHighlightInternal(event,this)' onmouseout='rowDeHighlightInternal(event,this)'";
                str+=" style='box-sizing:border-box;'>";
                mhvstr += "<tr id='"+this.tableid+DELIMITER+i+DELIMITER+"mhv' onmouseover='rowHighlightInternal(event,this)' onmouseout='rowDeHighlightInternal(event,this)' style='box-sizing:border-box;' class='"+this.tableid+DELIMITER+"tbl"+DELIMITER+"mhvbodyrow' >";

                // Add Counter cell to the row. The class <tableid>_counter can be used to style the counterText
                if(this.hasCounter) {
                    str += "<td style='white-space:nowrap;' onclick='clickedInternal(event,this);' class='" + this.tableid + DELIMITER+"counter'><span>"+ ((this.selectedPage-1)*this.rowsPerPage+this.rowIndex) +"</span></td>";
                    mhvstr += "<td style='white-space:nowrap;' onclick='clickedInternal(event,this);' class='" + this.tableid + DELIMITER+"counter'><span>"+ ((this.selectedPage-1)*this.rowsPerPage+this.rowIndex++) +"</span></td>";
                }
                result++;
                for(var columnOrderIdx=0;columnOrderIdx<columnOrder.length;columnOrderIdx++){
                  if (columnfilter[columnOrderIdx] !== null) {
                      // check if this column is a row-sum column
                      for (let j=0;j<rowsumList.length;j++){                      
                          if (columnOrder[columnOrderIdx].indexOf(rowsumList[j][0]['id'])>-1) {
                              tbl.tblbody[i][columnOrder[columnOrderIdx]]=0;
                              for(let k=1;k<rowsumList[j].length;k++){                                
                                  if (typeof(tbl.tblbody[i][rowsumList[j][k].substring(0,rowsumList[j][k].indexOf('.'))])==='object'){
                                      tbl.tblbody[i][columnOrder[columnOrderIdx]]+=parseFloat(byString(tbl.tblbody[i][rowsumList[j][k].substring(0,rowsumList[j][k].indexOf('.'))],rowsumList[j][k]));
                                  }else{
                                      tbl.tblbody[i][columnOrder[columnOrderIdx]]+=parseFloat(tbl.tblbody[i][rowsumList[j][k]]);
                                  } 
                                  
                              }                  						
                          }
                      }
                    
                      // This condition is true if column is in summing list and in that case perform the sum like a BOSS
                      if (colsumList.indexOf(columnOrder[columnOrderIdx]) >- 1) {
                          if (typeof(sumContent[columnOrder[columnOrderIdx]]) == "undefined") sumContent[columnOrder[columnOrderIdx]]=0;
                          sumContent[columnOrder[columnOrderIdx]]+=sumFunc(columnOrder[columnOrderIdx],tbl.tblbody[i][columnOrder[columnOrderIdx]],row);
                      }
                        
                      var cellid = "r"+i+deli+columnOrder[columnOrderIdx];
                      str += "<td style='white-space:nowrap;' id='"+cellid+"' onclick='clickedInternal(event,this);' class='"+this.tableid+"-"+columnOrder[columnOrderIdx]+"'>"+renderCell(columnOrder[columnOrderIdx],tbl.tblbody[i][columnOrder[columnOrderIdx]],cellid)+"</td>";  
                      if(columnOrderIdx<freezePaneIndex){
                          mhvstr+="<td style='white-space:nowrap;' id='"+cellid+DELIMITER+"mhv' onclick='clickedInternal(event,this);' class='"+this.tableid+"-"+columnOrder[columnOrderIdx]+"'>"+renderCell(columnOrder[columnOrderIdx],tbl.tblbody[i][columnOrder[columnOrderIdx]],cellid)+"</td>";  
                      }
                  }
              }
              str += "</tr>";
              mhvstr += "</tr>";
            }
          }
    	}

      // Must be directly after the filtering!
      if(this.postFilterCallback!==null)this.postFilterCallback(tbl.tblbody.length,filteredRows.length);
			
			str += "</tbody>";
      mhvstr += "</tbody>";
      mhvstr += "<tfoot style='border-top:2px solid #000'>";
      mhvstr += "<tr style='font-style:italic;'>";
      str += "<tfoot style='border-top:2px solid #000'>";
      str += "<tr style='font-style:italic;'>";

      if(this.hasCounter) {
          str += "<td>&nbsp;</td>";
          mhvstr += "<td>&nbsp;</td>";
      }
      for(var columnOrderIdx=0;columnOrderIdx<columnOrder.length;columnOrderIdx++){
          if (columnfilter[columnOrderIdx] !== null) {
              if (typeof(sumContent[columnOrder[columnOrderIdx]])!=='undefined') {
                  str += "<td style='whitespace:nowrap;'>"+sumContent[columnOrder[columnOrderIdx]]+"</td>";
                  if (columnOrderIdx < freezePaneIndex) {
                      mhvstr += "<td style='whitespace:nowrap;'>"+sumContent[columnOrder[columnOrderIdx]]+"</td>";                  
                  }
              }else{
                  str += "<td>&nbsp;</td>";
                  if (columnOrderIdx < freezePaneIndex) {
                      mhvstr += "<td>&nbsp;</td>";
                  }
              }          
          }
      }

      str+= "</tr></tfoot>";
      mhvstr+= "</tr></tfoot>";
    	str += "</table>";
    	mhvstr+= "</table>";

    	this.magicHeader();
      freezePaneHandler();

    }

    this.toggleColumn = function(colname,col) {
    	// Assign currently active table
    	sortableTable.currentTable = this;
      for(var idx=0;idx<columnOrder.length;idx++){
          if(columnOrder[idx]===colname){
              if(columnfilter[idx]){
                  columnfilter[idx]=null;
              }else{
                  columnfilter[idx]=columnOrder[idx];
              }
          }
      }
    	localStorage.setItem(this.tableid+DELIMITER+"filtercolnames", JSON.stringify(columnfilter));

    	this.renderTable();
    }

    this.toggleSortStatus = function(col,kind) {
    	// Assign currently active table
    	sortableTable.currentTable = this;

			// Save column name to local storage!
			localStorage.setItem(this.tableid+DELIMITER+"sortcol",col);
			localStorage.setItem(this.tableid+DELIMITER+"sortkind",kind);
			
    	sortcolumn = col;
    	sortkind = kind;
			
    	this.renderTable();
    }

    this.getKeyByValue = function() {
      	return Object.keys(tbl.tblhead).find(key => tbl.tblhead[key] === sortcolumn);
    }

    this.getSortcolumn = function() {
        return sortcolumn;
    }

    this.getSortkind = function() {
        return sortkind;
    }

    this.magicHeader = function() {
    	// Assign table and magic headings table(s)
    	//this.hasMagicHeadings=false;
			if (this.hasMagicHeadings) {
      		document.getElementById(this.tableid).innerHTML = str+mhstr+mhvstr+mhfstr;          
      		document.getElementById(this.tableid+DELIMITER+"tbl"+DELIMITER+"mh").style.width=document.getElementById(this.tableid+DELIMITER+"tbl").getBoundingClientRect().width+"px";
      		document.getElementById(this.tableid+DELIMITER+"tbl"+DELIMITER+"mh").style.boxSizing = "border-box";
      		children=document.getElementById(this.tableid+DELIMITER+"tbl").getElementsByTagName('TH');
      		for (i = 0; i < children.length; i++) {
        			document.getElementById(children[i].id+DELIMITER+"mh").style.width = children[i].getBoundingClientRect().width+"px";
        			document.getElementById(children[i].id+DELIMITER+"mh").style.boxSizing = "border-box";
      		}

      		document.getElementById(this.tableid+DELIMITER+"tbl"+DELIMITER+"mhf").style.width = Math.round(document.getElementById(this.tableid+DELIMITER+"tbl"+DELIMITER+"mhv").getBoundingClientRect().width)+"px";
      		document.getElementById(this.tableid+DELIMITER+"tbl"+DELIMITER+"mhf").style.boxSizing = "border-box";
      		children=document.getElementById(this.tableid+DELIMITER+"tbl"+DELIMITER+"mhv").getElementsByTagName('TH');

      		for (i = 0; i < children.length; i++) {
        			document.getElementById(children[i].id.slice(0, -1)+"f").style.width = children[i].getBoundingClientRect().width+"px";
        			document.getElementById(children[i].id.slice(0, -1)+"f").style.boxSizing = "border-box";
      		}
          document.getElementById(this.tableid+DELIMITER+"tblhead_mh").style.height = Math.round(document.getElementById(this.tableid+DELIMITER+"tblhead").getBoundingClientRect().height)+"px";
          document.getElementById(this.tableid+DELIMITER+"tblhead_mhv").style.height = Math.round(document.getElementById(this.tableid+DELIMITER+"tblhead").getBoundingClientRect().height)+"px";
          document.getElementById(this.tableid+DELIMITER+"tblhead_mhf").style.height = Math.round(document.getElementById(this.tableid+DELIMITER+"tblhead").getBoundingClientRect().height)+"px";
			} else {
    		  document.getElementById(this.tableid).innerHTML = str;
    	}

    	if (tableSort != null) {
    		  sortTable(tableSort, colSort, reverseSort);
      }

      if(this.rowsPerPage>0){
        this.renderPagination();
      }        		
    }

    setInterval(freezePaneHandler,30);
    function freezePaneHandler() {
      	// Hide magic headings and find minimum overdraft
      	for (var i = 0; i < sortableTable.sortableTables.length; i++) {
        		var table = sortableTable.sortableTables[i];
        		if (table.hasMagicHeadings) {
                if (window.innerWidth != windowWidth){windowWidth=window.innerWidth;table.renderTable()}
          			if (document.getElementById(table.tableid+DELIMITER+"tbl") != null) {
            				var thetab = document.getElementById(table.tableid+DELIMITER+"tbl").getBoundingClientRect();
                    var thetabhead = document.getElementById(table.tableid+DELIMITER+"tblhead").getBoundingClientRect();
            				// If top is negative and top+height is positive draw mh otherwise hide
            				// Vertical
            				if (thetabhead.top < 0 && thetab.bottom > 0) {
              					document.getElementById(table.tableid+DELIMITER+"tbl"+DELIMITER+"mh").style.left = thetab.left+"px";
              					document.getElementById(table.tableid+DELIMITER+"tbl"+DELIMITER+"mh").style.display = "table";
            				}
            				 else {
                        document.getElementById(table.tableid+DELIMITER+"tbl"+DELIMITER+"mh").style.display = "none";
            				}
            				// Horizontal
            				if (thetab.left < 0 && thetab.right > 0) {
              					document.getElementById(table.tableid+DELIMITER+"tbl"+DELIMITER+"mhv").style.top = thetabhead.top+"px";
              					document.getElementById(table.tableid+DELIMITER+"tbl"+DELIMITER+"mhv").style.display = "table";
            				}
            				else {
                        document.getElementById(table.tableid+DELIMITER+"tbl"+DELIMITER+"mhv").style.display = "none";
            				}

            				// Fixed
            				if (thetab.left < 0 && thetab.right > 0 && thetabhead.top < 0 && thetab.bottom > 0) {
                        document.getElementById(table.tableid+DELIMITER+"tbl"+DELIMITER+"mhf").style.display = "table";
            				}
            				else {
                        document.getElementById(table.tableid+DELIMITER+"tbl"+DELIMITER+"mhf").style.display = "none";
            				}
										var srctbl=document.getElementById(table.tableid+DELIMITER+"body").children;
                    var desttbl=document.getElementById(table.tableid+DELIMITER+"mhvbody").children;
										for(let j=0;j<srctbl.length;j++){
                        desttbl[j].style.height=srctbl[j].getBoundingClientRect().height+"px";
										}
																											 
								}
        		}
      	}
    }
		
	
    this.updateCell = function() {
        tbl.tblbody[sortableTable.edit_rowno][sortableTable.edit_columnname] = updateCellCallback(sortableTable.edit_rowno,null,sortableTable.edit_columnname,sortableTable.edit_tableid,null,sortableTable.edit_rowid);
        this.renderTable();
    }

    this.getColumnOrder=function(){
        return columnOrder;
    }

    this.reorderColumns=function(newOrderList){        
        if(Array.isArray(newOrderList)){
            columnOrder=newOrderList;
            this.renderTable();          
        }
    }

    this.export=function(format)
    {
        var str="";
        for(let k=0;k<columnOrder.length;k++){
            if(k!==0)str+=",";
            str+=exportColumnHeading(format,tbl.tblhead[columnOrder[k]],columnOrder[k]);
        }
        str+="\n";        
        for(let i=0;i<tbl.tblbody.length; i++) {
            let row=tbl.tblbody[i];
            for(let k=0;k<columnOrder.length;k++){                
                let colname=columnOrder[k];
                if(k!==0)str+=",";
                str+=exportCell(format,row[colname],colname);
            }
            str+="\n";
          }
        return str;
    }

		// Mail input subject and body
		this.mail = function(subjectline,bodytext) {
			
			if(emailColumn!=null){
					var filteredUsernames = "";
					//get usernames of the filtered rows

					// generic: ['FnameLname'].username -> [this.emailColumn] -- We check if emailColumn is set if not we do nothing
				
					for(var i = 0; i < filteredRows.length; i++){ 
							if(typeof filteredRows[i][emailColumn] !== 'undefined'){
								if(i>0) filteredUsernames+=";";
								filteredUsernames+=filteredRows[i][emailColumn];
							}
					}
					var data=";&subject="+encodeURIComponent(subjectline)+"&body="+encodeURIComponent(bodytext);

					window.location.assign("mailto:?bcc="+filteredUsernames+data);
			}
		}

    this.renderPagination=function()
    {
        if(this.rowsPerPage>0){
            let str="";
            let cls="";
            let pages=Math.ceil(filteredRows.length/this.rowsPerPage)
            for(let i=1;i<=pages;i++){
                if(i===this.selectedPage){
                    cls="pagination-btn pagination-btn-selected";
                }else{
                    cls="pagination-btn";
                }
                str+="<span class='"+cls+"' style='white-space: nowrap' onclick='changePage(\""+this.tableid+"\","+i+")'>Page "+i+"</span>";
            }
            if(document.getElementById(this.tableid+"-number-of-pages")===null){
                document.getElementById(this.tableid).outerHTML='<div style="overflow:auto;padding:10px 0 10px 0;"><span id="'+this.tableid+'-number-of-pages"></span></div>'+document.getElementById(this.tableid).outerHTML;
            }   
            if(document.getElementById(this.tableid+"-number-of-pages-bottom")===null){
                document.getElementById(this.tableid).outerHTML=document.getElementById(this.tableid).outerHTML+'<div style="overflow:auto;padding:10px 0 10px 0;"><span id="'+this.tableid+'-number-of-pages-bottom"></span></div>';
            }   
            
            document.getElementById(this.tableid+"-number-of-pages").innerHTML=str;
            document.getElementById(this.tableid+"-number-of-pages-bottom").innerHTML=str;
        }
    }

}