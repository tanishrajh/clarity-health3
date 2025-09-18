Clarity Health 🩺
<br>
Demystify Your Medical Reports. Instantly, Privately, and Offline.



🚀 How to Use (Quick Start)
Download: Download all project files into a single folder on your computer.

Open in Editor: Open the entire folder in a code editor like VS Code.

Install Live Server: In VS Code, go to the Extensions tab and install the "Live Server" extension if you don't have it already.

Run: Right-click on the index.html file and select "Open with Live Server".

Upload: In the browser tab that opens, upload a JPG or PNG file of a medical report (e.g., a blood report). You can find sample images in the samples folder.

Analyze: Click the "Process Report" button to get your simplified results!



🩺 What is Clarity Health?
Clarity Health is a privacy-first tool that uses client-side AI to instantly analyze images of your medical lab reports. It extracts key health data, explains what it means in simple terms, and works completely offline—your sensitive data never leaves your device.



✨ Key Features
📈 Image-Based Report Analysis: Upload a JPG or PNG of your lab report for instant analysis.

🔒 Privacy-First by Design: All processing, from OCR to data interpretation, happens entirely in your browser. Your personal health information never leaves your device.

🔬 Multi-Biomarker Detection: Automatically detects and extracts common biomarkers like Hemoglobin, RBC/WBC count, Cholesterol levels, Platelet count, and more.

💡 Simplified Explanations: Translates complex medical jargon into plain, simple language, explaining what each result means for your health.

📊 Historical Trend Tracking: Saves your previous reports locally in your browser so you can visualize your health trends over time with an interactive chart.

🌐 Fully Offline: After the initial page load, the app works completely offline. Because the knowledge base is embedded, you can even run it by simply opening the index.html file locally.



🛠️ How It Works
The application follows a simple, powerful, and private workflow:

Upload: The user selects or drags-and-drops an image of their lab report.

Client-Side OCR: The browser uses the Tesseract.js library (a task-specific AI model) to perform Optical Character Recognition directly on the user's machine. The extracted text is never sent over the network.

Parse & Interpret: A robust JavaScript parsing engine searches the extracted text for known biomarkers, extracts their values, and applies heuristics to correct common OCR errors (like missed decimal points).

Display: The results are cross-referenced with an embedded knowledge base to provide simplified explanations and status indicators (Low, Normal, High) in a clean, readable table.



🚀 Tech Stack
Frontend: HTML5, CSS3, Vanilla JavaScript (ES6+)

AI / OCR Model: Tesseract.js

Charting: Chart.js

Styling: Pico.css for a clean, semantic layout.

Charting: Chart.js

Styling: Pico.css for a clean, semantic layout.
