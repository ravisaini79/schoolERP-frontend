import React, { useState, useEffect } from "react";
import CourseTable from "../../shared/ListTable";
import Search from "../../shared/Search";
import axios from "../../../store/axios";
import { errorAlert, successAlert } from "../../../utils";
import DivisionForm from "./DepartmentForm";
import { useDispatch } from "react-redux";
import { setDepartments } from "../../../store/slices/schoolSlice";
import GlobalSchoolSelect from "../../../GlobalSchoolSelect";
import Loading from "../../../Loading";

const tableHeadings = [
  { id: "createdAt", name: "Created At" },
  { id: "name", name: "Name" },
  { id: "description", name: "Description" },
];

function Division() {
  const [name, setname] = useState("");
  const [searchQuery, setsearchQuery] = useState("");
  const [description, setdescription] = useState("");
  const [loading, setloading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editID, seteditID] = useState("");
  const [addLoading, setaddLoading] = useState(false);
  const [departments, setdepartments] = useState([]);
  const [storedata, setstoredata] = useState([]);
  const [openEdit, setopenEdit] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    if (!selectedSchool) {
      setdepartments([]);
      return;
    }

    setIsLoading(true);
    axios.get(`/departments/school/${selectedSchool._id}`)
      .then((res) => {
        setdepartments(res.data);
        setstoredata(res.data);
        dispatch(setDepartments(res.data));
      })
      .catch((err) => {
        console.log(err);
        errorAlert("Failed to fetch departments");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [selectedSchool, dispatch]);

  const inputFields = [
    {
      type: "text",
      label: "Search Name",
      value: searchQuery,
      name: "name",
      onChange: setsearchQuery,
    },
  ];

  const handleDelete = (id) => {
    const ans = window.confirm("Are you sure you want to delete this department?");
    if (!ans) return;

    setloading(true);
    axios.delete(`/departments/delete/${id}`)
      .then(async (res) => {
        if (res.data.error) {
          errorAlert(res.data.error);
          return;
        }
        const updated = departments.filter((e) => e._id !== id);
        setdepartments(updated);
        dispatch(setDepartments(updated));
        let deleted = departments.find((e) => e._id === id);
        await axios.post("/activitylog/create", {
          activity: `Department ${deleted?.name} was deleted from school ${selectedSchool?.name || "unknown"}`,
          user: "admin",
        });
        successAlert("Department deleted successfully");
      })
      .catch((err) => {
        console.log(err);
        errorAlert("Failed to delete department");
      })
      .finally(() => {
        setloading(false);
      });
  };

  const handleEdit = (id) => {
    const department = departments.find((e) => e._id === id);
    if (department) {
      setopenEdit(true);
      seteditID(id);
      setname(department.name);
      setdescription(department.description);
    }
  };

  const handleOpenAdd = () => {
    if (!selectedSchool) {
      errorAlert("Please select a school first");
      return;
    }
    setOpen(true);
  };

  const handleAddDepartment = () => {
    if (!selectedSchool) {
      errorAlert("Please select a school first");
      return;
    }

    if (!name.trim()) {
      errorAlert("Please enter a department name");
      return;
    }

    setaddLoading(true);
    axios.post("/departments/create", {
      name,
      description,
      user_Id: selectedSchool._id
    })
      .then(async (res) => {
        if (res.data.error) {
          errorAlert(res.data.error);
          return;
        }
        successAlert("Department created successfully");
        setOpen(false);
        setname("");
        setdescription("");
        const updated = [res.data.doc, ...departments];
        setdepartments(updated);
        dispatch(setDepartments(updated));
        await axios.post("/activitylog/create", {
          activity: `New department ${res.data.doc?.name} added to school ${selectedSchool.name}`,
          user: "admin",
        });
      })
      .catch((err) => {
        console.log(err);
        errorAlert("Failed to add department");
      })
      .finally(() => {
        setaddLoading(false);
      });
  };

  const handleEditDepartment = () => {
    if (!name.trim()) {
      errorAlert("Please enter a department name");
      return;
    }

    setaddLoading(true);
    axios.put(`/departments/update/${editID}`, {
      name,
      description,
      user_Id: selectedSchool?._id
    })
      .then(async (res) => {
        if (res.data.error) {
          errorAlert(res.data.error);
          return;
        }
        successAlert("Department updated successfully");
        setopenEdit(false);
        setname("");
        setdescription("");
        const updated = departments.map((i) => 
          i._id === editID ? res.data.doc : i
        );
        setdepartments(updated);
        dispatch(setDepartments(updated));
        await axios.post("/activitylog/create", {
          activity: `Department ${res.data.doc?.name} was updated in school ${selectedSchool?.name || "unknown"}`,
          user: "admin",
        });
      })
      .catch((err) => {
        console.log(err);
        errorAlert("Failed to update department");
      })
      .finally(() => {
        setaddLoading(false);
      });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    let newDepartments = [];
    if (searchQuery) {
      newDepartments = storedata.filter(
        (i) =>
          i?.name.toLowerCase().includes(searchQuery?.toLowerCase()) ||
          i?.description.toLowerCase().includes(searchQuery?.toLowerCase())
      );
    }
    setdepartments(newDepartments);
  };

  const handleReset = (e) => {
    e.preventDefault();
    setdepartments(storedata);
    setsearchQuery("");
  };

  const handleSchoolSelect = (school) => {
    setSelectedSchool(school);
    setdepartments([]);
    setname("");
    setdescription("");
  };

  return (
    <div>
      <div className="mb-4">
        <GlobalSchoolSelect onSchoolSelect={handleSchoolSelect} />
        {selectedSchool && (
          <div className="mt-2">
            <strong>Selected School:</strong> {selectedSchool.name}
          </div>
        )}
      </div>

      <Search
        handleReset={handleReset}
        handleSearch={handleSearch}
        title="Search for a department"
        inputFields={inputFields}
      />

      <div className="content__container">
        <div className="d-flex justify-content-between mb-2">
          <h3>Department List</h3>
          <button onClick={handleOpenAdd} className="btn orange__btn btn__lg">
            Add New Departments
          </button>
        </div>
        
        {isLoading ? (
          <Loading />
        ) : selectedSchool ? (
          <CourseTable
            handleEdit={handleEdit}
            handleDelete={handleDelete}
            data={departments}
            noData="No departments found for this school"
            handleSearch={handleSearch}
            tableHeader={tableHeadings}
          />
        ) : (
          <div className="alert alert-info">
            Please select a school to view and manage departments.
          </div>
        )}
      </div>

      <DivisionForm
        open={openEdit}
        setOpen={setopenEdit}
        loading={addLoading}
        description={description}
        setdescription={setdescription}
        name={name}
        isEdit={true}
        onSubmit={handleEditDepartment}
        setname={setname}
      />
      <DivisionForm
        open={open}
        setOpen={setOpen}
        loading={addLoading}
        description={description}
        setdescription={setdescription}
        name={name}
        onSubmit={handleAddDepartment}
        setname={setname}
      />
    </div>
  );
}

export default Division;