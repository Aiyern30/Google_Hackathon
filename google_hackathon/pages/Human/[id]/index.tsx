import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Header from "@/components/ui/HR Components/Header";

const ProfilePage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [data, setData] = useState<any>(null);
  console.log(data);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (id) {
        try {
          console.log(`Fetching data for ID: ${id}`);
          const response = await fetch(`/api/employees?id=${id}`);
          const result = await response.json();
          console.log(`Fetched data:`, result);

          if (response.ok) {
            console.log("Data type:", typeof result); // Check type
            console.log("Is array:", Array.isArray(result)); // Check if array
            console.log("First item:", result[0]); // Check first item

            setData(Array.isArray(result) && result.length ? result[0] : null);
          } else {
            setError(result.error || "An error occurred");
          }
        } catch (error) {
          console.error("Fetch error:", error);
          setError("Failed to fetch data");
        } finally {
          setLoading(false);
        }
      }
    };

    fetchData();
  }, [id]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      <Header Title={`${data?.name || "Employee"}'s Profile Page`} />
      {data ? (
        <div>
          <p>ID: {data[0]}</p>
          <p>Name: {data[1]}</p>
          <p>Position: {data[2]}</p>
          <p>Department: {data[3]}</p>
          <p>Email: {data[4]}</p>
          <p>Phone Number: {data[5]}</p>
          <p>Hire Date: {new Date(data[6]).toLocaleDateString()}</p>
          <p>Status: {data[7]}</p>
        </div>
      ) : (
        <p>No data available</p>
      )}
    </div>
  );
};

export default ProfilePage;
