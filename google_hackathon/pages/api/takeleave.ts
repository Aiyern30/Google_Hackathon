import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const response = await fetch(
      "https://script.google.com/macros/s/AKfycbxpRimFmb3aL9BEx08GBI2pXKy-jPm2Ca5Oxx-aagtcUiFoKrYEu8p1OrH_ZAgnzi7w/exec"
    );

    const text = await response.text(); // Get the raw response text
    console.log("Raw response text:", text); // Log the raw response text

    if (!response.ok) {
      throw new Error(
        `Network response was not ok. Status: ${response.status}`
      );
    }

    const data = JSON.parse(text); // Parse the raw text as JSON
    console.log("API data:", data); // Log the parsed data
    res.status(200).json(data);
  } catch (error) {
    if (error instanceof SyntaxError) {
      console.error("Syntax Error:", error.message);
      res.status(500).json({ error: "Invalid JSON response" });
    } else if (error instanceof Error) {
      console.error("API Error:", error.message);
      res.status(500).json({ error: "Internal Server Error" });
    } else {
      console.error("Unexpected Error:", error);
      res.status(500).json({ error: "Unexpected Internal Server Error" });
    }
  }
}
