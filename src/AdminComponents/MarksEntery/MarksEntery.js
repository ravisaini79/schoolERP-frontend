// import React, { useEffect, useState } from "react";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableContainer,
//   TableHead,
//   TableRow,
//   TextField,
//   Button,
//   Paper,
//   Typography,
//   FormControl,
//   InputLabel,
//   Select,
//   MenuItem,
//   Grid,
//   CircularProgress,
//   Snackbar,
//   Alert,
// } from "@material-ui/core";
// // import { Alert } from '@material-ui/lab';

// import axios from "../../store/axios";

// const MarksEntry = () => {
//   const [classes, setClasses] = useState([]);
//   const [selectedClass, setSelectedClass] = useState("");
//   const [studentsData, setStudentsData] = useState([]);
//   const [marks, setMarks] = useState({});
//   const [selectedsection, setSelectedSection] = useState("");
//   const [sections, setSection] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [alert, setAlert] = useState({
//     open: false,
//     severity: "success",
//     message: "",
//   });

//   const user = JSON.parse(localStorage.getItem("LoggerInUser") || "{}");

//   useEffect(() => {
//     getClasses();
//     getSection()
//   }, []);

//   const getClasses = async () => {
//     try {
//       setLoading(true);
//       const res = await axios.get(`/classes/getby/${user._id}`);
//       setClasses(res.data);
//     } catch (error) {
//       console.error(error);
//       showAlert("error", "Failed to load classes");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleSectionChange = (e) => {
//     const sectionId = e.target.value;
//     setSelectedSection(sectionId);

//     let data = studentsData.filter((i) => i.section === sectionId);

//     setStudentsData(data);
//   };

//   const getSection = () => {
//     try {
//       axios.get(`/sections/${user._id}`).then((res) => {
//         console.log(res.data);
//         setSection(res.data);
//       });
//     } catch (error) {
//       console.error("Error fetching class:", error);
//     }
//   };

//   const fetchStudentsAndMarks = async () => {
//     if (!selectedClass) {
//       showAlert("warning", "Please select a class first");
//       return;
//     }
//     try {
//       setLoading(true);
//       const res1 = await axios.get(
//         `assignsubjects/getbyclass/${user._id}/${selectedClass}`
//       );
//       const students = res1.data.data || [];

//       const res2 = await axios.get(
//         `/marks/getbyclass/${user._id}/${selectedClass}`
//       );
//       const marksMap = {};

//       (res2.data || []).forEach((mark) => {
//         const studentId = mark.student_id._id || mark.student_id;
//         const subjectId = mark.subject_id._id || mark.subject_id;
//         if (!marksMap[studentId]) marksMap[studentId] = {};
//         marksMap[studentId][subjectId] = {
//           total_marks: mark.total_marks,
//           obtained_marks: mark.obtained_marks,
//           _id: mark._id,
//         };
//       });

//       setStudentsData(students);
//       setMarks(marksMap);
//     } catch (error) {
//       console.error(error);
//       showAlert("error", "Failed to load students or marks");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleMarksChange = (studentId, subjectId, field, value) => {
//     setMarks((prev) => ({
//       ...prev,
//       [studentId]: {
//         ...prev[studentId],
//         [subjectId]: {
//           ...prev[studentId]?.[subjectId],
//           [field]: value,
//         },
//       },
//     }));
//   };

//   const handleSave = async () => {
//     try {
//       setLoading(true);
//       const createPayload = [];
//       const updatePayload = [];

//       for (const student of studentsData) {
//         const sid = student.student_id._id;
//         for (const subject of student.subject_ids) {
//           const subId = subject._id;
//           const markEntry = marks?.[sid]?.[subId];

//           if (
//             markEntry &&
//             markEntry.total_marks !== undefined &&
//             markEntry.obtained_marks !== undefined
//           ) {
//             const data = {
//               student_id: sid,
//               subject_id: subId,
//               total_marks: Number(markEntry.total_marks),
//               obtained_marks: Number(markEntry.obtained_marks),
//               class_id: selectedClass,
//               user_Id: user._id,
//             };

//             if (markEntry._id) {
//               updatePayload.push({ ...data, _id: markEntry._id });
//             } else {
//               createPayload.push(data);
//             }
//           }
//         }
//       }

