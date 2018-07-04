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

// Help function to get property value from object based on string in dot-format
//
// var obj = {trumma:{xk:30,yk:25.0}}
// var str = "trumma.xk"
// 
// consol.log(byString(obj,str))
// will print '30' to console
// if property is NaN the function returns 0
function byString(o, s) {
    s = s.replace(/\[(\w+)\]/g, '.$1'); // convert indexes to properties
    var a = s.split('.');
    for (var i = 1, n = a.length; i < n; ++i) {
        var k = a[i];
        if (typeof(o)==='object'){
            if (k in o) {              
                o = o[k];
            } else {
                return 0;
            }          
        }else{
            return 0;
        }
    }
    if(typeof(o)!=='number')o=0;
    return o;
}

function searchKeyUp(e) {
	// look for window.event in case event isn't passed in
    e = e || window.event;
    if (e.keyCode == 13) {
        document.getElementById('searchbutton').click();
        return false;
    }
    return true;
}

function keypressHandler(event) {
    if (event.keyCode == 13) {
        updateCellInternal();
    } else if(event.keyCode == 27) {
        clearUpdateCellInternal();
    }
}

function defaultRowFilter() {
	return true;
}

// Global sorting function global
function sortableInternalSort(a,b) {
	var ret = 0;
    //var colname = sortableTable.currentTable.getKeyByValue();
    var colname = sortableTable.currentTable.getSortcolumn();
    
	if (sortableTable.currentTable.ascending) {
		//alert("Compare: "+a+" "+b);
		ret = compare(a[colname],b[colname]);
	} else {
		//alert("Compare: "+b+" "+a);
		ret = compare(b[colname],a[colname]);
	}
	return ret;
}

function clearUpdateCellInternal() {
    sortableTable.edit_rowno =- 1;
    sortableTable.edit_rowid =null;
    sortableTable.edit_columnno =- 1;
    sortableTable.edit_columnname = null;
    sortableTable.edit_tableid = null;
    sortableTable.edit_celldata = null;
    document.getElementById('editpopover').style.display = "none";
}

function updateCellInternal() {
    for (var i = 0; i < sortableTable.sortableTables.length; i++) {
        if (sortableTable.sortableTables[i].tableid == sortableTable.edit_tableid) {
            sortableTable.sortableTables[i].updateCell();
        }
    }
    clearUpdateCellInternal();
}

