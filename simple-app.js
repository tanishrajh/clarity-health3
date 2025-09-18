// Simplified Clarity Health App for debugging

document.addEventListener('DOMContentLoaded', () => {
    console.log('Simple app loading...');
    
    const fileInput = document.getElementById('file-input');
    const processBtn = document.getElementById('process-btn');
    const processText = document.getElementById('process-text');
    const loadingSpinner = document.getElementById('loading-spinner');
    
    console.log('Elements found:', {
        fileInput: !!fileInput,
        processBtn: !!processBtn,
        processText: !!processText,
        loadingSpinner: !!loadingSpinner
    });
    
    if (!fileInput || !processBtn) {
        console.error('Required elements not found!');
        return;
    }
    
    // File input change handler
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        console.log('File selected:', file);
        
        if (file) {
            processBtn.disabled = false;
            processBtn.style.opacity = '1';
            console.log('Button enabled');
        } else {
            processBtn.disabled = true;
            processBtn.style.opacity = '0.5';
            console.log('Button disabled');
        }
    });
    
    // Process button click handler
    processBtn.addEventListener('click', async () => {
        const file = fileInput.files[0];
        if (!file) {
            alert('Please select a file first');
            return;
        }
        
        console.log('Processing file:', file.name);
        
        // Show loading
        processBtn.disabled = true;
        if (processText) processText.style.display = 'none';
        if (loadingSpinner) loadingSpinner.style.display = 'inline';
        
        try {
            // Simple OCR test
            const result = await Tesseract.recognize(file, 'eng', {
                logger: m => {
                    if (m.status === 'recognizing text') {
                        if (processText) {
                            processText.textContent = `Processing... ${Math.round(m.progress * 100)}%`;
                        }
                        console.log('OCR Progress:', Math.round(m.progress * 100) + '%');
                    }
                }
            });
            
            console.log('OCR Complete:', result.data.text);
            alert('OCR Complete! Check console for extracted text.');
            
            // Show basic results
            const resultsSection = document.getElementById('results-section');
            const resultsTable = document.getElementById('results-tbody');
            
            if (resultsSection && resultsTable) {
                resultsTable.innerHTML = `
                    <tr>
                        <td>OCR Test</td>
                        <td>Completed</td>
                        <td><span class="status-normal">Success</span></td>
                        <td>Text extracted successfully. Check console for details.</td>
                    </tr>
                `;
                resultsSection.style.display = 'block';
            }
            
        } catch (error) {
            console.error('Error:', error);
            alert('Error processing file: ' + error.message);
        }
        
        // Hide loading
        processBtn.disabled = false;
        if (processText) {
            processText.style.display = 'inline';
            processText.textContent = 'Process Report';
        }
        if (loadingSpinner) loadingSpinner.style.display = 'none';
    });
    
    console.log('Simple app initialized');
});