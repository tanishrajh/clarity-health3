// Clarity Health - Main Application Logic (Final Version)

class ClarityHealthApp {
    constructor() {
        this.knowledgeBase = null;
        this.chart = null;
        this.currentResults = [];
        
        // DOM elements
        this.fileInput = null;
        this.processBtn = null;
        this.processText = null;
        this.loadingSpinner = null;
        this.resultsSection = null;
        this.resultsTable = null;
        this.chartSection = null;
        this.biomarkerSelect = null;
        this.trendChart = null;
        this.historySection = null;
        this.historyContainer = null;
        this.historyList = null;
        this.noHistory = null;
        this.clearHistoryBtn = null;
        this.errorSection = null;
        this.errorText = null;
        this.retryBtn = null;
    }

    async init() {
        this.initDOM();
        this.setupEventListeners();
        await this.loadKnowledgeBase();
        this.loadHistory();
        console.log('Clarity Health initialized successfully');
    }

    initDOM() {
        this.fileInput = document.getElementById('file-input');
        this.processBtn = document.getElementById('process-btn');
        this.processText = document.getElementById('process-text');
        this.loadingSpinner = document.getElementById('loading-spinner');
        this.resultsSection = document.getElementById('results-section');
        this.resultsTable = document.getElementById('results-tbody');
        this.chartSection = document.getElementById('chart-section');
        this.biomarkerSelect = document.getElementById('biomarker-select');
        this.trendChart = document.getElementById('trend-chart');
        this.historyContainer = document.getElementById('history-container');
        this.historyList = document.getElementById('history-list');
        this.noHistory = document.getElementById('no-history');
        this.clearHistoryBtn = document.getElementById('clear-history-btn');
        this.errorSection = document.getElementById('error-section');
        this.errorText = document.getElementById('error-text');
        this.retryBtn = document.getElementById('retry-btn');
    }

