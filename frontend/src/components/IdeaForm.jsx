// src/components/IdeaForm.jsx
import React, { useState } from 'react';
import axios from 'axios';
import './IdeaForm.css';

// Get the API URL from environment variables
const API_URL = `${import.meta.env.VITE_API_BASE_URL}/ideas/`;

const IdeaForm = () => {
    const initialFormState = {
        title: '', description: '', current_process: '', task_frequency: 'Occasionally',
        impacted_parties: [], time_spent_weekly: '<1 hr', benefits: [], benefit_scale: '',
        value_estimate: 'Low (nice to have)', has_digital_records: 'Not Sure', data_storage: [],
        input_type: [], requires_human_judgment: '', ai_help_idea: '',
        seen_similar_solution: 'Not Sure', strategic_objectives: [],
    };

    const [formData, setFormData] = useState(initialFormState);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleCheckboxChange = (e, fieldName) => {
        const { value, checked } = e.target;
        const currentValues = formData[fieldName];
        if (checked) {
            setFormData({ ...formData, [fieldName]: [...currentValues, value] });
        } else {
            setFormData({ ...formData, [fieldName]: currentValues.filter((v) => v !== value) });
        }
    };

    const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/submit-answer/`, {
      conversation_id: currentConversationId, 
      answer: formData.description || formData.title,
    });
    alert('Idea submitted successfully!');
    setFormData(initialFormState);
  } catch (error) {
    console.error('Error submitting idea:', error.response?.data || error.message);
    alert('Failed to submit idea.');
  }
};


    return (
        <form onSubmit={handleSubmit} className="idea-form">
            <h2>Submit a New AI Use Case Idea</h2>
            <p>Use this form to collect AI use case ideas, translating business needs into actionable insights.</p>

            <fieldset>
                <legend>Problem Understanding (Operational Perspective)</legend>

                <div className="form-group">
                    <label htmlFor="title">Idea Title:</label>
                    <input type="text" id="title" name="title" value={formData.title} onChange={handleChange} required />
                </div>

                <div className="form-group">
                    <label htmlFor="description">1. What is the problem or task you'd like AI to help with?</label>
                    <textarea id="description" name="description" value={formData.description} onChange={handleChange} required placeholder="Encourage specific, real-world examples."></textarea>
                </div>
                
                <div className="form-group">
                    <label htmlFor="current_process">2. How is this task done today?</label>
                    <textarea id="current_process" name="current_process" value={formData.current_process} onChange={handleChange} required placeholder="Describe the current process, step-by-step, tools used, stakeholders involved."></textarea>
                </div>

                <div className="form-group">
                    <label htmlFor="task_frequency">3. [cite_start]How often does this task happen? [cite: 13]</label>
                    <select id="task_frequency" name="task_frequency" value={formData.task_frequency} onChange={handleChange}>
                        [cite_start]<option value="Multiple times a day">Multiple times a day [cite: 16]</option>
                        [cite_start]<option value="Daily">Daily [cite: 17]</option>
                        [cite_start]<option value="Weekly">Weekly [cite: 18]</option>
                        [cite_start]<option value="Monthly">Monthly [cite: 20]</option>
                        [cite_start]<option value="Occasionally">Occasionally [cite: 22]</option>
                    </select>
                </div>
                
                <div className="form-group">
                    <label>4. [cite_start]Who is impacted by this task/problem? [cite: 23]</label>
                    <div className="checkbox-group">
                        [cite_start]<label><input type="checkbox" value="Me" onChange={(e) => handleCheckboxChange(e, 'impacted_parties')} /> Me [cite: 25]</label>
                        [cite_start]<label><input type="checkbox" value="My team" onChange={(e) => handleCheckboxChange(e, 'impacted_parties')} /> My team [cite: 27]</label>
                        [cite_start]<label><input type="checkbox" value="Multiple teams" onChange={(e) => handleCheckboxChange(e, 'impacted_parties')} /> Multiple teams [cite: 29]</label>
                        [cite_start]<label><input type="checkbox" value="Our customers" onChange={(e) => handleCheckboxChange(e, 'impacted_parties')} /> Our customers [cite: 30]</label>
                        [cite_start]<label><input type="checkbox" value="Partners or suppliers" onChange={(e) => handleCheckboxChange(e, 'impacted_parties')} /> Partners or suppliers [cite: 36]</label>
                    </div>
                </div>

                <div className="form-group">
                    <label htmlFor="time_spent_weekly">5. [cite_start]How much time do you or others spend on this task per week? [cite: 37]</label>
                    <select id="time_spent_weekly" name="time_spent_weekly" value={formData.time_spent_weekly} onChange={handleChange}>
                        <option value="<1 hr">&lt;1 hr</option>
                        <option value="1-5 hrs">1-5 hrs</option>
                        <option value="5-10 hrs">5-10 hrs</option>
                        <option value="10+ hrs">10+ hrs</option>
                    </select>
                </div>
            </fieldset>

            <fieldset>
                <legend>Impact & Value (Commercial Perspective)</legend>
                
                <div className="form-group">
                    <label>6. [cite_start]What would be the benefit of solving this with AI? [cite: 40]</label>
                    <div className="checkbox-group">
                        [cite_start]<label><input type="checkbox" value="Time savings" onChange={(e) => handleCheckboxChange(e, 'benefits')} /> Time savings [cite: 43]</label>
                        [cite_start]<label><input type="checkbox" value="Cost reduction" onChange={(e) => handleCheckboxChange(e, 'benefits')} /> Cost reduction [cite: 45]</label>
                        [cite_start]<label><input type="checkbox" value="Increased revenue or sales" onChange={(e) => handleCheckboxChange(e, 'benefits')} /> Increased revenue or sales [cite: 48]</label>
                        [cite_start]<label><input type="checkbox" value="Better decision making" onChange={(e) => handleCheckboxChange(e, 'benefits')} /> Better decision making [cite: 49]</label>
                        [cite_start]<label><input type="checkbox" value="Improved customer experience" onChange={(e) => handleCheckboxChange(e, 'benefits')} /> Improved customer experience [cite: 50]</label>
                        [cite_start]<label><input type="checkbox" value="Reduced errors" onChange={(e) => handleCheckboxChange(e, 'benefits')} /> Reduced errors [cite: 51]</label>
                        [cite_start]<label><input type="checkbox" value="Compliance/risk reduction" onChange={(e) => handleCheckboxChange(e, 'benefits')} /> Compliance/risk reduction [cite: 52]</label>
                    </div>
                </div>

                <div className="form-group">
                    <label htmlFor="benefit_scale">7. [cite_start]What do you think the size of the benefit could be? [cite: 53]</label>
                    <textarea id="benefit_scale" name="benefit_scale" value={formData.benefit_scale} onChange={handleChange} placeholder="Attempt to quantify the scale of the potential benefit."></textarea>
                </div>

                <div className="form-group">
                    <label>8. [cite_start]Can you estimate how valuable the improvement would be? [cite: 55]</label>
                    <div className="radio-group">
                        [cite_start]<label><input type="radio" name="value_estimate" value="Low (nice to have)" checked={formData.value_estimate === 'Low (nice to have)'} onChange={handleChange} /> Low (nice to have) [cite: 56]</label>
                        [cite_start]<label><input type="radio" name="value_estimate" value="Moderate (useful regularly)" checked={formData.value_estimate === 'Moderate (useful regularly)'} onChange={handleChange} /> Moderate (useful regularly) [cite: 57]</label>
                        [cite_start]<label><input type="radio" name="value_estimate" value="High (business-critical or high ROI)" checked={formData.value_estimate === 'High (business-critical or high ROI)'} onChange={handleChange} /> High (business-critical or high ROI) [cite: 60]</label>
                    </div>
                </div>
            </fieldset>

            <button type="submit" className="submit-btn">Submit Idea</button>
        </form>
    );
};

export default IdeaForm;