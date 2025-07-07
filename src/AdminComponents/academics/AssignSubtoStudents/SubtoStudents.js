import React, { useState, useEffect } from "react";
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Checkbox,
  Paper,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
} from "@material-ui/core";
import axios from "../../../store/axios";
import { use } from "react";

// Dummy Subjects (MongoDB _id format)

// Dummy Subject Groups (MongoDB _id format)
const subjectGroups = [
  {
    _id: "655f2200e1d56c1234567890",
    name: "Science Group",
    subjects: ["655f21a9e1d56c1234567890", "655f21a9e1d56c1234567891"], // Math, Science
  },
  {
    _id: "655f2200e1d56c1234567891",
    name: "Humanities Group",
    subjects: ["655f21a9e1d56c1234567892", "655f21a9e1d56c1234567893"], // History, Geography
  },
];

// Dummy Students
const studentMock = [
  {
    _id: "655f2250e1d56c1234567890",
    name: "Ravi",
    middlename: "Kumar",
    surname: "Saini",
    class_id: "10A",
  },
  {
    _id: "655f2250e1d56c1234567891",
    name: "Anita",
    middlename: "",
    surname: "Sharma",
    class_id: "10A",
  },
];

// Dummy Classes
const classesMock = [
  { _id: "10A", name: "Class 10A" },
  { _id: "9B", name: "Class 9B" },
];

