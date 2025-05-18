import React, { useState, useEffect } from "react";
import AddSection from "./AddSection";
import ListSection from "../../shared/ListTable";
import EditSection from "./EditSection";
import axios from "../../../store/axios";
import { errorAlert, successAlert } from "../../../utils";
import { useDispatch } from "react-redux";
import { setSections } from "../../../store/slices/schoolSlice";
import GlobalSchoolSelect from "../../../GlobalSchoolSelect";
import Loading from "../../../Loading";

const tableHeader = [
  { id: "_id", name: "ID" },
  { id: "name", name: "Section" },
  { id: "createdAt", name: "Added" },
];

function Sections() {
  const [openEdit, setopenEdit] = useState(false);
  const [name, setname] = useState("");
  const [editname, seteditname] = useState("");
  const [id, setid] = useState("");
  const [loading, setloading] = useState(false);
  const [createLoading, setcreateLoading] = useState(false);
  const [sections, setsections] = useState([]);
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    if (!selectedSchool) {
      setsections([]);
      return;
    }

    setIsLoading(true);
    axios.get(`/sections/school/${selectedSchool._id}`)
      .then((res) => {
        setsections(res.data);
        dispatch(setSections(res.data));
      })
      .catch((err) => {
        console.log(err);
        errorAlert("Failed to fetch sections");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [selectedSchool, dispatch]);

  const handleDelete = (delID) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this section?");
    if (!confirmDelete) return;

    setloading(true);
    axios.delete(`/sections/delete/${delID}`)
      .then(async (res) => {
        if (res.data.error) {
          errorAlert(res.data.error);
          return;
        }
        const updated = sections.filter((i) => i._id !== delID);
        setsections(updated);
        dispatch(setSections(updated));
        await axios.post("/activitylog/create", {
          activity: `Section ${id} was deleted from school ${selectedSchool?.name || "unknown"}`,
          user: "admin",
        });
        successAlert("Section deleted successfully");
      })
      .catch((err) => {
        console.log(err);
        errorAlert("Something went wrong");
      })
      .finally(() => {
        setloading(false);
      });
  };

  const handleEdit = (editID) => {
    const editSection = sections.find((e) => e._id === editID);
    if (editSection) {
      setopenEdit(true);
      seteditname(editSection.name);
      setid(editID);
    }
  };

  const onEdit = () => {
    if (!editname.trim()) {
      errorAlert("Please enter a section name");
      return;
    }

    setloading(true);
    axios.put(`/sections/update/${id}`, { 
      name: editname,
      user_Id: selectedSchool?._id // Maintain school association
    })
      .then(async (res) => {
        if (res.data.error) {
          errorAlert(res.data.error);
          return;
        }
        const updated = sections.map((i) => 
          i._id === id ? { ...i, name: editname } : i
        );
        setsections(updated);
        dispatch(setSections(updated));
        await axios.post("/activitylog/create", {
          activity: `Section ${editname} was updated in school ${selectedSchool?.name || "unknown"}`,
          user: "admin",
        });
        successAlert("Section updated successfully");
        setopenEdit(false);
      })
      .catch((err) => {
        console.log(err);
        errorAlert("Something went wrong");
      })
      .finally(() => {
        setloading(false);
      });
  };

  const handleAddSection = (e) => {
    e.preventDefault();
    
    if (!selectedSchool) {
      errorAlert("Please select a school first");
      return;
    }

    if (!name.trim()) {
      errorAlert("Please enter a section name");
      return;
    }

    setcreateLoading(true);
    axios.post("/sections/create", { 
      name,
      user_Id: selectedSchool._id // Associate with selected school
    })
      .then(async (res) => {
        if (res.data.error) {
          errorAlert(res.data.error);
          return;
        }
        successAlert("Section created successfully");
        const updated = [res.data.doc, ...sections];
        setsections(updated);
        dispatch(setSections(updated));
        await axios.post("/activitylog/create", {
          activity: `New section ${name} added to school ${selectedSchool.name}`,
          user: "admin",
        });
        setname("");
      })
      .catch((err) => {
        console.log(err);
        errorAlert("Something went wrong");
      })
      .finally(() => {
        setcreateLoading(false);
      });
  };

  const handleSchoolSelect = (school) => {
    setSelectedSchool(school);
    setsections([]);
    setname("");
  };

  return (
    <div>
      <h3>Sections</h3>
      
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
              <AddSection
                loading={createLoading}
                name={name}
                setname={setname}
                onSubmit={handleAddSection}
              />
            </div>
            <div className="col-sm-12">
              <ListSection
                handleEdit={handleEdit}
                handleDelete={handleDelete}
                loading={isLoading}
                data={sections}
                tableHeader={tableHeader}
                noData="No sections found for this school"
              />
            </div>
          </div>

          <EditSection
            open={openEdit}
            loading={loading}
            setopen={setopenEdit}
            name={editname}
            setname={seteditname}
            onSubmit={onEdit}
          />
        </>
      ) : (
        <div className="alert alert-info">
          Please select a school to view and manage sections.
        </div>
      )}
    </div>
  );
}

export default Sections;