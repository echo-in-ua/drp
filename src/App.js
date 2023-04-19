import { useState } from "react";
import Papa from "papaparse";
import "./App.css";

function App() {
  const [csvData, setCsvData] = useState(null);

  const handleDrop = (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    console.log (file.name);
    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      complete: (results) => {
        let res = processData(results.data);
        res["fileName"] = file.name;
        setCsvData(res);
        console.log (results);
      },
      error: (error) => {
        console.error(error);
      },
    });
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
      <div
        className="results"
      >
        {csvData ? (
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
              </tbody>
            </table>
          </div>
        ) : "" }
      </div>
    </>
  );
}

export default App;