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
        })

    // Setup import features
    setupImportFeatures() {
        // LinkedIn import
        document.getElementById('linkedin-import').addEventListener('click', () => {
            this.importFromLinkedIn();
        });

        // File upload
        document.getElementById('file-upload').addEventListener('change', (e) => {
            this.handleFileUpload(e.target.files[0]);
        });

        // Manual entry toggle
        document.getElementById('manual-entry').addEventListener('click', () => {
            this.setImportMode('manual');
    }

    // Setup import features
    setupImportFeatures() {
        // LinkedIn import
        document.getElementById('linkedin-import').addEventListener('click', () => {
            this.importFromLinkedIn();
        });

        // File upload
        document.getElementById('file-upload').addEventListener('change', (e) => {
            this.handleFileUpload(e.target.files[0]);
        });

        // Manual entry toggle
        document.getElementById('manual-entry').addEventListener('click', () => {
            this.setImportMode('manual');
        });
    }

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
        // Validate form
        if (!this.validateForm()) {
            this.showNotification('Please fill in all required fields correctly.', 'error');
            return;
        }

        const data = this.collectFormData();
        this.renderResume(data);
        this.saveToLocalStorage();
        this.showNotification('Resume generated successfully!', 'success');
        
        // Show action buttons
        document.getElementById('download-pdf').style.display = 'inline-flex';
        document.getElementById('print-resume').style.display = 'inline-flex';
    }

    validateForm() {
        const requiredFields = document.querySelectorAll('input[required], select[required]');
        let isValid = true;
        
        requiredFields.forEach(field => {
            if (!this.validateField(field)) {
                isValid = false;
            }
        });
        
        return isValid;
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
        this.showNotification('LinkedIn import feature coming soon! For now, you can manually copy your LinkedIn profile information.', 'info');
        
        // In a real implementation, this would:
        // 1. Open LinkedIn OAuth flow
        // 2. Request profile data
        // 3. Parse and populate form fields
        // 4. Apply industry-specific translations
        
        // Mock data for demonstration
        this.populateMockData();
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
            statusDiv.className = 'file-upload-status';
            statusDiv.style.display = 'block';
            
            if (file.type === 'application/pdf') {
                await this.parsePDF(file);
            } else if (file.type.includes('word') || file.name.endsWith('.docx') || file.name.endsWith('.doc')) {
                await this.parseWord(file);
            } else {
                throw new Error('Unsupported file format. Please upload PDF, DOC, or DOCX files.');
            }
            
            statusDiv.textContent = 'File uploaded successfully! Review and edit the extracted information.';
            statusDiv.className = 'file-upload-status success';
            
        } catch (error) {
            statusDiv.textContent = `Error: ${error.message}`;
            statusDiv.className = 'file-upload-status error';
            statusDiv.style.display = 'block';
        }
    }

    createStatusDiv() {
        let statusDiv = document.querySelector('.file-upload-status');
        if (!statusDiv) {
            statusDiv = document.createElement('div');
            statusDiv.className = 'file-upload-status';
            document.querySelector('.import-section').appendChild(statusDiv);
        }
        return statusDiv;
    }

    async parsePDF(file) {
        // In a real implementation, you would use PDF.js or similar library
        // For now, we'll show a placeholder message
        this.showNotification('PDF parsing coming soon! For now, please manually enter your information.', 'info');
        throw new Error('PDF parsing not yet implemented. Please try manual entry or use the LinkedIn import.');
    }

    async parseWord(file) {
        // In a real implementation, you would use mammoth.js or similar library
        // For now, we'll show a placeholder message
        this.showNotification('Word document parsing coming soon! For now, please manually enter your information.', 'info');
        throw new Error('Word document parsing not yet implemented. Please try manual entry or use the LinkedIn import.');
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
    new ResumeBuilder();
    
    // Initialize Lucide icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
});