import React, { useState, useEffect } from "react";
import axios from "axios";

const App = () => {
  const [membersData, setMembersData] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [editRowIndex, setEditRowIndex] = useState(null);
  const [editedRow, setEditedRow] = useState({});
  const [searchInput, setSearchInput] = useState("");

  useEffect(() => {
    fetchData();
  }, [currentPage]);

  const fetchData = async () => {
    const res = await axios.get(
      "https://geektrust.s3-ap-southeast-1.amazonaws.com/adminui-problem/members.json"
    );

    setMembersData(res.data);
  };

  const totalPages = Math.ceil(membersData.length / itemsPerPage);

  // Calculate the current page data 
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPageData = membersData.slice(startIndex, endIndex);

  // For row selection
  const selectRow = (rowIndex) => {
    setSelectedRows((prevSelectedRows) => {
      const updatedSelectedRows = [...prevSelectedRows];
      if (updatedSelectedRows.includes(rowIndex)) {
        updatedSelectedRows.splice(updatedSelectedRows.indexOf(rowIndex), 1);
      } else {
        updatedSelectedRows.push(rowIndex);
      }
      return updatedSelectedRows;
    });
  };

  // For bulk delete
  const deleteSelected = () => {
    const updatedMembersData = membersData.filter(
      (_, index) => !selectedRows.includes(index)
    );
    setMembersData(updatedMembersData);
    setSelectedRows([]);
  };

  // For Handle search
  const handleSearchChange = (event) => {
    setSearchInput(event.target.value);
  };

  const search = () => {
    const filteredData = membersData.filter((row) =>
      Object.values(row).some((value) =>
        value.toString().toLowerCase().includes(searchInput.toLowerCase())
      )
    );
    setMembersData(filteredData);
    setCurrentPage(1);
  };

  // For Handle edit button 
  const handleEdit = (rowIndex) => {
    setEditRowIndex(rowIndex);
    setEditedRow({ ...membersData[startIndex + rowIndex] });
  };

  // For Handle save button 
  const handleSaveEdit = () => {
    const updatedMembersData = [...membersData];
    updatedMembersData[startIndex + editRowIndex] = editedRow;
    setMembersData(updatedMembersData);
    setEditRowIndex(null);
    setEditedRow({});
  };

  // For Handle cancel button 
  const handleCancelEdit = () => {
    setEditRowIndex(null);
    setEditedRow({});
  };

  //For Handle delete button 
  const handleDelete = (rowIndex) => {
    const updatedMembersData = [...membersData];
    updatedMembersData.splice(startIndex + rowIndex, 1);
    setMembersData(updatedMembersData);
  };

  // For Update table rows based on current page data
  const tableRows = currentPageData.map((row, rowIndex) => (
    <tr
      key={startIndex + rowIndex}
      className={
        selectedRows.includes(startIndex + rowIndex) ? "selected-row" : ""
      }
    >
      <td>
        <input
          type="checkbox"
          checked={selectedRows.includes(startIndex + rowIndex)}
          onChange={() => selectRow(startIndex + rowIndex)}
        />
      </td>
      {Object.entries(row).map(([key, value], cellIndex) => (
        <td key={cellIndex}>
          {editRowIndex === rowIndex ? (
            <input
              type="text"
              value={editedRow[key] || ""}
              onChange={(e) =>
                setEditedRow((prevRow) => ({
                  ...prevRow,
                  [key]: e.target.value,
                }))
              }
            />
          ) : (
            value
          )}
        </td>
      ))}
      <td>
        {editRowIndex === rowIndex ? (
          <>
            <button className="save" onClick={handleSaveEdit}>
              Save
            </button>
            <button className="cancel" onClick={handleCancelEdit}>
              Cancel
            </button>
          </>
        ) : (
          <>
            <button className="edit" onClick={() => handleEdit(rowIndex)}>
              Edit
            </button>
            <button className="delete" onClick={() => handleDelete(rowIndex)}>
              Delete
            </button>
          </>
        )}
      </td>
    </tr>
  ));

  // Update pagination buttons based on current page and total pages
  const paginationButtons = (
    <div className="pagination">
      <button
        className="first-page"
        onClick={() => setCurrentPage(1)}
        disabled={currentPage === 1}
      >
        First
      </button>
      <button
        className="previous-page"
        onClick={() => setCurrentPage(currentPage - 1)}
        disabled={currentPage === 1}
      >
        Previous
      </button>
      <span className="page-info">
        Page {currentPage} of {totalPages}
      </span>
      <button
        className="next-page"
        onClick={() => setCurrentPage(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        Next
      </button>
      <button
        className="last-page"
        onClick={() => setCurrentPage(totalPages)}
        disabled={currentPage === totalPages}
      >
        Last
      </button>
    </div>
  );

  return (
    <div className="table-container">
      <div style={{ margin: "20px" }} className="search-bar">
        <input
          style={{ padding: "8px", borderRadius: "10px" }}
          type="text"
          value={searchInput}
          onChange={handleSearchChange}
          placeholder="Search"
        />
        <button
          style={{ marginLeft: "20px" }}
          className="search-icon"
          onClick={search}
        >
          Search
        </button>

        <button
          style={{ marginLeft: "20px" }}
          className="bulk-delete"
          onClick={deleteSelected}
          disabled={selectedRows.length === 0}
        >
          Delete Selected
        </button>
      </div>

      <table id="membersTable">
        <thead>
          <tr>
            <th>Select</th>
            {Object.keys(currentPageData[0] || {}).map((header, index) => (
              <th key={index}>{header}</th>
            ))}
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>{tableRows}</tbody>
      </table>

      {paginationButtons}
    </div>
  );
};

export default App;
