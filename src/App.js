import { useState } from "react";
import Papa from "papaparse";
import "./App.css";

function App() {
  const [csvData, setCsvData] = useState(null);
  const [fileError, setFileError] = useState( [] );

  function validFile (file) {
    return ( file.type === "text/csv" );
  }

  const handleDrop = (event) => {
    setFileError( [] );
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if ( validFile(file) ) {
      Papa.parse(file, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        complete: (results) => {
          if ( results.errors.length > 0 ){
            const errors = [];
            results.errors.forEach ( item => {
              errors.push({message: item.message});
            });
            setFileError(errors);
            setCsvData({fileName: file.name});  
          } else {
            let res = processData(results.data);
            res["fileName"]  = file.name;
            setCsvData(res); 
          }
        },
        error: (error) => {
          console.error(error);
          const errors = [ {message: error.message} ];
          setFileError(errors);
        },
      });  
    } else {
      const errors = [ { message: "File type must be csv" } ];
      setFileError(errors);
    }
    
  };

  function sortDateTimeStringArray(dateTimeStringArray) {
    dateTimeStringArray.sort(function(dateTimeString1, dateTimeString2) {
      return new Date(dateTimeString1) - new Date(dateTimeString2);
    });
    return dateTimeStringArray;
  }

  const processData = (data) => {
    let onlinePaymentSubtotal = 0, onlineDiscount = 0, onlineVoucher = 0;
    let cashPaymentSubtotal = 0, cashDiscount =0, cashVoucher = 0;
    let ordersRecivedDateTime = [];

    data.forEach( (value) => {
      ordersRecivedDateTime.push( value["Order received at"] );
      if ( value["Payment type"] === "Online" ) {
        onlinePaymentSubtotal += value["Subtotal"];
        onlineDiscount += value["Discount"];
        onlineVoucher += value["Voucher"];
      }
      if ( value["Payment type"] === "Cash" ) {
        cashPaymentSubtotal += value["Subtotal"];
        cashDiscount += value["Discount"];
        cashVoucher += value["Voucher"];
      }
    });
    ordersRecivedDateTime = (sortDateTimeStringArray( ordersRecivedDateTime ) );
    return  { "onlinePaymentSubtotal": onlinePaymentSubtotal,
              "cashPaymentSubtotal": cashPaymentSubtotal,
              "onlineDiscount": onlineDiscount,
              "onlineVoucher": onlineVoucher,
              "cashDiscount": cashDiscount,
              "cashVoucher": cashVoucher,
              "firstOrderRecived": ordersRecivedDateTime[0],
              "lastOrderRecived": ordersRecivedDateTime.pop()
            };
  }

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleDragLeave = () => {
    // Do something when the file is dragged out of the drop zone
  };
  function Errors(){
    const errorMessages = fileError.map( (error,index) => { return <li key={index}>{error.message}</li> } );
    return errorMessages;
  }

  const errorsClasName =
    'errors' +
    (fileError.length > 0 ? ' display' : '') 
  ;
  
  return (
    <>
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className="drop-zone"
      >
        <p>Drop CSV file here</p>
      </div>
      <div className={errorsClasName}>
        <p><strong>{`Get an errors on processing file :${ csvData ? csvData.fileName : '' }`}</strong></p>
        <ul className="error-list">
          <Errors/>
        </ul>
      </div>
      <div
        className="results"
      >
        { csvData && fileError.length === 0 ? (
          // Render the parsed CSV data
          <div className="result-table-wrapper">
            <p><strong>File: </strong> {csvData.fileName}</p>
            <p><strong>First order recived at: </strong> {csvData.firstOrderRecived}</p>
            <p><strong>Last order recived at: </strong> {csvData.lastOrderRecived}</p>
            <table>
              <thead>
                <tr>
                  <th>Payment type</th>
                  <th>Subtotal</th>
                  <th>Discount</th>
                  <th>Voucher</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Online</td>
                  <td>{ csvData.onlinePaymentSubtotal }</td>
                  <td>{ csvData.onlineDiscount }</td>
                  <td>{ csvData.onlineVoucher }</td>
                  <td>{ csvData.onlinePaymentSubtotal-csvData.onlineDiscount-csvData.onlineVoucher }</td>
                </tr>
                <tr>
                  <td>Cash</td>
                  <td>{ csvData.cashPaymentSubtotal }</td>
                  <td>{ csvData.cashDiscount }</td>
                  <td>{ csvData.cashVoucher }</td>
                  <td>{ csvData.cashPaymentSubtotal-csvData.cashDiscount-csvData.cashVoucher }</td>
                </tr>
                <tr>
                  <td><strong>Total</strong></td>
                  <td>{ csvData.cashPaymentSubtotal + csvData.onlinePaymentSubtotal }</td>
                  <td>{ csvData.cashDiscount + csvData.onlineDiscount}</td>
                  <td>{ csvData.cashVoucher + csvData.onlineVoucher }</td>
                  <td>{ (csvData.cashPaymentSubtotal-csvData.cashDiscount-csvData.cashVoucher) + (csvData.onlinePaymentSubtotal-csvData.onlineDiscount-csvData.onlineVoucher) }</td>
                </tr>
              </tbody>
            </table>
          </div>
        ) : "" }
      </div>
    </>
  );
}

export default App;