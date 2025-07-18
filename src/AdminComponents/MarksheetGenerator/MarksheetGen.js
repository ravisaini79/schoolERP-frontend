import React, { useEffect, useState } from "react";
import jsPDF from "jspdf";
import "jspdf-autotable";
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Button, Paper, Typography, FormControl, InputLabel, Select,
  MenuItem, Grid, CircularProgress, TextField
} from "@material-ui/core";
import axios from "../../store/axios";

const StudentMarksheet = () => {
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [marks, setMarks] = useState({});
  const [marksheetStudent, setMarksheetStudent] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const user = JSON.parse(localStorage.getItem("LoggerInUser") || "{}");

  useEffect(() => {
    fetchClasses();
    fetchSections();
  }, []);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/classes/getby/${user._id}`);
      setClasses(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSections = async () => {
    try {
      const res = await axios.get(`/sections/${user._id}`);
      setSections(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchStudents = async () => {
    if (!selectedClass) return;
    try {
      setLoading(true);
      const sectionQuery = selectedSection ? `?sectionId=${selectedSection}` : "";
      const res = await axios.get(`assignsubjects/getbyclass/${user._id}/${selectedClass}${sectionQuery}`);
      setStudents(res.data.data || []);
      setFilteredStudents(res.data.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMarks = async (studentId) => {
    try {
      const res = await axios.get(`/assignsubjects/getbystudent/${user._id}/${studentId}`);
      const marksData = res.data || [];
      const marksMap = {};
      marksData.forEach(mark => {
        marksMap[mark.subject_id.subject_name] = mark.obtained_marks;
      });
      return marksMap;
    } catch (error) {
      console.error(error);
      return {};
    }
  };

  const generateMarksheet = async (student) => {
    const marksMap = await fetchMarks(student.student_id._id);
    setMarks(marksMap);
    setMarksheetStudent(student);
  };

  const generatePDF = () => {
    if (!marksheetStudent) return;

    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("RBSE Marks Sheet", 105, 15, null, null, "center");

    doc.setFontSize(12);
    doc.text(`Student Name: ${marksheetStudent.student_id.name} ${marksheetStudent.student_id.middleName || ""}`, 14, 30);
    const className = classes.find(c => c._id === selectedClass)?.name || "";
    doc.text(`Class: ${className}`, 14, 38);

    const tableColumn = ["Subject", "Marks Obtained"];
    const tableRows = [];

    if (marks && Object.keys(marks).length > 0) {
      Object.entries(marks).forEach(([subject, obtained]) => {
        tableRows.push([subject, obtained.toString()]);
      });
    } else {
      tableRows.push(["No marks available", ""]);
    }

    doc.autoTable({
      startY: 45,
      head: [tableColumn],
      body: tableRows,
      theme: 'grid',
      headStyles: { fillColor: [22, 160, 133] },
      styles: { fontSize: 11 }
    });

    doc.setFontSize(10);
    doc.text("*** This is a default RBSE marksheet template ***", 105, doc.lastAutoTable.finalY + 15, null, null, "center");

    doc.save(`Marksheet_${marksheetStudent.student_id.name}.pdf`);
  };

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    const filtered = students.filter(student =>
      (student.student_id.name + (student.student_id.middleName || "")).toLowerCase().includes(term)
    );
    setFilteredStudents(filtered);
  };

  return (
    <div style={{ padding: 20 }}>
      <Typography variant="h4" gutterBottom>Search Students & Generate Marksheet</Typography>

      <Grid container spacing={2} alignItems="center" style={{ marginBottom: 20 }}>
        <Grid item xs={12} sm={4}>
          <FormControl fullWidth>
            <InputLabel>Select Class</InputLabel>
            <Select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              label="Select Class"
            >
              {classes.map(cls => (
                <MenuItem key={cls._id} value={cls._id}>{cls.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={4}>
          <FormControl fullWidth>
            <InputLabel>Select Section</InputLabel>
            <Select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              label="Select Section"
            >
              <MenuItem value="">All Sections</MenuItem>
              {sections.map(sec => (
                <MenuItem key={sec._id} value={sec._id}>{sec.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item>
          <Button variant="contained" color="primary" onClick={fetchStudents} disabled={loading}>
            Load Students
          </Button>
        </Grid>

        {loading && <Grid item><CircularProgress size={30} /></Grid>}
      </Grid>

      {students.length > 0 && (
        <>
          <TextField
            fullWidth
            label="Search by student name..."
            variant="outlined"
            value={searchTerm}
            onChange={handleSearch}
            style={{ marginBottom: 20 }}
          />

          <TableContainer component={Paper} style={{ maxHeight: 500 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>Student Name</TableCell>
                  <TableCell>Class</TableCell>
                  <TableCell>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredStudents.map(student => (
                  <TableRow key={student.student_id._id}>
                    <TableCell>{student.student_id.name} {student.student_id.middleName || ""}</TableCell>
                    <TableCell>{classes.find(c => c._id === selectedClass)?.name || ""}</TableCell>
                    <TableCell>
                      <Button
                        variant="contained"
                        color="secondary"
                        onClick={() => generateMarksheet(student)}
                      >
                        Generate Marksheet
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}

      {marksheetStudent && (
        <div style={{ marginTop: 50 }}>
          <h2>Preview Marksheet</h2>
          <div style={{ border: "1px solid #ccc", padding: 20 }}>
            <h2 style={{ textAlign: "center" }}>RBSE Marks Sheet</h2>
            <p><strong>Student Name:</strong> {marksheetStudent.student_id.name} {marksheetStudent.student_id.middleName || ""}</p>
            <p><strong>Class:</strong> {classes.find(c => c._id === selectedClass)?.name || ""}</p>
            <table border="1" cellPadding="10" cellSpacing="0" style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th>Subject</th>
                  <th>Marks Obtained</th>
                </tr>
              </thead>
              <tbody>
                {marks && Object.keys(marks).length > 0 ? (
                  Object.entries(marks).map(([subject, obtained]) => (
                    <tr key={subject}>
                      <td>{subject}</td>
                      <td>{obtained}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={2} style={{ textAlign: "center" }}>No marks available</td>
                  </tr>
                )}
              </tbody>
            </table>
            <p style={{ textAlign: "center", marginTop: 20 }}>
              *** This is a default RBSE marksheet template ***
            </p>
          </div>
          <Button
            variant="contained"
            color="primary"
            onClick={generatePDF}
            style={{ marginTop: 20 }}
          >
            Download PDF
          </Button>
        </div>
      )}
    </div>
  );
};

export default StudentMarksheet;
