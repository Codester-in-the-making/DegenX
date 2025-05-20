document.addEventListener('DOMContentLoaded', function() {
    // Initialize Supabase client
    const SUPABASE_URL = 'https://rvthcmcucsfwaziqwhqs.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ2dGhjbWN1Y3Nmd2F6aXF3aHFzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc2OTQyMTMsImV4cCI6MjA2MzI3MDIxM30.bkKe5lqZVx26qVyTcsz1Orxh3VUzfK-Ci2xlj4XrxdI';
    const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    const form = document.getElementById('confession-form');
    const confessionTextarea = document.getElementById('confession');
    const charCount = document.getElementById('char-count');
    const submitBtn = document.getElementById('submit-btn');
    const successMessage = document.getElementById('success-message');
    const newConfessionBtn = document.getElementById('new-confession-btn');

    // Function to auto-resize textarea
    function autoResizeTextarea() {
        confessionTextarea.style.height = 'auto';
        confessionTextarea.style.height = (confessionTextarea.scrollHeight) + 'px';
    }

    // Initialize textarea height
    autoResizeTextarea();

    // Handle text area character count and auto-resize
    confessionTextarea.addEventListener('input', function() {
        const currentLength = this.value.length;
        charCount.textContent = `${currentLength}/1000`;

        // Visual feedback as user approaches limit
        if (currentLength >= 900) {
            charCount.style.color = '#db3a34';
        } else {
            charCount.style.color = '';
        }

        // Auto-resize the textarea
        autoResizeTextarea();
    });

    // Form submission
    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        // Disable submit button to prevent multiple submissions
        submitBtn.disabled = true;
        submitBtn.textContent = 'Submitting...';

        // Get form data
        const nickname = document.getElementById('nickname').value || 'Anonymous';
        const confession = confessionTextarea.value;

        try {
            // Store confession in Supabase
            const { data, error } = await supabaseClient
                .from('confessions')
                .insert([
                    {
                        nickname: nickname,
                        confession: confession,
                        // shared is already set to false by default in the table
                    }
                ]);

            if (error) {
                console.error('Error submitting confession:', error);
                alert('There was an error submitting your confession. Please try again.');
                submitBtn.disabled = false;
                submitBtn.textContent = 'Submit Degen Confession';
                return;
            }

            console.log('Confession submitted successfully:', data);

            // Show success message
            form.classList.add('hidden');
            successMessage.classList.remove('hidden');

        } catch (err) {
            console.error('Unexpected error:', err);
            alert('There was an unexpected error. Please try again.');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Submit Degen Confession';
        }
    });

    // Submit another confession button
    newConfessionBtn.addEventListener('click', function() {
        form.reset();
        charCount.textContent = '0/1000';
        charCount.style.color = '';
        successMessage.classList.add('hidden');
        form.classList.remove('hidden');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit Degen Confession';
    });
});