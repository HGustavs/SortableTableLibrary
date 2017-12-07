// Keep track of Currently active Table and all sortable tables
var currentTable=null;
var sortableTables=[];

// Magic heading updated based on scroll position
window.onscroll = function() {magicHeading()};

// Global function for magic Headings
function magicHeading(){  
    for (let i=0;i<sortableTables.length;i++){
        // Update col widths
        var tintin=sortableTables[i];        
        var leftMostCol="";        
        
        document.getElementById(tintin.tableid+"_magic").style.width=document.getElementById(tintin.tableid+"_tbl").clientWidth+"px";
        
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

function SortableTable(tbl,tableid,filterid,caption,renderCell,renderSortOptions,renderColumnFilter,rowFilter,colsumList,rowsumList,rowsumHeading,sumFunc) {

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
		this.colsumList=colsumList;
		this.rowsumList=rowsumList;
		this.rowsumHeading=rowsumHeading;
		this.sumFunc=sumFunc;
    this.tbl.cleanHead=[];
    
    for(let i=0;i<this.tbl.tblhead.length;i++){
        this.tbl.cleanHead.push(this.tbl.tblhead[i].toLowerCase().replace(/[^a-zA-Z0-9]+/g, ""));      
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
				this.columnfilter = JSON.parse(localStorage.getItem(this.tableid+"_filtercolnames"));

				// Summing array
				var sumContent=[];

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
        var mhstr="";
        
        mhstr+="<table style='border-collapse: collapse;background-color:#fed;display:none;position:fixed;margin:0;' id='"+this.tableid+"_magic'>";
        str+="<table style='border-collapse: collapse;' id='"+this.tableid+"_tbl'>";
				str+= "<caption>"+this.caption+"</caption>";

        mhstr+= "<thead>";
        mhstr+= "<tr>";
        str+= "<thead>";
				str+= "<tr id='"+currentTable.tblid+"_firstrow'>";
				for(let colno in this.tbl.tblhead){
						var col=this.tbl.tblhead[colno];
            var cleancol=this.tbl.cleanHead[colno];
						if(this.columnfilter.indexOf(col)>-1){
								if(col==this.sortcolumn){
                    mhstr+= "<th id='"+cleancol+"_"+this.tableid+"_mh'>"+this.renderSortOptions(col,this.sortkind)+"</th>";
										str+= "<th id='"+cleancol+"_"+this.tableid+"_tbl'>"+this.renderSortOptions(col,this.sortkind)+"</th>";
								}else{
                    mhstr+= "<th id='"+cleancol+"_"+this.tableid+"_mh'>"+this.renderSortOptions(col,-1)+"</th>";
										str+= "<th id='"+cleancol+"_"+this.tableid+"_tbl'>"+this.renderSortOptions(col,-1)+"</th>";
								}
						}
				}
				if(this.rowsumList.length>0){
						if(this.rowsumHeading==this.sortcolumn){
                mhstr+= "<th>"+this.renderSortOptions(this.rowsumHeading,this.sortkind)+"</th>";
								str+= "<th>"+this.renderSortOptions(this.rowsumHeading,this.sortkind)+"</th>";
						}else{
                mhstr+= "<th>"+this.renderSortOptions(this.rowsumHeading,-1)+"</th>";
                str+= "<th>"+this.renderSortOptions(this.rowsumHeading,-1)+"</th>";
						}
				}
        mhstr+= "</tr>";
				mhstr+= "</thead>";
        mhstr+= "</table>";
        
        str+= "</tr>";
				str+= "</thead>";

				// Render table body
				str+= "<tbody>";
					for(let rowno in this.tbl.tblbody){
							var row=this.tbl.tblbody[rowno]
							if(rowFilter(row)){
								
								// Keep row sum total here
								var rowsum=0;
								
								str+="<tr>";
								for(let colno in row){
									col=row[colno];
																		
									// If we show this column...
									if(this.columnfilter.indexOf(this.tbl.tblhead[colno])>-1){
											
											// This condition is true if column is in summing list and in that case perform the sum like a BOSS
											if(this.colsumList.indexOf(this.tbl.tblhead[colno])>-1){
													if(typeof(sumContent[this.tbl.tblhead[colno]]) == "undefined") sumContent[this.tbl.tblhead[colno]]=0;
													sumContent[this.tbl.tblhead[colno]]+=this.sumFunc(this.tbl.tblhead[colno],col);		
											}

											if(this.rowsumList.indexOf(this.tbl.tblhead[colno])>-1){
													rowsum+=this.sumFunc(this.tbl.tblhead[colno],col);
											}

											let cellid="r"+rowno+"c"+colno;
											str+="<td id='"+cellid+"'>";
											str+=this.renderCell(col,this.tbl.tblhead[colno],cellid);
											str+="</td>";						
									}
								}
								
								if(this.rowsumList.length>0){
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
				for(let colno in this.tbl.tblfoot){
						// If we show this column...
						if(this.columnfilter.indexOf(this.tbl.tblhead[colno])>-1){

								if(this.colsumList.indexOf(this.tbl.tblhead[colno])>-1){
										// If writing sum - just write it
										str+="<td>"+sumContent[this.tbl.tblhead[colno]]+"</td>";						
								}else{
										if (this.tbl.tblfoot[col]!="UNK"){
												str+="<td>"+this.tbl.tblfoot[colno]+"</td>";
										} else {
												str+="<td>&nbsp;</td>";
										}
								}
						}
				}
				str+="</tr>";
				str+= "</tfoot></table>";

        str+=mhstr;

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

