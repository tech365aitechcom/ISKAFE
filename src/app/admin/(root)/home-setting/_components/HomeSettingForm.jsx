"use client";
import axios from "axios";
import { API_BASE_URL, apiConstants } from "../../../../../constants/index";
import {
  Trash2,
  Edit2,
  Save,
  X,
  MoveDownIcon,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import useStore from "../../../../../stores/useStore";
import { enqueueSnackbar } from "notistack";
import Loader from "../../../../_components/Loader";
import { uploadToS3 } from "../../../../../utils/uploadToS3";
import Confirmation from "../../_components/Confirmation";
import { CustomMultiSelect } from "../../../../_components/CustomMultiSelect";

export const HomeSettingsForm = () => {
  const user = useStore((state) => state.user);
  const [loading, setLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(true);

  const [isNewMediaLoading, setNewMediaLoading] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [confirmMessage, setConfirmMessage] = useState("");
  const [confirmTitle, setConfirmTitle] = useState("");

  const [showCurrMenuItems, setShowCurrMenuItems] = useState(false);

  const [formData, setFormData] = useState({
    logo: null,
    menuItems: [],
    platformName: "",
    tagline: "",
    heroImage: null,
    cta: {
      text: "",
      link: "",
    },
    latestMedia: [],
    latestNews: "",
    upcomingEvents: [],
    topFighters: [],
  });

  // For image previews
  const [previews, setPreviews] = useState({
    logo: null,
    heroImage: null,
    mediaImage: null,
  });

  // Data lists
  const [newsList, setNewsList] = useState([]);
  const [eventsList, setEventsList] = useState([]);
  const [fightersList, setFightersList] = useState([]);

  const [newMenuItem, setNewMenuItem] = useState({
    label: "",
    linkType: "route",
    destination: "",
    openInNewTab: false,
    visibilityRole: "everyone",
    sortOrder: 0,
    status: true,
  });

  const [newMedia, setNewMedia] = useState({
    title: "",
    image: null,
    sortOrder: 0,
  });

  // Edit states
  const [editingMenuItem, setEditingMenuItem] = useState(null);
  const [editingMedia, setEditingMedia] = useState(null);
  const [editMenuItemData, setEditMenuItemData] = useState({});
  const [editMediaData, setEditMediaData] = useState({});
  const [isEditMediaLoading, setEditMediaLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [existingId, setExistingId] = useState("");

  // Fetch all necessary data
  const fetchData = async () => {
    try {
      setDataLoading(true);

      // Fetch home settings
      const homeResponse = await axios.get(`${API_BASE_URL}/home-config`);
      if (homeResponse.data.data) {
        const data = homeResponse.data.data;
        setFormData({
          ...data,
          latestMedia: data.latestMedia || [],
          menuItems: data.menuItems || [],
          cta: data.cta || { text: "", link: "" },
          latestNews: data.latestNews._id || "",
          upcomingEvents: data.upcomingEvents || [],
          topFighters: data.topFighters || [],
        });
        setExistingId(data._id);

        // Set previews for existing images
        setPreviews({
          logo: data.logo || null,
          heroImage: data.heroImage || null,
          mediaImage: null,
        });
      }

      // Fetch news articles
      const newsResponse = await axios.get(`${API_BASE_URL}/news`);
      console.log(newsResponse.data, "newsResponse.data");
      setNewsList(newsResponse.data.data.items || []);

      // Fetch events
      const eventsResponse = await axios.get(`${API_BASE_URL}/events`);
      console.log(eventsResponse.data, "eventsResponse.data");
      setEventsList(eventsResponse.data.data.items || []);

      // Fetch fighters
      const fightersResponse = await axios.get(`${API_BASE_URL}/fighters`);
      console.log(fightersResponse.data, "fightersResponse.data");
      setFightersList(fightersResponse.data.data.items || []);
    } catch (err) {
      console.error("Error fetching data:", err);
      enqueueSnackbar("Failed to load data", { variant: "error" });
      // Set empty arrays on error
      setNewsList([]);
      setEventsList([]);
      setFightersList([]);
    } finally {
      setLoading(false);
      setDataLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    // Enforce character limits
    if (name === "platformName" && value.length > 50) {
      enqueueSnackbar("Platform Name cannot exceed 50 characters", {
        variant: "error",
      });
      return;
    }

    if (name === "tagline" && value.length > 100) {
      enqueueSnackbar("Tagline cannot exceed 100 characters", {
        variant: "error",
      });
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Handle multi-select changes
  const handleMultiSelectChange = (e, field) => {
    const options = e.target.options;
    const selectedValues = [];
    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) {
        selectedValues.push(options[i].value);
      }
    }
    setFormData((prev) => ({ ...prev, [field]: selectedValues }));
  };

  const handleFileUpload = (e) => {
    const { name, files } = e.target;
    const file = files[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        [name]: file,
      }));

      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setPreviews((prev) => ({ ...prev, [name]: previewUrl }));
    }
  };

  const handleMediaFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewMedia((prev) => ({
        ...prev,
        image: file,
      }));

      // Create preview for new media
      const previewUrl = URL.createObjectURL(file);
      setPreviews((prev) => ({ ...prev, mediaImage: previewUrl }));
    }
  };

  const handleEditMediaFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEditMediaData((prev) => ({
        ...prev,
        image: file,
      }));

      // Create preview for edit media
      const previewUrl = URL.createObjectURL(file);
      setPreviews((prev) => ({ ...prev, editMediaImage: previewUrl }));
    }
  };

  const handleHeroCtaChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, cta: { ...prev.cta, [name]: value } }));
  };

  // Validate URLs
  const isValidUrl = (url) => {
  // Allow routes starting with /
  if (url.startsWith('/')) return true;
  
  try {
    new URL(url);
    return true;
  } catch (e) {
    return false;
  }
}

  // Menu Item Functions
  const handleAddMenuItem = () => {
    const { label, destination, sortOrder } = newMenuItem;

    if (!label.trim() || !destination.trim()) {
      enqueueSnackbar("Label and destination are required", {
        variant: "error",
      });
      return;
    }

    const parsedSortOrder = parseInt(sortOrder) || 0;

    // Check for duplicate sortOrder
    const isDuplicateSortOrder = (formData.menuItems || []).some(
      (item) => item.sortOrder === parsedSortOrder
    );

    if (isDuplicateSortOrder) {
      enqueueSnackbar(
        `Sort Order "${parsedSortOrder}" already exists. Please use a unique value.`,
        {
          variant: "error",
        }
      );
      return;
    }

    setFormData((prev) => ({
      ...prev,
      menuItems: [
        ...(prev.menuItems || []),
        { ...newMenuItem, sortOrder: parsedSortOrder },
      ],
    }));

    setNewMenuItem({
      label: "",
      linkType: "route",
      destination: "",
      openInNewTab: false,
      visibilityRole: "everyone",
      sortOrder: 0,
      status: true,
    });
  };

  const handleEditMenuItem = (index) => {
    setEditingMenuItem(index);
    setEditMenuItemData({ ...formData.menuItems[index] });
  };

  const handleCancelEditMenuItem = () => {
    setEditingMenuItem(null);
    setEditMenuItemData({});
  };

  const handleSaveMenuItem = () => {
    const { label, destination, sortOrder } = editMenuItemData;

    if (!label?.trim() || !destination?.trim()) {
      enqueueSnackbar("Label and destination are required", {
        variant: "error",
      });
      return;
    }

    const parsedSortOrder = parseInt(sortOrder) || 0;

    // Check for duplicate sortOrder (excluding current item)
    const isDuplicateSortOrder = (formData.menuItems || []).some(
      (item, idx) =>
        idx !== editingMenuItem && item.sortOrder === parsedSortOrder
    );

    if (isDuplicateSortOrder) {
      enqueueSnackbar(
        `Sort Order "${parsedSortOrder}" already exists. Please use a unique value.`,
        {
          variant: "error",
        }
      );
      return;
    }

    setFormData((prev) => ({
      ...prev,
      menuItems: prev.menuItems.map((item, idx) =>
        idx === editingMenuItem
          ? { ...editMenuItemData, sortOrder: parsedSortOrder }
          : item
      ),
    }));

    setEditingMenuItem(null);
    setEditMenuItemData({});
  };

  const handleDeleteMenuItem = (index) => {
    setConfirmTitle("Delete Menu Item");
    setConfirmMessage("Are you sure you want to delete this menu item?");
    setConfirmAction(() => () => {
      setFormData((prev) => ({
        ...prev,
        menuItems: prev.menuItems.filter((_, i) => i !== index),
      }));
      enqueueSnackbar("Menu item deleted successfully", { variant: "success" });
      setShowConfirmModal(false);
    });
    setShowConfirmModal(true);
  };

  // Media Functions
  const handleAddNewLatestMedia = async (e) => {
      if (e) e.preventDefault();
    setNewMediaLoading(true);
    const { title, image, sortOrder } = newMedia;

    if (!title.trim()) {
      enqueueSnackbar("Title is required", {
        variant: "error",
      });
      setNewMediaLoading(false);
      return;
    }

    if (title.length > 50) {
      enqueueSnackbar("Title cannot exceed 50 characters", {
        variant: "error",
      });
      setNewMediaLoading(false);
      return;
    }

    if (!image) {
      enqueueSnackbar("Image is required for new media items", {
        variant: "error",
      });
      setNewMediaLoading(false);
      return;
    }

    const parsedSortOrder = parseInt(sortOrder) || 0;

    // Check for duplicate sortOrder
    const isDuplicateSortOrder = (formData.latestMedia || []).some(
      (media) => media.sortOrder === parsedSortOrder
    );

    if (isDuplicateSortOrder) {
      enqueueSnackbar(
        `Sort Order "${parsedSortOrder}" already exists. Please use a unique value.`,
        {
          variant: "error",
        }
      );
      setNewMediaLoading(false);
      return;
    }

    try {
      let imageUrl = image;
      if (image && typeof image !== "string") {
        imageUrl = await uploadToS3(image);
      }

      const mediaItem = {
        title: title.trim(),
        image: imageUrl,
        sortOrder: parsedSortOrder,
      };

      setFormData((prev) => ({
        ...prev,
        latestMedia: [...(prev.latestMedia || []), mediaItem],
      }));

      setNewMedia({
        title: "",
        image: null,
        sortOrder: 0,
      });

      // Reset file input and preview
      const fileInput = document.querySelector('input[name="mediaImage"]');
      if (fileInput) fileInput.value = "";
      setPreviews((prev) => ({ ...prev, mediaImage: null }));
    } catch (error) {
      console.log("Error uploading media image:", error);
    } finally {
      setNewMediaLoading(false);
    }
  };

  const handleEditMedia = (index) => {
    setEditingMedia(index);
    setEditMediaData({ ...formData.latestMedia[index] });
    setPreviews((prev) => ({
      ...prev,
      editMediaImage: formData.latestMedia[index].image,
    }));
  };

  const handleCancelEditMedia = () => {
    setEditingMedia(null);
    setEditMediaData({});
    setPreviews((prev) => ({ ...prev, editMediaImage: null }));
  };

  const handleSaveMedia = async () => {
    setEditMediaLoading(true);
    const { title, image, sortOrder } = editMediaData;

    if (!title?.trim()) {
      enqueueSnackbar("Title is required", { variant: "error" });
      setEditMediaLoading(false);
      return;
    }

    if (title.length > 50) {
      enqueueSnackbar("Title cannot exceed 50 characters", {
        variant: "error",
      });
      setEditMediaLoading(false);
      return;
    }

    const parsedSortOrder = parseInt(sortOrder) || 0;

    // Check for duplicate sortOrder (excluding current item)
    const isDuplicateSortOrder = (formData.latestMedia || []).some(
      (media, idx) =>
        idx !== editingMedia && media.sortOrder === parsedSortOrder
    );

    if (isDuplicateSortOrder) {
      enqueueSnackbar(
        `Sort Order "${parsedSortOrder}" already exists. Please use a unique value.`,
        {
          variant: "error",
        }
      );
      setEditMediaLoading(false);
      return;
    }

    try {
      let imageUrl = image;
      if (image && typeof image !== "string") {
        imageUrl = await uploadToS3(image);
      }

      const updatedMediaItem = {
        title: title.trim(),
        image: imageUrl,
        sortOrder: parsedSortOrder,
      };

      setFormData((prev) => ({
        ...prev,
        latestMedia: prev.latestMedia.map((item, idx) =>
          idx === editingMedia ? updatedMediaItem : item
        ),
      }));

      setEditingMedia(null);
      setEditMediaData({});
      setPreviews((prev) => ({ ...prev, editMediaImage: null }));
    } catch (error) {
      console.log("Error uploading media image:", error);
    } finally {
      setEditMediaLoading(false);
    }
  };

  const handleDeleteMedia = (index) => {
    setConfirmTitle("Delete Media Item");
    setConfirmMessage("Are you sure you want to delete this media item?");
    setConfirmAction(() => () => {
      setFormData((prev) => ({
        ...prev,
        latestMedia: (prev.latestMedia || []).filter((_, i) => i !== index),
      }));
      enqueueSnackbar("Media item deleted successfully", {
        variant: "success",
      });
      setShowConfirmModal(false);
    });
    setShowConfirmModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
   const validations = [
    {
      condition: !formData.platformName.trim(),
      message: 'Platform Name is required',
    },
    { 
      condition: !formData.tagline.trim(), 
      message: 'Tagline is required' 
    },
    { 
      condition: !formData.heroImage, 
      message: 'Hero image is required' 
    },
    { 
      condition: !formData.cta.text.trim(), 
      message: 'CTA text is required' 
    },
    {
      condition: !formData.cta.link.trim(),
      message: 'CTA link is required',
    },
  ];

  const failedValidation = validations.find(v => v.condition);
  if (failedValidation) {
    enqueueSnackbar(failedValidation.message, { variant: 'error' });
    setIsSubmitting(false);
    return;
  }

  // Validate CTA link format (either URL or route starting with /)
  if (formData.cta.link.trim() && !isValidUrl(formData.cta.link)) {
    if (!formData.cta.link.startsWith('/')) {
      enqueueSnackbar('CTA link must be a valid URL or start with / for routes', { 
        variant: 'error' 
      });
      setIsSubmitting(false);
      return;
    }
  }

    if (formData.menuItems.length > 0) {
      validations.push({
        condition: formData.menuItems.some(
          (item) => !item.label.trim() || !item.destination.trim()
        ),
        message: "All menu items must have a label and destination",
      });
    }

    if (formData.latestMedia.length > 0) {
      validations.push({
        condition: formData.latestMedia.some(
          (media) => !media.title || media.title.length > 50
        ),
        message: "Media titles must be 1-50 characters",
      });
    }

    if (formData.cta.link.trim() && !isValidUrl(formData.cta.link)) {
      if (!formData.cta.link.startsWith("/")) {
        enqueueSnackbar(
          "CTA link must be a valid URL or start with / for routes",
          {
            variant: "error",
          }
        );
        setIsSubmitting(false);
        return;
      }
    }

    for (const { condition, message } of validations) {
      if (condition) {
        enqueueSnackbar(message, { variant: "error" });
        return;
      }
    }

    // Validate media titles
    const hasInvalidMedia = formData.latestMedia.some(
      (media) => !media.title || media.title.length > 50
    );

    if (hasInvalidMedia) {
      enqueueSnackbar("Media titles must be 1-50 characters", {
        variant: "error",
      });
      return;
    }

    try {
      const preparedData = { ...formData };

      if (formData.logo && typeof formData.logo !== "string") {
        try {
          const s3UploadedUrl = await uploadToS3(formData.logo);
          preparedData.logo = s3UploadedUrl;
        } catch (error) {
          console.error("Logo upload failed:", error);
          return;
        }
      }

      if (formData.heroImage && typeof formData.heroImage !== "string") {
        try {
          const s3UploadedUrl = await uploadToS3(formData.heroImage);
          preparedData.heroImage = s3UploadedUrl;
        } catch (error) {
          console.error("Hero image upload failed:", error);
          return;
        }
      }

      let response = null;
      if (existingId) {
        response = await axios.put(
          `${API_BASE_URL}/home-config/${existingId}`,
          preparedData
        );
      } else {
        response = await axios.post(
          `${API_BASE_URL}/home-config`,
          preparedData,
          {
            headers: {
              Authorization: `Bearer ${user?.token}`,
            },
          }
        );
      }

      if (
        response.status === apiConstants.success ||
        response.status === apiConstants.create
      ) {
        enqueueSnackbar(
          response.data.message || "Settings updated successfully",
          { variant: "success" }
        );
        fetchData();
      }
    } catch (error) {
      enqueueSnackbar(
        error?.response?.data?.message || "Something went wrong",
        {
          variant: "error",
        }
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  console.log("formData", formData);

  if (loading || dataLoading)
    return (
      <div className="min-h-screen text-white bg-dark-blue-900 flex justify-center items-center">
        <Loader />
      </div>
    );

  return (
    <div className="min-h-screen text-white bg-dark-blue-900">
      <div className="w-full mx-auto">
        <h1 className="text-2xl font-bold mb-6">Manage Home Page Settings</h1>
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Logo Section */}
          <div className="bg-dark-blue-800 rounded-xl">
            <label className="block font-medium mb-4 text-lg">Logo</label>
            <div className="">
              <div className="">
                {previews.logo ? (
                  <img
                    src={previews.logo}
                    alt="Logo Preview"
                    className="w-32 h-32 object-contain mb-4"
                  />
                ) : (
                  <div className="bg-gray-700 border-2 border-dashed rounded-xl w-32 h-32 flex items-center justify-center">
                    <span className="text-gray-400">No logo</span>
                  </div>
                )}
              </div>
              <div className="flex-grow">
                <input
                  type="file"
                  name="logo"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="w-full bg-transparent text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-700"
                />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Platform Name */}
            <div className="bg-[#00000061] p-2 h-24 rounded">
              <label className="block font-medium mb-2">
                Platform Name<span className="text-red-500">*</span>
                <span className="text-xs text-gray-400 ml-2">
                  (Max 50 characters)
                </span>
              </label>
              <input
                type="text"
                name="platformName"
                value={formData.platformName}
                onChange={handleChange}
                className="w-full outline-none bg-transparent disabled:cursor-not-allowed"
                required
                maxLength={50}
              />
              <p className="text-xs text-right text-gray-400 p-2">
                {formData.platformName.length}/50 characters
              </p>
            </div>
            {/* Tagline */}
            <div className="bg-[#00000061] p-2 h-24 rounded">
              <label className="block font-medium mb-2">
                Tagline<span className="text-red-500">*</span>
                <span className="text-xs text-gray-400 ml-2">
                  (Max 100 characters)
                </span>
              </label>
              <input
                type="text"
                name="tagline"
                value={formData.tagline}
                onChange={handleChange}
                className="w-full outline-none bg-transparent disabled:cursor-not-allowed"
                required
                maxLength={100}
              />
              <p className="text-xs text-right text-gray-400 p-2">
                {formData.tagline.length}/100 characters
              </p>
            </div>

            {/* Hero Image */}
            <div className="rounded-xl">
              <label className="block font-medium mb-4 text-lg">
                Hero Image<span className="text-red-500">*</span>
              </label>
              <div className="mb-4">
                {previews.heroImage ? (
                  <img
                    src={previews.heroImage}
                    alt="Hero Preview"
                    className="w-full h-64 object-cover rounded-lg border border-purple-500"
                  />
                ) : (
                  <div className="bg-gray-700 border-2 border-dashed rounded-xl w-full h-64 flex items-center justify-center">
                    <span className="text-gray-400">No hero image</span>
                  </div>
                )}
              </div>
              <input
                type="file"
                name="heroImage"
                accept="image/*"
                onChange={handleFileUpload}
                className="w-full bg-transparent text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-700"
                required
              />
            </div>

            {/* CTA Section */}
            <div className="rounded-xl">
              <label className="block font-medium mb-4 text-lg">
                Call to Action
              </label>
              <div className="space-y-4">
                <div className="bg-[#00000061] p-2 rounded">
                  <label className="block font-medium mb-2">
                    CTA Text<span className="text-red-500">*</span>
                  </label>
                  <input
                    name="text"
                    type="text"
                    value={formData.cta.text}
                    onChange={handleHeroCtaChange}
                    className="w-full outline-none bg-transparent disabled:cursor-not-allowed"
                    required
                  />
                </div>
                <div className="bg-[#00000061] p-2 rounded">
                  <label className="block font-medium mb-2">
                    CTA Link<span className="text-red-500">*</span>
                  </label>
                  <input
                    name="link"
                    type="text"
                    value={formData.cta.link}
                    onChange={handleHeroCtaChange}
                    className="w-full outline-none bg-transparent disabled:cursor-not-allowed"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Latest News */}
            <div className="bg-[#00000061] py-1 px-2 rounded">
              <label className="block font-medium mb-2">
                Latest News Article
              </label>
              <select
                name="latestNews"
                value={formData.latestNews}
                onChange={handleChange}
                className="w-full outline-none bg-transparent disabled:cursor-not-allowed"
              >
                <option value="" className="text-black">
                  Select a news article
                </option>
                {Array.isArray(newsList) &&
                  newsList.map((news) => (
                    <option
                      key={news._id}
                      value={news._id}
                      className="text-black"
                    >
                      {news.title}
                    </option>
                  ))}
              </select>
            </div>
            {/* Upcoming Events */}
            <div className="bg-[#00000061] py-1 px-2 rounded ">
              <label className="block text-sm font-medium mb-2">
                Upcoming Events
              </label>
              <CustomMultiSelect
                label="Upcoming Events"
                options={eventsList.map((event) => ({
                  _id: event._id,
                  fullName: event.name,
                }))}
                value={formData.upcomingEvents.map((event) => event._id)}
                onChange={(selectedIds) => {
                  const updatedEvents = eventsList.filter((event) =>
                    selectedIds.includes(event._id)
                  );
                  setFormData((prev) => ({
                    ...prev,
                    upcomingEvents: updatedEvents,
                  }));
                }}
              />
            </div>
            {/* Top Fighters */}

            <div className="bg-[#00000061] py-1 px-2 rounded">
              <label className="block text-sm font-medium mb-2">
                Top Fighters
              </label>
              <CustomMultiSelect
                label="Top Fighters"
                options={fightersList.map((fighter) => ({
                  _id: fighter._id,
                  fullName:
                    fighter.user.firstName + " " + fighter.user.lastName,
                }))}
                value={formData.topFighters.map((fighter) => fighter._id)}
                onChange={(selectedIds) => {
                  const updatedFighters = fightersList.filter((fighter) =>
                    selectedIds.includes(fighter._id)
                  );
                  setFormData((prev) => ({
                    ...prev,
                    topFighters: updatedFighters,
                  }));
                }}
              />
            </div>
          </div>

          {/* Latest Media Section */}
          <div className="bg-dark-blue-800 rounded-xl">
            <label className="block font-medium mb-4 text-lg">
              Latest Media
            </label>
            {/* Display existing media items */}
            {formData.latestMedia &&
              Array.isArray(formData.latestMedia) &&
              formData.latestMedia.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-medium mb-4">
                    Current Media Items
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {formData.latestMedia.map((item, idx) => (
                      <div
                        key={idx}
                        className="bg-[#14255D] p-4 rounded-lg border border-gray-700"
                      >
                        {editingMedia === idx ? (
                          // Edit mode
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium mb-1">
                                Title<span className="text-red-500">*</span>
                                <span className="text-xs text-gray-400 ml-2">
                                  (Max 50 characters)
                                </span>
                              </label>
                              <input
                                type="text"
                                value={editMediaData.title || ""}
                                onChange={(e) =>
                                  setEditMediaData((prev) => ({
                                    ...prev,
                                    title: e.target.value,
                                  }))
                                }
                                className="w-full p-2 bg-[#00000061] rounded outline-none"
                                required
                                maxLength={50}
                              />
                              <div className="text-xs text-right text-gray-400 mt-1">
                                {editMediaData.title?.length || 0}/50
                              </div>
                            </div>

                            <div>
                              <label className="block text-sm font-medium mb-1">
                                Image<span className="text-red-500">*</span>
                              </label>
                              {previews.editMediaImage && (
                                <img
                                  src={previews.editMediaImage}
                                  alt={editMediaData.title}
                                  className="w-full h-48 object-cover rounded mb-2"
                                />
                              )}
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleEditMediaFileUpload}
                                className="w-full bg-transparent text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-700"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium mb-1">
                                Position
                              </label>
                              <input
                                type="number"
                                value={editMediaData.sortOrder || 0}
                                onChange={(e) =>
                                  setEditMediaData((prev) => ({
                                    ...prev,
                                    sortOrder: e.target.value,
                                  }))
                                }
                                className="w-full p-2 bg-[#00000061] rounded outline-none"
                              />
                            </div>

                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={handleSaveMedia}
                                disabled={isEditMediaLoading}
                                className="flex items-center bg-green-600 hover:bg-green-700 px-3 py-2 rounded text-sm transition-colors"
                              >
                                {isEditMediaLoading ? (
                                  <Loader size="small" />
                                ) : (
                                  <>
                                    <Save className="w-4 h-4 mr-1" /> Save
                                  </>
                                )}
                              </button>
                              <button
                                type="button"
                                onClick={handleCancelEditMedia}
                                className="flex items-center bg-gray-600 hover:bg-gray-700 px-3 py-2 rounded text-sm transition-colors"
                              >
                                <X className="w-4 h-4 mr-1" />
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          // View mode
                          <>
                            {item.image && (
                              <img
                                src={item.image}
                                alt={item.title}
                                className="w-full h-48 object-cover rounded mb-3"
                              />
                            )}
                            <p className="font-medium mb-1 truncate">
                              {item.title}
                            </p>
                            <p className="text-sm text-gray-300 mb-3">
                              Position: {item.sortOrder}
                            </p>
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => handleEditMedia(idx)}
                                className="flex-1 flex items-center justify-center bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded transition-colors"
                              >
                                <Edit2 className="w-4 h-4 mr-1" />
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteMedia(idx)}
                                className="flex-1 flex items-center justify-center bg-red-600 hover:bg-red-700 px-3 py-2 rounded transition-colors"
                              >
                                <Trash2 className="w-4 h-4 mr-1" />
                                Remove
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            {/* Add new media item form */}
            
            <div className="space-y-4 mt-6 p-4 bg-[#14255D] rounded-lg">
              <h4 className="text-md font-medium">Add New Media Item</h4>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Title<span className="text-red-500">*</span>
                  <span className="text-xs text-gray-400 ml-2">
                    (Max 50 characters)
                  </span>
                </label>
                <input
                  type="text"
                  placeholder="Media title"
                  value={newMedia.title}
                  onChange={(e) =>
                    setNewMedia((prev) => ({
                      ...prev,
                      title: e.target.value,
                    }))
                  }
                  className="w-full p-2 bg-[#00000061] rounded outline-none"
                  maxLength={50}
                />
                <div className="text-xs text-right text-gray-400 mt-1">
                  {newMedia.title.length}/50
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Image<span className="text-red-500">*</span>
                </label>
                {previews.mediaImage && (
                  <img
                    src={previews.mediaImage}
                    alt="Media preview"
                    className="w-full h-48 object-cover rounded mb-2"
                  />
                )}
                <input
                  type="file"
                  name="mediaImage"
                  accept="image/*"
                  onChange={handleMediaFileUpload}
                  className="w-full bg-transparent text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-700"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Position
                </label>
                <input
                  type="number"
                  placeholder="Display order"
                  value={newMedia.sortOrder}
                  onChange={(e) =>
                    setNewMedia((prev) => ({
                      ...prev,
                      sortOrder: e.target.value,
                    }))
                  }
                  className="w-full p-2 bg-[#00000061] rounded outline-none"
                />
              </div>

              <button
                type="button" // Change to button type to prevent form submission
                onClick={handleAddNewLatestMedia} // Handle click directly
                className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded transition-colors flex items-center justify-center"
                disabled={isNewMediaLoading}
              >
                {isNewMediaLoading ? <Loader size="small" /> : "Add Media Item"}
              </button>
            </div>
          </div>

          {/* Menu Items Section */}
          <div className="bg-dark-blue-800 rounded-xl">
            <label className="block font-medium mb-4 text-lg">Menu Items</label>
            {/* Display current menu items */}
            {formData.menuItems && formData.menuItems.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between mb-4">
                  <button
                    type="button"
                    className="flex gap-2 items-center cursor-pointer"
                    onClick={() => setShowCurrMenuItems((prev) => !prev)}
                  >
                    {showCurrMenuItems
                      ? "Hide Current Menu Items"
                      : "Show Current Menu Items"}
                    {showCurrMenuItems ? <ArrowDown /> : <ArrowRight />}
                  </button>
                </div>

                <div>
                  {showCurrMenuItems && (
                    <div className="space-y-3">
                      {formData.menuItems.map((item, idx) => (
                        <div
                          key={idx}
                          className="bg-[#14255D] p-4 rounded-lg border border-gray-700"
                        >
                          {editingMenuItem === idx ? (
                            // Edit mode
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium mb-1">
                                  Label<span className="text-red-500">*</span>
                                </label>
                                <input
                                  type="text"
                                  value={editMenuItemData.label || ""}
                                  onChange={(e) =>
                                    setEditMenuItemData((prev) => ({
                                      ...prev,
                                      label: e.target.value,
                                    }))
                                  }
                                  className="w-full p-2 bg-[#00000061] rounded outline-none"
                                  required
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium mb-1">
                                  Destination
                                  <span className="text-red-500">*</span>
                                </label>
                                <input
                                  type="text"
                                  value={editMenuItemData.destination || ""}
                                  onChange={(e) =>
                                    setEditMenuItemData((prev) => ({
                                      ...prev,
                                      destination: e.target.value,
                                    }))
                                  }
                                  className="w-full p-2 bg-[#00000061] rounded outline-none"
                                  required
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium mb-1">
                                  Link Type
                                </label>
                                <select
                                  value={editMenuItemData.linkType || "route"}
                                  onChange={(e) =>
                                    setEditMenuItemData((prev) => ({
                                      ...prev,
                                      linkType: e.target.value,
                                    }))
                                  }
                                  className="w-full p-2 bg-[#00000061] rounded outline-none"
                                >
                                  <option value="route">Route</option>
                                  <option value="url">URL</option>
                                  <option value="modal">Modal</option>
                                </select>
                              </div>
                              <div>
                                <label className="block text-sm font-medium mb-1">
                                  Visibility
                                </label>
                                <select
                                  value={
                                    editMenuItemData.visibilityRole ||
                                    "everyone"
                                  }
                                  onChange={(e) =>
                                    setEditMenuItemData((prev) => ({
                                      ...prev,
                                      visibilityRole: e.target.value,
                                    }))
                                  }
                                  className="w-full p-2 bg-[#00000061] rounded outline-none"
                                >
                                  <option value="everyone">Everyone</option>
                                  <option value="loggedIn">Logged In</option>
                                  <option value="admin">Admin</option>
                                </select>
                              </div>
                              <div>
                                <label className="block text-sm font-medium mb-1">
                                  Position
                                </label>
                                <input
                                  type="number"
                                  value={editMenuItemData.sortOrder || 0}
                                  onChange={(e) =>
                                    setEditMenuItemData((prev) => ({
                                      ...prev,
                                      sortOrder: e.target.value,
                                    }))
                                  }
                                  className="w-full p-2 bg-[#00000061] rounded outline-none"
                                />
                              </div>

                              {/* New fields */}
                              <div className="flex items-center gap-3">
                                <input
                                  type="checkbox"
                                  id={`edit-open-new-${idx}`}
                                  checked={
                                    editMenuItemData.openInNewTab || false
                                  }
                                  onChange={(e) =>
                                    setEditMenuItemData((prev) => ({
                                      ...prev,
                                      openInNewTab: e.target.checked,
                                    }))
                                  }
                                  className="w-4 h-4"
                                />
                                <label
                                  htmlFor={`edit-open-new-${idx}`}
                                  className="text-sm"
                                >
                                  Open in new tab
                                </label>
                              </div>

                              <div className="flex items-center gap-3">
                                <input
                                  type="checkbox"
                                  id={`edit-status-${idx}`}
                                  checked={editMenuItemData.status ?? true}
                                  onChange={(e) =>
                                    setEditMenuItemData((prev) => ({
                                      ...prev,
                                      status: e.target.checked,
                                    }))
                                  }
                                  className="w-4 h-4"
                                />
                                <label
                                  htmlFor={`edit-status-${idx}`}
                                  className="text-sm"
                                >
                                  Active
                                </label>
                              </div>

                              <div className="col-span-2 flex gap-2 pt-2">
                                <button
                                  type="button"
                                  onClick={handleSaveMenuItem}
                                  className="flex items-center bg-green-600 hover:bg-green-700 px-3 py-2 rounded text-sm transition-colors"
                                >
                                  <Save className="w-4 h-4 mr-1" />
                                  Save
                                </button>
                                <button
                                  type="button"
                                  onClick={handleCancelEditMenuItem}
                                  className="flex items-center bg-gray-600 hover:bg-gray-700 px-3 py-2 rounded text-sm transition-colors"
                                >
                                  <X className="w-4 h-4 mr-1" />
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            // View mode
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                              <div className="flex-grow">
                                <p className="font-medium flex items-center gap-2">
                                  <span className="text-purple-300">
                                    Label:
                                  </span>
                                  {item.label}
                                  {!item.status && (
                                    <span className="text-xs bg-red-500/20 text-red-300 px-2 py-1 rounded">
                                      Inactive
                                    </span>
                                  )}
                                </p>
                                <p className="text-sm text-gray-300">
                                  <span className="text-purple-300">
                                    Destination:
                                  </span>{" "}
                                  {item.destination}
                                </p>
                                <p className="text-sm text-gray-300">
                                  <span className="text-purple-300">Type:</span>{" "}
                                  {item.linkType} |{" "}
                                  <span className="text-purple-300">
                                    Visibility:
                                  </span>{" "}
                                  {item.visibilityRole} |{" "}
                                  <span className="text-purple-300">
                                    Position:
                                  </span>{" "}
                                  {item.sortOrder} |{" "}
                                  <span className="text-purple-300">
                                    New Tab:
                                  </span>{" "}
                                  {item.openInNewTab ? "Yes" : "No"}
                                </p>
                              </div>
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleEditMenuItem(idx)}
                                  className="flex items-center bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded text-sm transition-colors"
                                >
                                  <Edit2 className="w-4 h-4 mr-1" />
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteMenuItem(idx)}
                                  className="flex items-center bg-red-600 hover:bg-red-700 px-3 py-2 rounded text-sm transition-colors"
                                >
                                  <Trash2 className="w-4 h-4 mr-1" />
                                  Remove
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Add new menu item form */}
            <div className="space-y-4 mt-6 p-4 bg-[#14255D] rounded-lg">
              <h4 className="text-md font-medium">Add New Menu Item</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Label<span className="text-red-500">*</span>
                  </label>
                  <input
                    placeholder="Label"
                    value={newMenuItem.label}
                    onChange={(e) =>
                      setNewMenuItem((prev) => ({
                        ...prev,
                        label: e.target.value,
                      }))
                    }
                    className="w-full p-2 bg-[#00000061] rounded outline-none"
                    
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Destination<span className="text-red-500">*</span>
                  </label>
                  <input
                    placeholder="Destination"
                    value={newMenuItem.destination}
                    onChange={(e) =>
                      setNewMenuItem((prev) => ({
                        ...prev,
                        destination: e.target.value,
                      }))
                    }
                    className="w-full p-2 bg-[#00000061] rounded outline-none"
                    
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Link Type
                  </label>
                  <select
                    value={newMenuItem.linkType}
                    onChange={(e) =>
                      setNewMenuItem((prev) => ({
                        ...prev,
                        linkType: e.target.value,
                      }))
                    }
                    className="w-full p-2 bg-[#00000061] rounded"
                  >
                    <option value="route">Route</option>
                    <option value="url">URL</option>
                    <option value="modal">Modal</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Visibility
                  </label>
                  <select
                    value={newMenuItem.visibilityRole}
                    onChange={(e) =>
                      setNewMenuItem((prev) => ({
                        ...prev,
                        visibilityRole: e.target.value,
                      }))
                    }
                    className="w-full p-2 bg-[#00000061] rounded"
                  >
                    <option value="everyone">Everyone</option>
                    <option value="loggedIn">Logged In</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Position
                  </label>
                  <input
                    type="number"
                    placeholder="Position"
                    value={newMenuItem.sortOrder}
                    onChange={(e) =>
                      setNewMenuItem((prev) => ({
                        ...prev,
                        sortOrder: e.target.value,
                      }))
                    }
                    className="w-full p-2 bg-[#00000061] rounded outline-none"
                  />
                </div>

                {/* New fields */}
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="open-new-tab"
                    checked={newMenuItem.openInNewTab}
                    onChange={(e) =>
                      setNewMenuItem((prev) => ({
                        ...prev,
                        openInNewTab: e.target.checked,
                      }))
                    }
                    className="w-4 h-4"
                  />
                  <label htmlFor="open-new-tab" className="text-sm">
                    Open in new tab
                  </label>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="menu-status"
                    checked={newMenuItem.status}
                    onChange={(e) =>
                      setNewMenuItem((prev) => ({
                        ...prev,
                        status: e.target.checked,
                      }))
                    }
                    className="w-4 h-4"
                  />
                  <label htmlFor="menu-status" className="text-sm">
                    Active
                  </label>
                </div>
              </div>
              <button
                type="button"
                onClick={handleAddMenuItem}
                className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded transition-colors mt-2"
              >
                Add Menu Item
              </button>
            </div>
          </div>

          <div className="text-center pt-6">
            <button
              type="submit"
              className="text-white font-medium py-3 px-8 rounded-lg text-lg transition-all hover:scale-105 flex items-center justify-center gap-2 min-w-[180px]"
              style={{
                background:
                  "linear-gradient(128.49deg, #CB3CFF 19.86%, #7F25FB 68.34%)",
                boxShadow: "0 4px 15px rgba(203, 60, 255, 0.4)",
              }}
              disabled={isSubmitting || loading || dataLoading}
            >
              {isSubmitting ? (
                <>
                  <Loader size="small" /> Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </form>
      </div>

      <Confirmation
        isOpen={showConfirmModal}
        title={confirmTitle}
        message={confirmMessage}
        onConfirm={confirmAction}
        onCancel={() => setShowConfirmModal(false)}
      />
    </div>
  );
};

export default HomeSettingsForm;