const AssignSubjects = () => {
  const [students, setStudents] = useState([]);
  const [groups, setGroups] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [assignedSubjects, setAssignedSubjects] = useState({});
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("");
  const [classes, setClasses] = useState([]);

  const user = JSON.parse(localStorage.getItem("LoggerInUser") || "{}");

  useEffect(() => {
    getClasses();
    fetchGroups();
    // const fetchAssignedSubjects = async () => {
    //   try {
    //     const res = await axios.get(
    //       `/assignsubjects/list?class_id=${selectedClass}&subject_group_id=${selectedGroup}`
    //     );
    //     const result = {};

    //     res.data.forEach((item) => {
    //       result[item.student_id] = item.subject_ids; // subject_ids should be an array
    //     });

    //     setAssignedSubjects(result);
    //   } catch (error) {
    //     console.error("Error fetching assigned subjects:", error);
    //   }
    // };

    if (selectedClass && selectedGroup) {
      // fetchAssignedSubjects();
    }
  }, [selectedClass, selectedGroup]);

  const handleClassChange = (e) => {
    const classId = e.target.value;
    setSelectedClass(classId);
    getStudents(classId);
    setAssignedSubjects({});
    const filteredStudents = studentMock.filter((s) => s.class_id === classId);
    setStudents(filteredStudents);
  };

  const handleGroupChange = (e) => {
    console.log("select group>>>", e.target.value);
    setSubjects(e.target.value.subjectIds);
    setSelectedGroup(e.target.value._id);
    setAssignedSubjects({});
  };

  const getStudents = async (classId) => {
    try {
      const res = await axios.get(`/students/getAll/${classId}/${user._id}`);

      if (res.data.length > 0) {
        setStudents(res.data);
      } else {
        setStudents([]);
      }
    } catch (error) {
      console.error("Error fetching students:", error);
    }
  };

  const getClasses = () => {
    try {
      axios.get(`/classes/getby/${user._id}`).then((res) => {
        setClasses(res.data);
      });
    } catch (error) {
      console.error("Error fetching class:", error);
    }
  };

  const fetchGroups = async () => {
    try {
      const res = await axios.get(`/subject-groups/group/${user._id}`);
      setGroups(res.data.groups);
    } catch (err) {
      console.error("Error fetching groups:", err);
    }
  };

  const handleCheckboxChange = (studentId, subjectId) => {
    setAssignedSubjects((prev) => {
      const currentSubjects = prev[studentId] || [];
      const updated = currentSubjects.includes(subjectId)
        ? currentSubjects.filter((id) => id !== subjectId)
        : [...currentSubjects, subjectId];
      return { ...prev, [studentId]: updated };
    });
  };

  const isChecked = (studentId, subjectId) =>
    assignedSubjects[studentId]?.includes(subjectId);

  const handleHeaderCheckbox = (subjectId) => {
    const allChecked = students.every((student) =>
      assignedSubjects[student._id]?.includes(subjectId)
    );

    const updatedAssignments = {};

    students.forEach((student) => {
      const current = assignedSubjects[student._id] || [];

      if (allChecked) {
        // Unassign subject
        updatedAssignments[student._id] = current.filter(
          (id) => id !== subjectId
        );
      } else {
        // Assign subject if not already present
        updatedAssignments[student._id] = current.includes(subjectId)
          ? current
          : [...current, subjectId];
      }
    });

    setAssignedSubjects((prev) => ({
      ...prev,
      ...updatedAssignments,
    }));
  };

  const isHeaderChecked = (subjectId) =>
    students.length > 0 &&
    students.every((student) =>
      assignedSubjects[student._id]?.includes(subjectId)
    );

  const selectedGroupData = subjectGroups.find((g) => g._id === selectedGroup);
  const groupSubjectIds = selectedGroupData?.subjects || [];
  // const subjects = subjects.filter((s) =>
  //   groupSubjectIds.includes(s._id)
  // );

  const handleSave = async () => {
    if (!selectedClass || !selectedGroup) {
      alert("Please select both Class and Subject Group.");
      return;
    }

    try {
      const assignments = Object.entries(assignedSubjects).map(
        ([studentId, subjectIds]) => ({
          student_id: studentId,
          user_id: user._id,
          class_id: selectedClass,
          subject_group_id: selectedGroup,
          subject_ids: subjectIds,
        })
      );

      for (const assignment of assignments) {
        await axios.post("/assignsubjects/create", assignment);
      }

      alert("Assignments saved successfully!");
    } catch (error) {
      console.error("Error saving assignments:", error);
      alert("Failed to save assignments. Check console for details.");
    }
  };

  console.log("select subjects>>>", subjects);

  return (
    <Paper style={{ padding: 20, overflowX: "auto" }}>
      <Typography variant="h6" gutterBottom>
        Assign Subject Group to Class (and Students)
      </Typography>

      <div style={{ display: "flex", gap: 20, marginBottom: 20 }}>
        <FormControl style={{ minWidth: 200 }}>
          <InputLabel>Select Class</InputLabel>
          <Select value={selectedClass} onChange={handleClassChange}>
            <MenuItem value="">All Classes</MenuItem>
            {classes.map((cls) => (
              <MenuItem key={cls._id} value={cls._id}>
                {cls.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl style={{ minWidth: 200 }}>
          <InputLabel>Select Subject Group</InputLabel>
          <Select value={selectedGroup} onChange={handleGroupChange}>
            <MenuItem value="">All Groups</MenuItem>
            {groups.map((grp) => (
              <MenuItem key={grp._id} value={grp}>
                {grp.group_name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </div>

      {selectedClass && selectedGroup && (
        <>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell rowSpan={2}>
                  <strong>Student Name</strong>
                </TableCell>
                <TableCell align="center" colSpan={subjects.length}>
                  <strong>{selectedGroupData?.name || "Subjects"}</strong>
                </TableCell>
              </TableRow>
              <TableRow>
                {Array.isArray(subjects) &&
                  subjects?.map((subject) => (
                    <TableCell key={subject._id} align="center">
                      <Checkbox
                        checked={isHeaderChecked(subject._id)}
                        onChange={() => handleHeaderCheckbox(subject._id)}
                        color="primary"
                      />
                      <strong>{subject.subject_name}</strong>
                    </TableCell>
                  ))}
              </TableRow>
            </TableHead>

            <TableBody>
              {Array.isArray(subjects) &&
                students?.map((student) => (
                  <TableRow key={student._id}>
                    <TableCell>
                      {student.name} {student.middlename} {student.surname}
                    </TableCell>
                    {subjects &&
                      subjects?.map((subject) => (
                        <TableCell key={subject._id} align="center">
                          <Checkbox
                            checked={isChecked(student._id, subject._id)}
                            onChange={() =>
                              handleCheckboxChange(student._id, subject._id)
                            }
                            color="primary"
                          />
                        </TableCell>
                      ))}
                  </TableRow>
                ))}
            </TableBody>
          </Table>

          <Button
            variant="contained"
            color="primary"
            onClick={handleSave}
            style={{ marginTop: 20 }}
          >
            Save Assignments
          </Button>
        </>
      )}
    </Paper>
  );
};

export default AssignSubjects;
