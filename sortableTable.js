// Keep track of Currently active Table and all sortable tables
var currentTable=null;
var sortableTables=[];

// Magic heading updated based on scroll position
//window.onscroll = function() {magicHeading()};

// Global function for magic Headings
/*
function magicHeading(){  
    for (let i=0;i<sortableTables.length;i++){
        // Update col widths
        var tintin=sortableTables[i];        
        var leftMostCol="";        
        
        document.getElementById(tintin.getID()+"_magic").style.width=document.getElementById(tintin.getID()+"_tbl").clientWidth+"px";
        
        for(let colno in tintin.tbl.tblhead){
						var col=tintin.tbl.tblhead[colno];
						if(tintin.columnfilter.indexOf(col)>-1){
              let ccol=col.toLowerCase().replace(/[^a-zA-Z0-9]+/g, "");
              let mhcol=ccol+"_"+tintin.tableid+"_mh";
              ccol+="_"+tintin.tableid+"_tbl";
              let w=document.getElementById(ccol).clientWidth;
              let s=document.getElementById(ccol).getBoundingClientRect();
              pl=window.getComputedStyle(document.getElementById(ccol), null).getPropertyValue('padding-left');
              pr=window.getComputedStyle(document.getElementById(ccol), null).getPropertyValue('padding-right');
              pl=parseInt(pl.replace("px",""));
              pr=parseInt(pr.replace("px",""));
              padding=pl+pr;
              document.getElementById(mhcol).style.width=(w-padding)+"px";
						}
				}
        
        // Display magic heading if part of the table has scrolled past the top 
        // BUT the entire table has not scrolled out of view.
        var top=document.getElementById(tintin.tableid).getBoundingClientRect().top;
        var height=document.getElementById(tintin.tableid).getBoundingClientRect().height;
        if (top < 0 && top+height > 0){
          // Position mh table
          document.getElementById(tintin.tableid+"_magic").style.top="0px";
          // display
          document.getElementById(tintin.tableid+"_magic").style.display="block";
        } else {
          // hide
          document.getElementById(tintin.tableid+"_magic").style.display="none";          
        }        
    }
}
*/

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

