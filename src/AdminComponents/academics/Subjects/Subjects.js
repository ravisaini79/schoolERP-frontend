import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TablePagination,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import EditIcon from "@material-ui/icons/Edit";
import DeleteIcon from "@material-ui/icons/Delete";
import VisibilityIcon from "@material-ui/icons/Visibility";
import AddIcon from "@material-ui/icons/Add";
import axios from "../../../store/axios";
import TableHeader from "../../shared/TableHeader";

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
  },
  paper: {
    width: "100%",
    marginBottom: theme.spacing(2),
  },
  table: {
    minWidth: 750,
  },
}));

const initialForm = {
  subjectName: "",
  subjectCode: "",
  description: "",
  createdBy: "", // User ID
};

function Subjects() {
  const classes = useStyles();
  const [subjects, setSubjects] = useState([]);
  const [selected, setSelected] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [openDialog, setOpenDialog] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [dialogMode, setDialogMode] = useState("view");
  const [loggedInUser, setLoggedInUser] = useState(null);

  const headCells = [
    { id: "subject_name", label: "Subject Name" },
    { id: "subject_code", label: "Subject Code" },
    { id: "description", label: "Description" },
    // { id: "actions", label: "Actions" },
  ];

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("LoggerInUser") || "{}");
    if (user && user._id) {
      setLoggedInUser(user);
      fetchSubjects(user._id);
    }
  }, []);

  const fetchSubjects = async (userId) => {
    try {
      const res = await axios.get(`/subjects/getAll/${userId}`);
      setSubjects(res.data.data);
    } catch (err) {
      console.error("Error fetching subjects:", err);
    }
  };

  const handleOpenDialog = (mode, subject = initialForm) => {
    setDialogMode(mode);
    setForm(subject);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setForm(initialForm);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      const payload = {
        ...form,
        createdBy: loggedInUser._id,
        user_Id: loggedInUser._id,
      };

      if (dialogMode === "add") {
        const res = await axios.post("/subjects/create", payload);
        setSubjects([...subjects, res.data]);
      } else if (dialogMode === "edit") {
        const res = await axios.put(`/subjects/update/${form._id}`, payload);
        setSubjects(subjects.map((s) => (s._id === form._id ? res.data : s)));
      }

      handleCloseDialog();
    } catch (err) {
      console.error("Submit Error:", err);
      alert("Failed to submit subject");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure to delete this subject?")) {
      try {
        await axios.delete(`/subjects/delete/${id}`);
        setSubjects(subjects.filter((s) => s._id !== id));
      } catch (err) {
        console.error("Delete Error:", err);
      }
    }
  };

  return (
    <div className={classes.root}>
      <div className="d-flex justify-content-end mb-3">
        <Button
          variant="outlined"
          color="primary"
          onClick={() => handleOpenDialog("add")}
          startIcon={<AddIcon />}
        >
          Add New Subject
        </Button>
      </div>

      <Paper className={classes.paper}>
        <TableContainer>
          <Table className={classes.table}>
            <TableHeader classes={classes} headCells={headCells} numSelected={selected.length} />
            <TableBody>
              {subjects && subjects?.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((subject, index) => (
                  <TableRow hover key={subject._id}>
                    <TableCell></TableCell>
                    <TableCell>{subject.subject_name}</TableCell>
                    <TableCell>{subject.subject_code}</TableCell>
                    <TableCell>{subject.description}</TableCell>
                    <TableCell style={{display:'flex'}}>
                      <Tooltip title="View">
                        <IconButton onClick={() => handleOpenDialog("view", subject)}>
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit">
                        <IconButton color="primary" onClick={() => handleOpenDialog("edit", subject)}>
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton color="secondary" onClick={() => handleDelete(subject._id)}>
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={subjects.length}
          page={page}
          rowsPerPage={rowsPerPage}
          onPageChange={(e, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
        />
      </Paper>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {dialogMode === "add"
            ? "Add Subject"
            : dialogMode === "edit"
            ? "Edit Subject"
            : "View Subject"}
        </DialogTitle>
        <DialogContent dividers>
          <TextField
            name="subject_name"
            label="Subject Name"
            fullWidth
            margin="dense"
            value={form.subject_name}
            onChange={handleChange}
            disabled={dialogMode === "view"}
          />
          <TextField
            name="subject_code"
            label="Subject Code"
            fullWidth
            margin="dense"
            value={form.subject_code}
            onChange={handleChange}
            disabled={dialogMode === "view"}
          />
          <TextField
            name="description"
            label="Description"
            fullWidth
            margin="dense"
            value={form.description}
            onChange={handleChange}
            disabled={dialogMode === "view"}
          />
        </DialogContent>
        {dialogMode !== "view" && (
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button onClick={handleSubmit} color="primary" variant="contained">
              {dialogMode === "add" ? "Add" : "Update"}
            </Button>
          </DialogActions>
        )}
      </Dialog>
    </div>
  );
}

export default Subjects;
