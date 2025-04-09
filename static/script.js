const imageUpload = document.getElementById('imageUpload');
const logoUpload = document.getElementById('logoUpload');
const uploadedImage = document.getElementById('uploadedImage');
const previewCanvas = document.getElementById('previewCanvas');
const nameInput = document.getElementById('name');
const mobileInput = document.getElementById('mobile');
const mahaRaraInput = document.getElementById('maha_rara_no');
const previewButton = document.getElementById('previewButton');
const confirmButton = document.getElementById('confirmButton');
const selectLogoPosition = document.getElementById('selectLogoPosition');
const selectNameMobilePosition = document.getElementById('selectNameMobilePosition');
const selectMahaRaraPosition = document.getElementById('selectMahaRaraPosition');
const resetPositions = document.getElementById('resetPositions');
const cursorLineHorizontal = document.getElementById('cursor-line-horizontal');
const cursorLineVertical = document.getElementById('cursor-line-vertical');
const confirmSaveButton = document.getElementById('confirmSaveButton');
let selectedPositions = {
  logo: { x: 0, y: 0 },
  name_mobile: { x: 0, y: 0 },
  maha_rara: { x: 0, y: 0 }
};
document.getElementById("fontSizeNameMobile").addEventListener("input", sendImageAndPositionForPreview);
document.getElementById("fontSizeMahaRara").addEventListener("input", sendImageAndPositionForPreview);
document.getElementById("fontFamily").addEventListener("change", sendImageAndPositionForPreview);
let selectedElement = null; // Track which element is being positioned
let logoData = null; // Store logo data globally

// Load image when uploaded
imageUpload.addEventListener('change', (event) => {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      uploadedImage.src = e.target.result;
      uploadedImage.style.display = 'block';
      previewCanvas.style.display = 'none'; // Hide canvas initially
      checkButtonState(); // Check if the button should be enabled
    };
    reader.readAsDataURL(file);
  }
});

// Load logo when uploaded
logoUpload.addEventListener('change', (event) => {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      logoData = e.target.result; // Store logo data globally
      console.log('Logo data:', logoData); // Debugging statement
      checkButtonState(); // Check if the button should be enabled
    };
    reader.readAsDataURL(file);
  }
});

// Get click position on the image (relative to natural size)
uploadedImage.addEventListener('click', (event) => {
  if (!selectedElement) return; // Do nothing if no element is selected

  const rect = uploadedImage.getBoundingClientRect();

  // Calculate scaling factors
  const scaleX = uploadedImage.naturalWidth / rect.width;
  const scaleY = uploadedImage.naturalHeight / rect.height;

  // Calculate the position relative to the image's natural size
  const x = (event.clientX - rect.left) * scaleX;
  const y = (event.clientY - rect.top) * scaleY;

  // Assign position to the selected element
  selectedPositions[selectedElement] = { x, y };
  console.log(`Position for ${selectedElement} selected: (${x}, ${y})`);

  // Reset selected element
  selectedElement = null;
  sendImageAndPositionForPreview()
  document.getElementById('cursor-line-horizontal').style.display = 'none';
  document.getElementById('cursor-line-vertical').style.display = 'none';

  checkButtonState(); // Check if the button should be enabled
});

// Select logo position
selectLogoPosition.addEventListener('click', () => {
  previewCanvas.src = '';
  uploadedImage.style.display = 'flex';
  previewCanvas.style.display = 'none';
  selectedElement = 'logo';
  alert('Click on the image to select the logo position.');
  document.getElementById('cursor-line-horizontal').style.display = 'block';
  document.getElementById('cursor-line-vertical').style.display = 'block';
});

// Select name + mobile position
selectNameMobilePosition.addEventListener('click', () => {
  previewCanvas.src = '';
  uploadedImage.style.display = 'flex';
  previewCanvas.style.display = 'none';
  selectedElement = 'name_mobile';
  alert('Click on the image to select the name + mobile position.');
  document.getElementById('cursor-line-horizontal').style.display = 'block';
  document.getElementById('cursor-line-vertical').style.display = 'block';
});

// Select Maha Rara position
selectMahaRaraPosition.addEventListener('click', () => {
  previewCanvas.src = '';
  uploadedImage.style.display = 'flex';
  previewCanvas.style.display = 'none';
  selectedElement = 'maha_rara';
  alert('Click on the image to select the Maha Rara position.');
  document.getElementById('cursor-line-horizontal').style.display = 'block';
  document.getElementById('cursor-line-vertical').style.display = 'block';
});



