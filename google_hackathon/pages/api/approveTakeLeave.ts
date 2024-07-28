import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const { name, email, employeeID, status, startDate, endDate, leaveStatus } =
      req.body;

    try {
      const response = await fetch(
        "https://script.google.com/macros/s/AKfycbzjxXyTn0G0evFoZdssmD10aTioQmCfsjWvppd3RMjRsSGsY00SFZ9I63qM5ejd3S1PYQ/exec",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            email,
            employeeID,
            status,
            startDate,
            endDate,
            leaveStatus,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(
          `Network response was not ok. Status: ${response.status}`
        );
      }

      const data = await response.json();
      console.log("Google Script Response:", data);

      if (data.status === "success") {
        res.status(200).json(data); // Return the full response from Google Script
      } else {
        res.status(400).json({ error: "Failed to update leave status" });
      }
    } catch (error) {
      console.error("Error:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  } else {
    res.status(405).json({ error: "Method Not Allowed" });
  }
}
