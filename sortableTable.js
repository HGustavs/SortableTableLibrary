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
        for(let colno in tintin.tbl.tblhead){
						var col=tintin.tbl.tblhead[colno];
						if(tintin.columnfilter.indexOf(col)>-1){
                console.log(col+colno);                
						}
				}
        // Position mh table

        // display

      /*
        $('#'+currentTable.tblid+'_magic').css("top",(window.pageYOffset+48)+"px");
        // Display Magic Headings when scrolling
        if(window.pageYOffset+15>$('#'+currentTable.tblid+'_firstrow').offset().top){
            $('#'+currentTable.tblid+'_magic').css('display','block');
        }else{
            $('#'+currentTable.tblid+'_magic').css('display','none');
        }
        $("#upperDecker").css("width",$("#markinglist").outerWidth()+"px");
        
        if(window.pageXOffset>$("#subheading").offset().left){
            $("#sideDecker").css("display","block");
        }else{
            $("#sideDecker").css("display","none");      
        }
        
        // Add or Remove the inverse class depending on sorting
        $(".dugga-result-subheader").each(function(){
            var elemid=$(this).attr('id');
            var elemwidth=$(this).width();
            $("#"+elemid+"magic").css("width",elemwidth+"px");
            if($(this).hasClass("result-header-inverse")){
                $("#"+elemid+"magic").addClass("result-header-inverse");
            } else {
                $("#"+elemid+"magic").removeClass("result-header-inverse"); 
            }
        });
    */
        // Position Magic Headings
        //$("#sideDecker").css("left",(window.pageXOffset)+"px");      
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
        
        mhstr+="<table style='border-collapse: collapse;background-color:#fed;' id='"+this.tblid+"_magic'>";
        str+="<table style='border-collapse: collapse;' id='"+this.tblid+"_tbl'>";
				str+= "<caption>"+this.caption+"</caption>";

        mhstr+= "<thead>";
        mhstr+= "<tr>";
        str+= "<thead>";
				str+= "<tr id='"+currentTable.tblid+"_firstrow'>";
				for(let colno in this.tbl.tblhead){
						var col=this.tbl.tblhead[colno];
						if(this.columnfilter.indexOf(col)>-1){
								if(col==this.sortcolumn){
                    mhstr+= "<th>"+this.renderSortOptions(col,this.sortkind)+"</th>";
										str+= "<th>"+this.renderSortOptions(col,this.sortkind)+"</th>";
								}else{
                    mhstr+= "<th>"+this.renderSortOptions(col,-1)+"</th>";
										str+= "<th>"+this.renderSortOptions(col,-1)+"</th>";
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

