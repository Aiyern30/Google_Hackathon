import type { NextApiRequest, NextApiResponse } from 'next';

const handleRequestMeeting = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'PUT') {
    return res.status(405).json({ message: 'Only PUT requests are allowed' });
  }

  const {
    timestamp,
    emailAddress,
    fullName,
    positionAppliedFor,
    departmentAppliedFor,
    phoneNumber,
    previousWorkExperience,
    skills,
    cvLink,
    status,
  } = req.body;

  try {
    const response = await fetch('https://script.google.com/macros/s/AKfycbz7xpqbt44W7Bx5KSwiFrFW32WqLT7G7foQZWNDwo17Zv3pntgJTsVFGUqFSWQpqqXsCA/exec', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        timestamp,
        emailAddress,
        fullName,
        positionAppliedFor,
        departmentAppliedFor,
        phoneNumber,
        previousWorkExperience,
        skills,
        cvLink,
        status,
        action: 'update',
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to update employee data');
    }

    const data = await response.json();
    console.log("1233")
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ message: (error as Error).message });
  }
};

export default handleRequestMeeting;
