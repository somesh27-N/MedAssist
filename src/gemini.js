const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';

export const isGeminiConfigured = !!GEMINI_API_KEY;

if (!isGeminiConfigured) {
  console.warn('Gemini API Key is missing in .env. Running image analysis pipeline in simulated/mock mode.');
}

/**
 * Sends a base64 encoded image to the Gemini 1.5 Flash API to extract medical structure.
 * @param {string} base64Data - Base64 encoded string of the image (without mime prefix).
 * @param {string} mimeType - The mime type (e.g. image/jpeg, image/png).
 * @returns {Promise<object>} Extracted structured medical records.
 */
export async function analyzeMedicalImage(base64Data, mimeType) {
  if (!isGeminiConfigured) {
    // Simulate API delay for mock response
    await new Promise(resolve => setTimeout(resolve, 2000));
    return {
      medications: [
        {
          name: 'Paracetamol',
          dose: '650mg',
          frequency: 'Three times daily',
          doctor: 'Dr. Sandeep Sen',
          hospital: 'Fortis Hospital',
          since: 'Today'
        },
        {
          name: 'Ibuprofen',
          dose: '400mg',
          frequency: 'As needed for pain',
          doctor: 'Dr. Sandeep Sen',
          hospital: 'Fortis Hospital',
          since: 'Today'
        }
      ],
      diseases: [
        {
          name: 'Viral Fever',
          since: new Date().getFullYear().toString(),
          status: 'active',
          note: 'Moderate body temperature, prescribing hydration'
        }
      ],
      surgeries: []
    };
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;
  
  const prompt = `Analyze the attached medical document image (prescription, lab report, discharge summary, or clinic invoice). Extract any:
1. Medications (including name, dosage/dose, frequency, prescribing doctor, hospital/clinic, since/start date)
2. Conditions/Diseases (including name, since/diagnosis year, status as 'active' or 'resolved', and notes)
3. Surgeries (including name, date, type, hospital, doctor, city)
4. Abnormalities (especially metrics in lab reports that are higher or lower than the reference safety/normal limits)
5. Clinical Suggestions (very simple, clear, actionable, and easy-to-understand lifestyle/dietary recommendations on how to lower, stabilize, or normalize those abnormal values, avoiding complex medical jargon).

Provide the result strictly as a raw valid JSON object (no markdown code blocks, no trailing backticks) matching this structure:
{
  "medications": [ { "name": "...", "dose": "...", "frequency": "...", "doctor": "...", "hospital": "...", "since": "..." } ],
  "diseases": [ { "name": "...", "since": "...", "status": "active|resolved", "note": "..." } ],
  "surgeries": [ { "name": "...", "date": "...", "type": "...", "hospital": "...", "doctor": "...", "city": "..." } ],
  "abnormalities": "Detailed list of abnormal values (e.g. 'Fasting Blood Glucose: 156 mg/dL (Reference: 70-100 mg/dL) - HIGH')",
  "suggestions": "Actionable, extremely simple, and easy-to-understand recommendations to help lower/stabilize these abnormal metrics (e.g. 'Drink plenty of water, reduce salt and sugar intake, walk 20 minutes after meals')"
}`;

  const requestBody = {
    contents: [
      {
        parts: [
          { text: prompt },
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Data
            }
          }
        ]
      }
    ]
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(requestBody)
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Gemini API error: ${response.status} - ${errText}`);
  }

  const jsonRes = await response.json();
  
  try {
    let extractedText = jsonRes.candidates[0].content.parts[0].text;
    
    // Clean markdown wraps (e.g. ```json ... ```)
    if (extractedText.includes('```')) {
      extractedText = extractedText.replace(/```json/g, '').replace(/```/g, '').trim();
    }
    
    const parsedData = JSON.parse(extractedText);
    
    // Ensure all arrays are defined
    return {
      medications: parsedData.medications || [],
      diseases: parsedData.diseases || [],
      surgeries: parsedData.surgeries || [],
      abnormalities: parsedData.abnormalities || '',
      suggestions: parsedData.suggestions || ''
    };
  } catch (err) {
    console.error('Failed to parse Gemini output:', err, jsonRes);
    throw new Error('AI analysis succeeded but returned data did not conform to the expected format.');
  }
}

/**
 * Generates a comprehensive health summary and recommendations using Gemini based on live patient data.
 * @param {object} patientData - The current patient profile and records.
 * @returns {Promise<string>} Markdown formatted health summary.
 */
export async function generateHealthSummary(patientData) {
  if (!isGeminiConfigured) {
    await new Promise(resolve => setTimeout(resolve, 1500));
    return `### AI Clinical Summary (Simulated)
* **General Status:** Patient **${patientData.name}** has **${patientData.currentDiseases?.length || 0} active conditions** and is taking **${patientData.medications?.length || 0} active medications**.
* **Clinical Assessment:** High blood glucose (HbA1c: 7.1%) and Stage 1 Hypertension are currently managed. Good compliance reported with Metformin and Amlodipine.
* **Recommendations:** Maintain a low-glycemic, low-sodium diet (<2g/day). Engage in 30 minutes of daily moderate exercise (e.g. brisk walking). Keep checking vitals regularly.`;
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;
  
  const prompt = `You are an expert AI clinical assistant. Generate a professional, highly concise health summary and recommendations based on the following patient data:
Name: ${patientData.name}
DOB: ${patientData.dob}
Gender: ${patientData.gender}
Blood Group: ${patientData.bloodGroup}

Active Diseases:
${(patientData.currentDiseases || []).map(d => `- ${d.name} (Since: ${d.since}, Note: ${d.note})`).join('\n')}

All Historical Diseases:
${(patientData.totalDiseases || []).map(d => `- ${d.name} (Since: ${d.since}, Status: ${d.status}, Note: ${d.note})`).join('\n')}

Medications:
${(patientData.medications || []).map(m => `- ${m.name} (${m.dose}, Frequency: ${m.frequency}, Prescribed by: ${m.doctor} at ${m.hospital}, Since: ${m.since})`).join('\n')}

Surgeries:
${(patientData.surgeries || []).map(s => `- ${s.name} (Date: ${s.date}, Type: ${s.type}, Hospital: ${s.hospital}, Surgeon: ${s.doctor})`).join('\n')}

Format the output cleanly in Markdown, containing these bulleted/structured sections:
1. **Clinical Health Overview** (A professional, concise summary of current health state)
2. **Current Medication & Adherence Risks** (Brief analysis of prescriptions)
3. **Lifestyle & Dietary Recommendations** (Specific to their diabetes/hypertension/surgeries if any)
4. **Follow-up & Preventative Actions** (Next steps)`;

  const requestBody = {
    contents: [
      {
        parts: [
          { text: prompt }
        ]
      }
    ]
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(requestBody)
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Gemini API error: ${response.status} - ${errText}`);
  }

  const jsonRes = await response.json();
  try {
    return jsonRes.candidates[0].content.parts[0].text;
  } catch (err) {
    console.error('Failed to parse Gemini output:', err, jsonRes);
    throw new Error('AI health summary generation failed to parse.');
  }
}
