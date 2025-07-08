import React, { useState, useEffect } from "react";
import axios from "../../../store/axios";
import {
  Grid, Select, MenuItem, FormControl, InputLabel,
  Button, TextField, Tabs, Tab, Table, TableHead,
  TableBody, TableCell, TableRow, Typography
} from "@material-ui/core";
import { TimePicker } from "@material-ui/pickers";

const weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const TimetableManager = () => {
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [subjectGroups, setSubjectGroups] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);

  const [form, setForm] = useState({
    class_id: "", section_id: "", subject_group_id: "",
    startTime: "09:00 AM", duration: 45, interval: 5, room: ""
  });

  const [activeDay, setActiveDay] = useState("Monday");
  const [entries, setEntries] = useState({ Monday: [] });

  const user = JSON.parse(localStorage.getItem("LoggerInUser") || "{}");

  useEffect(() => {
    axios.get(`/classes/getby/${user._id}`).then(res => setClasses(res.data));
    axios.get(`/sections/${user._id}`).then(res => setSections(res.data));
    axios.get(`/subject-groups/${user._id}`).then(res => setSubjectGroups(res.data));
    axios.get(`/subjects/${user._id}`).then(res => setSubjects(res.data));
    axios.get(`/accounts/teachers/${user._id}`).then(res => setTeachers(res.data));
  }, [user._id]);

  const handleAddRow = () => {
    const newRow = {
      subject_id: "", teacher_id: "", time_from: "", time_to: "", room_no: form.room || ""
    };
    setEntries(prev => ({ ...prev, [activeDay]: [...(prev[activeDay] || []), newRow] }));
  };

  const handleEntryChange = (idx, key, value) => {
    const updated = [...(entries[activeDay] || [])];
    updated[idx][key] = value;
    setEntries({ ...entries, [activeDay]: updated });
  };

  const handleSave = async () => {
    const payload = {
      user_Id: user._id,
      class_id: form.class_id,
      section_id: form.section_id,
      subject_group_id: form.subject_group_id,
      weekday: activeDay,
      periods: entries[activeDay]
    };
    await axios.post("/timetable/save", payload);
    alert("Timetable saved.");
  };

  return (
    <div style={{ padding: 20 }}>
      <Typography variant="h5">Timetable Manager</Typography>
      <Grid container spacing={2} style={{ marginBottom: 20 }}>
        {[
          { label: "Class", value: form.class_id, key: "class_id", options: classes },
          { label: "Section", value: form.section_id, key: "section_id", options: sections },
          { label: "Subject Group", value: form.subject_group_id, key: "subject_group_id", options: subjectGroups },
        ].map(({ label, value, key, options }) => (
          <Grid item xs={4} key={key}>
            <FormControl fullWidth>
              <InputLabel>{label}</InputLabel>
              <Select value={value} onChange={(e) => setForm({ ...form, [key]: e.target.value })}>
                {options.map(opt => <MenuItem key={opt._id} value={opt._id}>{opt.name}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
        ))}

        {["startTime", "duration", "interval", "room"].map((f, i) => (
          <Grid item xs={3} key={f}>
            <TextField
              label={f.charAt(0).toUpperCase() + f.slice(1)}
              fullWidth
              value={form[f]}
              onChange={(e) => setForm({ ...form, [f]: e.target.value })}
            />
          </Grid>
        ))}
        <Grid item xs={12}>
          <Button variant="contained" color="primary" onClick={handleAddRow}>+ Add New</Button>
        </Grid>
      </Grid>

      <Tabs value={activeDay} onChange={(e, v) => setActiveDay(v)}>
        {weekdays.map(day => <Tab label={day} value={day} key={day} />)}
      </Tabs>

      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Subject</TableCell>
            <TableCell>Teacher</TableCell>
            <TableCell>Time From</TableCell>
            <TableCell>Time To</TableCell>
            <TableCell>Room No</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {(entries[activeDay] || []).map((entry, idx) => (
            <TableRow key={idx}>
              <TableCell>
                <Select
                  value={entry.subject_id}
                  onChange={(e) => handleEntryChange(idx, "subject_id", e.target.value)}>
                  {subjects.map(sub => <MenuItem key={sub._id} value={sub._id}>{sub.subject_name}</MenuItem>)}
                </Select>
              </TableCell>
              <TableCell>
                <Select
                  value={entry.teacher_id}
                  onChange={(e) => handleEntryChange(idx, "teacher_id", e.target.value)}>
                  {teachers.map(tea => <MenuItem key={tea._id} value={tea._id}>{tea.name}</MenuItem>)}
                </Select>
              </TableCell>
              <TableCell><TextField value={entry.time_from} onChange={(e) => handleEntryChange(idx, "time_from", e.target.value)} /></TableCell>
              <TableCell><TextField value={entry.time_to} onChange={(e) => handleEntryChange(idx, "time_to", e.target.value)} /></TableCell>
              <TableCell><TextField value={entry.room_no} onChange={(e) => handleEntryChange(idx, "room_no", e.target.value)} /></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Button variant="contained" color="primary" onClick={handleSave} style={{ marginTop: 10 }}>Save</Button>
    </div>
  );
};

export default TimetableManager;
