#!/usr/bin/env python3
"""
Explanation Chain
Chain for generating explanations from analysis results
"""

from typing import Dict, Optional, Any
from ..providers.openai import OpenAIProvider
from ..providers.llama import LlamaProvider
from ..providers.mistral import MistralProvider
from ..prompts.email_explanation import (
    get_email_explanation_prompt,
    get_threat_report_prompt,
    get_url_analysis_prompt
)

class ExplanationChain:
    """Chain for generating explanations"""
    
    def __init__(self, provider: str = 'openai'):
        """
        Initialize explanation chain
        
        Args:
            provider: LLM provider to use ('openai', 'llama', or 'mistral')
        """
        self.provider = provider
        
        if provider == 'openai':
            self.llm = OpenAIProvider()
        elif provider == 'llama':
            self.llm = LlamaProvider()
        elif provider == 'mistral':
            self.llm = MistralProvider()
        else:
            raise ValueError(f"Unknown provider: {provider}")
    
    def generate_email_explanation(self, analysis: Dict, threat_intel: Dict, risk_score: float) -> Dict:
        """
        Generate explanation for email analysis
        
        Args:
            analysis: Email analysis results
            threat_intel: Threat intelligence data
            risk_score: Calculated risk score
            
        Returns:
            Explanation dictionary
        """
        prompt = get_email_explanation_prompt(analysis, threat_intel, risk_score)
        response = self.llm.generate_completion(prompt, max_tokens=800)
        
        return self._parse_explanation(response)
    
    def generate_url_explanation(self, analysis: Dict, threat_intel: Dict, risk_score: float) -> Dict:
        """
        Generate explanation for URL analysis
        
        Args:
            analysis: URL analysis results
            threat_intel: Threat intelligence data
            risk_score: Calculated risk score
            
        Returns:
            Explanation dictionary
        """
        prompt = get_url_analysis_prompt(analysis, threat_intel, risk_score)
        response = self.llm.generate_completion(prompt, max_tokens=600)
        
        return self._parse_explanation(response)
    
    def generate_threat_report(self, scan_result: Dict, threat_level: str) -> Dict:
        """
        Generate detailed threat report
        
        Args:
            scan_result: Scan result data
            threat_level: Threat level
            
        Returns:
            Report dictionary
        """
        prompt = get_threat_report_prompt(scan_result, threat_level)
        response = self.llm.generate_completion(prompt, max_tokens=1200)
        
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
            
            if line.startswith('**Summary:**'):
                current_section = 'summary'
            elif line.startswith('**Key Findings:**'):
                current_section = 'findings'
            elif line.startswith('**Recommendations:**'):
                current_section = 'recommendations'
            elif line.startswith('-'):
                if current_section == 'findings':
                    key_findings.append(line.lstrip('-').strip())
                elif current_section == 'recommendations':
                    recommendations.append(line.lstrip('-').strip())
            elif current_section == 'summary':
                summary += line + " "
        
        return {
            'summary': summary.strip(),
            'keyFindings': key_findings,
            'recommendations': recommendations,
            'method': self.provider,
            'confidence': 85 if self.provider == 'openai' else 75
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
            
            if line.startswith('**Executive Summary:**'):
                current_section = 'executive_summary'
            elif line.startswith('**Detailed Analysis:**'):
                current_section = 'detailed_analysis'
            elif line.startswith('**Attack Vector:**'):
                current_section = 'attack_vector'
            elif line.startswith('**Mitigation Steps:**'):
                current_section = 'mitigation'
            elif line.startswith('**Technical Details:**'):
                current_section = 'technical'
            elif line.startswith(('1.', '2.', '3.')):
                if current_section == 'mitigation':
                    mitigation_steps.append(line.split('.', 1)[1].strip())
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
            'method': self.provider
        }
