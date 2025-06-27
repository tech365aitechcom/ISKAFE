"use client";

import { FileText, Search, Video } from "lucide-react";
import { useState } from "react";
import PaginationHeader from "../../../../_components/PaginationHeader";
import Pagination from "../../../../_components/Pagination";
import ConfirmationModal from "../../../../_components/ConfirmationModal";
import ActionButtons from "../../../../_components/ActionButtons";
import axios from "axios";
import { enqueueSnackbar } from "notistack";
import { API_BASE_URL, apiConstants } from "../../../../../constants";

export function RulesTable({
  rules,
  limit,
  setLimit,
  currentPage,
  setCurrentPage,
  totalPages,
  totalItems,
  onSuccess,
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  selectedSubTab,
  setSelectedSubTab,
  selectedStatus,
  setSelectedStatus,
}) {
  const [isDelete, setIsDelete] = useState(false);
  const [selectedRule, setSelectedRule] = useState("");

  const handleDelete = async (id) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/rules/${id}`);
      if (response.status == apiConstants.success) {
        enqueueSnackbar("Person deleted successfully", { variant: "success" });
        setIsDelete(false);
        if (onSuccess) onSuccess();
      }
    } catch (error) {
      enqueueSnackbar("Failed to delete person", { variant: "error" });
    }
  };

  const handleResetFilter = () => {
    setSelectedCategory("");
    setSelectedSubTab("");
    setSelectedStatus("");
    setSearchQuery("");
  };

  const renderHeader = (label) => (
    <th className="px-4 pb-3 whitespace-nowrap cursor-pointer">
      <div className="flex items-center gap-1">{label}</div>
    </th>
  );

  const getStatusBadge = (status) => {
    const baseClasses = "px-2 py-1 rounded-full text-xs font-medium";
    return status === "Active"
      ? `${baseClasses} bg-green-100 text-green-800`
      : `${baseClasses} bg-red-100 text-red-800`;
  };

  return (
    <>
      <div className="relative mb-6">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <Search size={18} className="text-gray-400" />
        </div>
        <input
          type="text"
          className="bg-transparent border border-gray-700 text-white rounded-md pl-10 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-600"
          placeholder="Search by Rule Title..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="relative">
          <label className="block mb-2 text-sm font-medium text-white">
            Rule Category
          </label>
          <div className="relative">
            <select
              className="w-full px-4 py-2 bg-transparent border border-gray-700 rounded-lg text-white appearance-none outline-none"
              value={selectedCategory || ""}
              onChange={(e) => setSelectedCategory(e.target.value || null)}
            >
              <option value="" className="text-black">
                All Categories
              </option>
              <option value="Kickboxing" className="text-black">
                Kickboxing
              </option>
              <option value="Muay Thai" className="text-black">
                Muay Thai
              </option>
              <option value="Boxing" className="text-black">
                Boxing
              </option>
              <option value="MMA" className="text-black">
                MMA
              </option>
            </select>
          </div>
        </div>
        <div className="relative">
          <label className="block mb-2 text-sm font-medium text-white">
            Sub-Tab
          </label>
          <div className="relative">
            <select
              className="w-full px-4 py-2 bg-transparent border border-gray-700 rounded-lg text-white appearance-none outline-none"
              value={selectedSubTab || ""}
              onChange={(e) => setSelectedSubTab(e.target.value || null)}
            >
              <option value="" className="text-black">
                All Sub-Tabs
              </option>
              <option value="General" className="text-black">
                General
              </option>
              <option value="Equipment" className="text-black">
                Equipment
              </option>
              <option value="Judging" className="text-black">
                Judging
              </option>
              <option value="Other" className="text-black">
                Other
              </option>
            </select>
          </div>
        </div>
        <div className="relative">
          <label className="block mb-2 text-sm font-medium text-white">
            Status
          </label>
          <div className="relative">
            <select
              className="w-full px-4 py-2 bg-transparent border border-gray-700 rounded-lg text-white appearance-none outline-none"
              value={selectedStatus || ""}
              onChange={(e) => setSelectedStatus(e.target.value || null)}
            >
              <option value="" className="text-black">
                All
              </option>
              <option value="Active" className="text-black">
                Active
              </option>
              <option value="Inactive" className="text-black">
                Inactive
              </option>
            </select>
          </div>
        </div>
      </div>
      {(selectedCategory || selectedSubTab || selectedStatus) && (
        <div className="flex justify-end mb-6">
          <button
            className="border border-gray-700 text-white rounded-lg px-4 py-2 hover:bg-gray-700 transition"
            onClick={handleResetFilter}
          >
            Reset Filters
          </button>
        </div>
      )}
      <div className="border border-[#343B4F] rounded-lg overflow-hidden">
        <PaginationHeader
          limit={limit}
          setLimit={setLimit}
          currentPage={currentPage}
          totalItems={totalItems}
          label="rules"
        />
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="text-gray-400 text-sm">
                {renderHeader("Rule Category", "ruleCategory")}
                {renderHeader("Sub-Tab Name", "subTabName")}
                {renderHeader("Rule Title", "ruleTitle")}
                {renderHeader("Rule Description", "ruleDescription")}
                {renderHeader("PDF", "uploadPDF")}
                {renderHeader("Video Link", "videoLink")}
                {renderHeader("Sort Order", "sortOrder")}
                {renderHeader("Status", "status")}
                {renderHeader("Actions", "actions")}
              </tr>
            </thead>
            <tbody>
              {rules && rules.length > 0 ? (
                rules.map((rule, index) => (
                  <tr
                    key={rule?._id}
                    className={`cursor-pointer ${
                      index % 2 === 0 ? "bg-[#0A1330]" : "bg-[#0B1739]"
                    }`}
                  >
                    <td className="p-4">{rule.category}</td>
                    <td className="p-4">{rule.subTab}</td>
                    <td className="p-4">{rule.ruleTitle}</td>
                    <td className="p-4 whitespace-pre-wrap">
                      {rule.ruleDescription}
                    </td>

                    <td className="p-4">
                      {rule.rule && (
                        <a
                          href={rule.rule}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2"
                        >
                          <FileText size={18} /> View PDF
                        </a>
                      )}
                    </td>
                    <td className="p-4">
                      {rule.videoLink && (
                        <a
                          href={rule.videoLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2"
                        >
                          <Video size={18} /> Watch Video
                        </a>
                      )}
                    </td>
                    <td className="p-4">{rule.sortOrder}</td>
                    <td className="px-4 py-3 whitespace-nowrap max-w-xs overflow-hidden text-ellipsis">
                      <span className={getStatusBadge(rule.status)}>
                        {rule.status}
                      </span>
                    </td>
                    <td className="p-4 align-middle">
                      <ActionButtons
                        viewUrl={`/admin/rules/view/${rule._id}`}
                        editUrl={`/admin/rules/edit/${rule._id}`}
                        onDelete={() => {
                          setIsDelete(true);
                          setSelectedRule(rule._id);
                        }}
                      />
                    </td>
                  </tr>
                ))
              ) : (
                <tr className="text-center bg-[#0A1330]">
                  <td colSpan="9" className="p-4">
                    No rules found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Confirmation Modal */}
        <ConfirmationModal
          isOpen={isDelete}
          onClose={() => setIsDelete(false)}
          onConfirm={() => handleDelete(selectedRule)}
          title="Delete Rule"
          message="Are you sure you want to delete this rule?"
        />
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>
    </>
  );
}
