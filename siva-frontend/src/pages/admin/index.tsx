"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Textarea } from "@/components/ui/textarea";
import FlightList from "@/components/Flights/Flightlist";
import {
  addflight,
  addhotel,
  editflight,
  edithotel,
  getuserbyemail,
} from "@/api";
import HotelList from "@/components/Hotel/Hotel";
import { getFlaggedReviews, deleteReview, dismissReviewFlag } from "@/api";
import { Star } from "lucide-react";

function FlaggedReviews() {
  const [flagged, setFlagged] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const data = await getFlaggedReviews();
      setFlagged(data || []);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (reviewId: string) => {
    try {
      await deleteReview(reviewId);
      load();
    } catch (error) {
      console.log(error);
    }
  };

  const handleDismiss = async (reviewId: string) => {
    try {
      await dismissReviewFlag(reviewId);
      load();
    } catch (error) {
      console.log(error);
    }
  };

  if (loading) return <p>Loading flagged reviews...</p>;
  if (flagged.length === 0)
    return <p className="text-gray-500">No reviews have been flagged.</p>;

  return (
    <div className="space-y-4">
      {flagged.map((review) => (
        <div key={review.id} className="border rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              <span className="font-semibold">{review.userName}</span>
              <span className="text-xs text-gray-500 ml-2">
                {review.targetType} · {review.targetId}
              </span>
            </div>
            <div className="flex items-center text-yellow-400">
              {[1, 2, 3, 4, 5].map((n) => (
                <Star
                  key={n}
                  className={`w-4 h-4 ${
                    n <= review.rating ? "fill-current" : "text-gray-300"
                  }`}
                />
              ))}
            </div>
          </div>
          <p className="text-sm text-gray-700 mb-2">{review.text}</p>
          <p className="text-xs text-orange-600 mb-3">
            Reported reason: {review.flagReason}
          </p>
          <div className="flex space-x-3">
            <Button variant="destructive" onClick={() => handleDelete(review.id)}>
              Delete review
            </Button>
            <Button variant="outline" onClick={() => handleDismiss(review.id)}>
              Dismiss report
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}

const mockFlights = [
  {
    _id: "1",
    flightName: "AirOne 101",
    from: "New York",
    to: "London",
    departureTime: "2023-07-01T08:00",
    arrivalTime: "2023-07-01T20:00",
    price: 500,
    availableSeats: 150,
  },
  {
    _id: "2",
    flightName: "SkyHigh 202",
    from: "Paris",
    to: "Tokyo",
    departureTime: "2023-07-02T10:00",
    arrivalTime: "2023-07-03T06:00",
    price: 800,
    availableSeats: 200,
  },
  {
    _id: "3",
    flightName: "EagleWings 303",
    from: "Los Angeles",
    to: "Sydney",
    departureTime: "2023-07-03T22:00",
    arrivalTime: "2023-07-05T06:00",
    price: 1200,
    availableSeats: 180,
  },
];

const mockHotels = [
  {
    _id: "1",
    hotelName: "Luxury Palace",
    location: "Paris, France",
    pricePerNight: 300,
    availableRooms: 50,
    amenities: "Wi-Fi, Pool, Spa, Restaurant",
  },
  {
    _id: "2",
    hotelName: "Seaside Resort",
    location: "Bali, Indonesia",
    pricePerNight: 200,
    availableRooms: 100,
    amenities: "Beach Access, Wi-Fi, Restaurant, Water Sports",
  },
  {
    _id: "3",
    hotelName: "Mountain Lodge",
    location: "Aspen, Colorado",
    pricePerNight: 250,
    availableRooms: 30,
    amenities: "Ski-in/Ski-out, Fireplace, Hot Tub, Restaurant",
  },
];
interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  phoneNumber: string;
}

function UserSearch() {
  const [email, setEmail] = useState("");
  const [user, setUser] = useState<User | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = await getuserbyemail(email);
    const mockUser: User = data;
    setUser(mockUser);
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="flex-1">
          <Label htmlFor="email" className="sr-only">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="Search user by email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <Button type="submit">Search</Button>
      </form>
      {user && (
        <div className="border p-4 rounded-md">
          <h3 className="font-bold mb-2">User Details</h3>
          <p>
            <strong>Name:</strong> {user.firstName} {user.lastName}
          </p>
          <p>
            <strong>Email:</strong> {user.email}
          </p>
          <p>
            <strong>Role:</strong> {user.role}
          </p>
          <p>
            <strong>Phone:</strong> {user.phoneNumber}
          </p>
        </div>
      )}
    </div>
  );
}

interface Hotel {
  id?: string;
  hotelName: string;
  location: string;
  pricePerNight: number;
  availableRooms: number;
  amenities: string;
}

function AddEditHotel({ hotel }: { hotel: Hotel | null }) {
  const [formData, setFormData] = useState<Hotel>({
    hotelName: "",
    location: "",
    pricePerNight: 0,
    availableRooms: 0,
    amenities: "",
  });

  useEffect(() => {
    if (hotel) {
      setFormData(hotel);
    } else {
      setFormData({
        hotelName: "",
        location: "",
        pricePerNight: 0,
        availableRooms: 0,
        amenities: "",
      });
    }
  }, [hotel]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (hotel) {
      await edithotel(
        hotel.id,
        formData.hotelName,
        formData.location,
        formData.pricePerNight,
        formData.availableRooms,
        formData.amenities
      );
      return;
    }
    await addhotel(
      formData.hotelName,
      formData.location,
      formData.pricePerNight,
      formData.availableRooms,
      formData.amenities
    );
    if (!hotel) {
      setFormData({
        hotelName: "",
        location: "",
        pricePerNight: 0,
        availableRooms: 0,
        amenities: "",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="text-lg font-semibold mb-2">
        {hotel ? "Edit Hotel" : "Add New Hotel"}
      </h3>
      <div>
        <Label htmlFor="hotelName">Hotel Name</Label>
        <Input
          id="hotelName"
          name="hotelName"
          value={formData.hotelName}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <Label htmlFor="location">Location</Label>
        <Input
          id="location"
          name="location"
          value={formData.location}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <Label htmlFor="pricePerNight">Price Per Night</Label>
        <Input
          id="pricePerNight"
          name="pricePerNight"
          type="number"
          value={formData.pricePerNight}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <Label htmlFor="availableRooms">Available Rooms</Label>
        <Input
          id="availableRooms"
          name="availableRooms"
          type="number"
          value={formData.availableRooms}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <Label htmlFor="amenities">Amenities</Label>
        <Textarea
          id="amenities"
          name="amenities"
          value={formData.amenities}
          onChange={handleChange}
          required
        />
      </div>
      <Button type="submit">{hotel ? "Update Hotel" : "Add Hotel"}</Button>
    </form>
  );
}

interface Flight {
  id?: string;
  flightName: string;
  from: string;
  to: string;
  departureTime: string;
  arrivalTime: string;
  price: number;
  availableSeats: number;
}

function AddEditFlight({ flight }: { flight: Flight | null }) {
  const [formData, setFormData] = useState<Flight>({
    flightName: "",
    from: "",
    to: "",
    departureTime: "",
    arrivalTime: "",
    price: 0,
    availableSeats: 0,
  });

  useEffect(() => {
    if (flight) {
      setFormData(flight);
    } else {
      setFormData({
        flightName: "",
        from: "",
        to: "",
        departureTime: "",
        arrivalTime: "",
        price: 0,
        availableSeats: 0,
      });
    }
  }, [flight]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically send this data to your backend
    console.log("Submitting flight data:", formData);
    if (flight) {
      await editflight(
        flight?.id,
        formData.flightName,
        formData.from,
        formData.to,
        formData.departureTime,
        formData.arrivalTime,
        formData.price,
        formData.availableSeats
      );
      return;
    }
    await addflight(
      formData.flightName,
      formData.from,
      formData.to,
      formData.departureTime,
      formData.arrivalTime,
      formData.price,
      formData.availableSeats
    );
    if (!flight) {
      setFormData({
        flightName: "",
        from: "",
        to: "",
        departureTime: "",
        arrivalTime: "",
        price: 0,
        availableSeats: 0,
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="text-lg font-semibold mb-2">
        {flight ? "Edit Flight" : "Add New Flight"}
      </h3>
      <div>
        <Label htmlFor="flightName">Flight Name</Label>
        <Input
          id="flightName"
          name="flightName"
          value={formData.flightName}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <Label htmlFor="from">From</Label>
        <Input
          id="from"
          name="from"
          value={formData.from}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <Label htmlFor="to">To</Label>
        <Input
          id="to"
          name="to"
          value={formData.to}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <Label htmlFor="departureTime">Departure Time</Label>
        <Input
          id="departureTime"
          name="departureTime"
          type="datetime-local"
          value={formData.departureTime}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <Label htmlFor="arrivalTime">Arrival Time</Label>
        <Input
          id="arrivalTime"
          name="arrivalTime"
          type="datetime-local"
          value={formData.arrivalTime}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <Label htmlFor="price">Price</Label>
        <Input
          id="price"
          name="price"
          type="number"
          value={formData.price}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <Label htmlFor="availableSeats">Available Seats</Label>
        <Input
          id="availableSeats"
          name="availableSeats"
          type="number"
          value={formData.availableSeats}
          onChange={handleChange}
          required
        />
      </div>
      <Button type="submit">{flight ? "Update Flight" : "Add Flight"}</Button>
    </form>
  );
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("flights");
  const [selectedFlight, setSelectedFlight] = useState(null);
  const [selectedHotel, setSelectedHotel] = useState(null);

  return (
    <div className="container mx-auto p-4 bg-white max-w-full">
      <h1 className="text-3xl font-bold mb-6 ">Admin Dashboard</h1>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4  text-black">
          <TabsTrigger value="flights">Flights</TabsTrigger>
          <TabsTrigger value="hotels">Hotels</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
        </TabsList>
        <TabsContent value="flights">
          <Card>
            <CardHeader>
              <CardTitle>Manage Flights</CardTitle>
              <CardDescription>
                Add, edit, or remove flights from the system.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <FlightList onSelect={setSelectedFlight} />
                <AddEditFlight flight={selectedFlight} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="hotels">
          <Card>
            <CardHeader>
              <CardTitle>Manage Hotels</CardTitle>
              <CardDescription>
                Add, edit, or remove hotels from the system.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <HotelList onSelect={setSelectedHotel} />
                <AddEditHotel hotel={selectedHotel} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>Search for users by email.</CardDescription>
            </CardHeader>
            <CardContent>
              <UserSearch />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="reviews">
          <Card>
            <CardHeader>
              <CardTitle>Flagged Reviews</CardTitle>
              <CardDescription>
                Reviews reported by users, awaiting moderation.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FlaggedReviews />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