//       for (const mark of updatePayload) {
//         await axios.put(`/marks/update/${mark._id}`, mark);
//       }

//       if (createPayload.length > 0) {
//         await axios.post("/marks/submit", createPayload);
//       }

//       showAlert("success", "Marks saved successfully");
//     } catch (error) {
//       console.error(error);
//       showAlert("error", "Failed to save marks");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const showAlert = (severity, message) => {
//     setAlert({ open: true, severity, message });
//   };

//   const handleCloseAlert = () => {
//     setAlert((prev) => ({ ...prev, open: false }));
//   };

//   return (
//     <div style={{ padding: 20 }}>
//       <Typography variant="h4" gutterBottom>
//         Marks Entry
//       </Typography>

//       <Grid
//         container
//         spacing={2}
//         alignItems="center"
//         style={{ marginBottom: 20 }}
//       >
//         <Grid item xs={12} sm={6} md={4}>
//           <FormControl fullWidth>
//             <InputLabel>Select Class</InputLabel>
//             <Select
//               value={selectedClass}
//               onChange={(e) => setSelectedClass(e.target.value)}
//               label="Select Class"
//             >
//               {classes.map((cls) => (
//                 <MenuItem key={cls._id} value={cls._id}>
//                   {cls.name}
//                 </MenuItem>
//               ))}
//             </Select>
//           </FormControl>
//         </Grid>
//         <FormControl style={{ minWidth: 200 }}>
//           <InputLabel>Select Section</InputLabel>
//           <Select value={selectedsection} onChange={handleSectionChange}>
//             <MenuItem value="">All Sections</MenuItem>
//             {sections.map((cls) => (
//               <MenuItem key={cls._id} value={cls._id}>
//                 {cls.name}
//               </MenuItem>
//             ))}
//           </Select>
//         </FormControl>
//         <Grid item>
//           <Button
//             variant="contained"
//             color="primary"
//             onClick={fetchStudentsAndMarks}
//             disabled={loading}
//           >
//             Load Students & Subjects
//           </Button>
//         </Grid>
//         {loading && (
//           <Grid item>
//             <CircularProgress size={30} />
//           </Grid>
//         )}
//       </Grid>

//       {studentsData.length > 0 && (
//         <TableContainer
//           component={Paper}
//           style={{ maxHeight: 500, overflowX: "auto" }}
//         >
//           <Table stickyHeader>
//             <TableHead>
//               <TableRow>
//                 <TableCell
//                   style={{
//                     position: "sticky",
//                     left: 0,
//                     background: "#fff",
//                     zIndex: 2,
//                     whiteSpace: "nowrap",
//                     fontWeight: "bold",
//                   }}
//                 >
//                   Student Name
//                 </TableCell>
//                 {studentsData[0].subject_ids.map((subject) => (
//                   <TableCell key={subject._id} align="center" colSpan={2}>
//                     {subject.subject_name}
//                   </TableCell>
//                 ))}
//               </TableRow>
//               <TableRow>
//                 <TableCell
//                   style={{
//                     position: "sticky",
//                     left: 0,
//                     background: "#fff",
//                     zIndex: 1,
//                   }}
//                 />
//                 {studentsData[0].subject_ids.map((subject) => (
//                   <React.Fragment key={subject._id}>
//                     <TableCell align="center">
//                       <small>Total Marks</small>
//                     </TableCell>
//                     <TableCell align="center">
//                       <small>Obtained Marks</small>
//                     </TableCell>
//                   </React.Fragment>
//                 ))}
//               </TableRow>
//             </TableHead>

//             <TableBody>
//               {studentsData.map((student) => {
//                 const sid = student.student_id._id;
//                 return (
//                   <TableRow key={sid}>
//                     <TableCell
//                       style={{
//                         position: "sticky",
//                         left: 0,
//                         background: "#f9f9f9",
//                         whiteSpace: "nowrap",
//                       }}
//                     >
//                       {`${student.student_id.name} ${
//                         student.student_id.middleName || ""
//                       }`}
//                     </TableCell>

//                     {student.subject_ids.map((subject) => {
//                       const subId = subject._id;
//                       const entry = marks?.[sid]?.[subId] || {};

