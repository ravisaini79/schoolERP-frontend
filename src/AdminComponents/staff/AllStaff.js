import React, { useState, useEffect } from "react";
import Search from "../shared/Search";
import StaffTable from "../shared/TableListUsers";
import axios from "../../store/axios";
import { errorAlert } from "../../utils";
import Loading from "../../Loading";
import { pdf } from "../../components/tables/pdf";
import { Link } from "react-router-dom";
import GlobalSchoolSelect from "../../GlobalSchoolSelect";

const headCells = [
  { id: "userID", numeric: false, disablePadding: false, label: "Teacher ID" },
  { id: "photoUrl", numeric: false, disablePadding: false, label: "Photo" },
  { id: "name", numeric: false, disablePadding: true, label: "Name" },
  {
    id: "middlename",
    disablePadding: true,
    label: "Middle Name",
  },
  { id: "surname", disablePadding: true, label: "Last Name" },
  { id: "position", disablePadding: false, label: "Position" },
  { id: "gender", disablePadding: false, label: "Gender" },
];

function AllStaff() {
  const [name, setname] = useState("");
  const [userID, setuserID] = useState("");
  const [staff, setstaff] = useState([]);
  const [storeData, setstoreData] = useState([]);
  const [loading, setloading] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState(null); // Track selected school

  useEffect(() => {
    if (selectedSchool) {
      fetchStaffData();
    } else {
      setstaff([]); // Clear staff when no school is selected
    }
  }, [selectedSchool]);

  const fetchStaffData = () => {
    setloading(true);
    axios
      .get(`/teachers/school/${selectedSchool._id}`) // Assuming your API supports school-based filtering
      .then((res) => {
        setloading(false);
        setstaff(res.data);
        setstoreData(res.data);
      })
      .catch((err) => {
        setloading(false);
        errorAlert("Failed to fetch staff data");
      });
  };

  const generatePDF = () => {
    if (!staff.length) {
      errorAlert("No staff data to generate PDF");
      return;
    }
    
    const headers = [
      { key: "userID", label: "UserID" },
      { key: "name", label: "Name" },
      { key: "middleName", label: "Middle Name" },
      { key: "surname", label: " SurName" },
      { key: "gender", label: "Gender" },
      { key: "classID", label: "Class" },
    ];

    pdf({ data: staff, headers, filename: "AllStaff" });
  };

  const handleDelete = (id) => {
    let ans = window.confirm(`Are sure you want to delete user ${id}`);
    if (ans) {
      axios.delete(`/user/delete/${id}`).then((res) => {
        if (res.data.error) {
          errorAlert(res.data.error);
        }
        setstaff(staff.filter((i) => i.userID !== id));
      });
    }
  };

  const handleWithdraw = (i) => {
    let ans = window.confirm(
      `Are you sure you want to withdraw this staff member ${i}`
    );

    if (ans) {
      axios.put(`/teachers/update/${i}`, { withdraw: true }).then((res) => {
        if (res.data.error) {
          errorAlert(res.data.error);
        }
        setstaff(staff.filter((e) => e.userID !== i));
      });
    }
  };

  const handleReset = (e) => {
    e.preventDefault();
    setstaff(storeData);
    setname("");
    setuserID("");
  };

  const handleSearch = (e) => {
    e.preventDefault();
    let newStaff = [];
    if (name) {
      newStaff = storeData.filter(
        (i) =>
          i.name.toLowerCase().includes(name.toLowerCase()) ||
          i.surname.toLowerCase().includes(name.toLowerCase())
      );
    }
    if (userID) {
      newStaff = storeData.filter((i) =>
        i.userID.toLowerCase().includes(userID.toLowerCase())
      );
    }
    setstaff(newStaff);
  };

  const inputFields = [
    {
      type: "text",
      label: "Search by Name",
      name: "name",
      value: name,
      onChange: setname,
    },
    {
      type: "text",
      label: "Search by UserID",
      name: "userID",
      value: userID,
      onChange: setuserID,
    },
  ];

  return (
    <>
      {loading && <Loading />}
      <div className="content__container mb-3">
        <GlobalSchoolSelect 
          onSchoolSelect={(school) => setSelectedSchool(school)} 
        />
      </div>
      
      {selectedSchool && (
        <>
          <div className="content__container mb-5">
            <Search
              inputFields={inputFields}
              handleSearch={handleSearch}
              handleReset={handleReset}
            />
          </div>

          <div className="content__container">
           
            <StaffTable
              route="staff"
              loading={loading}
              noData="No staff members yet"
              students={staff}
              handleWithdraw={handleWithdraw}
              handleDelete={handleDelete}
              headCells={headCells}
            />
          </div>

          {staff.length > 0 && (
            <div className="d-flex justify-content-end">
              <button onClick={generatePDF} className="btn orange__btn">
                Download PDF
              </button>
            </div>
          )}
        </>
      )}
    </>
  );
}

export default AllStaff;