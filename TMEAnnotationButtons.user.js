
// ==UserScript==
// @name         TME Annotation Template Buttons
// @namespace    http://tampermonkey.net/
// @version      21.0
// @description  Adds template buttons in the Annotate & Reply section
// @author       christik@ with a lot of help from Quick Suite
// @match        https://paragon*.amazon.com/*
// @match        https://*.paragon*.amazon.com/*
// @match        https://paragon-eu.amazon.com/*
// @match        https://dirc5mvg14a3m.cloudfront.net/*
// @match        https://*.cloudfront.net/*
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function() {
    'use strict';

    console.log('=== Paragon Annotation Template Button v2.0 loaded ===');
    console.log('Current URL:', window.location.href);

    // Template definitions
    const templates = {
        acTemplate: `Batch ID:

Seller intent:

Seller provided identifiers or documents:

Skill:

Research done:

    Change Integration Management (CIM) announcement:
    Paragon workflow (PWF):
    Help page link:
    SOP link:
    Tool link:
    Ticket or SIM reference:

Question to advisor:

Case status:`,

        andonCord: `***TME Regular AC Annotation***

Associate question:

1. Resolution to the Associate question:

2. Case Status Recommendation: (PAA/PMA/Transfer/Resolve/Research needed):

3. Resources used: (CIM, PWF, SOP, help page, Sage, etc.):

4. Reached via Call: Y/N (if No, explain the reason. For example: visa Slack message):

5. Reminded Learner to address SP's other queries: Y/Not applicable (If Yes, summarize SP's queries; if no other queries, mark "Not Applicable"):

6. Skill:

Quality Reminders from your TME:
• Do NOT copy and paste Selling Partner's messages directly; instead, reframe their concerns in your own words to demonstrate understanding, especially during live interactions.
• Do NOT copy and paste TMEs' annotation in reply to Selling Partners.
• Do NOT leave unexplained silences during live conversations, use appropriate verbal acknowledgments to show active listening (e.g., "I understand," "I see," "Yes, I follow")
• Do provide educational resources (help pages, step-by-step guides) to help prevent similar issues and address Selling Partner questions about root causes
• Do focus on solving the case, and use any and all resources available to do so. When you have exhausted all available resources and don't know how to proceed, pull an Andon Cord for additional support.
• Ask for all necessary information, use probing questions to uncover any unstated aspects of the issue during the live channel to effectively troubleshoot the case.`,

        caseReview: `**TME Case Review Annotation***

Case Review Status:


Case Disposition: (PMA/PAA /Resolve/WIP/Pending Research)



	1. Was the correct outcome provided to the Selling Partner? ✔️/ ❌
	2.  Did the Associate do what the Selling Partner requested? (✔️/ ❌)
	3.  Seller Understandability checklist: Did the Associate demonstrate understanding of Selling Partner issue?✔️/ ❌

• The Associate should actively review the case holistically to understand and address all SP issues correctly. ✔️/ ❌
• The associate clearly summarized pending issues with specific references (e.g., ASIN/Order ID) in their own words,    providing a clear indication on the topics they will be addressing. ✔️/❌
• The associate did not request additional information already present on the case. ✔️/❌

  b. The Associate should provide accurate, customized responses that set the proper expectations. ✔️/ ❌
• The associate excluded internal jargon into their response. ✔️/❌
• The associate has provided educational next steps in writing, as well as an additional help page if applicable to prevent future issues. ✔️/❌
• The associate asked thorough questions to gather all necessary information for effective troubleshooting, eliminating the need for follow-up emails requesting additional details. ✔️/❌`,

        transfer: `TME Case Transfer Annotation

Case Review Status:

Case Disposition: Transfer/No transfer

Reason for Transfer:

Resource for Transfer:

Skill to be transferred to:

Queue to be transferred to:`
    };

    // Check if we're inside the iframe
    const isInIframe = window.self !== window.top;
    console.log('Running in iframe:', isInIframe);

    function createButton(id, text, template, backgroundColor, hoverColor) {
        const button = document.createElement('button');
        button.id = id;
        button.textContent = text;
        button.type = 'button';
        button.style.cssText = `
            padding: 8px 16px;
            margin-left: 4px;
            background-color: ${backgroundColor};
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 500;
            font-family: "Amazon Ember", Arial, sans-serif;
            height: 32px;
            display: inline-flex;
            align-items: center;
            vertical-align: middle;
        `;

        // Add hover effect
        button.addEventListener('mouseenter', () => {
            button.style.backgroundColor = hoverColor;
        });
        button.addEventListener('mouseleave', () => {
            button.style.backgroundColor = backgroundColor;
        });

        // Add click handler
        button.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log(`${text} button clicked`);

            const textarea = document.querySelector('kat-textarea[data-testid="kat-textarea-resolution"]');
            if (!textarea) {
                console.error('Textarea not found');
                return;
            }

            // Try to access the shadow root
            const shadowRoot = textarea.shadowRoot;
            if (shadowRoot) {
                const actualTextarea = shadowRoot.querySelector('textarea');
                if (actualTextarea) {
                    // Set the value
                    actualTextarea.value = template;

                    // Trigger multiple events
                    actualTextarea.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
                    actualTextarea.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
                    actualTextarea.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true, composed: true }));
                    actualTextarea.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, composed: true }));

                    // Also set on parent
                    textarea.value = template;
                    textarea.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
                    textarea.dispatchEvent(new Event('change', { bubbles: true, composed: true }));

                    // Focus the textarea
                    actualTextarea.focus();

                    console.log('Template inserted successfully');
                } else {
                    console.error('Could not find textarea inside shadow root');
                }
            } else {
                console.error('Could not access shadow root');
            }
        });

        return button;
    }

    function addTemplateButtons() {
        // Check if buttons already exist
        if (document.getElementById('annotation-template-btn')) {
            return true;
        }

        // Find the textarea
        const textarea = document.querySelector('kat-textarea[data-testid="kat-textarea-resolution"]');
        if (!textarea) {
            console.log('Template buttons: Textarea not found');
            return false;
        }

        console.log('Template buttons: Found textarea');

        // Find the button container
        let buttonContainer = null;

        // Look for the container with class that contains "action"
        const actionContainers = document.querySelectorAll('[class*="action"]');
        for (const container of actionContainers) {
            const dropdown = container.querySelector('kat-dropdown-button');
            const button = container.querySelector('kat-button');
            if (dropdown && button) {
                buttonContainer = container;
                console.log('Template buttons: Found button container via action class');
                break;
            }
        }

        // Fallback: traverse up from textarea
        if (!buttonContainer) {
            let currentElement = textarea;
            for (let i = 0; i < 15; i++) {
                currentElement = currentElement.parentElement;
                if (!currentElement) break;

                const allDivs = currentElement.querySelectorAll('div');
                for (const div of allDivs) {
                    const hasDropdown = div.querySelector(':scope > kat-dropdown-button');
                    const hasButton = div.querySelector(':scope > kat-button');
                    if (hasDropdown && hasButton) {
                        buttonContainer = div;
                        console.log('Template buttons: Found button container via traversal');
                        break;
                    }
                }
                if (buttonContainer) break;
            }
        }

        if (!buttonContainer) {
            console.log('Template buttons: Button container not found');
            return false;
        }

        console.log('Template buttons: All elements found, adding buttons');

        // Create and add all buttons
        const acTemplateBtn = createButton(
            'annotation-template-btn',
            'AC Template',
            templates.acTemplate,
            '#5c6f82',  // Original color
            '#6b7f94'   // Original hover color
        );

        const andonCordBtn = createButton(
            'andon-cord-btn',
            'Andon Cord',
            templates.andonCord,
            '#4a7c8f',  // Slightly different blue-teal
            '#5a8c9f'   // Hover color
        );

        const caseReviewBtn = createButton(
            'case-review-btn',
            'Case Review',
            templates.caseReview,
            '#6b8e7c',  // Green-teal
            '#7b9e8c'   // Hover color
        );

        const transferBtn = createButton(
            'transfer-btn',
            'Transfer',
            templates.transfer,
            '#8f7a6b',  // Brown-gray
            '#9f8a7b'   // Hover color
        );

        // Insert all buttons
        buttonContainer.appendChild(acTemplateBtn);
        buttonContainer.appendChild(andonCordBtn);
        buttonContainer.appendChild(caseReviewBtn);
        buttonContainer.appendChild(transferBtn);

        console.log('=== All template buttons added successfully ===');

        return true;
    }

    // Use MutationObserver to watch for changes
    const observer = new MutationObserver((mutations) => {
        if (!document.getElementById('annotation-template-btn')) {
            addTemplateButtons();
        }
    });

    // Start observing
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    // Initial attempts with delays
    setTimeout(() => addTemplateButtons(), 1000);
    setTimeout(() => addTemplateButtons(), 2000);
    setTimeout(() => addTemplateButtons(), 3000);
    setTimeout(() => addTemplateButtons(), 5000);
    setTimeout(() => addTemplateButtons(), 7000);

    console.log('Template buttons: Initialization complete');
})();

