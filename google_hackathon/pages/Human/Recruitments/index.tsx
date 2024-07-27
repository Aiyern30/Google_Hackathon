import React, { useEffect, useState } from 'react';
import Header from "@/components/ui/HR Components/Header";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

const RecruitmentPage = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/recruitments');
        const result = await response.json();

        if (response.ok) {
          setData(result);
        } else {
          setError(result.error || "An error occurred");
        }
      } catch (error) {
        setError("Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      <Header Title="Recruitment Page" />
      {loading ? (
        <div className="fixed inset-0 flex items-center justify-center bg-white">
          <div className="relative flex justify-center items-center">
            <div className="absolute animate-spin rounded-full h-32 w-32 border-t-4 border-b-4 border-purple-500"></div>
            <img src="https://www.svgrepo.com/show/509001/avatar-thinking-9.svg" className="rounded-full h-28 w-28" />
          </div>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center">
          <p className="text-red-500">{error}</p>
        </div>
      ) : (
        <Card className="max-w-[800px] w-full mx-auto my-5">
          <CardHeader>
            <CardTitle className="text-center">Recruitment List</CardTitle>
          </CardHeader>
          <CardContent>
            <table className="min-w-full bg-white">
              <thead>
                <tr>
                  <th className="w-1/3 px-4 py-2">Name</th>
                  <th className="w-1/3 px-4 py-2">Position</th>
                  <th className="w-1/3 px-4 py-2">Department</th>
                </tr>
              </thead>
              <tbody>
                {data.map((recruitment, index) => (
                  <tr key={index}>
                    <td className="border px-4 py-2">{recruitment.name}</td>
                    <td className="border px-4 py-2">{recruitment.position}</td>
                    <td className="border px-4 py-2">{recruitment.department}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button variant="default">Add New Recruitment</Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
};

export default RecruitmentPage;
