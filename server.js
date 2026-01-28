require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');

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
    // Extract form data from Webflow
    const { Name, Email, Phone } = req.body;

    // Validate required fields
    if (!Name || !Email) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: Name and Email are required'
      });
    }

    // Split name into FirstName and LastName
    const nameParts = Name.trim().split(' ');
    const FirstName = nameParts[0];
    const LastName = nameParts.slice(1).join(' ') || FirstName; // Use FirstName if no LastName

    // Build Perfect Gym lead payload
    const leadData = {
      FirstName: FirstName,
      LastName: LastName,
      Email: Email,
      // Phone: Phone,
      ClubId: parseInt(process.env.CLUB_ID) || 3,
      Source: process.env.SOURCE || 'Webflow Form'
    };

    console.log('Sending lead to Perfect Gym:', leadData);

    // Send to Perfect Gym API
    const response = await axios.post(
      `${process.env.PERFECT_GYM_BASE_URL}/Crm2/Api/v2.2/odata/Leads`,
      leadData,
      {
        headers: {
          'X-Client-id': process.env.CLIENT_ID,
          'X-Client-Secret': process.env.CLIENT_SECRET,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('Perfect Gym response:', response.status);

    // Return success
    res.status(201).json({
      success: true,
      message: 'Lead created successfully',
      leadId: response.data?.Id
    });

  } catch (error) {
    console.error('Error creating lead:', error.response?.data || error.message);
    
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
