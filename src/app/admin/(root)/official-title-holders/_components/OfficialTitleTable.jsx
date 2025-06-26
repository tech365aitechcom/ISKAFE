'use client';

import axios from 'axios';
import { Search } from 'lucide-react';
import { enqueueSnackbar } from 'notistack';
import { useState } from 'react';
import { API_BASE_URL } from '../../../../../constants';
import ConfirmationModal from '../../../../_components/ConfirmationModal';
import PaginationHeader from '../../../../_components/PaginationHeader';
import Pagination from '../../../../_components/Pagination';
import ActionButtons from '../../../../_components/ActionButtons';

export function OfficialTitleTable({
  officialTitles,
  limit,
  setLimit,
  currentPage,
  setCurrentPage,
  totalPages,
  totalItems,
  onSuccess,
  searchQuery,
  setSearchQuery,
}) {
  const [isDelete, setIsDelete] = useState(false);
  const [selectedTitle, setSelectedTitle] = useState(null);

  const handleDeleteTitle = async (titleId) => {
    try {
      const response = await axios.delete(
        `${API_BASE_URL}/official-title-holders/${titleId}`
      );
      enqueueSnackbar(response.data.message, { variant: 'success' });
      setIsDelete(false);
      if (onSuccess) onSuccess();
    } catch (error) {
      enqueueSnackbar('Failed to delete title', { variant: 'error' });
    }
  };

  const renderHeader = (label, key) => (
    <th className="px-4 pb-3 whitespace-nowrap cursor-pointer">
      <div className="flex items-center gap-1">{label}</div>
    </th>
  );

  // ✅ FILTERING LOGIC based on search query
  const filteredTitles = officialTitles.filter((title) => {
    const fullName = `${title.fighter?.userId?.firstName ?? ''} ${title.fighter?.userId?.lastName ?? ''}`.toLowerCase();
    const titleName = title.title?.toLowerCase() ?? '';
    const weightClass = title.weightClass?.toLowerCase() ?? '';

    return (
      fullName.includes(searchQuery.toLowerCase()) ||
      titleName.includes(searchQuery.toLowerCase()) ||
      weightClass.includes(searchQuery.toLowerCase())
    );
  });

  return (
    <>
      {/* Search Bar */}
      <div className="relative mb-6">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <Search size={18} className="text-gray-400" />
        </div>
        <input
          type="text"
          className="bg-transparent border border-gray-700 text-white rounded-md pl-10 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-600"
          placeholder="Search Titles..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="border border-[#343B4F] rounded-lg overflow-hidden">
        <PaginationHeader
          limit={limit}
          setLimit={setLimit}
          currentPage={currentPage}
          totalItems={totalItems}
          label="Official Titles"
        />
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="text-gray-400 text-sm">
                {renderHeader('Fighter', 'fighter')}
                {renderHeader('Title', 'title')}
                {renderHeader('Weight Class', 'weightClass')}
                {renderHeader('Actions', 'actions')}
              </tr>
            </thead>
            <tbody>
              {filteredTitles && filteredTitles.length > 0 ? (
                filteredTitles.map((title, index) => {
                  return (
                    <tr
                      key={title._id}
                      className={`cursor-pointer ${
                        index % 2 === 0 ? 'bg-[#0A1330]' : 'bg-[#0B1739]'
                      }`}
                    >
                      <td className="p-4">
                        {(() => {
                          const user = title.fighter?.userId;
                          const fullName = `${user?.firstName ?? ''} ${user?.lastName ?? ''}`;
                          let age = '';

                          if (user?.dateOfBirth) {
                            const dob = new Date(user.dateOfBirth);
                            const today = new Date();
                            let calculatedAge = today.getFullYear() - dob.getFullYear();
                            const monthDiff = today.getMonth() - dob.getMonth();

                            if (
                              monthDiff < 0 ||
                              (monthDiff === 0 && today.getDate() < dob.getDate())
                            ) {
                              calculatedAge--;
                            }

                            age = ` (${calculatedAge})`;
                          }

                          return fullName + age;
                        })()}
                      </td>
                      <td className="p-4">{title.title}</td>
                      <td className="p-4">{title.weightClass}</td>
                      <td className="p-4 align-middle">
                        <ActionButtons
                          viewUrl={`/admin/official-title-holders/view/${title._id}`}
                          editUrl={`/admin/official-title-holders/edit/${title._id}`}
                          onDelete={() => {
                            setIsDelete(true);
                            setSelectedTitle(title._id);
                          }}
                        />
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr className="text-center bg-[#0A1330]">
                  <td colSpan={4} className="p-4">
                    No Official Titles found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Delete Confirmation Modal */}
        <ConfirmationModal
          isOpen={isDelete}
          onClose={() => setIsDelete(false)}
          onConfirm={() => handleDeleteTitle(selectedTitle)}
          title="Delete Title"
          message="Are you sure you want to delete this title?"
        />
      </div>

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </>
  );
}
