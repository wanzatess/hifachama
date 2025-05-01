import React from "react";
import "../styles/Spinner.css";
 // Make sure to create and import the CSS file

const Spinner = ({ message = "Loading..." }) => {
  return (
    <div className="spinner-container">
      <div className="spinner"></div>
      <p>{message}</p>
    </div>
  );
};

export default Spinner;
