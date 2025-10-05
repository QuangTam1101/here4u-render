// Google Sign-In Handler
function handleCredentialResponse(response) {
    // Decode JWT token
    const responsePayload = decodeJwtResponse(response.credential);
    
    // Save user data
    currentUser = {
        id: responsePayload.sub,
        name: responsePayload.name,
        email: responsePayload.email,
        picture: responsePayload.picture,
        joinDate: new Date().toISOString()
    };
    
    // Save to localStorage
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    
    // Update UI
    updateUserInterface();
    
    // Close modal
    closeLoginModal();
    
    // Show main app
    showMainApp();
    
    // Show success notification
    showNotification(`Chào mừng ${currentUser.name}!`, 'success');
}

function decodeJwtResponse(token) {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
}

function updateUserInterface() {
    if (currentUser) {
        // Update header
        document.getElementById('userName').textContent = currentUser.name;
        document.getElementById('userAvatar').src = currentUser.picture;
        
        // Update profile section
        document.getElementById('profileName').textContent = currentUser.name;
        document.getElementById('profileAvatar').src = currentUser.picture;
        
        // Calculate usage days
        const joinDate = new Date(currentUser.joinDate);
        const today = new Date();
        const diffTime = Math.abs(today - joinDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        document.getElementById('usageDays').textContent = diffDays;
    }
}

function checkAuthState() {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        updateUserInterface();
        showMainApp();
    }
}

function logout() {
    // Clear user data
    currentUser = null;
    localStorage.removeItem('currentUser');
    localStorage.removeItem('moodData');
    
    // Reset UI
    hideMainApp();
    closeSettings();
    
    // Show notification
    showNotification('Đăng xuất thành công', 'success');
}

function showLoginModal() {
    document.getElementById('loginModal').style.display = 'block';
}

function closeLoginModal() {
    document.getElementById('loginModal').style.display = 'none';
}

// Close modal when clicking outside
window.onclick = function(event) {
    const loginModal = document.getElementById('loginModal');
    const settingsModal = document.getElementById('settingsModal');
    
    if (event.target === loginModal) {
        closeLoginModal();
    }
    if (event.target === settingsModal) {
        closeSettings();
    }
}