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
// Mock data
// const studentsMock = [
//   { _id: "s1", name: "Ravi Saini", className: "10th" },
//   { _id: "s2", name: "Anita Sharma", className: "9th" },
//   { _id: "s3", name: "Rahul Mehta", className: "10th" },
//   { _id: "s4", name: "Pooja Verma", className: "8th" },
// ];

const subjectsMock = [
  { _id: "sub1", name: "Math" },
  { _id: "sub2", name: "Science" },
  { _id: "sub3", name: "History" },
];

const subjectGroups = [
  {
    _id: "grp1",
    name: "Science Group",
    subjects: ["sub1", "sub2"], // Math, Science
  },
  {
    _id: "grp2",
    name: "Humanities Group",
    subjects: ["sub3"], // History
  },
];

const AssignSubjects = () => {
  const [students, setStudents] = useState([]);
   const [groups, setGroups] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [assignedSubjects, setAssignedSubjects] = useState({});
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("");
  const [classes, setclasses] = useState([]);
  const user = JSON.parse(localStorage.getItem("LoggerInUser") || "{}");
  useEffect(() => {
    // setStudents(studentsMock);
    setSubjects(subjectsMock);
  }, []);

  useEffect(() => {
    // setloading(true);
    const user = JSON.parse(localStorage.getItem("LoggerInUser") || "{}");
    if (user && user._id) {
      fetchGroups(user._id);
      axios.get("/classes").then((res) => {
        // setloading(false);
        let data = res.data;

        setclasses(data);
        // setstoreData(classesData);
      });
    }
  }, []);

  const fetchGroups = async (userId) => {
    try {
      const res = await axios.get(`/subject-groups/group/${userId}`);
      setGroups(res.data.groups);
    } catch (err) {
      console.error("Error fetching groups:", err);
    }
  };

  const handleCheckboxChange = (studentId, subjectId) => {
    setAssignedSubjects((prev) => {
      const currentSubjects = prev[studentId] || [];
      const isAssigned = currentSubjects.includes(subjectId);
      const updatedSubjects = isAssigned
        ? currentSubjects.filter((s) => s !== subjectId)
        : [...currentSubjects, subjectId];
      return {
        ...prev,
        [studentId]: updatedSubjects,
      };
    });
  };

  const handleSelectAll = (subjectId) => {
    setAssignedSubjects((prev) => {
      const updated = { ...prev };
      students.forEach((student) => {
        const current = updated[student._id] || [];
        if (!current.includes(subjectId)) {
          updated[student._id] = [...current, subjectId];
        }
      });
      return updated;
    });
  };

  const isChecked = (studentId, subjectId) => {
    return assignedSubjects[studentId]?.includes(subjectId);
  };

  const handleClassChange = (e) => {
    setSelectedClass(e.target.value);
    axios.get(`/students/getAll/${user._id}`).then((res) => {
      // setloading(false);
      setStudents(res.data);
     
    });

    setAssignedSubjects({});
  };

  const handleGroupChange = (e) => {
    console.log('object',e.target.value)
    setSelectedGroup(e.target.value);
    setAssignedSubjects({});
  };

  const handleSave = async () => {
    const payload = Object.entries(assignedSubjects).map(
      ([studentId, subjectIds]) => ({
        studentId,
        subjectIds,
      })
    );

    try {
      const response = await fetch("/api/assign-subjects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assignments: payload }),
      });

      const result = await response.json();
      if (result.success) {
        alert("Assignments saved successfully");
      } else {
        alert("Save failed");
      }
    } catch (error) {
      console.error("Error saving assignments:", error);
      alert("Error saving assignments");
    }
  };

  // Class list and filtered students
  // const classList = [...new Set(studentsMock.map((s) => s.className))];
  // const filteredStudents = selectedClass
  //   ? students.filter((s) => s.className === selectedClass)
  //   : students;

  // Group and subject filtering
  const selectedGroupData = subjectGroups.find((g) => g._id === selectedGroup);
  const groupSubjectIds = selectedGroupData?.subjects || [];
  const filteredSubjects = subjects.filter((s) =>
    groupSubjectIds.includes(s._id)
  );

  return (
    <Paper style={{ padding: "20px", overflowX: "auto" }}>
      <Typography variant="h6" gutterBottom>
        Assign Subjects to Students
      </Typography>

      <div style={{ display: "flex", gap: "20px", marginBottom: "20px" }}>
        <FormControl style={{ minWidth: 200 }}>
          <InputLabel>Select Class</InputLabel>
          <Select value={selectedClass} onChange={handleClassChange}>
            <MenuItem value="">All Classes</MenuItem>
            {classes && classes.map((cls) => (
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
            {groups && groups.map((grp) => (
              <MenuItem key={grp._id} value={grp._id}>
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
                <TableCell>
                  <strong>Student</strong>
                </TableCell>
                {students.map((subject) => (
                  <TableCell key={subject._id} align="center">
                    <Checkbox
                      color="primary"
                      checked={students.every((student) =>
                        isChecked(student._id, subject._id)
                      )}
                      onChange={() => handleSelectAll(subject._id)}
                    />
                    <strong>{subject.name}</strong>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {students.map((student) => (
                <TableRow key={student._id}>
                  <TableCell>{student.name} {student.middlename} {student.surname}</TableCell>
                  {filteredSubjects.map((subject) => (
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
