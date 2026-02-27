import React, { useState, useEffect } from 'react';
import guidelineService from '../services/guidelineService';

// Fallback data in case the server request fails or takes a moment
const fallbackGuidelines = [
  {
    id: 1,
    title: "1. Know Your Course Policies",
    content: "AI rules vary dramatically from one class to the next. What is encouraged in a computer science class might be considered cheating in a literature seminar. Always check your syllabus before using AI for coursework. If you are ever unsure about if, how, or when AI is appropriate, explicitly ask your instructor and never assume it is allowed."
  },
  {
    id: 2,
    title: "2. Supplement, Don't Substitute",
    content: "AI is an incredible tool for brainstorming, overcoming writer's block, summarizing long articles, and explaining complex terminology. However, it should never replace your own critical thinking. Do not use AI to generate your final assignment. The goal of university is to build your own cognitive skills; outsourcing your thinking to AI defeats the purpose of your education."
  },
  {
    id: 3,
    title: "3. Verify Everything (Beware Hallucinations)",
    content: "Generative AI models are designed to predict the next word, not to tell the truth. They can and will confidently generate false information, fake statistics, and completely fabricated citations. You are 100% responsible for the accuracy of the work you submit. Always cross-reference AI-generated facts with reliable, academic sources."
  },
  {
    id: 4,
    title: "4. Cite and Be Transparent",
    content: "If you use AI to assist in your coursework, you must be transparent about it. If you submit AI-generated text or ideas as your own original work without acknowledgement, it is considered plagiarism. Always document which tools you used (e.g., ChatGPT, Gemini), what prompts you used, and exactly how the AI contributed to your final product."
  },
  {
    id: 5,
    title: "5. Protect Privacy and Data",
    content: "Public AI tools learn from the data you feed them. Never input sensitive personal information, proprietary research, unpublished data, or confidential university information into a generative AI tool. Treat the chat box as a public forum."
  },
  {
    id: 6,
    title: "6. Watch for Bias",
    content: "AI models are trained on massive datasets from the internet, which means they absorb and reflect human prejudices. AI outputs can perpetuate social, cultural, and political biases. Always critically evaluate the content AI gives you to ensure fairness, accuracy, and consideration of diverse viewpoints."
  }
];
const Guidelines = () => {
  // State to track which guideline is currently open in full-screen mode
  const [activeGuideline, setActiveGuideline] = useState(null);
  const [guidelines, setGuidelines] = useState(fallbackGuidelines);

  // load from server once
  useEffect(() => {
    const load = async () => {
      try {
        const data = await guidelineService.getGuidelines();
        if (Array.isArray(data) && data.length) {
          setGuidelines(data);
        }
      } catch (err) {
        console.error('Could not fetch guidelines, using fallback', err);
      }
    };
    load();
  }, []);

  return (
    <div style={styles.sectionContainer}>
      <h3 style={styles.header}>General Guidelines for AI Usage</h3>
      
      {/* The Button Grid */}
      <div style={styles.buttonGrid}>
        {guidelines.map((guide) => (
          <button 
            key={guide._id || guide.id} 
            style={styles.guidelineButton}
            onClick={() => setActiveGuideline(guide)}
          >
            {guide.title}
          </button>
        ))}
      </div>

      {/* The Full-Screen Modal Overlay */}
      {activeGuideline && (
        <div style={styles.fullScreenModal}>
          <div style={styles.modalContent}>
            <h2 style={styles.modalTitle}>{activeGuideline.title}</h2>
            <p style={styles.modalText}>{activeGuideline.content}</p>
            
            <button 
              style={styles.closeButton} 
              onClick={() => setActiveGuideline(null)}
            >
              Close Guideline
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// CSS-in-JS Styles
const styles = {
  sectionContainer: {
    marginTop: '30px',
    padding: '20px',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
    border: '1px solid #e9ecef'
  },
  header: {
    marginTop: '0',
    color: '#333',
    marginBottom: '20px'
  },
  buttonGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '15px'
  },
  guidelineButton: {
    padding: '15px',
    fontSize: '1rem',
    fontWeight: 'bold',
    color: '#0056b3',
    backgroundColor: '#fff',
    border: '2px solid #0056b3',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    textAlign: 'left'
  },
  
  // Full-Screen Modal Styles
  fullScreenModal: {
    position: 'fixed',
    top: '60px',             // leave room for the fixed navbar
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.9)', // Dark transparent background
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000 // sits beneath the navbar but above page content
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: '50px',
    borderRadius: '12px',
    maxWidth: '800px',
    width: '90%',
    maxHeight: '80vh',        // prevent overflow beyond viewport
    overflowY: 'auto',       // scroll when content is long
    textAlign: 'center',
    boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
  },
  modalTitle: {
    fontSize: '2rem',
    color: '#333',
    marginBottom: '20px'
  },
  modalText: {
    fontSize: '1.2rem',
    lineHeight: '1.6',
    color: '#555',
    marginBottom: '40px',
    textAlign: 'left'
  },
  closeButton: {
    padding: '12px 24px',
    fontSize: '1.1rem',
    backgroundColor: '#dc3545',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: 'bold'
  }
};

export default Guidelines;