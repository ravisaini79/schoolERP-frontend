import React, { useEffect, useState } from "react";
import Cards from "./Cards";
import SchoolCalender from "../../components/dashboard/SchoolCalender";
import Population from "./SchoolPopulation";
import StaffPopulation from "./StaffPopulation";
import Attendance from "./Attendance";
import NoticeBoard from "../../components/dashboard/NoticeBoard";
import AcademicYear from "./AcademicYear";
import RecentActivities from "./RecentActivity";
import axios from "../../store/axios";
import Loading from "../../Loading";
import { useSelector } from "react-redux";
import { selectUser } from "../../store/slices/userSlice";
import GlobalSchoolSelect from "../../GlobalSchoolSelect";

function Index() {
  const [count, setCount] = useState({
    femaleStudents: 0,
    maleStudents: 0,
    femaleStaff: 0,
    maleStaff: 0,
  });
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedSchool, setSelectedSchool] = useState(null);
  const user = useSelector(selectUser);

  // Auto-select user's school on load
  useEffect(() => {
    if (user?._id) {
      setSelectedSchool({
        _id: user._id,
        name: user.name || "My School",
      });
    }
  }, [user]);

  // Fetch dashboard data when school changes
  useEffect(() => {
    const fetchAllData = async () => {
      if (!selectedSchool?._id) {
        setCount({
          femaleStudents: 0,
          maleStudents: 0,
          femaleStaff: 0,
          maleStaff: 0,
        });
        setEvents([]);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const [countRes, eventsRes] = await Promise.all([
          axios.get(`/count/${selectedSchool._id}`),
          axios.get(`/calendar/${selectedSchool._id}`),
        ]);

        setCount(countRes.data || {});
        setEvents(eventsRes.data || []);
      } catch (err) {
        console.error("Dashboard fetch error:", err);
        setError("Failed to load dashboard data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [selectedSchool?._id]);

  const handleSchoolSelect = (school) => {
    setSelectedSchool(school);
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header mb-3">
        <h2>Dashboard</h2>
        <GlobalSchoolSelect onSchoolSelect={handleSchoolSelect} />
        {selectedSchool?.name && (
          <div className="mt-2">
            <strong>Selected School:</strong> {selectedSchool.name}
          </div>
        )}
      </div>

      {!selectedSchool?._id ? (
        <div className="alert alert-warning">
          Please select a school to view the dashboard.
        </div>
      ) : loading ? (
        <Loading />
      ) : error ? (
        <div className="alert alert-danger">{error}</div>
      ) : (
        <>
          <Cards counts={count} />

          <div className="col-xs-12 col-sm-12 col-md-12 mb-5">
            <AcademicYear isEdit={true} />
          </div>

          <div className="row mb-5">
            <div className="col-xs-12 col-sm-12 col-md-6 mb-5">
              <SchoolCalender events={events} user={user?.role} />
            </div>
            <div className="col-xs-12 col-sm-12 col-md-6 mb-5">
              <NoticeBoard isDashboard={true} user={user?.role} />
            </div>

            {(count.femaleStudents > 0 ||
              count.maleStudents > 0 ||
              count.femaleStaff > 0 ||
              count.maleStaff > 0) && (
              <>
                <div className="col-xs-12 col-sm-12 col-md-6 mb-5">
                  <Population
                    femaleStudents={count.femaleStudents ?? 0}
                    maleStudents={count.maleStudents ?? 0}
                  />
                </div>
                <div className="col-xs-12 col-sm-12 col-md-6 mb-5">
                  <StaffPopulation
                    femaleStudents={count.femaleStaff ?? 0}
                    maleStudents={count.maleStaff ?? 0}
                  />
                </div>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default Index;
