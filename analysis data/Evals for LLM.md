Great — let's walk through a step-by-step process to create meaningful, application-specific AI evals for a Customer Support Chatbot in a Warehouse Management System (WMS).

We'll follow the 4-step framework from the image, but customize every part to fit WMS support chat use cases like:
	•	Inbound issues (e.g. GRN mismatch)
	•	Inventory discrepancies
	•	HU scan failures
	•	Picking delays
	•	OMS/WMS sync issues

✅ Step 1: Collect Real or Synthetic Traces

🎯 Goal:

Gather real chat logs (preferred) or synthetic examples of user interactions to analyze where the chatbot may fail.

👇 How:

A. Real Traces:
	•	Export anonymized logs from your WMS support bot (e.g., Intercom, Zendesk, Dialogflow).
	•	Look for:
	•	Unresolved queries
	•	Long back-and-forths
	•	Incorrect resolutions

B. Synthetic Traces (if limited real data):
	•	Define 3 dimensions:
	•	Issue Type: Inbound, Inventory, Picking, Packing, Returns
	•	User Persona: Store Associate, Warehouse Manager, Client Ops, Brand CX
	•	Urgency: Low / High / SLA-breach
	•	Create 10–20 tuples across these dimensions.
	•	Write natural queries:
“I received more units than in the ASN. GRN is failing.”
“Serial code scan is not marking item as picked.”

🧠 Human review: Discard unrealistic ones and ensure they simulate actual frustrations.

✅ Step 2: Read and Open Code Traces

🎯 Goal:

Read each trace and write short descriptive notes for each failure.

👇 How:

Review each conversation and label what went wrong:

Trace	Observation
01	Bot misunderstood “HU not scanning” as a picking issue
02	Bot looped back with “Can you rephrase?” 3 times
03	Bot gave outdated SOP for ASN processing
04	Bot hallucinated a command that doesn’t exist in WMS UI

📌 Tips:
	•	Use plain language, don’t overthink.
	•	Look for user frustration, repetitive loops, hallucinations, incorrect escalation.

✅ Step 3: Cluster Notes into Failure Modes

🎯 Goal:

Group similar trace observations into meaningful failure categories.

👇 Common Failure Modes for WMS Chatbots:

Failure Mode	Description
❌ Misclassification	Treating one issue (e.g., HU error) as another (e.g., picking error)
🔁 Looping Response	Bot keeps asking to rephrase or gives same fallback
📉 Hallucinated Output	Mentions non-existent button, feature, or SOP
📚 Outdated Info	Refers to deprecated screens, APIs, or flows
🚫 No Escalation	Doesn’t trigger escalation even when SLA breach
❓ Overconfidence	Gives an answer even when it lacks information
⏱️ Delayed Resolution	Overly verbose or slow to get to the point

🔁 Refine categories: Merge or split based on your dataset — for example, separate “Outdated SOP” from “Hallucinated Button” if needed.

✅ Step 4: Re-Code Traces Using Failure Modes

🎯 Goal:

Apply your refined failure categories to all your traces, and track frequency.

Trace	Failure Mode
01	❌ Misclassification
02	🔁 Looping Response
03	📚 Outdated Info
04	📉 Hallucinated Output

📈 Once coded, analyze:
	•	Most frequent failure?
	•	Which failures have highest severity (e.g., customer escalation)?

✅ Automate Evals (After Manual Analysis)

Once you’ve defined failure modes, start automating app-specific evals:

🎯 Goal:

Score bot performance per failure mode.

👇 Choose One or Both:

1. Code-Based Evals
	•	For objective issues (e.g. logic errors, SOP mismatch)
	•	Examples:
	•	Regex check: did the bot use the current SOP version ID?
	•	JSON match: did escalation trigger when “SLA breach” = true?

2. LLM-as-Judge Evals
	•	For subjective or contextual fails (e.g., tone, hallucination)
	•	Examples:
	•	“Does the response mention a real WMS action?”
	•	“Was the issue correctly classified as a HU scan error?”

💡 Pro tip: Mix both for better eval coverage.

🔍 Metrics to Track
	•	Failure Rate per Mode
	•	TPR (True Positive Rate) – correctly flagged failures
	•	TNR (True Negative Rate) – correctly passed successes
	•	Escalation Latency
	•	Resolution Success Rate

