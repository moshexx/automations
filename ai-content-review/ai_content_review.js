const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');
const axios = require('axios');
require('dotenv').config();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const GOOGLE_SHEETS_ID = process.env.GOOGLE_SHEETS_ID;
const GOOGLE_SHEETS_TOPICS_ID = process.env.GOOGLE_SHEETS_ID;
const SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
const PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n');

const GPT_MODEL = "gpt-4o";
const MAX_ITERATIONS = 3;
const language = 'עברית';
const platform = 'פייסבוק';
const businessName = 'פשוטומציה';

/**
 * Removes asterisks from GPT output
 */
function removeAsterisks(text) {
    return text.replace(/\*/g, '');
}

async function fetchTopicsFromGoogleSheets() {
    const serviceAccountAuth = new JWT({
        email: SERVICE_ACCOUNT_EMAIL,
        key: PRIVATE_KEY,
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const doc = new GoogleSpreadsheet(GOOGLE_SHEETS_TOPICS_ID, serviceAccountAuth);
    try {
        await doc.loadInfo();
        const sheet = doc.sheetsByIndex[0];
        const rows = await sheet.getRows();
        
        return rows
            .filter(row => row["Used"] === "FALSE")
            .map(row => row["Topic"])
            .filter(Boolean);
    } catch (error) {
        console.error("❌ Error fetching topics from Google Sheets:", error);
        return [];
    }
}


/**
 * Generates content ready for publication
 */
async function generateContent(topic, lastPost, lastFeedback) {
    let prompt = `אתה יוצר תוכן מקצועי שמתמחה בכתיבה לפייסבוק עבור עסקים קטנים ובינוניים. התוכן צריך להיות מוכן לפרסום, בלי כותרות, בלי רשימות, בלי כוכביות ובלי דוגמאות שלא קרו. הטקסט צריך להיות קליל, ברור ומניע לפעולה. תשלב אימוג'ים בצורה טבעית, כאילו נכתב על ידי משווק שמכיר את הקהל. אם יש צורך לציין את שם העסק, השתמש בשם "${businessName}". אין לכלול מספרי טלפון או כתובות מייל בפוסטים. אין להשתמש בכוכביות בטקסט.`;

    if (lastPost && lastFeedback) {
        prompt += `\n\nהנה הגרסה הקודמת של הפוסט יחד עם המשוב שניתן עליה:\n\nגרסה קודמת:\n${lastPost}\n\nמשוב:\n${lastFeedback}\n\nכתוב מחדש את הפוסט על הנושא: ${topic} תוך שיפור המבנה והשפה בהתאם למשוב.`;
    } else {
        prompt += `\n\nכתוב פוסט חדש על הנושא: ${topic}.`;
    }

    const response = await axios.post("https://api.openai.com/v1/chat/completions", {
        model: GPT_MODEL,
        messages: [{ role: "system", content: prompt }]
    }, {
        headers: { "Authorization": `Bearer ${OPENAI_API_KEY}` }
    });

    return removeAsterisks(response.data.choices[0].message.content);
}

/**
 * Reviews the generated content and provides scores with feedback.
 */
async function reviewContent(content) {
    const response = await axios.post("https://api.openai.com/v1/chat/completions", {
        model: GPT_MODEL,
        messages: [
            { role: "system", content: `You are a professional content reviewer.
            Evaluate the following post based on the criteria below, giving a score from 1 to 10:
            - Clarity & Readability
            - Engagement & Relevance
            - Brand Consistency
            - Practical Value
            - SEO & Formatting
            - Call-to-Action (CTA)
            7. The language should be in ${language} !
            
            If any category scores below 9, provide detailed feedback for improvement.` },
            { role: "user", content: `Review the following post and provide category-wise scores: ${content}` }
        ]
    }, {
        headers: { "Authorization": `Bearer ${OPENAI_API_KEY}` }
    });

    return removeAsterisks(response.data.choices[0].message.content);
}

/**
 * Improves the content based on the provided feedback.
 */
async function improveContent(content, review) {
    const response = await axios.post("https://api.openai.com/v1/chat/completions", {
        model: GPT_MODEL,
        thread_id: threadId,  // הוספת thread_id
        messages: [
            { role: "system", content: `You are a senior content creator and social media manager. I’m sending you a post to review and edit. Please focus on the following points:Ensure the post follows marketing principles.The post is for a business named פשוטומציה, which focuses on automation process development for businesses.The language should be casual, friendly, and easy to understand.Integrate emojis in the post.The post should be between 10-15 lines, so it’s easy for people to read.Do not include any success stories of our business in the post.Please make the necessary edits and ensure the content is engaging and aligns with these guidelines. Improve the post based on the provided feedback.` },
            { role: "user", content: `Improve the following post based on the feedback:\n\n**Current content:**\n${content}\n\n**Feedback:**\n${review}` }
        ]
    }, {
        headers: { "Authorization": `Bearer ${OPENAI_API_KEY}` }
    });

    return removeAsterisks(response.data.choices[0].message.content);
}

/**
 * Checks if the content is approved (all scores are 9 or higher).
 */
function isContentApproved(review) {
    const scores = review.match(/\d+/g)?.map(Number) || [];
    return scores.length > 0 && scores.every(score => score >= 9);
}

/**
 * Saves data to Google Sheets.
 */
async function saveToGoogleSheets(topic, firstDraft, finalContent, initialFeedback, finalScores, iterations) {
    const serviceAccountAuth = new JWT({
        email: SERVICE_ACCOUNT_EMAIL,
        key: PRIVATE_KEY,
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const doc = new GoogleSpreadsheet(GOOGLE_SHEETS_ID, serviceAccountAuth);

    try {
        await doc.loadInfo();
        const sheet = doc.sheetsByIndex[0];

        await sheet.addRow({
            "Post Topic": topic,
            "Initial Draft": firstDraft,
            "Final Version": finalContent,
            "First Iteration Feedback": initialFeedback,
            "Final Scores": finalScores,
            "Iteration Count": iterations,
            "Creation Date": new Date().toLocaleDateString(),
            "Approval Date": new Date().toLocaleDateString()
        });

        console.log("✅ Post saved to Google Sheets!");
    } catch (error) {
        console.error("❌ Error saving data to Google Sheets:", error);
    }
}

/**
 * Iteratively improves content up to a maximum of three iterations.
 */
async function iterativeImprovement(topic, lastPost = null, lastFeedback = null) {
    let firstDraft = await generateContent(topic, lastPost, lastFeedback);
    let review = await reviewContent(firstDraft);
    let initialFeedback = review;
    let iteration = 1;
    let finalContent = firstDraft;

    while (!isContentApproved(review) && iteration < MAX_ITERATIONS) {
        console.log(`🔄 Iteration ${iteration} - Improving content`);
        finalContent = await improveContent(finalContent, review);
        review = await reviewContent(finalContent);
        iteration++;
        if (iteration == MAX_ITERATIONS) {
            console.log("✅ Maximum iterations reached!");
        }
    }

    console.log("✅ Content approved");

    await saveToGoogleSheets(topic, firstDraft, finalContent, initialFeedback, review, iteration);
    return finalContent;
}

/**
 * Fetches the last post and its feedback from Google Sheets.
 */
async function getLastPostFromGoogleSheets() {
    const serviceAccountAuth = new JWT({
        email: SERVICE_ACCOUNT_EMAIL,
        key: PRIVATE_KEY,
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const doc = new GoogleSpreadsheet(GOOGLE_SHEETS_ID, serviceAccountAuth);

    try {
        await doc.loadInfo();
        const sheet = doc.sheetsByIndex[0];
        const rows = await sheet.getRows();

        if (rows.length === 0) {
            console.log("⚠️ No previous posts found in Google Sheets.");
            return { lastPost: null, lastFeedback: null };
        }

        // Get the last row
        const lastRow = rows[rows.length - 1];

        // Print available keys and raw data
        // console.log("🔍 Available raw data in last row:", lastRow._rawData);
        // console.log("📑 Column headers:", lastRow._worksheet.headerValues);

        // Get column headers and their respective values from _rawData
        const headers = lastRow._worksheet.headerValues;
        const values = lastRow._rawData;

        // Ensure headers exist
        if (!headers || !values || headers.length !== values.length) {
            console.log("⚠️ Column headers and values do not match.");
            return { lastPost: null, lastFeedback: null };
        }

        // Map column names to values
        const rowData = Object.fromEntries(headers.map((key, index) => [key, values[index]]));

        // console.log("📄 Mapped row data:", rowData);

        return {
            lastPost: rowData["Final Version"]?.trim() || null,
            lastFeedback: rowData["First Iteration Feedback"]?.trim() || null
        };
    } catch (error) {
        console.error("❌ Error fetching data from Google Sheets:", error);
        return { lastPost: null, lastFeedback: null };
    }
}

async function processTopics() {
    const topics = await fetchTopicsFromGoogleSheets();
    if (topics.length === 0) {
        console.log("⚠️ No topics found.");
        return;
    }

    for (const topic of topics) {
        console.log(`🚀 Processing topic: ${topic}`);
        const { lastPost, lastFeedback } = await getLastPostFromGoogleSheets();
        const finalContent = await iterativeImprovement(topic, lastPost, lastFeedback);
        console.log(`📌 Final content for '${topic}':`, finalContent);
    }
}

/**
 * Executes the system with input from the last post.
 */
(async () => {
    processTopics();


    // const topic = "טעויות נפוצות בהטמעת אוטומציה ואיך להימנע מהן";

    // // Fetch last post and feedback from Google Sheets
    // const { lastPost, lastFeedback } = await getLastPostFromGoogleSheets();

    // if (lastPost) {
    //     console.log("📄 Found previous post! Using it as a base for improvement:");
    //     // console.log(`🔹 Previous Version:\n${lastPost}`);
    //     console.log(`💡 Reviewer Feedback:\n${lastFeedback}\n\n`);
    // } else {
    //     console.log("🆕 No previous post found. Creating a new one.");
    // }

    // // Start the improvement process with adjusted input
    // const finalContent = await iterativeImprovement(topic, lastPost, lastFeedback);
    // console.log("📌 Final Approved Content:", finalContent);
})();
