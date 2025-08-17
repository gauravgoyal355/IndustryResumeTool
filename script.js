// Resume Tool JavaScript
class ResumeBuilder {
    constructor() {
        this.experienceCount = 1;
        this.educationCount = 1;
        this.formData = {};
        
        this.init();
    }

    init() {
        this.bindEvents();
        this.setupFormValidation();
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
        // For now, open print dialog - in a real implementation you'd use a library like jsPDF
        this.printResume();
        this.showNotification('Use your browser\'s print function to save as PDF', 'info');
    }

    printResume() {
        window.print();
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