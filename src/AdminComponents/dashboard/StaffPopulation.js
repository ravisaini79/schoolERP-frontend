import React from "react";
import ComplexDonut from "react-svg-donuts/dist/complex";
import "react-svg-donuts/dist/index.css";
import "../../components/dashboard/style.css"
function Population({ maleStaff, femaleStaff }) {
  return (
    <div className="content__container attendances">
      <h3>Staff</h3>

      <div className="donut-container">
        <ComplexDonut
          size={300}  // Increased Size
          radius={70}
          thickness={50}
          startAngle={-90}
          segments={[
            {
              color: "#FF4D79", // Female Staff - Vibrant Pink
              value: femaleStaff || 0,
            },
            {
              color: "#007BFF", // Male Staff - Bright Blue
              value: maleStaff || 0,
            },
          ]}
        />
      </div>

      <div className="graph__keys row mt-4">
        <div className="col-sm-5">
          <div className="color__box female__color"></div>
          <div className="muted-text">Female Staff</div>
          <h6>
            <strong>{femaleStaff || 0}</strong>
          </h6>
        </div>
        <div className="col-sm-5">
          <div className="color__box male__color"></div>
          <div className="muted-text">Male Staff</div>
          <h6>
            <strong>{maleStaff || 0}</strong>
          </h6>
        </div>
      </div>
    </div>
  );
}

export default Population;
