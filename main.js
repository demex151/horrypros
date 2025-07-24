function changeLang(lang) {
  document.querySelectorAll("[data-en]").forEach(el => {
    el.textContent = el.getAttribute(`data-${lang}`);
  });
}

function selectOption(type) {
  if (type === 'homeowner') {
    window.location.href = 'homeowner.html';
  } else if (type === 'contractor') {
    window.location.href = 'contractor.html';
  }
}

// Form submission handlers
document.addEventListener('DOMContentLoaded', function() {
  // Homeowner form submission
  const projectForm = document.getElementById('project-form');
  if (projectForm) {
    projectForm.addEventListener('submit', function(e) {
      e.preventDefault();
      alert('¡Gracias! Tu solicitud ha sido enviada. Te contactaremos pronto con contratistas disponibles.');
      // Here you would typically send the data to a server
    });
  }

  // Contractor form submission
  const contractorForm = document.getElementById('contractor-form');
  if (contractorForm) {
    contractorForm.addEventListener('submit', function(e) {
      e.preventDefault();
      alert('¡Gracias! Tu registro ha sido enviado. Revisaremos tu información y te contactaremos pronto.');
      // Here you would typically send the data to a server
    });
  }
});
