# 🛠️ Setup Guide: Blog System Automation

This guide walks you through configuring the **Blog System** workflow to automate blog post creation, image generation, and social media distribution using n8n.

> **Latest Updates:**
> *   🚀 **Data Mapping**: A new node explicitly maps spreadsheet data to variables, making the workflow easier to maintain.
> *   🛡️ **Dynamic Filenames**: Images are now automatically saved with unique names (e.g., `image-20250114-123456.jpg`) to prevent overwrites.
> *   ⚡ **Optimized**: Unnecessary data removed for faster loading.

---

## ✅ Step 1: Set Up Key Credentials
You need to configure the following credentials in n8n for the workflow to function:

1.  **Google Sheets**:
    *   Open the **"Update row in sheet"** node.
    *   Create a new credential for **Google Sheets OAuth2 API**.
    *   Authenticate with the Google account that has access to your blog planning sheet.

2.  **OpenAI**:
    *   Open any OpenAI node (e.g., **"SEO Optimization"**).
    *   Create a credential for **OpenAi API**.
    *   Enter your OpenAI API Key (needs GPT-4 access for best results).

3.  **Google Gemini (PaLM)**:
    *   Open the **"Google Gemini Chat Model"** node.
    *   Create a credential for **Google Gemini(PaLM) API**.
    *   Enter your Google Gemini API Key.

4.  **WordPress**:
    *   Open the **"Create a post"** node.
    *   Create a credential for **WordPress API**.
    *   Enter your WordPress URL, Username, and [Application Password](https://make.wordpress.org/core/2020/11/05/application-passwords/) (not your login password).

---

## ✅ Step 2: Configure Perplexity AI
The "Create blog post agent" uses Perplexity for research.
1.  Navigate to the **"Message a model in Perplexity"** node (inside the agent or connected to it).
2.  Add your **Perplexity API Key**.
3.  *Note: The workflow uses the `sonar-pro` model by default.*

---

## ✅ Step 3: Configure Blotato (Twitter Publishing)
This workflow uses **Blotato** to publish content to Twitter.
1.  Open the **"Create post in blotato"** and **"Publish on twitter"** nodes.
2.  Locate the `blotato-api-key` header.
3.  **Replace the existing key** (or placeholder) with your own Blotato API Key.
4.  Update the `accountId` in the JSON body if necessary.

---

## ✅ Step 4: Configure Image Uploads (Media)
The workflow creates images and uploads them to your WordPress media library via an HTTP request.
1.  Open the **"Save Image"** node.
2.  Update the **URL** to your own WordPress site (e.g., `https://your-site.com/wp-json/wp/v2/media`).
3.  **Authentication**:
    *   The workflow may show a placeholder `Authorization` header (e.g., `Basic <API_KEY>`). **Delete this header**.
    *   Instead, scroll to **Authentication** and select **"Generic Credential Type"**.
    *   Select **Basic Auth** and use your WordPress Admin Username and Application Password.
4.  **Filenames**:
    *   The node is pre-configured to generate unique filenames automatically. **Do not change the Content-Disposition header** unless you want a different naming convention.

---

## ✅ Step 5: Data Mapping & Customization
1.  **Data Mapping (New)**:
    *   Locate the **"Data Mapping"** node (after the Switch).
    *   This node extracts the **Topic** from your Google Sheet (`rowValues[0]['0']`).
    *   If you change your spreadsheet column order, update the expression here. The rest of the workflow uses the clean `{{ $json.topic }}` variable.

2.  **Blog Tone**:
    *   Open the **"Blog Tone Match"** node and edit the System Message to match your brand's voice.

3.  **Image Style**:
    *   Open the **"Generate an image1"** node and update the prompt to generate images that fit your brand aesthetics.

---

## ✅ Step 6: Activate & Run
1.  **Trigger**: The workflow starts with a **Webhook**.
2.  **Test**: Click "Execute Workflow" and send a test POST request to the webhook URL with a JSON body:
    ```json
    { "value": "TRUE", "rowValues": ["Your Blog Topic"] }
    ```
3.  **Verify**: Check your WordPress site for the draft post and your Google Sheet for the updated links.
