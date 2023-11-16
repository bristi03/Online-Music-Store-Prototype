document.getElementById("login-form").addEventListener("submit", function (e) {
    e.preventDefault();
    
    const email = document.getElementById("signup-email").value;
    const username = document.getElementById("signup-username").value;
    const password = document.getElementById("signup-password").value;
    const confirmPassword = document.getElementById("signup-confirm-password").value;
    const passwordMatchError = document.getElementById("password-match-error");

    if (password !== confirmPassword) {
        passwordMatchError.style.display = "block";
    } else {
        passwordMatchError.style.display = "none";
        
        // Add your signup validation and registration logic here
        // For this example, let's assume successful registration always

        // Redirect to index.html after successful registration
        window.location.href = "index.html";
    }
});
