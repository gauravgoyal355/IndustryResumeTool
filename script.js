// Resume Tool JavaScript - Enhanced with Import, Editing, and PDF features
class ResumeBuilder {
    constructor() {
        this.experienceCount = 1;
        this.educationCount = 1;
        this.formData = {};
        this.editMode = false;
        
        this.init();
    }

    init() {
        this.bindEvents();
        this.setupFormValidation();
        this.setupImportFeatures();
        this.setupInlineEditing();
        this.loadFromLocalStorage();
    }

    bindEvents() {
        // Form submission
        document.getElementById('resume-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.generateResume();
        });

        // Add/Remove experience and education
        document.getElementById('add-experience').addEventListener('click', () => this.addExperience());
        document.getElementById('add-education').addEventListener('click', () => this.addEducation());

        // Download and print functionality
        document.getElementById('download-pdf').addEventListener('click', () => this.downloadPDF());
        document.getElementById('print-resume').addEventListener('click', () => this.printResume());

        // Real-time form updates
        document.getElementById('resume-form').addEventListener('input', () => {
            this.debounce(() => this.updatePreview(), 500)();
        });

        // Industry change handler
        document.getElementById('industry').addEventListener('change', () => {
            this.updateIndustryTheme();
        });

        // Current position checkbox handlers
        this.setupCurrentPositionHandlers();
        
