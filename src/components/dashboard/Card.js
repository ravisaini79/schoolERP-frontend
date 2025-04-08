import React from "react";
import { Link } from "react-router-dom";
import CountUp from "react-countup";
import './style.css'
function Card({ icon, title, value, link, isPercentage, text, message }) {
  const colors = ["#2ad7c5", "#ffa201", "#f939a1"];
  let bgColor = colors[Math.floor(Math.random() * colors.length)];

  return (
    <div className="col-xs-12 col-sm-6 col-md-4">
      <Link to={`${link}`} className="dashboard__card">
        <div className="card__content">
          {/* Left Section: Icon & Title */}
          <div className="card__left">
            <div className="card__icon" style={{ background: `${bgColor}` }}>
              {icon}
            </div>
            <div className="card__title">
              <h5>{title}</h5>
              <small>{message ? message : ""}</small>
            </div>
          </div>
          {/* Right Section: Value */}
          <div className="card__digits">
            <strong>
              {text ? value : <CountUp end={value} />}
              {isPercentage && "%"}
            </strong>
          </div>
        </div>
      </Link>
    </div>
  );
}

export default Card;
