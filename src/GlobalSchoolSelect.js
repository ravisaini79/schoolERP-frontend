import React, { useEffect, useState } from "react";
import axios from "./store/axios";
import Loading from "./Loading";
import "./GlobalSchoolSelect.css";
import { useSelector } from "react-redux";
import { selectUser } from "./store/slices/userSlice";

function GlobalSchoolSelect({ onSchoolSelect }) {
  const [schools, setSchools] = useState([]);
  const [selectedSchool, setSelectedSchool] = useState("");
  const [loading, setLoading] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const user = useSelector(selectUser);
  const storedUser = JSON.parse(localStorage.getItem("LoggerInUser") || "{}");
  const userId = user?._id || storedUser?._id;
  const userName = user?.name || storedUser?.name || "User";

  useEffect(() => {
    if (!userId) {
      console.warn("❌ No user found in localStorage or Redux");
      return;
    }

    const fetchSchools = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`/subbranches/sub/${userId}`);
        setSchools(response.data || []);
      } catch (error) {
        console.error("❌ Error fetching schools:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSchools();
  }, [userId]);

  const handleSchoolChange = (e) => {
    const value = e.target.value;
    setSelectedSchool(value);
    setShowMessage(false);

    if (!onSchoolSelect) return;

    if (value === userId) {
      onSchoolSelect({ _id: userId, name: userName });
    } else {
      const selected = schools.find((school) => school._id === value);
      onSchoolSelect(selected || { _id: value });
    }
  };

  const handleSelectClick = () => {
    setIsDropdownOpen(!isDropdownOpen);
    
    // If dropdown is being opened and there's a selected school, clear it
    if (!isDropdownOpen && selectedSchool) {
      setSelectedSchool("");
      setShowMessage(true);
      if (onSchoolSelect) {
        onSchoolSelect(null); // This will trigger the parent to show "Please select a school"
      }
    }
  };

  return (
    <div className="global-select-container">
      {loading && <Loading />}
      <select
        className="global-select"
        value={selectedSchool}
        onChange={handleSchoolChange}
        onClick={handleSelectClick}
      >
        <option value="">Select a school</option>
        <option value={userId}>{userName}</option>
        {schools.map((school) => (
          <option key={school._id} value={school._id}>
            {school.name || "Unnamed School"}
          </option>
        ))}
      </select>
      
    </div>
  );
}

export default GlobalSchoolSelect;