//                       return (
//                         <React.Fragment key={subId}>
//                           <TableCell align="center">
//                             <input
//                               className="form-control"
//                               style={{ width: "80px" }}
//                               type="number"
//                               value={entry.total_marks || ""}
//                               onChange={(e) =>
//                                 handleMarksChange(
//                                   sid,
//                                   subId,
//                                   "total_marks",
//                                   e.target.value
//                                 )
//                               }
//                             />
//                           </TableCell>

//                           <TableCell align="center">
//                             <input
//                               className="form-control"
//                               style={{ width: "80px" }}
//                               type="number"
//                               value={entry.obtained_marks || ""}
//                               onChange={(e) =>
//                                 handleMarksChange(
//                                   sid,
//                                   subId,
//                                   "obtained_marks",
//                                   e.target.value
//                                 )
//                               }
//                             />
//                           </TableCell>
//                         </React.Fragment>
//                       );
//                     })}
//                   </TableRow>
//                 );
//               })}
//             </TableBody>
//           </Table>
//         </TableContainer>
//       )}

//       {studentsData.length > 0 && (
//         <Button
//           variant="contained"
//           color="success"
//           onClick={handleSave}
//           disabled={loading}
//           style={{ marginTop: 20 }}
//         >
//           Save Marks
//         </Button>
//       )}

//       <Snackbar
//         open={alert.open}
//         autoHideDuration={4000}
//         onClose={handleCloseAlert}
//         anchorOrigin={{ vertical: "top", horizontal: "center" }}
//       >
//         <span
//           severity={alert.severity}
//           onClose={handleCloseAlert}
//           variant="filled"
//         >
//           {alert.message}
//         </span>
//       </Snackbar>
//     </div>
//   );
// };

// export default MarksEntry;
import React, { useEffect, useState } from "react";
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Button, Paper, Typography, FormControl, InputLabel, Select, MenuItem, Grid, CircularProgress, Snackbar
} from "@material-ui/core";
// import MuiAlert from "@material-ui/Alert";
import axios from "../../store/axios";

// function Alert(props) {
//   return <MuiAlert elevation={6} variant="filled" {...props} />;
// }

