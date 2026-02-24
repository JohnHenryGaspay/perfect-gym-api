// Webflow Form Handler with Redirect
// Add this code to your Webflow page's custom code (before </body> tag)

// Wait for everything to load, including Webflow's form initialization
setTimeout(function() {
  console.log('Looking for form...');
  
  // List all forms on the page
  const allForms = document.querySelectorAll('form');
  console.log('Total forms found:', allForms.length);
  allForms.forEach((f, i) => {
    console.log(`Form ${i}:`, {
      dataName: f.getAttribute('data-name'),
      name: f.getAttribute('name'),
      id: f.getAttribute('id'),
      className: f.className
    });
  });
  
  // Get your form - try multiple selectors
  const form = document.querySelector('form[data-name="Contact Us Leads"]') || 
               document.querySelector('form[name="Contact Us Leads"]') ||
               document.querySelector('form');
  
  if (!form) {
    console.error('❌ No form matched. Check the console output above for available forms.');
    return;
  }
  
  console.log('✅ Form found:', form);

  form.addEventListener('submit', async function(e) {
    e.preventDefault(); // Prevent default Webflow form submission
    
    // Get form data
    const formData = new FormData(form);
    const data = {
      Name: formData.get('Name'),
      Email: formData.get('Email'),
      Phone: formData.get('Phone')
    };

    console.log('Submitting form data:', data);

    try {
      // Show loading state (optional - customize as needed)
      const submitButton = form.querySelector('input[type="submit"]');
      const originalButtonText = submitButton.value;
      submitButton.value = 'Submitting...';
      submitButton.disabled = true;

      // Send to your API
      const response = await fetch('https://perfect-gym-api.vercel.app/lead', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      const result = await response.json();
      console.log('API response:', result);

      if (result.success && result.redirect) {
        // Redirect to thank you page
        console.log('Redirecting to:', result.redirect);
        window.location.href = result.redirect;
      } else {
        // Handle error
        alert('There was an error submitting the form. Please try again.');
        submitButton.value = originalButtonText;
        submitButton.disabled = false;
      }

    } catch (error) {
      console.error('Form submission error:', error);
      alert('There was an error submitting the form. Please try again.');
      
      // Restore button
      const submitButton = form.querySelector('input[type="submit"]');
      submitButton.disabled = false;
    }
  });
}, 1000); // Wait 1 second for Webflow to initialize
