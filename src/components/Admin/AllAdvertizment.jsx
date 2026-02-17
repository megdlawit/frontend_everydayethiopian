import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { DataGrid } from "@material-ui/data-grid";
import { getAllAdvertisements, deleteAdvertisement, createAdvertisement, updateAdvertisement } from "../../redux/actions/advertisement";
import Loader from "../Layout/Loader";
import { Button, TextField, Dialog, DialogActions, DialogContent, DialogTitle } from "@material-ui/core";
import DeleteIcon from "@material-ui/icons/Delete";
import VisibilityIcon from "@material-ui/icons/Visibility";
import EditIcon from "@material-ui/icons/Edit";
import { server } from "../../server";

const AllAdvertizment = () => {
  const dispatch = useDispatch();
  const { advertisements, loading, error } = useSelector((state) => state.advertisement);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [section, setSection] = useState(""); // Add state for section
  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedAd, setSelectedAd] = useState(null);

  useEffect(() => {
    dispatch(getAllAdvertisements());
  }, [dispatch]);

  const handleDelete = (id) => {
    dispatch(deleteAdvertisement(id));
  };

  const handleCreate = (e) => {
    e.preventDefault();
    if (!section) {
      alert("Please select a section for the advertisement."); // Add validation for section
      return;
    }
    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("image", image);
    formData.append("section", section); // Ensure section is included
    dispatch(createAdvertisement(formData));
  };

  const handleEdit = (ad) => {
    setSelectedAd(ad);
    setTitle(ad.title);
    setDescription(ad.description);
    setSection(ad.section);
    setEditMode(true);
    setOpen(true);
  };

  const handleUpdate = (e) => {
    e.preventDefault();
    if (!section) {
      alert("Please select a section for the advertisement."); // Add validation for section
      return;
    }
    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    if (image) {
      formData.append("image", image);
    }
    formData.append("section", section); // Ensure section is included
    dispatch(updateAdvertisement(selectedAd.id, formData));
    setOpen(false);
    setEditMode(false);
    setSelectedAd(null);
  };

  const handleView = (ad) => {
    setSelectedAd(ad);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditMode(false);
    setSelectedAd(null);
  };

  const columns = [
    { field: "id", headerName: "Ad ID", minWidth: 150, flex: 0.7 },
    { field: "title", headerName: "Title", minWidth: 130, flex: 0.7 },
    { field: "description", headerName: "Description", minWidth: 200, flex: 1 },
    { field: "section", headerName: "Section", minWidth: 130, flex: 0.7 }, // Add section column
    { field: "createdAt", headerName: "Created At", minWidth: 130, flex: 0.8 },
    {
      field: "actions",
      headerName: "Actions",
      minWidth: 200,
      flex: 1,
      renderCell: (params) => (
        <>
          <Button
            onClick={() => handleView(params.row)}
            variant="contained"
            color="primary"
            startIcon={<VisibilityIcon />}
            className="mr-2"
          >
            View
          </Button>
          <Button
            onClick={() => handleEdit(params.row)}
            variant="contained"
            color="default"
            startIcon={<EditIcon />}
            className="mr-2"
          >
            Edit
          </Button>
          <Button
            onClick={() => handleDelete(params.id)}
            variant="contained"
            color="secondary"
            startIcon={<DeleteIcon />}
          >
            Delete
          </Button>
        </>
      ),
    },
  ];

  const rows = advertisements.map((ad) => ({
    id: ad._id,
    title: ad.title,
    description: ad.description,
    section: ad.section, // Include section in rows
    createdAt: ad.createdAt.slice(0, 10),
    image: ad.image,
  }));

  return (
    <div className="w-full p-4">
      <h3 className="text-[22px] font-Poppins pb-2">Advertisements</h3>
      <form onSubmit={editMode ? handleUpdate : handleCreate} className="mb-4">
        <TextField
          label="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          fullWidth
          className="mb-2"
        />
        <TextField
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          fullWidth
          className="mb-2"
        />
        <select
          value={section}
          onChange={(e) => setSection(e.target.value)}
          required
          className="mb-2"
        >
          <option value="" disabled>Select Section</option>
          <option value="hero">Hero</option>
          <option value="advert1">Advert 1</option>
          <option value="advert2">Advert 2</option>
        </select>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImage(e.target.files[0])}
          className="mb-2"
        />
        <Button type="submit" variant="contained" color="primary">
          {editMode ? "Update Advertisement" : "Create Advertisement"}
        </Button>
      </form>
      {loading ? (
        <Loader />
      ) : error ? (
        <div className="error">{error}</div>
      ) : advertisements.length === 0 ? (
        <div className="w-full min-h-[45vh] bg-white rounded flex items-center justify-center">
          <p>No advertisements available.</p>
        </div>
      ) : (
        <div className="w-full min-h-[45vh] bg-white rounded">
          <DataGrid rows={rows} columns={columns} pageSize={4} disableSelectionOnClick autoHeight />
        </div>
      )}
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{editMode ? "Edit Advertisement" : "Advertisement Details"}</DialogTitle>
        <DialogContent>
          {selectedAd && !editMode && (
            <>
              <p><strong>Title:</strong> {selectedAd.title}</p>
              <p><strong>Description:</strong> {selectedAd.description}</p>
              <img src={`${server}${selectedAd.image}`} alt={selectedAd.title} style={{ width: "100%" }} />
            </>
          )}
          {editMode && (
            <form onSubmit={handleUpdate}>
              <TextField
                label="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                fullWidth
                className="mb-2"
              />
              <TextField
                label="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                fullWidth
                className="mb-2"
              />
              <select
                value={section}
                onChange={(e) => setSection(e.target.value)}
                required
                className="mb-2"
              >
                <option value="" disabled>Select Section</option>
                <option value="hero">Hero</option>
                <option value="advert1">Advert 1</option>
                <option value="advert2">Advert 2</option>
              </select>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImage(e.target.files[0])}
                className="mb-2"
              />
              <Button type="submit" variant="contained" color="primary">
                Update Advertisement
              </Button>
            </form>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default AllAdvertizment;