const MarksEntry = () => {
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [studentsData, setStudentsData] = useState([]);
  const [marks, setMarks] = useState({});
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ open: false, severity: "success", message: "" });

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
      showAlert("error", "Failed to load classes");
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

  const fetchStudentsAndMarks = async () => {
    if (!selectedClass) {
      showAlert("warning", "Please select a class first");
      return;
    }
    try {
      setLoading(true);

      const sectionQuery = selectedSection ? `?sectionId=${selectedSection}` : "";
      const res = await axios.get(`/assignsubjects/getbyclass/${user._id}/${selectedClass}${sectionQuery}`);

      const students = res.data.data || [];
      const marksList = res.data.marks || [];
      const marksMap = {};

      marksList.forEach((mark) => {
        const sid = mark.student_id._id;
        const subId = mark.subject_id._id;
        if (!marksMap[sid]) marksMap[sid] = {};
        marksMap[sid][subId] = {
          total_marks: mark.total_marks,
          obtained_marks: mark.obtained_marks,
          _id: mark._id,
        };
      });

      setStudentsData(students);
      setMarks(marksMap);

    } catch (error) {
      console.error(error);
      showAlert("error", "Failed to load students or marks");
    } finally {
      setLoading(false);
    }
  };

  const handleMarksChange = (studentId, subjectId, field, value) => {
    setMarks((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [subjectId]: {
          ...prev[studentId]?.[subjectId],
          [field]: value,
        },
      },
    }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const createPayload = [];
      const updatePayload = [];

      for (const student of studentsData) {
        const sid = student.student_id._id;
        for (const subject of student.subject_ids) {
          const subId = subject._id;
          const markEntry = marks?.[sid]?.[subId];

          if (
            markEntry &&
            markEntry.total_marks !== undefined &&
            markEntry.obtained_marks !== undefined
          ) {
            const data = {
              student_id: sid,
              subject_id: subId,
              total_marks: Number(markEntry.total_marks),
              obtained_marks: Number(markEntry.obtained_marks),
              class_id: selectedClass,
              user_Id: user._id,
            };

            if (markEntry._id) {
              updatePayload.push({ ...data, _id: markEntry._id });
            } else {
              createPayload.push(data);
            }
          }
        }
      }

      for (const mark of updatePayload) {
        await axios.put(`/assignsubjects/update/${mark._id}`, mark);
      }

      if (createPayload.length > 0) {
        await axios.post("/assignsubjects/submit", { marks: createPayload });
      }

      showAlert("success", "Marks saved successfully");
    } catch (error) {
      console.error(error);
      showAlert("error", "Failed to save marks");
    } finally {
      setLoading(false);
    }
  };

  const showAlert = (severity, message) => {
    setAlert({ open: true, severity, message });
  };

  const handleCloseAlert = () => {
    setAlert((prev) => ({ ...prev, open: false }));
  };

  return (
    <div style={{ padding: 20 }}>
      <Typography variant="h4" gutterBottom>Marks Entry</Typography>

      <Grid container spacing={2} alignItems="center" style={{ marginBottom: 20 }}>
        <Grid item xs={12} sm={4}>
          <FormControl fullWidth>
            <InputLabel>Select Class</InputLabel>
            <Select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)} label="Select Class">
              {classes.map((cls) => (
                <MenuItem key={cls._id} value={cls._id}>{cls.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={4}>
          <FormControl fullWidth>
            <InputLabel>Select Section</InputLabel>
            <Select value={selectedSection} onChange={(e) => setSelectedSection(e.target.value)} label="Select Section">
              <MenuItem value="">All Sections</MenuItem>
              {sections.map((sec) => (
                <MenuItem key={sec._id} value={sec._id}>{sec.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item>
          <Button variant="contained" color="primary" onClick={fetchStudentsAndMarks} disabled={loading}>
            Load Students & Marks
          </Button>
        </Grid>

        {loading && <Grid item><CircularProgress size={30} /></Grid>}
      </Grid>

      {studentsData.length > 0 && (
        <TableContainer component={Paper} style={{ maxHeight: 500, overflowX: "auto" }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell style={{ position: "sticky", left: 0, background: "#fff", zIndex: 2 }}>Student Name</TableCell>
                {studentsData[0].subject_ids.map((subject) => (
                  <TableCell key={subject._id} align="center" colSpan={2}>{subject.subject_name}</TableCell>
                ))}
              </TableRow>
              <TableRow>
                <TableCell style={{ position: "sticky", left: 0, background: "#fff", zIndex: 1 }} />
                {studentsData[0].subject_ids.map((subject) => (
                  <React.Fragment key={subject._id}>
                    <TableCell align="center"><small>Total Marks</small></TableCell>
                    <TableCell align="center"><small>Obtained Marks</small></TableCell>
                  </React.Fragment>
                ))}
              </TableRow>
            </TableHead>

            <TableBody>
              {studentsData.map((student) => {
                const sid = student.student_id._id;
                return (
                  <TableRow key={sid}>
                    <TableCell style={{ position: "sticky", left: 0, background: "#f9f9f9" }}>
                      {student.student_id.name} {student.student_id.middleName || ""}
                    </TableCell>

                    {student.subject_ids.map((subject) => {
                      const subId = subject._id;
                      const entry = marks?.[sid]?.[subId] || {};

                      return (
                        <React.Fragment key={subId}>
                          <TableCell align="center">
                            <input
                              className="form-control" style={{ width: "80px" }} type="number"
                              value={entry.total_marks || ""}
                              onChange={(e) => handleMarksChange(sid, subId, "total_marks", e.target.value)}
                            />
                          </TableCell>
                          <TableCell align="center">
                            <input
                              className="form-control" style={{ width: "80px" }} type="number"
                              value={entry.obtained_marks || ""}
                              onChange={(e) => handleMarksChange(sid, subId, "obtained_marks", e.target.value)}
                            />
                          </TableCell>
                        </React.Fragment>
                      );
                    })}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {studentsData.length > 0 && (
        <Button variant="contained" color="secondary" onClick={handleSave} disabled={loading} style={{ marginTop: 20 }}>
          Save Marks
        </Button>
      )}

   

        <Snackbar
        open={alert.open}
        autoHideDuration={4000}
        onClose={handleCloseAlert}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <span
          severity={alert.severity}
          onClose={handleCloseAlert}
          variant="filled"
        >
          {alert.message}
        </span>
      </Snackbar>
    </div>
  );
};

export default MarksEntry;
