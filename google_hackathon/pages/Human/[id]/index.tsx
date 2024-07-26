import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Header from "@/components/ui/HR Components/Header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";

const ProfilePage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    const fetchData = async () => {
      if (id) {
        try {
          const response = await fetch(`/api/employees?id=${id}`);
          const result = await response.json();

          if (response.ok) {
            setData(result);
            setFormData(result);
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

  const handleSave = async () => {
    try {
      const response = await fetch(`/api/employees?id=${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setData(formData);
        setIsEditing(false);
      } else {
        const result = await response.json();
        setError(result.error || "Failed to save data");
      }
    } catch (error) {
      setError("Failed to save data");
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      <Header Title={`${data?.[1] || "Employee"}'s Profile Page`} />
      {data ? (
        <Card className="max-w-[500px] w-full mx-auto my-5">
          <CardHeader>
            <CardTitle className="text-center">{formData[1]}</CardTitle>
            <CardDescription className="text-center">{formData[2]}</CardDescription>
          </CardHeader>
          <CardContent className="flex">
            <div className="w-full">
              {isEditing ? (
                <>
                  <div className="flex space-x-5">
                    <div className="w-1/2">
                      <Label htmlFor="id">ID</Label>
                      <Input name="id" value={formData[0]} onChange={handleInputChange} readOnly disabled />
                      <Label htmlFor="name">Name</Label>
                      <Input name="name" value={formData[1]} onChange={handleInputChange} />
                      <Label htmlFor="position">Position</Label>
                      <Select value={formData[2]} onValueChange={(value) => handleSelectChange("position", value)}>
                        <SelectTrigger className="w-full">
                          <SelectValue>{formData[2]}</SelectValue>
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
                      <Select value={formData[3]} onValueChange={(value) => handleSelectChange("department", value)}>
                        <SelectTrigger className="w-full">
                          <SelectValue>{formData[3]}</SelectValue>
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
                      <Input name="email" value={formData[4]} onChange={handleInputChange} />
                    </div>
                    <div className="w-1/2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input name="phone" value={formData[5]} onChange={handleInputChange} />
                      <Label htmlFor="hireDate">Hire Date</Label>
                      <Input name="hireDate" value={new Date(formData[6]).toLocaleDateString()} onChange={handleInputChange} />
                      <Label htmlFor="status">Status</Label>
                      <Select value={formData[7]} onValueChange={(value) => handleSelectChange("status", value)}>
                        <SelectTrigger className="w-full">
                          <SelectValue>{formData[7]}</SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Active">Active</SelectItem>
                          <SelectItem value="On Leave">On Leave</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <p><strong>ID:</strong> {data[0]}</p>
                  <p><strong>Department:</strong> {data[3]}</p>
                  <p><strong>Email:</strong> {data[4]}</p>
                  <p><strong>Phone Number:</strong> {data[5]}</p>
                  <p><strong>Hire Date:</strong> {new Date(data[6]).toLocaleDateString()}</p>
                  <p><strong>Status:</strong> {data[7]}</p>
                </>
              )}
            </div>
          </CardContent>
          <CardFooter>
            {isEditing ? (
              <div className="flex justify-end space-x-2 w-full">
                <Button variant={"destructive"} onClick={handleSave}>Save</Button>
                <Button onClick={() => setIsEditing(false)}>Cancel</Button>
              </div>
            ) : (
              <Button onClick={() => setIsEditing(true)}>Edit</Button>
            )}
          </CardFooter>
        </Card>
      ) : (
        <p>No data available</p>
      )}
    </div>
  );
};

export default ProfilePage;