// Check if the Confirm and Download button should be enabled
function checkButtonState() {
  const name = nameInput.value;
  const mobile = mobileInput.value;
  const mahaRaraNo = mahaRaraInput.value;

  if (uploadedImage.src && name && mobile && mahaRaraNo &&
      selectedPositions.logo.x && selectedPositions.logo.y &&
      selectedPositions.name_mobile.x && selectedPositions.name_mobile.y &&
      selectedPositions.maha_rara.x && selectedPositions.maha_rara.y) {
    confirmButton.disabled = false;
    confirmSaveButton.disabled = false;

    console.log('Confirm and Download button enabled');
  } else {
    confirmButton.disabled = true;
    confirmSaveButton.disabled = true;
    console.log('Confirm and Download button disabled');
  }
}

// Listen for changes in the inputs
nameInput.addEventListener('input', checkButtonState);
mobileInput.addEventListener('input', checkButtonState);
mahaRaraInput.addEventListener('input', checkButtonState);

async function sendImageAndPositionForPreview() {
  console.log('sendImageAndPositionForPreview called');

  const name = nameInput.value;
  const mobile = mobileInput.value;
  const mahaRaraNo = mahaRaraInput.value;
  const fontSizeNameMobile = document.getElementById('fontSizeNameMobile').value;
  const fontSizeMahaRara = document.getElementById('fontSizeMahaRara').value;
  const fontFamily = document.getElementById('fontFamily').value;
  const fontColor = document.getElementById('fontColor').value;

  console.log('Input values:', { name, mobile, mahaRaraNo, fontSizeNameMobile, fontSizeMahaRara, fontFamily, fontColor });

  if (!name || !mobile || !mahaRaraNo) {
    console.error('Missing required fields');
    alert('Please enter all fields: name, mobile number, and Maha Rara No.');
    return;
  }

  if (!uploadedImage.src) {
    console.error('No image uploaded');
    alert('Please upload an image.');
    return;
  }

  if (!logoData) {
    console.error('No logo uploaded');
    alert('Please upload a logo.');
    return;
  }

  console.log('Selected positions:', selectedPositions);

  // Log the data being sent
  console.log('Sending data to backend:', {
    image: uploadedImage.src,
    name,
    mobile,
    maha_rara_no: mahaRaraNo,
    logo: logoData,
    positions: selectedPositions,
    fontSizeNameMobile,
    fontSizeMahaRara,
    fontFamily,
    fontColor,
  });
  
  try {
    
    const response = await fetch('/preview', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        image: uploadedImage.src,
        name,
        mobile,
        maha_rara_no: mahaRaraNo,
        logo: logoData,
        positions: selectedPositions,
        fontSizeNameMobile,
        fontSizeMahaRara,
        fontFamily,
        fontColor,
      }),
    });

    if (response.ok) {
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      console.log('Preview image URL:', url);

      // Display the edited image in the canvas
      const ctx = previewCanvas.getContext('2d');
      const img = new Image();
      img.onload = () => {
        previewCanvas.width = img.width;
        previewCanvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        previewCanvas.style.display = 'block';
        uploadedImage.style.display = 'none';
        console.log('Preview image displayed on canvas');
      };
      img.src = url;
    } else {
      const error = await response.text();
      console.error('Backend error:', error);
      alert('Error generating preview. Check console for details.');
    }
  } catch (error) {
    console.error('Network error:', error);
    alert('Network error. Check console for details.');
  }
}
// Function to update the position display
function updatePositionDisplay() {
  document.getElementById('logoPositionDisplay').textContent = `(${selectedPositions.logo.x.toFixed(0)}, ${selectedPositions.logo.y.toFixed(0)})`;
  document.getElementById('nameMobilePositionDisplay').textContent = `(${selectedPositions.name_mobile.x.toFixed(2)}, ${selectedPositions.name_mobile.y.toFixed(2)})`;
  document.getElementById('mahaRaraPositionDisplay').textContent = `(${selectedPositions.maha_rara.x.toFixed(2)}, ${selectedPositions.maha_rara.y.toFixed(0)})`;
}




// Function to adjust position
function adjustPosition(element, direction) {
  switch (direction) {
    case 'up':
      selectedPositions[element].y -= 1;
      break;
    case 'down':
      selectedPositions[element].y += 1;
      break;
    case 'left':
      selectedPositions[element].x -= 1;
      break;
    case 'right':
      selectedPositions[element].x += 1;
      break;
  }
  updatePositionDisplay();
  sendImageAndPositionForPreview(); // Update the preview
}

// Add event listeners for logo adjustment buttons
document.getElementById('logoUp').addEventListener('click', () => adjustPosition('logo', 'up'));
document.getElementById('logoDown').addEventListener('click', () => adjustPosition('logo', 'down'));
document.getElementById('logoLeft').addEventListener('click', () => adjustPosition('logo', 'left'));
document.getElementById('logoRight').addEventListener('click', () => adjustPosition('logo', 'right'));

