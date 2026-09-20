import React, { useState } from "react";
import {
  User,
  Phone,
  Mail,
  Edit2,
  MapPin,
  Calendar,
  CreditCard,
  X,
  Check,
  LogOut,
  Plane,
  Building2,
  Ban,
  Clock,
  CircleCheck,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/router";
import { clearUser, setUser } from "@/store";
import { editprofile, cancelBooking, getuserbyemail } from "@/api";
import LiveFlightStatus from "@/components/LiveFlightStatus";

const CANCELLATION_REASONS = [
  "Change of plans",
  "Found a better price elsewhere",
  "Booked by mistake",
  "Medical emergency",
  "Weather concerns",
  "Other",
];

const index = () => {
  const dispatch = useDispatch();
  const user = useSelector((state: any) => state.user.user);
  const router = useRouter();

  const [cancelTarget, setCancelTarget] = useState<any>(null);
  const [cancelReason, setCancelReason] = useState(CANCELLATION_REASONS[0]);
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelError, setCancelError] = useState("");

  const openCancelModal = (booking: any) => {
    setCancelError("");
    setCancelReason(CANCELLATION_REASONS[0]);
    setCancelTarget(booking);
  };

  const confirmCancel = async () => {
    if (!cancelTarget) return;
    setIsCancelling(true);
    setCancelError("");
    try {
      await cancelBooking(user?.id, cancelTarget.id, cancelReason);
      const refreshedUser = await getuserbyemail(user?.email);
      dispatch(setUser(refreshedUser));
      setCancelTarget(null);
    } catch (error) {
      setCancelError("Couldn't cancel this booking. Please try again.");
    } finally {
      setIsCancelling(false);
    }
  };

  const logout = () => {
    dispatch(clearUser());
    router.push("/");
  };
  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState({
    firstName: user?.firstName ? user?.firstName : "",
    lastName: user?.lastName ? user?.lastName : "",
    email: user?.email ? user?.email : "",
    phoneNumber: user?.phoneNumber ? user?.phoneNumber : "",
    bookings: [
      {
        type: "Flight",
        bookingId: "F123456",
        date: "2024-03-25",
        quantity: 2,
        totalPrice: 12499,
        details: {
          from: "Delhi",
          to: "Mumbai",
          airline: "IndiGo",
        },
      },
      {
        type: "Hotel",
        bookingId: "H789012",
        date: "2024-04-15",
        quantity: 1,
        totalPrice: 8999,
        details: {
          name: "Taj Palace",
          location: "Goa",
          nights: 3,
        },
      },
    ],
  });

  const [editForm, setEditForm] = useState({ ...userData });
  const handleSave = async () => {
    try {
      const data = await editprofile(
        user?.id,
        userData.firstName,
        userData.lastName,
        userData.email,
        userData.phoneNumber
      );
      dispatch(setUser(data));
      setIsEditing(false);
    } catch (error) {
      setUserData(editForm);
      setIsEditing(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };
  const handleEditFormChange = (field:any, value:any) => {
    setUserData((prevState) => ({
        ...prevState,
        [field]: value, // Update the specific field dynamically
      }));
  };
  return (
    <div className="min-h-screen bg-gray-50 pt-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Profile Section */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold">Profile</h2>
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="text-red-600 flex items-center space-x-1 hover:text-red-700"
                  >
                    <Edit2 className="w-4 h-4" />
                    <span>Edit</span>
                  </button>
                )}
              </div>

              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First Name
                    </label>
                    <input
                      type="text"
                      value={userData.firstName}
                      onChange={(e) => handleEditFormChange("firstName", e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={userData.lastName}
                      onChange={(e) => handleEditFormChange("lastName", e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={userData.email}
                      onChange={(e) => handleEditFormChange("email", e.target.value)}
                      
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={userData.phoneNumber}
                      onChange={(e) => handleEditFormChange("phoneNumber", e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    />
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={handleSave}
                      className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center space-x-2"
                    >
                      <Check className="w-4 h-4" />
                      <span>Save</span>
                    </button>
                    <button
                      onClick={() => {
                        setIsEditing(false);
                        setEditForm({ ...user });
                      }}
                      className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2"
                    >
                      <X className="w-4 h-4" />
                      <span>Cancel</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center space-x-3">
                    <User className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="font-medium">
                        {user?.firstName} {user?.lastName}
                      </p>
                      {/* <p className="text-sm text-gray-500">{userData.role}</p> */}
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Mail className="w-5 h-5 text-gray-500" />
                    <p>{user?.email}</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Phone className="w-5 h-5 text-gray-500" />
                    <p>{user?.phoneNumber}</p>
                  </div>
                  <button
                    className="w-full mt-4 flex items-center justify-center space-x-2 text-red-600 hover:text-red-700"
                    onClick={logout}
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Bookings Section */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold mb-6">My Bookings</h2>
              <div className="space-y-6">
                {user?.bookings.map((booking: any, index: any) => (
                  <div
                    key={index}
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        {booking?.type === "Flight" ? (
                          <div className="bg-blue-100 p-2 rounded-lg">
                            <Plane className="w-6 h-6 text-blue-600" />
                          </div>
                        ) : (
                          <div className="bg-green-100 p-2 rounded-lg">
                            <Building2 className="w-6 h-6 text-green-600" />
                          </div>
                        )}
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="font-semibold">{booking?.type}</h3>
                            {booking?.status === "Cancelled" ? (
                              <span className="text-xs font-medium bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                                Cancelled
                              </span>
                            ) : (
                              <span className="text-xs font-medium bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                                Confirmed
                              </span>
                            )}
                            {booking?.type === "Flight" &&
                              booking?.status !== "Cancelled" && (
                                <LiveFlightStatus
                                  flightId={booking?.bookingId}
                                  compact
                                />
                              )}
                          </div>
                          <p className="text-sm text-gray-500">
                            Booking ID: {booking?.bookingId}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">
                          ₹ {booking?.totalPrice.toLocaleString("en-IN")}
                        </p>
                        <p className="text-sm text-gray-500">{booking?.type}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(booking?.date)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-4 h-4" />
                        <span>{booking?.type}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <CreditCard className="w-4 h-4" />
                        <span>Paid</span>
                      </div>
                    </div>

                    {booking?.status === "Cancelled" ? (
                      <div className="mt-4 pt-4 border-t">
                        <p className="text-sm text-gray-600 mb-2">
                          Reason: {booking?.cancellationReason}
                        </p>
                        <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                          <div>
                            <p className="text-sm font-medium">
                              Refund: ₹{" "}
                              {booking?.refundAmount?.toLocaleString("en-IN")}{" "}
                              <span className="text-gray-500">
                                ({booking?.refundPercentage}%)
                              </span>
                            </p>
                            <div className="flex items-center space-x-3 mt-2 text-xs">
                              {["Pending", "Processing", "Completed"].map(
                                (step, i) => {
                                  const steps = [
                                    "Pending",
                                    "Processing",
                                    "Completed",
                                  ];
                                  const currentIndex = steps.indexOf(
                                    booking?.refundStatus
                                  );
                                  const reached = i <= currentIndex;
                                  return (
                                    <div
                                      key={step}
                                      className={`flex items-center space-x-1 ${
                                        reached
                                          ? "text-red-600 font-medium"
                                          : "text-gray-400"
                                      }`}
                                    >
                                      {reached ? (
                                        <CircleCheck className="w-3.5 h-3.5" />
                                      ) : (
                                        <Clock className="w-3.5 h-3.5" />
                                      )}
                                      <span>{step}</span>
                                      {i < 2 && (
                                        <span className="mx-1 text-gray-300">
                                          —
                                        </span>
                                      )}
                                    </div>
                                  );
                                }
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-4 pt-4 border-t flex justify-end">
                        <button
                          onClick={() => openCancelModal(booking)}
                          className="flex items-center space-x-1 text-sm text-red-600 hover:text-red-700 font-medium"
                        >
                          <Ban className="w-4 h-4" />
                          <span>Cancel booking</span>
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {cancelTarget && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center px-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-xl font-bold">Cancel booking</h3>
              <button
                onClick={() => setCancelTarget(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              {cancelTarget.type} · Booking ID: {cancelTarget.bookingId}
            </p>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Why are you cancelling?
            </label>
            <select
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg mb-4 focus:ring-2 focus:ring-red-500 focus:border-red-500"
            >
              {CANCELLATION_REASONS.map((reason) => (
                <option key={reason} value={reason}>
                  {reason}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mb-4">
              Refunds are based on how soon you cancel after booking: 50%
              within 24 hours, 25% within 72 hours, and non-refundable after
              that.
            </p>
            {cancelError && (
              <p className="text-sm text-red-600 mb-3">{cancelError}</p>
            )}
            <div className="flex space-x-3">
              <button
                onClick={confirmCancel}
                disabled={isCancelling}
                className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-60"
              >
                {isCancelling ? "Cancelling..." : "Confirm cancellation"}
              </button>
              <button
                onClick={() => setCancelTarget(null)}
                disabled={isCancelling}
                className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Keep booking
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default index;
