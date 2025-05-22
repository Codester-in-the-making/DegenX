document.addEventListener('DOMContentLoaded', function() {
    // Constants
    const ADMIN_PASSWORD = '123degen';
    
    // Initialize Supabase client (using the same credentials as in script.js)
    const SUPABASE_URL = 'https://rvthcmcucsfwaziqwhqs.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ2dGhjbWN1Y3Nmd2F6aXF3aHFzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc2OTQyMTMsImV4cCI6MjA2MzI3MDIxM30.bkKe5lqZVx26qVyTcsz1Orxh3VUzfK-Ci2xlj4XrxdI';
    const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    // DOM Elements
    const loginContainer = document.getElementById('login-container');
    const adminDashboard = document.getElementById('admin-dashboard');
    const passwordInput = document.getElementById('password');
    const loginBtn = document.getElementById('login-btn');
    const refreshBtn = document.getElementById('refresh-btn');
    const confessionList = document.getElementById('confession-list');
    const pendingCount = document.getElementById('pending-count');
    const approvedCount = document.getElementById('approved-count');
    
    // Check if already logged in
    if (localStorage.getItem('degenAdminLoggedIn') === 'true') {
        showDashboard();
        loadConfessions();
    }
    
    // Login functionality
    loginBtn.addEventListener('click', function() {
        if (passwordInput.value === ADMIN_PASSWORD) {
            localStorage.setItem('degenAdminLoggedIn', 'true');
            showDashboard();
            loadConfessions();
        } else {
            alert('Incorrect password');
        }
    });
    
    // Also allow Enter key to submit
    passwordInput.addEventListener('keyup', function(event) {
        if (event.key === 'Enter') {
            loginBtn.click();
        }
    });
    
    // Refresh button
    refreshBtn.addEventListener('click', loadConfessions);
    
    function showDashboard() {
        loginContainer.classList.add('hidden');
        adminDashboard.classList.remove('hidden');
    }
    
    async function loadConfessions() {
        try {
            // Get all confessions ordered by creation time (newest first)
            const { data, error } = await supabaseClient
                .from('confessions')
                .select('*')
                .order('created_at', { ascending: false });
                
            if (error) {
                console.error('Error fetching confessions:', error);
                alert('Error loading confessions. Please try again.');
                return;
            }
            
            // Clear the list
            confessionList.innerHTML = '';
            
            // Update counts
            const approved = data.filter(item => item.shared).length;
            const pending = data.length - approved;
            
            pendingCount.textContent = pending;
            approvedCount.textContent = approved;
            
            // Add each confession to the list
            data.forEach(confession => {
                const confessionEl = createConfessionElement(confession);
                confessionList.appendChild(confessionEl);
            });
            
        } catch (err) {
            console.error('Unexpected error:', err);
            alert('There was an unexpected error. Please try again.');
        }
    }
    
    function createConfessionElement(confession) {
        const { id, nickname, confession: text, created_at, shared } = confession;
        
        // Create the container div
        const confessionEl = document.createElement('div');
        confessionEl.className = `confession-item ${shared ? 'approved' : ''}`;
        confessionEl.dataset.id = id;
        
        // Format the date
        const date = new Date(created_at);
        const formattedDate = date.toLocaleString();
        
        // Create the header with nickname and date
        const header = document.createElement('div');
        header.className = 'confession-header';
        header.innerHTML = `
            <div>${nickname}</div>
            <div>${formattedDate}</div>
        `;
        
        // Create the text content
        const textEl = document.createElement('div');
        textEl.className = 'confession-text';
        textEl.textContent = text;
        
        // Create action buttons
        const actions = document.createElement('div');
        actions.className = 'confession-actions';
        
        // Delete button
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'action-btn delete-btn';
        deleteBtn.textContent = 'Delete';
        deleteBtn.addEventListener('click', () => deleteConfession(id));
        
        // Approve button
        const approveBtn = document.createElement('button');
        approveBtn.className = 'action-btn approve-btn';
        approveBtn.textContent = shared ? 'Approved' : 'Approve';
        approveBtn.disabled = shared;
        if (!shared) {
            approveBtn.addEventListener('click', () => approveConfession(id, confessionEl));
        }
        
        // Copy button
        const copyBtn = document.createElement('button');
        copyBtn.className = 'action-btn copy-btn';
        copyBtn.textContent = 'Copy';
        copyBtn.addEventListener('click', () => copyConfession(text, nickname));
        
        // Add buttons to actions div
        actions.appendChild(deleteBtn);
        actions.appendChild(approveBtn);
        actions.appendChild(copyBtn);
        
        // Assemble the confession element
        confessionEl.appendChild(header);
        confessionEl.appendChild(textEl);
        confessionEl.appendChild(actions);
        
        return confessionEl;
    }
    
    async function deleteConfession(id) {
        if (!confirm('Are you sure you want to delete this confession?')) {
            return;
        }
        
        try {
            const { error } = await supabaseClient
                .from('confessions')
                .delete()
                .eq('id', id);
                
            if (error) {
                console.error('Error deleting confession:', error);
                alert('Error deleting confession. Please try again.');
                return;
            }
            
            // Remove from UI
            const confessionEl = document.querySelector(`.confession-item[data-id="${id}"]`);
            if (confessionEl) {
                confessionEl.remove();
                
                // Update counts
                const approved = document.querySelectorAll('.confession-item.approved').length;
                const total = document.querySelectorAll('.confession-item').length;
                
                pendingCount.textContent = total - approved;
                approvedCount.textContent = approved;
            }
            
        } catch (err) {
            console.error('Unexpected error:', err);
            alert('There was an unexpected error. Please try again.');
        }
    }
    
    async function approveConfession(id, confessionEl) {
        try {
            const { error } = await supabaseClient
                .from('confessions')
                .update({ shared: true })
                .eq('id', id);
                
            if (error) {
                console.error('Error approving confession:', error);
                alert('Error approving confession. Please try again.');
                return;
            }
            
            // Update UI
            confessionEl.classList.add('approved');
            const approveBtn = confessionEl.querySelector('.approve-btn');
            approveBtn.textContent = 'Approved';
            approveBtn.disabled = true;
            
            // Update counts
            const approved = document.querySelectorAll('.confession-item.approved').length;
            const total = document.querySelectorAll('.confession-item').length;
            
            pendingCount.textContent = total - approved;
            approvedCount.textContent = approved;
            
        } catch (err) {
            console.error('Unexpected error:', err);
            alert('There was an unexpected error. Please try again.');
        }
    }
    
    function copyConfession(text, nickname) {
        // Format the text to be copied (adding the nickname if it's not 'Anonymous')
        const copyText = nickname && nickname !== 'Anonymous' 
            ? `"${text}" - ${nickname}` 
            : `"${text}"`;
            
        navigator.clipboard.writeText(copyText)
            .then(() => {
                alert('Confession copied to clipboard!');
            })
            .catch(err => {
                console.error('Failed to copy:', err);
                alert('Failed to copy. Please try again.');
            });
    }
});