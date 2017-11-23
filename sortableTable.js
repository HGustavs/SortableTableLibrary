
function rendertable()
{
		// Global that contains rendered html
		
		var str="";
		
		str+= "<caption>Teaching allocation for WEBUG courses in year </caption>";
		
		str+= "<thead>";
			str+= "<tr>";
			for(let col in tbl.tblhead){
					str+= "<th><span style='padding:0 10px 0 10px;'>"+tbl.tblhead[col]+"</span></th>";
			}
			str+= "</tr>";
		str+= "</thead>";
		
		// Render table body
		str+= "<tbody>";
			for(let row in tbl.tblbody){
					str+="<tr>";
					for(let col in tbl.tblbody[row]){
							rendercell(tbl.tblbody[row][col],tbl.tblhead[col]);
					}
					str+="</tr>";
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

		document.getElementById(tblID).innerHTML=str;

}

