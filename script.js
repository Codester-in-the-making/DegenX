document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('confession-form');
    const confessionTextarea = document.getElementById('confession');
    const charCount = document.getElementById('char-count');
    const submitBtn = document.getElementById('submit-btn');
    const successMessage = document.getElementById('success-message');
    const newConfessionBtn = document.getElementById('new-confession-btn');
    
    // Handle text area character count
    confessionTextarea.addEventListener('input', function() {
        const currentLength = this.value.length;
        charCount.textContent = `${currentLength}/1000`;
        
        // Visual feedback as user approaches limit
        if (currentLength >= 900) {
            charCount.style.color = '#db3a34';
        } else {
            charCount.style.color = '';
        }
    });
    
    // Form submission
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form data
        const nickname = document.getElementById('nickname').value || 'Anonymous';
        const confession = confessionTextarea.value;
        
        // Here you would normally send data to your backend
        console.log('Submission:', { nickname, confession });
        
        // Show success message
        form.classList.add('hidden');
        successMessage.classList.remove('hidden');
        
        // Optional: Store in localStorage for demo purposes
        const submissions = JSON.parse(localStorage.getItem('confessions') || '[]');
        submissions.push({
            nickname,
            confession,
            timestamp: new Date().toISOString(),
            status: 'published'
        });
        localStorage.setItem('confessions', JSON.stringify(submissions));
    });
    
    // Submit another confession button
    newConfessionBtn.addEventListener('click', function() {
        form.reset();
        charCount.textContent = '0/1000';
        charCount.style.color = '';
        successMessage.classList.add('hidden');
        form.classList.remove('hidden');
    });
    

});