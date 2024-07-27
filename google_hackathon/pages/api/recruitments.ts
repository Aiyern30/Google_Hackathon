import type { NextApiRequest, NextApiResponse } from 'next';

type Recruitment = {
  timestamp: string;
  email: string;
  name: string;
  position: string;
  department: string;
  contactEmail: string;
  phoneNumber: string;
  previousExperience: string;
  skills: string;
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const response = await fetch("https://script.google.com/macros/s/AKfycbxh50PciAnzA6gFpurLwsc8QgGuOAqO5ym_WHo2DZApd4_VDK3CGApKtML_T6a1Gvqmdg/exec");
    const data: Recruitment[] = await response.json();

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch data' });
  }
};

export default handler;