    setupEventListeners() {
        this.fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            this.processBtn.disabled = !file;
        });
        this.processBtn.addEventListener('click', () => this.processFile());
        this.biomarkerSelect.addEventListener('change', (e) => {
            if (e.target.value) this.renderTrendChart(e.target.value);
        });
        this.clearHistoryBtn.addEventListener('click', () => this.clearHistory());
        this.retryBtn.addEventListener('click', () => this.hideError());
        const uploadArea = document.querySelector('.upload-area');
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('drag-over');
        });
        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('drag-over');
        });
        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('drag-over');
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                this.fileInput.files = files;
                this.processBtn.disabled = false;
            }
        });
    }

    async loadKnowledgeBase() {
        try {
            const response = await fetch('./knowledge_base.json');
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            this.knowledgeBase = await response.json();
            console.log('Knowledge base loaded successfully.');

            const cholesterolPattern = this.knowledgeBase.common_patterns.find(p => p.biomarker === 'total_cholesterol');
            if (cholesterolPattern && !/\bcholesterol\b/i.test(cholesterolPattern.pattern)) {
                 cholesterolPattern.pattern += '|cholesterol';
            }

        } catch (error) {
            console.error('CRITICAL: Could not load knowledge_base.json. Using fallback data. Ensure you are running this from a local web server (like VS Code Live Server), not by opening the HTML file directly.', error);
            this.knowledgeBase = {
                "biomarkers": { "hemoglobin": { "name": "Hemoglobin", "unit": "g/dL", "ranges": { "male": { "low": 13.5, "high": 17.5 }, "female": { "low": 12.0, "high": 15.5 } }, "explanations": { "low": "Low hemoglobin may indicate anemia.", "normal": "Your hemoglobin levels are healthy!", "high": "High hemoglobin could indicate dehydration." } } },
                "common_patterns": [{ "pattern": "hemoglobin|hgb|hb", "biomarker": "hemoglobin" }]
            };
        }
    }

    async processFile() {
        const file = this.fileInput.files[0];
        if (!file) return;

        this.showLoading();
        this.hideError();

        try {
            const extractedText = await this.performOCR(file);
            console.log("--- OCR Text Output ---");
            console.log(extractedText);
            console.log("-----------------------");

            if (!extractedText || extractedText.trim() === '') {
                throw new Error("OCR could not extract any text from the document.");
            }

            const biomarkers = this.parseLabResults(extractedText);
            const interpretedResults = this.interpretResults(biomarkers);
            
            if (interpretedResults.length === 0) {
                 this.showError('No known biomarkers were found in the document. The OCR might have had trouble reading the file. Please try a clearer image.');
                 return;
            }

            this.displayResults(interpretedResults);
            this.saveToHistory(interpretedResults);
            this.updateChartOptions(interpretedResults);

        } catch (error) {
            console.error('Processing error:', error);
            let errorMessage = 'Failed to process the lab report. Please ensure the file is clear and readable.';
            if (file.type === 'application/pdf') {
                errorMessage = 'Failed to process the PDF. For best results, please convert the report to a high-quality PNG or JPG image and try again.';
            } else if (error.message.includes("OCR could not extract")) {
                errorMessage = 'Could not read the text from the document. Please use a clearer, higher-resolution image.';
            }
            this.showError(errorMessage);
        } finally {
            this.hideLoading();
        }
    }

    async performOCR(file) {
        try {
            const result = await Tesseract.recognize(file, 'eng', {
                logger: m => {
                    if (m.status === 'recognizing text') {
                        this.processText.textContent = `Processing... ${Math.round(m.progress * 100)}%`;
                    }
                }
            });
            return result.data.text;
        } catch (error) {
            throw new Error('OCR processing failed');
        }
    }
    
    // --- MAJOR FIX STARTS HERE ---
    // This function is completely re-engineered with a simpler, more robust strategy.
    // It avoids the complex looping that was failing silently.
    parseLabResults(text) {
        const results = [];
        const commonBiomarkers = this.knowledgeBase.common_patterns;
        const numberRegex = /(\d{1,3}(?:,\d{3})*\.\d+|\d+\.\d+|\d{1,3}(?:,\d{3})*|\d+)/;

        for (const patternInfo of commonBiomarkers) {
            // Combine all aliases into a single regex, e.g., /(hemoglobin|hgb|hb)/i
            const flexiblePattern = patternInfo.pattern.replace(/ /g, '\\s*');
            const patternRegex = new RegExp(`(${flexiblePattern})`, "i");

            const patternMatch = text.match(patternRegex);

            if (patternMatch) {
                // Find the biomarker name and its position
                const matchedPattern = patternMatch[0];
                const matchIndex = patternMatch.index;

                // Define a "search window" of 50 characters after the biomarker name
                const searchWindowStart = matchIndex + matchedPattern.length;
                const searchWindow = text.substring(searchWindowStart, searchWindowStart + 50);

                // Find the first number in that window
                const numberMatch = searchWindow.match(numberRegex);

                if (numberMatch && numberMatch[0]) {
                    let valueStr = numberMatch[0].replace(/,/g, '');
                    let value = parseFloat(valueStr);

                    // Heuristic to correct for missed decimal points from OCR
                    const biomarkerInfo = this.knowledgeBase.biomarkers[patternInfo.biomarker];
                    if (biomarkerInfo && !valueStr.includes('.')) {
                        let highRange = null;
                        const ranges = biomarkerInfo.ranges;
                        if (ranges.male && ranges.male.high) highRange = ranges.male.high;
                        else if (ranges.normal && ranges.normal.high) highRange = ranges.normal.high;
                        
                        if (highRange && highRange < 100 && value > highRange) {
                            if (value >= 100 && value < 1000) { value /= 10; }
                            else if (value >= 1000) { value /= 100; }
                             console.log(`Applied decimal correction for ${patternInfo.biomarker}. New value: ${value}`);
                        }
                    }
                    
                    if (/\blakh\b/i.test(searchWindow)) {
                        value *= 100000;
                    }

                    results.push({
                        biomarker: patternInfo.biomarker,
                        value: value,
                        originalText: `${matchedPattern}... ${searchWindow.trim()}`
                    });
                }
            }
        }
        
        console.log("Found Biomarkers:", results);
        return results;
    }
    // --- MAJOR FIX ENDS HERE ---

    interpretResults(biomarkers) {
        return biomarkers.map(biomarker => {
            const knowledge = this.knowledgeBase.biomarkers[biomarker.biomarker];
            if (!knowledge) return null;
            
            const status = this.determineStatus(biomarker.value, knowledge);
            const explanation = knowledge.explanations[status] || 'No explanation available.';
            
            return {
                name: knowledge.name,
                value: biomarker.value,
                unit: knowledge.unit,
                status: status,
                explanation: explanation,
                biomarkerKey: biomarker.biomarker,
                date: new Date().toISOString()
            };
        }).filter(result => result !== null);
    }

    determineStatus(value, knowledge) {
        const ranges = knowledge.ranges;
        if (ranges.male && ranges.female) {
            const genderRanges = ranges.male;
            if (ranges.male.low !== undefined && value < genderRanges.low) return 'low';
            if (ranges.male.high !== undefined && value > genderRanges.high) return 'high';
            return 'normal';
        }
        if (ranges.normal && ranges.normal.low !== undefined) {
            if (value < ranges.normal.low) return 'low';
            if (value > ranges.normal.high) return 'high';
            return 'normal';
        }
        if (ranges.desirable !== undefined) {
            if (value < ranges.desirable) return 'normal';
            if (value <= ranges.borderline) return 'borderline';
            return 'high';
        }
        if (ranges.optimal !== undefined) {
            if (value < ranges.optimal) return 'low';
            if (value <= ranges.near_optimal) return 'normal';
            if (value <= ranges.borderline) return 'borderline';
            return 'high';
        }
        if (ranges.normal && ranges.normal.random !== undefined) {
            if (value < 70) return 'low';
            if (value > ranges.normal.random) return 'high';
            return 'normal';
        }
        return 'normal';
    }

    displayResults(results) {
        this.currentResults = results;
        this.resultsTable.innerHTML = '';
        results.forEach(result => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${result.name}</td>
                <td>${result.value} ${result.unit}</td>
                <td><span class="status-${result.status}">${this.capitalizeFirst(result.status)}</span></td>
                <td>${result.explanation}</td>
            `;
            this.resultsTable.appendChild(row);
        });
        this.resultsSection.style.display = 'block';
    }

    updateChartOptions(results) {
        this.biomarkerSelect.innerHTML = '<option value="">Choose a biomarker...</option>';
        results.forEach(result => {
            const option = document.createElement('option');
            option.value = result.biomarkerKey;
            option.textContent = result.name;
            this.biomarkerSelect.appendChild(option);
        });
        if (results.length > 0) {
            this.chartSection.style.display = 'block';
        }
    }

    renderTrendChart(biomarkerKey) {
        const history = this.getStoredHistory();
        const biomarkerHistory = history.flatMap(entry => entry.results)
            .filter(result => result.biomarkerKey === biomarkerKey)
            .map(result => ({ ...result, date: new Date(result.date) }))
            .sort((a, b) => a.date - b.date);

        if (biomarkerHistory.length === 0) return;
        if (this.chart) this.chart.destroy();

        const ctx = this.trendChart.getContext('2d');
        this.chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: biomarkerHistory.map(item => item.date.toLocaleDateString()),
                datasets: [{
                    label: `${biomarkerHistory[0].name} (${biomarkerHistory[0].unit})`,
                    data: biomarkerHistory.map(item => item.value),
                    borderColor: 'rgb(75, 192, 192)',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    tension: 0.1,
                    fill: true
                }]
            },
            options: { /* ... options ... */ }
        });
    }

    saveToHistory(results) {
        const history = this.getStoredHistory();
        history.unshift({ date: new Date().toISOString(), results });
        if (history.length > 10) history.pop();
        localStorage.setItem('clarityHealth_history', JSON.stringify(history));
        this.loadHistory();
    }

    loadHistory() {
        const history = this.getStoredHistory();
        this.noHistory.style.display = history.length === 0 ? 'block' : 'none';
        this.historyList.innerHTML = '';
        history.forEach(entry => {
            const div = document.createElement('div');
            div.className = 'history-item';
            div.innerHTML = `
                <div class="history-date">${new Date(entry.date).toLocaleString()}</div>
                <div class="history-summary">${entry.results.map(r => `${r.name}: ${r.status}`).join(', ')}</div>
            `;
            div.addEventListener('click', () => {
                this.displayResults(entry.results);
                this.updateChartOptions(entry.results);
                window.scrollTo({ top: this.resultsSection.offsetTop, behavior: 'smooth' });
            });
            this.historyList.appendChild(div);
        });
    }

    getStoredHistory() {
        try {
            return JSON.parse(localStorage.getItem('clarityHealth_history')) || [];
        } catch {
            return [];
        }
    }

    clearHistory() {
        localStorage.removeItem('clarityHealth_history');
        this.loadHistory();
    }

    showLoading() {
        this.processBtn.disabled = true;
        this.processText.style.display = 'none';
        this.loadingSpinner.style.display = 'inline';
    }

    hideLoading() {
        this.processBtn.disabled = false;
        this.processText.style.display = 'inline';
        this.loadingSpinner.style.display = 'none';
        this.processText.textContent = 'Process Report';
    }

    showError(message) {
        this.errorText.textContent = message;
        this.errorSection.style.display = 'block';
    }

    hideError() {
        this.errorSection.style.display = 'none';
    }
    
    capitalizeFirst(str) { return str.charAt(0).toUpperCase() + str.slice(1); }
}

document.addEventListener('DOMContentLoaded', async () => {
    const app = new ClarityHealthApp();
    await app.init();
});

