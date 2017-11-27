// Keep track of Currently active Table
var currentTable=null;

// Global sorting function global
function sortableInternalSort(a,b)
{
		let ret=0;		
		let colno=currentTable.tbl.tblhead.indexOf(currentTable.sortcolumn);
		
		if(currentTable.ascending){
				//alert("Compare: "+a+" "+b);			
				ret=compare(a[colno],b[colno]);
		} else {
				//alert("Compare: "+b+" "+a);
				ret=compare(b[colno],a[colno]);
		}		
		return ret;
}

function SortableTable(tbl,tableid,filterid,caption,renderCell,renderSortOptions,renderColumnFilter,rowFilter) {

		this.columnfilter=[];
		this.sortcolumn="UNK";
		this.sortkind=-1;
		this.ascending=false;
		this.tbl=tbl;
		this.tableid=tableid;
		this.filterid=filterid;
		this.caption=caption;
		this.renderCell=renderCell;
		this.renderSortOptions=renderSortOptions;
		this.renderColumnFilter=renderColumnFilter;
		this.rowFilter=rowFilter;
								
		this.renderTable = function ()
		{
				this.reRender();
		}
		
		this.reRender = function ()
		{
				// Assign currently active table
				currentTable=this;

				// Global that contains rendered html for column filter div
				this.columnfilter = JSON.parse(localStorage.getItem(this.tableid+"_filtercolnames"));

				let isFirstVisit=false;
				if(this.columnfilter == null) {
						isFirstVisit=true;
						this.columnfilter=[];
				} 

				var filterstr="";
				for(let colno in this.tbl.tblhead){
						var col=this.tbl.tblhead[colno];
						if(isFirstVisit){
								this.columnfilter.push(col);
						} 
						filterstr+=this.renderColumnFilter(col,this.columnfilter.indexOf(col)>-1);							
						
				}
				document.getElementById(this.filterid).innerHTML=filterstr;

				// Global that contains rendered html for table
				var str="";

				str+= "<caption>"+this.caption+"</caption>";

				str+= "<thead>";
					str+= "<tr>";
					for(let colno in this.tbl.tblhead){
							var col=this.tbl.tblhead[colno];
							if(this.columnfilter.indexOf(col)>-1){
									if(col==this.sortcolumn){
											str+= "<th>"+this.renderSortOptions(col,this.sortkind)+"</th>";
									}else{
											str+= "<th>"+this.renderSortOptions(col,-1)+"</th>";
									}
							}
					}
					str+= "</tr>";
				str+= "</thead>";

				// Render table body
				str+= "<tbody>";
					for(let rowno in this.tbl.tblbody){
							var row=this.tbl.tblbody[rowno]
							if(rowFilter(row)){
								str+="<tr>";
								for(let colno in row){
									col=row[colno];
									if(this.columnfilter.indexOf(this.tbl.tblhead[colno])>-1){
											let cellid="r"+rowno+"c"+colno;
											str+="<td id='"+cellid+"'>";
											str+=this.renderCell(col,this.tbl.tblhead[colno],cellid);
											str+="</td>";						
									}
								}
								str+="</tr>";
							}
					}
				str+= "</tbody>";

				str+= "<tfoot style='border-top:2px solid #000'>";
				str+= "<tr style='font-style:italic;'>";
				for(let col in this.tbl.tblfoot){
						if (this.tbl.tblfoot[col]!="UNK"){
								str+="<td>"+this.tbl.tblfoot[col]+"</td>";
						} else {
								str+="<td> </td>";
						}
				}
				str+="</tr>";
				str+= "</tfoot></table>";

				document.getElementById(this.tableid).innerHTML=str;

		}

		this.toggleColumn = function(col)
		{
				// Assign currently active table
				currentTable=this;

				if(this.columnfilter.indexOf(col)==-1){
						this.columnfilter.push(col);
				}else{
						this.columnfilter.splice(this.columnfilter.indexOf(col),1);
				}

				localStorage.setItem(this.tableid+"_filtercolnames", JSON.stringify(this.columnfilter));

				this.reRender();
		}

		this.toggleSortStatus = function(col,kind)
		{
				// Assign currently active table
				currentTable=this;
				
				this.sortcolumn=col;
				this.sortkind=kind;		
				
				this.ascending=!this.ascending;
				
				// Sort the body of the table again
				this.tbl.tblbody.sort(sortableInternalSort);
								
				this.reRender();
		}
		
}
