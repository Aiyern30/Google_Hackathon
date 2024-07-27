import type { NextApiRequest, NextApiResponse } from 'next';

const updateEmployee = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'PUT') {
    return res.status(405).json({ message: 'Only PUT requests are allowed' });
  }

  const { id, name, position, department, email, phone, hireDate, status } = req.body;

  try {
    const response = await fetch('https://script.google.com/macros/s/AKfycbyEeISNPkkxRRQytGnraNvFqXnLDacyUQdvg1XQ1qDiQMuHljM4TaDDf57mKUBmRAzlCg/exec', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id,
        name,
        position,
        department,
        email,
        phone,
        hireDate,
        status,
        action: 'update',
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to update employee data');
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ message: (error as Error).message });
  }
};

export default updateEmployee;
