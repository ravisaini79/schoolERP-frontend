import React, { useState, useEffect } from "react";
import ListTable from "./billPayment/PaymentTable";
import Search from "../shared/Search";
import { useSelector } from "react-redux";
import { selectClasses } from "../../store/slices/schoolSlice";
import axios from "../../store/axios";
import { Link, useHistory } from "react-router-dom";
import { errorAlert, currentCurrency ,successAlert} from "../../utils";
import SearchStudent from "./billPayment/SearchStudent";

import { makeStyles } from "@material-ui/core/styles";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableHead from "@material-ui/core/TableHead";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableFooter from "@material-ui/core/TableFooter";
import TablePagination from "@material-ui/core/TablePagination";
import TableRow from "@material-ui/core/TableRow";
import Paper from "@material-ui/core/Paper";
import IconButton from "@material-ui/core/IconButton";
import TablePaginationActions from "../shared/TablePagination";
import LocalAtmIcon from "@material-ui/icons/LocalAtm";
import CloseIcon from "@material-ui/icons/Close";
import moment from "moment";


import {
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@material-ui/core";
// import LocalAtmIcon from '@material-ui/icons/LocalAtm';
import AddIcon from "@material-ui/icons/Add";
const tableHeader = [
  { id: "name", name: "NAME" },
  { id: "userID", name: "Student ID" },
  { id: "status", name: "Status" },
  { id: "fees", name: "Current Bill" },
  //   { id: "action", name: "Actions" },
  //   { id: "amount", name: `Amount (${currentCurrency()})` },
];

function Generatebill() {
  const [data, setdata] = useState([]);
  const [storeData, setstoreData] = useState([]);
  const [classI, setclass] = useState("");
  const [status, setstatus] = useState("");
  const classes = useSelector(selectClasses);
  const history = useHistory();
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);

  const [year, setyear] = useState("");
  const [term, setterm] = useState("");
  const [classID, setclassID] = useState("");
  const [studentID, setstudentID] = useState("");
  const [studentOptions, setstudentOptions] = useState([]);
  const [amount, setamount] = useState("");
  const [date, setdate] = useState("");
  const [bank, setbank] = useState("");
  const [chequeNo, setchequeNo] = useState("");
  const [paymentType, setpaymentType] = useState("");

  const [selectstudentID, setSelectstudentID] = useState("");

  const [open, setOpen] = useState(false); // State to manage modal visibility
  const [items, setItems] = useState([
    { item: "", amount: 0 },
    { item: "", amount: 0 },
    { item: "", amount: 0 },
  ]);

  // Function to handle opening the modal
  const handleClickOpen = (item) => {
    setOpen(true);
    setSelectstudentID(item);
  };

  // Function to handle closing the modal
  const handleClose = () => {
    setOpen(false);
  };

  // Function to handle adding a new item to the list
  const handleAddItem = () => {
    setItems([...items, { item: "", amount: 0 }]); // Add a new item
  };

  // Function to handle removing an item from the list
  const handleRemoveItem = (index) => {
    const newItems = items.filter((_, i) => i !== index); // Remove item by index
    setItems(newItems);
  };

  // Function to handle input changes for items
  const handleItemChange = (e, index, field) => {
    const updatedItems = [...items];
    updatedItems[index][field] = e.target.value; // Update the specific field (item or amount)
    setItems(updatedItems);
  };

  const [applyTo, setapplyTo] = useState({
    all: false,
    tuition: false,
    examination: false,
    facility: false,
    maintenance: false,
  });
  const [remarks, setremarks] = useState("");
  const [loading, setloading] = useState(false);
  const [transactions, settransactions] = useState([]);
  const [loadingStudents, setloadingStudents] = useState(false);
  const [user, setuser] = useState({});
  const [feetype, setfeetype] = useState({});
  const [balance, setbalance] = useState(0);
  const [totalBill, settotalBill] = useState(0);
  const [totalPaid, settotalPaid] = useState(0);
  const [show, setshow] = useState(false);
  const [scholarship, setscholarship] = useState(null);

  const searchby = [
    { code: "byclass", value: "BY CLASS" },
    { code: "bystudent", value: "BY STUDENT" },
  ];

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const emptyRows =
    rowsPerPage - Math.min(rowsPerPage, data?.length - page * rowsPerPage);

  const handleSelectStudent = async (e) => {
    e.preventDefault();
    if (!term) {
      return errorAlert("Please select term");
    }
    if (!year) {
      return errorAlert("Please select year");
    }

    if (!studentID) {
      return errorAlert("Please select student");
    }
    setshow(false);
    setloading(true);

    let transactionData = await axios.get(`/transactions/student/${studentID}`);
    let thisMonthTrans = transactionData.data.filter(
      (e) => e.fees.term === term && e.fees.academicYear === year
    );
    settransactions(thisMonthTrans);

    let studentData = await axios.get(`/students/student/${studentID}`);
    let student = studentData.data?.student;
    setuser(student);
    const scholarshipData = await axios.get(
      `/scholarships/${student?.scholarship}`
    );

    let feesData = await axios.get(
      `/fees/type/${student?.classID}/${student?.status}`
    );

    setfeetype(feesData?.data);

    let bill = Object.values(feesData?.data).reduce(
      (t, value) => Number(t) + Number(value),
      0
    );

    let paid = thisMonthTrans?.reduce((accumulator, element) => {
      return Number(accumulator) + Number(element?.amount);
    }, 0);

    if (scholarshipData.data.doc) {
      setscholarship(scholarshipData.data.doc);
      paid = paid + (Number(scholarshipData.data.doc.percentage) / 100) * bill;
    }

    console.log(paid);
    settotalBill(bill);
    settotalPaid(paid);
    setbalance(bill - paid);
    setloading(false);
    setshow(true);
  };

  const isDate = (string) => {
    const _regExp = new RegExp(
      "^(-?(?:[1-9][0-9]*)?[0-9]{4})-(1[0-2]|0[1-9])-(3[01]|0[1-9]|[12][0-9])T(2[0-3]|[01][0-9]):([0-5][0-9]):([0-5][0-9])(.[0-9]+)?(Z)?$"
    );
    return _regExp.test(string) ? true : false;
  };

  const handleSelectClass = (id) => {
    setloadingStudents(true);
    setstudentOptions([]);
    setstudentID("");
    setclassID(id);
    axios
      .get(`/students/class/${id}`)
      .then((res) => {
        setloadingStudents(false);
        if (res.data.error) {
          errorAlert(res.data.error);
          return 0;
        }
        setdata(res.data.users);
        console.log("users", res.data.users);
      })
      .catch((err) => {
        console.log(err);
        setloadingStudents(false);
      });
  };

  useEffect(() => {
    axios.get("/transactions/students/fees").then((res) => {
      //   setdata(res.data);
      setstoreData(res.data);
    });
  }, []);

  const inputFields = [
    {
      label: "Search by ",
      type: "select",
      value: status,
      onChange: setstatus,
      options: [
        //   { id: "all", name: "All Students" },
        { id: "byclass", name: "BY CLASS" },
        { id: "bystudent", name: "BY STUDENT" },
      ],
    },
    {
      label: "Search by Student ID",
      type: "text",
      value: classID,
      name: "student",
      onChange: setclass,
    },
    {
      label: "Search by Status",
      type: "select",
      value: status,
      onChange: setstatus,
      options: [
        { id: "all", name: "All Students" },
        { id: "day", name: "Day Students" },
        { id: "fresh-day", name: "Fresh day Students" },
        { id: "border", name: "Border Students" },
        { id: "fresh-border", name: "Fresh-border Border Students" },
      ],
    },
  ];

  const handleDelete = (id) => {
    axios.delete(`/transactions/delete/${id}`).then((res) => {
      if (res.data.error) {
        errorAlert(res.data.error);
      }
      setdata(data.filter((e) => e._id !== id));
    });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    let newData = [];
    if (classID) {
      newData = storeData.filter((i) =>
        i?.userID?.toLowerCase().includes(classID?.toLowerCase())
      );
    }
    if (status) {
      newData = storeData.filter((i) =>
        i?.status?.toLowerCase().includes(status?.toLowerCase())
      );
    }
    setdata(newData);
  };

  const handleReset = (e) => {
    e.preventDefault();
    setdata(storeData);
    setstatus("");
  };

  const handleEdit = (id) => {
    history.push(`/finance/transactions/receipt/${id}`);
  };

//   const AddBill = (item) => {
//     console.log("select is", selectstudentID);
//     console.log("itesms", item);
//   };

    const handleCreateSubmit = async (item) => {
      setloading(true);
      await axios
        .post(`/generatebill/createbill`, {
          
          "studentId": selectstudentID._id,
          "userId": selectstudentID.userID,
          "billItems":item,
        })
        .then(async (response) => {
          setloading(false);
          console.log(response);
          if (response.data.error) {
            return errorAlert(response.data.error);
          }
          successAlert("successfully updated");
          await axios.post("/activitylog/create", {
            activity: `student  ${selectstudentID.name} ${selectstudentID.surname} was edited`,
            user: "admin",
          });
        })
        .catch((err) => {
          setloading(false);
          console.log(err);
          errorAlert("something went wrong");
        });
    };

  return (
    <div>
      <div className="float-right mb-5">
        <Link className="btn blue__btn" to="/finance/students/fees">
          Make A Payment
        </Link>
      </div>
      <h3 className=" mb-5">Students Fees Transactions</h3>

      <SearchStudent
        loading={loadingStudents}
        studentID={studentID}
        setstudentID={setstudentID}
        setclassID={handleSelectClass}
        handleSearch={handleSelectStudent}
        classID={classID}
        year={year}
        term={term}
        setterm={setterm}
        setyear={setyear}
        studentOptions={studentOptions}
      />
      {/* <Search
        title="Filter Students"
        handleReset={handleReset}
        handleSearch={handleSearch}
        inputFields={inputFields}
      /> */}
      {/* <ListTable
        data={data}
        handleEdit={handleEdit}
        handleDelete={handleDelete}
        tableHeader={tableHeader}
        isEdit={true}
      /> */}

      <TableContainer component={Paper}>
        <Table className={classes.table} aria-label="custom pagination table">
          <TableHead>
            <TableRow>
              {tableHeader &&
                tableHeader?.map((head) => (
                  <TableCell key={head.id}>{head.name}</TableCell>
                ))}
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          {loading ? (
            <TableBody className="text-center my-5 w-100">
              <TableRow>
                <TableCell>
                  <span
                    className="spinner-grow spinner-grow-sm"
                    role="status"
                  ></span>
                </TableCell>
                <TableCell>
                  <span
                    className="spinner-grow spinner-grow-sm"
                    role="status"
                  ></span>
                </TableCell>
                <TableCell>
                  <span
                    className="spinner-grow spinner-grow-sm"
                    role="status"
                  ></span>
                </TableCell>
                <TableCell>
                  <span
                    className="spinner-grow spinner-grow-sm"
                    role="status"
                  ></span>
                </TableCell>
              </TableRow>
            </TableBody>
          ) : (
            <TableBody>
              {data?.length <= 0 ? (
                <TableRow className="text-center my-5">
                  <TableCell
                    className="text-center text-danger"
                    colSpan={tableHeader.length + 1}
                  >
                    {"No Data"}
                  </TableCell>{" "}
                </TableRow>
              ) : (
                <>
                  {(rowsPerPage > 0
                    ? data?.slice(
                        page * rowsPerPage,
                        page * rowsPerPage + rowsPerPage
                      )
                    : data
                  )?.map((row) => (
                    <TableRow key={row._id}>
                      {tableHeader &&
                        tableHeader?.map((cell) => (
                          <TableCell key={cell?.id} align="left">
                            {isDate(row[cell?.id])
                              ? moment(row[cell?.id])?.format("D MMMM YYYY")
                              : row[cell?.id] || "-"}
                          </TableCell>
                        ))}
                      <TableCell align="left">
                        <div className="d-flex align-items-center">
                          <button
                            className="btn btn-secondary"
                            onClick={() => handleEdit(row._id)}
                          >
                            <small>
                              {" "}
                              Bill Student <LocalAtmIcon></LocalAtmIcon>
                            </small>
                          </button>
                          <IconButton
                            onClick={() => handleClickOpen(row)}
                            color="primary"
                          >
                            <AddIcon />
                          </IconButton>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </>
              )}

              {emptyRows > 0 && (
                <TableRow style={{ height: 53 * emptyRows }}>
                  <TableCell colSpan={6} />
                </TableRow>
              )}
            </TableBody>
          )}
          <TableFooter>
            <TableRow>
              {data?.length > 5 && (
                <TablePagination
                  rowsPerPageOptions={[5, 10, 25, { label: "All", value: -1 }]}
                  count={data?.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  SelectProps={{
                    inputProps: { "aria-label": "rows per page" },
                    native: true,
                  }}
                  onChangePage={handleChangePage}
                  onChangeRowsPerPage={handleChangeRowsPerPage}
                  ActionsComponent={TablePaginationActions}
                />
              )}
            </TableRow>
          </TableFooter>
        </Table>
      </TableContainer>
      {/* Modal for adding bills */}
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Add Bill Items</DialogTitle>
        <DialogContent>
          {items.map((item, index) => (
            <div key={index} className="d-flex align-items-center mb-2">
            <span className="mx-2">{index + 1}.</span>  <input
                label="Item"
                variant="outlined"
                placeholder="Fee name"
                  className="form-control"
                value={item.item}
                onChange={(e) => handleItemChange(e, index, "item")}
                fullWidth
                style={{ marginRight: "10px" }}
              />
              <input
                label="Amount"
                variant="outlined"
                placeholder="amount"
                className="form-control"
                type="number"
                value={item.amount}
                onChange={(e) => handleItemChange(e, index, "amount")}
                fullWidth
              />
              {/* {items.length > 1 ? (
                <>
                  <Button
                    variant="outlined"
                    color="secondary"
                    onClick={() => handleRemoveItem(index)}
                    style={{ marginLeft: "10px" }}
                  >
                    Remove
                  </Button>
                </>
              ) : (
                <></>
              )} */}
              {/* <Button
                variant="contained"
                color="primary"
                onClick={handleAddItem}
                fullWidth
                style={{ marginTop: "10px" }}
              >
                Add More
              </Button> */}
            </div>
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Cancel
          </Button>
          <Button onClick={() => handleCreateSubmit(items)} color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default Generatebill;