function SortableTable(tbl,tableid,filterid,caption,renderCell,renderSortOptions,renderColumnFilter,rowFilter,colsumList,rowsumList,rowsumHeading,sumFunc,freezePane) {

		var columnfilter=[];
		var sortcolumn="UNK";
		var sortkind=-1;
		var ascending=false;
		var tbl=tbl;
		var tableid=tableid;
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

				// Global that contains rendered html for column filter div
				columnfilter = JSON.parse(localStorage.getItem(tableid+"_filtercolnames"));

				// Summing array
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

				// Global that contains rendered html for table
				var str="";
        
        str+="<table style='border-collapse: collapse;' id='"+tableid+"_tbl'>";
				str+= "<caption>"+caption+"</caption>";

        str+= "<thead id='"+tableid+"_tblhead'>";
				str+= "<tr>";        
        var freezePanePos=tbl.tblhead.indexOf(freezePane);
        //alert(freezePanePos);
				for(let colno=0;colno<tbl.tblhead.length; colno++){
						var col=tbl.tblhead[colno];
            var cleancol=tbl.cleanHead[colno];
						if(columnfilter.indexOf(col)>-1){
                var cls="freeze_vertical";
                if(colno <= freezePanePos){
                    freezePaneArr.push(col);
                    cls="freeze";
                }
								if(col==sortcolumn){
										str+= "<th id='"+cleancol+"_"+tableid+"_tbl' class='"+tableid+" "+cls+"'>"+renderSortOptions(col,sortkind)+"</th>";
								}else{
										str+= "<th id='"+cleancol+"_"+tableid+"_tbl' class='"+tableid+" "+cls+"'>"+renderSortOptions(col,-1)+"</th>";
								}
						}
				}
				if(rowsumList.length>0){
						if(rowsumHeading==sortcolumn){
								str+= "<th id='"+rowsumHeading+"_"+tableid+"_tbl' class='"+tableid+" freeze_vertical'>"+renderSortOptions(rowsumHeading,sortkind)+"</th>";
						}else{
                str+= "<th id='"+rowsumHeading+"_"+tableid+"_tbl' class='"+tableid+" freeze_vertical'>"+renderSortOptions(rowsumHeading,-1)+"</th>";
						}
				}
        str+= "</tr>";
				str+= "</thead>";

				// Render table body
				str+= "<tbody id='"+tableid+"_body'>";
					for(let rowno in tbl.tblbody){
							var row=tbl.tblbody[rowno]
							if(rowFilter(row)){
								
								// Keep row sum total here
								var rowsum=0;
								
								str+="<tr>";
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
											str+="<td id='"+cellid+"' ";
                      if(freezePaneArr.indexOf(tbl.tblhead[colno])>-1){
                          str+="class='"+tableid+" freeze_horizontal'";
                      }			                      
                      str+=">";
											str+=renderCell(col,tbl.tblhead[colno],cellid);
											str+="</td>";		
                      
									}
								}
								
								if(rowsumList.length>0){
										str+="<td>";
										str+=rowsum;
										str+="</td>";
								}
								
                str+="</tr>";
							}
					}
				str+= "</tbody>";

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

				document.getElementById(tableid).innerHTML=str;

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
				
				ascending=!ascending;
				
				// Sort the body of the table again
				tbl.tblbody.sort(sortableInternalSort);
								
				this.reRender();
		}
    
    // Add eventlistner for the table's magic heading
    // 
    var lhm = function (){
        var leftMostCol="";        
        
        document.getElementById(tableid+"_magic").style.width=document.getElementById(tableid+"_tbl").clientWidth+"px";
        
        for(let colno in tbl.tblhead){
            var col=tbl.tblhead[colno];
            if(columnfilter.indexOf(col)>-1){
              let ccol=col.toLowerCase().replace(/[^a-zA-Z0-9]+/g, "");
              let mhcol=ccol+"_"+tableid+"_mh";
              ccol+="_"+tableid+"_tbl";
              let w=document.getElementById(ccol).clientWidth;
              let s=document.getElementById(ccol).getBoundingClientRect();
              pl=window.getComputedStyle(document.getElementById(ccol), null).getPropertyValue('padding-left');
              pr=window.getComputedStyle(document.getElementById(ccol), null).getPropertyValue('padding-right');
              pl=parseInt(pl.replace("px",""));
              pr=parseInt(pr.replace("px",""));
              padding=pl+pr;
              document.getElementById(mhcol).style.width=(w-padding)+"px";
            }
        }
        
        // Display magic heading if part of the table has scrolled past the top 
        // BUT the entire table has not scrolled out of view.
        var top=document.getElementById(tableid).getBoundingClientRect().top;
        var height=document.getElementById(tableid).getBoundingClientRect().height;
        if (top < 0 && top+height > 0){
          // Position mh table
          document.getElementById(tableid+"_magic").style.top="0px";
          // display
          document.getElementById(tableid+"_magic").style.display="block";
        } else {
          // hide
          document.getElementById(tableid+"_magic").style.display="none";          
        } 
        var mhbodyPos=document.getElementById(tableid+"_body_magic").getBoundingClientRect();
        var bodyPos=document.getElementById(tableid+"_body").getBoundingClientRect();
        document.getElementById(tableid+"_body_magic").style.top=bodyPos.top;
        document.getElementById(tableid+"_body_magic").style.left=(bodyPos.left-8)+"px";
        
    }
    
    //window.addEventListener("scroll",lhm);

    var freezePaneHandler = function(){
        var tableHeadPos=document.getElementById(tableid+"_tblhead").getBoundingClientRect();
        var tableHeight=document.getElementById(tableid+"_tbl").getBoundingClientRect().height;
        var tableWidth=document.getElementById(tableid+"_tbl").getBoundingClientRect().width;
        var i;
        
        var topPos=(tableHeadPos.top < 0 && tableHeadPos.top+tableHeight>0)? Math.abs(tableHeadPos.top):0;
        var leftPos=(tableHeadPos.left < 0 && tableHeadPos.left+tableWidth>0) ?  Math.abs(tableHeadPos.left):0;
        
        var translate_y = (topPos !== 0) ? "translateY("+topPos+"px)" : "";
        var translate_x = (leftPos !== 0) ? "translateX(" +leftPos+ "px)" : "";
        var translate_xy = "translate(";
        translate_xy += (leftPos !== 0) ? leftPos +"px,":"0px,";
        translate_xy += (topPos!==0) ? topPos + "px)":"0px)";

        var fixed_vertical_elts = document.getElementsByClassName(tableid + " freeze_vertical");
        var fixed_horizontal_elts = document.getElementsByClassName(tableid + " freeze_horizontal");
        var fixed_both_elts = document.getElementsByClassName(tableid + " freeze");

        // The webkitTransforms are for a set of ancient smartphones/browsers,
        // one of which I have, so I code it for myself:
        for (i = 0; i < fixed_horizontal_elts.length; i++) {
            fixed_horizontal_elts[i].style.webkitTransform = translate_x;
            fixed_horizontal_elts[i].style.transform = translate_x;
        }

        for (i = 0; i < fixed_vertical_elts.length; i++) {
             fixed_vertical_elts[i].style.webkitTransform = translate_y;
             fixed_vertical_elts[i].style.transform = translate_y;
        }

        for (i = 0; i < fixed_both_elts.length; i++) {
             fixed_both_elts[i].style.webkitTransform = translate_xy;
             fixed_both_elts[i].style.transform = translate_xy;
        }
    }
    window.addEventListener("scroll",freezePaneHandler);
}
