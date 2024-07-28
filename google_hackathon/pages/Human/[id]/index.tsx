import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Header from "@/components/ui/HR Components/Header";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { DatePickerDemo } from "@/components/ui/DatePickerDemo";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ProfilePage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null); // State for email validation error
  const [formData, setFormData] = useState<any>({
    id: "",
    name: "",
    position: "",
    department: "",
    email: "",
    phone: "",
    hireDate: "",
    status: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      if (id) {
        try {
          const response = await fetch(`/api/employees?id=${id}`);
          const result = await response.json();

          if (response.ok) {
            const mappedData = {
              id: result[0],
              name: result[1],
              position: result[2],
              department: result[3],
              email: result[4],
              phone: result[5],
              hireDate: new Date(result[6]),
              status: result[7],
            };

            setData(mappedData);
            setFormData(mappedData);
          } else {
            setError(result.error || "An error occurred");
          }
        } catch (error) {
          setError("Failed to fetch data");
        } finally {
          setLoading(false);
        }
      }
    };

    fetchData();
  }, [id]);

  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleDateChange = (date: Date) => {
    setFormData({
      ...formData,
      hireDate: date,
    });
  };

  const validateEmail = (email: string) => {
    return email.endsWith("@gmail.com");
  };

  const handleSave = async () => {
    if (!validateEmail(formData.email)) {
      setEmailError("Email must end with @gmail.com"); // Set email error message
      return;
    }

    // Clear email error message if validation passes
    setEmailError(null);

    try {
      const response = await fetch("/api/updateEmployee", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          hireDate: formatDate(formData.hireDate),
        }),
      });

      if (response.ok) {
        setData(formData);
        toast.success("Profile updated successfully!");
      } else {
        const result = await response.json();
        setError(result.error || "Failed to save data");
        toast.error(result.error || "Failed to save data");
      }
    } catch (error) {
      setError("Failed to save data");
      toast.error("Failed to save data");
    }
  };

  return (
    <div>
      <Header Title={`${data?.name || "Employee"}'s Profile Page`} />
      <ToastContainer />
      {loading ? (
        <div className="fixed inset-0 flex items-center justify-center bg-white">
          <div className="relative flex justify-center items-center">
            <div className="absolute animate-spin rounded-full h-32 w-32 border-t-4 border-b-4 border-purple-500"></div>
            <img
              src="https://www.svgrepo.com/show/509001/avatar-thinking-9.svg"
              className="rounded-full h-28 w-28"
            />
          </div>
        </div>
      ) : data ? (
        <Card className="max-w-[500px] w-full mx-auto my-5">
          <CardHeader>
            <CardTitle className="text-center">{data.name}</CardTitle>
            <CardDescription className="text-center">
              {data.position}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex">
            <div className="w-full">
              <div className="flex space-x-5">
                <div className="w-1/2">
                  <Label htmlFor="id">ID</Label>
                  <Input
                    name="id"
                    value={formData.id}
                    onChange={handleInputChange}
                    readOnly
                    disabled
                  />
                  <Label htmlFor="name">Name</Label>
                  <Input
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                  />
                  <Label htmlFor="position">Position</Label>
                  <Select
                    value={formData.position}
                    onValueChange={(value) =>
                      handleSelectChange("position", value)
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue>{formData.position}</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Manager">Manager</SelectItem>
                      <SelectItem value="Developer">Developer</SelectItem>
                      <SelectItem value="Designer">Designer</SelectItem>
                      <SelectItem value="Tester">Tester</SelectItem>
                      <SelectItem value="HR">HR</SelectItem>
                    </SelectContent>
                  </Select>
                  <Label htmlFor="department">Department</Label>
                  <Select
                    value={formData.department}
                    onValueChange={(value) =>
                      handleSelectChange("department", value)
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue>{formData.department}</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Engineering">Engineering</SelectItem>
                      <SelectItem value="Design">Design</SelectItem>
                      <SelectItem value="QA">QA</SelectItem>
                      <SelectItem value="HR">HR</SelectItem>
                      <SelectItem value="Marketing">Marketing</SelectItem>
                    </SelectContent>
                  </Select>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                  />
                  {emailError && (
                    <p className="text-red-500 text-sm mt-1">{emailError}</p>
                  )}{" "}
                  {/* Show email error message */}
                </div>
                <div className="w-1/2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                  />
                  <Label htmlFor="hireDate">Hire Date</Label>
                  <DatePickerDemo
                    onDateChange={handleDateChange}
                    selectedDate={formData.hireDate}
                  />
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) =>
                      handleSelectChange("status", value)
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue>{formData.status}</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="On Leave">On Leave</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <div className="flex justify-end space-x-2 w-full">
              <Button variant={"destructive"} onClick={handleSave}>
                Save
              </Button>
            </div>
          </CardFooter>
        </Card>
      ) : (
        <p>No data available</p>
      )}
    </div>
  );
};

export default ProfilePage;
