import React, { useState, useEffect } from "react";
import AddDormitories from "./AddDormitories";
import DormitoryList from "../../shared/ListTable";
import axios from "../../../store/axios";
import Edit from "./DormitoriesModal";
import { errorAlert, successAlert } from "../../../utils";
import { useDispatch } from "react-redux";
import { setDormitories } from "../../../store/slices/schoolSlice";
import GlobalSchoolSelect from "../../../GlobalSchoolSelect";
import Loading from "../../../Loading";

const tableHeader = [
  { id: "_id", name: "ID" },
  { id: "name", name: "Name" },
  { id: "createdAt", name: "Added" },
];

function Dormitories() {
  const [dormitories, setdormitories] = useState([]);
  const [open, setopen] = useState(false);
  const [name, setname] = useState("");
  const [editname, seteditname] = useState("");
  const [loading, setloading] = useState(false);
  const [editID, seteditID] = useState("");
  const [createLoading, setcreateLoading] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    if (!selectedSchool) return;

    setIsLoading(true);
    const fetchDormitories = async () => {
      try {
        const url = `/dormitories/school/${selectedSchool._id}`;
        const response = await axios.get(url);
        setdormitories(response.data);
        dispatch(setDormitories(response.data));
      } catch (error) {
        console.error("Error fetching dormitories:", error);
        errorAlert("Failed to fetch dormitories");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDormitories();
  }, [selectedSchool, dispatch]);

  const handleDelete = (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this dormitory?");
    if (!confirmDelete) return;

    setloading(true);
    axios
      .delete(`/dormitories/delete/${id}`)
      .then(async (res) => {
        setloading(false);
        if (res.data.error) {
          errorAlert(res.data.error);
          return;
        }
        const updated = dormitories.filter((i) => i._id !== id);
        setdormitories(updated);
        dispatch(setDormitories(updated));
        await axios.post("/activitylog/create", {
          activity: `Dormitory ${id} was deleted from school ${selectedSchool?.name || "unknown"}`,
          user: "admin",
        });
        successAlert("Dormitory deleted successfully");
      })
      .catch((err) => {
        setloading(false);
        console.log(err);
        errorAlert("Something went wrong");
      });
  };

  const handleCreate = (e) => {
    e.preventDefault();

    if (!selectedSchool) {
      errorAlert("Please select a school first");
      return;
    }

    setcreateLoading(true);
    axios
      .post("/dormitories/create", {
        name,
        user_Id: selectedSchool._id,
      })
      .then(async (res) => {
        setcreateLoading(false);
        if (res.data.error) {
          errorAlert(res.data.error);
          return;
        }
        successAlert("Dormitory created successfully");
        const updated = [res.data.doc, ...dormitories];
        setdormitories(updated);
        dispatch(setDormitories(updated));
        await axios.post("/activitylog/create", {
          activity: `New dormitory ${name} added to school ${selectedSchool.name}`,
          user: "admin",
        });
        setname("");
      })
      .catch((err) => {
        setcreateLoading(false);
        console.log(err);
        errorAlert("Something went wrong");
      });
  };

  const handleEdit = (id) => {
    setopen(true);
    const editDormitory = dormitories.find((e) => e._id === id);
    seteditname(editDormitory?.name);
    seteditID(editDormitory?._id);
  };

  const onEdit = () => {
    setloading(true);
    axios
      .put(`/dormitories/update/${editID}`, {
        name: editname,
        user_Id: selectedSchool?._id,
      })
      .then(async (res) => {
        setloading(false);
        if (res.data.error) {
          errorAlert(res.data.error);
          return;
        }
        const updated = dormitories.map((i) => (i._id === editID ? res.data.docs : i));
        setdormitories(updated);
        dispatch(setDormitories(updated));
        await axios.post("/activitylog/create", {
          activity: `Dormitory ${editname} was updated in school ${selectedSchool?.name || "unknown"}`,
          user: "admin",
        });
        successAlert("Dormitory updated successfully");
        seteditname("");
        setopen(false);
      })
      .catch((err) => {
        setloading(false);
        errorAlert("Something went wrong");
      });
  };

  const handleSchoolSelect = (school) => {
    setSelectedSchool(school);
    setdormitories([]);
    setname("");
  };

  return (
    <div className="dormitories__page">
      <h3>Dormitories</h3>

      <div className="mb-4">
        <GlobalSchoolSelect onSchoolSelect={handleSchoolSelect} />
        {selectedSchool && (
          <div className="mt-2">
            <strong>Selected School:</strong> {selectedSchool.name}
          </div>
        )}
      </div>

      {isLoading ? (
        <Loading />
      ) : selectedSchool ? (
        <>
          <div className="row">
            <div className="col-sm-12 mb-5">
              <AddDormitories
                name={name}
                setname={setname}
                loading={createLoading}
                onSubmit={handleCreate}
                disabled={false}
              />
            </div>
            <div className="col-sm-12">
              <DormitoryList
                handleDelete={handleDelete}
                handleEdit={handleEdit}
                data={dormitories}
                tableHeader={tableHeader}
                noData="No dormitories found for this school"
              />
            </div>
          </div>

          <Edit
            open={open}
            setopen={setopen}
            name={editname}
            setname={seteditname}
            onSubmit={onEdit}
            loading={loading}
          />
        </>
      ) : (
        <div className="alert alert-info">
          Please select a school to view and manage dormitories.
        </div>
      )}
    </div>
  );
}

export default Dormitories;