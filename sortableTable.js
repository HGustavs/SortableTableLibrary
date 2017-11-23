
var columnfilter=[];

function renderTable(tbl,tableid,filterid,caption)
{

		// Global that contains rendered html for column filter div
		columnfilter = JSON.parse(localStorage.getItem("filtercolnames"));

		if(columnfilter == null) columnfilter=[];

		var filterstr="";
		for(let colno in tbl.tblhead){
				var col=tbl.tblhead[colno];
				filterstr+=renderColumnFilter(col,columnfilter.indexOf(col)>-1);
		}
		document.getElementById(filterid).innerHTML=filterstr;
		
		// Global that contains rendered html for table
		
		var str="";
		
		str+= "<caption></caption>";
		
		str+= "<thead>";
			str+= "<tr>";
			for(let colno in tbl.tblhead){
					var col=tbl.tblhead[colno];
					if(columnfilter.indexOf(col)>-1){
							str+= "<th><span style='padding:0 10px 0 10px;'>"+col+"</span></th>";
					}
			}
			str+= "</tr>";
		str+= "</thead>";
		
		// Render table body
		str+= "<tbody>";
			for(let rowno in tbl.tblbody){
					var row=tbl.tblbody[rowno]
					if(rowFilter(row)){
						str+="<tr>";
						for(let colno in row){
							col=row[colno];
							if(columnfilter.indexOf(tbl.tblhead[colno])>-1){
									str+="<td>";
									str+=renderCell(col,tbl.tblhead[colno]);
									str+="</td>";						
							}
						}
						str+="</tr>";
					}
			}
		str+= "</tbody>";

		str+= "<tfoot style='border-top:2px solid #000'>";
		str+= "<tr style='font-style:italic;'>";
		for(let col in tbl.tblfoot){
				if (tbl.tblfoot[col]!="UNK"){
						str+="<td>"+tbl.tblfoot[col]+"</td>";
				} else {
						str+="<td> </td>";
				}
		}
		str+="</tr>";
		str+= "</tfoot></table>";

		document.getElementById(tableid).innerHTML=str;

}

function toggleColumn(col,tbl,tableid,filterid)
{
		if(columnfilter.indexOf(col)==-1){
				columnfilter.push(col);
		}else{
				columnfilter.splice(columnfilter.indexOf(col),1);
		}

		localStorage.setItem("filtercolnames", JSON.stringify(columnfilter));

		renderTable(tbl,tableid,filterid);
}