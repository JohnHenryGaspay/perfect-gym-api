const axios = require('axios');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  // Vercel serverless functions do NOT auto-parse JSON
  if (typeof req.body === 'string') {
    try {
      req.body = JSON.parse(req.body);
    } catch (err) {
      return res.status(400).json({ success: false, error: 'Invalid JSON', details: err.message });
    }
  }

  try {
    const { Name, Email, Phone } = req.body;
    const CLUB_ID = parseInt(process.env.CLUB_ID) || 3;
    const SOURCE = process.env.SOURCE || 'Webflow';

    if (!Name || !Email) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: Name and Email are required',
        received: { Name, Email, Phone }
      });
    }

    const nameParts = Name.trim().split(' ');
    const FirstName = nameParts[0];
    const LastName = nameParts.slice(1).join(' ') || FirstName;

    const leadData = {
      firstName: FirstName,
      lastName: LastName,
      email: Email,
      clubId: CLUB_ID,
      source: SOURCE
    };
    if (Phone) {
      leadData.phone = Phone;
    }

    const response = await axios.post(
      process.env.PERFECT_GYM_BASE_URL
        ? `${process.env.PERFECT_GYM_BASE_URL}/Api/v2.2/Crm2/AddLead`
        : `https://chasingbetter247.perfectgym.com.au/Api/v2.2/Crm2/AddLead`,
      leadData,
      {
        headers: {
          'X-Client-Id': process.env.CLIENT_ID,
          'X-Client-Secret': process.env.CLIENT_SECRET,
          'Content-Type': 'application/json'
        }
      }
    );

    const returnedLeadId = response.data?.Id ?? response.data?.leadId;
    if (!response.data || returnedLeadId == null) {
      return res.status(502).json({
        success: false,
        error: 'Perfect Gym did not return a lead Id',
        details: response.data
      });
    }

    res.status(201).json({
      success: true,
      message: 'Lead created successfully',
      leadId: returnedLeadId,
      leadPayload: leadData,
      leadResponse: response.data,
      redirect: process.env.REDIRECT_URL || 'https://www.chasingbetter247.com.au/thank-you-subscribe'
    });
  } catch (error) {
    res.status(error.response?.status || 500).json({
      success: false,
      error: error.response?.data?.error?.message || 'Failed to create lead',
      details: error.response?.data || error.message
    });
  }
};
