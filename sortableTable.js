
function sortableTable(tbl,tableid,filterid,caption,renderCell,renderSortOptions,renderColumnFilter,rowFilter,compare) {

		this.columnfilter=[];
		this.sortcolumn="UNK";
		this.sortstatus=true;
		this.tbl=tbl;
		this.tableid=tableid;
		this.filterid=filterid;
		this.caption=caption;
		this.renderCell=renderCell;
		this.renderSortOptions=renderSortOptions;
		this.renderColumnFilter=renderColumnFilter;
		this.rowFilter=rowFilter;
		this.compare=compare;
								
		this.renderTable = function ()
		{
				this.reRender();
		}
		
		this.reRender = function ()
		{
				// Global that contains rendered html for column filter div
				this.columnfilter = JSON.parse(localStorage.getItem(this.tableid+"_filtercolnames"));

				if(this.columnfilter == null) this.columnfilter=[];

				var filterstr="";
				for(let colno in this.tbl.tblhead){
						var col=this.tbl.tblhead[colno];
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
											str+= "<th>"+this.renderSortOptions(col,this.sortstatus)+"</th>";
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
											str+="<td>";
											str+=this.renderCell(col,this.tbl.tblhead[colno]);
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
				if(this.columnfilter.indexOf(col)==-1){
						this.columnfilter.push(col);
				}else{
						this.columnfilter.splice(this.columnfilter.indexOf(col),1);
				}

				localStorage.setItem(this.tableid+"_filtercolnames", JSON.stringify(this.columnfilter));

				this.reRender();
		}

		this.toggleSortStatus = function(col,status)
		{
				this.sortcolumn=col;
				this.sortstatus=status;		
				
				this.tbl.tblbody.sort(this.compare(this.tbl.tblhead.indexOf(col),this.sortstatus));
				
				this.reRender();
		}
		
}
