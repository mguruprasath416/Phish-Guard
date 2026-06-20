#!/usr/bin/env python3
"""
Mistral Provider
Handles communication with Mistral AI API
"""

import requests
import os
from typing import Dict, Optional

class MistralProvider:
    """Mistral AI API provider"""
    
    def __init__(self, api_key: Optional[str] = None, model: Optional[str] = None):
        self.api_key = api_key or os.getenv('MISTRAL_API_KEY')
        self.model = model or os.getenv('MISTRAL_MODEL', 'mistral-large')
        self.base_url = 'https://api.mistral.ai/v1'
        self.headers = {
            'Authorization': f'Bearer {self.api_key}',
            'Content-Type': 'application/json'
        }
    
    def generate_completion(self, prompt: str, max_tokens: int = 500, temperature: float = 0.7) -> str:
        """
        Generate text completion using Mistral
        
        Args:
            prompt: Input prompt
            max_tokens: Maximum tokens to generate
            temperature: Sampling temperature
            
        Returns:
            Generated text
        """
        if not self.api_key:
            return self._mock_completion(prompt)
        
        try:
            response = requests.post(
                f'{self.base_url}/chat/completions',
                headers=self.headers,
                json={
                    'model': self.model,
                    'messages': [
                        {"role": "system", "content": "You are a cybersecurity expert specializing in phishing detection."},
                        {"role": "user", "content": prompt}
                    ],
                    'max_tokens': max_tokens,
                    'temperature': temperature
                },
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                return data['choices'][0]['message']['content']
            else:
                return self._mock_completion(prompt)
                
        except Exception as e:
            print(f"Mistral API error: {e}")
            return self._mock_completion(prompt)
    
    def generate_explanation(self, analysis: Dict, threat_intel: Dict, risk_score: float) -> Dict:
        """
        Generate explanation for scan results
        
        Args:
            analysis: Analysis results
            threat_intel: Threat intelligence data
            risk_score: Calculated risk score
            
        Returns:
            Explanation dictionary
        """
        prompt = f"""
        Analyze this threat intelligence and generate a clear explanation:
        
        Analysis: {analysis}
        Threat Intelligence: {threat_intel}
        Risk Score: {risk_score}
        
        Provide:
        1. A concise summary (2-3 sentences)
        2. Key findings (bullet points)
        3. Actionable recommendations (bullet points)
        """
        
        response = self.generate_completion(prompt, max_tokens=800)
        
        return self._parse_explanation(response)
    
    def generate_report(self, scan_result: Dict, threat_level: str) -> Dict:
        """
        Generate detailed threat report
        
        Args:
            scan_result: Scan result data
            threat_level: Threat level
            
        Returns:
            Report dictionary
        """
        prompt = f"""
        Generate a detailed threat report based on this scan result:
        
        Scan Result: {scan_result}
        Threat Level: {threat_level}
        
        Provide:
        1. Executive summary
        2. Detailed analysis
        3. Attack vector classification
        4. Mitigation steps (with priority levels)
        5. Technical details
        """
        
        response = self.generate_completion(prompt, max_tokens=1200)
        
        return self._parse_report(response)
    
    def _parse_explanation(self, response: str) -> Dict:
        """Parse explanation response into structured format"""
        lines = response.split('\n')
        
        summary = ""
        key_findings = []
        recommendations = []
        
        current_section = None
        
        for line in lines:
            line = line.strip()
            if not line:
                continue
            
            if 'summary' in line.lower():
                current_section = 'summary'
            elif 'findings' in line.lower():
                current_section = 'findings'
            elif 'recommendations' in line.lower():
                current_section = 'recommendations'
            elif line.startswith('-') or line.startswith('*'):
                if current_section == 'findings':
                    key_findings.append(line.lstrip('-*').strip())
                elif current_section == 'recommendations':
                    recommendations.append(line.lstrip('-*').strip())
            elif current_section == 'summary':
                summary += line + " "
        
        return {
            'summary': summary.strip(),
            'keyFindings': key_findings,
            'recommendations': recommendations,
            'method': 'mistral',
            'confidence': 80
        }
    
    def _parse_report(self, response: str) -> Dict:
        """Parse report response into structured format"""
        lines = response.split('\n')
        
        executive_summary = ""
        detailed_analysis = ""
        attack_vector = ""
        mitigation_steps = []
        technical_details = ""
        
        current_section = None
        
        for line in lines:
            line = line.strip()
            if not line:
                continue
            
            if 'executive summary' in line.lower():
                current_section = 'executive_summary'
            elif 'detailed analysis' in line.lower():
                current_section = 'detailed_analysis'
            elif 'attack vector' in line.lower():
                current_section = 'attack_vector'
            elif 'mitigation' in line.lower():
                current_section = 'mitigation'
            elif 'technical' in line.lower():
                current_section = 'technical'
            elif line.startswith('-') or line.startswith('*'):
                if current_section == 'mitigation':
                    mitigation_steps.append(line.lstrip('-*').strip())
            else:
                if current_section == 'executive_summary':
                    executive_summary += line + " "
                elif current_section == 'detailed_analysis':
                    detailed_analysis += line + " "
                elif current_section == 'attack_vector':
                    attack_vector += line + " "
                elif current_section == 'technical':
                    technical_details += line + " "
        
        return {
            'executiveSummary': executive_summary.strip(),
            'detailedAnalysis': detailed_analysis.strip(),
            'attackVector': attack_vector.strip(),
            'mitigationSteps': mitigation_steps,
            'technicalDetails': technical_details.strip(),
            'method': 'mistral'
        }
    
    def _mock_completion(self, prompt: str) -> str:
        """Return mock completion when API is unavailable"""
        return """
        Based on the analysis, this shows several suspicious characteristics that warrant caution.
        
        Key findings:
        - Suspicious patterns detected in content
        - Multiple risk indicators present
        - Threat intelligence suggests potential risk
        
        Recommendations:
        - Verify the source through a separate channel
        - Do not click on any links or download attachments
        - Report to your security team if this was unexpected
        """
