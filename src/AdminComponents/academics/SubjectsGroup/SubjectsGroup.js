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
  TextField,
  Button,
  IconButton,
} from "@material-ui/core";
import { Edit, Delete } from "@material-ui/icons";
import axios from "../../../store/axios";

const GroupManager = () => {
  const [groups, setGroups] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [groupName, setGroupName] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("");
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editingGroupId, setEditingGroupId] = useState(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("LoggerInUser") || "{}");
    if (user && user._id) {
      setLoggedInUser(user);
      fetchGroups(user._id);
      fetchAllSubjects(user._id);
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

  const fetchAllSubjects = async (userId) => {
    try {
      const res = await axios.get(`/subjects/getAll/${userId}`);
      setSubjects(res.data.data);
    } catch (err) {
      console.error("Error fetching subjects:", err);
    }
  };

  const handleSaveGroup = async () => {
    const payload = {
      group_name: groupName,
      description,
      subjectIds: selectedSubjects,
      user_Id: loggedInUser._id,
      status,
    };

    try {
      if (editMode) {
        const res = await axios.put(`/subject-groups/update/${editingGroupId}`, payload);
        setGroups((prev) =>
          prev?.map((g) => (g._id === editingGroupId ? res.data : g))
        );
        setEditMode(false);
        setEditingGroupId(null);
      } else {
        const res = await axios.post("/subject-groups/add", payload);
        setGroups((prev) => [...prev, res.data]);
      }

      setGroupName("");
      setDescription("");
      setSelectedSubjects([]);
      setStatus("");
    } catch (err) {
      console.error("Error saving group:", err);
    }
  };

  const handleEdit = (group) => {
    setGroupName(group.group_name);
    setDescription(group.description);
    setStatus(group.status);
    setSelectedSubjects(group.subjectIds?.map((s) => s._id));
    setEditMode(true);
    setEditingGroupId(group._id);
  };

  const handleDelete = async (groupId) => {
    if (window.confirm("Are you sure you want to delete this group?")) {
      try {
        await axios.delete(`/subject-groups/delete/${groupId}`);
        setGroups((prev) => prev.filter((g) => g._id !== groupId));
      } catch (err) {
        console.error("Error deleting group:", err);
      }
    }
  };

  return (
    <Paper style={{ padding: 20 }}>
      <Typography variant="h6" gutterBottom>
        Create / Manage Groups
      </Typography>

      <div style={{ display: "flex", gap: 20, marginBottom: 20, flexWrap: "wrap" }}>
        <TextField
          label="Group Name"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
        />
        <TextField
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <FormControl style={{ minWidth: 200 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <MenuItem value="Active">Active</MenuItem>
            <MenuItem value="Inactive">Inactive</MenuItem>
          </Select>
        </FormControl>

        <FormControl style={{ minWidth: 250 }}>
          <InputLabel>Subjects</InputLabel>
          <Select
            multiple
            value={selectedSubjects}
            onChange={(e) => setSelectedSubjects(e.target.value)}
            renderValue={(selected) =>
              subjects
                .filter((subj) => selected.includes(subj._id))
                ?.map((s) => s.subject_name)
                .join(", ")
            }
          >
            {subjects?.map((subject) => (
              <MenuItem key={subject._id} value={subject._id}>
                <Checkbox checked={selectedSubjects.includes(subject._id)} />
                <span>{subject.subject_name}</span>
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Button
          variant="contained"
          color="primary"
          onClick={handleSaveGroup}
          style={{ alignSelf: "flex-end", marginTop: 8 }}
        >
          {editMode ? "Update Group" : "Save Group"}
        </Button>
      </div>

      <Typography variant="subtitle1" gutterBottom>
        Existing Groups
      </Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell><strong>Group Name</strong></TableCell>
            <TableCell><strong>Description</strong></TableCell>
            <TableCell><strong>Status</strong></TableCell>
            <TableCell><strong>Subjects</strong></TableCell>
            <TableCell align="center"><strong>Actions</strong></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {groups?.map((group) => (
            <TableRow key={group._id}>
              <TableCell>{group.group_name}</TableCell>
              <TableCell>{group.description}</TableCell>
              <TableCell>{group.status}</TableCell>
              <TableCell>
                {group.subjectIds?.map((s) =>
                  typeof s === "object" ? s.subject_name : s
                ).join(", ")}
              </TableCell>
              <TableCell align="center">
                <IconButton onClick={() => handleEdit(group)} color="primary">
                  <Edit />
                </IconButton>
                <IconButton onClick={() => handleDelete(group._id)} color="secondary">
                  <Delete />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Paper>
  );
};

export default GroupManager;
