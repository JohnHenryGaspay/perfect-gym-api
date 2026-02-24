require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { Issuer } = require('openid-client');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors()); // Allow requests from Webflow
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ 
    status: 'API is running',
    endpoints: ['/lead']
  });
});

// Lead submission endpoint
app.post('/lead', async (req, res) => {
  try {
    // Log incoming request
    console.log('Received request body:', req.body);

    // Extract form data from Webflow
    const { Name, Email, Phone, message } = req.body;

    // Set clubId as number and source as string, but also provide a numeric sourceId for API
    const CLUB_ID = 3;
    const SOURCE = 'Webflow';

    // Validate required fields
    if (!Name || !Email) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: Name and Email are required',
        received: { Name, Email, Phone }
      });
    }

    // Split name into FirstName and LastName
    const nameParts = Name.trim().split(' ');
    const FirstName = nameParts[0];
    const LastName = nameParts.slice(1).join(' ') || FirstName; // Use FirstName if no LastName

    // Validate required fields for API
    if (!FirstName || !LastName || !Email) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: firstName, lastName, or email',
        received: { FirstName, LastName, Email, Phone }
      });
    }

    // Build Perfect Gym lead payload
    const leadData = {
      firstName: FirstName,
      lastName: LastName,
      email: Email,
      clubId: CLUB_ID,
      source: SOURCE // keep string for reference
    };
    // Only add phone if provided
    if (Phone) {
      leadData.phone = Phone;
    }
    // Only add message if provided
    if (message) {
      leadData.message = message;
    }

    console.log('Sending lead to Perfect Gym:', leadData);


    // Step 2: Send to Perfect Gym API using client ID/secret headers
    const response = await axios.post(
      `https://chasingbetter247.perfectgym.com.au/Api/v2.2/Crm2/AddLead`,
      leadData,
      {
        headers: {
          'X-Client-Id': process.env.CLIENT_ID,
          'X-Client-Secret': process.env.CLIENT_SECRET,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('Perfect Gym response status:', response.status);
    console.log('Perfect Gym response data:', response.data);

    // Check if Perfect Gym returned HTML (login page) instead of JSON
    if (typeof response.data === 'string' && response.data.includes('<!DOCTYPE html>')) {
      console.error('❌ Perfect Gym returned HTML (likely auth failure)');
      return res.status(401).json({
        success: false,
        error: 'Authentication failed with Perfect Gym API',
          'Authorization': `Bearer ${bearerToken}`,
      });
    }

    // Accept either Id or leadId from response
    const returnedLeadId = response.data?.Id ?? response.data?.leadId;
    if (!response.data || returnedLeadId == null) {
      return res.status(502).json({
        success: false,
        error: 'Perfect Gym did not return a lead Id',
        details: response.data
      });
    }

    // Return success with redirect URL
    res.status(201).json({
      success: true,
      message: 'Lead created successfully',
      leadId: returnedLeadId,
      leadPayload: leadData,
      leadResponse: response.data,
      redirect: process.env.REDIRECT_URL || 'https://www.chasingbetter247.com.au/thank-you-subscribe'
    });

  } catch (error) {
    console.error('Error creating lead:', error.response?.data || error.message);
    if (error.response) {
      console.error('Perfect Gym error status:', error.response.status);
      console.error('Perfect Gym error headers:', error.response.headers);
    }
    // Return error details
    res.status(error.response?.status || 500).json({
      success: false,
      error: error.response?.data?.error?.message || 'Failed to create lead',
      details: error.response?.data || error.message
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`✅ Ready to receive leads from Webflow`);
  console.log(`✅ Forwarding to: ${process.env.PERFECT_GYM_BASE_URL}`);
});
