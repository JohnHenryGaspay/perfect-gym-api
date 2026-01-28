// Webflow Form Handler with Redirect
// Add this code to your Webflow page's custom code (before </body> tag)

document.addEventListener('DOMContentLoaded', function() {
  // Get your form - update the selector to match your form
  const form = document.querySelector('form[data-name="Lead Form"]'); // Change to match your form name
  
  if (!form) {
    console.error('Form not found. Update the selector to match your form.');
    return;
  }

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
});
