# Upwork Agent Upgrade: Multi-Persona Strategy

This document outlines the requirements and strategy for upgrading the Upwork Agent to intelligently switch between "Automation Engineer" and "Fullstack Developer" personas.

## 1. Strategy Overview: "Auto-Detect & Switch"
We will implement a logic layer that classifies the incoming Job Description and selects the appropriate persona before generating any content.

**The Flow:**
`Job Description` -> **[Classifier Node]** (Dev vs. Automation) -> **[Select Profile Data]** -> **[Generate Proposal]**

---

## 2. Prerequisites (Input Needed from You)

To implement this, we need to populate a "Profile Store". Please prepare the following details:

### A. Personas
We need distinct copy for each role.

#### **Profile 1: Automation Engineer (Existing)**
*   **Focus:** n8n, Make, AI Agents, Workflow Efficiency.
*   **Bio/Pitch:** (We have this from your current file, but you may want to refine it).
*   **The Hook:** "Systems that run without babysitting."

#### **Profile 2: Fullstack Developer (New)**
*   **Focus:** Core coding (React, Node.js, Python), Database Design, Scalable Architecture, Custom APIs.
*   **Bio/Pitch:** Write a short paragraph (2-3 sentences) pitching your dev skills.
    *   *Example:* "I am a Senior Fullstack Developer specializing in scalable web applications using React, Node.js, and AWS. I focus on clean architecture, pixel-perfect UI/UX, and robust backend systems that scale."
*   **The Hook:** What is your unique value prop? (e.g., "Performance-first mindset," "Enterprise-grade security," "Rapid prototyping").

### B. Case Studies (Optional but Recommended)
Instead of generic AI-generated examples, provide 3 real bullet points for each:

*   **Automation Wins:**
    *   (e.g., "Automated lead qualification saving 20 hours/week...")
    *   (e.g., "Built an AI content engine for...")
*   **Dev Wins:**
    *   (e.g., "Built a SaaS dashboard handling 10k users...")
    *   (e.g., "Migrated legacy PHP app to Next.js...")

### C. Google Doc Templates
*   **Decision:** Will you use ONE generic template or TWO specific ones?
    *   *Recommendation:* **Two Templates**. A "System Workflow" doc looks different from coverage of a "Web App Architecture".
*   **Requirement:** If choosing Two Templates, please provide the **Google Doc ID** for the Fullstack version. (You can duplicate the existing one and rename headers from "Automation Flow" to "App Architecture").

---

## 3. Proposed Implementation Details

### Data Structure (The "Profile Store")
We will implement a `Switch` or `Code` node at the start of your sub-workflows containing this config:

```json
{
  "profiles": {
    "automation": {
      "roleName": "Automation & AI Engineer",
      "bio": "I’m an automation engineer...",
      "keywords": ["n8n", "zapier", "make", "webhook", "agent", "workflow"],
      "templateId": "EXISTING_ID_16Ew..."
    },
    "fullstack": {
      "roleName": "Senior Fullstack Developer",
      "bio": "I’m a fullstack developer...",
      "keywords": ["react", "node", "typescript", "css", "db", "frontend", "backend"],
      "templateId": "NEW_ID_OR_SAME"
    }
  }
}
```

### Classification Logic (Edge Cases)
*   **Hybrid Jobs:** If a job asks for "React app with OpenAI integration", we need a tie-breaker.
    *   *Preference:* We normally default to "Fullstack" for hybrid jobs because coding is the harder constraint, but we can highlight automation as a "Superpower" in the proposal.

### Instructions to Agent
We will update the System Prompt in `gpt-4o` to dynamically accept these variables:
*   `{{roleName}}`
*   `{{bio}}`
*   `{{relevantExperience}}`

---

## 4. Next Steps
Once you fill in the **Fullstack Ecosystem (Bio/Hook)** and decide on the **Template Strategy**, I will edit the JSON workflows to inject this logic.
