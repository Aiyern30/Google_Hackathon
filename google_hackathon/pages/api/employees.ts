import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { id } = req.query;
    const response = await fetch(
      "https://script.google.com/macros/s/AKfycbw1Jmo5qg3rOCXRYWG4rjhV2wNqKhKnhjSJZ8gUEWhlzvaWN37lNO9qbKEmGF1DS-t8_Q/exec"
    );

    if (!response.ok) {
      throw new Error(`Network response was not ok. Status: ${response.status}`);
    }

    const text = await response.text();
    console.log("Raw response:", text);

    // Parse the response as JSON
    let data;
    try {
      data = JSON.parse(text);
    } catch (jsonError) {
      console.error("Error parsing JSON:", jsonError);
      return res.status(500).json({ error: "Failed to parse JSON" });
    }

    console.log("Parsed data:", data);

    if (id) {
      // Filter data by the provided ID
      const employee = data.find((item: any) => item[0].toString() === id.toString());
      console.log("Filtered employee:", employee);
      if (employee) {
        res.status(200).json(employee);
      } else {
        res.status(404).json({ error: "Employee not found" });
      }
    } else {
      res.status(200).json(data);
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