// clickedInternal
function clickedInternal(event,clickdobj) {
  let clickedTbl=event.target.closest("table").id.substring(0,event.target.closest("table").id.indexOf("_tbl"));
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
    let match=cellelement.id.match(/^r([0-9]+)_([a-zA-Z0-9]+)_(.*)/);
    var rowno = match[1];
    var columnno = null; // Not used anymore
    var tableid = match[2];
    var columnname=match[3]

		var str = "";
    var rowdata = sortableTable.currentTable.getRow(rowno);
		var coldata = rowdata[columnname];

		sortableTable.edit_rowno = rowno;
    sortableTable.edit_row = rowdata;
		sortableTable.edit_columnno = columnno;
		sortableTable.edit_columnname = columnname;
		sortableTable.edit_tableid = tableid;
    sortableTable.edit_celldata = coldata;

		str += "<div id='input-container' style='flex-grow:1'>";
		str += sortableTable.currentTable.showEditCell(coldata,rowno,rowelement,cellelement,columnname,columnno,rowdata,coldata,tableid);
		str += "</div>";
		str += "<img id='popovertick' class='icon' src='Icon_Tick.svg' onclick='updateCellInternal();'>";
		str += "<img id='popovercross' class='icon' src='Icon_Cross.svg' onclick='clearUpdateCellInternal();'>";
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

// We call all highlights in order to allow hover of non-active tables
function rowHighlightInternal(event,row) {
    var arr = row.id.split("_");
    var rowno = parseInt(arr[1]);
	var centerel = event.target.closest("td");
	for (var i = 0; i < sortableTable.sortableTables.length; i++) {
		if (sortableTable.sortableTables[i].highlightRow != null) {
			sortableTable.sortableTables[i].highlightRow(row.id,rowno,centerel.className,centerel);
		}
    }
}

// We call all deHighlights in order to allow hover of non-active tables
function rowDeHighlightInternal(event,row) {
	var arr = row.id.split("_");
	var rowno = parseInt(arr[1]);
	var centerel = event.target.closest("td");
	for (var i = 0; i < sortableTable.sortableTables.length; i++) {
		if (sortableTable.sortableTables[i].deHighlightRow != null) {
			sortableTable.sortableTables[i].deHighlightRow(row.id,rowno,centerel.className,centerel);
		}
    }
}



function defaultRowHighlightOn(rowid,rowno,colclass,centerel){  
    let table=document.getElementById(centerel.id).closest("TR").id.substring(0,document.getElementById(centerel.id).closest("TR").id.indexOf("_"));
    let column=centerel.id.substring(centerel.id.lastIndexOf("_")+1);
    let rowPos=document.getElementById(centerel.id).closest("TR").getBoundingClientRect();
    let colPos=document.getElementById(column+"_"+table+"_tbl").getBoundingClientRect(); 
    if(document.getElementById("sortableTableRowHighlight")===null){
        document.body.innerHTML+='<div id="sortableTableRowHighlight" style="border:2px solid red;position:absolute;z-index:1100;pointer-events: none"></div>';
    }
    if(document.getElementById("sortableTablecolumnHighlight")===null){
        document.body.innerHTML+='<div id="sortableTablecolumnHighlight" style="border:2px solid red;position:absolute;z-index:1100;pointer-events: none"></div>';
    }
    let=xBorderOffset=getComputedStyle(document.getElementById('sortableTableRowHighlight'),null).getPropertyValue('border-left-width').replace("px","");
    let=yBorderOffset=getComputedStyle(document.getElementById('sortableTableRowHighlight'),null).getPropertyValue('border-top-width').replace("px","")

    document.getElementById("sortableTableRowHighlight").style.width=rowPos.width+"px";
    document.getElementById("sortableTableRowHighlight").style.height=rowPos.height+"px";
    document.getElementById("sortableTableRowHighlight").style.left=(rowPos.x+window.pageXOffset-xBorderOffset)+"px";
    document.getElementById("sortableTableRowHighlight").style.top=(rowPos.y+window.pageYOffset-yBorderOffset)+"px";
    document.getElementById("sortableTablecolumnHighlight").style.width=colPos.width+"px";
    document.getElementById("sortableTablecolumnHighlight").style.height=(document.getElementById(table+"_body").getBoundingClientRect().height+colPos.height)+"px";
    document.getElementById("sortableTablecolumnHighlight").style.left=(colPos.x+window.pageXOffset-xBorderOffset)+"px";
    document.getElementById("sortableTablecolumnHighlight").style.top=(colPos.y+window.pageYOffset-yBorderOffset)+"px";
    
    document.getElementById("sortableTablecolumnHighlight").style.display="block";
    document.getElementById("sortableTableRowHighlight").style.display="block";
		centerel.style.backgroundImage="radial-gradient(RGBA(0,0,0,0),RGBA(0,0,0,0.2))";
}

function defaultRowHighlightOff(rowid,rowno,colclass,centerel){
		centerel.style.backgroundImage="none";
    document.getElementById("sortableTablecolumnHighlight").style.display="none";
    document.getElementById("sortableTableRowHighlight").style.display="none";
}


function SortableTable(param)
{
		//------------==========########### Fenced paramters ###########==========------------    
    if(typeof param.data === "undefined"){
        param.data={tblhead:{},tblbody:[],tblfoot:{}};
    }
    var tbl = param.data;
    if(typeof param.tableElementId === "undefined"){
        param.tableElementId="UNK";
    }
    this.tableid = param.tableElementId;
    if(typeof param.filterElementId === "undefined"){
        param.filterElementId="UNK";
    }
    var filterid = param.filterElementId;
    if(typeof param.tableCaption === "undefined"){
        param.tableCaption="UNK";
    }   
    var caption = param.tableCaption;
     
    if(typeof param.renderCellCallback === "undefined"){
        param.renderCellCallback=null;
    }
    var renderCell = param.renderCellCallback;
    if(typeof param.renderSortOptionsCallback === "undefined"){
        param.renderSortOptionsCallback=null;
    }
    var renderSortOptions = param.renderSortOptionsCallback;
    if(typeof param.renderColumnFilterCallback === "undefined"){
        param.renderColumnFilterCallback=null;
    }
    var renderColumnFilter = param.renderColumnFilterCallback;

    if(typeof param.rowFilterCallback === "undefined"){
        param.rowFilterCallback=defaultRowFilter;
    }
    var rowFilter = param.rowFilterCallback;

    if(typeof param.columnOrder === "undefined"){
        param.columnOrder=[];
    }
    var columnOrder = param.columnOrder;
    
    if(typeof param.columnSum === "undefined"){
        param.columnSum=[];        
    }
    var colsumList = param.columnSum;
    
    if(typeof param.rowSum === "undefined"){
        param.rowSum=[];
    }
    var rowsumList = param.rowSum;
    for(let i=0;i<rowsumList.length;i++){
        tbl.tblhead[rowsumList[i][0]['id']]=rowsumList[i][0]['name'];
        columnOrder.push(rowsumList[i][0]['id']);
    }
      
    if(typeof param.columnSumCallback === "undefined"){
        param.columnSumCallback=null;
    }
    var sumFunc = param.columnSumCallback;
    if(typeof param.freezePaneIndex === "undefined"){
        param.freezePaneIndex=-1;
    }
    var freezePaneIndex = param.freezePaneIndex;
    if(typeof param.hasRowHighlight === "undefined"){
        param.hasRowHighlight=false;
    }
    this.hasRowHighlight = param.hasRowHighlight;
    if(typeof param.rowHighlightOnCallback === "undefined"){
        param.rowHighlightOnCallback=defaultRowHighlightOn;
    }
    this.highlightRow = param.rowHighlightOnCallback;
    if(typeof param.rowHighlightOffCallback === "undefined"){
        param.rowHighlightOffCallback=defaultRowHighlightOff;
    }
    this.deHighlightRow = param.rowHighlightOffCallback;
    if(typeof param.displayCellEditCallback === "undefined"){
        param.displayCellEditCallback=null;
    }
    this.showEditCell = param.displayCellEditCallback;
    if(typeof param.updateCellCallback === "undefined"){
        param.updateCellCallback=null;
    }
    this.updateCell = param.updateCellCallback;
    if(typeof param.hasMagicHeadings === "undefined"){
        param.hasMagicHeadings=false;
    }
    this.hasMagicHeadings = param.hasMagicHeadings;
    if(typeof param.hasCounterColumn === "undefined"){
        param.hasCounterColumn=false;
    }
    this.hasCounter = param.hasCounterColumn;
        
    //------------==========########### Private member variables ###########==========------------        
    var result = 0;
    var columnfilter = [];
    var sortcolumn = "UNK";
    var sortkind = -1;
    
    // Keeps track of the last picked sorting order
    var tableSort;
    var colSort;
    var reverseSort;    
    var freezePane = freezePane;
    var freezePaneArr = [];

    this.ascending = false;

    // Local variable that contains html code for main table and local variable that contains magic headings table
    var str = "";
    var mhstr = "";
    var mhvstr = "";
    var mhfstr = "";

    sortableTable.sortableTables.push(this);

    this.renderTable = function() {
        this.reRender();
    }

    this.getRow = function(rowno) {
        return tbl.tblbody[rowno];
    }

    this.reRender = function() {
    	this.rowIndex = 1;
    	// Local variable that contains html code for main table and local variable that contains magic headings table
    	str = "<table style='border-collapse: collapse;' id='"+this.tableid+"_tbl' class='list list--nomargin'>";
    	mhstr = "<table style='table-layout:fixed;border-collapse: collapse;position:fixed;top:0px;left:0px;z-index:2000;margin-top:0px;border-bottom:none;' class='list' id='"+this.tableid+"_tbl_mh'>";
    	mhvstr = "<table style='table-layout:fixed;border-collapse: collapse;position:fixed;left:0px;z-index:1000;' id='"+this.tableid+"_tbl_mhv'>";
    	mhfstr = "<table style='table-layout:fixed;border-collapse: collapse;position:fixed;left:0px;top:0px;z-index:3000;' id='"+this.tableid+"_tbl_mhf'>";

      // Local variable that contains summing array
    	var sumContent = [];

    	// Assign currently active table
    	sortableTable.currentTable = this;
      if(localStorage.getItem(this.tableid+"_filtercolnames")===null){
          columnfilter=[];
      }else{
          columnfilter = JSON.parse(localStorage.getItem(this.tableid+"_filtercolnames"));
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
      localStorage.setItem(this.tableid+"_filtercolnames",JSON.stringify(columnfilter));
  
      if (renderColumnFilter != null) {
    		  document.getElementById(filterid).innerHTML = filterstr;
    	}

      if(caption!=="UNK"){
          str += "<caption>"+caption+"</caption>";  
      }    	

    	// Make headings Clean Contains headings using only A-Z a-z 0-9 ... move to function removes lines of code and removes redundant code/data!?
      str += "<thead class='listHeading' id='"+this.tableid+"_tblhead'><tr>";
      mhstr += "<thead class='listHeading' id='"+this.tableid+"_tblhead_mh'><tr>";
      mhvstr += "<thead class='listHeading' id='"+this.tableid+"_tblhead_mhv'><tr>";
      mhfstr += "<thead class='listHeading' id='"+this.tableid+"_tblhead_mhf'><tr>";

    	//var freezePaneIndex = tbl.tblhead.indexOf(freezePane);

    	// Add Column for counter if the sortabletable should have a counter column.
    	if(this.hasCounter) {
          str += "<th id='counter_"+this.tableid+"_tbl' class='"+this.tableid+"'></th>";
          mhstr += "<th id='counter_"+this.tableid+"_tbl_mh' class='"+this.tableid+"'></th>";
          mhvstr += "<th id='counter_"+this.tableid+"_tbl_mhv' class='"+this.tableid+"'></th>";
          mhfstr += "<th id='counter_"+this.tableid+"_tbl_mhf' class='"+this.tableid+"'></th>";
      }

      for(var columnOrderIdx=0;columnOrderIdx<columnOrder.length;columnOrderIdx++){
      		var colname=columnOrder[columnOrderIdx];
          var col=tbl.tblhead[colname];

      		if (columnfilter[columnOrderIdx] !== null) {
        			if (renderSortOptions !== null) {
          				if (columnOrderIdx < freezePaneIndex) {
            					if (colname == sortcolumn){
              				 		mhfstr += "<th id='"+colname+"_"+this.tableid+"_tbl_mhf' class='"+this.tableid+"'>"+renderSortOptions(colname,sortkind,col)+"</th>";
              				 		mhvstr += "<th id='"+colname+"_"+this.tableid+"_tbl_mhv' class='"+this.tableid+"'>"+renderSortOptions(colname,sortkind,col)+"</th>";
            				 	} else {
              				 		mhfstr += "<th id='"+colname+"_"+this.tableid+"_tbl_mhf' class='"+this.tableid+"'>"+renderSortOptions(colname,-1,col)+"</th>";
              				 		mhvstr += "<th id='"+colname+"_"+this.tableid+"_tbl_mhv' class='"+this.tableid+"'>"+renderSortOptions(colname,-1,col)+"</th>";
            				 	}
          				}
          				if (colname == sortcolumn) {
            					str += "<th id='"+colname+"_"+this.tableid+"_tbl' class='"+this.tableid+"'>"+renderSortOptions(colname,sortkind,col)+"</th>";
            					mhstr += "<th id='"+colname+"_"+this.tableid+"_tbl_mh' class='"+this.tableid+"'>"+renderSortOptions(colname,sortkind,col)+"</th>";
          				} else {
            					str += "<th id='"+colname+"_"+this.tableid+"_tbl' class='"+this.tableid+"'>"+renderSortOptions(colname,-1,col)+"</th>";
            					mhstr += "<th id='"+colname+"_"+this.tableid+"_tbl_mh' class='"+this.tableid+"'>"+renderSortOptions(colname,-1,col)+"</th>";
          				}
        			} else {
          				if (columnOrderIdx < freezePaneIndex) {                    
          				 	if (colname == sortcolumn){
          				 		mhfstr += "<th id='"+colname+"_"+this.tableid+"_tbl_mhf' class='"+this.tableid+"'>"+col+"</th>";
          				 		mhvstr += "<th id='"+colname+"_"+this.tableid+"_tbl_mhv' class='"+this.tableid+"'>"+col+"</th>";
          				 	} else {
          				 		mhfstr += "<th id='"+colname+"_"+this.tableid+"_tbl_mhf' class='"+this.tableid+"'>"+col+"</th>";
          				 		mhvstr += "<th id='"+colname+"_"+this.tableid+"_tbl_mhv' class='"+this.tableid+"'>"+col+"</th>";
          				 	}
          				}
          				if (col != "move") {
          					str += "<th id='"+colname+"_"+this.tableid+"_tbl' class='"+this.tableid+"'>"+col+"</th>";
          					mhstr += "<th id='"+colname+"_"+this.tableid+"_tbl_mh' class='"+this.tableid+"'>"+col+"</th>";
          				}
        			}
          }
    	}
    	str += "</tr></thead>";
    	mhstr += "</tr></thead></table>";
    	mhfstr += "</tr></thead></table>";

    	// Render table body
    	str += "<tbody id='"+this.tableid+"_body'>";
    	mhvstr += "<tbody id='"+this.tableid+"_mhvbody'>";
    	for (var i = 0; i < tbl.tblbody.length; i++) {
      		var row = tbl.tblbody[i];
      		if (rowFilter(row)) {
        			str += "<tr id='"+this.tableid+"_"+i+"'"
              if (this.hasRowHighlight)str+=" onmouseover='rowHighlightInternal(event,this)' onmouseout='rowDeHighlightInternal(event,this)'";
              str+=" style='box-sizing:border-box'>";
        			mhvstr += "<tr id='"+this.tableid+"_"+i+"_mvh' onmouseover='rowHighlightInternal(event,this)' onmouseout='rowDeHighlightInternal(event,this)' style='box-sizing:border-box'>";

        			// Add Counter cell to the row. The class <tableid>_counter can be used to style the counterText
        			if(this.hasCounter) {
                  str += "<td onclick='clickedInternal(event,this);' class='" + this.tableid + "_counter'><span>"+ this.rowIndex +"</span></td>";
                  mhvstr += "<td onclick='clickedInternal(event,this);' class='" + this.tableid + "_counter'><span>"+ this.rowIndex++ +"</span></td>";
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
                      
          					var cellid = "r"+i+"_"+this.tableid+"_"+columnOrder[columnOrderIdx];
          					str += "<td id='"+cellid+"' onclick='clickedInternal(event,this);' class='"+this.tableid+"-"+columnOrder[columnOrderIdx]+"'>"+renderCell(columnOrder[columnOrderIdx],tbl.tblbody[i][columnOrder[columnOrderIdx]],cellid)+"</td>";  
                    if(columnOrderIdx<freezePaneIndex){
                        mhvstr+="<td id='"+cellid+"' onclick='clickedInternal(event,this);' class='"+this.tableid+"-"+columnOrder[columnOrderIdx]+"'>"+renderCell(columnOrder[columnOrderIdx],tbl.tblbody[i][columnOrder[columnOrderIdx]],cellid)+"</td>";  
                    }
        				}
      			}
      			str += "</tr>";
      			mhvstr += "</tr>";
          }
    	}
    	str += "</tbody>";
    	mhvstr += "</tbody>";
      str += "<tfoot style='border-top:2px solid #000'>";
      str += "<tr style='font-style:italic;'>";

      if(this.hasCounter) {
          str += "<td>&nbsp;</td>";
      }
      for(var columnOrderIdx=0;columnOrderIdx<columnOrder.length;columnOrderIdx++){
          if (columnfilter[columnOrderIdx] !== null) {
              if (typeof(sumContent[columnOrder[columnOrderIdx]])!=='undefined') {
                  str += "<td>"+sumContent[columnOrder[columnOrderIdx]]+"</td>";
              }else{
                  str += "<td>&nbsp;</td>";
              }          
          }
      }

      str+= "</tr></tfoot>";
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
    	localStorage.setItem(this.tableid+"_filtercolnames", JSON.stringify(columnfilter));

    	this.reRender();
    }

    this.toggleSortStatus = function(col,kind) {
    	// Assign currently active table
    	sortableTable.currentTable = this;

    	sortcolumn = col;
    	sortkind = kind;

    	// Even kind numbers will sort in ascending order
    	this.ascending = kind % 2 === 0;

    	// Sort the body of the table again
    	tbl.tblbody.sort(sortableInternalSort);

    	this.reRender();
    }

    this.getKeyByValue = function() {
      	return Object.keys(tbl.tblhead).find(key => tbl.tblhead[key] === sortcolumn);
    }

    this.getSortcolumn = function() {
        return sortcolumn;
    }

    this.getSortcolumnNum = function() {
        //return tbl.tblhead[sortcolumn];
    }

    this.getSortkind = function() {
        return sortkind;
    }

    this.magicHeader = function() {
    	// Assign table and magic headings table(s)
    	if (this.hasMagicHeadings) {
      		document.getElementById(this.tableid).innerHTML = str+mhstr+mhvstr+mhfstr;
      		document.getElementById(this.tableid+"_tbl_mh").style.width=document.getElementById(this.tableid+"_tbl").getBoundingClientRect().width+"px";
      		document.getElementById(this.tableid+"_tbl_mh").style.boxSizing = "border-box";
      		children=document.getElementById(this.tableid+"_tbl").getElementsByTagName('TH');

      		for (i = 0; i < children.length; i++) {
        			document.getElementById(children[i].id+"_mh").style.width = children[i].getBoundingClientRect().width+"px";
        			document.getElementById(children[i].id+"_mh").style.boxSizing = "border-box";
      		}

      		document.getElementById(this.tableid+"_tbl_mhf").style.width = Math.round(document.getElementById(this.tableid+"_tbl_mhv").getBoundingClientRect().width)+"px";
      		document.getElementById(this.tableid+"_tbl_mhf").style.boxSizing = "border-box";
      		children=document.getElementById(this.tableid+"_tbl_mhv").getElementsByTagName('TH');

      		for (i = 0; i < children.length; i++) {
              console.log(children[i])
        			document.getElementById(children[i].id.slice(0, -1)+"f").style.width = children[i].getBoundingClientRect().width+"px";
        			document.getElementById(children[i].id.slice(0, -1)+"f").style.boxSizing = "border-box";
      		}
          document.getElementById(this.tableid+"_tblhead_mh").style.height = Math.round(document.getElementById(this.tableid+"_tblhead").getBoundingClientRect().height)+"px";
          document.getElementById(this.tableid+"_tblhead_mhv").style.height = Math.round(document.getElementById(this.tableid+"_tblhead").getBoundingClientRect().height)+"px";
          document.getElementById(this.tableid+"_tblhead_mhf").style.height = Math.round(document.getElementById(this.tableid+"_tblhead").getBoundingClientRect().height)+"px";
    	} else {
    		  document.getElementById(this.tableid).innerHTML = str;
    	}

    	if (tableSort != null) {
    		  sortTable(tableSort, colSort, reverseSort);
    	}
    }

    setInterval(freezePaneHandler,30);
    function freezePaneHandler() {
      	// Hide magic headings and find minimum overdraft
      	for (var i = 0; i < sortableTable.sortableTables.length; i++) {
        		var table = sortableTable.sortableTables[i];
        		if (table.hasMagicHeadings) {
          			if (document.getElementById(table.tableid+"_tbl") != null) {
            				var thetab = document.getElementById(table.tableid+"_tbl").getBoundingClientRect();
            				var thetabhead = document.getElementById(table.tableid+"_tblhead").getBoundingClientRect();
            				// If top is negative and top+height is positive draw mh otherwise hide
            				// Vertical
            				if (thetabhead.top < 50 && thetab.bottom > 0) {
              					document.getElementById(table.tableid+"_tbl_mh").style.left = thetab.left+"px";
              					document.getElementById(table.tableid+"_tbl_mh").style.display = "table";
            				}
            				 else {
                        document.getElementById(table.tableid+"_tbl_mh").style.display = "none";
            				}
            				// Horizontal
            				if (thetab.left < 0 && thetab.right > 0) {
              					document.getElementById(table.tableid+"_tbl_mhv").style.top = thetabhead.top+"px";
              					document.getElementById(table.tableid+"_tbl_mhv").style.display = "table";
            				}
            				else {
                        document.getElementById(table.tableid+"_tbl_mhv").style.display = "none";
            				}

            				// Fixed
            				if (thetab.left < 0 && thetab.right > 0 && thetabhead.top < 0 && thetab.bottom > 0) {
                        document.getElementById(table.tableid+"_tbl_mhf").style.display = "table";
            				}
            				else {
                        document.getElementById(table.tableid+"_tbl_mhf").style.display = "none";
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
            this.reRender();          
        }
    }
}