        // Edit mode toggle
        document.getElementById('edit-mode-toggle').addEventListener('click', () => {
            this.toggleEditMode();
        });
    }

    setupImportFeatures() {
        // LinkedIn import
        document.getElementById('linkedin-import').addEventListener('click', () => {
            this.importFromLinkedIn();
        });

        // File upload
        const fileInput = document.getElementById('file-upload');
        const fileLabel = document.getElementById('file-input-label');
        
        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                this.handleFileUpload(e.target.files[0]);
            }
        });
        
        // Drag and drop functionality
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            fileLabel.addEventListener(eventName, this.preventDefaults, false);
            document.body.addEventListener(eventName, this.preventDefaults, false);
        });
        
        ['dragenter', 'dragover'].forEach(eventName => {
            fileLabel.addEventListener(eventName, () => {
                fileLabel.classList.add('dragover');
            }, false);
        });
        
        ['dragleave', 'drop'].forEach(eventName => {
            fileLabel.addEventListener(eventName, () => {
                fileLabel.classList.remove('dragover');
            }, false);
        });
        
        fileLabel.addEventListener('drop', (e) => {
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                this.handleFileUpload(files[0]);
            }
        }, false);

        // Manual entry toggle
        document.getElementById('manual-entry').addEventListener('click', () => {
            this.setImportMode('manual');
        });
    }
    
    preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    setupFormValidation() {
        const requiredFields = document.querySelectorAll('input[required], select[required]');
        requiredFields.forEach(field => {
            field.addEventListener('blur', (e) => this.validateField(e.target));
            field.addEventListener('input', (e) => this.clearFieldError(e.target));
        });
    }

    validateField(field) {
        const value = field.value.trim();
        
        // Remove existing error
        this.clearFieldError(field);
        
        if (!value && field.hasAttribute('required')) {
            this.showFieldError(field, 'This field is required');
            return false;
        }
        
        // Email validation
        if (field.type === 'email' && value && !this.isValidEmail(value)) {
            this.showFieldError(field, 'Please enter a valid email address');
            return false;
        }
        
        return true;
    }

    showFieldError(field, message) {
        const fieldGroup = field.closest('.form-group');
        let errorElement = fieldGroup.querySelector('.field-error');
        
        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.className = 'field-error';
            errorElement.style.color = '#dc3545';
            errorElement.style.fontSize = '12px';
            errorElement.style.marginTop = '5px';
            fieldGroup.appendChild(errorElement);
        }
        
        errorElement.textContent = message;
        field.style.borderColor = '#dc3545';
    }

    clearFieldError(field) {
        const fieldGroup = field.closest('.form-group');
        const errorElement = fieldGroup.querySelector('.field-error');
        
        if (errorElement) {
            errorElement.remove();
        }
        
        field.style.borderColor = '#e1e8ed';
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    setupCurrentPositionHandlers() {
        document.addEventListener('change', (e) => {
            if (e.target.type === 'checkbox' && e.target.name.includes('current')) {
                const number = e.target.name.replace('current', '');
                const endDateField = document.getElementById(`endDate${number}`);
                
                if (e.target.checked) {
                    endDateField.value = '';
                    endDateField.disabled = true;
                } else {
                    endDateField.disabled = false;
                }
            }
        });
    }

    addExperience() {
        this.experienceCount++;
        const experienceSection = document.getElementById('experience-section');
        
        const experienceHTML = `
            <div class="experience-item">
                <button type="button" class="remove-item" onclick="this.parentElement.remove()">×</button>
                <div class="form-row">
                    <div class="form-group">
                        <label for="jobTitle${this.experienceCount}">Job Title</label>
                        <input type="text" id="jobTitle${this.experienceCount}" name="jobTitle${this.experienceCount}">
                    </div>
                    <div class="form-group">
                        <label for="company${this.experienceCount}">Company</label>
                        <input type="text" id="company${this.experienceCount}" name="company${this.experienceCount}">
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label for="startDate${this.experienceCount}">Start Date</label>
                        <input type="month" id="startDate${this.experienceCount}" name="startDate${this.experienceCount}">
                    </div>
                    <div class="form-group">
                        <label for="endDate${this.experienceCount}">End Date</label>
                        <input type="month" id="endDate${this.experienceCount}" name="endDate${this.experienceCount}">
                        <label class="checkbox-label">
                            <input type="checkbox" id="current${this.experienceCount}" name="current${this.experienceCount}"> Current Position
                        </label>
                    </div>
                </div>
                <div class="form-group">
                    <label for="responsibilities${this.experienceCount}">Key Responsibilities & Achievements</label>
                    <textarea id="responsibilities${this.experienceCount}" name="responsibilities${this.experienceCount}" rows="3" placeholder="• Bullet point format recommended&#10;• Include quantifiable achievements&#10;• Focus on results and impact"></textarea>
                </div>
            </div>
        `;
        
        experienceSection.insertAdjacentHTML('beforeend', experienceHTML);
        
        // Add fade-in animation
        const newItem = experienceSection.lastElementChild;
        newItem.classList.add('fade-in');
    }

    addEducation() {
        this.educationCount++;
        const educationSection = document.getElementById('education-section');
        
        const educationHTML = `
            <div class="education-item">
                <button type="button" class="remove-item" onclick="this.parentElement.remove()">×</button>
                <div class="form-row">
                    <div class="form-group">
                        <label for="degree${this.educationCount}">Degree</label>
                        <input type="text" id="degree${this.educationCount}" name="degree${this.educationCount}" placeholder="e.g., Bachelor of Science">
                    </div>
                    <div class="form-group">
                        <label for="field${this.educationCount}">Field of Study</label>
                        <input type="text" id="field${this.educationCount}" name="field${this.educationCount}" placeholder="e.g., Computer Science">
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label for="school${this.educationCount}">School/University</label>
                        <input type="text" id="school${this.educationCount}" name="school${this.educationCount}">
                    </div>
                    <div class="form-group">
                        <label for="gradYear${this.educationCount}">Graduation Year</label>
                        <input type="number" id="gradYear${this.educationCount}" name="gradYear${this.educationCount}" min="1950" max="2030">
                    </div>
                </div>
            </div>
        `;
        
        educationSection.insertAdjacentHTML('beforeend', educationHTML);
        
        // Add fade-in animation
        const newItem = educationSection.lastElementChild;
        newItem.classList.add('fade-in');
    }

    collectFormData() {
        const form = document.getElementById('resume-form');
        const formData = new FormData(form);
        const data = {};
        
        // Basic information
        for (let [key, value] of formData.entries()) {
            data[key] = value;
        }
        
        // Collect experiences
        data.experiences = [];
        for (let i = 1; i <= this.experienceCount; i++) {
            const jobTitle = document.getElementById(`jobTitle${i}`)?.value || '';
            const company = document.getElementById(`company${i}`)?.value || '';
            const startDate = document.getElementById(`startDate${i}`)?.value || '';
            const endDate = document.getElementById(`endDate${i}`)?.value || '';
            const current = document.getElementById(`current${i}`)?.checked || false;
            const responsibilities = document.getElementById(`responsibilities${i}`)?.value || '';
            
            if (jobTitle || company) {
                data.experiences.push({
                    jobTitle,
                    company,
                    startDate,
                    endDate,
                    current,
                    responsibilities
                });
            }
        }
        
        // Collect education
        data.education = [];
        for (let i = 1; i <= this.educationCount; i++) {
            const degree = document.getElementById(`degree${i}`)?.value || '';
            const field = document.getElementById(`field${i}`)?.value || '';
            const school = document.getElementById(`school${i}`)?.value || '';
            const gradYear = document.getElementById(`gradYear${i}`)?.value || '';
            
            if (degree || school) {
                data.education.push({
                    degree,
                    field,
                    school,
                    gradYear
                });
            }
        }
        
        this.formData = data;
        return data;
    }

    generateResume() {
        // Collect data first
        const data = this.collectFormData();
        
        // Basic validation - only check for name and email
        if (!data.fullName || !data.email) {
            this.showNotification('Please enter your name and email before generating the resume.', 'error');
            return;
        }

        this.renderResume(data);
        this.saveToLocalStorage();
        this.showNotification('Resume generated successfully!', 'success');
        
        // Show action buttons
        document.getElementById('download-pdf').style.display = 'inline-flex';
        document.getElementById('print-resume').style.display = 'inline-flex';
    }

    validateForm() {
        // Simplified validation - only require name and email
        const fullName = document.getElementById('fullName').value.trim();
        const email = document.getElementById('email').value.trim();
        
        if (!fullName) {
            this.showFieldError(document.getElementById('fullName'), 'Name is required');
            return false;
        }
        
        if (!email) {
            this.showFieldError(document.getElementById('email'), 'Email is required');
            return false;
        }
        
        if (!this.isValidEmail(email)) {
            this.showFieldError(document.getElementById('email'), 'Please enter a valid email address');
            return false;
        }
        
        return true;
    }

    renderResume(data) {
        const preview = document.getElementById('resume-preview');
        const industry = data.industry || '';
        
        // Apply industry-specific styling
        preview.className = `industry-${industry}`;
        
        let html = `
            <div class="resume-header">
                <div class="resume-name">${data.fullName || ''}</div>
                ${data.email ? `<div class="resume-contact">${data.email}</div>` : ''}
                ${data.phone ? `<div class="resume-contact">${data.phone}</div>` : ''}
                ${data.location ? `<div class="resume-contact">${data.location}</div>` : ''}
                ${data.linkedin ? `<div class="resume-contact"><a href="${data.linkedin}" target="_blank">LinkedIn</a></div>` : ''}
                ${data.website ? `<div class="resume-contact"><a href="${data.website}" target="_blank">Portfolio</a></div>` : ''}
            </div>
        `;

        // Professional Summary
        if (data.summary) {
            html += `
                <div class="resume-section">
                    <h3>Professional Summary</h3>
                    <p>${data.summary}</p>
                </div>
            `;
        }

        // Experience
        if (data.experiences && data.experiences.length > 0) {
            html += `<div class="resume-section"><h3>Professional Experience</h3>`;
            
            data.experiences.forEach(exp => {
                if (exp.jobTitle || exp.company) {
                    const startDate = exp.startDate ? this.formatDate(exp.startDate) : '';
                    const endDate = exp.current ? 'Present' : (exp.endDate ? this.formatDate(exp.endDate) : '');
                    const dateRange = startDate && endDate ? `${startDate} - ${endDate}` : '';
                    
                    html += `
                        <div class="resume-job">
                            <div class="job-header">
                                <div>
                                    <div class="job-title">${exp.jobTitle}</div>
                                    <div class="job-company">${exp.company}</div>
                                </div>
                                <div class="job-dates">${dateRange}</div>
                            </div>
                            ${exp.responsibilities ? `
                                <div class="job-responsibilities">
                                    ${this.formatResponsibilities(exp.responsibilities)}
                                </div>
                            ` : ''}
                        </div>
                    `;
                }
            });
            
            html += '</div>';
        }

        // Education
        if (data.education && data.education.length > 0) {
            html += `<div class="resume-section"><h3>Education</h3>`;
            
            data.education.forEach(edu => {
                if (edu.degree || edu.school) {
                    html += `
                        <div class="resume-education">
                            <div class="education-header">
                                <div>
                                    <div class="degree-info">${edu.degree}${edu.field ? ` in ${edu.field}` : ''}</div>
                                    <div class="school-info">${edu.school}</div>
                                </div>
                                <div class="job-dates">${edu.gradYear || ''}</div>
                            </div>
                        </div>
                    `;
                }
            });
            
            html += '</div>';
        }

        // Core Competencies
        if (data.coreCompetencies) {
            const competencies = data.coreCompetencies.split(',').map(comp => comp.trim()).filter(comp => comp);
            if (competencies.length > 0) {
                html += `
                    <div class="resume-section">
                        <h3>Core Competencies</h3>
                        <div class="competencies-list">
                            ${competencies.map(comp => `<span class="competency-tag">${comp}</span>`).join('')}
                        </div>
                    </div>
                `;
            }
        }

        // Technical Skills
        if (data.computationalSkills || data.labSkills || data.invivo || data.otherSkills) {
            html += `<div class="resume-section"><h3>Technical Skills</h3>`;
            
            if (data.computationalSkills) {
                html += `
                    <div class="skill-category">
                        <strong>Computational:</strong> ${data.computationalSkills}
                    </div>
                `;
            }
            
            if (data.labSkills) {
                html += `
                    <div class="skill-category">
                        <strong>In Vitro:</strong> ${data.labSkills}
                    </div>
                `;
            }
            
            if (data.invivo) {
                html += `
                    <div class="skill-category">
                        <strong>In Vivo:</strong> ${data.invivo}
                    </div>
                `;
            }
            
            if (data.otherSkills) {
                html += `
                    <div class="skill-category">
                        <strong>Other:</strong> ${data.otherSkills}
                    </div>
                `;
            }
            
            html += '</div>';
        }

        // Publications
        if (data.publications) {
            html += `
                <div class="resume-section">
                    <h3>Selected Publications</h3>
                    <div class="publications-content">
                        ${this.formatPublications(data.publications)}
                        ${data.publicationsLink ? `<p class="publications-link"><a href="${data.publicationsLink}" target="_blank">View complete publication list</a></p>` : ''}
                    </div>
                </div>
            `;
        }

        // Presentations & Awards
        if (data.presentations || data.awards) {
            html += `<div class="resume-section"><h3>Presentations & Awards</h3>`;
            
            if (data.presentations) {
                html += `
                    <div class="presentations-section">
                        <strong>Selected Presentations:</strong><br>
                        ${this.formatPresentations(data.presentations)}
                    </div>
                `;
            }
            
            if (data.awards) {
                html += `
                    <div class="awards-section">
                        <strong>Awards & Honors:</strong><br>
                        ${data.awards}
                    </div>
                `;
            }
            
            html += '</div>';
        }

        // Certifications
        if (data.certifications) {
            html += `
                <div class="resume-section">
                    <h3>Certifications</h3>
                    <p>${data.certifications}</p>
                </div>
            `;
        }

        preview.innerHTML = html;
        preview.classList.add('fade-in');
    }

    formatDate(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString + '-01');
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
    }

    formatResponsibilities(text) {
        if (!text) return '';
        
        // Split by bullet points or line breaks
        const lines = text.split(/[•\n]/).map(line => line.trim()).filter(line => line);
        
        if (lines.length === 0) return '';
        
        return `<ul>${lines.map(line => `<li>${line}</li>`).join('')}</ul>`;
    }

    formatPublications(text) {
        if (!text) return '';
        
        // Split by line breaks and format as numbered list
        const pubs = text.split('\n').map(pub => pub.trim()).filter(pub => pub);
        
        if (pubs.length === 0) return '';
        
        return `<ol class="publications-list">${pubs.map(pub => `<li>${pub}</li>`).join('')}</ol>`;
    }

    formatPresentations(text) {
        if (!text) return '';
        
        // Split by line breaks and format as bulleted list
        const presentations = text.split('\n').map(pres => pres.trim()).filter(pres => pres);
        
        if (presentations.length === 0) return '';
        
        return `<ul class="presentations-list">${presentations.map(pres => `<li>${pres}</li>`).join('')}</ul>`;
    }

    updatePreview() {
        const data = this.collectFormData();
        if (data.fullName || data.email) {
            this.renderResume(data);
        }
    }

    findElementIndex(element, selector) {
        const elements = document.querySelectorAll(selector);
        return Array.from(elements).indexOf(element);
    }

    updateIndustryTheme() {
        const industry = document.getElementById('industry').value;
        const preview = document.getElementById('resume-preview');
        
        // Remove existing industry classes
        preview.className = preview.className.replace(/industry-\w+/g, '');
        
        // Add new industry class
        if (industry) {
            preview.classList.add(`industry-${industry}`);
        }
    }

    downloadPDF() {
        const resumeContent = document.getElementById('resume-preview');
        
        if (resumeContent.innerHTML.includes('Fill out the form')) {
            this.showNotification('Please generate a resume first before downloading.', 'error');
            return;
        }
        
        this.showNotification('Generating PDF... Please wait.', 'info');
        
        // Add a small delay to show the loading message
        setTimeout(() => {
            this.generatePDF();
        }, 100);
    }

    generatePDF() {
        try {
            // Check if jsPDF is available
            if (typeof window.jsPDF === 'undefined') {
                this.fallbackToPrint();
                return;
            }
            
            const { jsPDF } = window.jsPDF;
            const doc = new jsPDF('p', 'mm', 'a4');
            
            // Page settings
            const pageWidth = 210; // A4 width in mm
            const pageHeight = 297; // A4 height in mm
            const margin = 20;
            const contentWidth = pageWidth - (margin * 2);
            let currentY = margin;
            
            // Get the resume data
            const data = this.formData;
            
            // Helper function to check if we need a new page
            const checkPageBreak = (neededSpace) => {
                if (currentY + neededSpace > pageHeight - margin) {
                    doc.addPage();
                    currentY = margin;
                }
            };
            
            // Helper function to add text with proper wrapping
            const addText = (text, x, y, options = {}) => {
                const {
                    fontSize = 10,
                    fontStyle = 'normal',
                    maxWidth = contentWidth,
                    lineHeight = 6,
                    align = 'left'
                } = options;
                
                doc.setFontSize(fontSize);
                doc.setFont('helvetica', fontStyle);
                
                if (text.length === 0) return y;
                
                const lines = doc.splitTextToSize(text, maxWidth);
                
                if (Array.isArray(lines)) {
                    lines.forEach((line, index) => {
                        if (align === 'center') {
                            doc.text(line, pageWidth / 2, y + (index * lineHeight), { align: 'center' });
                        } else {
                            doc.text(line, x, y + (index * lineHeight));
                        }
                    });
                    return y + (lines.length * lineHeight);
                } else {
                    if (align === 'center') {
                        doc.text(lines, pageWidth / 2, y, { align: 'center' });
                    } else {
                        doc.text(lines, x, y);
                    }
                    return y + lineHeight;
                }
            };
            
            // Header
            if (data.fullName) {
                checkPageBreak(30);
                currentY = addText(data.fullName, margin, currentY, {
                    fontSize: 20,
                    fontStyle: 'bold',
                    align: 'center'
                });
                currentY += 5;
            }
            
            // Contact information
            const contactInfo = [];
            if (data.email) contactInfo.push(data.email);
            if (data.phone) contactInfo.push(data.phone);
            if (data.location) contactInfo.push(data.location);
            if (data.linkedin) contactInfo.push(data.linkedin);
            if (data.website) contactInfo.push(data.website);
            
            if (contactInfo.length > 0) {
                currentY = addText(contactInfo.join(' | '), margin, currentY, {
                    fontSize: 10,
                    align: 'center'
                });
                currentY += 10;
            }
            
            // Add horizontal line
            doc.setDrawColor(59, 130, 246); // Blue color
            doc.setLineWidth(0.5);
            doc.line(margin, currentY, pageWidth - margin, currentY);
            currentY += 10;
            
            // Professional Summary
            if (data.summary) {
                checkPageBreak(25);
                currentY = addText('PROFESSIONAL SUMMARY', margin, currentY, {
                    fontSize: 12,
                    fontStyle: 'bold'
                });
                currentY += 3;
                currentY = addText(data.summary, margin, currentY, {
                    fontSize: 10,
                    lineHeight: 5
                });
                currentY += 8;
            }
            
            // Core Competencies
            if (data.coreCompetencies) {
                checkPageBreak(20);
                currentY = addText('CORE COMPETENCIES', margin, currentY, {
                    fontSize: 12,
                    fontStyle: 'bold'
                });
                currentY += 3;
                
                const competencies = data.coreCompetencies.split(',').map(comp => comp.trim()).filter(comp => comp);
                const competencyText = competencies.join(' • ');
                currentY = addText(competencyText, margin, currentY, {
                    fontSize: 10,
                    lineHeight: 5
                });
                currentY += 8;
            }
            
            // Professional Experience
            if (data.experiences && data.experiences.length > 0) {
                checkPageBreak(25);
                currentY = addText('PROFESSIONAL EXPERIENCE', margin, currentY, {
                    fontSize: 12,
                    fontStyle: 'bold'
                });
                currentY += 5;
                
                data.experiences.forEach((exp, index) => {
                    if (exp.jobTitle || exp.company) {
                        checkPageBreak(30);
                        
                        // Job title and dates on same line
                        if (exp.jobTitle) {
                            doc.setFontSize(11);
                            doc.setFont('helvetica', 'bold');
                            doc.text(exp.jobTitle, margin, currentY);
                            
                            // Add dates on the right
                            const startDate = exp.startDate ? this.formatDate(exp.startDate) : '';
                            const endDate = exp.current ? 'Present' : (exp.endDate ? this.formatDate(exp.endDate) : '');
                            const dateRange = startDate && endDate ? `${startDate} - ${endDate}` : '';
                            
                            if (dateRange) {
                                doc.setFont('helvetica', 'normal');
                                doc.setFontSize(10);
                                doc.text(dateRange, pageWidth - margin, currentY, { align: 'right' });
                            }
                            currentY += 5;
                        }
                        
                        // Company
                        if (exp.company) {
                            currentY = addText(exp.company, margin, currentY, {
                                fontSize: 10,
                                fontStyle: 'italic'
                            });
                            currentY += 2;
                        }
                        
                        // Responsibilities
                        if (exp.responsibilities) {
                            const responsibilities = exp.responsibilities.split(/[•\n]/).map(resp => resp.trim()).filter(resp => resp);
                            responsibilities.forEach(resp => {
                                if (resp) {
                                    checkPageBreak(8);
                                    currentY = addText('• ' + resp, margin + 5, currentY, {
                                        fontSize: 10,
                                        lineHeight: 4
                                    });
                                    currentY += 1;
                                }
                            });
                        }
                        
                        currentY += 5;
                    }
                });
            }
            
            // Education
            if (data.education && data.education.length > 0) {
                checkPageBreak(25);
                currentY = addText('EDUCATION', margin, currentY, {
                    fontSize: 12,
                    fontStyle: 'bold'
                });
                currentY += 5;
                
                data.education.forEach(edu => {
                    if (edu.degree || edu.school) {
                        checkPageBreak(15);
                        
                        // Degree and year on same line
                        const degreeText = edu.degree + (edu.field ? ` in ${edu.field}` : '');
                        doc.setFontSize(11);
                        doc.setFont('helvetica', 'bold');
                        doc.text(degreeText, margin, currentY);
                        
                        if (edu.gradYear) {
                            doc.setFont('helvetica', 'normal');
                            doc.setFontSize(10);
                            doc.text(edu.gradYear.toString(), pageWidth - margin, currentY, { align: 'right' });
                        }
                        currentY += 5;
                        
                        // School
                        if (edu.school) {
                            currentY = addText(edu.school, margin, currentY, {
                                fontSize: 10,
                                fontStyle: 'italic'
                            });
                        }
                        
                        currentY += 8;
                    }
                });
            }
            
            // Technical Skills
            const skillsSections = [
                { title: 'Computational', content: data.computationalSkills },
                { title: 'In Vitro', content: data.labSkills },
                { title: 'In Vivo', content: data.invivo },
                { title: 'Other', content: data.otherSkills }
            ].filter(section => section.content);
            
            if (skillsSections.length > 0) {
                checkPageBreak(25);
                currentY = addText('TECHNICAL SKILLS', margin, currentY, {
                    fontSize: 12,
                    fontStyle: 'bold'
                });
                currentY += 5;
                
                skillsSections.forEach(section => {
                    checkPageBreak(10);
                    const skillText = `${section.title}: ${section.content}`;
                    currentY = addText(skillText, margin, currentY, {
                        fontSize: 10,
                        lineHeight: 5
                    });
                    currentY += 3;
                });
                currentY += 5;
            }
            
            // Publications
            if (data.publications) {
                checkPageBreak(25);
                currentY = addText('SELECTED PUBLICATIONS', margin, currentY, {
                    fontSize: 12,
                    fontStyle: 'bold'
                });
                currentY += 5;
                
                const publications = data.publications.split('\n').map(pub => pub.trim()).filter(pub => pub);
                publications.forEach((pub, index) => {
                    checkPageBreak(15);
                    currentY = addText(`${index + 1}. ${pub}`, margin, currentY, {
                        fontSize: 10,
                        lineHeight: 5
                    });
                    currentY += 3;
                });
                
                if (data.publicationsLink) {
                    currentY += 2;
                    currentY = addText(`Complete publication list: ${data.publicationsLink}`, margin, currentY, {
                        fontSize: 9,
                        fontStyle: 'italic'
                    });
                }
                currentY += 8;
            }
            
            // Presentations & Awards
            if (data.presentations || data.awards) {
                checkPageBreak(25);
                currentY = addText('PRESENTATIONS & AWARDS', margin, currentY, {
                    fontSize: 12,
                    fontStyle: 'bold'
                });
                currentY += 5;
                
                if (data.presentations) {
                    currentY = addText('Selected Presentations:', margin, currentY, {
                        fontSize: 10,
                        fontStyle: 'bold'
                    });
                    currentY += 2;
                    
                    const presentations = data.presentations.split('\n').map(pres => pres.trim()).filter(pres => pres);
                    presentations.forEach(pres => {
                        checkPageBreak(8);
                        currentY = addText('• ' + pres, margin + 5, currentY, {
                            fontSize: 10,
                            lineHeight: 4
                        });
                    });
                    currentY += 5;
                }
                
                if (data.awards) {
                    currentY = addText('Awards & Honors:', margin, currentY, {
                        fontSize: 10,
                        fontStyle: 'bold'
                    });
                    currentY += 2;
                    currentY = addText(data.awards, margin + 5, currentY, {
                        fontSize: 10,
                        lineHeight: 5
                    });
                    currentY += 8;
                }
            }
            
            // Certifications
            if (data.certifications) {
                checkPageBreak(20);
                currentY = addText('CERTIFICATIONS', margin, currentY, {
                    fontSize: 12,
                    fontStyle: 'bold'
                });
                currentY += 5;
                currentY = addText(data.certifications, margin, currentY, {
                    fontSize: 10,
                    lineHeight: 5
                });
            }
            
            // Generate filename
            const fileName = data.fullName ? 
                `${data.fullName.replace(/[^a-zA-Z0-9]/g, '_')}_Resume.pdf` : 
                'Resume.pdf';
            
            // Save the PDF
            doc.save(fileName);
            
            this.showNotification(`PDF downloaded successfully as ${fileName}!`, 'success');
            
        } catch (error) {
            console.error('Error generating PDF:', error);
            this.showNotification('Error generating PDF. Falling back to print option.', 'error');
            this.fallbackToPrint();
        }
    }
    
    fallbackToPrint() {
        const resumeContent = document.getElementById('resume-preview');
        
        // Create a new window for printing
        const printWindow = window.open('', '', 'height=800,width=1200');
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Resume</title>
                <style>
                    body { font-family: 'Inter', sans-serif; margin: 0; padding: 20px; }
                    .resume-preview { max-width: 800px; margin: 0 auto; }
                    .resume-header { text-align: center; border-bottom: 3px solid #3b82f6; padding-bottom: 20px; margin-bottom: 25px; }
                    .resume-name { font-size: 2.2rem; font-weight: 700; margin-bottom: 10px; }
                    .resume-contact { font-size: 1rem; color: #666; margin-bottom: 5px; }
                    .resume-section { margin-bottom: 25px; }
                    .resume-section h3 { font-size: 1.3rem; font-weight: 700; color: #3b82f6; border-bottom: 1px solid #ccc; padding-bottom: 5px; margin-bottom: 15px; text-transform: uppercase; letter-spacing: 1px; }
                    .job-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px; }
                    .job-title { font-weight: 700; font-size: 1.1rem; }
                    .job-company { font-style: italic; color: #666; margin-top: 2px; }
                    .job-dates { font-size: 0.9rem; color: #666; }
                    .job-responsibilities ul { margin: 0; padding-left: 20px; }
                    .job-responsibilities li { margin-bottom: 4px; color: #444; }
                    .competency-tag, .skill-tag { background: #f0f2f5; padding: 6px 12px; border-radius: 20px; font-size: 0.9rem; color: #3b82f6; border: 1px solid #e1e8ed; margin: 2px; display: inline-block; }
                    .skill-category { margin-bottom: 12px; line-height: 1.5; }
                    .skill-category strong { color: #333; margin-right: 8px; }
                    @media print { body { margin: 0; } .resume-preview { box-shadow: none; border: none; } }
                </style>
            </head>
            <body>
                <div class="resume-preview">${resumeContent.innerHTML}</div>
            </body>
            </html>
        `);
        printWindow.document.close();
        
        // Wait for content to load, then print
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 250);
        
        this.showNotification('Resume is being prepared for download. Use "Save as PDF" in the print dialog.', 'info');
    }

    printResume() {
        const resumeContent = document.getElementById('resume-preview');
        
        if (resumeContent.innerHTML.includes('Fill out the form')) {
            this.showNotification('Please generate a resume first before printing.', 'error');
            return;
        }
        
        this.fallbackToPrint();
    }

    saveToLocalStorage() {
        try {
            const data = this.collectFormData();
            // Store data in memory instead of localStorage for Claude.ai compatibility
            this.savedFormData = data;
        } catch (error) {
            console.warn('Could not save form data:', error);
        }
    }

    loadFromLocalStorage() {
        try {
            // In a real implementation, you would load from localStorage
            // For Claude.ai compatibility, we'll just initialize empty
            this.savedFormData = null;
        } catch (error) {
            console.warn('Could not load form data:', error);
        }
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span>${message}</span>
                <button class="notification-close" onclick="this.parentElement.parentElement.remove()">&times;</button>
            </div>
        `;
        
        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            z-index: 1000;
            animation: slideIn 0.3s ease;
            max-width: 400px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        `;
        
        // Set background color based on type
        const colors = {
            success: '#28a745',
            error: '#dc3545',
            info: '#17a2b8',
            warning: '#ffc107'
        };
        
        notification.style.backgroundColor = colors[type] || colors.info;
        
        // Add to page
        document.body.appendChild(notification);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Industry-specific resume tips for PhD/Postdoc transitions
    getIndustryTips(industry) {
        const tips = {
            biotechnology: [
                'Emphasize research experience with industry-relevant applications',
                'Highlight experience with drug discovery, biomarker development, or therapeutic targets',
                'Include experience with regulatory processes (IND, clinical trials)',
                'Mention collaboration with industry partners or technology transfer'
            ],
            pharmaceuticals: [
                'Focus on drug development experience and clinical research',
                'Highlight experience with GLP/GCP compliance and regulatory submissions',
                'Include pharmacokinetics, toxicology, or clinical trial experience',
                'Emphasize project management and cross-functional team leadership'
            ],
            technology: [
                'Translate computational research into software development language',
                'Highlight data analysis, machine learning, and programming skills',
                'Include experience with large datasets and statistical modeling',
                'Mention any software tools, platforms, or algorithms developed'
            ],
            consulting: [
                'Emphasize problem-solving methodology and analytical thinking',
                'Highlight project management and client communication skills',
                'Include experience presenting to diverse audiences',
                'Focus on quantifiable results and business impact of research'
            ],
            finance: [
                'Highlight quantitative analysis and statistical modeling experience',
                'Include experience with financial modeling or risk assessment',
                'Emphasize data-driven decision making and analytical rigor',
                'Mention any experience with economic analysis or market research'
            ],
            healthcare: [
                'Focus on clinical relevance and patient impact of research',
                'Highlight experience with medical devices, diagnostics, or therapeutics',
                'Include knowledge of regulatory requirements (FDA, EMA)',
                'Emphasize collaboration with clinicians and healthcare professionals'
            ],
            government: [
                'Highlight policy-relevant research and public health impact',
                'Include experience with grant writing and federal funding',
                'Emphasize science communication and stakeholder engagement',
                'Mention any experience with government agencies or advisory committees'
            ],
            regulatory: [
                'Focus on experience with regulatory guidelines and compliance',
                'Highlight attention to detail and documentation skills',
                'Include experience with clinical trials and safety assessments',
                'Emphasize understanding of drug development processes'
            ],
            marketing: [
                'Highlight science communication and technical writing skills',
                'Include experience presenting complex data to non-technical audiences',
                'Emphasize market research and competitive analysis experience',
                'Mention any experience with product positioning or commercialization'
            ]
        };
        
        return tips[industry] || [
            'Use action verbs to describe your accomplishments',
            'Quantify your achievements with specific numbers and metrics',
            'Tailor your resume to match the job description',
            'Keep descriptions concise but impactful'
        ];
    }

    // Inline editing methods
    setupInlineEditing() {
        // Set up event delegation for dynamically added content
        const preview = document.getElementById('resume-preview');
        
        // Add CSS for editing indicators
        this.addEditingStyles();
        
        // Listen for clicks on editable elements when edit mode is active
        preview.addEventListener('click', (e) => {
            if (this.editMode && this.isEditableElement(e.target)) {
                this.startEditing(e.target);
                e.preventDefault();
                e.stopPropagation();
            }
        });
        
        // Listen for clicks outside to save changes
        document.addEventListener('click', (e) => {
            if (this.editMode && !preview.contains(e.target)) {
                this.finishAllEditing();
            }
        });
    }
    
    addEditingStyles() {
        if (document.getElementById('inline-editing-styles')) return;
        
        const styles = document.createElement('style');
        styles.id = 'inline-editing-styles';
        styles.textContent = `
            /* Inline editing styles */
            .resume-preview[data-edit-mode="true"] .editable {
                border: 2px dashed transparent;
                border-radius: 4px;
                padding: 2px 4px;
                margin: -2px -4px;
                transition: all 0.2s ease;
                cursor: pointer;
                position: relative;
            }
            
            .resume-preview[data-edit-mode="true"] .editable:hover {
                border-color: #3b82f6;
                background-color: rgba(59, 130, 246, 0.05);
            }
            
            .resume-preview[data-edit-mode="true"] .editable.editing {
                border-color: #10b981;
                background-color: rgba(16, 185, 129, 0.1);
                box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.2);
            }
            
            .resume-preview[data-edit-mode="true"] .editable:hover::after {
                content: "✏️ Click to edit";
                position: absolute;
                top: -25px;
                left: 0;
                background: #374151;
                color: white;
                padding: 2px 6px;
                border-radius: 4px;
                font-size: 10px;
                white-space: nowrap;
                z-index: 1000;
                opacity: 0.9;
            }
            
            .editing-toolbar {
                position: fixed;
                top: 10px;
                right: 10px;
                background: white;
                border: 1px solid #e1e8ed;
                border-radius: 8px;
                padding: 8px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                z-index: 1001;
                display: flex;
                gap: 8px;
                align-items: center;
                font-size: 12px;
            }
            
            .editing-toolbar button {
                padding: 4px 8px;
                border: 1px solid #cbd5e1;
                border-radius: 4px;
                background: white;
                cursor: pointer;
                font-size: 11px;
                transition: all 0.2s ease;
            }
            
            .editing-toolbar button:hover {
                background: #f1f5f9;
                border-color: #3b82f6;
            }
            
            .edit-field {
                border: 2px solid #10b981;
                border-radius: 4px;
                padding: 4px 6px;
                font-family: inherit;
                font-size: inherit;
                font-weight: inherit;
                background: white;
                box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.2);
                outline: none;
                min-width: 100px;
                resize: both;
            }
            
            .edit-field:focus {
                box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.3);
            }
            
            .resume-preview[data-edit-mode="false"] .editable {
                border: none !important;
                background: transparent !important;
                cursor: default;
            }
            
            .resume-preview[data-edit-mode="false"] .editable::after {
                display: none !important;
            }
        `;
        
        document.head.appendChild(styles);
    }
    
    isEditableElement(element) {
        const editableSelectors = [
            '.resume-name',
            '.resume-contact',
            '.job-title',
            '.job-company',
            '.job-responsibilities li',
            '.degree-info',
            '.school-info',
            '.skill-category',
            '.resume-section p',
            '.competency-tag',
            '.publications-list li',
            '.presentations-list li'
        ];
        
        return editableSelectors.some(selector => {
            return element.matches(selector) || element.closest(selector);
        });
    }
    
    startEditing(element) {
        // Prevent multiple edits
        if (element.classList.contains('editing') || element.querySelector('.edit-field')) {
            return;
        }
        
        // Finish any other editing first
        this.finishAllEditing();
        
        element.classList.add('editing');
        
        const originalText = element.textContent.trim();
        const isMultiline = originalText.length > 100 || originalText.includes('\n');
        
        // Create editing field
        const editField = document.createElement(isMultiline ? 'textarea' : 'input');
        editField.className = 'edit-field';
        editField.value = originalText;
        
        if (isMultiline) {
            editField.rows = Math.max(2, Math.ceil(originalText.length / 80));
            editField.style.width = '100%';
            editField.style.minHeight = '60px';
        } else {
            editField.style.width = Math.max(150, originalText.length * 8) + 'px';
        }
        
        // Store original content and element reference
        editField.originalText = originalText;
        editField.originalElement = element;
        
        // Replace element content
        element.innerHTML = '';
        element.appendChild(editField);
        
        // Focus and select text
        editField.focus();
        editField.select();
        
        // Show editing toolbar
        this.showEditingToolbar(editField);
        
        // Handle save/cancel events
        editField.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey && !isMultiline) {
                e.preventDefault();
                this.saveEdit(editField);
            } else if (e.key === 'Escape') {
                e.preventDefault();
                this.cancelEdit(editField);
            } else if (e.key === 'Enter' && e.ctrlKey && isMultiline) {
                e.preventDefault();
                this.saveEdit(editField);
            }
        });
        
        editField.addEventListener('blur', () => {
            // Small delay to allow toolbar button clicks
            setTimeout(() => {
                if (document.activeElement !== editField && !this.isToolbarFocused()) {
                    this.saveEdit(editField);
                }
            }, 100);
        });
    }
    
    showEditingToolbar(editField) {
        // Remove existing toolbar
        this.hideEditingToolbar();
        
        const toolbar = document.createElement('div');
        toolbar.className = 'editing-toolbar';
        toolbar.innerHTML = `
            <span>Editing:</span>
            <button type="button" data-action="save">
                <i data-lucide="check" style="width: 14px; height: 14px;"></i> Save
            </button>
            <button type="button" data-action="cancel">
                <i data-lucide="x" style="width: 14px; height: 14px;"></i> Cancel
            </button>
            <span style="font-size: 10px; color: #6b7280;">Enter to save, Esc to cancel</span>
        `;
        
        // Handle toolbar actions
        toolbar.addEventListener('click', (e) => {
            const action = e.target.closest('[data-action]')?.dataset.action;
            if (action === 'save') {
                this.saveEdit(editField);
            } else if (action === 'cancel') {
                this.cancelEdit(editField);
            }
        });
        
        document.body.appendChild(toolbar);
        
        // Initialize icons
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }
    
    hideEditingToolbar() {
        const toolbar = document.querySelector('.editing-toolbar');
        if (toolbar) {
            toolbar.remove();
        }
    }
    
    isToolbarFocused() {
        const toolbar = document.querySelector('.editing-toolbar');
        return toolbar && toolbar.contains(document.activeElement);
    }
    
    saveEdit(editField) {
        const newText = editField.value.trim();
        const element = editField.originalElement;
        
        if (newText !== editField.originalText) {
            // Update the element content
            element.innerHTML = newText;
            element.classList.remove('editing');
            
            // Update the corresponding form field
            this.updateFormField(element, newText);
            
            // Update the stored form data
            this.collectFormData();
            
            this.showNotification('Changes saved successfully!', 'success');
        } else {
            // No changes, just restore
            element.innerHTML = editField.originalText;
            element.classList.remove('editing');
        }
        
        this.hideEditingToolbar();
    }
    
    cancelEdit(editField) {
        const element = editField.originalElement;
        
        // Restore original content
        element.innerHTML = editField.originalText;
        element.classList.remove('editing');
        
        this.hideEditingToolbar();
        this.showNotification('Edit cancelled', 'info');
    }
    
    finishAllEditing() {
        const editingElements = document.querySelectorAll('.editing');
        editingElements.forEach(element => {
            const editField = element.querySelector('.edit-field');
            if (editField) {
                this.saveEdit(editField);
            }
        });
    }
    
    updateFormField(element, newText) {
        // Map resume elements to form fields
        const fieldMappings = {
            'resume-name': 'fullName',
            'job-title': 'jobTitle',
            'job-company': 'company',
            'degree-info': 'degree',
            'school-info': 'school'
        };
        
        // Find the field mapping
        let fieldId = null;
        let elementIndex = -1;
        
        for (const [className, baseFieldId] of Object.entries(fieldMappings)) {
            if (element.classList.contains(className)) {
                fieldId = baseFieldId;
                
                // For repeating fields (experience, education), find the index
                if (['jobTitle', 'company', 'degree', 'school'].includes(baseFieldId)) {
                    elementIndex = this.findElementIndex(element, `.${className}`);
                    fieldId = `${baseFieldId}${elementIndex + 1}`;
                }
                break;
            }
        }
        
        // Handle special cases
        if (element.classList.contains('resume-contact')) {
            // Determine which contact field this is
            const contactElements = document.querySelectorAll('.resume-contact');
            const index = Array.from(contactElements).indexOf(element);
            const contactFields = ['email', 'phone', 'location', 'linkedin', 'website'];
            fieldId = contactFields[index] || null;
        } else if (element.classList.contains('job-responsibilities')) {
            const parentJob = element.closest('.resume-job');
            if (parentJob) {
                const jobIndex = this.findElementIndex(parentJob, '.resume-job');
                fieldId = `responsibilities${jobIndex + 1}`;
            }
        } else if (element.closest('.resume-section')) {
            const section = element.closest('.resume-section');
            const sectionTitle = section.querySelector('h3')?.textContent?.toLowerCase();
            
            if (sectionTitle?.includes('summary')) {
                fieldId = 'summary';
            } else if (sectionTitle?.includes('competencies')) {
                fieldId = 'coreCompetencies';
            } else if (sectionTitle?.includes('skills')) {
                // Determine which skill category
                if (element.textContent.toLowerCase().includes('computational')) {
                    fieldId = 'computationalSkills';
                } else if (element.textContent.toLowerCase().includes('vitro')) {
                    fieldId = 'labSkills';
                } else if (element.textContent.toLowerCase().includes('vivo')) {
                    fieldId = 'invivo';
                } else {
                    fieldId = 'otherSkills';
                }
            } else if (sectionTitle?.includes('publications')) {
                fieldId = 'publications';
            } else if (sectionTitle?.includes('presentations')) {
                fieldId = 'presentations';
            } else if (sectionTitle?.includes('awards')) {
                fieldId = 'awards';
            } else if (sectionTitle?.includes('certifications')) {
                fieldId = 'certifications';
            }
        }
        
        // Update the form field if found
        if (fieldId) {
            const formField = document.getElementById(fieldId);
            if (formField) {
                if (fieldId.includes('Skills') || fieldId === 'coreCompetencies') {
                    // For skills, extract just the content after the colon
                    const colonIndex = newText.indexOf(':');
                    if (colonIndex !== -1) {
                        formField.value = newText.substring(colonIndex + 1).trim();
                    } else {
                        formField.value = newText;
                    }
                } else {
                    formField.value = newText;
                }
                
                // Trigger input event to update preview
                formField.dispatchEvent(new Event('input', { bubbles: true }));
            }
        }
    }

    toggleEditMode() {
        this.editMode = !this.editMode;
        const preview = document.getElementById('resume-preview');
        const toggle = document.getElementById('edit-mode-toggle');
        const indicator = document.getElementById('edit-mode-indicator');
        
        if (this.editMode) {
            preview.setAttribute('data-edit-mode', 'true');
            toggle.querySelector('span').textContent = 'Disable Editing';
            toggle.querySelector('i').setAttribute('data-lucide', 'edit-off');
            indicator.style.display = 'flex';
            this.makeElementsEditable();
        } else {
            preview.setAttribute('data-edit-mode', 'false');
            toggle.querySelector('span').textContent = 'Enable Editing';
            toggle.querySelector('i').setAttribute('data-lucide', 'edit-2');
            indicator.style.display = 'none';
            this.disableEditing();
        }
        
        // Reinitialize icons
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }

    makeElementsEditable() {
        const preview = document.getElementById('resume-preview');
        const editableElements = preview.querySelectorAll(
            '.resume-name, .resume-contact, .job-title, .job-company, .job-responsibilities li, ' +
            '.degree-info, .school-info, .skill-category, .resume-section p, ' +
            '.competency-tag, .publications-list li, .presentations-list li'
        );
        
        editableElements.forEach(element => {
            element.classList.add('editable');
        });
    }

    disableEditing() {
        const preview = document.getElementById('resume-preview');
        const editableElements = preview.querySelectorAll('.editable');
        
        editableElements.forEach(element => {
            element.classList.remove('editable', 'editing');
        });
        
        // Finish any active editing
        this.finishAllEditing();
        this.hideEditingToolbar();
    }



    // Import methods
    importFromLinkedIn() {
        this.showLinkedInImportModal();
    }

    showLinkedInImportModal() {
        // Create modal overlay
        const modal = document.createElement('div');
        modal.className = 'linkedin-import-modal';
        modal.innerHTML = `
            <div class="modal-overlay" onclick="this.parentElement.remove()">
                <div class="modal-content" onclick="event.stopPropagation()">
                    <div class="modal-header">
                        <h3><i data-lucide="linkedin" style="width: 20px; height: 20px; margin-right: 8px;"></i>Import from LinkedIn</h3>
                        <button class="modal-close" onclick="this.closest('.linkedin-import-modal').remove()">&times;</button>
                    </div>
                    
                    <div class="modal-body">
                        <div class="import-instructions">
                            <h4>📋 How to Import Your LinkedIn Profile:</h4>
                            <ol>
                                <li><strong>Open LinkedIn:</strong> Go to <a href="https://www.linkedin.com/in/me" target="_blank">your LinkedIn profile</a> in a new tab</li>
                                <li><strong>Copy Information:</strong> Select and copy the relevant sections from your profile</li>
                                <li><strong>Paste Here:</strong> Use the form below to paste your information</li>
                                <li><strong>Auto-Fill:</strong> Click "Import to Form" to populate the resume builder</li>
                            </ol>
                        </div>
                        
                        <div class="linkedin-form">
                            <div class="form-group">
                                <label for="li-name">Full Name</label>
                                <input type="text" id="li-name" placeholder="e.g., Dr. Sarah Chen">
                            </div>
                            
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="li-email">Email</label>
                                    <input type="email" id="li-email" placeholder="your.email@example.com">
                                </div>
                                <div class="form-group">
                                    <label for="li-phone">Phone</label>
                                    <input type="tel" id="li-phone" placeholder="(555) 123-4567">
                                </div>
                            </div>
                            
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="li-location">Location</label>
                                    <input type="text" id="li-location" placeholder="Boston, MA">
                                </div>
                                <div class="form-group">
                                    <label for="li-linkedin">LinkedIn URL</label>
                                    <input type="url" id="li-linkedin" placeholder="https://linkedin.com/in/yourname">
                                </div>
                            </div>
                            
                            <div class="form-group">
                                <label for="li-headline">LinkedIn Headline</label>
                                <input type="text" id="li-headline" placeholder="PhD Scientist | Drug Discovery | Molecular Biology">
                            </div>
                            
                            <div class="form-group">
                                <label for="li-about">About Section</label>
                                <textarea id="li-about" rows="4" placeholder="Paste your LinkedIn About section here..."></textarea>
                            </div>
                            
                            <div class="form-group">
                                <label for="li-experience">Experience Section</label>
                                <textarea id="li-experience" rows="6" placeholder="Paste your LinkedIn experience entries here (one job per paragraph)..."></textarea>
                                <small>💡 Tip: Copy each job as a separate paragraph. Include job title, company, dates, and responsibilities.</small>
                            </div>
                            
                            <div class="form-group">
                                <label for="li-education">Education Section</label>
                                <textarea id="li-education" rows="4" placeholder="Paste your LinkedIn education entries here..."></textarea>
                            </div>
                            
                            <div class="form-group">
                                <label for="li-skills">Skills Section</label>
                                <textarea id="li-skills" rows="3" placeholder="Paste your LinkedIn skills here (comma-separated)..."></textarea>
                            </div>
                        </div>
                    </div>
                    
                    <div class="modal-footer">
                        <button class="btn-secondary" onclick="this.closest('.linkedin-import-modal').remove()">Cancel</button>
                        <button class="btn-primary" onclick="resumeBuilder.processLinkedInImport()">Import to Form</button>
                        <button class="btn-import" onclick="resumeBuilder.loadSampleLinkedInData()">Load Sample Data</button>
                    </div>
                </div>
            </div>
        `;
        
        // Add modal styles
        this.addModalStyles();
        
        // Add to page
        document.body.appendChild(modal);
        
        // Initialize icons
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
        
        // Focus first input
        setTimeout(() => {
            document.getElementById('li-name').focus();
        }, 100);
    }
    
    addModalStyles() {
        if (document.getElementById('linkedin-modal-styles')) return;
        
        const styles = document.createElement('style');
        styles.id = 'linkedin-modal-styles';
        styles.textContent = `
            .linkedin-import-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 10000;
                animation: fadeIn 0.3s ease;
            }
            
            .modal-overlay {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 20px;
            }
            
            .modal-content {
                background: white;
                border-radius: 12px;
                max-width: 800px;
                width: 100%;
                max-height: 90vh;
                overflow-y: auto;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                animation: slideUp 0.3s ease;
            }
            
            .modal-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 20px 24px;
                border-bottom: 1px solid #e1e8ed;
                background: linear-gradient(135deg, #0077b5, #005885);
                color: white;
                border-radius: 12px 12px 0 0;
            }
            
            .modal-header h3 {
                margin: 0;
                display: flex;
                align-items: center;
                font-size: 1.2rem;
            }
            
            .modal-close {
                background: none;
                border: none;
                color: white;
                font-size: 24px;
                cursor: pointer;
                padding: 0;
                width: 30px;
                height: 30px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: background-color 0.2s;
            }
            
            .modal-close:hover {
                background-color: rgba(255, 255, 255, 0.2);
            }
            
            .modal-body {
                padding: 24px;
            }
            
            .import-instructions {
                background: #f8f9fa;
                border: 1px solid #e9ecef;
                border-radius: 8px;
                padding: 20px;
                margin-bottom: 24px;
            }
            
            .import-instructions h4 {
                margin: 0 0 16px 0;
                color: #0077b5;
                font-size: 1.1rem;
            }
            
            .import-instructions ol {
                margin: 0;
                padding-left: 20px;
            }
            
            .import-instructions li {
                margin-bottom: 8px;
                line-height: 1.5;
            }
            
            .import-instructions a {
                color: #0077b5;
                text-decoration: none;
                font-weight: 500;
            }
            
            .import-instructions a:hover {
                text-decoration: underline;
            }
            
            .linkedin-form .form-group {
                margin-bottom: 16px;
            }
            
            .linkedin-form .form-row {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 16px;
                margin-bottom: 16px;
            }
            
            .linkedin-form label {
                display: block;
                margin-bottom: 4px;
                font-weight: 500;
                color: #333;
            }
            
            .linkedin-form input,
            .linkedin-form textarea {
                width: 100%;
                padding: 8px 12px;
                border: 1px solid #cbd5e1;
                border-radius: 6px;
                font-size: 14px;
                transition: border-color 0.2s;
                font-family: inherit;
            }
            
            .linkedin-form input:focus,
            .linkedin-form textarea:focus {
                outline: none;
                border-color: #0077b5;
                box-shadow: 0 0 0 3px rgba(0, 119, 181, 0.1);
            }
            
            .linkedin-form small {
                display: block;
                margin-top: 4px;
                color: #6b7280;
                font-size: 12px;
            }
            
            .modal-footer {
                display: flex;
                justify-content: flex-end;
                gap: 12px;
                padding: 20px 24px;
                border-top: 1px solid #e1e8ed;
                background: #f8f9fa;
                border-radius: 0 0 12px 12px;
            }
            
            .modal-footer button {
                padding: 10px 20px;
                border-radius: 6px;
                border: none;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.2s;
                font-size: 14px;
            }
            
            .btn-primary {
                background: #0077b5;
                color: white;
            }
            
            .btn-primary:hover {
                background: #005885;
            }
            
            .btn-secondary {
                background: #6b7280;
                color: white;
            }
            
            .btn-secondary:hover {
                background: #4b5563;
            }
            
            .btn-import {
                background: #10b981;
                color: white;
            }
            
            .btn-import:hover {
                background: #059669;
            }
            
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            
            @keyframes slideUp {
                from {
                    transform: translateY(30px);
                    opacity: 0;
                }
                to {
                    transform: translateY(0);
                    opacity: 1;
                }
            }
            
            @media (max-width: 640px) {
                .linkedin-form .form-row {
                    grid-template-columns: 1fr;
                }
                
                .modal-footer {
                    flex-direction: column;
                }
                
                .modal-footer button {
                    width: 100%;
                }
            }
        `;
        
        document.head.appendChild(styles);
    }
    
    processLinkedInImport() {
        // Get data from modal form
        const linkedInData = {
            name: document.getElementById('li-name').value.trim(),
            email: document.getElementById('li-email').value.trim(),
            phone: document.getElementById('li-phone').value.trim(),
            location: document.getElementById('li-location').value.trim(),
            linkedin: document.getElementById('li-linkedin').value.trim(),
            headline: document.getElementById('li-headline').value.trim(),
            about: document.getElementById('li-about').value.trim(),
            experience: document.getElementById('li-experience').value.trim(),
            education: document.getElementById('li-education').value.trim(),
            skills: document.getElementById('li-skills').value.trim()
        };
        
        // Validate required fields
        if (!linkedInData.name) {
            this.showNotification('Please enter your name before importing.', 'error');
            document.getElementById('li-name').focus();
            return;
        }
        
        try {
            // Import basic information
            this.importBasicInfo(linkedInData);
            
            // Import experience
            this.importExperience(linkedInData.experience);
            
            // Import education
            this.importEducation(linkedInData.education);
            
            // Import skills
            this.importSkills(linkedInData.skills, linkedInData.headline);
            
            // Generate summary from about section
            this.importSummary(linkedInData.about, linkedInData.headline);
            
            // Close modal
            document.querySelector('.linkedin-import-modal').remove();
            
            // Update preview
            this.updatePreview();
            
            // Show success message
            this.showNotification('LinkedIn data imported successfully! Review and edit as needed.', 'success');
            
        } catch (error) {
            console.error('Import error:', error);
            this.showNotification('Error importing LinkedIn data. Please check your input and try again.', 'error');
        }
    }
    
    importBasicInfo(data) {
        if (data.name) document.getElementById('fullName').value = data.name;
        if (data.email) document.getElementById('email').value = data.email;
        if (data.phone) document.getElementById('phone').value = data.phone;
        if (data.location) document.getElementById('location').value = data.location;
        if (data.linkedin) document.getElementById('linkedin').value = data.linkedin;
    }
    
    importExperience(experienceText) {
        if (!experienceText) return;
        
        // Split experience by double line breaks or clear separators
        const experiences = experienceText.split(/\n\s*\n|\n\s*-{3,}|\n\s*={3,}/).filter(exp => exp.trim());
        
        experiences.forEach((exp, index) => {
            if (index >= this.experienceCount) {
                this.addExperience();
            }
            
            const expIndex = index + 1;
            const parsed = this.parseExperienceEntry(exp.trim());
            
            if (parsed.jobTitle) {
                document.getElementById(`jobTitle${expIndex}`).value = parsed.jobTitle;
            }
            if (parsed.company) {
                document.getElementById(`company${expIndex}`).value = parsed.company;
            }
            if (parsed.startDate) {
                document.getElementById(`startDate${expIndex}`).value = parsed.startDate;
            }
            if (parsed.endDate && parsed.endDate !== 'Present') {
                document.getElementById(`endDate${expIndex}`).value = parsed.endDate;
            }
            if (parsed.current) {
                document.getElementById(`current${expIndex}`).checked = true;
                document.getElementById(`endDate${expIndex}`).disabled = true;
            }
            if (parsed.responsibilities) {
                document.getElementById(`responsibilities${expIndex}`).value = parsed.responsibilities;
            }
        });
    }
    
    parseExperienceEntry(expText) {
        const lines = expText.split('\n').map(line => line.trim()).filter(line => line);
        const result = {
            jobTitle: '',
            company: '',
            startDate: '',
            endDate: '',
            current: false,
            responsibilities: ''
        };
        
        if (lines.length === 0) return result;
        
        // First line is usually job title
        result.jobTitle = lines[0];
        
        // Look for company and date patterns
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i];
            
            // Check for date patterns (e.g., "Jan 2020 - Present", "2020-2023")
            const dateMatch = line.match(/(\w{3}\s+\d{4}|\d{4})\s*[-–]\s*(\w{3}\s+\d{4}|\d{4}|Present|Current)/i);
            if (dateMatch) {
                result.startDate = this.parseDateString(dateMatch[1]);
                const endDateStr = dateMatch[2];
                if (endDateStr.toLowerCase().includes('present') || endDateStr.toLowerCase().includes('current')) {
                    result.current = true;
                } else {
                    result.endDate = this.parseDateString(endDateStr);
                }
                continue;
            }
            
            // If no company found yet and this line doesn't look like responsibilities
            if (!result.company && !line.startsWith('•') && !line.startsWith('-') && line.length < 100) {
                result.company = line;
                continue;
            }
            
            // Everything else goes to responsibilities
            if (result.responsibilities) {
                result.responsibilities += '\n' + line;
            } else {
                result.responsibilities = line;
            }
        }
        
        return result;
    }
    
    parseDateString(dateStr) {
        // Convert various date formats to YYYY-MM
        if (!dateStr) return '';
        
        // Handle "Jan 2020" format
        const monthYearMatch = dateStr.match(/(\w{3})\s+(\d{4})/);
        if (monthYearMatch) {
            const months = {
                'jan': '01', 'feb': '02', 'mar': '03', 'apr': '04',
                'may': '05', 'jun': '06', 'jul': '07', 'aug': '08',
                'sep': '09', 'oct': '10', 'nov': '11', 'dec': '12'
            };
            const month = months[monthYearMatch[1].toLowerCase()] || '01';
            return `${monthYearMatch[2]}-${month}`;
        }
        
        // Handle "2020" format
        const yearMatch = dateStr.match(/\d{4}/);
        if (yearMatch) {
            return `${yearMatch[0]}-01`;
        }
        
        return '';
    }
    
    importEducation(educationText) {
        if (!educationText) return;
        
        const educationEntries = educationText.split(/\n\s*\n/).filter(edu => edu.trim());
        
        educationEntries.forEach((edu, index) => {
            if (index >= this.educationCount) {
                this.addEducation();
            }
            
            const eduIndex = index + 1;
            const parsed = this.parseEducationEntry(edu.trim());
            
            if (parsed.degree) {
                document.getElementById(`degree${eduIndex}`).value = parsed.degree;
            }
            if (parsed.field) {
                document.getElementById(`field${eduIndex}`).value = parsed.field;
            }
            if (parsed.school) {
                document.getElementById(`school${eduIndex}`).value = parsed.school;
            }
            if (parsed.year) {
                document.getElementById(`gradYear${eduIndex}`).value = parsed.year;
            }
        });
    }
    
    parseEducationEntry(eduText) {
        const lines = eduText.split('\n').map(line => line.trim()).filter(line => line);
        const result = {
            degree: '',
            field: '',
            school: '',
            year: ''
        };
        
        if (lines.length === 0) return result;
        
        // First line is usually degree or school
        const firstLine = lines[0];
        
        // Check if first line contains degree keywords
        if (/phd|doctorate|ph\.d|master|bachelor|msc|bsc|ma|ba|md|jd/i.test(firstLine)) {
            result.degree = firstLine;
            if (lines.length > 1) {
                result.school = lines[1];
            }
        } else {
            result.school = firstLine;
            if (lines.length > 1) {
                result.degree = lines[1];
            }
        }
        
        // Extract field from degree if present
        const fieldMatch = result.degree.match(/in\s+([^,\n]+)/i);
        if (fieldMatch) {
            result.field = fieldMatch[1].trim();
            result.degree = result.degree.replace(/\s+in\s+[^,\n]+/i, '').trim();
        }
        
        // Look for year in any line
        const allText = eduText;
        const yearMatch = allText.match(/(19|20)\d{2}/);
        if (yearMatch) {
            result.year = yearMatch[0];
        }
        
        return result;
    }
    
    importSkills(skillsText, headline) {
        if (!skillsText && !headline) return;
        
        let allSkills = '';
        
        if (skillsText) {
            // Clean up skills text (remove bullet points, extra spacing)
            allSkills = skillsText.replace(/[•·-]/g, '').replace(/\n/g, ', ').replace(/,\s*,/g, ',');
        }
        
        if (headline) {
            // Extract skills from headline
            const headlineSkills = headline.split(/[|•·]/).map(s => s.trim()).filter(s => s && s.length > 2);
            if (headlineSkills.length > 0) {
                allSkills = allSkills ? allSkills + ', ' + headlineSkills.join(', ') : headlineSkills.join(', ');
            }
        }
        
        if (allSkills) {
            document.getElementById('coreCompetencies').value = allSkills;
        }
    }
    
    importSummary(aboutText, headline) {
        let summary = '';
        
        if (aboutText) {
            // Clean up about text and limit to reasonable length
            summary = aboutText.replace(/\n\s*\n/g, ' ').trim();
            if (summary.length > 500) {
                summary = summary.substring(0, 500) + '...';
            }
        } else if (headline) {
            // Generate summary from headline
            summary = `Experienced professional with expertise in ${headline.toLowerCase()}.`;
        }
        
        if (summary) {
            document.getElementById('summary').value = summary;
        }
    }
    
    loadSampleLinkedInData() {
        // Pre-fill the modal with sample data for demonstration
        document.getElementById('li-name').value = 'Dr. Sarah Chen';
        document.getElementById('li-email').value = 'sarah.chen@email.com';
        document.getElementById('li-phone').value = '(555) 123-4567';
        document.getElementById('li-location').value = 'Boston, MA';
        document.getElementById('li-linkedin').value = 'https://linkedin.com/in/sarahchen';
        document.getElementById('li-headline').value = 'PhD Scientist | Drug Discovery | Molecular Biology | Research Leadership';
        document.getElementById('li-about').value = `Experienced PhD scientist with 5+ years in molecular biology and drug discovery. Proven track record of leading research projects that resulted in 2 patent applications and $1.5M in grant funding. Expertise in computational biology, in vitro assays, and translational research. Passionate about advancing therapeutic development through innovative science.`;
        document.getElementById('li-experience').value = `Senior Research Scientist\nBioTech Innovations Inc.\nJan 2022 - Present\n• Lead drug discovery projects targeting oncology therapeutics\n• Developed novel screening assays resulting in 3 promising drug candidates\n• Managed cross-functional teams of 8 researchers\n• Secured $800K in NIH funding for collaborative research\n\nPostdoctoral Research Fellow\nHarvard Medical School\nSep 2019 - Dec 2021\n• Investigated molecular mechanisms of cancer drug resistance\n• Published 4 first-author papers in high-impact journals\n• Mentored 3 graduate students and 2 undergraduate researchers\n• Presented research at 6 international conferences`;
        document.getElementById('li-education').value = `PhD in Molecular Biology\nMassachusetts Institute of Technology\n2019\n\nBachelor of Science in Biology\nStanford University\n2014`;
        document.getElementById('li-skills').value = 'Molecular Biology, Drug Discovery, CRISPR, Flow Cytometry, Python, R, Project Management, Grant Writing, Team Leadership, Scientific Writing';
        
        this.showNotification('Sample LinkedIn data loaded! Click "Import to Form" to use this data.', 'info');
    }

    populateMockData() {
        // Populate with sample PhD data
        document.getElementById('fullName').value = 'Dr. Sarah Chen';
        document.getElementById('email').value = 'sarah.chen@email.com';
        document.getElementById('phone').value = '(555) 123-4567';
        document.getElementById('location').value = 'Boston, MA';
        document.getElementById('linkedin').value = 'https://linkedin.com/in/sarahchen';
        document.getElementById('degree').value = 'PhD';
        document.getElementById('industry').value = 'biotechnology';
        document.getElementById('summary').value = 'PhD scientist with 5 years of experience in molecular biology and drug discovery. Proven track record of leading research projects that resulted in 2 patent applications and $1.5M in grant funding.';
        document.getElementById('coreCompetencies').value = 'Molecular Biology, Drug Discovery, Project Management, Data Analysis, Team Leadership, Grant Writing';
        
        // Trigger form update
        this.updatePreview();
        this.showNotification('Sample data imported! Edit as needed.', 'success');
    }

    async handleFileUpload(file) {
        if (!file) return;
        
        const statusDiv = this.createStatusDiv();
        
        try {
            statusDiv.textContent = 'Processing file...';
            statusDiv.className = 'file-upload-status processing';
            statusDiv.style.display = 'block';
            
            let extractedText = '';
            
            if (file.type === 'application/pdf') {
                extractedText = await this.parsePDF(file);
            } else if (file.type.includes('word') || file.name.endsWith('.docx') || file.name.endsWith('.doc')) {
                extractedText = await this.parseWord(file);
            } else if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
                extractedText = await this.parseTextFile(file);
            } else {
                throw new Error('Unsupported file format. Please upload PDF, DOC, DOCX, or TXT files.');
            }
            
            if (!extractedText || extractedText.trim().length < 50) {
                throw new Error('Could not extract sufficient text from the file. Please ensure the file contains readable text.');
            }
            
            // Parse the extracted text and populate form
            this.parseResumeText(extractedText);
            
            statusDiv.textContent = `File uploaded successfully! Extracted ${extractedText.length} characters. Review and edit the populated information.`;
            statusDiv.className = 'file-upload-status success';
            
            // Update preview
            this.updatePreview();
            
            this.showNotification('Resume data extracted and imported successfully!', 'success');
            
        } catch (error) {
            console.error('File upload error:', error);
            statusDiv.textContent = `Error: ${error.message}`;
            statusDiv.className = 'file-upload-status error';
            statusDiv.style.display = 'block';
            this.showNotification(`File parsing failed: ${error.message}`, 'error');
        }
    }

    createStatusDiv() {
        let statusDiv = document.querySelector('.file-upload-status');
        if (!statusDiv) {
            statusDiv = document.createElement('div');
            statusDiv.className = 'file-upload-status';
            const importSection = document.querySelector('.import-section');
            if (importSection) {
                importSection.appendChild(statusDiv);
            } else {
                document.body.appendChild(statusDiv);
            }
        }
        return statusDiv;
    }

    async parsePDF(file) {
        try {
            // Check if PDF.js is available
            if (typeof pdfjsLib === 'undefined') {
                // Load PDF.js if not available
                await this.loadPDFJS();
            }
            
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
            
            let fullText = '';
            
            // Extract text from all pages
            for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
                const page = await pdf.getPage(pageNum);
                const textContent = await page.getTextContent();
                const pageText = textContent.items.map(item => item.str).join(' ');
                fullText += pageText + '\n';
            }
            
            return fullText;
            
        } catch (error) {
            console.error('PDF parsing error:', error);
            throw new Error('Failed to parse PDF file. Please ensure the PDF contains selectable text.');
        }
    }

    async loadPDFJS() {
        return new Promise((resolve, reject) => {
            // Load PDF.js from CDN
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
            script.onload = () => {
                // Set worker source
                pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
                resolve();
            };
            script.onerror = () => reject(new Error('Failed to load PDF.js library'));
            document.head.appendChild(script);
        });
    }

    async parseWord(file) {
        try {
            // For Word documents, we'll use a simpler approach
            // Note: Full DOCX parsing requires complex libraries
            // This is a basic implementation for demonstration
            
            if (file.name.endsWith('.docx')) {
                return await this.parseDocx(file);
            } else {
                throw new Error('DOC files are not supported. Please save as DOCX or PDF format.');
            }
            
        } catch (error) {
            console.error('Word parsing error:', error);
            throw new Error('Failed to parse Word document. Please save as PDF or plain text format.');
        }
    }

    async parseDocx(file) {
        try {
            // Load mammoth.js for DOCX parsing
            if (typeof mammoth === 'undefined') {
                await this.loadMammoth();
            }
            
            const arrayBuffer = await file.arrayBuffer();
            const result = await mammoth.extractRawText({arrayBuffer: arrayBuffer});
            
            if (result.messages.length > 0) {
                console.warn('DOCX parsing warnings:', result.messages);
            }
            
            return result.value;
            
        } catch (error) {
            console.error('DOCX parsing error:', error);
            throw new Error('Failed to parse DOCX file. Please ensure the file is not corrupted.');
        }
    }

    async loadMammoth() {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.4.21/mammoth.browser.min.js';
            script.onload = () => resolve();
            script.onerror = () => reject(new Error('Failed to load Mammoth.js library'));
            document.head.appendChild(script);
        });
    }

    async parseTextFile(file) {
        try {
            const text = await file.text();
            return text;
        } catch (error) {
            console.error('Text file parsing error:', error);
            throw new Error('Failed to read text file.');
        }
    }

    parseResumeText(text) {
        try {
            // Clean and normalize the text
            const cleanText = this.cleanResumeText(text);
            
            // Check if this looks like a LinkedIn export
            const isLinkedInFormat = cleanText.match(/linkedin\.com\/in\/|Summary\s*Entrepreneur|Experience\s*Nanolyze|Top Skills/gi);
            
            let extractedData;
            if (isLinkedInFormat) {
                // Use LinkedIn-specific parsing
                extractedData = this.parseLinkedInFormat(cleanText);
            } else {
                // Use generic resume parsing
                extractedData = this.parseGenericFormat(cleanText);
            }
            
            // Populate the form with extracted data
            this.populateFormWithExtractedData(extractedData);
            
        } catch (error) {
            console.error('Resume parsing error:', error);
            throw new Error('Failed to parse resume content. Please check the file format and try again.');
        }
    }
    
    parseLinkedInFormat(text) {
        return {
            personalInfo: this.extractLinkedInPersonalInfo(text),
            summary: this.extractLinkedInSummary(text),
            experience: this.extractLinkedInExperience(text),
            education: this.extractLinkedInEducation(text),
            skills: this.extractLinkedInSkills(text),
            publications: this.extractPublications(text),
            certifications: this.extractCertifications(text)
        };
    }
    
    parseGenericFormat(text) {
        return {
            personalInfo: this.extractPersonalInfo(text),
            summary: this.extractSummary(text),
            experience: this.extractExperience(text),
            education: this.extractEducation(text),
            skills: this.extractSkills(text),
            publications: this.extractPublications(text),
            certifications: this.extractCertifications(text)
        };
    }
    
    extractLinkedInPersonalInfo(text) {
        const info = {
            name: '',
            email: '',
            phone: '',
            location: '',
            linkedin: '',
            website: ''
        };
        
        // Extract name (usually appears early, before Summary)
        const nameMatch = text.match(/^\s*([A-Z][a-z]+\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\s*\n/m);
        if (nameMatch) {
            info.name = nameMatch[1].trim();
        }
        
        // Extract email
        const emailMatch = text.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g);
        if (emailMatch) {
            info.email = emailMatch[0];
        }
        
        // Extract LinkedIn
        const linkedinMatch = text.match(/linkedin\.com\/in\/([a-zA-Z0-9-]+)/gi);
        if (linkedinMatch) {
            info.linkedin = 'https://' + linkedinMatch[0];
        }
        
        // Extract website (look for other URLs)
        const websiteMatch = text.match(/(?:www\.|https?:\/\/)?([a-zA-Z0-9-]+\.[a-zA-Z]{2,}(?:\/[^\s]*)?)/g);
        if (websiteMatch) {
            const nonLinkedInSites = websiteMatch.filter(site => !site.includes('linkedin'));
            if (nonLinkedInSites.length > 0) {
                info.website = nonLinkedInSites[0].startsWith('http') ? nonLinkedInSites[0] : 'https://' + nonLinkedInSites[0];
            }
        }
        
        // Extract location (often appears after name and title)
        const locationMatch = text.match(/([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*),\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/g);
        if (locationMatch) {
            info.location = locationMatch[0];
        }
        
        return info;
    }
    
    extractLinkedInSummary(text) {
        const summaryMatch = text.match(/Summary\s*([\s\S]*?)(?=Experience|Education|Skills|$)/gi);
        if (summaryMatch) {
            return summaryMatch[0].replace(/^Summary\s*/i, '').trim();
        }
        return '';
    }
    
    extractLinkedInExperience(text) {
        console.log('Extracting LinkedIn experience from text:', text.substring(0, 200) + '...');
        const experiences = [];
        
        // Find the Experience section
        const expMatch = text.match(/Experience\s*([\s\S]*?)(?=Education|Skills|Publications|Languages|$)/gi);
        if (!expMatch) {
            console.log('No Experience section found in text');
            return experiences;
        }
        
        let expSection = expMatch[0].replace(/^Experience\s*/i, '').trim();
        console.log('Found Experience section:', expSection.substring(0, 300) + '...');
        
        // Split by company names (look for patterns in LinkedIn format)
        const companyBlocks = this.splitLinkedInExperience(expSection);
        console.log('Split into', companyBlocks.length, 'company blocks:', companyBlocks.map(block => block.substring(0, 50) + '...'));
        
        companyBlocks.forEach((block, index) => {
            console.log(`Processing company block ${index + 1}:`, block.substring(0, 100) + '...');
            const jobs = this.parseLinkedInCompanyBlock(block);
            console.log(`Extracted ${jobs.length} jobs from block ${index + 1}:`, jobs.map(job => `${job.jobTitle} at ${job.company}`));
            experiences.push(...jobs);
        });
        
        console.log('Total experiences extracted:', experiences.length);
        experiences.forEach((exp, i) => {
            console.log(`Experience ${i + 1}:`, {
                title: exp.jobTitle,
                company: exp.company,
                dates: `${exp.startDate} - ${exp.current ? 'Present' : exp.endDate}`,
                responsibilities: exp.responsibilities ? exp.responsibilities.substring(0, 50) + '...' : 'None'
            });
        });
        
        return experiences;
    }
    
    splitLinkedInExperience(expSection) {
        // LinkedIn format often has company names on their own lines
        // followed by duration, then job titles
        
        // Split by lines that look like company names
        const lines = expSection.split('\n').map(line => line.trim()).filter(line => line);
        const blocks = [];
        let currentBlock = [];
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            
            // Check if this line looks like a new company
            if (this.looksLikeCompanyName(line) && currentBlock.length > 0) {
                blocks.push(currentBlock.join('\n'));
                currentBlock = [line];
            } else {
                currentBlock.push(line);
            }
        }
        
        if (currentBlock.length > 0) {
            blocks.push(currentBlock.join('\n'));
        }
        
        return blocks.filter(block => block.length > 20);
    }
    
    looksLikeCompanyName(line) {
        // Check for common company indicators
        return (
            line.match(/University|Institute|Corporation|Company|Inc|LLC|Ltd|GmbH|AB|Systems|Technologies|Lab|Center|Organization/i) ||
            line.match(/^[A-Z\s&.,]{5,50}$/) || // All caps or mostly caps
            (line.split(' ').length <= 5 && // Short enough to be a company name
             line.match(/^[A-Z]/) && // Starts with capital
             !line.match(/^(CEO|CTO|Manager|Director|Scientist|Engineer|Associate|Senior|Lead|Principal|Research)/i)) // Not a job title
        );
    }
    
    parseLinkedInCompanyBlock(block) {
        const lines = block.split('\n').map(line => line.trim()).filter(line => line);
        const jobs = [];
        
        if (lines.length === 0) return jobs;
        
        // First line is likely the company name
        const company = lines[0];
        
        // Look for job entries within this company
        let currentJob = null;
        
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i];
            
            // Skip duration lines (e.g., "3 years 1 month")
            if (line.match(/^\d+\s+years?|^\d+\s+months?|^\(\d+\s+years?/i)) {
                continue;
            }
            
            // Check if this is a job title
            if (this.looksLikeJobTitle(line)) {
                // Save previous job if exists
                if (currentJob) {
                    jobs.push(currentJob);
                }
                
                // Start new job
                currentJob = {
                    jobTitle: line,
                    company: company,
                    startDate: '',
                    endDate: '',
                    current: false,
                    responsibilities: ''
                };
                continue;
            }
            
            // Check for dates
            const dateMatch = line.match(/(January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{4}\s*[-–]\s*(January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|\d{4}|Present|Current)/gi);
            if (dateMatch && currentJob) {
                const dateStr = dateMatch[0];
                const dateParts = dateStr.split(/[-–]/);
                currentJob.startDate = this.parseDateString(dateParts[0].trim());
                
                if (dateParts[1] && dateParts[1].match(/present|current/i)) {
                    currentJob.current = true;
                } else if (dateParts[1]) {
                    currentJob.endDate = this.parseDateString(dateParts[1].trim());
                }
                continue;
            }
            
            // Check for location (skip it)
            if (line.match(/^[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*,\s+[A-Z]/)) {
                continue;
            }
            
            // Everything else is responsibilities
            if (currentJob && line.length > 10) {
                if (currentJob.responsibilities) {
                    currentJob.responsibilities += '\n' + line;
                } else {
                    currentJob.responsibilities = line;
                }
            }
        }
        
        // Add the last job
        if (currentJob) {
            jobs.push(currentJob);
        }
        
        return jobs;
    }
    
    looksLikeJobTitle(line) {
        return (
            line.match(/CEO|CTO|CFO|VP|President|Director|Manager|Scientist|Researcher|Engineer|Analyst|Assistant|Associate|Senior|Lead|Principal|Research/i) ||
            (line.split(' ').length <= 6 && // Not too long
             line.match(/^[A-Z]/) && // Starts with capital
             !line.match(/^[A-Z\s&.,]{5,}$/) && // Not all caps (likely company)
             !line.match(/University|Institute|Corporation|Company|Inc|LLC|Ltd/i)) // Not a company
        );
    }
    
    extractLinkedInEducation(text) {
        // LinkedIn education section is usually simpler
        const eduMatch = text.match(/Education\s*([\s\S]*?)(?=Experience|Skills|Publications|Languages|$)/gi);
        if (!eduMatch) return [];
        
        const eduSection = eduMatch[0].replace(/^Education\s*/i, '').trim();
        return this.parseLinkedInEducationSection(eduSection);
    }
    
    parseLinkedInEducationSection(eduSection) {
        const education = [];
        const lines = eduSection.split('\n').map(line => line.trim()).filter(line => line);
        
        let currentEdu = null;
        
        for (const line of lines) {
            // Skip very short lines
            if (line.length < 3) continue;
            
            // Check for degree patterns
            if (line.match(/PhD|Ph\.D|Doctor|Master|Bachelor|MBA|MS|BS|MA|BA|MD|JD|B\.Tech/i)) {
                // Save previous education
                if (currentEdu) {
                    education.push(currentEdu);
                }
                
                // Start new education entry
                currentEdu = {
                    degree: line,
                    field: '',
                    school: '',
                    year: ''
                };
                
                // Extract field if present in same line
                const fieldMatch = line.match(/(?:in|of)\s+([^,\(\)]+)/i);
                if (fieldMatch) {
                    currentEdu.field = fieldMatch[1].trim();
                    currentEdu.degree = line.replace(/\s+(?:in|of)\s+[^,\(\)]+/i, '').trim();
                }
                continue;
            }
            
            // Look for years
            const yearMatch = line.match(/(19|20)\d{2}/g);
            if (yearMatch && currentEdu) {
                currentEdu.year = yearMatch[yearMatch.length - 1]; // Take the last year if multiple
                continue;
            }
            
            // Everything else is likely school name
            if (currentEdu && !currentEdu.school && line.length > 5) {
                currentEdu.school = line;
            }
        }
        
        // Add the last education entry
        if (currentEdu) {
            education.push(currentEdu);
        }
        
        return education;
    }
    
    extractLinkedInSkills(text) {
        // LinkedIn has a specific "Top Skills" section
        const skillsMatch = text.match(/Top Skills\s*([\s\S]*?)(?=Languages|Certifications|Honors|Publications|$)/gi);
        if (!skillsMatch) return '';
        
        let skills = skillsMatch[0].replace(/^Top Skills\s*/i, '').trim();
        
        // Clean up the skills format
        skills = skills
            .replace(/\n/g, ', ')
            .replace(/,\s*,/g, ',')
            .replace(/^,\s*/, '')
            .replace(/,\s*$/, '');
        
        return skills;
    }

    cleanResumeText(text) {
        return text
            .replace(/\r\n/g, '\n')  // Normalize line endings
            .replace(/\s+/g, ' ')     // Normalize whitespace
            .replace(/\n\s*\n/g, '\n\n') // Normalize paragraph breaks
            .trim();
    }

    extractPersonalInfo(text) {
        const info = {
            name: '',
            email: '',
            phone: '',
            location: '',
            linkedin: '',
            website: ''
        };
        
        // Extract email
        const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g);
        if (emailMatch) {
            info.email = emailMatch[0];
        }
        
        // Extract phone number
        const phoneMatch = text.match(/(\+?1?[-\s]?)?\(?([0-9]{3})\)?[-\s]?([0-9]{3})[-\s]?([0-9]{4})/g);
        if (phoneMatch) {
            info.phone = phoneMatch[0];
        }
        
        // Extract LinkedIn
        const linkedinMatch = text.match(/linkedin\.com\/in\/[a-zA-Z0-9-]+/gi);
        if (linkedinMatch) {
            info.linkedin = 'https://' + linkedinMatch[0];
        }
        
        // Extract website/portfolio
        const websiteMatch = text.match(/(?:https?:\/\/)?(?:www\.)?((?!linkedin|email)[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(?:\/[^\s]*)?)/gi);
        if (websiteMatch) {
            info.website = websiteMatch[0].startsWith('http') ? websiteMatch[0] : 'https://' + websiteMatch[0];
        }
        
        // Extract name (assume it's in the first few lines)
        const lines = text.split('\n').map(line => line.trim()).filter(line => line);
        for (let i = 0; i < Math.min(5, lines.length); i++) {
            const line = lines[i];
            // Skip lines that look like contact info
            if (!line.includes('@') && !line.match(/\d{3}/) && line.length > 5 && line.length < 50) {
                // Check if it looks like a name (2-4 words, no special chars except spaces and periods)
                if (/^[a-zA-Z\s\.]{2,50}$/.test(line) && line.split(' ').length >= 2 && line.split(' ').length <= 4) {
                    info.name = line;
                    break;
                }
            }
        }
        
        // Extract location (look for city, state patterns)
        const locationMatch = text.match(/([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*),\s*([A-Z]{2}|[A-Z][a-z]+)/g);
        if (locationMatch) {
            info.location = locationMatch[0];
        }
        
        return info;
    }

    extractSummary(text) {
        // Look for summary/objective/profile sections
        const summaryPatterns = [
            /(?:summary|objective|profile|about)\s*:?\s*([\s\S]{50,500}?)(?:\n\s*\n|\n\s*[A-Z])/gi,
            /^([\s\S]{100,400}?)(?:\n\s*\n.*(?:experience|education|skills))/mi
        ];
        
        for (const pattern of summaryPatterns) {
            const match = text.match(pattern);
            if (match) {
                return match[1].trim().replace(/\s+/g, ' ');
            }
        }
        
        return '';
    }

    extractExperience(text) {
        const experiences = [];
        
        // Look for experience section
        const expSectionMatch = text.match(/(?:experience|employment|work\s+history|professional\s+experience)[\s\S]*?(?=(?:education|skills|publications|certifications|languages|honors|awards|patents|$))/gi);
        
        if (!expSectionMatch) return experiences;
        
        const expSection = expSectionMatch[0];
        
        // Split by company/organization names or clear job separators
        // Look for patterns like company names followed by job titles and dates
        const jobBlocks = this.splitExperienceBlocks(expSection);
        
        jobBlocks.forEach(block => {
            const exp = this.parseExperienceBlock(block.trim());
            if (exp.jobTitle || exp.company) {
                experiences.push(exp);
            }
        });
        
        return experiences;
    }
    
    splitExperienceBlocks(expSection) {
        // Remove the section header
        let cleanSection = expSection.replace(/^[^\n]*(?:experience|employment|work\s+history|professional\s+experience)[^\n]*/i, '').trim();
        
        // Look for company/organization patterns
        const companyPatterns = [
            // Company names that are likely to be standalone lines
            /\n([A-Z][A-Za-z\s&.,]+(?:University|Institute|Corporation|Company|Inc|LLC|Ltd|GmbH|AB|Systems|Technologies|Lab|Center|Organization))\s*\n/g,
            // All caps company names
            /\n([A-Z\s&.,]{5,50})\s*\n/g,
            // Date ranges that might indicate new jobs
            /\n(?=.*(?:January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{4})/g
        ];
        
        // Split by these patterns
        let blocks = [cleanSection];
        
        // Try different splitting strategies
        companyPatterns.forEach(pattern => {
            let newBlocks = [];
            blocks.forEach(block => {
                const parts = block.split(pattern);
                newBlocks.push(...parts.filter(part => part.trim().length > 20));
            });
            if (newBlocks.length > blocks.length) {
                blocks = newBlocks;
            }
        });
        
        // If no good splits found, try to identify job sections by looking for job titles followed by dates
        if (blocks.length <= 1) {
            blocks = this.splitByJobTitlePatterns(cleanSection);
        }
        
        return blocks.filter(block => block.trim().length > 30);
    }
    
    splitByJobTitlePatterns(text) {
        // Look for patterns that suggest job titles
        const jobTitlePatterns = [
            /\n((?:CEO|CTO|CFO|VP|Director|Manager|Scientist|Researcher|Engineer|Analyst|Assistant|Associate|Senior|Lead|Principal)\b[^\n]*?)\n/gi,
            /\n([A-Z][a-z]+\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*?)\n(?=.*\d{4})/g
        ];
        
        let bestSplit = [text];
        
        jobTitlePatterns.forEach(pattern => {
            const matches = [...text.matchAll(pattern)];
            if (matches.length > 1) {
                const split = text.split(pattern).filter(part => part.trim().length > 30);
                if (split.length > bestSplit.length) {
                    bestSplit = split;
                }
            }
        });
        
        return bestSplit;
    }

    parseExperienceBlock(block) {
        const lines = block.split('\n').map(line => line.trim()).filter(line => line);
        const exp = {
            jobTitle: '',
            company: '',
            startDate: '',
            endDate: '',
            current: false,
            responsibilities: ''
        };
        
        if (lines.length === 0) return exp;
        
        // For LinkedIn format, often company comes first, then job title
        let companyFound = false;
        let titleFound = false;
        let dateFound = false;
        let responsibilitiesStartIndex = -1;
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            
            // Skip very short lines or lines with just numbers
            if (line.length < 3 || /^\d+\s*$/.test(line)) continue;
            
            // Check for date patterns first
            const dateMatch = line.match(/(January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{4}|\d{4}\s*[-–]\s*(January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|\d{4}|Present|Current)/gi);
            if (dateMatch && !dateFound) {
                const dateStr = dateMatch[0];
                const dateParts = dateStr.split(/[-–]|\s+to\s+/i);
                
                if (dateParts.length >= 2) {
                    exp.startDate = this.parseDateString(dateParts[0].trim());
                    const endPart = dateParts[1].trim();
                    if (endPart.match(/present|current/i)) {
                        exp.current = true;
                    } else {
                        exp.endDate = this.parseDateString(endPart);
                    }
                } else {
                    // Single date, assume it's start date
                    exp.startDate = this.parseDateString(dateStr);
                }
                dateFound = true;
                responsibilitiesStartIndex = i + 1;
                continue;
            }
            
            // Check for duration patterns (e.g., "3 years 1 month", "(1 year 6 months)")
            if (line.match(/\d+\s+years?|\d+\s+months?|\(\d+\s+years?.*?\)/i)) {
                // This might be duration info, skip it
                continue;
            }
            
            // Check for location patterns (City, State/Country)
            if (line.match(/^[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*,\s+[A-Z]/)) {
                // This looks like a location, skip it for now
                continue;
            }
            
            // Look for company names (usually have specific patterns)
            if (!companyFound && (line.match(/University|Institute|Corporation|Company|Inc|LLC|Ltd|GmbH|AB|Systems|Technologies|Lab|Center|Organization/i) || 
                line.match(/^[A-Z\s&.,]{5,}$/))) {
                exp.company = line;
                companyFound = true;
                continue;
            }
            
            // Look for job titles (usually contain specific keywords or are properly cased)
            if (!titleFound && !companyFound && 
                (line.match(/CEO|CTO|CFO|VP|President|Director|Manager|Scientist|Researcher|Engineer|Analyst|Assistant|Associate|Senior|Lead|Principal|Research/i) ||
                 line.match(/^[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*$/))) {
                exp.jobTitle = line;
                titleFound = true;
                continue;
            }
            
            // If we haven't found a company yet and this line looks like a company
            if (!companyFound && line.length > 5 && line.length < 80 && 
                !line.startsWith('•') && !line.startsWith('-') && 
                !line.match(/^[a-z]/) && // Not starting with lowercase
                line.split(' ').length <= 6) { // Not too many words
                exp.company = line;
                companyFound = true;
                continue;
            }
            
            // If we haven't found a title yet and this could be one
            if (!titleFound && line.length > 3 && line.length < 80 &&
                !line.startsWith('•') && !line.startsWith('-')) {
                exp.jobTitle = line;
                titleFound = true;
                continue;
            }
            
            // Everything else goes to responsibilities (if we've found basic info)
            if ((companyFound || titleFound) && responsibilitiesStartIndex <= i) {
                if (exp.responsibilities) {
                    exp.responsibilities += '\n' + line;
                } else {
                    exp.responsibilities = line;
                }
            }
        }
        
        // Clean up responsibilities
        if (exp.responsibilities) {
            exp.responsibilities = exp.responsibilities
                .replace(/Page \d+ of \d+/g, '') // Remove page numbers
                .replace(/^\s*[\n\r]+|[\n\r]+\s*$/g, '') // Trim newlines
                .trim();
        }
        
        return exp;
    }

    extractEducation(text) {
        const education = [];
        
        // Look for education section
        const eduSectionMatch = text.match(/(?:education|academic|qualifications)[\s\S]*?(?=(?:experience|skills|publications|certifications|$))/gi);
        
        if (!eduSectionMatch) return education;
        
        const eduSection = eduSectionMatch[0];
        
        // Split by degree entries
        const degreeBlocks = eduSection.split(/\n(?=\s*(?:PhD|Ph\.D|Doctorate|Master|Bachelor|MBA|MS|BS|MA|BA|MD|JD))/gi);
        
        degreeBlocks.forEach(block => {
            const edu = this.parseEducationBlock(block.trim());
            if (edu.degree || edu.school) {
                education.push(edu);
            }
        });
        
        return education;
    }

    parseEducationBlock(block) {
        const lines = block.split('\n').map(line => line.trim()).filter(line => line);
        const edu = {
            degree: '',
            field: '',
            school: '',
            year: ''
        };
        
        if (lines.length === 0) return edu;
        
        // Extract degree from first line
        const firstLine = lines[0];
        if (/PhD|Ph\.D|Doctorate|Master|Bachelor|MBA|MS|BS|MA|BA|MD|JD/i.test(firstLine)) {
            edu.degree = firstLine;
            
            // Extract field if present
            const fieldMatch = firstLine.match(/(?:in|of)\s+([^,\n]+)/i);
            if (fieldMatch) {
                edu.field = fieldMatch[1].trim();
                edu.degree = firstLine.replace(/\s+(?:in|of)\s+[^,\n]+/i, '').trim();
            }
        }
        
        // Look for school name
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i];
            if (!line.match(/\d{4}/) && line.length > 5) {
                edu.school = line;
                break;
            }
        }
        
        // Look for graduation year
        const yearMatch = block.match(/(19|20)\d{2}/);
        if (yearMatch) {
            edu.year = yearMatch[0];
        }
        
        return edu;
    }

    extractSkills(text) {
        // Look for skills section
        const skillsMatch = text.match(/(?:skills|competencies|expertise|technologies)[\s\S]*?(?=(?:experience|education|publications|certifications|$))/gi);
        
        if (!skillsMatch) return '';
        
        const skillsSection = skillsMatch[0];
        
        // Extract skills (remove section header)
        let skills = skillsSection.replace(/^[^\n]*(?:skills|competencies|expertise|technologies)[^\n]*/i, '').trim();
        
        // Clean up formatting
        skills = skills
            .replace(/[•\-]/g, '')
            .replace(/\n/g, ', ')
            .replace(/,\s*,/g, ',')
            .replace(/^,\s*/, '')
            .replace(/,\s*$/, '');
        
        return skills;
    }

    extractPublications(text) {
        // Look for publications section
        const pubMatch = text.match(/(?:publications|papers|articles)[\s\S]*?(?=(?:experience|education|skills|certifications|$))/gi);
        
        if (!pubMatch) return '';
        
        return pubMatch[0].replace(/^[^\n]*(?:publications|papers|articles)[^\n]*/i, '').trim();
    }

    extractCertifications(text) {
        // Look for certifications section
        const certMatch = text.match(/(?:certifications|certificates|licenses)[\s\S]*?(?=(?:experience|education|skills|publications|$))/gi);
        
        if (!certMatch) return '';
        
        return certMatch[0].replace(/^[^\n]*(?:certifications|certificates|licenses)[^\n]*/i, '').trim();
    }

    populateFormWithExtractedData(data) {
        console.log('Populating form with extracted data:', data); // Debug log
        
        // Populate personal information
        if (data.personalInfo.name) {
            document.getElementById('fullName').value = data.personalInfo.name;
        }
        if (data.personalInfo.email) {
            document.getElementById('email').value = data.personalInfo.email;
        }
        if (data.personalInfo.phone) {
            document.getElementById('phone').value = data.personalInfo.phone;
        }
        if (data.personalInfo.location) {
            document.getElementById('location').value = data.personalInfo.location;
        }
        if (data.personalInfo.linkedin) {
            document.getElementById('linkedin').value = data.personalInfo.linkedin;
        }
        if (data.personalInfo.website) {
            document.getElementById('website').value = data.personalInfo.website;
        }
        
        // Populate summary
        if (data.summary) {
            document.getElementById('summary').value = data.summary;
        }
        
        // Populate skills
        if (data.skills) {
            document.getElementById('coreCompetencies').value = data.skills;
        }
        
        // Populate publications
        if (data.publications) {
            document.getElementById('publications').value = data.publications;
        }
        
        // Populate certifications
        if (data.certifications) {
            document.getElementById('certifications').value = data.certifications;
        }
        
        // Populate experience - Enhanced logging
        console.log('Processing experience data:', data.experience);
        if (data.experience && data.experience.length > 0) {
            data.experience.forEach((exp, index) => {
                console.log(`Processing experience ${index + 1}:`, exp);
                
                // Add more experience fields if needed
                while (index >= this.experienceCount) {
                    console.log(`Adding experience field ${this.experienceCount + 1}`);
                    this.addExperience();
                }
                
                const expIndex = index + 1;
                
                if (exp.jobTitle) {
                    const jobTitleField = document.getElementById(`jobTitle${expIndex}`);
                    if (jobTitleField) {
                        jobTitleField.value = exp.jobTitle;
                        console.log(`Set job title ${expIndex}: ${exp.jobTitle}`);
                    } else {
                        console.error(`Job title field jobTitle${expIndex} not found`);
                    }
                }
                
                if (exp.company) {
                    const companyField = document.getElementById(`company${expIndex}`);
                    if (companyField) {
                        companyField.value = exp.company;
                        console.log(`Set company ${expIndex}: ${exp.company}`);
                    } else {
                        console.error(`Company field company${expIndex} not found`);
                    }
                }
                
                if (exp.startDate) {
                    const startDateField = document.getElementById(`startDate${expIndex}`);
                    if (startDateField) {
                        startDateField.value = exp.startDate;
                        console.log(`Set start date ${expIndex}: ${exp.startDate}`);
                    } else {
                        console.error(`Start date field startDate${expIndex} not found`);
                    }
                }
                
                if (exp.endDate && !exp.current) {
                    const endDateField = document.getElementById(`endDate${expIndex}`);
                    if (endDateField) {
                        endDateField.value = exp.endDate;
                        console.log(`Set end date ${expIndex}: ${exp.endDate}`);
                    }
                }
                
                if (exp.current) {
                    const currentField = document.getElementById(`current${expIndex}`);
                    const endDateField = document.getElementById(`endDate${expIndex}`);
                    if (currentField) {
                        currentField.checked = true;
                        console.log(`Set current position ${expIndex}: true`);
                    }
                    if (endDateField) {
                        endDateField.disabled = true;
                    }
                }
                
                if (exp.responsibilities) {
                    const responsField = document.getElementById(`responsibilities${expIndex}`);
                    if (responsField) {
                        responsField.value = exp.responsibilities;
                        console.log(`Set responsibilities ${expIndex}: ${exp.responsibilities.substring(0, 100)}...`);
                    } else {
                        console.error(`Responsibilities field responsibilities${expIndex} not found`);
                    }
                }
            });
        } else {
            console.log('No experience data found or empty array');
        }
        
        // Populate education - Enhanced logging
        console.log('Processing education data:', data.education);
        if (data.education && data.education.length > 0) {
            data.education.forEach((edu, index) => {
                console.log(`Processing education ${index + 1}:`, edu);
                
                // Add more education fields if needed
                while (index >= this.educationCount) {
                    console.log(`Adding education field ${this.educationCount + 1}`);
                    this.addEducation();
                }
                
                const eduIndex = index + 1;
                
                if (edu.degree) {
                    const degreeField = document.getElementById(`degree${eduIndex}`);
                    if (degreeField) {
                        degreeField.value = edu.degree;
                        console.log(`Set degree ${eduIndex}: ${edu.degree}`);
                    }
                }
                
                if (edu.field) {
                    const fieldField = document.getElementById(`field${eduIndex}`);
                    if (fieldField) {
                        fieldField.value = edu.field;
                        console.log(`Set field ${eduIndex}: ${edu.field}`);
                    }
                }
                
                if (edu.school) {
                    const schoolField = document.getElementById(`school${eduIndex}`);
                    if (schoolField) {
                        schoolField.value = edu.school;
                        console.log(`Set school ${eduIndex}: ${edu.school}`);
                    }
                }
                
                if (edu.year) {
                    const yearField = document.getElementById(`gradYear${eduIndex}`);
                    if (yearField) {
                        yearField.value = edu.year;
                        console.log(`Set graduation year ${eduIndex}: ${edu.year}`);
                    }
                }
            });
        } else {
            console.log('No education data found or empty array');
        }
        
        console.log('Form population completed');
    }

    setImportMode(mode) {
        // Update active state of import buttons
        document.querySelectorAll('.btn-import').forEach(btn => {
            btn.classList.remove('active');
        });
        
        if (mode === 'manual') {
            document.getElementById('manual-entry').classList.add('active');
        } else if (mode === 'linkedin') {
            document.getElementById('linkedin-import').classList.add('active');
        }
    }
}

// Add CSS for notifications
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    .notification-content {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 15px;
    }
    
    .notification-close {
        background: none;
        border: none;
        color: white;
        font-size: 18px;
        cursor: pointer;
        padding: 0;
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        transition: background-color 0.2s;
    }
    
    .notification-close:hover {
        background-color: rgba(255,255,255,0.2);
    }
`;

document.head.appendChild(notificationStyles);

// Initialize the resume builder when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.resumeBuilder = new ResumeBuilder();
    
    // Initialize Lucide icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
});