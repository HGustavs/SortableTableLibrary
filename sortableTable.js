// Keep track of Currently active Table and all sortable tables
var currentTable=null;
var sortableTables=[];

// Global sorting function global
function sortableInternalSort(a,b)
{
		let ret=0;		
    //let colno=currentTable.tbl.tblhead.indexOf(currentTable.sortcolumn);
    let colno=currentTable.getSortcolumnNum();
		
		if(currentTable.ascending){
				//alert("Compare: "+a+" "+b);			
				ret=compare(a[colno],b[colno]);
		} else {
				//alert("Compare: "+b+" "+a);
				ret=compare(b[colno],a[colno]);
		}		
		return ret;
}

function rowHighlightOn(row){
    let arr=row.id.split("_");
    let rowno=arr[1];
    
    document.getElementById("tblrow_"+rowno).style.border="2px solid rgba(255,0,0,1)";
    document.getElementById("tblrowmvh_"+rowno).style.borderLeft="2px solid rgba(255,0,0,1)";
    document.getElementById("tblrowmvh_"+rowno).style.borderTop="2px solid rgba(255,0,0,1)";
    document.getElementById("tblrowmvh_"+rowno).style.borderBottom="2px solid rgba(255,0,0,1)";
}

function rowHighlightOff(row){
    let arr=row.id.split("_");
    let rowno=arr[1];
    document.getElementById("tblrow_"+rowno).style.border="";
    document.getElementById("tblrowmvh_"+rowno).style.borderLeft="";
    document.getElementById("tblrowmvh_"+rowno).style.borderTop="";
    document.getElementById("tblrowmvh_"+rowno).style.borderBottom="";
}

