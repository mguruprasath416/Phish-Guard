#!/usr/bin/env python3
"""
Email Explanation Prompts
Prompt templates for email analysis explanations
"""

EMAIL_ANALYSIS_PROMPT = """
You are a cybersecurity expert specializing in phishing detection. Analyze the following email and provide a clear, actionable explanation.

Email Analysis:
{analysis}

Threat Intelligence:
{threat_intel}

Risk Score: {risk_score}

Provide your response in the following format:

**Summary:**
[2-3 sentence summary of the threat level and key concerns]

**Key Findings:**
- [Finding 1]
- [Finding 2]
- [Finding 3]

**Recommendations:**
- [Recommendation 1]
- [Recommendation 2]
- [Recommendation 3]

Be concise and specific. Focus on actionable advice for the user.
"""

THREAT_REPORT_PROMPT = """
Generate a detailed threat report based on the following scan result:

Scan Result:
{scan_result}

Threat Level: {threat_level}

Provide your response in the following format:

**Executive Summary:**
[High-level summary for executives]

**Detailed Analysis:**
[In-depth technical analysis]

**Attack Vector:**
[Classification of the attack type]

**Mitigation Steps:**
1. [High priority step]
2. [Medium priority step]
3. [Low priority step]

**Technical Details:**
[Technical information for security teams]

Be thorough and include specific indicators of compromise.
"""

URL_ANALYSIS_PROMPT = """
You are a cybersecurity expert specializing in URL analysis. Analyze the following URL and provide a clear explanation.

URL Analysis:
{analysis}

Threat Intelligence:
{threat_intel}

Risk Score: {risk_score}

Provide your response in the following format:

**Summary:**
[2-3 sentence summary]

**Key Findings:**
- [Finding 1]
- [Finding 2]

**Recommendations:**
- [Recommendation 1]
- [Recommendation 2]

Focus on URL-specific risks like domain reputation, SSL, and suspicious patterns.
"""

def get_email_explanation_prompt(analysis: dict, threat_intel: dict, risk_score: float) -> str:
    """Get formatted email explanation prompt"""
    return EMAIL_ANALYSIS_PROMPT.format(
        analysis=analysis,
        threat_intel=threat_intel,
        risk_score=risk_score
    )

def get_threat_report_prompt(scan_result: dict, threat_level: str) -> str:
    """Get formatted threat report prompt"""
    return THREAT_REPORT_PROMPT.format(
        scan_result=scan_result,
        threat_level=threat_level
    )

def get_url_analysis_prompt(analysis: dict, threat_intel: dict, risk_score: float) -> str:
    """Get formatted URL analysis prompt"""
    return URL_ANALYSIS_PROMPT.format(
        analysis=analysis,
        threat_intel=threat_intel,
        risk_score=risk_score
    )
