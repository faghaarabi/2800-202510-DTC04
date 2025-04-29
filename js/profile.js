async function fetchProfile() {
    const userId = localStorage.getItem('userId');
    
    console.log('Stored User ID:', userId);
    
    if (!userId) {
        window.location.href = '/login';
        return;
    }

    try {
        // Explicitly pass userId as a query parameter
        const response = await fetch(`/api/users/profile?userId=${userId}`);

        console.log('Response status:', response.status);

        const responseData = await response.json();
        console.log('Full Response:', responseData);

        if (!response.ok) {
            console.error('Profile fetch error:', responseData);

            localStorage.removeItem('userId');
            window.location.href = responseData.redirect || '/login';
            return;
        }

        const { user } = responseData;
        
        console.log('Received user data:', user);
        
        // Update UI elements
        const usernameEl = document.getElementById('username');
        const emailEl = document.getElementById('email');
        const interestsEl = document.getElementById('interests');

        if (usernameEl) usernameEl.textContent = user.username || 'N/A';
        if (emailEl) emailEl.textContent = user.email || 'N/A';
        if (interestsEl) {
            interestsEl.innerHTML = user.interests && user.interests.length > 0
                ? user.interests.map(interest => 
                    `<span class="badge">${interest}</span>`
                ).join('')
                : 'No interests';
        }
    } catch (error) {
        console.error('Error fetching profile:', error);
        localStorage.removeItem('userId');
        window.location.href = '/login';
    }
}

// Call fetchProfile when page loads
document.addEventListener('DOMContentLoaded', fetchProfile);