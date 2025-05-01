import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TablePagination,
  TableRow,
  Paper,
  Avatar,
  IconButton,
  Tooltip,
  Checkbox,
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
  avatar: {
    width: theme.spacing(6),
    height: theme.spacing(6),
  },
  logoCell: {
    display: "flex",
    alignItems: "center",
  },

}));

const initialForm = {
  fullName: "",
  name: "",
  email: "",
  telephone: "",
  address: "",
  role: "",
  logo: "admin",
};

function AdminList() {
  const classes = useStyles();
  const [schools, setSchools] = useState([]);
  const [selected, setSelected] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [openDialog, setOpenDialog] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [dialogMode, setDialogMode] = useState("view"); // "add", "edit", "view"

  const [loading, setloading] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState("");

  const headCells = [
    { id: "logo", label: "Logo" },
    // { id: "fullName", label: "Full Name" },
    { id: "name", label: "School Name" },
    { id: "email", label: "Email" },
    { id: "telephone", label: "Telephone" },
    { id: "address", label: "Address" },
    { id: "role", label: "Role" },
    // { id: "actions", label: "Actions" },
  ];

  useEffect(() => {
    setloading(true);
    const user = JSON.parse(localStorage.getItem("LoggerInUser") || "{}");

    if (user && user.userID) {
      // console.log("✅ Logged in user:", user);
      setLoggedInUser(user);
    } else {
      console.log("❌ No user found in localStorage");
    }
    getAllSchools();
  }, []);

  const getAllSchools = () => {
    axios.get(`/getAlladmin`).then((res) => {
      setloading(false);
      setSchools(res.data);
    });
  };

  const handleOpenDialog = (mode, school = initialForm) => {
    setDialogMode(mode);
    setForm(school);
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
    setloading(true);

    try {
      if (dialogMode === "add") {
        const res = await axios.post(`/school/create`, form);
        setSchools((prev) => [...prev, res.data]); // update state with newly created school
        getAllSchools();
      } else if (dialogMode === "edit") {
        const res = await axios.put(`/school/update/${form._id}`, form);
        setSchools((prev) =>
          prev.map((s) => (s._id === form._id ? res.data : s))
        );
        getAllSchools();
      }
    } catch (error) {
      console.error("Error in handleSubmit:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setloading(false);
      handleCloseDialog();
    }
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure to delete this school?")) {
      setSchools((prev) => prev.filter((s) => s._id !== id));
    }
  };

  const handleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
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
          Add New School
        </Button>
      </div>

      <Paper className={classes.paper}>
        <TableContainer>
          <Table className={classes.table}>
            <TableHeader
              classes={classes}
              headCells={headCells}
              numSelected={selected.length}
              
            />
            <TableBody>
              {schools
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row, index) => (
                  <TableRow hover key={row._id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell className={classes.logoCell}>
                      <Avatar
                        src={row.logo}
                        alt={row.name}
                        className={classes.avatar}
                      />
                    </TableCell>
                    <TableCell>{row.fullName}</TableCell>
                    {/* <TableCell>{row.name}</TableCell> */}
                    <TableCell>{row.email}</TableCell>
                    <TableCell>{row.telephone}</TableCell>
                    <TableCell>{row.address}</TableCell>
                    <TableCell>{row.role}</TableCell>
                    <TableCell className="d-flex">
                      <Tooltip title="View">
                        <IconButton
                          onClick={() => handleOpenDialog("view", row)}
                        >
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit">
                        <IconButton
                          color="primary"
                          onClick={() => handleOpenDialog("edit", row)}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          color="secondary"
                          onClick={() => handleDelete(row._id)}
                        >
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
          rowsPerPageOptions={[5, 10, 25]}
          count={schools.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
        />
      </Paper>

      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {dialogMode === "add"
            ? "Add School"
            : dialogMode === "edit"
            ? "Edit School"
            : "View School"}
        </DialogTitle>
        <DialogContent dividers>
          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
            <TextField
              margin="dense"
              name="fullName"
              label="Full Name"
              fullWidth
              value={form.fullName}
              onChange={handleChange}
              disabled={dialogMode === "view"}
            />
            <TextField
              margin="dense"
              name="name"
              label="School Name"
              fullWidth
              value={form.name}
              onChange={handleChange}
              disabled={dialogMode === "view"}
            />
            <TextField
              margin="dense"
              name="email"
              label="Email"
              fullWidth
              value={form.email}
              onChange={(e) => {
                const value = e.target.value;
                setForm({ ...form, email: value, userID: value });
              }}
              disabled={dialogMode === "view"}
            />
            <TextField
              margin="dense"
              name="userID"
              label="User ID (auto from email)"
              fullWidth
              value={form.userID}
              disabled
            />
            <TextField
              margin="dense"
              name="telephone"
              label="Telephone"
              fullWidth
              value={form.telephone}
              onChange={handleChange}
              disabled={dialogMode === "view"}
            />
            <TextField
              margin="dense"
              name="address"
              label="Address"
              fullWidth
              value={form.address}
              onChange={handleChange}
              disabled={dialogMode === "view"}
            />
            <TextField
              margin="dense"
              name="motto"
              label="Motto"
              fullWidth
              value={form.motto}
              onChange={handleChange}
              disabled={dialogMode === "view"}
            />
            <TextField
              margin="dense"
              name="password"
              label="Password"
              type="password"
              fullWidth
              value={form.password}
              onChange={handleChange}
              disabled={dialogMode === "view"}
            />
            <TextField
              margin="dense"
              name="role"
              label="Role"
              fullWidth
              value={form.role || "admin"}
              disabled
            />
            <div style={{ marginTop: "1rem", width: "100%" }}>
              <label>
                {dialogMode !== "view" ? (
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setForm({ ...form, logo: reader.result });
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                ) : (
                  <Avatar
                    src={form.logo}
                    alt="Logo"
                    style={{ width: 60, height: 60 }}
                  />
                )}
              </label>
            </div>
          </div>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          {dialogMode !== "view" && (
            <Button onClick={handleSubmit} color="primary" variant="contained">
              {dialogMode === "add" ? "Add" : "Update"}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default AdminList;
