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

  const parseNumberWithCommas = (stringNumber) => {
    // Remove any commas in the string
    var numberWithoutCommas = stringNumber.replace(",", "");
  
    // Parse the number
    var parsedNumber = parseFloat(numberWithoutCommas);
  
    return parsedNumber;
  }
  
  const processData = (data) => {
    let onlinePaymentSubtotal = 0, onlineDiscounts = 0, onlineVouchers=0; 
    let cashPaymentSubtotal = 0, cashDiscounts = 0, cashVouchers = 0;
    let ordersRecivedDateTime = [];

    data.forEach( (value) => {
      ordersRecivedDateTime.push( value["Order received at"] );
      if ( value["Payment type"] === "Online" && value["Order status"] === "Delivered" ) {
        onlinePaymentSubtotal += (typeof value["Subtotal"] === "string") ? parseNumberWithCommas(value["Subtotal"]) : value["Subtotal"];
        onlineDiscounts += (typeof value["Discount"] === "string") ? parseNumberWithCommas(value["Discount"]) : value["Discount"];
        onlineVouchers += (typeof value["Voucher"] === "string") ? parseNumberWithCommas(value["Voucher"]) : value["Voucher"];
      }
      if ( value["Payment type"] === "Cash" && value["Order status"] === "Delivered" ) {
        cashPaymentSubtotal += (typeof value["Subtotal"] === "string") ? parseNumberWithCommas(value["Subtotal"]) : value["Subtotal"];
        cashDiscounts += (typeof value["Discount"] === "string") ? parseNumberWithCommas(value["Discount"]) : value["Discount"];
        cashVouchers += (typeof value["Voucher"] === "string") ? parseNumberWithCommas(value["Voucher"]) : value["Voucher"];
      }
    });
    ordersRecivedDateTime = (sortDateTimeStringArray( ordersRecivedDateTime ) );
    return  { "onlinePaymentSubtotal": onlinePaymentSubtotal,
              "cashPaymentSubtotal": cashPaymentSubtotal,
              "onlineDiscounts": onlineDiscounts,
              "onlineVouchers": onlineVouchers,
              "cashDiscounts": cashDiscounts,
              "cashVouchers": cashVouchers,
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
                  <th>Discounts</th>
                  <th>Vouchers</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Online</td>
                  <td>{ csvData.onlinePaymentSubtotal }</td>
                  <td>{ csvData.onlineDiscounts }</td>
                  <td>{ csvData.onlineVouchers }</td>
                  <td>{ csvData.onlinePaymentSubtotal-csvData.onlineDiscounts-csvData.onlineVouchers }</td>
                </tr>
                <tr>
                  <td>Cash</td>
                  <td>{ csvData.cashPaymentSubtotal }</td>
                  <td>{ csvData.cashDiscounts }</td>
                  <td>{ csvData.cashVouchers }</td>
                  <td>{ csvData.cashPaymentSubtotal-csvData.cashDiscounts-csvData.cashVouchers }</td>
                </tr>
                <tr>
                  <td><strong>Total</strong></td>
                  <td>{ csvData.cashPaymentSubtotal + csvData.onlinePaymentSubtotal }</td>
                  <td>{ csvData.cashDiscounts + csvData.onlineDiscounts}</td>
                  <td>{ csvData.cashVouchers + csvData.onlineVouchers}</td>
                  <td>{ (csvData.onlinePaymentSubtotal-csvData.onlineDiscounts-csvData.onlineVouchers) + (csvData.cashPaymentSubtotal-csvData.cashDiscounts-csvData.cashVouchers) }</td>
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