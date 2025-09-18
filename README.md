# Clarity Health 🩺

**Demystify Your Medical Reports. Instantly, Privately, and Offline.**

---

## 🚀 How to Use (Quick Start)

1.  **Download:** Download all project files into a single folder on your computer.
2.  **Open in Editor:** Open the entire folder in a code editor like VS Code.
3.  **Install Live Server:** In VS Code, go to the Extensions tab and install the "Live Server" extension if you don't have it already. 
4.  **Run:** Right-click on the `index.html` file in the VS Code explorer and select "Open with Live Server".
5.  **Upload:** In the browser tab that opens, upload a JPG or PNG file of a medical report (e.g., a blood report). You can find sample images in the `samples` folder.
6.  **Analyze:** Click the "Process Report" button to get your simplified results!

---

## 🩺 What is Clarity Health?

Clarity Health is a privacy-first tool that uses a client-side AI model to instantly analyze images of your medical lab reports. It extracts key health data, explains what it means in simple terms, and works completely offline—your sensitive data never leaves your device.


---

## ✨ Key Features

* **📈 Image-Based Report Analysis:** Upload a JPG or PNG of your lab report for instant analysis.
* **🔒 Privacy-First by Design:** All processing, from OCR to data interpretation, happens **entirely in your browser**. Your personal health information is never sent to a server.
* **🔬 Multi-Biomarker Detection:** Automatically detects and extracts common biomarkers like Hemoglobin, RBC/WBC count, Cholesterol levels, Platelet count, and more.
* **💡 Simplified Explanations:** Translates complex medical jargon into plain, simple language, explaining what each result means for your health.
* **📊 Historical Trend Tracking:** Saves your previous reports locally in your browser so you can visualize your health trends over time with an interactive chart.
* **🌐 Fully Offline Capable:** Because the knowledge base is embedded, the app can run locally without an internet connection by simply opening the `index.html` file.

---

## 🛠️ How It Works

The application follows a simple, powerful, and private workflow:

1.  **Upload:** The user selects or drags-and-drops an image of their lab report.
2.  **Client-Side OCR:** The browser uses the **Tesseract.js** library (a task-specific AI model) to perform Optical Character Recognition directly on the user's machine.
3.  **Parse & Interpret:** A robust JavaScript parsing engine searches the extracted text for known biomarkers, extracts their values, and applies heuristics to correct common OCR errors (like missed decimal points).
4.  **Display:** The results are cross-referenced with an embedded knowledge base to provide simplified explanations and status indicators (Low, Normal, High) in a clean, readable table.

---

## 🚀 Tech Stack

* **Frontend:** HTML5, CSS3, Vanilla JavaScript (ES6+)
* **AI / OCR Model:** [Tesseract.js](https://tesseract.projectnaptha.com/)
* **Charting:** [Chart.js](https://www.chartjs.org/)
* **Styling:** [Pico.css](https://picocss.com/) for a clean, semantic layout.

---

## 🔮 Future Improvements

* **Multi-Language Support:** Integrate the existing translations for Hindi and Kannada to improve accessibility.
* **Expanded Biomarker Database:** Add more tests to the internal knowledge base.
* **Improved PDF Support:** While images are reliable, enhancing direct PDF processing would be a great addition.

---
