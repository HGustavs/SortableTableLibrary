<?php
  $db = new PDO('sqlite:free_shavocado.sqlite3');
  if (isset($_GET['command'])) {
      $command = $_GET['command']; 
  } else {
      $command = "UNK";
  }

  if (isset($_GET['dbarr'])) {
      $dbarr = json_decode($_GET['dbarr']);    
  } else {
      $dbarr = "UNK";  
  }

  if (isset($_GET['updatecol'])) {
      $updatecol = $_GET['updatecol'];    
  } else {
      $updatecol = "UNK";  
  }

  if (isset($_GET['updatetable'])) {
      $updatetable = $_GET['updatetable'];    
  } else {
      $updatetable = "UNK";  
  }

  if (isset($_GET['updatevalue'])) {
      $updatevalue = $_GET['updatevalue'];    
  } else {
      $updatevalue = "UNK";  
  }

  if (isset($_GET['updateid'])) {
      $updateid = $_GET['updateid'];    
  } else {
      $updateid = "UNK";  
  }

  function genData() {
      $possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
      $tblbody = array();  		
      for ($i = 0; $i < 200; $i++) {
      		$wordcnt = rand(1,5);
      		$str = "";
      		$str2 = "";
      		$str3 = "";
      		for ($j = 0; $j < $wordcnt; $j++) {
      				$charcnt = rand(1,10);
      				for ($k = 0; $k < $charcnt; $k++) {
      						$str .= substr($possible,rand(0,(strlen($possible) - 1)),1);
                  $str2 .= substr($possible,rand(0,(strlen($possible) - 1)),1);
                  $str3 .= substr($possible,rand(0,(strlen($possible) - 1)),1);
      				}
              $str .= " ";
              $str2 .= " ";
              $str3 .= " ";
      		}
      		array_push($tblbody, array($i,$str,lcg_value() * 5000,rand(1,20), $str2, $str3, array("xk" => rand(1000,3000), "yk" => rand(1,500), "col" => "Free Shevacadoo")));
      }  
      return $tblbody;
  }

  if ($command === "gendata" && $dbarr !== "UNK") {    
      foreach ($dbarr as $database) {
          $db->exec("DROP TABLE IF EXISTS " . $database);
          //"id","First/Last","Pnr","Num","Foo","Holk","Trumma"
          $db->exec(
              "CREATE TABLE IF NOT EXISTS " . $database . " (
              id INTEGER PRIMARY KEY, 
              firstlast TEXT, 
              pnr REAL,
              num INTEGER,
              foo TEXT,
              holk TEXT,
              trumma TEXT)"
          );

          // Prepare INSERT statement 
          $insert = "INSERT INTO " . $database . " (id,firstlast,pnr,num,foo,holk,trumma) VALUES (:id,:firstlast,:pnr,:num,:foo,:holk,:trumma)";
          $stmt = $db->prepare($insert);

          // Bind parameters to statement variables
          $stmt->bindParam(':id', $id);
          $stmt->bindParam(':firstlast', $first_last);
          $stmt->bindParam(':pnr', $pnr);
          $stmt->bindParam(':num', $num);
          $stmt->bindParam(':foo', $foo);
          $stmt->bindParam(':holk', $holk);
          $stmt->bindParam(':trumma', $trumma);

          // Insert all of the items in the array
          foreach (genData() as $item) {
              $id = intval($item[0]);
              $first_last = $item[1];
              $pnr = floatval($item[2]);
              $num = intval($item[3]);
              $foo = $item[4];
              $holk = $item[5];
              $trumma = json_encode($item[6]);

              try {    
                  $stmt->execute();
              } catch (PDOException $e) {
                  echo $e->getMessage();
              }
          }        
      }
  }

  if ($command === "update" && $updatetable !== "UNK" && $updateid !== "UNK" && $updatevalue !== "UNK") {
      try {  
          // Upsert
          // Select 
          $current="SELECT id,firstlast,pnr,num,foo,holk,trumma FROM ".$updatetable." WHERE id=:id;";
          $stmt = $db->prepare($current);
          $stmt->bindParam(':id', $updateid);  
          $results = $stmt->execute();
          // Update OR Insert
          if ($result = $stmt->fetch(PDO::FETCH_ASSOC)) {
              $firstlast=$result['firstlast'];
              $pnr=floatval($result['pnr']);
              $num=intval($result['num']);
              $foo=$result['foo'];
              $holk=$result['holk'];
              $trumma=json_decode($result['trumma']);
              
              $update = "UPDATE " . $updatetable . " SET (firstlast,pnr,num,foo,holk,trumma) = (:firstlast,:pnr,:num,:foo,:holk,:trumma) WHERE id = :id";
              $stmt = $db->prepare($update);
              $stmt->bindParam(':id', $updateid);              

              if($updatecol=="firstlast"){
                  $stmt->bindParam(':firstlast', $updatevalue);                  
              }else{
                  $stmt->bindParam(':firstlast', $firstlast);
              }
              if($updatecol=="pnr"){
                  $stmt->bindParam(':pnr', $updatevalue);                  
              }else{
                  $stmt->bindParam(':pnr', $pnr);
              }
              if($updatecol=="num"){
                  $stmt->bindParam(':num', $updatevalue);                  
              }else{
                  $stmt->bindParam(':num', $num);
              }
              if($updatecol=="foo"){
                  $stmt->bindParam(':foo', $updatevalue);                  
              }else{
                  $stmt->bindParam(':foo', $foo);
              }
              if($updatecol=="holk"){
                  $stmt->bindParam(':holk', $updatevalue);                  
              }else{
                  $stmt->bindParam(':holk', $holk);
              }
              if($updatecol=="trumma"){
                  $j=json_decode($updatevalue);
                  $stmt->bindParam(':trumma', $j);                  
              }else{
                  $stmt->bindParam(':trumma', $trumma);
              }
              $stmt->execute();
          } else {
              $update = "INSERT" . $updatetable . " (id,firstlast,pnr,num,foo,holk,trumma) VALUES(:id,:firstlast,:pnr,:num,:foo,:holk,:trumma)";
              $stmt = $db->prepare($update);
              $stmt->bindParam(':id', $updateid);              
              if($updatecol=="firstlast"){
                  $stmt->bindParam(':firstlast', $updatevalue);                  
              }else{
                  $stmt->bindParam(':firstlast', "UNK");
              }
              if($updatecol=="pnr"){
                  $stmt->bindParam(':pnr', $updatevalue);                  
              }else{
                  $stmt->bindParam(':pnr', -1);
              }
              if($updatecol=="num"){
                  $stmt->bindParam(':num', $updatevalue);                  
              }else{
                  $stmt->bindParam(':num', -1);
              }
              if($updatecol=="foo"){
                  $stmt->bindParam(':foo', $updatevalue);                  
              }else{
                  $stmt->bindParam(':foo', "UNK");
              }
              if($updatecol=="holk"){
                  $stmt->bindParam(':holk', $updatevalue);                  
              }else{
                  $stmt->bindParam(':holk', "UNK");
              }
              if($updatecol=="trumma"){
                  $stmt->bindParam(':trumma', $updatevalue);                  
              }else{
                  $stmt->bindParam(':trumma', "{}");
              }
              $stmt->execute();
          }
          
      } catch(PDOException $e) {
          echo $e->getMessage();
      }
  }

  $data = array();
  if ($dbarr !== "UNK") {
      foreach ($dbarr as $database) {
          $tbl = array();
          try {   
              $results = $db->query('SELECT id,firstlast,pnr,num,foo,holk,trumma FROM ' . $database);
              if ($results) {
                  while ($result = $results->fetch(PDO::FETCH_ASSOC)) {
                      array_push($tbl,
                          array(
                              'id'=>intval($result['id']),
                              'firstlast'=>$result['firstlast'],
                              'pnr'=>floatval($result['pnr']),
                              'num'=>intval($result['num']),
                              'foo'=>$result['foo'],
                              'holk'=>$result['holk'],
                              'trumma'=>json_decode($result['trumma'])
                          )
                      ); 
                  }             
              }
              $data[$database] = $tbl;
          } catch (PDOException $e) {
              echo $e->getMessage();
          }        
      }
  }
  echo json_encode($data);
?>