// Add event listeners for name + mobile adjustment buttons
document.getElementById('nameMobileUp').addEventListener('click', () => adjustPosition('name_mobile', 'up'));
document.getElementById('nameMobileDown').addEventListener('click', () => adjustPosition('name_mobile', 'down'));
document.getElementById('nameMobileLeft').addEventListener('click', () => adjustPosition('name_mobile', 'left'));
document.getElementById('nameMobileRight').addEventListener('click', () => adjustPosition('name_mobile', 'right'));

// Add event listeners for Maha Rara adjustment buttons
document.getElementById('mahaRaraUp').addEventListener('click', () => adjustPosition('maha_rara', 'up'));
document.getElementById('mahaRaraDown').addEventListener('click', () => adjustPosition('maha_rara', 'down'));
document.getElementById('mahaRaraLeft').addEventListener('click', () => adjustPosition('maha_rara', 'left'));
document.getElementById('mahaRaraRight').addEventListener('click', () => adjustPosition('maha_rara', 'right'));

// Update position display initially
updatePositionDisplay();
// Add event listener to the preview button

// Confirm and download the edited image
confirmButton.addEventListener('click', async () => {
  const name = nameInput.value;
  const mobile = mobileInput.value;
  const mahaRaraNo = mahaRaraInput.value;
  const fontSizeNameMobile = document.getElementById('fontSizeNameMobile').value;
  const fontSizeMahaRara = document.getElementById('fontSizeMahaRara').value;
  const fontFamily = document.getElementById('fontFamily').value;
  const fontColor = document.getElementById('fontColor').value;

  if (!name || !mobile || !mahaRaraNo) {
    alert('Please enter all fields: name, mobile number, and Maha Rara No.');
    return;
  }

  // Convert image to base64
  const imageData = uploadedImage.src;

  // Log the data being sent
  console.log('Sending data to backend:', {
    image: imageData,
    name,
    mobile,
    maha_rara_no: mahaRaraNo,
    logo: logoData,
    positions: selectedPositions,
    fontSizeNameMobile,
    fontSizeMahaRara,
    fontFamily,
    fontColor,
  });

  // Send data to backend
  try {
    const response = await fetch('/add_text', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        image: imageData,
        name,
        mobile,
        maha_rara_no: mahaRaraNo,
        logo: logoData,
        positions: selectedPositions,
        fontSizeNameMobile,
        fontSizeMahaRara,
        fontFamily,
        fontColor,
      }),
    });

    if (response.ok) {
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      // Create a link and trigger the download
      const a = document.createElement('a');
      a.href = url;
      a.download = 'edited_image.png';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      // Log success
      console.log('Image downloaded successfully');
    } else {
      const error = await response.text();
      console.error('Backend error:', error);
      alert('Error processing image. Check console for details.');
    }
  } catch (error) {
    console.error('Network error:', error);
    alert('Network error. Check console for details.');
  }
});
// Add a new button for "Confirm and Save"


// Function to handle "Confirm and Save" button click
confirmSaveButton.addEventListener('click', async () => {
  // Get input values
  const fontSizeNameMobile = document.getElementById('fontSizeNameMobile').value;
  const fontSizeMahaRara = document.getElementById('fontSizeMahaRara').value;
  const fontFamily = document.getElementById('fontFamily').value;
  const fontColor = document.getElementById('fontColor').value;

  // Validate required fields
  if (!uploadedImage.src || !selectedPositions) {
    alert('Please upload an image and select positions.');
    return;
  }

  // Prepare data to send to the backend
  const data = {
    image: uploadedImage.src, // Base64 encoded image
    positions: selectedPositions, // Selected positions for logo, name, and Maha Rara
    fontSizeNameMobile,
    fontSizeMahaRara,
    fontFamily,
    fontColor,
  };

  // Log the data being sent (for debugging)
  console.log('Saving data to backend:', data);

  try {
    // Send data to the backend
    const response = await fetch('/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      const result = await response.json();
      alert(`Data saved successfully! ID: ${result.id}`); // Display success message with saved ID
      console.log('Data saved successfully:', result);
    } else {
      const error = await response.text();
      console.error('Backend error:', error);
      alert('Error saving data. Check console for details.');
    }
  } catch (error) {
    console.error('Network error:', error);
    alert('Network error. Check console for details.');
  }
});
// Reset logo position
const resetLogoPositionButton = document.getElementById('resetLogoPosition');
resetLogoPositionButton.addEventListener('click', () => {
  // Reset the logo position
  selectedPositions.logo = { x: 0, y: 0 };
  console.log('Logo position has been reset:', selectedPositions.logo);
  previewCanvas.src = '';
  uploadedImage.style.display = 'block';
  previewCanvas.style.display = 'none';
  // Optionally, update UI (disable button, change styles, etc.)
  checkButtonState(); // Update button state to reflect changes
});

