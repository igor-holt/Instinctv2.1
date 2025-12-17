import random
from enum import Enum
from dataclasses import dataclass

# --- Widget for Research Paper [2]: Beyond Retry ---
# DOI: 10.5281/zenodo.17784144

class FailureMode(Enum):
    TRANSIENT = 1   # Network blip, timeout
    STRUCTURAL = 2  # API changed, disk full
    SEMANTIC = 3    # The request itself is impossible (Hallucination)

class Strategy(Enum):
    RETRY_LINEAR = "Retry (Linear Backoff)"
    RETRY_EXPONENTIAL = "Retry (Exponential Backoff)"
    STRATEGY_SWITCH = "Switch Implementation"
    FAIL_FAST = "Abort (Fail Fast)"

@dataclass
class ErrorContext:
    error_msg: str
    attempt_count: int
    energy_cost: float

class MetacognitiveAgent:
    """
    Implements the Metacognitive Dynamics Framework.
    
    Instead of a simple try/catch loop, this agent classifies the *dynamics*
    of the failure to select an optimal recovery strategy.
    """
    
    def __init__(self):
        self.history = []

    def classify_failure(self, ctx: ErrorContext) -> FailureMode:
        """
        The 'Metacognitive' Step.
        Analyzes error signature to determine causality.
        (Simplified logic for widget demonstration).
        """
        if "timeout" in ctx.error_msg or "503" in ctx.error_msg:
            return FailureMode.TRANSIENT
        elif "FileNotFound" in ctx.error_msg or "404" in ctx.error_msg:
            return FailureMode.STRUCTURAL
        elif "LogicError" in ctx.error_msg or "Assertion" in ctx.error_msg:
            return FailureMode.SEMANTIC
        else:
            # Fallback: If we've failed 3 times, assume it's Structural, not Transient
            if ctx.attempt_count > 2:
                return FailureMode.STRUCTURAL
            return FailureMode.TRANSIENT

    def decide_strategy(self, mode: FailureMode, ctx: ErrorContext) -> Strategy:
        """
        Maps Failure Mode -> Recovery Strategy
        """
        if mode == FailureMode.TRANSIENT:
            if ctx.attempt_count < 3:
                return Strategy.RETRY_EXPONENTIAL
            else:
                return Strategy.FAIL_FAST # Don't retry forever
                
        elif mode == FailureMode.STRUCTURAL:
            # Paper Innovation: Don't retry structural errors. Switch approach.
            return Strategy.STRATEGY_SWITCH
            
        elif mode == FailureMode.SEMANTIC:
            # Paper Innovation: Fail fast to save energy (Landauer Context)
            return Strategy.FAIL_FAST
            
        return Strategy.FAIL_FAST

    def execute_task(self, task_name: str, simulate_error: str = None):
        print(f"\n--- Executing Task: {task_name} ---")
        attempts = 0
        
        while True:
            attempts += 1
            print(f"Attempt {attempts}...", end=" ")
            
            # Simulate Success/Failure
            if not simulate_error:
                print("Success!")
                break
                
            print(f"Failed: {simulate_error}")
            
            # 1. Metacognitive Analysis
            ctx = ErrorContext(simulate_error, attempts, energy_cost=12.5)
            mode = self.classify_failure(ctx)
            
            # 2. Strategic Decision
            strategy = self.decide_strategy(mode, ctx)
            print(f"   >>> Metacognition: Mode=[{mode.name}] -> Strategy=[{strategy.value}]")
            
            # 3. Execution
            if strategy == Strategy.FAIL_FAST:
                print("   >>> Terminating Task to conserve energy.")
                break
            elif strategy == Strategy.STRATEGY_SWITCH:
                print("   >>> Switching to fallback implementation...")
                simulate_error = None # Assume fallback works
            elif "RETRY" in strategy.name:
                time.sleep(0.5) # Simulate backoff

# --- Verification Run ---
if __name__ == "__main__":
    agent = MetacognitiveAgent()
    
    # Scenario 1: Transient Error (Network)
    agent.execute_task("Fetch_Data", simulate_error="Connection timeout 503")
    
    # Scenario 2: Structural Error (Missing File) - The "Beyond Retry" Logic
    # Standard agents would retry 3 times. This agent switches strategy immediately.
    agent.execute_task("Load_Config", simulate_error="FileNotFoundException")

