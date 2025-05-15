import React, { useState, useEffect } from "react";
import Search from "./Search";
import StudentsTable from "../../shared/TableListUsers";
import axios from "../../../store/axios";
import { selectClasses } from "../../../store/slices/schoolSlice";
import { useSelector } from "react-redux";
import { errorAlert } from "../../../utils";
import { pdf } from "../../../components/tables/pdf";
import { Link } from "react-router-dom";
import { studentStatus } from "../../../data";
import AddIcon from "@material-ui/icons/Add";
import Loading from "../../../Loading";
import GlobalSchoolSelect from "../../../GlobalSchoolSelect";
import { selectUser } from "../../../store/slices/userSlice";

const headCells = [
  { id: "userID", numeric: false, disablePadding: false, label: "StudentID" },
  { id: "photoUrl", numeric: false, disablePadding: false, label: "Photo" },
  { id: "name", numeric: false, disablePadding: true, label: "Name" },
  { id: "middlename", disablePadding: true, label: "Middle Name" },
  { id: "surname", disablePadding: true, label: "Last Name" },
  { id: "status", disablePadding: false, label: "Status" },
  { id: "class", disablePadding: false, label: "Class" },
  { id: "Gender", disablePadding: false, label: "Gender" },
];

function AllStudents() {
  const [name, setname] = useState("");
  const [id, setid] = useState("");
  const [classID, setclass] = useState("");
  const [status, setstatus] = useState("");
  const [students, setstudents] = useState([]);
  const [gender, setgender] = useState("");
  const classes = useSelector(selectClasses);
  const [storeData, setstoreData] = useState([]);
  const [loading, setloading] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState(null);
  const user = useSelector(selectUser);

  const classesOptions = classes.map((e) => ({
    name: e.name,
    id: e.classCode,
  }));

  useEffect(() => {
    const fetchStudents = async () => {
      if (!selectedSchool?._id) {
        setstudents([]); // Clear student list if no school is selected
        return;
      }

      setloading(true);
      try {
        const url = `/students/school/${selectedSchool._id}`;
        const response = await axios.get(url);
        setstudents(response.data);
        setstoreData(response.data);
      } catch (error) {
        console.error("Error fetching students:", error);
      } finally {
        setloading(false);
      }
    };

    fetchStudents();
  }, [selectedSchool]);

  const handleSchoolSelect = (school) => {
    setSelectedSchool(school);
    setname("");
    setid("");
    setclass("");
    setstatus("");
    setgender("");

    if (!school?._id) {
      setstudents([]);
      setstoreData([]);
    }
  };

  const generatePDF = () => {
    const headers = [
      { key: "userID", label: "UserID" },
      { key: "name", label: "Name" },
      { key: "middleName", label: "Middle Name" },
      { key: "surname", label: " SurName" },
      { key: "gender", label: "Gender" },
      { key: "status", label: "Status" },
      { key: "classID", label: "Class" },
    ];
    pdf({ data: students, headers, filename: "Allstudents" });
  };

  const handleReset = (e) => {
    e.preventDefault();
    setname("");
    setid("");
    setclass("");
    setstatus("");
    setgender("");
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
      options: classesOptions,
      label: "Search by Class",
      value: classID,
      name: "class",
      onChange: setclass,
    },
    {
      type: "select",
      options: [
        { id: "female", name: "female" },
        { id: "male", name: "male" },
        { id: "other", name: "other" },
      ],
      label: "Search by Gender",
      value: gender,
      name: "gender",
      onChange: setgender,
    },
    {
      type: "select",
      options: studentStatus,
      label: "Search by Status",
      value: status,
      name: "status",
      onChange: setstatus,
    },
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    let newStudents = storeData;

    if (classID) {
      newStudents = newStudents.filter((i) =>
        i.classID.toLowerCase().includes(classID.toLowerCase())
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
    if (status) {
      newStudents = newStudents.filter((i) =>
        i.status.toLowerCase().includes(status.toLowerCase())
      );
    }
    if (gender) {
      newStudents = newStudents.filter((i) =>
        i.gender.toLowerCase().includes(gender.toLowerCase())
      );
    }

    setstudents(newStudents);
  };

  const handleDelete = (i) => {
    let ans = window.confirm(`Are sure you want to delete user ${i}`);
    if (ans) {
      axios.delete(`/user/delete/${i}`).then((res) => {
        if (res.data.error) {
          errorAlert(res.data.error);
        }
        setstudents(students.filter((e) => e.userID !== i));
      });
    }
  };

  const handleWithdraw = (i) => {
    let ans = window.confirm(
      `Are you sure you want to withdraw this student ${i}`
    );
    if (ans) {
      axios.put(`/students/update/${i}`, { withdraw: true }).then((res) => {
        if (res.data.error) {
          errorAlert(res.data.error);
        }
        setstudents(students.filter((e) => e.userID !== i));
      });
    }
  };

  return (
    <div>
      {loading && <Loading />}

      <div className="mb-3">
        <GlobalSchoolSelect onSchoolSelect={handleSchoolSelect} />
        {selectedSchool && selectedSchool.name && (
          <div className="mt-2">
            <strong>Selected School:</strong> {selectedSchool.name}
          </div>
        )}
      </div>

      {selectedSchool?._id ? (
        <>
          <Search
            title=""
            handleReset={handleReset}
            handleSearch={handleSearch}
            inputFields={inputFields}
          />

          <div className="d-flex justify-content-end mb-3">
            <Link className="btn btn-outline-info" to="/students/new">
              <AddIcon /> Add New Student
            </Link>
          </div>

          <StudentsTable
            route="students"
            handleWithdraw={handleWithdraw}
            handleDelete={handleDelete}
            students={students}
            noData="No students found for the selected criteria"
            headCells={headCells}
          />

          <div className="d-flex justify-content-end">
            <button onClick={generatePDF} className="btn orange__btn">
              Download PDF
            </button>
          </div>
        </>
      ) : (
        <div className="alert alert-warning mt-4">
          Please select a school to view students.
        </div>
      )}
    </div>
  );
}

export default AllStudents;
