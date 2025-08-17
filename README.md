# PhD to Industry Resume Tool

A specialized web application designed for PhDs and postdocs transitioning from academia to industry careers. Transform your academic experience into industry-ready resumes that speak the language of your target sector.

## ✨ **Enhanced Features**

### **🚀 Multiple Input Methods**
- **LinkedIn Import**: Connect your LinkedIn profile to auto-fill basic information (coming soon)
- **File Upload**: Upload existing resume/CV (PDF, DOC, DOCX) for parsing and conversion
- **Manual Entry**: Complete control with guided form fields

### **✏️ Inline Editing**
- **Click-to-Edit**: Edit any text directly in the resume preview
- **Real-time Updates**: Changes sync automatically with form data
- **Visual Feedback**: Clear indicators for editable elements

### **📄 Professional PDF Export**
- **High-Quality PDF**: Download print-ready resume as PDF
- **Print Optimization**: Clean formatting for printing
- **Industry Styling**: Maintains professional appearance

### **🎯 Academic-to-Industry Translation**
- **PhD-Specific Sections**: Core competencies, technical skills, publications, presentations
- **Industry Targeting**: Tailored for biotech, pharma, consulting, tech, finance, and more
- **Language Translation**: Convert academic terminology to business language
- **Expert Guidance**: Built-in tips for each industry transition

## Target Industries for PhD/Postdoc Transitions

- **Biotechnology** - Research and development roles
- **Pharmaceuticals** - Drug discovery and development
- **Technology/Software** - Data science and computational roles
- **Consulting** - Scientific and strategy consulting
- **Finance/Investment** - Quantitative analysis and research
- **Healthcare/Medical Devices** - Product development and regulatory
- **Government/Policy** - Science policy and regulatory affairs
- **Regulatory Affairs** - Compliance and submissions
- **Marketing/Communications** - Scientific marketing and communications
- **Academia/Research** - Industry research positions

## Specialized Resume Sections

### Academic Experience Translation
- **Executive Summary**: Focus on value proposition for industry
- **Core Competencies**: High-level expertise areas relevant to target industry
- **Technical Skills**: Organized by computational, laboratory, and other skills
- **Publications**: Selected publications relevant to industry role
- **Presentations & Awards**: Communication skills and recognition
- **Certifications**: Industry-relevant professional certifications

### Built-in Translation Guidance
- Convert "research projects" to "project management experience"
- Translate "data analysis" to industry-specific applications
- Emphasize transferable skills like team leadership and budget management
- Quantify achievements with metrics relevant to business impact

## Usage

### **Quick Start Options**

#### 1. **Import from LinkedIn** (Coming Soon)
- Click "Import from LinkedIn" for instant population
- OAuth-based secure connection
- Automatic academic-to-industry translation

#### 2. **Upload Existing Resume/CV**
- Click "Upload Resume/CV"
- Support for PDF, DOC, and DOCX files
- Intelligent parsing and field mapping
- Industry-specific optimization

#### 3. **Manual Entry**
- Complete the guided form step-by-step
- Real-time preview updates
- Industry-specific guidance and tips

### **Editing Your Resume**

1. **Form-Based Editing**: Use the left panel to input/modify information
2. **Inline Editing**: 
   - Click "Enable Editing" in the preview panel
   - Click any text in the preview to edit directly
   - Press Enter or click outside to save changes
   - Changes sync automatically with the form

### **Downloading Your Resume**

1. Click "Generate Resume" to create your preview
2. Use "Enable Editing" for final touch-ups
3. Click "Download PDF" for a print-ready file
4. Use your browser's "Save as PDF" option in the print dialog

## Academic-to-Industry Translation Tips

### For Biotechnology/Pharmaceuticals
- Emphasize drug discovery, biomarker development, and therapeutic applications
- Highlight regulatory knowledge (GLP, GCP, IND applications)
- Include collaboration with industry partners or clinical teams

### For Technology/Software
- Translate computational research into software development language
- Emphasize programming languages, data analysis, and ML experience
- Highlight algorithm development and large dataset management

### For Consulting
- Focus on problem-solving methodology and analytical thinking
- Emphasize client communication and presentation skills
- Quantify business impact of research findings

### For Finance
- Highlight quantitative analysis and statistical modeling
- Include experience with financial modeling or risk assessment
- Emphasize data-driven decision making

## Deployment

### GitHub Pages
1. Push this code to a GitHub repository
2. Go to repository Settings → Pages
3. Select source branch (usually `main`)
4. Access at `https://yourusername.github.io/repositoryname`

### Vercel
1. Connect your GitHub repository to Vercel
2. Deploy automatically with zero configuration
3. Access at your provided Vercel URL

## File Structure

```
IndustryResumeTool/
├── index.html          # Main application with PhD-specific form
├── styles.css          # Styling with academic-to-industry themes
├── script.js           # Resume generation and academic translation logic
├── README.md           # This documentation
└── .github/workflows/  # Automated deployment configuration
```

## Key Differences from Standard Resume Tools

1. **Academic Sections**: Includes publications, presentations, and technical skills specific to PhD/postdoc experience
2. **Translation Focus**: Built-in guidance for converting academic language to industry terminology
3. **Industry Targeting**: Specialized for fields that commonly hire PhDs and postdocs
4. **Technical Skills Organization**: Separates computational, laboratory, and other technical skills
5. **Research-to-Business Translation**: Helps emphasize business impact and transferable skills

## Browser Compatibility

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Contributing

We welcome contributions, especially from career counselors, industry professionals, and PhDs who have successfully transitioned to industry.

1. Fork the repository
2. Create a feature branch
3. Test with real PhD/postdoc resume examples
4. Submit a pull request

## Future Enhancements

- [x] **LinkedIn Import**: OAuth-based profile import (framework ready)
- [x] **File Upload & Parsing**: PDF/DOC/DOCX resume upload capability
- [x] **Inline Editing**: Click-to-edit functionality in preview
- [x] **PDF Export**: High-quality resume download
- [ ] **Advanced PDF Libraries**: Integration with jsPDF for enhanced formatting
- [ ] **LinkedIn OAuth Integration**: Full LinkedIn API connection
- [ ] **PDF/Word Parsing**: Complete document parsing with PDF.js and mammoth.js
- [ ] **Industry-specific resume templates**: Multiple design options
- [ ] **Academic language → Industry language translator**: AI-powered suggestions
- [ ] **Integration with academic databases**: ORCID, Google Scholar auto-import
- [ ] **Cover letter generator**: Industry-specific cover letters
- [ ] **Resume scoring**: ATS optimization scoring
- [ ] **Job matching**: Integration with job boards

## Support

For questions specific to academic-to-industry transitions:
1. Check our industry-specific guidance in the tool
2. Review sample translations and tips
3. Create an issue for additional industries or features

## License

This project is open source and available under the [MIT License](LICENSE).

---

**Built specifically for PhDs and postdocs making the transition to industry careers. Your research experience is valuable – let's translate it effectively.**