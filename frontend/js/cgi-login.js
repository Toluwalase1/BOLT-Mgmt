document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Login Script Loaded'); 

    const form = document.getElementById('login-form');

    // Safety check
    if (!form) {
        console.error('❌ Error: Login form not found! Check your HTML id="login-form"');
        return;
    }

    const submitButton = form.querySelector('button[type="submit"]');

    form.addEventListener('submit', async (e) => {
        console.log('⚡ Submit Button Clicked');
        e.preventDefault();

        // --- UI Feedback ---
        const originalText = submitButton.textContent;
        submitButton.disabled = true;           
        submitButton.textContent = 'Verifying...'; 
        submitButton.style.opacity = '0.7';     
        
        // Clear errors
        const emailError = document.getElementById('email-error');
        const passError = document.getElementById('password-error');
        if (emailError) emailError.textContent = '';
        if (passError) passError.textContent = '';

        // --- Collect Data ---
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;

        // Validation
        if (!email || !password) {
            if (!email && emailError) emailError.textContent = 'Email is required';
            if (!password && passError) passError.textContent = 'Password is required';
            resetButton(submitButton, originalText);
            return;
        }

        try {
            console.log('📡 Asking Backend to check File Cabinets...');
            
            // --- Send to Node.js Backend ---
            const res = await fetch('https://bolt-mgmt.onrender.com/cgi-script/cgi-bin/login.js', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const result = await res.json();
            console.log('📦 Backend Reply:', result); 

            // --- Handle Response ---
            if (result.status === 'success') {
                const user = result.user;
                console.log(`✅ User Found! Role identified as: [ ${user.type.toUpperCase()} ]`);
                
                // Store session
                sessionStorage.setItem('bolt_user', JSON.stringify(user));
                
                // UI Success
                submitButton.textContent = 'Success!';
                submitButton.style.backgroundColor = '#4CAF50'; 

                // --- REDIRECT LOGIC ---
                setTimeout(() => {
                    let target = '';
                    
                    if (user.type === 'rider') {
                        target = 'https://bolt-mgmt.onrender.com/frontend/customer/customerhome.html';
                    } else if (user.type === 'driver') {
                        target = 'https://bolt-mgmt.onrender.com/frontend/driver/driver-dashboard.html';
                    } else if (user.type === 'admin') {
                        target = 'https://bolt-mgmt.onrender.com/frontend/admin/admindashboard.html'; // Admin Path
                    } else {
                        alert('⚠️ Account type unknown. Contact support.');
                        resetButton(submitButton, originalText);
                        return;
                    }
                    
                    console.log(`➡️ Redirecting to: ${target}`);
                    window.location.href = target;
                }, 800); 

            } else {
                // Backend said No
                console.error('❌ Login Failed:', result.message);
                
                const msg = (result.message || '').toLowerCase();
                if (msg.includes('email') || msg.includes('user')) {
                    if (emailError) emailError.textContent = result.message;
                } else if (msg.includes('password')) {
                    if (passError) passError.textContent = result.message;
                } else {
                    alert('❌ ' + result.message);
                }
                
                resetButton(submitButton, originalText);
            }

        } catch (err) {
            console.error('🔥 Connection Failed:', err);
            alert('❌ Server not responding. Is "node server.js" running?');
            resetButton(submitButton, originalText);
        }
    });
});

function resetButton(button, originalText) {
    button.disabled = false;
    button.textContent = originalText;
    button.style.opacity = '1';
    button.style.backgroundColor = ''; 
}