function SortableTable(tbl,tableid,filterid,caption,renderCell,renderSortOptions,renderColumnFilter,rowFilter,colsumList,rowsumList,rowsumHeading,sumFunc,freezePane) {

		var columnfilter=[];
		var sortcolumn="UNK";
		var sortkind=-1;
		var tbl=tbl;
		var filterid=filterid;
		var caption=caption;
		var renderCell=renderCell;
		var renderSortOptions=renderSortOptions;
		var renderColumnFilter=renderColumnFilter;
		var rowFilter=rowFilter;
		var colsumList=colsumList;
		var rowsumList=rowsumList;
		var rowsumHeading=rowsumHeading;
		var sumFunc=sumFunc;
    var freezePane=freezePane;
    var freezePaneArr=[];

		this.ascending=false;
		this.tableid=tableid;
	
    tbl.cleanHead=[];
    
    for(let i=0;i<tbl.tblhead.length;i++){
        tbl.cleanHead.push(tbl.tblhead[i].toLowerCase().replace(/[^a-zA-Z0-9]+/g, ""));      
    }    
								
    sortableTables.push(this);
    
		this.renderTable = function ()
		{
				this.reRender();
		}
		
		this.reRender = function ()
		{
				// Assign currently active table
				currentTable=this;

				// Private array that contains names of filtered columns
				columnfilter = JSON.parse(localStorage.getItem(tableid+"_filtercolnames"));

				// Local variable that contains summing array
				var sumContent=[];

				let isFirstVisit=false;
				if(columnfilter == null) {
						isFirstVisit=true;
						columnfilter=[];
				} 

				var filterstr="";
				for(let colno in tbl.tblhead){
						var col=tbl.tblhead[colno];
						if(isFirstVisit){
								columnfilter.push(col);
						} 
						filterstr+=renderColumnFilter(col,columnfilter.indexOf(col)>-1);							
						
				}
				document.getElementById(filterid).innerHTML=filterstr;

				// Local variable that contains html code for main table and local variable that contains magic headings table
				var str="<table style='border-collapse: collapse;margin-left:200px;' id='"+tableid+"_tbl'>";
				var	mhstr="<table style='table-layout:fixed;border-collapse: collapse;position:fixed;top:0px;left:0px;z-index:2000;' id='"+tableid+"_tbl_mh'>";;
      	var mhvstr="<table style='table-layout:fixed;border-collapse: collapse;position:fixed;left:0px;z-index:1000;' id='"+tableid+"_tbl_mhv'>";
      	var mhfstr="<table style='table-layout:fixed;border-collapse: collapse;position:fixed;left:0px;top:0px;z-index:3000;' id='"+tableid+"_tbl_mhf'>";
			
				str+= "<caption>"+caption+"</caption>";

				// Make headings Clean Contains headings using only A-Z a-z 0-9 ... move to function removes lines of code and removes redundant code/data!?
        str+= "<thead id='"+tableid+"_tblhead'><tr>";
        mhstr+= "<thead id='"+tableid+"_tblhead_mh'><tr>";
        mhvstr+= "<thead id='"+tableid+"_tblhead_mhv'><tr>";
        mhfstr+= "<thead id='"+tableid+"_tblhead_mhf'><tr>";
				
        var freezePaneIndex=tbl.tblhead.indexOf(freezePane);
				for(let colno=0;colno<tbl.tblhead.length; colno++){
						var col=tbl.tblhead[colno];
            var cleancol=tbl.cleanHead[colno];
						// If column is visible
						if(columnfilter.indexOf(col)>-1){
                if(colno <= freezePaneIndex){
										if(col==sortcolumn){
												mhfstr+= "<th id='"+cleancol+"_"+tableid+"_tbl_mhf' class='"+tableid+"'>"+renderSortOptions(col,sortkind)+"</th>";
												mhvstr+= "<th id='"+cleancol+"_"+tableid+"_tbl_mhv' class='"+tableid+"'>"+renderSortOptions(col,sortkind)+"</th>";
										}else{
												mhfstr+= "<th id='"+cleancol+"_"+tableid+"_tbl_mhf' class='"+tableid+"'>"+renderSortOptions(col,-1)+"</th>";
												mhvstr+= "<th id='"+cleancol+"_"+tableid+"_tbl_mhv' class='"+tableid+"'>"+renderSortOptions(col,-1)+"</th>";
										}
								}
								if(col==sortcolumn){
										str+= "<th id='"+cleancol+"_"+tableid+"_tbl' class='"+tableid+"'>"+renderSortOptions(col,sortkind)+"</th>";
										mhstr+= "<th id='"+cleancol+"_"+tableid+"_tbl_mh' class='"+tableid+"'>"+renderSortOptions(col,sortkind)+"</th>";
								}else{
										str+= "<th id='"+cleancol+"_"+tableid+"_tbl' class='"+tableid+"'>"+renderSortOptions(col,-1)+"</th>";
										mhstr+= "<th id='"+cleancol+"_"+tableid+"_tbl_mh' class='"+tableid+"'>"+renderSortOptions(col,-1)+"</th>";
								}
						}
				}
				if(rowsumList.length>0){
						if(rowsumHeading==sortcolumn){
								str+= "<th id='"+rowsumHeading+"_"+tableid+"_tbl' class='"+tableid+" freeze_vertical'>"+renderSortOptions(rowsumHeading,sortkind)+"</th>";
								mhstr+= "<th id='"+rowsumHeading+"_"+tableid+"_tbl_mh' class='"+tableid+" freeze_vertical'>"+renderSortOptions(rowsumHeading,sortkind)+"</th>";
						}else{
                str+= "<th id='"+rowsumHeading+"_"+tableid+"_tbl' class='"+tableid+" freeze_vertical'>"+renderSortOptions(rowsumHeading,-1)+"</th>";
                mhstr+= "<th id='"+rowsumHeading+"_"+tableid+"_tbl_mh' class='"+tableid+" freeze_vertical'>"+renderSortOptions(rowsumHeading,-1)+"</th>";
						}
				}
        str+= "</tr></thead>";
        mhstr+= "</tr></thead></table>";
        mhfstr+= "</tr></thead></table>";
			

				// Render table body
				str+= "<tbody id='"+tableid+"_body'>";
				mhvstr+= "<tbody id='"+tableid+"_mhvbody'>";
				for(let rowno in tbl.tblbody){
							var row=tbl.tblbody[rowno]
							if(rowFilter(row)){
								
								// Keep row sum total here
								var rowsum=0;
								
								str+="<tr id='tblrow_"+rowno+"' onmouseover='rowHighlightOn(this)' onmouseout='rowHighlightOff(this)' style='box-sizing:border-box'>";
								mhvstr+="<tr id='tblrowmvh_"+rowno+"' onmouseover='rowHighlightOn(this)' onmouseout='rowHighlightOff(this)' style='box-sizing:border-box'>";
								for(let colno in row){
									col=row[colno];
                  cleancol=tbl.cleanHead[colno];
																		
									// If we show this column...
									if(columnfilter.indexOf(tbl.tblhead[colno])>-1){
											
											// This condition is true if column is in summing list and in that case perform the sum like a BOSS
											if(colsumList.indexOf(tbl.tblhead[colno])>-1){
													if(typeof(sumContent[tbl.tblhead[colno]]) == "undefined") sumContent[tbl.tblhead[colno]]=0;
													sumContent[tbl.tblhead[colno]]+=sumFunc(tbl.tblhead[colno],col);		
											}

											if(rowsumList.indexOf(tbl.tblhead[colno])>-1){
													rowsum+=sumFunc(tbl.tblhead[colno],col);
											}

											let cellid="r"+rowno+"_"+tableid+"_"+cleancol;
											str+="<td id='"+cellid+"' >"+renderCell(col,tbl.tblhead[colno],cellid)+"</td>";
											if(colno <= freezePaneIndex){
													mhvstr+="<td id='"+cellid+"' >"+renderCell(col,tbl.tblhead[colno],cellid)+"</td>";                      
											}			                      
                      
									}
								}
								
								if(rowsumList.length>0){
										str+="<td>"+rowsum+"</td>";
								}
								
                str+="</tr>";
								mhvstr+="</tr>";
							}
				}
				str+= "</tbody>";
				mhvstr+= "</tbody>";

				str+= "<tfoot style='border-top:2px solid #000'>";
				str+= "<tr style='font-style:italic;'>";
				for(let colno in tbl.tblfoot){
						// If we show this column...
						if(columnfilter.indexOf(tbl.tblhead[colno])>-1){
								if(colsumList.indexOf(tbl.tblhead[colno])>-1){
										// If writing sum - just write it
										str+="<td>"+sumContent[tbl.tblhead[colno]]+"</td>";						
								}else{
										if (tbl.tblfoot[col]!="UNK"){
												str+="<td>"+tbl.tblfoot[colno]+"</td>";
										} else {
												str+="<td>&nbsp;</td>";
										}
								}
						}
				}
				str+="</tr>";
				str+= "</tfoot></table>";
				mhvstr+= "</table>";

				// Assign table and magic headings table(s)
				document.getElementById(tableid).innerHTML=mhstr+"<br><br>BOOYAH!<br><br>"+mhvstr+"<br><br>BOOYAH!<br><br>"+mhfstr+"<br><br>BOOYAH!<br><br>"+str;

        document.getElementById(tableid+"_tbl_mh").style.width=document.getElementById(tableid+"_tbl").getBoundingClientRect().width+"px";
        document.getElementById(tableid+"_tbl_mh").style.boxSizing = "border-box";          
				children=document.getElementById(tableid+"_tbl").getElementsByTagName('TH');
				for(i=0;i<children.length;i++){
          document.getElementById(children[i].id+"_mh").style.width=children[i].getBoundingClientRect().width;
          document.getElementById(children[i].id+"_mh").style.boxSizing = "border-box";          
				}

        document.getElementById(tableid+"_tbl_mhf").style.width=Math.round(document.getElementById(tableid+"_tbl_mhv").getBoundingClientRect().width)+"px";
        document.getElementById(tableid+"_tbl_mhf").style.boxSizing = "border-box";
				children=document.getElementById(tableid+"_tbl_mhv").getElementsByTagName('TH');
				for(i=0;i<children.length;i++){
          document.getElementById(children[i].id.slice(0, -1)+"f").style.width=children[i].getBoundingClientRect().width;
          document.getElementById(children[i].id.slice(0, -1)+"f").style.boxSizing = "border-box";
  			}
			

}

		this.toggleColumn = function(col)
		{
				// Assign currently active table
				currentTable=this;

				if(columnfilter.indexOf(col)==-1){
						columnfilter.push(col);
				}else{
						columnfilter.splice(columnfilter.indexOf(col),1);
				}

				localStorage.setItem(tableid+"_filtercolnames", JSON.stringify(columnfilter));

				this.reRender();
		}

		this.toggleSortStatus = function(col,kind)
		{
				// Assign currently active table
				currentTable=this;
				
				sortcolumn=col;
				sortkind=kind;		
				
				this.ascending=!this.ascending;
				
				// Sort the body of the table again
				tbl.tblbody.sort(sortableInternalSort);
								
				this.reRender();
		}
    
    this.getSortcolumn = function (){
        return sortcolumn;
    } 

    this.getSortcolumnNum = function (){
        return tbl.tblhead.indexOf(sortcolumn);
    } 
    
    this.getSortkind = function (){
        return sortkind;
    }    
    
		// Simpler magic heading v. III
		setInterval(freezePaneHandler,30);

		function freezePaneHandler()
		{
				// Hide magic headings and find minimum overdraft
				for(var i=0;i<sortableTables.length;i++){
							var thetab=document.getElementById(sortableTables[i].tableid+"_tbl").getBoundingClientRect();
							var thetabhead=document.getElementById(sortableTables[i].tableid+"_tblhead").getBoundingClientRect();
							// If top is negative and top+height is positive draw mh otherwise hide
							// Vertical
							if(thetabhead.top<0&&thetab.bottom>0){
									document.getElementById(sortableTables[i].tableid+"_tbl_mh").style.left=Math.round(thetab.left)+"px";
									document.getElementById(sortableTables[i].tableid+"_tbl_mh").style.display="table";
							}else{
									document.getElementById(sortableTables[i].tableid+"_tbl_mh").style.display="none";
							}
							// Horizontal
							if(thetab.left<0&&thetab.right>0){
									document.getElementById(sortableTables[i].tableid+"_tbl_mhv").style.top=Math.round(thetabhead.top)+"px";
									document.getElementById(sortableTables[i].tableid+"_tbl_mhv").style.display="table";
							}else{
									document.getElementById(sortableTables[i].tableid+"_tbl_mhv").style.display="none";							
							}
					
							// Fixed
							if(thetab.left<0&&thetab.right>0&&thetabhead.top<0&&thetab.bottom>0){
									document.getElementById(sortableTables[i].tableid+"_tbl_mhf").style.display="table";
							}else{
									document.getElementById(sortableTables[i].tableid+"_tbl_mhf").style.display="none";
							}
							
				}
		}
}
