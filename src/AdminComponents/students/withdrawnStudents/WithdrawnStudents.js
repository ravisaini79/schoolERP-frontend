import React, { useState, useEffect } from "react";
import Search from "../../shared/Search";
import StudentsTable from "../../shared/TableListUsers";
import axios from "../../../store/axios";
import { selectClasses } from "../../../store/slices/schoolSlice";
import { useSelector } from "react-redux";
import { errorAlert } from "../../../utils";
import { pdf } from "../../../components/tables/pdf";
import GlobalSchoolSelect from "../../../GlobalSchoolSelect";
import Loading from "../../../Loading";

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

function WithdrawnStudents() {
  const [name, setname] = useState("");
  const [id, setid] = useState("");
  const [classID, setclass] = useState("");
  const [students, setstudents] = useState([]);
  const classes = useSelector(selectClasses);
  const [storeData, setstoreData] = useState([]);
  const [loading, setloading] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState(null);

  const classesOptions = classes.map((e) => ({
    name: e.name,
    id: e.classCode,
  }));

  useEffect(() => {
    if (!selectedSchool) return;

    setloading(true);
    const fetchWithdrawnStudents = async () => {
      try {
        const url = `/students/withdraw/${selectedSchool._id}`;
        const response = await axios.get(url);
        setstudents(response.data);
        setstoreData(response.data);
      } catch (error) {
        console.error("Error fetching withdrawn students:", error);
      } finally {
        setloading(false);
      }
    };

    fetchWithdrawnStudents();
  }, [selectedSchool]);

  const handleSchoolSelect = (school) => {
    setSelectedSchool(school);
    setname("");
    setid("");
    setclass("");
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
    pdf({ data: students, headers, filename: "WithdrawnStudents" });
  };

  const handleReset = (e) => {
    e.preventDefault();
    setname("");
    setid("");
    setclass("");
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
      label: "Search by Section",
      value: classID,
      name: "Class",
      onChange: setclass,
    },
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    let newStudents = storeData;

    if (classID) {
      newStudents = newStudents.filter((i) =>
        i.classID?.toLowerCase().includes(classID.toLowerCase())
      );
    }
    if (name) {
      newStudents = newStudents.filter(
        (i) =>
          i.name?.toLowerCase().includes(name.toLowerCase()) ||
          i.surname?.toLowerCase().includes(name.toLowerCase())
      );
    }
    if (id) {
      newStudents = newStudents.filter((i) =>
        i.userID?.toLowerCase().includes(id.toLowerCase())
      );
    }
    setstudents(newStudents);
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

  const handleWithdraw = (i) => {
    const ans = window.confirm(
      `Are you sure you want to reinstate this student ${i}?`
    );
    if (ans) {
      axios.put(`/students/update/${i}`, { withdraw: false }).then((res) => {
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

      {/* School Selection */}
      <div className="mb-3">
        <GlobalSchoolSelect onSchoolSelect={handleSchoolSelect} />
        {selectedSchool && (
          <div className="mt-2">
            <strong>Selected School:</strong> {selectedSchool.name}
          </div>
        )}
      </div>

      {/* No School Selected Message */}
      {!selectedSchool ? (
        <div className="alert alert-warning">
          Please select a school to view withdrawn students.
        </div>
      ) : (
        <>
          <Search
            title="Withdrawn Students"
            handleReset={handleReset}
            handleSearch={handleSearch}
            inputFields={inputFields}
          />

          <StudentsTable
            route="students"
            isWithdraw={true}
            handleWithdraw={handleWithdraw}
            handleDelete={handleDelete}
            students={students}
            headCells={headCells}
            noData="No withdrawn students found for this school."
          />

          <div className="d-flex justify-content-end">
            <button onClick={generatePDF} className="btn orange__btn">
              Download PDF
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default WithdrawnStudents;
