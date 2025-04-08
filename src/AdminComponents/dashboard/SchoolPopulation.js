import React from "react";
import ComplexDonut from "react-svg-donuts/dist/complex";
import "react-svg-donuts/dist/index.css";
import "../../components/dashboard/style.css"

function Population({ maleStudents, femaleStudents }) {
  return (
    <div className="content__container attendances">
      <h3>Students</h3>

      <div className="donut-container">
        <ComplexDonut
          size={300}  // Larger Graph
          radius={70} 
          thickness={50}
          startAngle={-90}
          segments={[
            {
              color: "#FF4D79", // Female - Vibrant Pink
              value: femaleStudents || 0,
            },
            {
              color: "#007BFF", // Male - Bright Blue
              value: maleStudents || 0,
            },
          ]}
        />
      </div>

      <div className="graph__keys row mt-4">
        <div className="col-sm-5">
          <div className="color__box female__color"></div>
          <div className="muted-text">Female Students</div>
          <h6>
            <strong>{femaleStudents || 0}</strong>
          </h6>
        </div>
        <div className="col-sm-5">
          <div className="color__box male__color"></div>
          <div className="muted-text">Male Students</div>
          <h6>
            <strong>{maleStudents || 0}</strong>
          </h6>
        </div>
      </div>
    </div>
  );
}

export default Population;