// Reset name + mobile position
const resetNameMobilePositionButton = document.getElementById('resetNameMobilePosition');
resetNameMobilePositionButton.addEventListener('click', () => {
  // Reset the name + mobile position
  selectedPositions.name_mobile = { x: 0, y: 0 };
  console.log('Name + Mobile position has been reset:', selectedPositions.name_mobile);
  previewCanvas.src = '';
  uploadedImage.style.display = 'block';
  previewCanvas.style.display = 'none';
  // Optionally, update UI (disable button, change styles, etc.)
  checkButtonState(); // Update button state to reflect changes
});

// Reset Maha Rara position
const resetMahaRaraPositionButton = document.getElementById('resetMahaRaraPosition');
resetMahaRaraPositionButton.addEventListener('click', () => {
  // Reset the Maha Rara position
  selectedPositions.maha_rara = { x: 0, y: 0 };
  console.log('Maha Rara position has been reset:', selectedPositions.maha_rara);
  previewCanvas.src = '';
  uploadedImage.style.display = 'block';
  previewCanvas.style.display = 'none';
  // Optionally, update UI (disable button, change styles, etc.)
  checkButtonState(); // Update button state to reflect changes
});



// Track mouse movement and position the cursor lines
document.addEventListener('mousemove', function (e) {
    cursorLineHorizontal.style.left = e.pageX + 'px';
    cursorLineHorizontal.style.top = e.pageY + 'px';
    
    cursorLineVertical.style.left = e.pageX + 'px';
    cursorLineVertical.style.top = e.pageY + 'px';
});



document.addEventListener('DOMContentLoaded', function() {
  const steps = document.querySelectorAll('.step');
  const stepIndicators = document.querySelectorAll('.step-indicator-item');
  const prevBtn = document.querySelector('.nav-prev');
  const nextBtn = document.querySelector('.nav-next');
  let currentStep = 1;
  
  // Initialize the form
  updateStepVisibility();
  
  // Next button click handler
  nextBtn.addEventListener('click', function() {
      if (currentStep < steps.length) {
          // Mark current step as completed
          stepIndicators[currentStep - 1].classList.remove('active');
          stepIndicators[currentStep - 1].classList.add('completed');
          
          currentStep++;
          
          // Mark next step as active
          stepIndicators[currentStep - 1].classList.add('active');
          
          updateStepVisibility();
          
          if (currentStep === steps.length) {
              nextBtn.textContent = 'Final Preview';
          }
      } else {
          // Form submission would go here
          sendImageAndPositionForPreview();
      }
  });
  
  // Previous button click handler
  prevBtn.addEventListener('click', function() {
      if (currentStep > 1) {
          // Remove completed class from current step
          stepIndicators[currentStep - 1].classList.remove('active');
          
          currentStep--;
          
          // Mark previous step as active (not completed)
          stepIndicators[currentStep - 1].classList.add('active');
          stepIndicators[currentStep - 1].classList.remove('completed');
          
          updateStepVisibility();
          nextBtn.textContent = 'Next';
      }
  });
  
  // Update step visibility and button states
  function updateStepVisibility() {
      steps.forEach((step, index) => {
          if (index + 1 === currentStep) {
              step.classList.add('active');
          } else {
              step.classList.remove('active');
          }
      });
      
      prevBtn.disabled = currentStep === 1;
      
      if (currentStep === steps.length) {
          nextBtn.textContent = 'Submit';
      } else {
          nextBtn.textContent = 'Next';
      }
  }
  
  // Optional: Click on step indicators to navigate
  stepIndicators.forEach(indicator => {
      indicator.addEventListener('click', function() {
          const stepNumber = parseInt(this.getAttribute('data-step'));
          if (stepNumber < currentStep) {
              currentStep = stepNumber;
              updateStepIndicators();
              updateStepVisibility();
          }
      });
  });
  
  // Update step indicators based on current step
  function updateStepIndicators() {
      stepIndicators.forEach((indicator, index) => {
          indicator.classList.remove('active', 'completed');
          
          if (index + 1 < currentStep) {
              indicator.classList.add('completed');
          } else if (index + 1 === currentStep) {
              indicator.classList.add('active');
          }
      });
  }
});



document.querySelectorAll('.next-step').forEach(button => {
  button.addEventListener('click', function() {
    const currentStep = this.closest('.position-step');
    const nextStepId = this.getAttribute('data-next');
    
    currentStep.style.display = 'none';
    document.getElementById(nextStepId).style.display = 'block';
  });
});

document.querySelectorAll('.prev-step').forEach(button => {
  button.addEventListener('click', function() {
    const currentStep = this.closest('.position-step');
    const prevStepId = this.getAttribute('data-prev');
    
    currentStep.style.display = 'none';
    document.getElementById(prevStepId).style.display = 'block';
  });
});
