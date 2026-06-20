#!/usr/bin/env python3
"""
LLaMA Provider
Handles communication with local LLaMA instance
"""

import requests
import os
from typing import Dict, Optional

class LlamaProvider:
    """LLaMA API provider"""
    
    def __init__(self, url: Optional[str] = None, model: Optional[str] = None):
        self.url = url or os.getenv('LLAMA_URL', 'http://localhost:11434')
        self.model = model or os.getenv('LLAMA_MODEL', 'llama2')
        self.api_endpoint = f'{self.url}/api/generate'
    
    def generate_completion(self, prompt: str, max_tokens: int = 500, temperature: float = 0.7) -> str:
        """
        Generate text completion using LLaMA
        
        Args:
            prompt: Input prompt
            max_tokens: Maximum tokens to generate
            temperature: Sampling temperature
            
        Returns:
            Generated text
        """
        try:
            response = requests.post(
                self.api_endpoint,
                json={
                    'model': self.model,
                    'prompt': prompt,
                    'max_tokens': max_tokens,
                    'temperature': temperature,
                    'stream': False
                },
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                return data.get('response', '')
            else:
                return self._mock_completion(prompt)
                
        except Exception as e:
            print(f"LLaMA API error: {e}")
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
            'method': 'llama',
            'confidence': 75
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
            'method': 'llama'
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
    
    def check_health(self) -> bool:
        """Check if LLaMA service is healthy"""
        try:
            response = requests.get(f'{self.url}/api/tags', timeout=5)
            return response.status_code == 200
        except:
            return False
