import React, { useState, useEffect } from "react";
import AddCampus from "./AddCampus";
import ListCampus from "../../shared/ListTable";
import EditCampus from "./EditCampuses";
import axios from "../../../store/axios";
import { errorAlert, successAlert } from "../../../utils";
import { useDispatch } from "react-redux";
import { setCampuses } from "../../../store/slices/schoolSlice";
import GlobalSchoolSelect from "../../../GlobalSchoolSelect";
import Loading from "../../../Loading";

const tableHeader = [
  { id: "name", name: "Name" },
  { id: "location", name: "Location" },
  { id: "createdAt", name: "Added" },
];

function Campuses() {
  const [openEdit, setopenEdit] = useState(false);
  const [name, setname] = useState("");
  const [location, setlocation] = useState("");
  const [editname, seteditname] = useState("");
  const [editlocation, seteditlocation] = useState("");
  const [id, setid] = useState("");
  const [loading, setloading] = useState(false);
  const [createLoading, setcreateLoading] = useState(false);
  const [campuses, setcampuses] = useState([]);
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();

  const handleDelete = (delID) => {
    setloading(true);
    axios
      .delete(`/campuses/delete/${delID}`)
      .then(async (res) => {
        setloading(false);
        if (res.data.error) {
          errorAlert(res.data.error);
          return;
        }
        setcampuses(campuses.filter((i) => i._id !== delID));
        dispatch(setCampuses(campuses.filter((i) => i._id !== delID)));
        await axios.post("/activitylog/create", {
          activity: `Campus ${id} was deleted`,
          user: "admin",
        });
      })
      .catch((err) => {
        setloading(false);
        console.error(err);
        errorAlert("Something went wrong");
      });
  };

  const handleEdit = (editID) => {
    setopenEdit(true);
    const editCampus = campuses.find((e) => e._id === editID);
    seteditlocation(editCampus?.location || "");
    seteditname(editCampus?.name || "");
    setid(editCampus?._id || "");
  };

  const onEdit = () => {
    setloading(true);
    axios
      .put(`/campuses/update/${id}`, {
        name: editname,
        location: editlocation,
        schoolId: selectedSchool?._id,
      })
      .then(async (res) => {
        setloading(false);
        setopenEdit(false);
        if (res.data.error) {
          errorAlert(res.data.error);
          return;
        }
        successAlert("Campus successfully edited");
        setcampuses(campuses.map((i) => (i._id === id ? res.data.doc : i)));
        dispatch(
          setCampuses(campuses.map((i) => (i._id === id ? res.data.doc : i)))
        );
        await axios.post("/activitylog/create", {
          activity: `Campus ${editname} was edited`,
          user: "admin",
        });
      })
      .catch((err) => {
        setloading(false);
        console.error(err);
        errorAlert("Something went wrong");
      });
  };

  useEffect(() => {
    setIsLoading(true);
    const fetchCampuses = async () => {
      try {
        let url = "/campuses";
        if (selectedSchool) {
          url = `/campuses/school/${selectedSchool._id}`; // Ensure backend supports this
        }
        const response = await axios.get(url);
        setcampuses(response.data);
        dispatch(setCampuses(response.data));
      } catch (error) {
        console.error("Error fetching campuses:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCampuses();
  }, [selectedSchool, dispatch]);


  const handleAddCampus = () => {
    if (!selectedSchool) {
      errorAlert("Please select a school first");
      return;
    }
  
    setcreateLoading(true);
    axios
      .post("/campuses/create", {
        name,
        location,
        schoolId: selectedSchool._id, // Will be mapped to user_Id in backend
      })
      .then(async (res) => {
        setcreateLoading(false);
        if (res.data.error) {
          errorAlert(res.data.error);
          return;
        }
        successAlert("Campus successfully created");
        dispatch(setCampuses([res.data.doc, ...campuses]));
        setcampuses([res.data.doc, ...campuses]);
        await axios.post("/activitylog/create", {
          activity: `New campus ${name} was created for school ${selectedSchool.name}`,
          user: "admin",
        });
        setname("");
        setlocation("");
      })
      .catch((err) => {
        setcreateLoading(false);
        errorAlert(err.response?.data?.error || "Something went wrong");
      });
  };

  const handleSchoolSelect = (school) => {
    setSelectedSchool(school);
    setname("");
    setlocation("");
  };

  return (
    <div>
      <h3>Campuses</h3>

      {/* School Selection */}
      <div className="mb-4">
        <GlobalSchoolSelect onSchoolSelect={handleSchoolSelect} />
        {selectedSchool ? (
          <div className="mt-2">
            <strong>Selected School:</strong> {selectedSchool.name}
          </div>
        ) : (
          <div className="alert alert-warning mt-2">
        Please select a school to view and manage campuses.
          </div>
        )}
      </div>

      {isLoading ? (
  <Loading />
) : selectedSchool ? (
  <>
    <div className="row">
      <div className="col-sm-12 mb-5">
        <AddCampus
          loading={createLoading}
          name={name}
          location={location}
          setname={setname}
          setlocation={setlocation}
          onSubmit={handleAddCampus}
          disabled={false}  // can enable since school is selected
        />
      </div>
      <div className="col-sm-12">
        <ListCampus
          handleEdit={handleEdit}
          handleDelete={handleDelete}
          data={campuses}
          tableHeader={tableHeader}
          noData="No campuses found for this school"
        />
      </div>
    </div>

    <EditCampus
      open={openEdit}
      loading={loading}
      setopen={setopenEdit}
      name={editname}
      location={editlocation}
      setname={seteditname}
      setlocation={seteditlocation}
      onSubmit={onEdit}
    />
  </>
) : (
  <>
  </>
)}

    </div>
  );
}

export default Campuses;
