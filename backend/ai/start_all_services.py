#!/usr/bin/env python3
"""
AI Services Orchestrator
Starts all AI microservices in a single process for development
"""

import subprocess
import sys
import os
import signal
import time
from typing import List, Dict

# Service configurations
SERVICES = [
    {
        'name': 'email-service',
        'path': 'email-service',
        'port': 8001,
        'main': 'main.py'
    },
    {
        'name': 'url-service',
        'path': 'url-service',
        'port': 8002,
        'main': 'main.py'
    },
    {
        'name': 'threat-intel',
        'path': 'threat-intel',
        'port': 8003,
        'main': 'main.py'
    },
    {
        'name': 'llm-service',
        'path': 'llm-service',
        'port': 8004,
        'main': 'main.py'
    },
    {
        'name': 'risk-engine',
        'path': 'risk-engine',
        'port': 8005,
        'main': 'main.py'
    }
]

class ServiceManager:
    """Manages multiple AI services"""
    
    def __init__(self):
        self.processes: Dict[str, subprocess.Popen] = {}
        self.base_dir = os.path.dirname(os.path.abspath(__file__))
        self.running = False
    
    def start_service(self, service: Dict) -> subprocess.Popen:
        """
        Start a single service
        
        Args:
            service: Service configuration dictionary
            
        Returns:
            Subprocess handle
        """
        service_dir = os.path.join(self.base_dir, service['path'])
        main_file = os.path.join(service_dir, service['main'])
        
        if not os.path.exists(main_file):
            print(f"⚠️  Warning: {main_file} not found, skipping {service['name']}")
            return None
        
        print(f"🚀 Starting {service['name']} on port {service['port']}...")
        
        process = subprocess.Popen(
            [sys.executable, main_file],
            cwd=service_dir,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )
        
        return process
    
    def start_all(self):
        """Start all services"""
        print("=" * 60)
        print("🔧 Starting All AI Services")
        print("=" * 60)
        
        for service in SERVICES:
            process = self.start_service(service)
            if process:
                self.processes[service['name']] = process
                time.sleep(2)  # Give each service time to start
        
        self.running = True
        print("\n✅ All services started successfully!")
        print(f"   Running services: {list(self.processes.keys())}")
        print("\nPress Ctrl+C to stop all services\n")
        
        # Monitor services
        self.monitor_services()
    
    def stop_all(self):
        """Stop all services"""
        print("\n" + "=" * 60)
        print("🛑 Stopping All Services")
        print("=" * 60)
        
        for name, process in self.processes.items():
            print(f"Stopping {name}...")
            process.terminate()
            try:
                process.wait(timeout=5)
                print(f"✓ {name} stopped")
            except subprocess.TimeoutExpired:
                print(f"⚠️  {name} did not stop gracefully, killing...")
                process.kill()
                process.wait()
                print(f"✓ {name} killed")
        
        self.processes.clear()
        self.running = False
        print("\n✅ All services stopped")
    
    def monitor_services(self):
        """Monitor running services"""
        try:
            while self.running:
                # Check if any process has died
                for name, process in list(self.processes.items()):
                    if process.poll() is not None:
                        print(f"⚠️  {name} has stopped unexpectedly!")
                        print(f"   Exit code: {process.returncode}")
                        del self.processes[name]
                
                # Print status
                if self.processes:
                    print(f"\r📊 Services running: {len(self.processes)}/5", end='', flush=True)
                
                time.sleep(5)
        
        except KeyboardInterrupt:
            self.stop_all()
    
    def get_service_status(self) -> Dict[str, bool]:
        """
        Get status of all services
        
        Returns:
            Dictionary mapping service names to running status
        """
        status = {}
        for name, process in self.processes.items():
            status[name] = process.poll() is None
        return status


def main():
    """Main entry point"""
    manager = ServiceManager()
    
    # Setup signal handlers for graceful shutdown
    def signal_handler(signum, frame):
        print(f"\nReceived signal {signum}")
        manager.stop_all()
        sys.exit(0)
    
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)
    
    try:
        manager.start_all()
    except Exception as e:
        print(f"\n❌ Error starting services: {e}")
        manager.stop_all()
        sys.exit(1)


if __name__ == '__main__':
    main()
