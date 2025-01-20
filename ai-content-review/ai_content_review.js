const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');
require('dotenv').config();


// הגדרת משתני הסביבה לקריאה מהמפתח של OpenAI ו-Google Sheets
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const GOOGLE_SHEETS_ID = process.env.GOOGLE_SHEETS_ID;
const SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
const PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY.replace(/\n/g, '\n');

const GPT_MODEL = "gpt-4";

/**
 * פונקציה ליצירת פוסט ראשוני בעזרת OpenAI
 * מקבלת נושא ומחזירה פוסט ממוקד ואיכותי
 */
async function generateContent(topic) {
    const response = await axios.post("https://api.openai.com/v1/chat/completions", {
        model: GPT_MODEL,
        messages: [
            { role: "system", content: `You are a professional content creator specializing in writing engaging, practical, and easy-to-understand posts for small and medium-sized business owners. Your goal is to create high-quality content that is clear, valuable, and actionable, helping business owners understand automation, efficiency, and digital tools.

### Guidelines for Writing:
1. Clarity & Simplicity – The language must be clear, simple, and jargon-free, making automation and business efficiency easy to understand for non-technical business owners.
2. Relevance & Engagement – The post should address a real pain point or challenge that business owners face, providing insights that are directly relevant to their daily operations.
3. Practical Value – Provide actionable steps, clear takeaways, or a useful framework that readers can implement immediately.
4. Brand Voice & Tone – The writing should feel friendly, professional, and approachable, reflecting the Pashutomazia brand – a balance between expertise and simplicity.
5. Structured Format – Use concise paragraphs, bullet points, and headings to improve readability and scanning.
6. Call-to-Action (CTA) – Every post should guide the reader to reflect, take action, or explore more (e.g., book a consultation, check a tool, or assess their business processes).

Content Length:
- Write a 150-200 word post on the given topic.
- Keep it focused and to the point.` },
            { role: "user", content: `Generate an engaging, structured, and actionable post on the topic: ${topic}` }
        ]
    }, {
        headers: { "Authorization": `Bearer ${OPENAI_API_KEY}` }
    });
    return response.data.choices[0].message.content;
}

/**
 * פונקציה לביקורת על התוכן שנוצר
 * מחזירה ציונים ומשוב לשיפור
 */
async function reviewContent(content) {
    const response = await axios.post("https://api.openai.com/v1/chat/completions", {
        model: GPT_MODEL,
        messages: [
            { role: "system", content: `You are a content reviewer specializing in evaluating posts for small and medium-sized businesses. Your role is to review, rate, and refine the content so that it is clear, professional, engaging, and practical for business owners who need automation and efficiency solutions.

Evaluate the content and provide a score from 1 to 10 in the following categories:
- Clarity & Readability
- Engagement & Relevance
- Style & Brand Consistency
- Practical Value
- SEO & Formatting
- Call-to-Action (CTA)

If any category receives a score below 9, provide detailed feedback on how to improve.` },
            { role: "user", content: `Review the following post and provide scores from 1-10 in each category: ${content}` }
        ]
    }, {
        headers: { "Authorization": `Bearer ${OPENAI_API_KEY}` }
    });
    return response.data.choices[0].message.content;
}

/**
 * פונקציה לשמירת הפוסט והמשוב ל-Google Sheets
 */
async function saveToGoogleSheets(topic, content, review) {
    const doc = new GoogleSpreadsheet(GOOGLE_SHEETS_ID);
    console.log(doc);
    try {
        
        await doc.useServiceAccountAuth({
            client_email: SERVICE_ACCOUNT_EMAIL,
            private_key: PRIVATE_KEY,
        });
        await doc.loadInfo();
        const sheet = doc.sheetsByIndex[0];
        
        await sheet.addRow({ Topic: topic, Content: content, Review: review, Date: new Date().toLocaleString() });
        console.log("✅ הפוסט נשמר ב-Google Sheets!");
    } catch (error) {
        console.error("שגיאה באימות ה-Service Account:", error);
    }
}

/**
 * פונקציה לניהול שיפור תוכן באיטרציות
 */
async function iterativeImprovement(topic) {
    // let content = await generateContent(topic);
    // let review = await reviewContent(content);
    
    // while (!isContentApproved(review)) {
    //     content = await improveContent(content, review);
    //     review = await reviewContent(content);
    // }
    
    // let topic = 'topic test';
    let content = 'content test';
    let review = 'review test';

    await saveToGoogleSheets(topic, content, review);
    return content;
}

/**
 * בודקת האם התוכן עומד בדרישות (כל הציונים 9 ומעלה)
 */
function isContentApproved(review) {
    return !review.includes("score below 9");
}

/**
 * משפר את התוכן לפי המשוב שניתן מהביקורת
 */
async function improveContent(content, review) {
    const response = await axios.post("https://api.openai.com/v1/chat/completions", {
        model: GPT_MODEL,
        messages: [
            { role: "system", content: "You are a professional content creator improving content based on review feedback." },
            { role: "user", content: `Here is a post that needs improvement based on feedback: ${content}\nFeedback: ${review}` }
        ]
    }, {
        headers: { "Authorization": `Bearer ${OPENAI_API_KEY}` }
    });
    return response.data.choices[0].message.content;
}

/**
 * הפעלת המערכת ליצירת ושיפור פוסטים
 */
(async () => {
    const finalContent = await iterativeImprovement("איך אוטומציה משפרת את היעילות העסקית");
    console.log("Final Approved Content:", finalContent);
})(); 
