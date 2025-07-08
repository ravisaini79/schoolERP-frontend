import React, { useState, useEffect } from "react";
import Search from "../../shared/Search";
import StudentsTable from "./Table";
import axios from "../../../store/axios";
import {
  selectYearGroup,
  selectClasses,
} from "../../../store/slices/schoolSlice";
import { useSelector } from "react-redux";
import { errorAlert, successAlert } from "../../../utils";
import { pdf } from "../../../components/tables/pdf";
import Loading from "../../../Loading";
import Modal from "./Readmit";
import GlobalSchoolSelect from "../../../GlobalSchoolSelect";

const headCells = [
  { id: "userID", numeric: false, disablePadding: false, label: "StudentID" },
  { id: "photoUrl", numeric: false, disablePadding: false, label: "Photo" },
  { id: "name", numeric: false, disablePadding: true, label: "Name" },
  {
    id: "middlename",
    disablePadding: true,
    label: "Middle Name",
  },
  { id: "surname", disablePadding: true, label: "Last Name" },
  { id: "year", disablePadding: false, label: "Graduation Year" },
  { id: "class", disablePadding: false, label: "Class" },
  { id: "Gender", disablePadding: false, label: "Gender" },
];

function PastStudents() {
  const [name, setname] = useState("");
  const [id, setid] = useState("");
  const [year, setyear] = useState("");
  const [students, setstudents] = useState([]);
  const years = useSelector(selectYearGroup);
  const classes = useSelector(selectClasses);
  const [storeData, setstoreData] = useState([]);
  const [loading, setloading] = useState(false);
  const [open, setopen] = useState(false);
  const [classID, setclass] = useState("");
  const [selectedUser, setselectedUser] = useState({});
  const [editloading, seteditloading] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState(null);

  const yearsOptions = years.map((e) => ({
    name: e.year,
    id: e.year,
  }));

  useEffect(() => {
    if (!selectedSchool) return;

    setloading(true);
    const fetchPastStudents = async () => {
      try {
        let url = `/students/past/school/${selectedSchool._id}`;
        const response = await axios.get(url);
        setstudents(response.data);
        setstoreData(response.data);
      } catch (error) {
        console.error("Error fetching past students:", error);
      } finally {
        setloading(false);
      }
    };

    fetchPastStudents();
  }, [selectedSchool]);

  const handleSchoolSelect = (school) => {
    setSelectedSchool(school);
    // Reset search fields when school changes
    setname("");
    setid("");
    setyear("");
  };

  const generatePDF = () => {
    const headers = [
      { key: "userID", label: "UserID" },
      { key: "name", label: "Name" },
      { key: "middleName", label: "Middle Name" },
      { key: "surname", label: " SurName" },
      { key: "gender", label: "Gender" },
      { key: "classID", label: "Class" },
    ];

    pdf({ data: students, headers, filename: "PastStudents" });
  };

  const handleReset = (e) => {
    e.preventDefault();
    setname("");
    setid("");
    setyear("");
    setstudents(storeData);
  };

  const inputFields = [
    {
      type: "text",
      value: id,
      label: "Search by Student ID",
      name: "Student ID",
      onChange: setid,
    },
    {
      type: "text",
      label: "Search by Name",
      value: name,
      name: "Name",
      onChange: setname,
    },
    {
      type: "select",
      options: yearsOptions,
      label: "Search by Academic Year",
      value: year,
      name: "year",
      onChange: setyear,
    },
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    let newStudents = storeData;

    if (year) {
      newStudents = newStudents.filter((i) =>
        i.classID.toLowerCase().includes(year.toLowerCase())
      );
    }
    if (name) {
      newStudents = newStudents.filter(
        (i) =>
          i.name.toLowerCase().includes(name.toLowerCase()) ||
          i.surname.toLowerCase().includes(name.toLowerCase())
      );
    }
    if (id) {
      newStudents = newStudents.filter((i) =>
        i.userID.toLowerCase().includes(id.toLowerCase())
      );
    }
    setstudents(newStudents);
  };

  const handleAdmission = (id) => {
    const selected = students.find((e) => e.userID === id);
    setselectedUser(selected);
    setopen(true);
  };

  const handleonSubmitAdmission = () => {
    seteditloading(true);
    axios
      .put(`/students/readmit/${selectedUser?.userID}`, { classID })
      .then((res) => {
        seteditloading(false);
        if (res.data.error) {
          return errorAlert(res.data.error);
        }
        setopen(false);
        successAlert("Student successfully readmitted");
        setselectedUser({});
        setclass("");
        setstudents(students.filter((e) => e.userID !== selectedUser?.userID));
      });
  };

  const handleDelete = (i) => {
    const ans = window.confirm(`Are you sure you want to delete user ${i}?`);
    if (ans) {
      axios.delete(`/user/delete/${i}`).then((res) => {
        if (res.data.error) {
          errorAlert(res.data.error);
        }
        setstudents(students.filter((e) => e.userID !== i));
      });
    }
  };

  return (
    <div>
      {/* School Selection */}
      <div className="mb-3">
        <GlobalSchoolSelect onSchoolSelect={handleSchoolSelect} />
        {selectedSchool && (
          <div className="mt-2">
            <strong>Selected School:</strong> {selectedSchool.name}
          </div>
        )}
      </div>

      {!selectedSchool ? (
        <div className="alert alert-warning">
          Please select a school to view past students.
        </div>
      ) : (
        <>
          {loading && <Loading />}

          <Search
            title="Past Students"
            handleReset={handleReset}
            handleSearch={handleSearch}
            inputFields={inputFields}
          />

          <StudentsTable
            route="students"
            handleDelete={handleDelete}
            students={students}
            noData={
              students.length === 0
                ? "No past students found for this school."
                : ""
            }
            noAction={true}
            handleWithdraw={handleAdmission}
            headCells={headCells}
          />

          <div className="d-flex justify-content-end">
            <button onClick={generatePDF} className="btn orange__btn">
              Download PDF
            </button>
          </div>

          <Modal
            classID={classID}
            setclass={setclass}
            classes={classes}
            open={open}
            loading={editloading}
            onSubmit={handleonSubmitAdmission}
            setOpen={setopen}
          />
        </>
      )}
    </div>
  );
}

export default PastStudents;
