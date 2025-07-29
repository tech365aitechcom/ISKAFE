"use client";

import { use, useEffect, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../../../../../../../constants";
import { enqueueSnackbar } from "notistack";
import Loader from "../../../../../../_components/Loader";
import Link from "next/link";
import {
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Ruler,
  Scale,
  CheckCircle,
  XCircle,
} from "lucide-react";
import moment from "moment";

export default function ViewRegistration({ params }) {
  const unwrappedParams = use(params);
  const [registration, setRegistration] = useState(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRegistration = async () => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/registrations/${unwrappedParams.id}`
        );
        setRegistration(response.data.data);
      } catch (error) {
        enqueueSnackbar("Failed to load registration", { variant: "error" });
        console.error("Error fetching registration:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRegistration();
  }, [unwrappedParams.id]);

  if (loading) return <Loader />;

  if (!registration) {
    return (
      <div className="text-white p-8 text-center">
        <p>Registration not found</p>
        <Link
          href="admin/reports/event-registrations"
          className="text-blue-400 hover:underline mt-4 inline-block"
        >
          Back to registrations
        </Link>
      </div>
    );
  }

  return (
    <div className="text-white p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header with back button */}
        <div className="flex items-center justify-between mb-8">
          <Link
            href="/admin/reports/event-registrations"
            className="flex items-center text-blue-400 hover:text-blue-300"
          >
            <ArrowLeft size={20} className="mr-2" />
            Back to Registrations
          </Link>

          <div
            className={`px-4 py-2 rounded-full text-sm font-medium ${
              registration.status === "Verified"
                ? "bg-green-100 text-green-800"
                : registration.status === "Rejected"
                ? "bg-red-100 text-red-800"
                : "bg-yellow-100 text-yellow-800"
            }`}
          >
            {registration.status}
          </div>
        </div>

        {/* Main card */}
        <div className="bg-[#0B1739] bg-opacity-80 rounded-lg shadow-lg overflow-hidden">
          {/* Profile header */}
          <div className="bg-[#1A2456] p-6 flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-white">
              <img
                src={registration.profilePhoto || "/default-profile.png"}
                alt={`${registration.firstName} ${registration.lastName}`}
                className="w-full h-full object-cover"
              />
            </div>

            <div>
              <h1 className="text-2xl font-bold">
                {registration.firstName} {registration.lastName}
              </h1>
              <p className="text-gray-300 capitalize">
                {registration.registrationType}
              </p>

              <div className="flex flex-wrap gap-4 mt-3">
                <div className="flex items-center text-gray-300">
                  <Mail size={16} className="mr-2" />
                  <a
                    href={`mailto:${registration.email}`}
                    className="hover:text-white"
                  >
                    {registration.email}
                  </a>
                </div>

                <div className="flex items-center text-gray-300">
                  <Phone size={16} className="mr-2" />
                  <a
                    href={`tel:${registration.phoneNumber}`}
                    className="hover:text-white"
                  >
                    {registration.phoneNumber}
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Main content */}
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Personal Information */}
            <div>
              <h2 className="text-xl font-semibold mb-4 border-b border-gray-700 pb-2">
                Personal Information
              </h2>

              <div className="space-y-4">
                <div>
                  <h3 className="text-gray-400 text-sm">Full Name</h3>
                  <p>
                    {registration.firstName} {registration.lastName}
                  </p>
                </div>

                <div>
                  <h3 className="text-gray-400 text-sm">Gender</h3>
                  <p className="capitalize">{registration.gender}</p>
                </div>

                <div>
                  <h3 className="text-gray-400 text-sm">Date of Birth</h3>
                  <p>
                    {moment(registration.dateOfBirth).format("MMMM D, YYYY")}
                  </p>
                </div>

                <div>
                  <h3 className="text-gray-400 text-sm">Age</h3>
                  <p>
                    {moment().diff(registration.dateOfBirth, "years")} years
                  </p>
                </div>
              </div>
            </div>

            {/* Physical Attributes */}
            <div>
              <h2 className="text-xl font-semibold mb-4 border-b border-gray-700 pb-2">
                Physical Attributes
              </h2>

              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div>
                    <h3 className="text-gray-400 text-sm">Height</h3>
                    <p>
                      {registration.height} {registration.heightUnit}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-gray-400 text-sm">Weight</h3>
                    <p>
                      {registration.walkAroundWeight} {registration.weightUnit}
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-gray-400 text-sm">Weight Class</h3>
                  <p>{registration.weightClass || "N/A"}</p>
                </div>

                <div>
                  <h3 className="text-gray-400 text-sm">Skill Level</h3>
                  <p>{registration.skillLevel || "N/A"}</p>
                </div>

                <div>
                  <h3 className="text-gray-400 text-sm">Rule Style</h3>
                  <p>{registration.ruleStyle || "N/A"}</p>
                </div>
              </div>
            </div>

            {/* Address Information */}
            <div>
              <h2 className="text-xl font-semibold mb-4 border-b border-gray-700 pb-2">
                Address
              </h2>

              <div className="space-y-4">
                <div>
                  <h3 className="text-gray-400 text-sm">Street 1</h3>
                  <p>{registration.street1 || "N/A"}</p>
                </div>

                {registration.street2 && (
                  <div>
                    <h3 className="text-gray-400 text-sm">Street 2</h3>
                    <p>{registration.street2}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-gray-400 text-sm">City</h3>
                    <p>{registration.city || "N/A"}</p>
                  </div>

                  <div>
                    <h3 className="text-gray-400 text-sm">State</h3>
                    <p>{registration.state || "N/A"}</p>
                  </div>

                  <div>
                    <h3 className="text-gray-400 text-sm">Postal Code</h3>
                    <p>{registration.postalCode || "N/A"}</p>
                  </div>

                  <div>
                    <h3 className="text-gray-400 text-sm">Country</h3>
                    <p>{registration.country || "N/A"}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Fighter/Trainer Information */}
            <div>
              <h2 className="text-xl font-semibold mb-4 border-b border-gray-700 pb-2">
                {registration.registrationType === "fighter"
                  ? "Fighter"
                  : "Trainer"}{" "}
                Details
              </h2>

              <div className="space-y-4">
                {registration.registrationType === "fighter" && (
                  <>
                    <div>
                      <h3 className="text-gray-400 text-sm">
                        Professional Fighter
                      </h3>
                      <p>{registration.proFighter ? "Yes" : "No"}</p>
                    </div>

                    <div>
                      <h3 className="text-gray-400 text-sm">Paid to Fight</h3>
                      <p>{registration.paidToFight ? "Yes" : "No"}</p>
                    </div>

                    <div>
                      <h3 className="text-gray-400 text-sm">System Record</h3>
                      <p>{registration.systemRecord || "N/A"}</p>
                    </div>

                    <div>
                      <h3 className="text-gray-400 text-sm">
                        Additional Records
                      </h3>
                      <p>{registration.additionalRecords || "N/A"}</p>
                    </div>
                  </>
                )}

                <div>
                  <h3 className="text-gray-400 text-sm">Trainer Name</h3>
                  <p>{registration.trainerName || "N/A"}</p>
                </div>

                <div>
                  <h3 className="text-gray-400 text-sm">Gym Name</h3>
                  <p>{registration.gymName || "N/A"}</p>
                </div>

                <div>
                  <h3 className="text-gray-400 text-sm">Trainer Contact</h3>
                  <div className="flex items-center gap-2">
                    <Phone size={16} />
                    <span>{registration.trainerPhone || "N/A"}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <Mail size={16} />
                    <span>{registration.trainerEmail || "N/A"}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment and Legal */}
            <div>
              <h2 className="text-xl font-semibold mb-4 border-b border-gray-700 pb-2">
                Payment & Legal
              </h2>

              <div className="space-y-4">
                <div>
                  <h3 className="text-gray-400 text-sm">Payment Method</h3>
                  <p className="capitalize">
                    {registration.paymentMethod || "N/A"}
                  </p>
                </div>

                {registration.paymentMethod === "cash" &&
                  registration.cashCode && (
                    <div>
                      <h3 className="text-gray-400 text-sm">Cash Code</h3>
                      <p>{registration.cashCode}</p>
                    </div>
                  )}

                <div>
                  <h3 className="text-gray-400 text-sm">Adult Registration</h3>
                  <p>{registration.isAdult ? "Yes" : "No"}</p>
                </div>

                <div>
                  <h3 className="text-gray-400 text-sm">
                    Legal Disclaimer Accepted
                  </h3>
                  <p>{registration.legalDisclaimerAccepted ? "Yes" : "No"}</p>
                </div>

                {registration.waiverSignature && (
                  <div>
                    <h3 className="text-gray-400 text-sm">Waiver Signature</h3>
                    <p>{registration.waiverSignature}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Admin Information */}
            <div>
              <h2 className="text-xl font-semibold mb-4 border-b border-gray-700 pb-2">
                Admin Information
              </h2>

              <div className="space-y-4">
                <div>
                  <h3 className="text-gray-400 text-sm">Created By</h3>
                  <p>
                    {registration.createdBy?.firstName}{" "}
                    {registration.createdBy?.lastName}
                  </p>
                  <p className="text-gray-400 text-sm">
                    {registration.createdBy?.email}
                  </p>
                </div>

                <div>
                  <h3 className="text-gray-400 text-sm">Registration Date</h3>
                  <p>
                    {moment(registration.createdAt).format(
                      "MMMM D, YYYY h:mm A"
                    )}
                  </p>
                </div>

                <div>
                  <h3 className="text-gray-400 text-sm">Last Updated</h3>
                  <p>
                    {moment(registration.updatedAt).format(
                      "MMMM D, YYYY h:mm A"
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
