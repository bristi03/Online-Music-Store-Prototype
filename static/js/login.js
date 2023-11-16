document.getElementById("login-form").addEventListener("submit", function (e) {
    e.preventDefault();
    
    const email = document.getElementById("login-email").value;
    const username = document.getElementById("login-username").value;
    const password = document.getElementById("login-password").value;

    // Add your login validation and authentication logic here
    // For this example, let's assume successful login always
    
    // Redirect to index.html after successful login
    window.location.href = "index.html";
});
